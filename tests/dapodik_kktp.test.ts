/**
 * Comprehensive Automated Tests for Dapodik Parser/Exporter & KKTP Multi-Model Engine
 * Strictly verifying:
 * - RFC 4180 quotation & academic titles
 * - Delimiter auto-detection (comma, semicolon, tab)
 * - Leading zero preservation ("0081234567")
 * - Excel binary (.xlsx) import & export roundtrip
 * - Flexible NISN for early grades
 * - KKTP Description checklist model (0, 1-2, 3, 4 criteria)
 * - KKTP Rubric 4-tier model (levels 1-4 and percentages 0-100)
 * - KKTP Interval continuous boundary checks [0, 40], (40, 65], (65, 85], (85, 100]
 * - Unassessed TP average calculation (strictly ignoring unassessed cells)
 */

import { describe, it, expect } from "./e2e/harness.ts";
import {
  parseDapodikCSV,
  parseDapodikExcel,
  exportRosterToCSV,
  exportRosterToExcel,
  detectDelimiter,
  normalizeGender,
} from "../src/lib/dapodik.ts";
import {
  evaluateKKTP,
  evaluateDeskripsiKKTP,
  evaluateRubrikKKTP,
  evaluateIntervalKKTP,
  evaluateScoreAgainstThreshold,
  calculateStudentAverage,
} from "../src/lib/kktp.ts";
import {
  VALID_DAPODIK_CSV,
  SEMICOLON_DAPODIK_CSV,
  BOM_QUOTED_DAPODIK_CSV,
  MISSING_NISN_DAPODIK_CSV,
  MALFORMED_ROWS_DAPODIK_CSV,
} from "./e2e/fixtures.ts";
import type { Student } from "../src/types/index.ts";

