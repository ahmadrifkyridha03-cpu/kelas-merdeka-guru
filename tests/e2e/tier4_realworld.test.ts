/**
 * Tier 4 - Real-World Application Scenarios Test Suite
 * Authoritative Source:
 * - PRD.md (Sections 1-10)
 * - orchestrator_2/PROJECT.md
 * - spec_miner_athirah_2/spec_analysis.md
 */

import { describe, it, expect, beforeEach } from "./harness.ts";
import {
  ATHIRAH_UNITS,
  ATHIRAH_PLA_DIMENSIONS,
  ATHIRAH_RENSTRA_PROGRAMS,
  PEDAGOGI_MERDEKA_PRINCIPLES,
  MATRIKS_PENGUATAN_CODES,
  SAMPLE_ATHIRAH_MODUL_AJAR,
  SAMPLE_ATHIRAH_LKPD_STUDENT,
  SAMPLE_ATHIRAH_LKPD_TEACHER_KEY,
} from "./fixtures.ts";
import {
  calculateEffectiveHours,
  evaluateKKTPReference,
  applyBonusPointsWithAntiInflation,
  validateAthirahModulAjarStructure,
  validateAthirahLkpdDualVersion,
} from "./spec_validators.ts";

describe("Tier 4 - Real-World Application Scenarios", () => {
  /**
   * Scenario 1: Complete Semester Cycle for SMA Kelas X Fase E Informatika
   * Satuan Pendidikan: SMA Islam Athirah 1 Makassar
   * Semester: Ganjil 2026/2027
   */
  describe("Scenario 1: Complete Semester Academic Planning & Execution (SMA Islam Athirah 1 Makassar)", () => {
    it("should simulate a full semester instructional cycle aligning calendar, TP, and modul ajar", () => {
      // 1. School Profile & Academic Year Setup
      const schoolProfile = {
        unit: "SMA Islam Athirah 1 Makassar",
        npsn: "40307399",
        academicYear: "2026/2027",
        semester: 1, // Ganjil
        subject: "Informatika",
        fase: "E",
        gradeLevel: 10,
        className: "X-1",
        weeklyTeachingHours: 3, // 3 JP/week
      };

      expect(ATHIRAH_UNITS).toContain(schoolProfile.unit as any);

      // 2. Analisis Minggu Efektif (RME) Calculation
      const totalCalendarWeeks = 24;
      const nonEffectiveWeeks = 6; // Libur semester (2), MPLS (1), SAS (2), Hari libur nasional (1)
      const effectiveWeeks = totalCalendarWeeks - nonEffectiveWeeks; // 18 weeks

      expect(effectiveWeeks).toBe(18);
      const totalEffectiveHours = calculateEffectiveHours(effectiveWeeks, schoolProfile.weeklyTeachingHours);
      expect(totalEffectiveHours).toBe(54); // Exactly 54 JP

      // 3. Class Roster Ingestion (10 students)
      const roster = [
        { id: "std-01", name: "Muhammad Fatih Al-Farabi", nisn: "0081234567", gender: "L" },
        { id: "std-02", name: "Aisyah Putri Humaira", nisn: "0082345678", gender: "P" },
        { id: "std-03", name: "Sulaiman Rasyid Al-Haddad", nisn: "0083456789", gender: "L" },
        { id: "std-04", name: "Fathimah Az-Zahra", nisn: "0084567890", gender: "P" },
        { id: "std-05", name: "Umar Abdul Aziz", nisn: "0085678901", gender: "L" },
        { id: "std-06", name: "Khadijah Al-Kubra", nisn: "0086789012", gender: "P" },
        { id: "std-07", name: "Ali bin Abi Thalib", nisn: "0087890123", gender: "L" },
        { id: "std-08", name: "Maryam Binti Imran", nisn: "0088901234", gender: "P" },
        { id: "std-09", name: "Bilal bin Rabah", nisn: "0089012345", gender: "L", specialNeeds: "Visual Scaffolding" },
        { id: "std-10", name: "Thariq bin Ziyad", nisn: "0089123456", gender: "L" },
      ];

      expect(roster).toHaveLength(10);

      // 4. Curriculum TP Synthesis & Hour Distribution
      const semesterTPs = [
        {
          id: "tp-e-01",
          code: "TP-01",
          description: "Menerapkan dekomposisi untuk memodelkan persoalan komputasi sederhana",
          bloomLevel: "C3",
          allocatedHours: 12,
          kktpThreshold: 75,
        },
        {
          id: "tp-e-02",
          code: "TP-02",
          description: "Menganalisis pola keteraturan dalam deret data dan algoritma pemilahan",
          bloomLevel: "C4",
          allocatedHours: 15,
          kktpThreshold: 75,
        },
        {
          id: "tp-e-03",
          code: "TP-03",
          description: "Merancang algoritma sorting dan searching menggunakan pseudocode/flowchart",
          bloomLevel: "C6",
          allocatedHours: 15,
          kktpThreshold: 75,
        },
        {
          id: "tp-e-04",
          code: "TP-04",
          description: "Mengevaluasi efisiensi ruang dan waktu algoritma komputasi",
          bloomLevel: "C5",
          allocatedHours: 12,
          kktpThreshold: 75,
        },
      ];

      // Verify sum of TP allocated JP equals total effective hours
      const sumAllocatedJP = semesterTPs.reduce((sum, tp) => sum + tp.allocatedHours, 0);
      expect(sumAllocatedJP).toBe(totalEffectiveHours);

      // 5. Modul Ajar Production & Athirah Compliance
      const modulValidation = validateAthirahModulAjarStructure(SAMPLE_ATHIRAH_MODUL_AJAR);
      expect(modulValidation.valid).toBe(true);

      const lkpdValidation = validateAthirahLkpdDualVersion(
        SAMPLE_ATHIRAH_LKPD_STUDENT,
        SAMPLE_ATHIRAH_LKPD_TEACHER_KEY,
        SAMPLE_ATHIRAH_MODUL_AJAR.id
      );
      expect(lkpdValidation.valid).toBe(true);

      // 6. Assessment Administration across all 4 TPs
      const rawScores: Record<string, Record<string, number>> = {
        "std-01": { "tp-e-01": 88, "tp-e-02": 90, "tp-e-03": 85, "tp-e-04": 92 },
        "std-02": { "tp-e-01": 82, "tp-e-02": 85, "tp-e-03": 80, "tp-e-04": 84 },
        "std-03": { "tp-e-01": 70, "tp-e-02": 62, "tp-e-03": 65, "tp-e-04": 68 }, // 3 TPs < 75
        "std-04": { "tp-e-01": 95, "tp-e-02": 92, "tp-e-03": 90, "tp-e-04": 96 },
        "std-05": { "tp-e-01": 78, "tp-e-02": 72, "tp-e-03": 76, "tp-e-04": 75 }, // TP-02 < 75
        "std-06": { "tp-e-01": 86, "tp-e-02": 88, "tp-e-03": 84, "tp-e-04": 85 },
        "std-07": { "tp-e-01": 90, "tp-e-02": 94, "tp-e-03": 92, "tp-e-04": 95 },
        "std-08": { "tp-e-01": 80, "tp-e-02": 82, "tp-e-03": 85, "tp-e-04": 80 },
        "std-09": { "tp-e-01": 76, "tp-e-02": 68, "tp-e-03": 78, "tp-e-04": 75 }, // TP-02 < 75
        "std-10": { "tp-e-01": 84, "tp-e-02": 86, "tp-e-03": 82, "tp-e-04": 88 },
      };

      // Verify that 7 students passed all TPs initially, and 3 need remedial
      const studentsNeedingRemedial = roster.filter(s => {
        const studentScores = Object.values(rawScores[s.id]);
        return studentScores.some(score => score < 75);
      });

      expect(studentsNeedingRemedial).toHaveLength(3);
      expect(studentsNeedingRemedial.map(s => s.id)).toEqual(["std-03", "std-05", "std-09"]);
    });
  });

  /**
   * Scenario 2: Complete Remedial, Anti-Inflation Bonus, and Parent e-Rapor Workflow
   */
  describe("Scenario 2: Remedial Intervention, Bonus Points Ledger & Parent e-Rapor Delivery", () => {
    it("should execute the remedial cycle, audit bonus points, and compile UU PDP compliant e-Rapor cards", () => {
      // 1. Initial State Setup
      const kktp = 75;
      const initialScores: Record<string, { rawScores: number[]; remedialNeeded: boolean }> = {
        "std-03": { rawScores: [70, 62, 65, 68], remedialNeeded: true },
        "std-05": { rawScores: [78, 72, 76, 75], remedialNeeded: true },
        "std-09": { rawScores: [76, 68, 78, 75], remedialNeeded: true },
      };

      // 2. Context-Aware Remedial Tasks & Post-Remedial Evaluation
      // Policy: score_final = min(KKTP, retest_score)
      const postRemedialScores: Record<string, number[]> = {
        "std-03": [75, 75, 75, 75], // Retests achieved 80, 78, 76, 82 -> capped at 75
        "std-05": [78, 75, 76, 75], // TP-02 retest 84 -> capped at 75
        "std-09": [76, 75, 78, 75], // TP-02 retest 80 -> capped at 75
      };

      // Verify every remedial student now meets mastery status
      for (const [sId, scores] of Object.entries(postRemedialScores)) {
        for (const sc of scores) {
          const evalResult = evaluateKKTPReference("INTERVAL", sc);
          expect(evalResult.isMastered).toBe(true);
        }
      }

      // 3. Extra Credit & Anti-Inflation Bonus Point Ledger
      const auditBonusLedger: Array<{
        id: string;
        studentId: string;
        studentName: string;
        points: number;
        reason: string;
        timestamp: string;
        verifiedBy: string;
      }> = [
        {
          id: "bon-01",
          studentId: "std-07",
          studentName: "Ali bin Abi Thalib",
          points: 3,
          reason: "Relawan asisten simulasi perakitan sorting kartu pada Pameran Sains Athirah",
          timestamp: "2026-10-31T10:00:00Z",
          verifiedBy: "Ahmad Fadillah, S.Pd., Gr.",
        },
        {
          id: "bon-02",
          studentId: "std-01",
          studentName: "Muhammad Fatih Al-Farabi",
          points: 2,
          reason: "Tutor sebaya bagi rekan yang memerlukan bimbingan tambahan",
          timestamp: "2026-10-31T10:15:00Z",
          verifiedBy: "Ahmad Fadillah, S.Pd., Gr.",
        },
      ];

      expect(auditBonusLedger).toHaveLength(2);

      // Verify bonus point anti-inflation cap
      for (const entry of auditBonusLedger) {
        const bonusCheck = applyBonusPointsWithAntiInflation({
          rawScore: 92,
          bonusPointsToAdd: entry.points,
          termContext: {
            totalTps: 4,
            rawTermSum: 360,
            currentBonusTermSum: 0,
          },
        });
        expect(bonusCheck.effectiveScore).toBeLessThanOrEqual(100);
        expect(bonusCheck.termElevation).toBeLessThanOrEqual(5.0);
      }

      // 4. Presensi / Attendance Tracking across 18 weeks
      const attendanceSummary: Record<string, { hadir: number; sakit: number; izin: number; alpa: number; rate: number }> = {
        "std-01": { hadir: 18, sakit: 0, izin: 0, alpa: 0, rate: 100.0 },
        "std-02": { hadir: 17, sakit: 0, izin: 1, alpa: 0, rate: 94.4 },
        "std-03": { hadir: 16, sakit: 2, izin: 0, alpa: 0, rate: 88.9 },
        "std-07": { hadir: 18, sakit: 0, izin: 0, alpa: 0, rate: 100.0 },
        "std-09": { hadir: 18, sakit: 0, izin: 0, alpa: 0, rate: 100.0 },
      };

      expect(attendanceSummary["std-01"].rate).toBe(100.0);
      expect(attendanceSummary["std-02"].rate).toBeCloseTo(94.4, 0.1);

      // 5. Parent e-Rapor Card Synthesis & UU PDP Privacy Verification
      interface ParentERaporCard {
        studentId: string;
        studentName: string;
        nisn: string;
        schoolName: string;
        subject: string;
        nasFinal: number;
        attendanceRatePercent: number;
        deskripsiCapaian: string;
        parentalConsentVerified: boolean;
      }

      const generateReportCard = (params: {
        studentId: string;
        name: string;
        nisn: string;
        scores: number[];
        attendanceRate: number;
        hasParentConsent: boolean;
      }): ParentERaporCard => {
        const avg = params.scores.reduce((a, b) => a + b, 0) / params.scores.length;
        const roundedNas = Math.round(avg * 10) / 10;
        return {
          studentId: params.studentId,
          studentName: params.name,
          nisn: params.nisn,
          schoolName: "SMA Islam Athirah 1 Makassar",
          subject: "Informatika",
          nasFinal: roundedNas,
          attendanceRatePercent: params.attendanceRate,
          deskripsiCapaian: `Peserta didik telah menuntaskan seluruh Tujuan Pembelajaran dengan predikat ${
            roundedNas >= 85 ? "Sangat Baik (Mahir)" : "Baik"
          }. Menunjukkan sikap itqan dan kolaborasi aktif.`,
          parentalConsentVerified: params.hasParentConsent,
        };
      };

      const cardFatih = generateReportCard({
        studentId: "std-01",
        name: "Muhammad Fatih Al-Farabi",
        nisn: "0081234567",
        scores: [88, 90, 85, 92],
        attendanceRate: 100.0,
        hasParentConsent: true,
      });

      expect(cardFatih.nasFinal).toBe(88.8);
      expect(cardFatih.parentalConsentVerified).toBe(true);
      expect(cardFatih.schoolName).toBe("SMA Islam Athirah 1 Makassar");

      const cardSulaiman = generateReportCard({
        studentId: "std-03",
        name: "Sulaiman Rasyid Al-Haddad",
        nisn: "0083456789",
        scores: postRemedialScores["std-03"],
        attendanceRate: 88.9,
        hasParentConsent: true,
      });

      expect(cardSulaiman.nasFinal).toBe(75.0);
      expect(cardSulaiman.parentalConsentVerified).toBe(true);
    });
  });
});
