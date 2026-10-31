/**
 * Milestone 1 Empirical Stress Test Harness
 * Author: teamwork_challenger
 * Purpose: Adversarially stress-test Canonical Store & Server Actions
 */

import { describe, it, expect, beforeEach } from "./e2e/harness.ts";
import {
  useAppStore,
  getSavedClasses,
  saveClasses,
  getSavedStudents,
  saveStudents,
  getSavedTPs,
  saveTPs,
} from "../src/lib/store.ts";
import {
  generateTPFromCPAction,
  generateLessonPlanAndLKPDAction,
  generateRemedialTaskAction,
  generateAthirahModulAjarAction,
  getGeminiModel,
} from "../src/app/actions/geminiActions.ts";
import type { ClassItem, Student, TP, AttendanceRecord } from "../src/types/index.ts";

// ==========================================================================
// SECTION 1: CASCADING DELETIONS STRESS TESTS
// ==========================================================================
describe("Adversarial Cascading Deletions", () => {
  beforeEach(() => {
    useAppStore.getState().resetStore();
  });

  it("Stress 1.1: Complex multi-entity class deletion with shared attendance and scores", () => {
    const store = useAppStore.getState();

    const classA: ClassItem = {
      id: "cls-stress-A",
      teacherId: "teacher-1",
      name: "X-A (Fase E)",
      gradeLevel: 10,
      fase: "E",
      subjectName: "Informatika",
      teachingHoursPerWeek: 3,
      academicYearId: "ay-2026",
      semesterNumber: 1,
      studentCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const classB: ClassItem = {
      id: "cls-stress-B",
      teacherId: "teacher-1",
      name: "X-B (Fase E)",
      gradeLevel: 10,
      fase: "E",
      subjectName: "Informatika",
      teachingHoursPerWeek: 3,
      academicYearId: "ay-2026",
      semesterNumber: 1,
      studentCount: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.addClass(classA);
    store.addClass(classB);

    // Students in Class A
    const studentsA: Student[] = [1, 2, 3].map((i) => ({
      id: `std-A-${i}`,
      classId: classA.id,
      nisn: `001000000${i}`,
      fullName: `Siswa A${i}`,
      gender: "L",
      status: "AKTIF",
      bonusPoints: i,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Students in Class B
    const studentsB: Student[] = [1, 2].map((i) => ({
      id: `std-B-${i}`,
      classId: classB.id,
      nisn: `002000000${i}`,
      fullName: `Siswa B${i}`,
      gender: "P",
      status: "AKTIF",
      bonusPoints: 1.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    studentsA.forEach((s) => store.addStudent(s));
    studentsB.forEach((s) => store.addStudent(s));

    // TPs for Class A and B
    const tpA1: TP = {
      id: "tp-A-1",
      classId: classA.id,
      cpElement: "BK",
      code: "TP-A1",
      description: "Algoritma Pemilahan",
      bloomLevel: "C3",
      scope: "Sorting",
      allocatedHours: 6,
      kktpModel: "INTERVAL_NILAI",
      kktpThreshold: 75,
    };
    const tpA2: TP = {
      id: "tp-A-2",
      classId: classA.id,
      cpElement: "DSI",
      code: "TP-A2",
      description: "Etika Siber",
      bloomLevel: "C4",
      scope: "Cyber Ethics",
      allocatedHours: 3,
      kktpModel: "RUBRIK_SKALA",
      kktpThreshold: 75,
    };
    const tpB1: TP = {
      id: "tp-B-1",
      classId: classB.id,
      cpElement: "SK",
      code: "TP-B1",
      description: "Sistem Komputer",
      bloomLevel: "C4",
      scope: "Hardware & OS",
      allocatedHours: 6,
      kktpModel: "INTERVAL_NILAI",
      kktpThreshold: 75,
    };

    store.addTP(tpA1);
    store.addTP(tpA2);
    store.addTP(tpB1);

    // Populate scores across both classes
    store.setScore("std-A-1", tpA1.id, 92);
    store.setScore("std-A-1", tpA2.id, 88);
    store.setScore("std-A-2", tpA1.id, 70);
    store.setScore("std-A-3", tpA2.id, 65);

    store.setScore("std-B-1", tpB1.id, 84);
    store.setScore("std-B-2", tpB1.id, 90);

    // Populate bonus logs
    store.addBonusPoints("std-A-1", 1.5, "Diskusi Aktif Class A");
    store.addBonusPoints("std-B-1", 2.0, "Olimpiade Sains Class B");

    // Populate attendance: key with classId AND shared generic key
    store.saveAttendance(`date-2026-09-01_${classA.id}`, [
      { studentId: "std-A-1", status: "HADIR", timestamp: "2026-09-01T08:00:00Z" },
      { studentId: "std-A-2", status: "HADIR", timestamp: "2026-09-01T08:00:00Z" },
    ]);
    store.saveAttendance("meeting-general-all", [
      { studentId: "std-A-1", status: "HADIR", timestamp: "2026-09-01T08:00:00Z" },
      { studentId: "std-B-1", status: "HADIR", timestamp: "2026-09-01T08:00:00Z" },
      { studentId: "std-B-2", status: "HADIR", timestamp: "2026-09-01T08:00:00Z" },
    ]);

    // Set active class to classA
    store.setSelectedClassId(classA.id);
    expect(useAppStore.getState().selectedClassId).toBe(classA.id);

    // ====================================================================
    // EXECUTE ADVERSARIAL ACTION: Delete Class A
    // ====================================================================
    useAppStore.getState().deleteClass(classA.id);
    const postState = useAppStore.getState();

    // 1. Class A is removed; selectedClassId switched to another valid class
    expect(postState.classes.some((c) => c.id === classA.id)).toBe(false);
    expect(postState.classes.some((c) => c.id === classB.id)).toBe(true);
    expect(postState.selectedClassId).not.toBe(classA.id);
    expect(postState.classes.some((c) => c.id === postState.selectedClassId)).toBe(true);

    // 2. All students of Class A purged; Class B students untouched
    expect(postState.students.some((s) => s.classId === classA.id)).toBe(false);
    expect(postState.students.filter((s) => s.classId === classB.id).length).toBe(2);

    // 3. All TPs of Class A purged; Class B TPs untouched
    expect(postState.tps.some((t) => t.classId === classA.id)).toBe(false);
    expect(postState.tps.some((t) => t.id === tpB1.id)).toBe(true);

    // 4. Scores of Class A students are completely purged
    expect(postState.scores["std-A-1"]).toBeUndefined();
    expect(postState.scores["std-A-2"]).toBeUndefined();
    expect(postState.scores["std-A-3"]).toBeUndefined();

    // 5. Scores of Class B students are 100% intact
    expect(postState.scores["std-B-1"]?.[tpB1.id]).toBe(84);
    expect(postState.scores["std-B-2"]?.[tpB1.id]).toBe(90);

    // 6. Bonus logs for Class A purged; Class B preserved
    expect(postState.bonusLogs.some((b) => b.classId === classA.id)).toBe(false);
    expect(postState.bonusLogs.some((b) => b.studentId === "std-B-1")).toBe(true);

    // 7. Attendance keyed with classId removed
    expect(postState.attendance[`date-2026-09-01_${classA.id}`]).toBeUndefined();

    // 8. Shared attendance retains Class B students and purges Class A students
    const sharedRecords = postState.attendance["meeting-general-all"];
    expect(sharedRecords).toBeDefined();
    expect(sharedRecords.some((r) => r.studentId === "std-A-1")).toBe(false);
    expect(sharedRecords.some((r) => r.studentId === "std-B-1")).toBe(true);
    expect(sharedRecords.some((r) => r.studentId === "std-B-2")).toBe(true);
    expect(sharedRecords.length).toBe(2);
  });

  it("Stress 1.2: Student deletion strictly preserves peer students and decrements studentCount", () => {
    const store = useAppStore.getState();
    const cls = store.classes[0];
    const initialCount = cls.studentCount || 0;

    const targetStudent: Student = {
      id: "std-isolate-victim",
      classId: cls.id,
      nisn: "9988776655",
      fullName: "Victim Student",
      gender: "L",
      status: "AKTIF",
      bonusPoints: 2.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const peerStudent: Student = {
      id: "std-isolate-peer",
      classId: cls.id,
      nisn: "9988776656",
      fullName: "Peer Student",
      gender: "P",
      status: "AKTIF",
      bonusPoints: 1.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.addStudent(targetStudent);
    store.addStudent(peerStudent);

    const tp = store.tps[0];
    store.setScore(targetStudent.id, tp.id, 77);
    store.setScore(peerStudent.id, tp.id, 88);

    store.addBonusPoints(targetStudent.id, 1.0, "Victim Bonus");
    store.addBonusPoints(peerStudent.id, 1.0, "Peer Bonus");

    store.saveAttendance("meeting-peer-test", [
      { studentId: targetStudent.id, status: "HADIR", timestamp: "2026-09-01T08:00:00Z" },
      { studentId: peerStudent.id, status: "HADIR", timestamp: "2026-09-01T08:00:00Z" },
    ]);

    const countBefore = useAppStore.getState().classes.find((c) => c.id === cls.id)?.studentCount || 0;

    // EXECUTE: Delete target student
    store.deleteStudent(targetStudent.id);

    const after = useAppStore.getState();

    // Victim is gone
    expect(after.students.some((s) => s.id === targetStudent.id)).toBe(false);
    expect(after.scores[targetStudent.id]).toBeUndefined();
    expect(after.bonusLogs.some((b) => b.studentId === targetStudent.id)).toBe(false);

    // Peer is completely intact
    expect(after.students.some((s) => s.id === peerStudent.id)).toBe(true);
    expect(after.scores[peerStudent.id]?.[tp.id]).toBe(88);
    expect(after.bonusLogs.some((b) => b.studentId === peerStudent.id)).toBe(true);
    expect(after.attendance["meeting-peer-test"].length).toBe(1);
    expect(after.attendance["meeting-peer-test"][0].studentId).toBe(peerStudent.id);

    // studentCount accurately decremented
    const countAfter = after.classes.find((c) => c.id === cls.id)?.studentCount || 0;
    expect(countAfter).toBe(countBefore - 1);
  });

  it("Stress 1.3: TP deletion cleanly purges UUID across all students while preserving all other TP scores", () => {
    const store = useAppStore.getState();
    const clsId = store.classes[0].id;

    const tpAlpha: TP = {
      id: "tp-stress-alpha",
      classId: clsId,
      cpElement: "BK",
      code: "TP-ALPHA",
      description: "Computational Thinking",
      bloomLevel: "C3",
      scope: "CT",
      allocatedHours: 6,
      kktpModel: "INTERVAL_NILAI",
      kktpThreshold: 75,
    };
    const tpBeta: TP = {
      id: "tp-stress-beta",
      classId: clsId,
      cpElement: "AD",
      code: "TP-BETA",
      description: "Analisis Data",
      bloomLevel: "C4",
      scope: "AD",
      allocatedHours: 6,
      kktpModel: "INTERVAL_NILAI",
      kktpThreshold: 75,
    };
    const tpGamma: TP = {
      id: "tp-stress-gamma",
      classId: clsId,
      cpElement: "AP",
      code: "TP-GAMMA",
      description: "Algoritma Pemrograman",
      bloomLevel: "C5",
      scope: "AP",
      allocatedHours: 9,
      kktpModel: "INTERVAL_NILAI",
      kktpThreshold: 75,
    };

    store.addTP(tpAlpha);
    store.addTP(tpBeta);
    store.addTP(tpGamma);

    // Create 5 students registered in clsId and assign scores for all 3 TPs
    const studentIds = ["s-registered-1", "s-registered-2", "s-registered-3", "s-registered-4", "s-registered-5"];
    for (const sid of studentIds) {
      store.addStudent({
        id: sid,
        classId: clsId,
        nisn: `111000${sid}`,
        fullName: `Registered Student ${sid}`,
        gender: "L",
        status: "AKTIF",
        bonusPoints: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      store.setScore(sid, tpAlpha.id, 80);
      store.setScore(sid, tpBeta.id, 85);
      store.setScore(sid, tpGamma.id, 90);
    }

    // Verify scores present before deletion
    for (const sid of studentIds) {
      expect(useAppStore.getState().scores[sid][tpBeta.id]).toBe(85);
    }

    // EXECUTE: Delete TP Beta
    store.deleteTP(tpBeta.id);

    const after = useAppStore.getState();

    // TP Beta removed from tps array
    expect(after.tps.some((t) => t.id === tpBeta.id)).toBe(false);
    expect(after.tps.some((t) => t.id === tpAlpha.id)).toBe(true);
    expect(after.tps.some((t) => t.id === tpGamma.id)).toBe(true);

    // For all 5 students: tpBeta is purged, tpAlpha & tpGamma preserved
    for (const sid of studentIds) {
      expect(after.scores[sid][tpBeta.id]).toBeUndefined();
      expect(after.scores[sid][tpAlpha.id]).toBe(80);
      expect(after.scores[sid][tpGamma.id]).toBe(90);
    }
  });

  it("Stress 1.4: Deleting non-existent entities does not alter state or throw exceptions", () => {
    const store = useAppStore.getState();
    const initialStudentCount = store.students.length;
    const initialTPCount = store.tps.length;
    const initialClassCount = store.classes.length;

    // None of these should throw or corrupt state
    store.deleteClass("non-existent-class-id-9999");
    store.deleteStudent("non-existent-student-id-9999");
    store.deleteTP("non-existent-tp-id-9999");

    const after = useAppStore.getState();
    expect(after.students.length).toBe(initialStudentCount);
    expect(after.tps.length).toBe(initialTPCount);
    expect(after.classes.length).toBe(initialClassCount);
  });

  it("Stress 1.5: Total deletion of all classes resets selectedClassId to empty string gracefully", () => {
    const store = useAppStore.getState();
    const allClassIds = store.classes.map((c) => c.id);

    // Delete each class one by one
    for (const cid of allClassIds) {
      store.deleteClass(cid);
    }

    const after = useAppStore.getState();
    expect(after.classes.length).toBe(0);
    expect(after.selectedClassId).toBe("");
    expect(after.students.length).toBe(0);
    expect(after.tps.length).toBe(0);
    expect(Object.keys(after.scores).length).toBe(0);
  });

  it("Stress 1.6: High-volume batch stress (100 students, 20 TPs, 2000 scores)", () => {
    const store = useAppStore.getState();

    const batchClass: ClassItem = {
      id: "cls-batch-stress",
      teacherId: "teacher-batch",
      name: "XII-Stress High Volume",
      gradeLevel: 12,
      fase: "F",
      subjectName: "Informatika Lanjutan",
      teachingHoursPerWeek: 4,
      academicYearId: "ay-2026",
      semesterNumber: 1,
      studentCount: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.addClass(batchClass);

    // Generate 100 students
    const batchStudents: Student[] = [];
    for (let i = 1; i <= 100; i++) {
      batchStudents.push({
        id: `std-bulk-${i}`,
        classId: batchClass.id,
        nisn: `1000000000${i}`,
        fullName: `Bulk Student ${i}`,
        gender: i % 2 === 0 ? "L" : "P",
        status: "AKTIF",
        bonusPoints: (i % 50) / 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    batchStudents.forEach((s) => store.addStudent(s));

    // Generate 20 TPs
    const batchTPs: TP[] = [];
    for (let j = 1; j <= 20; j++) {
      batchTPs.push({
        id: `tp-bulk-${j}`,
        classId: batchClass.id,
        cpElement: "BK",
        code: `TP-BLK-${j}`,
        description: `Bulk TP ${j}`,
        bloomLevel: "C4",
        scope: `Scope ${j}`,
        allocatedHours: 4,
        kktpModel: "INTERVAL_NILAI",
        kktpThreshold: 75,
      });
    }
    batchTPs.forEach((t) => store.addTP(t));

    // Assign 100 * 20 = 2,000 scores
    for (let i = 1; i <= 100; i++) {
      for (let j = 1; j <= 20; j++) {
        store.setScore(`std-bulk-${i}`, `tp-bulk-${j}`, 70 + (i % 30));
      }
    }

    // Verify sample score
    expect(store.getScore("std-bulk-50", "tp-bulk-10")).toBe(90);

    // Delete a single TP out of 20
    store.deleteTP("tp-bulk-10");
    expect(useAppStore.getState().getScore("std-bulk-50", "tp-bulk-10")).toBeUndefined();
    expect(useAppStore.getState().getScore("std-bulk-50", "tp-bulk-11")).toBe(90);

    // Delete the entire high-volume class
    store.deleteClass(batchClass.id);
    const postBulkState = useAppStore.getState();

    expect(postBulkState.classes.some((c) => c.id === batchClass.id)).toBe(false);
    expect(postBulkState.students.some((s) => s.classId === batchClass.id)).toBe(false);
    expect(postBulkState.tps.some((t) => t.classId === batchClass.id)).toBe(false);
    expect(postBulkState.scores["std-bulk-50"]).toBeUndefined();
  });
});

// ==========================================================================
// SECTION 2: ANTI-INFLATION BONUS CAPPING STRESS TESTS
// ==========================================================================
describe("Adversarial Anti-Inflation Bonus Capping (+5.0 Cap & Bounds)", () => {
  beforeEach(() => {
    useAppStore.getState().resetStore();
  });

  it("Stress 2.1: Multi-stage stacking strictly clamps at +5.0 term ceiling", () => {
    const store = useAppStore.getState();
    const student = store.students[0];
    store.updateStudent({ ...student, bonusPoints: 0 });

    // Stage 1: +2.0
    const s1 = store.addBonusPoints(student.id, 2.0, "Aktivitas 1");
    expect(s1.effectivePoints).toBe(2.0);
    expect(s1.newTotal).toBe(2.0);

    // Stage 2: +2.5 -> total 4.5
    const s2 = store.addBonusPoints(student.id, 2.5, "Aktivitas 2");
    expect(s2.effectivePoints).toBe(2.5);
    expect(s2.newTotal).toBe(4.5);

    // Stage 3: +1.0 -> exceeds 5.0, must clamp to 5.0 (effective +0.5)
    const s3 = store.addBonusPoints(student.id, 1.0, "Aktivitas 3");
    expect(s3.effectivePoints).toBe(0.5);
    expect(s3.newTotal).toBe(5.0);

    // Stage 4: +5.0 when already at max 5.0 -> effective 0.0, total 5.0
    const s4 = store.addBonusPoints(student.id, 5.0, "Aktivitas 4");
    expect(s4.effectivePoints).toBe(0.0);
    expect(s4.newTotal).toBe(5.0);

    const finalStudent = useAppStore.getState().students.find((s) => s.id === student.id);
    expect(finalStudent?.bonusPoints).toBe(5.0);
  });

  it("Stress 2.2: Extreme positive single-step spike (+50.0) caps to +5.0", () => {
    const store = useAppStore.getState();
    const student = store.students[1];
    store.updateStudent({ ...student, bonusPoints: 0 });

    const res = store.addBonusPoints(student.id, 50.0, "Super bonus spike");
    expect(res.effectivePoints).toBe(5.0);
    expect(res.newTotal).toBe(5.0);

    const finalStudent = useAppStore.getState().students.find((s) => s.id === student.id);
    expect(finalStudent?.bonusPoints).toBe(5.0);
  });

  it("Stress 2.3: Negative points (penalties) floor strictly at 0.0 without going negative", () => {
    const store = useAppStore.getState();
    const student = store.students[0];
    store.updateStudent({ ...student, bonusPoints: 3.0 });

    // Deduct 1.0 -> newTotal 2.0
    const r1 = store.addBonusPoints(student.id, -1.0, "Koreksi nilai 1");
    expect(r1.effectivePoints).toBe(-1.0);
    expect(r1.newTotal).toBe(2.0);

    // Deduct 5.0 when at 2.0 -> floors at 0.0, effective -2.0
    const r2 = store.addBonusPoints(student.id, -5.0, "Koreksi nilai berlebih");
    expect(r2.effectivePoints).toBe(-2.0);
    expect(r2.newTotal).toBe(0.0);

    // Deduct another -10.0 when at 0.0 -> effective 0, stays 0.0
    const r3 = store.addBonusPoints(student.id, -10.0, "Koreksi saat nol");
    expect(r3.effectivePoints).toBe(0.0);
    expect(r3.newTotal).toBe(0.0);

    const finalStudent = useAppStore.getState().students.find((s) => s.id === student.id);
    expect(finalStudent?.bonusPoints).toBe(0.0);
  });

  it("Stress 2.4: Sub-cent fractional additions round cleanly to 1 decimal place", () => {
    const store = useAppStore.getState();
    const student = store.students[0];
    store.updateStudent({ ...student, bonusPoints: 0 });

    // Add 0.123 -> rounded to 0.1
    const r1 = store.addBonusPoints(student.id, 0.123, "Pecahan kecil 1");
    expect(r1.effectivePoints).toBe(0.1);
    expect(r1.newTotal).toBe(0.1);

    // Add 0.25 -> 0.1 + 0.25 = 0.35 -> rounds to 0.4
    const r2 = store.addBonusPoints(student.id, 0.25, "Pecahan kecil 2");
    expect(r2.newTotal).toBe(0.4);
    expect(r2.effectivePoints).toBe(0.3);
  });

  it("Stress 2.5: Zero points and unknown student handle cleanly", () => {
    const store = useAppStore.getState();
    const student = store.students[0];
    store.updateStudent({ ...student, bonusPoints: 2.5 });

    // Add 0 points
    const r0 = store.addBonusPoints(student.id, 0, "Nol poin");
    expect(r0.effectivePoints).toBe(0);
    expect(r0.newTotal).toBe(2.5);

    // Add points to unknown student
    const rUnknown = store.addBonusPoints("non-existent-student-xyz", 3.0, "Ghost student");
    expect(rUnknown.effectivePoints).toBe(0);
    expect(rUnknown.newTotal).toBe(0);
  });

  it("Stress 2.6: Micro-increments across 50 iterations cap precisely at 5.0", () => {
    const store = useAppStore.getState();
    const student = store.students[0];
    store.updateStudent({ ...student, bonusPoints: 0 });

    // 60 increments of +0.1 (total theoretical 6.0)
    for (let i = 0; i < 60; i++) {
      store.addBonusPoints(student.id, 0.1, `Micro-increment ${i}`);
    }

    const finalStudent = useAppStore.getState().students.find((s) => s.id === student.id);
    expect(finalStudent?.bonusPoints).toBe(5.0);
  });
});

// ==========================================================================
// SECTION 3: SERVER ACTIONS OFFLINE FALLBACKS STRESS TESTS
// ==========================================================================
describe("Adversarial Server Actions Offline Resilience (Undefined / Empty Key)", () => {
  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("Stress 3.1: generateTPFromCPAction produces robust structured fallbacks for various subjects", async () => {
    delete process.env.GEMINI_API_KEY;

    // Informatika subject fallback (4 TPs)
    const resInfor = await generateTPFromCPAction({
      subject: "Informatika",
      fase: "E",
      cpText: "Capaian pembelajaran informatika fase E...",
    });
    expect(resInfor.success).toBe(true);
    expect(resInfor.isFallback).toBe(true);
    expect(resInfor.data?.length).toBe(4);
    expect(resInfor.data![0].bloomLevel).toBe("C3");
    expect(resInfor.data![0].kktpThreshold).toBe(75);

    // General subject fallback (e.g. Bahasa Indonesia, 3 TPs)
    const resIndo = await generateTPFromCPAction({
      subject: "Bahasa Indonesia",
      fase: "F",
      cpText: "Capaian pembelajaran bahasa indonesia fase F...",
    });
    expect(resIndo.success).toBe(true);
    expect(resIndo.isFallback).toBe(true);
    expect(resIndo.data?.length).toBe(3);
    expect(resIndo.data![0].bloomLevel).toBe("C2");
    expect(resIndo.data![2].bloomLevel).toBe("C6");
  });

  it("Stress 3.2: generateLessonPlanAndLKPDAction produces valid Modul Ajar and dual LKPD when key is empty spaces", async () => {
    process.env.GEMINI_API_KEY = "   "; // Whitespace key

    const res = await generateLessonPlanAndLKPDAction({
      meetingNumber: 2,
      tpDescription: "Menerapkan struktur perulangan (loops) dalam pemrograman Python",
      durationMinutes: 90,
      gradeLevel: "10",
    });

    expect(res.success).toBe(true);
    expect(res.isFallback).toBe(true);
    expect(res.modulAjar).toBeDefined();
    expect(res.modulAjar.kegiatan.pendahuluan).toContain("15 Menit");
    expect(res.modulAjar.kegiatan.inti).toContain("60 Menit"); // 90 - 30 = 60
    expect(res.lkpdSiswa).toContain("Pertemuan ke-2");
    expect(res.lkpdGuruKunci).toContain("PANDUAN GURU & KUNCI JAWABAN");

    delete process.env.GEMINI_API_KEY;
  });

  it("Stress 3.3: generateRemedialTaskAction adapts to input parameters in fallback mode", async () => {
    delete process.env.GEMINI_API_KEY;

    const res = await generateRemedialTaskAction({
      studentName: "Fatimah Azzahra",
      tpCode: "TP-INF-02",
      tpDescription: "Menganalisis arsitektur CPU dan memori",
      score: 58,
      kktp: 75,
    });

    expect(res.success).toBe(true);
    expect(res.isFallback).toBe(true);
    expect(res.taskText).toContain("Fatimah Azzahra");
    expect(res.taskText).toContain("TP-INF-02");
    expect(res.taskText).toContain("Nilai Saat Ini: 58");
    expect(res.taskText).toContain("Ambang Ketuntasan (KKTP): 75");
    expect(res.taskText).toContain("KUNCI & PANDUAN PENSKORAN GURU");
  });

  it("Stress 3.4: generateAthirahModulAjarAction produces complete 6-component Athirah curriculum structure", async () => {
    delete process.env.GEMINI_API_KEY;

    const res = await generateAthirahModulAjarAction({
      unit: "SMA Islam Athirah Bukit Baruga",
      subject: "Informatika",
      gradeLevel: "XI",
      fase: "F",
      materiPokok: "Kecerdasan Buatan dan Etika Penggunaan AI",
      meetingNumber: 3,
      durationMinutes: 135,
      tpDescription: "Menganalisis prinsip kerja dan implikasi etis kecerdasan buatan",
      renstraPrograms: ["ATHIRAH_BERQURAN", "DIGITAL_TRANSFORMATION"],
    });

    expect(res.success).toBe(true);
    expect(res.isFallback).toBe(true);

    const modul = res.modulAjar!;
    expect(modul).toBeDefined();

    // Component 1: Identitas
    expect(modul.identitas.unit).toBe("SMA Islam Athirah Bukit Baruga");
    expect(modul.identitas.pertemuanKe).toBe(3);
    expect(modul.identitas.alokasiWaktuDisplay).toContain("3 JP (135 Menit)");

    // Component 2: Identifikasi
    expect(modul.identifikasi.profilLulusanAthirah.length).toBeGreaterThanOrEqual(4);
    expect(modul.identifikasi.programKhasRenstra).toContain("DIGITAL_TRANSFORMATION");

    // Component 3: Spiritualisasi
    expect(modul.spiritualisasi.quranVerse.arabicText).toBeDefined();
    expect(modul.spiritualisasi.hadith?.arabicText).toBeDefined();
    expect(modul.spiritualisasi.islamicHistory?.figureName).toBeDefined();

    // Component 4: Desain Pembelajaran (ABCD)
    expect(modul.desainPembelajaran.tujuanPembelajaran.audience).toBeDefined();
    expect(modul.desainPembelajaran.tujuanPembelajaran.behavior).toBeDefined();
    expect(modul.desainPembelajaran.tujuanPembelajaran.condition).toBeDefined();
    expect(modul.desainPembelajaran.tujuanPembelajaran.degree).toBeDefined();

    // Component 5: Pengalaman Belajar (3M + PM + Matriks MH/MA/MR)
    expect(modul.pengalamanBelajar.memahami.some((s) => s.matrixCode.startsWith("MH"))).toBe(true);
    expect(modul.pengalamanBelajar.mengaplikasi.some((s) => s.matrixCode.startsWith("MA"))).toBe(true);
    expect(modul.pengalamanBelajar.merefleksi.some((s) => s.matrixCode.startsWith("MR"))).toBe(true);

    // Component 6: Lampiran Asesmen (8 Kolom)
    expect(modul.lampiranAsesmen.length).toBeGreaterThanOrEqual(2);
    expect(modul.lampiranAsesmen.some((a) => a.jenisAsesmen === "TULIS")).toBe(true);
    expect(modul.lampiranAsesmen.some((a) => a.jenisAsesmen === "NONTULIS")).toBe(true);

    // Dual-Version LKPD
    expect(res.lkpdSiswa).toBeDefined();
    expect(res.lkpdSiswa?.openingDuaAndAdab.bismillahText).toContain("بِسْمِ اللَّهِ");
    expect(res.lkpdGuruKunci).toBeDefined();
    expect(res.lkpdGuruKunci?.guruAnswerKeyGuide?.rubrikPenilaian4Level.length).toBe(3);
  });

  it("Stress 3.5: Verifies production model identifier remains gemini-2.0-flash", async () => {
    const model = await getGeminiModel();
    expect(model).toBe("gemini-2.0-flash");
  });
});
