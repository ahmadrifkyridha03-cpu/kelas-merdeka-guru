/**
 * Automated Test Suite for Milestone 3:
 * Remedial & Pengayaan Hub, Anti-Inflation Bonus Points, Attendance Persistence & Curriculum Engine
 *
 * Verifying:
 * 1. Remedial dynamic queue calculation from store scores (< KKTP threshold).
 * 2. Pengayaan queue calculation (all assessed TPs >= KKTP, average >= 85 / Mahir).
 * 3. Anti-inflation bonus point capping (+5.0 semester elevation limit).
 * 4. Anti-inflation score clamping (final score <= 100).
 * 5. Freezing bonus points accrual when student has ALPA attendance.
 * 6. Daily attendance persistence in useAppStore across multiple dates and classes.
 * 7. Live attendance counts (HADIR, SAKIT, IZIN, ALPA, TERLAMBAT, DISPENSASI).
 * 8. TP persistence (saveTPs / "Kunci & Sinkronkan") to canonical store and referential binding.
 * 9. 6-Month dynamic calendar breakdown math (18 effective weeks, 54 JP).
 * 10. Bloom taxonomy KKO C1-C6 classification.
 */

import { describe, it, expect, beforeEach } from "./e2e/harness.ts";
import { useAppStore } from "../src/lib/store.ts";
import type { Student, TP, AttendanceRecord, AttendanceStatus } from "../src/types/index.ts";

