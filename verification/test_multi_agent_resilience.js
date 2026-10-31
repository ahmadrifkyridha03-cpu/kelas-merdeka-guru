/**
 * test_multi_agent_resilience.js
 * Empirical Verification of Multi-Agent Self-Healing Loop & Circuit Breaker Logic
 * Based on SKILL_SPECIFICATIONS.md Section 3.2 (lines 3251 - 3450) and MULTI_AGENT_SPEC.md Section 3.3
 */

console.log("================================================================================");
console.log("TEST SUITE 3: EMPIRICAL MULTI-AGENT FAILURE RECOVERY & CIRCUIT BREAKER STRESS");
console.log("================================================================================\n");

const results = [];

// Exact replication of the retry logic from CustomSkillRunner (SKILL_SPECIFICATIONS.md lines 3340-3428)
class MockSkillRunner {
  constructor(geminiModelMock) {
    this.aiModel = geminiModelMock;
    this.promptHistory = [];
    this.retryDelays = [];
  }

  async executeSkill(skillName, inputPayload) {
    const startTime = Date.now();
    let retriesCount = 0;
    const maxRetries = 2;
    let currentPrompt = JSON.stringify(inputPayload, null, 2);
    let lastErrorDetails = '';

    while (retriesCount <= maxRetries) {
      this.promptHistory.push({ attempt: retriesCount + 1, prompt: currentPrompt, timestamp: Date.now() });
      try {
        const response = await this.aiModel.generateContent(currentPrompt, retriesCount);
        const rawText = response.text;
        if (!rawText) {
          throw new Error("Model returned empty response text.");
        }

        // Exact line 3372 from SKILL_SPECIFICATIONS.md:
        const parsedOutput = JSON.parse(rawText);

        // Schema validation mock (Assume passes if valid JSON)
        return {
          success: true,
          data: parsedOutput,
          retriesCount
        };

      } catch (err) {
        // Exact line 3414-3417 from SKILL_SPECIFICATIONS.md:
        lastErrorDetails = err.message || String(err);
        retriesCount++;
        // NOTE: No sleep, no prompt update for JSON.parse or network errors!
      }
    }

    return {
      success: false,
      retriesCount,
      errorCode: 'ERR_2001_GENERATION_FAILED_AFTER_RETRIES',
      errorMessage: `Gagal menghasilkan dokumen yang valid setelah ${maxRetries} perbaikan mandiri. Rincian: ${lastErrorDetails}`
    };
  }
}

// ------------------------------------------------------------------------------
// TEST 3.1: Malformed / Truncated JSON SyntaxError Behavior in Self-Correction Loop
// ------------------------------------------------------------------------------
async function testMalformedJsonSelfCorrectionFailure() {
  console.log("--- TEST 3.1: Malformed / Truncated JSON Self-Correction Flaw ---");

  // Mock Gemini returning truncated JSON on attempt 1, and since prompt is not fixed, returns truncated again
  const mockGemini = {
    generateContent: async (prompt, attempt) => {
      // Simulating truncated output due to maxOutputTokens cutoff
      return {
        text: '{"modul_ajar": {"tujuan": "Menganalisis konsep trigonometri", "pertemuan": [{"nomor": 1, "kegiatan": "Pendahuluan'
      };
    }
  };

  const runner = new MockSkillRunner(mockGemini);
  const input = { subject: "Matematika", grade: 10 };
  const result = await runner.executeSkill("lesson-plan-generator", input);

  console.log(`Execution Success: ${result.success}`);
  console.log(`Retries Exhausted: ${result.retriesCount}`);
  console.log(`Prompt History count: ${runner.promptHistory.length}`);
  
  // Verify if prompt was adjusted with self-healing feedback
  const attempt1Prompt = runner.promptHistory[0].prompt;
  const attempt2Prompt = runner.promptHistory[1].prompt;
  const promptWasModified = (attempt1Prompt !== attempt2Prompt);

  console.log(`Was repair feedback injected into attempt 2 prompt? ${promptWasModified}`);
  console.log(`Attempt 1 Prompt:\n${attempt1Prompt}`);
  console.log(`Attempt 2 Prompt:\n${attempt2Prompt}`);

  if (!promptWasModified && !result.success) {
    console.log("🚨 BUG CONFIRMED: Self-healing loop fails on SyntaxError!");
    console.log("   When JSON.parse throws, it jumps directly to catch block. Line 3381 (repair prompt injection) is bypassed entirely.");
    console.log("   The runner retries with the IDENTICAL prompt without telling the model about the truncation or syntax error!");
    results.push({
      test: "Malformed JSON SyntaxError Repair Bypass",
      status: "FAIL",
      bug: "When JSON.parse fails due to truncated/malformed LLM output, the catch block does not update currentPrompt, causing identical re-prompts with zero error diagnostics."
    });
  } else {
    results.push({ test: "Malformed JSON SyntaxError Repair Bypass", status: "PASS" });
  }
}

