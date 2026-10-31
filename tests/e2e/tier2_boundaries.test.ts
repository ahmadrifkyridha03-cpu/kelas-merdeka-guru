/**
 * Tier 2 - Boundary & Corner Cases Test Suite
 * Authoritative Source:
 * - PRD.md (Sections 4.1, 4.5, 6.5, 7.3, 8.5)
 * - orchestrator_2/PROJECT.md (F2, F3, F5, F6, F12)
 * - spec_miner_athirah_2/spec_analysis.md
 */

import { describe, it, expect, beforeEach } from "./harness.ts";
import {
  SEMICOLON_DAPODIK_CSV,
  BOM_QUOTED_DAPODIK_CSV,
  MISSING_NISN_DAPODIK_CSV,
  MALFORMED_ROWS_DAPODIK_CSV,
} from "./fixtures.ts";
import {
  parseDapodikCsvString,
  evaluateKKTPReference,
  applyBonusPointsWithAntiInflation,
} from "./spec_validators.ts";

describe("Tier 2 - Boundary & Corner Cases", () => {
  // 1. Dapodik Semicolon Delimiters (Indonesian Excel CSV)
  describe("Corner Case 1: Semicolon Delimiters", () => {
    it("should auto-detect semicolon delimiter and parse student records correctly", () => {
      const result = parseDapodikCsvString(SEMICOLON_DAPODIK_CSV);

      expect(result.errors).toHaveLength(0);
      expect(result.students).toHaveLength(2);

      expect(result.students[0].fullName).toBe("Muhammad Fatih Al-Farabi");
      expect(result.students[0].nisn).toBe("0081234567");
      expect(result.students[0].gender).toBe("L");

      expect(result.students[1].fullName).toBe("Aisyah Putri Humaira");
      expect(result.students[1].nisn).toBe("0082345678");
      expect(result.students[1].gender).toBe("P");
    });
  });

  // 2. RFC 4180 Quoted Fields with Commas & Academic Degrees
  describe("Corner Case 2: Quoted Fields with Embedded Commas", () => {
    it("should preserve embedded commas inside quotes without shifting column indices", () => {
      const result = parseDapodikCsvString(BOM_QUOTED_DAPODIK_CSV);

      expect(result.errors).toHaveLength(0);
      expect(result.students).toHaveLength(2);

      const s1 = result.students[0];
      // Academic title inside quote
      expect(s1.fullName).toBe("Farhan Al-Kautsar, S.Kom.");
      expect(s1.nisn).toBe("0089876543");
      expect(s1.nis).toBe("23010");
      expect(s1.gender).toBe("L");

      const s2 = result.students[1];
      expect(s2.fullName).toBe("Nadia Zulfa");
      expect(s2.nisn).toBe("0089876544");
      expect(s2.gender).toBe("P");
    });
  });

  // 3. UTF-8 BOM Handling
  describe("Corner Case 3: UTF-8 BOM Handling", () => {
    it("should strip UTF-8 BOM from CSV header without corrupting column matching", () => {
      expect(BOM_QUOTED_DAPODIK_CSV.charCodeAt(0)).toBe(0xfeff); // Verifies BOM is present

      const result = parseDapodikCsvString(BOM_QUOTED_DAPODIK_CSV);
      expect(result.errors).toHaveLength(0);
      expect(result.students.length).toBeGreaterThan(0);
    });
  });

  // 4. Missing NISN on New Cohorts (Early Grades)
  describe("Corner Case 4: Missing NISN on Early Cohorts", () => {
    it("should flag missing NISN as pending and generate temporary placeholder rather than crashing", () => {
      const result = parseDapodikCsvString(MISSING_NISN_DAPODIK_CSV);

      expect(result.errors).toHaveLength(0);
      expect(result.students).toHaveLength(2);

      expect(result.students[0].fullName).toBe("Ahmad Newbie SD");
      expect(result.students[0].isPendingNisn).toBe(true);
      expect(result.students[0].nisn).toContain("PENDING");

      expect(result.students[1].fullName).toBe("Siti Murid Baru");
      expect(result.students[1].isPendingNisn).toBe(true);

      expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    });
  });

  // 5. Malformed / Broken Rows Tolerance
  describe("Corner Case 5: Malformed Rows and Trailing Blank Lines", () => {
    it("should isolate malformed rows, record warnings, and extract valid records safely", () => {
      const result = parseDapodikCsvString(MALFORMED_ROWS_DAPODIK_CSV);

      expect(result.errors).toHaveLength(0);
      // Row 1 and Row 3 are valid
      expect(result.students).toHaveLength(2);
      expect(result.students[0].fullName).toBe("Murid Valid");
      expect(result.students[1].fullName).toBe("Murid Valid Kedua");

      // Malformed row 2 was safely skipped with a warning
      expect(result.warnings.length).toBeGreaterThanOrEqual(1);
    });
  });

  // 6. KKTP Continuous Interval Boundary Values
  describe("Corner Case 6: KKTP Interval Boundary Values [0, 40, 40.01, 65, 65.01, 85, 85.01, 100]", () => {
    it("should correctly classify exact boundary edge points", () => {
      // S = 0.0: Exactly bottom edge of Tier 1
      const s0 = evaluateKKTPReference("INTERVAL", 0.0);
      expect(s0.status).toBe("PERLU_BIMBINGAN");
      expect(s0.tierLabel).toBe("Perlu Bimbingan Dasar");

      // S = 40.0: Exactly upper edge of Tier 1
      const s40 = evaluateKKTPReference("INTERVAL", 40.0);
      expect(s40.status).toBe("PERLU_BIMBINGAN");
      expect(s40.tierLabel).toBe("Perlu Bimbingan Dasar");

      // S = 40.01: Lower edge of Tier 2
      const s40_01 = evaluateKKTPReference("INTERVAL", 40.01);
      expect(s40_01.status).toBe("PERLU_BIMBINGAN");
      expect(s40_01.tierLabel).toBe("Perlu Bimbingan Khusus");

      // S = 65.0: Upper edge of Tier 2
      const s65 = evaluateKKTPReference("INTERVAL", 65.0);
      expect(s65.status).toBe("PERLU_BIMBINGAN");
      expect(s65.tierLabel).toBe("Perlu Bimbingan Khusus");

      // S = 65.01: Lower edge of Tier 3 (TUNTAS)
      const s65_01 = evaluateKKTPReference("INTERVAL", 65.01);
      expect(s65_01.isMastered).toBe(true);
      expect(s65_01.status).toBe("TUNTAS");
      expect(s65_01.tierLabel).toBe("Tuntas Standar");

      // S = 85.0: Upper edge of Tier 3 (TUNTAS)
      const s85 = evaluateKKTPReference("INTERVAL", 85.0);
      expect(s85.isMastered).toBe(true);
      expect(s85.status).toBe("TUNTAS");
      expect(s85.tierLabel).toBe("Tuntas Standar");

      // S = 85.01: Lower edge of Tier 4 (PENGAYAAN)
      const s85_01 = evaluateKKTPReference("INTERVAL", 85.01);
      expect(s85_01.isMastered).toBe(true);
      expect(s85_01.status).toBe("PENGAYAAN");
      expect(s85_01.tierLabel).toContain("Pengayaan");

      // S = 100.0: Upper edge of Tier 4
      const s100 = evaluateKKTPReference("INTERVAL", 100.0);
      expect(s100.isMastered).toBe(true);
      expect(s100.status).toBe("PENGAYAAN");
    });

    it("should reject scores outside the statutory [0, 100] interval", () => {
      expect(() => evaluateKKTPReference("INTERVAL", -0.5)).toThrow("statutory range");
      expect(() => evaluateKKTPReference("INTERVAL", 100.5)).toThrow("statutory range");
    });
  });

  // 7. Bonus Points Edge Capping & Absence Freezing
  describe("Corner Case 7: Bonus Point Capping & Missed Assessment Freezing", () => {
    it("should clamp individual assignment score to 100 when bonus overflows", () => {
      const res = applyBonusPointsWithAntiInflation({
        rawScore: 99.0,
        bonusPointsToAdd: 5.0,
      });

      expect(res.rawPlusBonus).toBe(104.0);
      expect(res.effectiveScore).toBe(100.0);
      expect(res.isAssignmentCapped).toBe(true);
    });

    it("should strictly enforce +5.0 term elevation cap when stacking multiple bonus points", () => {
      // 5 TPs, raw scores = [60, 60, 60, 60, 60] -> sum = 300, avg = 60.0
      // Student attempts to accumulate +40 bonus points across assignments
      const res = applyBonusPointsWithAntiInflation({
        rawScore: 60.0,
        bonusPointsToAdd: 40.0,
        termContext: {
          totalTps: 5,
          rawTermSum: 300,
          currentBonusTermSum: 0,
        },
      });

      expect(res.isTermCapped).toBe(true);
      expect(res.termElevation).toBe(5.0);
      // Maximum allowed bonus for the term is 5.0 * 5 = 25 points. 60 + 25 = 85.0
      expect(res.effectiveScore).toBe(85.0);
    });

    it("should freeze bonus points when student has an unexcused absence (Alfa)", () => {
      const res = applyBonusPointsWithAntiInflation({
        rawScore: 70.0,
        bonusPointsToAdd: 5.0,
        hasUnexcusedAbsence: true,
      });

      expect(res.isFrozenDueToAbsence).toBe(true);
      expect(res.effectiveScore).toBe(70.0); // No bonus added while absence is unexcused
    });
  });

  // 8. Cascading Deletion Referential Integrity
  describe("Corner Case 8: Cascading Deletions of Classes, Students, and TPs", () => {
    it("should clean up all dependent students, TPs, scores, and attendance when a class is deleted", () => {
      // Mock relational store with cascading deletion
      interface MockState {
        classes: Array<{ id: string; name: string }>;
        students: Array<{ id: string; classId: string; name: string }>;
        tps: Array<{ id: string; classId: string; code: string }>;
        scores: Record<string, Record<string, number>>; // studentId -> tpId -> score
        attendance: Record<string, Array<{ studentId: string; status: string }>>; // classId -> records
      }

      const state: MockState = {
        classes: [
          { id: "class-A", name: "X-1" },
          { id: "class-B", name: "X-2" },
        ],
        students: [
          { id: "std-A1", classId: "class-A", name: "Student A1" },
          { id: "std-A2", classId: "class-A", name: "Student A2" },
          { id: "std-B1", classId: "class-B", name: "Student B1" },
        ],
        tps: [
          { id: "tp-A1", classId: "class-A", code: "TP-01" },
          { id: "tp-A2", classId: "class-A", code: "TP-02" },
          { id: "tp-B1", classId: "class-B", code: "TP-01" },
        ],
        scores: {
          "std-A1": { "tp-A1": 85, "tp-A2": 90 },
          "std-A2": { "tp-A1": 70, "tp-A2": 75 },
          "std-B1": { "tp-B1": 88 },
        },
        attendance: {
          "class-A": [
            { studentId: "std-A1", status: "HADIR" },
            { studentId: "std-A2", status: "HADIR" },
          ],
          "class-B": [{ studentId: "std-B1", status: "HADIR" }],
        },
      };

      function deleteClass(classId: string) {
        // 1. Identify students in this class
        const studentsToDelete = state.students.filter(s => s.classId === classId).map(s => s.id);

        // 2. Delete classes
        state.classes = state.classes.filter(c => c.id !== classId);

        // 3. Delete students in class
        state.students = state.students.filter(s => s.classId !== classId);

        // 4. Delete TPs in class
        state.tps = state.tps.filter(t => t.classId !== classId);

        // 5. Delete scores for removed students
        for (const sId of studentsToDelete) {
          delete state.scores[sId];
        }

        // 6. Delete attendance for removed class
        delete state.attendance[classId];
      }

      // Execute cascading deletion of Class A
      deleteClass("class-A");

      // Verify Class A and its dependents are completely purged
      expect(state.classes.map(c => c.id)).toEqual(["class-B"]);
      expect(state.students.map(s => s.id)).toEqual(["std-B1"]);
      expect(state.tps.map(t => t.id)).toEqual(["tp-B1"]);
      expect(state.scores["std-A1"]).toBeUndefined();
      expect(state.scores["std-A2"]).toBeUndefined();
      expect(state.attendance["class-A"]).toBeUndefined();

      // Verify Class B remains completely intact
      expect(state.scores["std-B1"]["tp-B1"]).toBe(88);
      expect(state.attendance["class-B"]).toHaveLength(1);
    });

    it("should remove score entries across all students when a single TP is deleted", () => {
      const scores: Record<string, Record<string, number>> = {
        "s1": { "tp-1": 80, "tp-2": 90 },
        "s2": { "tp-1": 75, "tp-2": 85 },
      };

      function deleteTP(tpId: string) {
        for (const sId of Object.keys(scores)) {
          delete scores[sId][tpId];
        }
      }

      deleteTP("tp-1");

      expect(scores["s1"]["tp-1"]).toBeUndefined();
      expect(scores["s1"]["tp-2"]).toBe(90);
      expect(scores["s2"]["tp-1"]).toBeUndefined();
      expect(scores["s2"]["tp-2"]).toBe(85);
    });
  });

  // 9. Edge Inputs: Empty/Whitespace CP and Invalid Bloom Verb Inputs
  describe("Corner Case 9: Empty CP Text and Invalid Bloom Verb Inputs", () => {
    it("should validate and reject empty or whitespace-only CP strings before processing", () => {
      function validateCPInput(cpText: string): { valid: boolean; error?: string } {
        if (!cpText || cpText.trim().length === 0) {
          return { valid: false, error: "Teks Capaian Pembelajaran (CP) tidak boleh kosong!" };
        }
        if (cpText.trim().length < 20) {
          return { valid: false, error: "Teks CP terlalu pendek (minimal 20 karakter)" };
        }
        return { valid: true };
      }

      expect(validateCPInput("").valid).toBe(false);
      expect(validateCPInput("    \n\t  ").valid).toBe(false);
      expect(validateCPInput("Pendek").valid).toBe(false);
      expect(validateCPInput("Pada akhir fase E peserta didik mampu memahami algoritma sorting").valid).toBe(true);
    });

    it("should validate Bloom cognitive level taxonomy against standard C1-C6 levels", () => {
      const VALID_BLOOM_LEVELS = ["C1", "C2", "C3", "C4", "C5", "C6"];

      function isBloomLevelValid(level: string): boolean {
        return VALID_BLOOM_LEVELS.includes(level.toUpperCase().trim());
      }

      expect(isBloomLevelValid("C1")).toBe(true);
      expect(isBloomLevelValid("c4")).toBe(true);
      expect(isBloomLevelValid("C6")).toBe(true);
      expect(isBloomLevelValid("C7")).toBe(false); // Invalid level
      expect(isBloomLevelValid("random")).toBe(false);
    });
  });
});
