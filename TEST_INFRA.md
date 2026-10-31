# TEST INFRASTRUCTURE SPECIFICATION & EXECUTION GUIDE
**KelasMerdeka Independent E2E Testing Track**  
**Document Version**: 1.0.0  
**Classification**: Test Engineering Blueprint, Infrastructure Architecture & Verification Manual  
**Author**: `teamwork_test_writer`  

---

## 1. Executive Summary & Architecture

The **KelasMerdeka Independent E2E Testing Framework** is an opaque-box, requirement-driven automated verification engine engineered to guarantee zero-defect compliance with:
1. **Permendikbudristek No. 12 Tahun 2024 & Keputusan BSKAP No. 032/H/KR/2024** (Kurikulum Merdeka).
2. **Panduan Pembelajaran dan Asesmen (PPA) 2024** (KKTP, Remedial, and Pengayaan).
3. **Standar Mutu Kurikulum Sekolah Islam Athirah** (Modul Ajar 6-Komponen, Matriks Penguatan Aktivitas MH/MA/MR 1-3, Prinsip Pedagogi Merdeka [Biru]/[Hijau]/[Orange], dan Dual-Version LKPD).
4. **Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27 Tahun 2022)** (Consent and De-identification).

### 1.1. 4-Tier Test Methodology

The test architecture is structured across four progressive levels of verification:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        4-TIER TEST ARCHITECTURE                        │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 4: REAL-WORLD APPLICATION SCENARIOS                               │
│ - Full Semester Cycle: SMA Kelas X Fase E Informatika Athirah Makassar │
│ - Complete Remedial, Bonus Audit, & Parent e-Rapor Delivery Workflow   │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 3: CROSS-FEATURE MULTI-MODULE INTEGRATION                         │
│ - Pipeline 1: Roster -> TP -> Grades -> Remedial -> Bonus -> e-Rapor   │
│ - Pipeline 2: Modul Ajar -> 3M Matrix -> Lampiran 8-Col -> Dual LKPD   │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 2: BOUNDARY & CORNER CASES                                        │
│ - Dapodik Semicolon (;), BOM, Quoted Degrees, Missing NISN, Malformed  │
│ - Continuous KKTP Bounds: [0, 40], (40, 65], (65, 85], (85, 100]       │
│ - Bonus Anti-Inflation Capping (100 Max, +5.0 Term Elevation, Alfa)   │
│ - Cascading Deletions: Class -> Students -> TPs -> Scores & Presensi   │
│ - Empty CP / Invalid Bloom Taxonomy Verbs                              │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 1: FEATURE COVERAGE (HAPPY PATH IN ISOLATION)                     │
│ - Dapodik CSV/Excel Parser                                             │
│ - KKTP Multi-Model Engine (Deskripsi, Rubrik, Interval)                │
│ - Gradebook Score Entry & Persistence                                  │
│ - Remedial / Pengayaan Filtering                                       │
│ - Bonus Points Application & Ledger                                    │
│ - Effective Weeks (18 x 3 = 54 JP)                                     │
│ - Athirah Modul Ajar 6-Component Schema                                │
│ - Dual-Version LKPD Generation                                         │
│ - Server Actions Offline / Missing API Key Fallback                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Layout & Artifact Inventory

All test code and fixtures reside under `tests/e2e/`:

```
d:\New folder\
├── tests/
│   └── e2e/
│       ├── harness.ts             # Universal zero-dependency test runner & assertion engine
│       ├── fixtures.ts            # Statutory test datasets (Dapodik, Athirah Modul, LKPD)
│       ├── spec_validators.ts     # Authoritative specification calculation oracles
│       ├── tier1_features.test.ts  # Tier 1: 11 Feature Coverage tests
│       ├── tier2_boundaries.test.ts # Tier 2: 14 Boundary & Corner Case tests
│       ├── tier3_integration.test.ts # Tier 3: 2 Multi-Module Pipeline integration tests
│       ├── tier4_realworld.test.ts # Tier 4: 2 Real-World Athirah Semester cycle scenarios
│       └── run_all.ts             # Master test suite runner with ANSI summary reporting
├── TEST_INFRA.md                  # This document
└── TEST_READY.md                  # Verification summary and readiness report
```

### 2.1. File Descriptions

