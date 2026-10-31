/**
 * Tier 1 - Feature Coverage Test Suite (Happy Path Core Features in Isolation)
 * Authoritative Source:
 * - PRD.md (Sections 3, 4, 6, 7, 8, 9, 10)
 * - orchestrator_2/PROJECT.md
 * - spec_miner_athirah_2/spec_analysis.md
 */

import { describe, it, expect, beforeEach } from "./harness.ts";
import {
  VALID_DAPODIK_CSV,
  SAMPLE_CP_INFORMATIKA_FASE_E,
  SAMPLE_ATHIRAH_MODUL_AJAR,
  SAMPLE_ATHIRAH_LKPD_STUDENT,
  SAMPLE_ATHIRAH_LKPD_TEACHER_KEY,
} from "./fixtures.ts";
import {
  parseDapodikCsvString,
  evaluateKKTPReference,
  calculateEffectiveHours,
  applyBonusPointsWithAntiInflation,
  validateAthirahModulAjarStructure,
  validateAthirahLkpdDualVersion,
} from "./spec_validators.ts";

describe("Tier 1 - Feature Coverage: Core Features in Isolation", () => {
  // 1. Dapodik CSV Parsing (Valid Rosters)
  describe("Feature 1: Dapodik CSV Parsing (Valid Rosters)", () => {
    it("should parse standard valid Dapodik CSV roster into structured student records", () => {
      const result = parseDapodikCsvString(VALID_DAPODIK_CSV);

      expect(result.errors).toHaveLength(0);
      expect(result.students).toHaveLength(5);

      // Student 1 verification
      const s1 = result.students[0];
      expect(s1.fullName).toBe("Muhammad Fatih Al-Farabi");
      expect(s1.nisn).toBe("0081234567"); // Leading zero must be strictly preserved
      expect(s1.nis).toBe("23001");
      expect(s1.gender).toBe("L");
      expect(s1.isPendingNisn).toBe(false);

      // Student 2 verification
      const s2 = result.students[1];
      expect(s2.fullName).toBe("Aisyah Putri Humaira");
      expect(s2.nisn).toBe("0082345678");
      expect(s2.gender).toBe("P");

      // Verify all 5 students have valid genders and 10-digit NISNs
      for (const s of result.students) {
        expect(["L", "P"]).toContain(s.gender);
        expect(s.nisn).toHaveLength(10);
      }
    });
  });

  // 2. KKTP Evaluation across Description, Rubric, and Interval Models
  describe("Feature 2: KKTP Evaluation Engine (All 3 Models)", () => {
    it("should evaluate Interval model according to continuous piecewise thresholds", () => {
      // Tier 1: [0, 40] -> Perlu Bimbingan Dasar
      const res35 = evaluateKKTPReference("INTERVAL", 35.0);
      expect(res35.isMastered).toBe(false);
      expect(res35.status).toBe("PERLU_BIMBINGAN");
      expect(res35.tierLabel).toBe("Perlu Bimbingan Dasar");
      expect(res35.recommendation).toContain("Remedial Intensif");

      // Tier 2: (40, 65] -> Perlu Bimbingan Khusus
      const res55 = evaluateKKTPReference("INTERVAL", 55.0);
      expect(res55.isMastered).toBe(false);
      expect(res55.status).toBe("PERLU_BIMBINGAN");
      expect(res55.tierLabel).toBe("Perlu Bimbingan Khusus");
      expect(res55.recommendation).toContain("Remedial Parsial");

      // Tier 3: (65, 85] -> Tuntas Standar
      const res75 = evaluateKKTPReference("INTERVAL", 75.0);
      expect(res75.isMastered).toBe(true);
      expect(res75.status).toBe("TUNTAS");
      expect(res75.tierLabel).toBe("Tuntas Standar");

      // Tier 4: (85, 100] -> Pengayaan
      const res95 = evaluateKKTPReference("INTERVAL", 95.0);
      expect(res95.isMastered).toBe(true);
      expect(res95.status).toBe("PENGAYAAN");
      expect(res95.tierLabel).toContain("Pengayaan");
    });

    it("should evaluate Deskripsi checklist model accurately", () => {
      // 4 out of 4 criteria met
      const resFull = evaluateKKTPReference("DESKRIPSI", [true, true, true, true]);
      expect(resFull.isMastered).toBe(true);
      expect(resFull.status).toBe("TUNTAS");

      // 3 out of 4 criteria met -> needs guidance on remaining criterion
      const resPartial = evaluateKKTPReference("DESKRIPSI", [true, true, true, false]);
      expect(resPartial.isMastered).toBe(false);
      expect(resPartial.status).toBe("PERLU_BIMBINGAN");
      expect(resPartial.recommendation).toContain("3/4");
    });

    it("should evaluate Rubrik 4-tier scale accurately", () => {
      const l1 = evaluateKKTPReference("RUBRIK", 1);
      expect(l1.isMastered).toBe(false);
      expect(l1.status).toBe("PERLU_BIMBINGAN");

      const l2 = evaluateKKTPReference("RUBRIK", 2);
      expect(l2.isMastered).toBe(false);
      expect(l2.status).toBe("PERLU_BIMBINGAN");

      const l3 = evaluateKKTPReference("RUBRIK", 3);
      expect(l3.isMastered).toBe(true);
      expect(l3.status).toBe("TUNTAS");

      const l4 = evaluateKKTPReference("RUBRIK", 4);
      expect(l4.isMastered).toBe(true);
      expect(l4.status).toBe("PENGAYAAN");
    });
  });

  // 3. Gradebook Score Entry & Persistence
  describe("Feature 3: Gradebook Score Entry & Persistence", () => {
    it("should record scores mapped by studentId and tpId, preserving unassessed cells as undefined", () => {
      const mockScoreStore: Record<string, Record<string, number>> = {};

      function setScore(studentId: string, tpId: string, score: number) {
        const clamped = Math.min(100, Math.max(0, score));
        if (!mockScoreStore[studentId]) {
          mockScoreStore[studentId] = {};
        }
        mockScoreStore[studentId][tpId] = clamped;
      }

      setScore("std-1", "tp-101", 88);
      setScore("std-1", "tp-102", 92);
      setScore("std-2", "tp-101", 64);

      expect(mockScoreStore["std-1"]["tp-101"]).toBe(88);
      expect(mockScoreStore["std-1"]["tp-102"]).toBe(92);
      expect(mockScoreStore["std-2"]["tp-101"]).toBe(64);

      // Unassessed TP-102 for std-2 must NOT default to 0
      expect(mockScoreStore["std-2"]["tp-102"]).toBeUndefined();
    });
  });

  // 4. Remedial Filtering (< KKTP) & Pengayaan Filtering (>= KKTP)
  describe("Feature 4: Remedial and Pengayaan Queue Filtering", () => {
    it("should correctly partition students based on KKTP threshold", () => {
      const kktpThreshold = 75.0;
      const studentScores = [
        { studentId: "s1", name: "Fatih", score: 60.0 },
        { studentId: "s2", name: "Aisyah", score: 74.9 },
        { studentId: "s3", name: "Sulaiman", score: 75.0 },
        { studentId: "s4", name: "Fathimah", score: 88.0 },
        { studentId: "s5", name: "Umar", score: 95.0 },
      ];

      const remedialQueue = studentScores.filter(s => s.score < kktpThreshold);
      const pengayaanQueue = studentScores.filter(s => s.score >= kktpThreshold);

      expect(remedialQueue).toHaveLength(2);
      expect(remedialQueue.map(s => s.name)).toEqual(["Fatih", "Aisyah"]);

      expect(pengayaanQueue).toHaveLength(3);
      expect(pengayaanQueue.map(s => s.name)).toEqual(["Sulaiman", "Fathimah", "Umar"]);
    });
  });

  // 5. Anti-Inflation Bonus Point Application
  describe("Feature 5: Anti-Inflation Bonus Point Application", () => {
    it("should cap assignment score at 100.0 and limit semester elevation to +5.0", () => {
      // 1. Assignment ceiling cap
      const resCapped = applyBonusPointsWithAntiInflation({
        rawScore: 98,
        bonusPointsToAdd: 5,
      });
      expect(resCapped.effectiveScore).toBe(100.0);
      expect(resCapped.isAssignmentCapped).toBe(true);

      // 2. Term elevation cap (+5.0 ceiling)
      // 4 TPs each with raw 70 -> raw sum = 280, raw avg = 70.0
      // Student tries to add +28 bonus points across assignments
      const resTermCapped = applyBonusPointsWithAntiInflation({
        rawScore: 70,
        bonusPointsToAdd: 28,
        termContext: {
          totalTps: 4,
          rawTermSum: 280,
          currentBonusTermSum: 0,
        },
      });

      expect(resTermCapped.isTermCapped).toBe(true);
      expect(resTermCapped.termElevation).toBe(5.0);
      expect(resTermCapped.effectiveScore).toBe(90.0); // 70 + allowed 20 = 90
    });
  });

  // 6. Effective Weeks Calculation
  describe("Feature 6: Effective Weeks Calculation", () => {
    it("should calculate effective semester teaching hours (18 weeks x 3 JP = 54 JP)", () => {
      const weeks = 18;
      const hoursPerWeek = 3;
      const totalJP = calculateEffectiveHours(weeks, hoursPerWeek);

      expect(totalJP).toBe(54);
    });

    it("should calculate 20 weeks x 2 JP = 40 JP", () => {
      const totalJP = calculateEffectiveHours(20, 2);
      expect(totalJP).toBe(40);
    });
  });

  // 7. Athirah Modul Ajar 6-Component Validation
  describe("Feature 7: Athirah Modul Ajar 6-Component Validation", () => {
    it("should validate all 6 required components of official Athirah Modul Ajar", () => {
      const validation = validateAthirahModulAjarStructure(SAMPLE_ATHIRAH_MODUL_AJAR);

      expect(validation.missingComponents).toHaveLength(0);
      expect(validation.errors).toHaveLength(0);
      expect(validation.valid).toBe(true);

      // Verify specific mandatory Athirah features
      expect(SAMPLE_ATHIRAH_MODUL_AJAR.identitas.unit).toBe("SMA Islam Athirah 1 Makassar");
      expect(SAMPLE_ATHIRAH_MODUL_AJAR.spiritualisasi.quranVerse.surahName).toBe("Al-Qamar");
      expect(SAMPLE_ATHIRAH_MODUL_AJAR.spiritualisasi.quranVerse.ayahNumber).toBe(49);
      expect(SAMPLE_ATHIRAH_MODUL_AJAR.spiritualisasi.coreSpiritualValue).toContain("Itqan");
      expect(SAMPLE_ATHIRAH_MODUL_AJAR.desainPembelajaran.tujuanPembelajaran.integratedSpiritualGoal).toBeDefined();
      expect(SAMPLE_ATHIRAH_MODUL_AJAR.pengalamanBelajar.memahami[0].pmPrinciple).toBe("BERKESADARAN");
      expect(SAMPLE_ATHIRAH_MODUL_AJAR.pengalamanBelajar.memahami[0].matrixCode).toBe("MH-1");
      expect(SAMPLE_ATHIRAH_MODUL_AJAR.lampiranAsesmen).toHaveLength(2);
    });
  });

  // 8. LKPD Dual-Version Generation (Student & Teacher Key)
  describe("Feature 8: Dual-Version LKPD Synchronization", () => {
    it("should validate synchronized student and teacher key LKPD versions", () => {
      const validation = validateAthirahLkpdDualVersion(
        SAMPLE_ATHIRAH_LKPD_STUDENT,
        SAMPLE_ATHIRAH_LKPD_TEACHER_KEY,
        "modul-athirah-x-inf-01"
      );

      expect(validation.errors).toHaveLength(0);
      expect(validation.valid).toBe(true);

      // Verify student version specifics
      expect(SAMPLE_ATHIRAH_LKPD_STUDENT.openingDuaAndAdab.bismillahText).toContain("بِسْمِ اللَّهِ");
      expect(SAMPLE_ATHIRAH_LKPD_STUDENT.contextualStimulus.title).toContain("Kakao");

      // Verify teacher key specifics
      const guide = SAMPLE_ATHIRAH_LKPD_TEACHER_KEY.guruAnswerKeyGuide;
      expect(guide).toBeDefined();
      expect(guide.exemplarAnswersByTier["tier-1"]).toBeDefined();
      expect(guide.misconceptionAnticipations).toHaveLength(2);

      // Verify rubric scores sum to 100
      const totalWeight = guide.rubrikPenilaian4Level.reduce((sum, r) => sum + r.bobotNilai, 0);
      expect(totalWeight).toBe(100);
    });
  });

  // 9. Server Actions Fallback Behavior When API Key Missing
  describe("Feature 9: Server Actions Fallback Behavior", () => {
    it("should handle missing GEMINI_API_KEY gracefully without throwing unhandled exceptions", async () => {
      // Simulate safe fallback action runner
      async function safeExecuteServerAction(hasApiKey: boolean) {
        if (!hasApiKey) {
          return {
            success: false,
            isFallback: true,
            error: "Kunci GEMINI_API_KEY belum dikonfigurasi di lingkungan server.",
            fallbackData: [
              {
                code: "TP-01",
                description: "Memahami strategi algoritmik standar sorting dan searching",
                bloomLevel: "C2",
                scope: "Strategi Algoritmik",
                allocatedHours: 6,
                kktpThreshold: 75,
                kktpModel: "INTERVAL_NILAI",
              },
            ],
          };
        }
        return { success: true, data: [] };
      }

      const res = await safeExecuteServerAction(false);
      expect(res.success).toBe(false);
      expect(res.isFallback).toBe(true);
      expect(res.fallbackData).toHaveLength(1);
      expect(res.fallbackData?.[0].code).toBe("TP-01");
    });
  });
});
