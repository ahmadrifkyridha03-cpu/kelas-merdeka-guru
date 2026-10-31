import { runAllSuites, clearSuites } from "./e2e/harness.ts";

async function main() {
  console.log("==================================================================");
  console.log("      KELASMERDEKA ADVERSARIAL EMPIRICAL STRESS RUNNER (M1)       ");
  console.log("==================================================================");
  console.log("Timestamp: " + new Date().toISOString());
  console.log("Runtime:   Node.js " + process.version);
  console.log("Framework: Universal E2E Test Harness (Adversarial Challenger)");
  console.log("------------------------------------------------------------------");

  clearSuites();
  await import("./m1_empirical_stress.ts");

  const results = await runAllSuites();

  console.log("\n==================================================================");
  console.log("                ADVERSARIAL STRESS RESULTS SUMMARY                ");
  console.log("==================================================================");
  console.log(`Total Suites:  ${results.totalSuites}`);
  console.log(`Total Tests:   ${results.totalTests}`);
  console.log(`Passed Tests:  \x1b[32m${results.totalPassed}\x1b[0m`);
  console.log(`Failed Tests:  ${results.totalFailed > 0 ? `\x1b[31m${results.totalFailed}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);
  console.log(`Duration:      ${results.durationMs}ms`);
  console.log("------------------------------------------------------------------");

  console.log("\nSuite Breakdown:");
  for (const s of results.suiteSummaries) {
    const statusIcon = s.failed === 0 ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
    const suiteNamePad = s.suiteName.padEnd(50, " ");
    console.log(`[${statusIcon}] ${suiteNamePad} (${s.passed}/${s.total} passed, ${s.durationMs}ms)`);
  }

  console.log("==================================================================");

  if (results.totalFailed > 0) {
    console.error(`\n\x1b[31m✖ STRESS RUN FAILED with ${results.totalFailed} failure(s).\x1b[0m\n`);
    process.exit(1);
  } else {
    console.log(`\n\x1b[32m✔ ALL ${results.totalTests} ADVERSARIAL STRESS TESTS PASSED EMPIRICALLY!\x1b[0m\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal error during stress test execution:", err);
  process.exit(1);
});