// ------------------------------------------------------------------------------
// TEST 3.2: Rate Limit (HTTP 429) Zero-Backoff Rapid Fire
// ------------------------------------------------------------------------------
async function testRateLimitZeroBackoff() {
  console.log("\n--- TEST 3.2: HTTP 429 Rate Limit Zero-Backoff Stress ---");

  const callTimestamps = [];
  const mockRateLimitedGemini = {
    generateContent: async (prompt, attempt) => {
      callTimestamps.push(Date.now());
      const err = new Error("429 ResourceExhausted: Quota exceeded for quota metric 'GenerateContentRequests'");
      err.status = 429;
      throw err;
    }
  };

  const runner = new MockSkillRunner(mockRateLimitedGemini);
  const startTime = Date.now();
  const result = await runner.executeSkill("grade-analytics", { orgId: "school_1" });
  const totalDurationMs = Date.now() - startTime;

  console.log(`Total duration for 3 failed calls (1 initial + 2 retries): ${totalDurationMs} ms`);
  for (let i = 1; i < callTimestamps.length; i++) {
    const delay = callTimestamps[i] - callTimestamps[i-1];
    console.log(`Delay between attempt ${i} and attempt ${i+1}: ${delay} ms`);
  }

  // If total duration is less than 50ms, there is zero backoff
  if (totalDurationMs < 50) {
    console.log("🚨 BUG CONFIRMED: Zero-Backoff Quota Storm!");
    console.log("   SkillRunner catches HTTP 429 and immediately fires the next retry with 0ms delay, violently spamming the rate-limited API.");
    results.push({
      test: "HTTP 429 Zero-Backoff Rate-Limit Storm",
      status: "FAIL",
      bug: "SkillRunner catches rate-limit errors without exponential backoff or jitter, exhausting retries in < 10ms and worsening quota exhaustion."
    });
  } else {
    results.push({ test: "HTTP 429 Zero-Backoff Rate-Limit Storm", status: "PASS" });
  }
}

// ------------------------------------------------------------------------------
// TEST 3.3: Absence of Circuit Breaker Leading to Cascading Timeouts
// ------------------------------------------------------------------------------
async function testAbsenceOfCircuitBreaker() {
  console.log("\n--- TEST 3.3: Absence of Circuit Breaker in Orchestration Architecture ---");

  // In MULTI_AGENT_SPEC.md and SKILL_SPECIFICATIONS.md:
  // Check if any CircuitBreaker state machine (OPEN / HALF_OPEN / CLOSED) is implemented or specified.
  const fs = require('fs');
  const path = require('path');
  const multiAgentSpec = fs.readFileSync(path.resolve(__dirname, '../MULTI_AGENT_SPEC.md'), 'utf8');
  const skillSpec = fs.readFileSync(path.resolve(__dirname, '../SKILL_SPECIFICATIONS.md'), 'utf8');

  const hasCircuitBreaker = multiAgentSpec.includes("CircuitBreaker") || 
                           skillSpec.includes("CircuitBreaker") ||
                           multiAgentSpec.includes("circuit_breaker");

  console.log(`Is Circuit Breaker pattern implemented in specifications? ${hasCircuitBreaker}`);

  if (!hasCircuitBreaker) {
    console.log("🚨 ARCHITECTURAL DEFECT CONFIRMED: Missing Circuit Breaker!");
    console.log("   If Gemini API has an outage (503 Service Unavailable), every teacher request continues to execute 3 attempts of 30-40s each, saturating Firebase Cloud Function concurrency and crashing serverless containers.");
    results.push({
      test: "Missing Circuit Breaker Pattern",
      status: "FAIL",
      bug: "No Circuit Breaker pattern is defined in MULTI_AGENT_SPEC.md or SKILL_SPECIFICATIONS.md, risking cascading failures and serverless thread exhaustion during Gemini API outages."
    });
  } else {
    results.push({ test: "Missing Circuit Breaker Pattern", status: "PASS" });
  }
}

async function runSuite3() {
  await testMalformedJsonSelfCorrectionFailure();
  await testRateLimitZeroBackoff();
  await testAbsenceOfCircuitBreaker();

  console.log("\n================================================================================");
  console.log("TEST SUITE 3 SUMMARY:");
  console.table(results);
}

runSuite3();