| File Path | Role | Description |
|---|---|---|
| `tests/e2e/harness.ts` | **Test Runner & Engine** | Pure TypeScript harness providing `describe`, `it`, `expect`, `beforeEach`, `afterEach`, assertions (`toBe`, `toEqual`, `toBeCloseTo`, `toThrow`), and timing analytics. Executable in both Node native strip-types and Vitest. |
| `tests/e2e/fixtures.ts` | **Test Data Fixtures** | Ground truth data structures: standard Dapodik CSV, semicolon CSV, BOM-prefixed CSV, missing NISN CSV, sample BSKAP 032 CP, official Athirah Modul Ajar object, and synchronized Student/Teacher LKPD fixtures. |
| `tests/e2e/spec_validators.ts` | **Specification Oracles** | Exact statutory implementation of KKTP piecewise continuous mapping, anti-inflation bonus capping, effective hours formula ($18 \times 3 = 54$), RFC 4180 CSV parser, Athirah 6-component validator, and LKPD dual-version validator. |
| `tests/e2e/tier1_features.test.ts` | **Tier 1 Test Suite** | 11 unit/isolated tests validating core features in isolation. |
| `tests/e2e/tier2_boundaries.test.ts` | **Tier 2 Test Suite** | 14 boundary tests validating extreme inputs, edge scores, delimiters, and cascading deletions. |
| `tests/e2e/tier3_integration.test.ts` | **Tier 3 Test Suite** | 2 integration pipelines validating end-to-end data flows across modules. |
| `tests/e2e/tier4_realworld.test.ts` | **Tier 4 Test Suite** | 2 complete real-world scenarios simulating an entire semester at SMA Islam Athirah 1 Makassar. |
| `tests/e2e/run_all.ts` | **Master Test Runner** | Master entrypoint executing all 30 tests in sequence, reporting individual suites, and displaying an executive summary table. |

---

## 3. How to Execute Tests

### 3.1. Master Test Suite (Recommended)

Run all 30 tests across all 4 tiers with a single command:

```powershell
node --experimental-strip-types tests/e2e/run_all.ts
```

*Expected output*: Clean ANSI-colored breakdown of each suite followed by an executive summary table showing **30/30 passed, 0 failed**.

### 3.2. Executing Individual Tiers

You can run individual test tiers in isolation:

#### Tier 1 (Feature Coverage):
```powershell
node --experimental-strip-types -e "import('./tests/e2e/tier1_features.test.ts'); import('./tests/e2e/harness.ts').then(h => h.runAllSuites());"
```

#### Tier 2 (Boundaries & Corners):
```powershell
node --experimental-strip-types -e "import('./tests/e2e/tier2_boundaries.test.ts'); import('./tests/e2e/harness.ts').then(h => h.runAllSuites());"
```

#### Tier 3 (Cross-Feature Integration):
```powershell
node --experimental-strip-types -e "import('./tests/e2e/tier3_integration.test.ts'); import('./tests/e2e/harness.ts').then(h => h.runAllSuites());"
```

#### Tier 4 (Real-World Scenarios):
```powershell
node --experimental-strip-types -e "import('./tests/e2e/tier4_realworld.test.ts'); import('./tests/e2e/harness.ts').then(h => h.runAllSuites());"
```

### 3.3. Vitest Execution

Once Vitest is installed in the project environment, the entire suite can also be executed natively via:

```powershell
npx vitest run tests/e2e
```

---

## 4. Test Suite Inventory & Coverage Matrix

