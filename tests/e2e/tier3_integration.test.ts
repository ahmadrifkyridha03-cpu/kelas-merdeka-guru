/**
 * Tier 3 - Cross-Feature Combinations & Integration Test Suite
 * Authoritative Source:
 * - PRD.md (Sections 4.5, 6.4, 6.5, 6.8, 7.3, 8.5, 9.1-9.4, 10.2)
 * - orchestrator_2/PROJECT.md
 * - spec_miner_athirah_2/spec_analysis.md
 */

import { describe, it, expect, beforeEach } from "./harness.ts";
import {
  VALID_DAPODIK_CSV,
  SAMPLE_ATHIRAH_MODUL_AJAR,
  SAMPLE_ATHIRAH_LKPD_STUDENT,
  SAMPLE_ATHIRAH_LKPD_TEACHER_KEY,
} from "./fixtures.ts";
import {
  parseDapodikCsvString,
  evaluateKKTPReference,
  applyBonusPointsWithAntiInflation,
  validateAthirahModulAjarStructure,
  validateAthirahLkpdDualVersion,
} from "./spec_validators.ts";

describe("Tier 3 - Cross-Feature Combinations & Multi-Module Integration", () => {
  /**
   * Pipeline 1: Roster Import -> TP Generation -> Grade Recording ->
   * Remedial Queue -> Bonus Point Award -> e-Rapor Export
   */
  describe("Pipeline 1: Full Academic Cycle from Ingestion to e-Rapor Export", () => {
    it("should execute complete cross-feature workflow and produce valid e-Rapor output", () => {
      // 1. Roster Import
      const parseResult = parseDapodikCsvString(VALID_DAPODIK_CSV);
      expect(parseResult.errors).toHaveLength(0);
      expect(parseResult.students).toHaveLength(5);

      const students = parseResult.students.map((s, idx) => ({
        id: `std-${idx + 1}`,
        fullName: s.fullName,
        nisn: s.nisn,
        gender: s.gender,
        parentalConsent: {
          status: "GRANTED",
          consentedAt: "2026-07-15T08:00:00Z",
        },
      }));

      // 2. TP Generation from CP
      const tps = [
        {
          id: "tp-01",
          code: "TP-01",
          description: "Memahami strategi algoritmik sorting (Bubble Sort)",
          bloomLevel: "C2",
          scope: "Strategi Algoritma",
          kktpThreshold: 75,
        },
        {
          id: "tp-02",
          code: "TP-02",
          description: "Menerapkan dekomposisi dan pola pada pemilahan data",
          bloomLevel: "C3",
          scope: "Dekomposisi Data",
          kktpThreshold: 75,
        },
        {
          id: "tp-03",
          code: "TP-03",
          description: "Menganalisis efisiensi algoritma pemilahan data",
          bloomLevel: "C4",
          scope: "Analisis Kompleksitas",
          kktpThreshold: 75,
        },
      ];

      // 3. Grade Recording across TPs
      const rawScores: Record<string, Record<string, number>> = {
        "std-1": { "tp-01": 85, "tp-02": 88, "tp-03": 90 }, // All pass
        "std-2": { "tp-01": 65, "tp-02": 78, "tp-03": 80 }, // TP-01 < 75 (remedial)
        "std-3": { "tp-01": 58, "tp-02": 64, "tp-03": 70 }, // All 3 < 75 (remedial)
        "std-4": { "tp-01": 92, "tp-02": 95, "tp-03": 90 }, // All pass
        "std-5": { "tp-01": 70, "tp-02": 85, "tp-03": 80 }, // TP-01 < 75 (remedial)
      };

      // 4. Remedial Queue Detection for TP-01
      const tp01Threshold = tps[0].kktpThreshold;
      const remedialCandidatesTP01 = students.filter(s => {
        const score = rawScores[s.id]["tp-01"];
        return score < tp01Threshold;
      });

      expect(remedialCandidatesTP01).toHaveLength(3);
      expect(remedialCandidatesTP01.map(s => s.id)).toEqual(["std-2", "std-3", "std-5"]);

      // Remedial retest resolution:
      // Policy: score_final = min(KKTP, retest_score)
      const retestResults: Record<string, number> = {
        "std-2": 82, // retest 82 -> capped at 75
        "std-3": 72, // retest 72 -> achieves 72
        "std-5": 88, // retest 88 -> capped at 75
      };

      const finalScores: Record<string, Record<string, number>> = JSON.parse(JSON.stringify(rawScores));
      for (const [sId, retest] of Object.entries(retestResults)) {
        finalScores[sId]["tp-01"] = Math.min(tp01Threshold, retest);
      }

      expect(finalScores["std-2"]["tp-01"]).toBe(75);
      expect(finalScores["std-3"]["tp-01"]).toBe(72);
      expect(finalScores["std-5"]["tp-01"]).toBe(75);

      // 5. Bonus Points Award & Anti-Inflation Validation
      // std-1 gets +4 bonus points on TP-01
      const bonusLog = {
        studentId: "std-1",
        points: 4,
        reason: "Tutor sebaya simulasi bubble sort kartu angka",
        timestamp: "2026-10-31T09:00:00Z",
      };

      const bonusResult = applyBonusPointsWithAntiInflation({
        rawScore: finalScores["std-1"]["tp-01"],
        bonusPointsToAdd: bonusLog.points,
        termContext: {
          totalTps: 3,
          rawTermSum: 85 + 88 + 90,
          currentBonusTermSum: 0,
        },
      });

      expect(bonusResult.isTermCapped).toBe(false);
      expect(bonusResult.effectiveScore).toBe(89);
      finalScores["std-1"]["tp-01"] = bonusResult.effectiveScore;

      // 6. e-Rapor Export Synthesis
      interface ERaporRecord {
        studentId: string;
        fullName: string;
        nisn: string;
        nasNumeric: number;
        qualitativeNarrative: {
          highestMastery: string;
          lowestNeedGrowth: string;
        };
      }

      const eRaporReport: ERaporRecord[] = students.map(s => {
        const studentTPMap = finalScores[s.id];
        const scoresArr = Object.values(studentTPMap);
        const nas = scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length;

        // Find highest and lowest TPs
        let maxScore = -1;
        let minScore = 999;
        let maxTP = tps[0];
        let minTP = tps[0];

        for (const tp of tps) {
          const sc = studentTPMap[tp.id];
          if (sc > maxScore) {
            maxScore = sc;
            maxTP = tp;
          }
          if (sc < minScore) {
            minScore = sc;
            minTP = tp;
          }
        }

        return {
          studentId: s.id,
          fullName: s.fullName,
          nisn: s.nisn,
          nasNumeric: Math.round(nas * 10) / 10,
          qualitativeNarrative: {
            highestMastery: `Menunjukkan penguasaan sangat baik dalam ${maxTP.description.toLowerCase()}.`,
            lowestNeedGrowth: minScore < 75 
              ? `Perlu bimbingan dan peningkatan dalam ${minTP.description.toLowerCase()}.`
              : `Perlu mempertahankan dan meningkatkan ketelitian dalam ${minTP.description.toLowerCase()}.`,
          },
        };
      });

      expect(eRaporReport).toHaveLength(5);
      // Fatih NAS = (89 + 88 + 90) / 3 = 89.0
      expect(eRaporReport[0].nasNumeric).toBe(89.0);
      expect(eRaporReport[0].qualitativeNarrative.highestMastery).toContain("menganalisis efisiensi");

      // Aisyah NAS = (75 + 78 + 80) / 3 = 77.7
      expect(eRaporReport[1].nasNumeric).toBeCloseTo(77.7, 0.1);

      // Sulaiman NAS = (72 + 64 + 70) / 3 = 68.7
      expect(eRaporReport[2].nasNumeric).toBeCloseTo(68.7, 0.1);
      expect(eRaporReport[2].qualitativeNarrative.lowestNeedGrowth).toContain("Perlu bimbingan");
    });
  });

  /**
   * Pipeline 2: Athirah Modul Ajar -> 3M Matrix Code Binding ->
   * Lampiran Asesmen -> LKPD Dual-Version Synchronization
   */
  describe("Pipeline 2: Athirah Modul Ajar, Matrix Binding, and LKPD Dual-Version Sync", () => {
    it("should verify complete structural integrity and synchronization across Athirah artifacts", () => {
      // 1. Modul Ajar 6-component validation
      const modulValidation = validateAthirahModulAjarStructure(SAMPLE_ATHIRAH_MODUL_AJAR);
      expect(modulValidation.valid).toBe(true);

      // 2. Activity Step Matrix Code Progression:
      // Memahami should use MH codes, Mengaplikasi should use MA codes, Merefleksi should use MR codes
      const { memahami, mengaplikasi, merefleksi } = SAMPLE_ATHIRAH_MODUL_AJAR.pengalamanBelajar;

      for (const step of memahami) {
        expect(step.matrixCode.startsWith("MH")).toBe(true);
        expect(["BERKESADARAN", "BERMAKNA", "MENGGEMBIRAKAN"]).toContain(step.pmPrinciple);
      }

      for (const step of mengaplikasi) {
        expect(step.matrixCode.startsWith("MA")).toBe(true);
        expect(["BERKESADARAN", "BERMAKNA", "MENGGEMBIRAKAN"]).toContain(step.pmPrinciple);
      }

      for (const step of merefleksi) {
        expect(step.matrixCode.startsWith("MR")).toBe(true);
        expect(["BERKESADARAN", "BERMAKNA", "MENGGEMBIRAKAN"]).toContain(step.pmPrinciple);
      }

      // 3. Lampiran Asesmen 8-Column Binding
      const lampiran = SAMPLE_ATHIRAH_MODUL_AJAR.lampiranAsesmen;
      expect(lampiran.length).toBeGreaterThanOrEqual(2);

      const tulisItem = lampiran.find(i => i.jenisAsesmen === "TULIS");
      const nonTulisItem = lampiran.find(i => i.jenisAsesmen === "NONTULIS");

      expect(tulisItem).toBeDefined();
      expect(tulisItem?.tpCode).toBe("TP-01");
      expect(tulisItem?.uraianSoalTertulis).toContain("Pass 1 dan Pass 2");
      expect(tulisItem?.isLkpdAttached).toBe(true);

      expect(nonTulisItem).toBeDefined();
      expect(nonTulisItem?.tpCode).toBe("TP-01");
      expect(nonTulisItem?.deskripsiAktivitasNontulis).toContain("kartu angka");
      expect(nonTulisItem?.isLkpdAttached).toBe(true);

      // 4. LKPD Dual-Version Synchronization
      const lkpdSyncValidation = validateAthirahLkpdDualVersion(
        SAMPLE_ATHIRAH_LKPD_STUDENT,
        SAMPLE_ATHIRAH_LKPD_TEACHER_KEY,
        SAMPLE_ATHIRAH_MODUL_AJAR.id
      );

      expect(lkpdSyncValidation.valid).toBe(true);
      expect(lkpdSyncValidation.errors).toHaveLength(0);

      // Verify Student LKPD has authentic stimulus matching Sulawesi Selatan
      expect(SAMPLE_ATHIRAH_LKPD_STUDENT.contextualStimulus.narrative).toContain("Kabupaten Luwu");

      // Verify Teacher Key has actionable remedies for student misconceptions
      const remedies = SAMPLE_ATHIRAH_LKPD_TEACHER_KEY.guruAnswerKeyGuide.misconceptionAnticipations;
      expect(remedies.some(r => r.misconception.includes("berhenti"))).toBe(true);

      // Verify Rubric analytical weight total equals 100
      const totalRubricWeight = SAMPLE_ATHIRAH_LKPD_TEACHER_KEY.guruAnswerKeyGuide.rubrikPenilaian4Level.reduce(
        (sum, r) => sum + r.bobotNilai,
        0
      );
      expect(totalRubricWeight).toBe(100);
    });
  });
});
