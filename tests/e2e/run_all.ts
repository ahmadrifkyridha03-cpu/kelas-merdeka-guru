/**
 * Master Test Runner for KelasMerdeka E2E Testing Track
 * Executes Tier 1, Tier 2, Tier 3, and Tier 4 test suites in sequence
 * Formats results into a clean executive summary table.
 */

import { runAllSuites, clearSuites } from "./harness.ts";

async function main() {
  console.log("==================================================================");
  console.log("      KELASMERDEKA INDEPENDENT 4-TIER E2E TEST RUNNER             ");
  console.log("==================================================================");
  console.log("Timestamp: " + new Date().toISOString());
  console.log("Runtime:   Node.js " + process.version);
  console.log("Framework: Universal E2E Test Harness (Vitest & Node Compatible)");
  console.log("------------------------------------------------------------------");

  // Load all test tiers
  clearSuites();
  await import("../store.test.ts");
  await import("../geminiActions.test.ts");
  await import("../challenger_stress.test.ts");
  await import("../m1_empirical_stress.ts");
  await import("../dapodik_kktp.test.ts");
  await import("../remedial_curriculum.test.ts");
  await import("../athirah_format.test.ts");
  await import("./tier1_features.test.ts");
  await import("./tier2_boundaries.test.ts");
  await import("./tier3_integration.test.ts");
  await import("./tier4_realworld.test.ts");

  const results = await runAllSuites();

  console.log("\n==================================================================");
  console.log("                    E2E TEST EXECUTION SUMMARY                    ");
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
    console.error(`\n\x1b[31m✖ TEST RUN FAILED with ${results.totalFailed} failure(s).\x1b[0m\n`);
    process.exit(1);
  } else {
    console.log(`\n\x1b[32m✔ ALL ${results.totalTests} TESTS PASSED SUCCESSFULLY!\x1b[0m\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error("Fatal error during test run:", err);
  process.exit(1);
});