| Tier | Suite Name | Test Count | Key Invariants Verified |
|---|---|:---:|---|
| **Tier 1** | Feature 1: Dapodik CSV Parsing | 1 | Standard valid rosters, 10-digit NISN leading zero preservation, gender parsing ('L'/'P') |
| **Tier 1** | Feature 2: KKTP Evaluation Engine | 3 | Description checklist, Rubric 4-tier scale, Interval model piecewise mapping |
| **Tier 1** | Feature 3: Gradebook Score Persistence | 1 | Scores mapped by studentId/tpId, unassessed cells remain `undefined` |
| **Tier 1** | Feature 4: Remedial/Pengayaan Filtering | 1 | Mutually exclusive partitioning based on KKTP threshold |
| **Tier 1** | Feature 5: Anti-Inflation Bonus Points | 1 | Assignment ceiling cap ($\le 100$), term elevation cap ($\le +5.0$) |
| **Tier 1** | Feature 6: Effective Weeks Calculation | 2 | $18 \times 3 = 54\text{ JP}$, $20 \times 2 = 40\text{ JP}$ |
| **Tier 1** | Feature 7: Athirah Modul Ajar Validation | 1 | 6 mandatory components (Identitas, Identifikasi, Spiritualisasi, Desain, 3M, Asesmen) |
| **Tier 1** | Feature 8: Dual-Version LKPD Sync | 1 | Student opening dua & stimulus sync with Teacher Key 4-level rubrics & exemplars |
| **Tier 1** | Feature 9: Server Actions Fallback | 1 | Safe fallback handling when `GEMINI_API_KEY` is undefined |
| **Tier 2** | Corner Case 1: Semicolon Delimiters | 1 | Indonesian Excel localized semicolon (`;`) CSV parsing |
| **Tier 2** | Corner Case 2: Quoted Fields with Commas | 1 | RFC 4180 quotes containing commas, academic titles (`Drs. Syukri, M.Pd.`), and addresses |
| **Tier 2** | Corner Case 3: UTF-8 BOM Handling | 1 | UTF-8 BOM (`\uFEFF`) header stripping without column corruption |
| **Tier 2** | Corner Case 4: Missing NISN on Cohorts | 1 | Graceful placeholder assignment (`PENDING-x`) for incoming cohorts |
| **Tier 2** | Corner Case 5: Malformed Rows | 1 | Skipping malformed rows with warnings while extracting valid records |
| **Tier 2** | Corner Case 6: KKTP Boundary Edge Points | 2 | Boundaries at 0, 40, 40.01, 65, 65.01, 85, 85.01, 100, and out-of-range rejection |
| **Tier 2** | Corner Case 7: Bonus Point Capping & Missed | 3 | Individual score overflow clamp, stacking term limit, absence (`Alfa`) freezing |
| **Tier 2** | Corner Case 8: Cascading Deletions | 2 | Class deletion purging students/TPs/scores/presensi, TP deletion purging score cells |
| **Tier 2** | Corner Case 9: CP & Bloom Input Edges | 2 | Empty/whitespace CP rejection, valid Bloom C1-C6 taxonomy enforcement |
| **Tier 3** | Pipeline 1: Ingestion to e-Rapor Export | 1 | Roster -> TP -> Scores -> Remedial -> Bonus -> e-Rapor narrative export |
| **Tier 3** | Pipeline 2: Modul Ajar -> Matrix -> LKPD | 1 | Athirah Modul -> MH/MA/MR code binding -> 8-col table -> LKPD sync |
| **Tier 4** | Scenario 1: SMA Athirah Semester Cycle | 1 | Full semester cycle for SMA Kelas X Fase E Informatika (18 weeks, 54 JP, 10 students) |
| **Tier 4** | Scenario 2: Remedial, Bonus & Parent e-Rapor | 1 | Complete remedial retests, bonus audit ledger, and parent e-Rapor delivery |
| **TOTAL** | **26 Sub-Suites** | **30 Tests** | **100% Pass Rate** |

---

## 5. Diagnostic Guide for Troubleshooting

If any test fails during future regression runs or worker implementation:

1. **Dapodik Ingestion Failures**:
   - Check if delimiter sniffing detected `;` vs `,`.
   - Verify if UTF-8 BOM was stripped before splitting header line.
   - Verify that NISN was treated as a string (`"0081234567"`), not coerced to a number (`81234567`).

2. **KKTP Evaluation Discrepancies**:
   - Check continuous boundary values: $40.00$ is Tier 1, $40.01$ is Tier 2; $65.00$ is Tier 2, $65.01$ is Tier 3; $85.00$ is Tier 3, $85.01$ is Tier 4.
   - Ensure floating point scores are not cast to integers prematurely.

3. **Bonus Point Anti-Inflation Failures**:
   - Check that $\min(100.0, raw + bonus)$ was applied.
   - Check that $\Delta_{\text{term}} \le 5.0$ was calculated across all statutory TPs.
   - Verify that an unexcused absence (`Alfa`) flags `isFrozenDueToAbsence: true`.

4. **Athirah Modul Ajar Validation Failures**:
   - Ensure all 6 components exist in the Modul Ajar object.
   - Check that the unit matches one of the 8 official Sekolah Islam Athirah units.
   - Check that `pmPrinciple` is one of `BERKESADARAN`, `BERMAKNA`, `MENGGEMBIRAKAN`.
   - Check that `matrixCode` is one of `MH-1..3`, `MA-1..3`, `MR-1..3`.
   - Check that `rubrikPenilaian4Level` weights in Teacher Key LKPD sum to exactly 100.