describe("Milestone 2 Test Suite: Dapodik Roster & KKTP Engine", () => {
  // =========================================================================
  // SECTION 1: DAPODIK PARSER & EXPORTER
  // =========================================================================
  describe("1. Dapodik Delimiter Sniffing & Header Normalization", () => {
    it("should accurately detect comma, semicolon, and tab delimiters", () => {
      expect(detectDelimiter("No,Nama,NISN,Gender")).toBe(",");
      expect(detectDelimiter("No;Nama;NISN;Gender")).toBe(";");
      expect(detectDelimiter("No\tNama\tNISN\tGender")).toBe("\t");
      expect(detectDelimiter('No;"Nama, S.Pd.";NISN;Gender')).toBe(";");
    });

    it("should normalize gender to L or P", () => {
      expect(normalizeGender("L")).toBe("L");
      expect(normalizeGender("Laki-laki")).toBe("L");
      expect(normalizeGender("P")).toBe("P");
      expect(normalizeGender("Perempuan")).toBe("P");
      expect(normalizeGender("Wanita")).toBe("P");
      expect(normalizeGender("")).toBe("L");
    });
  });

  describe("2. Dapodik CSV Parsing & Leading Zero Preservation", () => {
    it("should parse valid comma-separated Dapodik CSV and preserve 10-digit leading zero NISN", () => {
      const res = parseDapodikCSV(VALID_DAPODIK_CSV, "cls-101");
      expect(res.success).toBe(true);
      expect(res.errors).toHaveLength(0);
      expect(res.students).toHaveLength(5);

      const s1 = res.students[0];
      expect(s1.fullName).toBe("Muhammad Fatih Al-Farabi");
      expect(s1.nisn).toBe("0081234567"); // Strict leading zero preservation
      expect(typeof s1.nisn).toBe("string");
      expect(s1.nis).toBe("23001");
      expect(s1.gender).toBe("L");
      expect(s1.classId).toBe("cls-101");

      const s2 = res.students[1];
      expect(s2.fullName).toBe("Aisyah Putri Humaira");
      expect(s2.nisn).toBe("0082345678");
      expect(s2.gender).toBe("P");
    });

    it("should parse semicolon-separated Dapodik CSV (Indonesian Excel default)", () => {
      const res = parseDapodikCSV(SEMICOLON_DAPODIK_CSV, "cls-102");
      expect(res.success).toBe(true);
      expect(res.students).toHaveLength(2);
      expect(res.students[0].nisn).toBe("0081234567");
      expect(res.students[1].nisn).toBe("0082345678");
    });

    it("should strip UTF-8 Byte Order Mark (BOM) and preserve quoted commas with titles", () => {
      const res = parseDapodikCSV(BOM_QUOTED_DAPODIK_CSV, "cls-103");
      expect(res.success).toBe(true);
      expect(res.students).toHaveLength(2);

      const s1 = res.students[0];
      expect(s1.fullName).toBe("Farhan Al-Kautsar, S.Kom.");
      expect(s1.nisn).toBe("0089876543");
      expect(s1.gender).toBe("L");

      const s2 = res.students[1];
      expect(s2.fullName).toBe("Nadia Zulfa");
      expect(s2.gender).toBe("P");
    });

    it("should gracefully handle tab-delimited rosters", () => {
      const tabRoster = "No\tNama Peserta Didik\tNISN\tNIS\tJenis Kelamin\n1\tHasan Basri\t0087766554\t24001\tL\n2\tNur Halimah\t0087766555\t24002\tP";
      const res = parseDapodikCSV(tabRoster, "cls-tab");
      expect(res.success).toBe(true);
      expect(res.students).toHaveLength(2);
      expect(res.students[0].fullName).toBe("Hasan Basri");
      expect(res.students[0].nisn).toBe("0087766554");
    });

    it("should handle missing NISN on early grade cohorts and issue warnings", () => {
      const res = parseDapodikCSV(MISSING_NISN_DAPODIK_CSV, "cls-early");
      expect(res.success).toBe(true);
      expect(res.students).toHaveLength(2);

      expect(res.students[0].fullName).toBe("Ahmad Newbie SD");
      expect(res.students[0].isPendingNisn).toBe(true);
      expect(res.students[0].nisn).toContain("PENDING");

      expect(res.students[1].fullName).toBe("Siti Murid Baru");
      expect(res.students[1].isPendingNisn).toBe(true);
      expect(res.warnings.length).toBeGreaterThanOrEqual(2);
    });

    it("should isolate malformed rows with fewer than required columns and warn cleanly", () => {
      const res = parseDapodikCSV(MALFORMED_ROWS_DAPODIK_CSV, "cls-malformed");
      expect(res.success).toBe(true);
      expect(res.students).toHaveLength(2);
      expect(res.students[0].fullName).toBe("Murid Valid");
      expect(res.students[1].fullName).toBe("Murid Valid Kedua");
      expect(res.warnings.length).toBeGreaterThanOrEqual(1);
    });

    it("should return clean errors when file is empty or missing required columns", () => {
      const emptyRes = parseDapodikCSV("", "cls-empty");
      expect(emptyRes.success).toBe(false);
      expect(emptyRes.errors.length).toBeGreaterThan(0);

      const noHeaderRes = parseDapodikCSV("ColA,ColB,ColC\n1,2,3", "cls-no-header");
      expect(noHeaderRes.success).toBe(false);
      expect(noHeaderRes.errors[0]).toContain("Nama Peserta Didik");
    });
  });

  describe("3. Dapodik Excel (.xlsx) Import & Export Roundtrip", () => {
    it("should export students to Excel buffer and re-parse them with leading zeros preserved", () => {
      const sampleStudents: Student[] = [
        {
          id: "std-test-1",
          classId: "cls-x",
          nisn: "0081122334",
          nis: "24101",
          fullName: "Fatih Rabbani, S.T.",
          gender: "L",
          specialNeeds: "Berbakat Istimewa",
          status: "AKTIF",
          bonusPoints: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "std-test-2",
          classId: "cls-x",
          nisn: "0089988776",
          nis: "24102",
          fullName: "Zahra Salsabila",
          gender: "P",
          status: "AKTIF",
          bonusPoints: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Export to Excel
      const excelBytes = exportRosterToExcel(sampleStudents, "Kelas_X_Informatika");
      expect(excelBytes).toBeDefined();
      expect(excelBytes.byteLength).toBeGreaterThan(100);

      // Re-parse exported Excel buffer
      const parseBack = parseDapodikExcel(excelBytes, "cls-x");
      expect(parseBack.success).toBe(true);
      expect(parseBack.students).toHaveLength(2);

      expect(parseBack.students[0].fullName).toBe("Fatih Rabbani, S.T.");
      expect(parseBack.students[0].nisn).toBe("0081122334"); // Strict leading zero preservation
      expect(parseBack.students[0].gender).toBe("L");

      expect(parseBack.students[1].fullName).toBe("Zahra Salsabila");
      expect(parseBack.students[1].nisn).toBe("0089988776");
      expect(parseBack.students[1].gender).toBe("P");
    });

    it("should export roster to RFC 4180 CSV with quotes for names with titles/commas", () => {
      const sampleStudents: Student[] = [
        {
          id: "std-csv-1",
          classId: "cls-csv",
          nisn: "0085544332",
          fullName: "Drs. Syukri, M.Pd.",
          gender: "L",
          status: "AKTIF",
          bonusPoints: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const csvOutput = exportRosterToCSV(sampleStudents, "X-A");
      expect(csvOutput).toContain('"Drs. Syukri, M.Pd."');
      expect(csvOutput).toContain("0085544332");
    });
  });

  // =========================================================================
  // SECTION 2: KKTP MULTI-MODEL ENGINE
  // =========================================================================
  describe("4. KKTP Model 1: Deskripsi / Checklist", () => {
    it("should evaluate 4 out of 4 criteria as TUNTAS (Sangat Baik)", () => {
      const res = evaluateDeskripsiKKTP([true, true, true, true]);
      expect(res.isMastered).toBe(true);
      expect(res.status).toBe("TUNTAS");
      expect(res.tierLabel).toContain("Sangat Baik");
      expect(res.intervention).toContain("Tidak perlu remedial");
    });

    it("should evaluate 3 out of 4 criteria as TUNTAS (Baik)", () => {
      const res = evaluateDeskripsiKKTP([true, true, true, false]);
      expect(res.isMastered).toBe(true);
      expect(res.status).toBe("TUNTAS");
      expect(res.tierLabel).toContain("Baik");
      expect(res.recommendation).toContain("3/4");
    });

    it("should evaluate 1-2 out of 4 criteria as BELUM TUNTAS with partial remedial recommendation", () => {
      const res2 = evaluateDeskripsiKKTP([true, true, false, false]);
      expect(res2.isMastered).toBe(false);
      expect(res2.status).toBe("PERLU_BIMBINGAN");
      expect(res2.intervention).toContain("remedial khusus pada 2 kriteria");

      const res1 = evaluateDeskripsiKKTP([true, false, false, false]);
      expect(res1.isMastered).toBe(false);
      expect(res1.status).toBe("PERLU_BIMBINGAN");
    });

    it("should evaluate 0 criteria as BELUM TUNTAS with full intervention recommendation", () => {
      const res0 = evaluateDeskripsiKKTP([false, false, false, false]);
      expect(res0.isMastered).toBe(false);
      expect(res0.status).toBe("PERLU_BIMBINGAN");
      expect(res0.tierLabel).toBe("Perlu Bimbingan Penuh");
      expect(res0.intervention).toContain("penuh di seluruh bagian");
    });
  });

  describe("5. KKTP Model 2: Rubrik 4-Level Scale", () => {
    it("should evaluate Tier 1 (Baru Berkembang / Skor 0-60) as PERLU_BIMBINGAN", () => {
      const rLevel1 = evaluateRubrikKKTP(1);
      expect(rLevel1.isMastered).toBe(false);
      expect(rLevel1.status).toBe("PERLU_BIMBINGAN");
      expect(rLevel1.levelName).toBe("Baru Berkembang");

      const rScore55 = evaluateRubrikKKTP(55);
      expect(rScore55.tier).toBe(1);
      expect(rScore55.isMastered).toBe(false);
      expect(rScore55.status).toBe("PERLU_BIMBINGAN");
    });

    it("should evaluate Tier 2 (Layak / Skor 61-74) as PERLU_BIMBINGAN", () => {
      const rLevel2 = evaluateRubrikKKTP(2);
      expect(rLevel2.isMastered).toBe(false);
      expect(rLevel2.status).toBe("PERLU_BIMBINGAN");
      expect(rLevel2.levelName).toBe("Layak");

      const rScore70 = evaluateRubrikKKTP(70);
      expect(rScore70.tier).toBe(2);
      expect(rScore70.isMastered).toBe(false);
    });

    it("should evaluate Tier 3 (Cakap / Skor 75-85) as TUNTAS", () => {
      const rLevel3 = evaluateRubrikKKTP(3);
      expect(rLevel3.isMastered).toBe(true);
      expect(rLevel3.status).toBe("TUNTAS");
      expect(rLevel3.levelName).toBe("Cakap");

      const rScore80 = evaluateRubrikKKTP(80);
      expect(rScore80.tier).toBe(3);
      expect(rScore80.isMastered).toBe(true);
    });

    it("should evaluate Tier 4 (Mahir / Skor 86-100) as PENGAYAAN", () => {
      const rLevel4 = evaluateRubrikKKTP(4);
      expect(rLevel4.isMastered).toBe(true);
      expect(rLevel4.status).toBe("PENGAYAAN");
      expect(rLevel4.levelName).toBe("Mahir");

      const rScore92 = evaluateRubrikKKTP(92);
      expect(rScore92.tier).toBe(4);
      expect(rScore92.isMastered).toBe(true);
      expect(rScore92.status).toBe("PENGAYAAN");
    });
  });

  describe("6. KKTP Model 3: Continuous Piecewise Half-Open Interval", () => {
    it("should classify continuous partition boundaries [0, 40], (40, 65], (65, 85], (85, 100] without gaps", () => {
      // 0.0 -> Tier 1
      const s0 = evaluateIntervalKKTP(0.0);
      expect(s0.status).toBe("PERLU_BIMBINGAN");
      expect(s0.tierLabel).toBe("Perlu Bimbingan Dasar");

      // 40.0 -> Tier 1 upper boundary
      const s40 = evaluateIntervalKKTP(40.0);
      expect(s40.status).toBe("PERLU_BIMBINGAN");
      expect(s40.tierLabel).toBe("Perlu Bimbingan Dasar");

      // 40.1 -> Tier 2 lower boundary
      const s40_1 = evaluateIntervalKKTP(40.1);
      expect(s40_1.status).toBe("PERLU_BIMBINGAN");
      expect(s40_1.tierLabel).toBe("Perlu Bimbingan Khusus");

      // 65.0 -> Tier 2 upper boundary
      const s65 = evaluateIntervalKKTP(65.0);
      expect(s65.status).toBe("PERLU_BIMBINGAN");
      expect(s65.tierLabel).toBe("Perlu Bimbingan Khusus");

      // 65.01 -> Tier 3 lower boundary (TUNTAS)
      const s65_01 = evaluateIntervalKKTP(65.01);
      expect(s65_01.isMastered).toBe(true);
      expect(s65_01.status).toBe("TUNTAS");
      expect(s65_01.tierLabel).toBe("Tuntas Standar");

      // 85.0 -> Tier 3 upper boundary (TUNTAS)
      const s85 = evaluateIntervalKKTP(85.0);
      expect(s85.isMastered).toBe(true);
      expect(s85.status).toBe("TUNTAS");

      // 85.1 -> Tier 4 lower boundary (PENGAYAAN)
      const s85_1 = evaluateIntervalKKTP(85.1);
      expect(s85_1.isMastered).toBe(true);
      expect(s85_1.status).toBe("PENGAYAAN");
      expect(s85_1.tierLabel).toContain("Pengayaan");

      // 100.0 -> Tier 4 upper boundary
      const s100 = evaluateIntervalKKTP(100.0);
      expect(s100.isMastered).toBe(true);
      expect(s100.status).toBe("PENGAYAAN");
    });

    it("should throw error when scores are out of statutory range [0, 100]", () => {
      expect(() => evaluateIntervalKKTP(-1)).toThrow("statutory range");
      expect(() => evaluateIntervalKKTP(101)).toThrow("statutory range");
    });

    it("should evaluate scores against custom thresholds", () => {
      const pass = evaluateScoreAgainstThreshold(78, 75);
      expect(pass.isMastered).toBe(true);
      expect(pass.delta).toBe(3);
      expect(pass.status).toBe("TUNTAS");

      const fail = evaluateScoreAgainstThreshold(70, 75);
      expect(fail.isMastered).toBe(false);
      expect(fail.delta).toBe(-5);
      expect(fail.status).toBe("PERLU_BIMBINGAN");

      const enrich = evaluateScoreAgainstThreshold(90, 75);
      expect(enrich.isMastered).toBe(true);
      expect(enrich.status).toBe("PENGAYAAN");
    });
  });

  describe("7. Unassessed TP Averaging Safety (Critical Bug Fix)", () => {
    it("should calculate average strictly across assessed TPs and ignore unassessed ones", () => {
      // Student only assessed on TP 1 (80) and TP 3 (90). TP 2 and TP 4 are unassessed.
      const scores = [80, undefined, 90, null];
      const result = calculateStudentAverage(scores);

      expect(result.hasScores).toBe(true);
      expect(result.assessedCount).toBe(2);
      expect(result.totalCount).toBe(4);
      expect(result.average).toBe(85.0); // (80 + 90) / 2 = 85.0, NOT 42.5!
    });

    it("should return null average and hasScores=false when student has 0 assessed TPs", () => {
      const scores = [undefined, null, undefined];
      const result = calculateStudentAverage(scores);

      expect(result.hasScores).toBe(false);
      expect(result.assessedCount).toBe(0);
      expect(result.average).toBeNull();
    });
  });

  describe("8. Universal evaluateKKTP Dispatcher", () => {
    it("should correctly dispatch to DESKRIPSI, RUBRIK, and INTERVAL models", () => {
      const desk = evaluateKKTP("DESKRIPSI", [true, true, true, true]);
      expect(desk.status).toBe("TUNTAS");

      const rub = evaluateKKTP("RUBRIK", 3);
      expect(rub.status).toBe("TUNTAS");

      const inter = evaluateKKTP("INTERVAL", 38);
      expect(inter.status).toBe("PERLU_BIMBINGAN");
    });
  });
});