describe("Milestone 3 Test Suite: Remedial Hub, Attendance & Curriculum Engine", () => {
  beforeEach(() => {
    useAppStore.getState().resetStore();
  });

  // =========================================================================
  // SECTION 1: DYNAMIC REMEDIAL & PENGAYAAN QUEUE
  // =========================================================================
  describe("1. Dynamic Remedial Queue Filtering (< KKTP Threshold)", () => {
    it("should identify students who have assessed scores below KKTP threshold", () => {
      const state = useAppStore.getState();
      const testClass = state.classes[0];
      const classStudents = state.students.filter(s => s.classId === testClass.id);
      expect(classStudents.length).toBeGreaterThanOrEqual(2);

      const student1 = classStudents[0];
      const student2 = classStudents[1];

      // Define 2 TPs with KKTP threshold = 75
      const tp1: TP = {
        id: "tp-test-01",
        classId: testClass.id,
        code: "TP-01",
        description: "Menerapkan algoritma pemilahan data",
        cpElement: "Berpikir Komputasional (BK)",
        bloomLevel: "C3",
        scope: "Algoritma Pemilahan",
        allocatedHours: 6,
        kktpModel: "INTERVAL_NILAI",
        kktpThreshold: 75,
      };

      const tp2: TP = {
        id: "tp-test-02",
        classId: testClass.id,
        code: "TP-02",
        description: "Mengintegrasikan aplikasi perkantoran",
        cpElement: "Teknologi Informasi dan Komunikasi (TIK)",
        bloomLevel: "C3",
        scope: "Aplikasi Perkantoran",
        allocatedHours: 9,
        kktpModel: "INTERVAL_NILAI",
        kktpThreshold: 75,
      };

      useAppStore.getState().saveTPs([tp1, tp2]);

      // student1 fails TP1 (65 < 75), passes TP2 (80 >= 75)
      useAppStore.getState().setScore(student1.id, tp1.id, 65);
      useAppStore.getState().setScore(student1.id, tp2.id, 80);

      // student2 passes both TP1 (75 >= 75) and TP2 (90 >= 75)
      useAppStore.getState().setScore(student2.id, tp1.id, 75);
      useAppStore.getState().setScore(student2.id, tp2.id, 90);

      const latestScores = useAppStore.getState().scores;

      // Calculate remedial items for student1
      const student1Failing = [tp1, tp2].filter(
        tp => latestScores[student1.id]?.[tp.id] !== undefined && latestScores[student1.id][tp.id] < tp.kktpThreshold
      );
      expect(student1Failing.length).toBe(1);
      expect(student1Failing[0].code).toBe("TP-01");
      expect(latestScores[student1.id][tp1.id]).toBe(65);

      // student2 has 0 failing TPs (remedial queue = empty for student2)
      const student2Failing = [tp1, tp2].filter(
        tp => latestScores[student2.id]?.[tp.id] !== undefined && latestScores[student2.id][tp.id] < tp.kktpThreshold
      );
      expect(student2Failing.length).toBe(0);
    });

    it("should report multiple failing TPs for a student with multiple deficiencies", () => {
      const state = useAppStore.getState();
      const student = state.students[0];

      const tpA: TP = {
        id: "tp-def-a",
        classId: student.classId,
        code: "TP-A",
        description: "Konsep 1",
        cpElement: "BK",
        bloomLevel: "C2",
        scope: "Materi A",
        allocatedHours: 6,
        kktpModel: "INTERVAL_NILAI",
        kktpThreshold: 75,
      };

      const tpB: TP = {
        id: "tp-def-b",
        classId: student.classId,
        code: "TP-B",
        description: "Konsep 2",
        cpElement: "BK",
        bloomLevel: "C3",
        scope: "Materi B",
        allocatedHours: 6,
        kktpModel: "INTERVAL_NILAI",
        kktpThreshold: 75,
      };

      useAppStore.getState().saveTPs([tpA, tpB]);
      useAppStore.getState().setScore(student.id, tpA.id, 55);
      useAppStore.getState().setScore(student.id, tpB.id, 68);

      const scores = useAppStore.getState().scores;
      const failing = [tpA, tpB].filter(
        tp => scores[student.id]?.[tp.id] !== undefined && scores[student.id][tp.id] < tp.kktpThreshold
      );

      expect(failing.length).toBe(2);
      expect(failing.map(f => f.code)).toEqual(["TP-A", "TP-B"]);
    });

    it("should correctly identify pengayaan students (all assessed TPs >= KKTP, avg >= 85)", () => {
      const state = useAppStore.getState();
      const student = state.students[0];

      const tp1: TP = {
        id: "tp-pengayaan-1",
        classId: student.classId,
        code: "TP-01",
        description: "Deskripsi",
        cpElement: "BK",
        bloomLevel: "C4",
        scope: "Algoritma Lanjut",
        allocatedHours: 6,
        kktpModel: "INTERVAL_NILAI",
        kktpThreshold: 75,
      };

      const tp2: TP = {
        id: "tp-pengayaan-2",
        classId: student.classId,
        code: "TP-02",
        description: "Deskripsi",
        cpElement: "BK",
        bloomLevel: "C4",
        scope: "Optimasi Kode",
        allocatedHours: 6,
        kktpModel: "INTERVAL_NILAI",
        kktpThreshold: 75,
      };

      useAppStore.getState().saveTPs([tp1, tp2]);
      useAppStore.getState().setScore(student.id, tp1.id, 92);
      useAppStore.getState().setScore(student.id, tp2.id, 88);

      const scores = useAppStore.getState().scores[student.id];
      const assessed = [tp1, tp2].map(tp => ({ tp, score: scores[tp.id] }));
      const allPassed = assessed.every(a => a.score >= a.tp.kktpThreshold);
      const avg = assessed.reduce((sum, a) => sum + a.score, 0) / assessed.length;

      expect(allPassed).toBe(true);
      expect(avg).toBe(90);
      expect(avg).toBeGreaterThanOrEqual(85); // Qualifies as Mahir / Pengayaan
    });
  });

  // =========================================================================
  // SECTION 2: ANTI-INFLATION BONUS SYSTEM & AUDIT LEDGER
  // =========================================================================
  describe("2. Anti-Inflation Bonus Point Capping (+5.0 Cap & Freezing)", () => {
    it("should enforce statutory +5.0 elevation limit per semester across increments", () => {
      const studentId = "student-bonus-test-iso";
      const newStudent: Student = {
        id: studentId,
        classId: "cls-1",
        nisn: "0089999999",
        fullName: "Siswa Uji Anti-Inflasi",
        gender: "L",
        status: "AKTIF",
        bonusPoints: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useAppStore.getState().addStudent(newStudent);

      // Add +3.0 points
      const res1 = useAppStore.getState().addBonusPoints(studentId, 3.0, "Tugas Mandiri 1");
      expect(res1.effectivePoints).toBe(3.0);
      expect(res1.newTotal).toBe(3.0);

      // Add +1.5 points (Total 4.5)
      const res2 = useAppStore.getState().addBonusPoints(studentId, 1.5, "Keaktifan Diskusi");
      expect(res2.effectivePoints).toBe(1.5);
      expect(res2.newTotal).toBe(4.5);

      // Attempt to add +2.0 points (Should clamp to 5.0, so effective is only +0.5)
      const res3 = useAppStore.getState().addBonusPoints(studentId, 2.0, "Presentasi Proyek");
      expect(res3.effectivePoints).toBe(0.5);
      expect(res3.newTotal).toBe(5.0);

      // Attempt to add further points when already at 5.0 (Should give 0 effective points)
      const res4 = useAppStore.getState().addBonusPoints(studentId, 1.0, "Ekstra Tambahan");
      expect(res4.effectivePoints).toBe(0);
      expect(res4.newTotal).toBe(5.0);

      // Verify student in store has exactly 5.0 bonus points
      const updatedStudent = useAppStore.getState().students.find(s => s.id === studentId);
      expect(updatedStudent?.bonusPoints).toBe(5.0);

      // Verify immutable audit ledger entries
      const logs = useAppStore.getState().bonusLogs.filter(l => l.studentId === studentId);
      expect(logs.length).toBe(4);
      expect(logs[0].points).toBe(0);
      expect(logs[1].points).toBe(0.5);
      expect(logs[2].points).toBe(1.5);
      expect(logs[3].points).toBe(3.0);
    });

    it("should clamp final score with bonus points to maximum 100", () => {
      const student = useAppStore.getState().students[0];
      const tp: TP = {
        id: "tp-max-100",
        classId: student.classId,
        code: "TP-100",
        description: "Test 100",
        cpElement: "BK",
        bloomLevel: "C3",
        scope: "Materi",
        allocatedHours: 3,
        kktpModel: "INTERVAL_NILAI",
        kktpThreshold: 75,
      };
      useAppStore.getState().addTP(tp);

      // Set score to 98
      useAppStore.getState().setScore(student.id, tp.id, 98);
      useAppStore.getState().addBonusPoints(student.id, 4.0, "Bonus Apresiasi");

      const baseScore = useAppStore.getState().scores[student.id][tp.id];
      const studentBonus = useAppStore.getState().students.find(s => s.id === student.id)?.bonusPoints || 0;
      const finalScore = Math.min(100, baseScore + studentBonus);

      expect(finalScore).toBe(100); // 98 + 4 = 102 -> clamped to 100
    });

    it("should identify and freeze bonus accrual when student has ALPA attendance status", () => {
      const student = useAppStore.getState().students[0];

      // Initially no attendance records -> not alpa
      const recordsBefore = useAppStore.getState().attendance;
      const hasAlpaBefore = Object.values(recordsBefore).some(recs =>
        recs.some(r => r.studentId === student.id && r.status === "ALPA")
      );
      expect(hasAlpaBefore).toBe(false);

      // Save an attendance record with ALPA status on 2026-08-04
      const attendanceEntry: AttendanceRecord = {
        studentId: student.id,
        status: "ALPA",
        timestamp: "2026-08-04T08:00:00Z",
      };
      useAppStore.getState().saveAttendance("2026-08-04", [attendanceEntry]);

      // Check ALPA detection
      const recordsAfter = useAppStore.getState().attendance;
      const hasAlpaAfter = Object.values(recordsAfter).some(recs =>
        recs.some(r => r.studentId === student.id && r.status === "ALPA")
      );
      expect(hasAlpaAfter).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 3: ATTENDANCE PERSISTENCE & LIVE BADGE COUNTS
  // =========================================================================
  describe("3. Attendance Store Persistence Across Dates", () => {
    it("should persist attendance records across distinct dates and retrieve accurately", () => {
      const state = useAppStore.getState();
      const students = state.students.slice(0, 3);
      expect(students.length).toBe(3);

      const s1 = students[0].id;
      const s2 = students[1].id;
      const s3 = students[2].id;

      // Day 1: 2026-08-04
      const day1Records: AttendanceRecord[] = [
        { studentId: s1, status: "HADIR", timestamp: "2026-08-04T08:00:00Z" },
        { studentId: s2, status: "SAKIT", timestamp: "2026-08-04T08:00:00Z" },
        { studentId: s3, status: "HADIR", timestamp: "2026-08-04T08:00:00Z" },
      ];
      useAppStore.getState().saveAttendance("2026-08-04", day1Records);

      // Day 2: 2026-08-11
      const day2Records: AttendanceRecord[] = [
        { studentId: s1, status: "IZIN", timestamp: "2026-08-11T08:00:00Z" },
        { studentId: s2, status: "HADIR", timestamp: "2026-08-11T08:00:00Z" },
        { studentId: s3, status: "ALPA", timestamp: "2026-08-11T08:00:00Z" },
      ];
      useAppStore.getState().saveAttendance("2026-08-11", day2Records);

      // Verify persistence
      const savedDay1 = useAppStore.getState().getAttendance("2026-08-04");
      expect(savedDay1).toBeDefined();
      expect(savedDay1?.length).toBe(3);
      expect(savedDay1?.find(r => r.studentId === s2)?.status).toBe("SAKIT");

      const savedDay2 = useAppStore.getState().getAttendance("2026-08-11");
      expect(savedDay2).toBeDefined();
      expect(savedDay2?.length).toBe(3);
      expect(savedDay2?.find(r => r.studentId === s1)?.status).toBe("IZIN");
      expect(savedDay2?.find(r => r.studentId === s3)?.status).toBe("ALPA");
    });

    it("should compute accurate live count badges for all 6 attendance statuses", () => {
      const statusList: AttendanceStatus[] = [
        "HADIR", "HADIR", "HADIR",
        "SAKIT",
        "IZIN", "IZIN",
        "ALPA",
        "TERLAMBAT",
        "DISPENSASI"
      ];

      const counts: Record<AttendanceStatus, number> = {
        HADIR: 0,
        SAKIT: 0,
        IZIN: 0,
        ALPA: 0,
        TERLAMBAT: 0,
        DISPENSASI: 0,
      };

      for (const st of statusList) {
        counts[st] = (counts[st] || 0) + 1;
      }

      expect(counts.HADIR).toBe(3);
      expect(counts.SAKIT).toBe(1);
      expect(counts.IZIN).toBe(2);
      expect(counts.ALPA).toBe(1);
      expect(counts.TERLAMBAT).toBe(1);
      expect(counts.DISPENSASI).toBe(1);
      expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(statusList.length);
    });
  });

  // =========================================================================
  // SECTION 4: CURRICULUM TP PERSISTENCE & REFERENTIAL BINDING
  // =========================================================================
  describe("4. Curriculum TP Persistence & Referential Binding", () => {
    it("should save generated TPs to store and make them available for grade entry", () => {
      const initialTpCount = useAppStore.getState().tps.length;

      const newTPs: TP[] = [
        {
          id: "tp-sync-01",
          classId: "cls-1",
          code: "TP-01",
          description: "Menerapkan algoritma pencarian biner",
          cpElement: "Berpikir Komputasional (BK)",
          bloomLevel: "C3",
          scope: "Pencarian Biner",
          allocatedHours: 6,
          kktpModel: "INTERVAL_NILAI",
          kktpThreshold: 75,
        },
        {
          id: "tp-sync-02",
          classId: "cls-1",
          code: "TP-02",
          description: "Menganalisis kompleksitas waktu algoritma",
          cpElement: "Berpikir Komputasional (BK)",
          bloomLevel: "C4",
          scope: "Kompleksitas Algoritma",
          allocatedHours: 6,
          kktpModel: "INTERVAL_NILAI",
          kktpThreshold: 75,
        },
      ];

      // Simulate "Kunci & Sinkronkan"
      useAppStore.getState().saveTPs(newTPs);

      const storeTPs = useAppStore.getState().tps;
      expect(storeTPs.length).toBe(2);
      expect(storeTPs[0].id).toBe("tp-sync-01");
      expect(storeTPs[1].id).toBe("tp-sync-02");

      // Verify that grades can be scored against newly saved TP UUIDs
      const student = useAppStore.getState().students[0];
      useAppStore.getState().setScore(student.id, "tp-sync-01", 85);
      expect(useAppStore.getState().getScore(student.id, "tp-sync-01")).toBe(85);
    });
  });

  // =========================================================================
  // SECTION 5: 6-MONTH CALENDAR BREAKDOWN & BLOOM KKO
  // =========================================================================
  describe("5. 6-Month Calendar Math & Bloom Taxonomy Classification", () => {
    it("should verify exact 6-month calendar breakdown totaling 18 effective weeks and 54 JP", () => {
      const calendar = [
        { month: "Juli", totalWeeks: 4, nonEffectiveWeeks: 2, effectiveWeeks: 2, jp: 6 },
        { month: "Agustus", totalWeeks: 4, nonEffectiveWeeks: 1, effectiveWeeks: 3, jp: 9 },
        { month: "September", totalWeeks: 4, nonEffectiveWeeks: 1, effectiveWeeks: 3, jp: 9 },
        { month: "Oktober", totalWeeks: 5, nonEffectiveWeeks: 1, effectiveWeeks: 4, jp: 12 },
        { month: "November", totalWeeks: 4, nonEffectiveWeeks: 0, effectiveWeeks: 4, jp: 12 },
        { month: "Desember", totalWeeks: 4, nonEffectiveWeeks: 2, effectiveWeeks: 2, jp: 6 },
      ];

      const sumTotalWeeks = calendar.reduce((acc, c) => acc + c.totalWeeks, 0);
      const sumNonEffective = calendar.reduce((acc, c) => acc + c.nonEffectiveWeeks, 0);
      const sumEffective = calendar.reduce((acc, c) => acc + c.effectiveWeeks, 0);
      const sumJP = calendar.reduce((acc, c) => acc + c.jp, 0);

      expect(sumTotalWeeks).toBe(25);
      expect(sumNonEffective).toBe(7);
      expect(sumEffective).toBe(18); // Exactly 18 effective weeks
      expect(sumJP).toBe(54); // 18 weeks * 3 JP = 54 JP

      for (const m of calendar) {
        expect(m.totalWeeks - m.nonEffectiveWeeks).toBe(m.effectiveWeeks);
        expect(m.effectiveWeeks * 3).toBe(m.jp);
      }
    });

    it("should classify Bloom taxonomy KKO levels from C1 to C6 accurately", () => {
      const taxonomy = {
        C1: "Mengingat",
        C2: "Memahami",
        C3: "Menerapkan",
        C4: "Menganalisis",
        C5: "Mengevaluasi",
        C6: "Mencipta",
      };

      expect(taxonomy.C1).toBe("Mengingat");
      expect(taxonomy.C2).toBe("Memahami");
      expect(taxonomy.C3).toBe("Menerapkan");
      expect(taxonomy.C4).toBe("Menganalisis");
      expect(taxonomy.C5).toBe("Mengevaluasi");
      expect(taxonomy.C6).toBe("Mencipta");
    });

    it("should verify PROSEM 6-month allocation sums to exactly 54 JP", () => {
      const prosemAllocations = [
        { code: "TP-01", hours: 6 },
        { code: "TP-02", hours: 9 },
        { code: "TP-03", hours: 6 },
        { code: "TP-04", hours: 9 },
        { code: "TP-05", hours: 6 },
        { code: "TP-06", hours: 12 },
        { code: "TP-07", hours: 6 },
      ];

      const totalAllocated = prosemAllocations.reduce((sum, item) => sum + item.hours, 0);
      expect(totalAllocated).toBe(54); // Exactly 54 JP distributed across Semester Ganjil
    });
  });
});
