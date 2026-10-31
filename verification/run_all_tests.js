/**
 * run_all_tests.js
 * Master Empirical Verification Harness for Challenger 2
 * Executes all 4 adversarial stress suites:
 * 1. Offline Sync Collisions & Conflict Resolution
 * 2. Security Boundary Penetration & RBAC Rules
 * 3. Multi-Agent Failure Recovery & Circuit Breakers
 * 4. Dapodik Ingestion & Data Integrity
 */

const { execSync } = require('child_process');
const path = require('path');

const suites = [
  "test_offline_sync_collisions.js",
  "test_security_rules_penetration.js",
  "test_multi_agent_resilience.js",
  "test_dapodik_robustness.js"
];

console.log("================================================================================");
console.log("STARTING MASTER EMPIRICAL CHALLENGE SUITE EXECUTION");
console.log("================================================================================\n");

let totalSuites = suites.length;
let passedSuites = 0;

suites.forEach((suite, idx) => {
  const filePath = path.join(__dirname, suite);
  console.log(`\n>>>>>>>>>> RUNNING SUITE ${idx + 1}/${totalSuites}: ${suite} <<<<<<<<<<`);
  try {
    const output = execSync(`node "${filePath}"`, { encoding: 'utf8' });
    console.log(output);
  } catch (err) {
    console.error(`Error executing ${suite}:`, err.message);
  }
});

console.log("\n================================================================================");
console.log("ALL 4 EMPIRICAL VERIFICATION SUITES COMPLETED.");
console.log("================================================================================");
