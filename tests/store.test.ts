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
import type { ClassItem, Student, TP } from "../src/types/index.ts";

describe("Canonical Zustand Store (useAppStore)", () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.getState().resetStore();
  });

  describe("1. Initialization & State Slices", () => {
    it("initializes with default classes, students, and TPs", () => {
      const state = useAppStore.getState();
      expect(state.classes.length).toBeGreaterThan(0);
      expect(state.students.length).toBeGreaterThan(0);
      expect(state.tps.length).toBeGreaterThan(0);
      expect(state.selectedClassId).toBe(state.classes[0].id);
      expect(state.scores).toEqual({});
      expect(state.bonusLogs).toEqual([]);
      expect(state.attendance).toEqual({});
    });

    it("allows selecting active class", () => {
      const state = useAppStore.getState();
      const targetClass = state.classes[1];
      if (targetClass) {
        state.setSelectedClassId(targetClass.id);
        expect(useAppStore.getState().selectedClassId).toBe(targetClass.id);
      }
    });
  });

  describe("2. Score Persistence & Clamping", () => {
    it("records and persists scores for student and TP", () => {
      const store = useAppStore.getState();
      const studentId = store.students[0].id;
      const tpId = store.tps[0].id;

      store.setScore(studentId, tpId, 85);

      const updatedStore = useAppStore.getState();
      expect(updatedStore.getScore(studentId, tpId)).toBe(85);
      expect(updatedStore.scores[studentId][tpId]).toBe(85);
    });

    it("clamps scores to valid 0-100 range", () => {
      const store = useAppStore.getState();
      const studentId = store.students[0].id;
      const tpId = store.tps[0].id;

      // Above 100
      store.setScore(studentId, tpId, 120);
      expect(useAppStore.getState().getScore(studentId, tpId)).toBe(100);

      // Below 0
      store.setScore(studentId, tpId, -15);
      expect(useAppStore.getState().getScore(studentId, tpId)).toBe(0);
    });
  });

  describe("3. Anti-Inflation Bonus Point Capping (+5.0 ceiling)", () => {
    it("caps total bonus points at +5.0 per student and creates immutable log", () => {
      const store = useAppStore.getState();
      // Ensure test student starts at 0 bonus points
      const student = store.students[0];
      store.updateStudent({ ...student, bonusPoints: 0 });

      // Add +3.0 points
      const result1 = useAppStore.getState().addBonusPoints(student.id, 3.0, "Keaktifan diskusi kelompok");
      expect(result1.effectivePoints).toBe(3.0);
      expect(result1.newTotal).toBe(3.0);

      let currentStudent = useAppStore.getState().students.find((s) => s.id === student.id);
      expect(currentStudent?.bonusPoints).toBe(3.0);

      // Try adding +3.0 more (would be 6.0, but capped at 5.0)
      const result2 = useAppStore.getState().addBonusPoints(student.id, 3.0, "Tugas mandiri eksplorasi");
      expect(result2.effectivePoints).toBe(2.0); // Only +2.0 allowed
      expect(result2.newTotal).toBe(5.0);

      currentStudent = useAppStore.getState().students.find((s) => s.id === student.id);
      expect(currentStudent?.bonusPoints).toBe(5.0);

      // Try adding another +1.0 when already at 5.0 (capped, 0 effective)
      const result3 = useAppStore.getState().addBonusPoints(student.id, 1.0, "Bonus tambahan");
      expect(result3.effectivePoints).toBe(0);
      expect(result3.newTotal).toBe(5.0);

      // Check bonusLogs ledger
      const logs = useAppStore.getState().bonusLogs;
      expect(logs.length).toBe(3);
      expect(logs[0].reason).toBe("Bonus tambahan");
      expect(logs[1].reason).toBe("Tugas mandiri eksplorasi");
      expect(logs[2].reason).toBe("Keaktifan diskusi kelompok");
      expect(logs[0].studentId).toBe(student.id);
    });
  });

  describe("4. Cascading Referential Integrity: Class Deletion", () => {
    it("deleting a class automatically deletes its students, TPs, scores, attendance, and bonus logs", () => {
      const store = useAppStore.getState();

      // Setup custom class with students, TPs, scores, attendance, and bonus logs
      const customClass: ClassItem = {
        id: "cls-cascade-test",
        teacherId: "teacher-1",
        name: "XI-Cascade (Fase F)",
        gradeLevel: 11,
        fase: "F",
        subjectName: "Informatika Lanjutan",
        teachingHoursPerWeek: 4,
        academicYearId: "ay-2026",
        semesterNumber: 1,
        studentCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.addClass(customClass);

      const studentA: Student = {
        id: "std-cascade-1",
        classId: customClass.id,
        nisn: "0099999001",
        fullName: "Siswa Cascade 1",
        gender: "L",
        status: "AKTIF",
        bonusPoints: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const studentB: Student = {
        id: "std-cascade-2",
        classId: customClass.id,
        nisn: "0099999002",
        fullName: "Siswa Cascade 2",
        gender: "P",
        status: "AKTIF",
        bonusPoints: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.addStudent(studentA);
      store.addStudent(studentB);

      const tpCascade: TP = {
        id: "tp-cascade-1",
        classId: customClass.id,
        cpElement: "BK",
        code: "TP-CASC-01",
        description: "Test TP Cascading Deletion",
        bloomLevel: "C4",
        scope: "Cascade Scope",
        allocatedHours: 6,
        kktpModel: "INTERVAL_NILAI",
        kktpThreshold: 75,
      };
      store.addTP(tpCascade);

      // Add scores
      store.setScore(studentA.id, tpCascade.id, 90);
      store.setScore(studentB.id, tpCascade.id, 82);

      // Add bonus log
      store.addBonusPoints(studentA.id, 1, "Aktivitas Cascade");

      // Add attendance
      store.saveAttendance(`2026-08-01_${customClass.id}`, [
        { studentId: studentA.id, status: "HADIR", timestamp: new Date().toISOString() },
        { studentId: studentB.id, status: "HADIR", timestamp: new Date().toISOString() },
      ]);

      // Verify setup exists
      expect(useAppStore.getState().students.some((s) => s.id === studentA.id)).toBe(true);
      expect(useAppStore.getState().tps.some((t) => t.id === tpCascade.id)).toBe(true);
      expect(useAppStore.getState().scores[studentA.id]?.[tpCascade.id]).toBe(90);

      // ACT: Delete the class
      useAppStore.getState().deleteClass(customClass.id);

      const afterState = useAppStore.getState();

      // ASSERT: Class is removed
      expect(afterState.classes.some((c) => c.id === customClass.id)).toBe(false);

      // ASSERT: Students belonging to deleted class are removed
      expect(afterState.students.some((s) => s.id === studentA.id)).toBe(false);
      expect(afterState.students.some((s) => s.id === studentB.id)).toBe(false);

      // ASSERT: TPs belonging to deleted class are removed
      expect(afterState.tps.some((t) => t.id === tpCascade.id)).toBe(false);

      // ASSERT: Scores for deleted students and TPs are purged
      expect(afterState.scores[studentA.id]).toBeUndefined();
      expect(afterState.scores[studentB.id]).toBeUndefined();

      // ASSERT: Bonus logs for deleted class and students are purged
      expect(afterState.bonusLogs.some((b) => b.classId === customClass.id)).toBe(false);
      expect(afterState.bonusLogs.some((b) => b.studentId === studentA.id)).toBe(false);

      // ASSERT: Attendance for deleted class is purged
      expect(afterState.attendance[`2026-08-01_${customClass.id}`]).toBeUndefined();
    });
  });

  describe("5. Cascading Referential Integrity: Student Deletion", () => {
    it("deleting a student removes their scores, bonus logs, and attendance records", () => {
      const store = useAppStore.getState();
      const student = store.students[0];
      const tp = store.tps[0];

      // Give scores, bonus points, attendance
      store.setScore(student.id, tp.id, 88);
      store.addBonusPoints(student.id, 2, "Prestasi olimpiade");
      store.saveAttendance("meeting-1", [
        { studentId: student.id, status: "HADIR", timestamp: new Date().toISOString() },
      ]);

      expect(useAppStore.getState().scores[student.id]?.[tp.id]).toBe(88);
      expect(useAppStore.getState().bonusLogs.some((b) => b.studentId === student.id)).toBe(true);
      expect(
        useAppStore.getState().attendance["meeting-1"].some((r) => r.studentId === student.id)
      ).toBe(true);

      // ACT: Delete student
      useAppStore.getState().deleteStudent(student.id);

      const afterState = useAppStore.getState();

      // ASSERT: Student is removed
      expect(afterState.students.some((s) => s.id === student.id)).toBe(false);

      // ASSERT: Scores are purged
      expect(afterState.scores[student.id]).toBeUndefined();

      // ASSERT: Bonus logs are purged
      expect(afterState.bonusLogs.some((b) => b.studentId === student.id)).toBe(false);

      // ASSERT: Attendance records for that student are filtered out
      expect(
        afterState.attendance["meeting-1"].some((r) => r.studentId === student.id)
      ).toBe(false);
    });
  });

  describe("6. Cascading Referential Integrity: TP Deletion", () => {
    it("deleting a TP purges all score entries referencing that TP UUID across all students", () => {
      const store = useAppStore.getState();
      const tpToDelete = store.tps[0];
      const tpToKeep = store.tps[1];
      const student1 = store.students[0];
      const student2 = store.students[1];

      // Set scores for both TPs across both students
      store.setScore(student1.id, tpToDelete.id, 95);
      store.setScore(student1.id, tpToKeep.id, 80);
      store.setScore(student2.id, tpToDelete.id, 70);
      store.setScore(student2.id, tpToKeep.id, 85);

      expect(useAppStore.getState().scores[student1.id][tpToDelete.id]).toBe(95);
      expect(useAppStore.getState().scores[student1.id][tpToKeep.id]).toBe(80);

      // ACT: Delete TP
      useAppStore.getState().deleteTP(tpToDelete.id);

      const afterState = useAppStore.getState();

      // ASSERT: TP is removed
      expect(afterState.tps.some((t) => t.id === tpToDelete.id)).toBe(false);

      // ASSERT: Scores for deleted TP are purged, while keeping other TP scores intact
      expect(afterState.scores[student1.id]?.[tpToDelete.id]).toBeUndefined();
      expect(afterState.scores[student1.id]?.[tpToKeep.id]).toBe(80);
      expect(afterState.scores[student2.id]?.[tpToDelete.id]).toBeUndefined();
      expect(afterState.scores[student2.id]?.[tpToKeep.id]).toBe(85);
    });
  });

  describe("7. Backward-Compatible Legacy Helpers", () => {
    it("getSavedClasses and saveClasses wrap and synchronize with Zustand store", () => {
      const initial = getSavedClasses();
      expect(initial.length).toBeGreaterThan(0);

      const newClass: ClassItem = {
        id: "cls-legacy-1",
        teacherId: "teacher-1",
        name: "Legacy Class",
        gradeLevel: 10,
        fase: "E",
        subjectName: "Informatika",
        teachingHoursPerWeek: 3,
        academicYearId: "ay-2026",
        semesterNumber: 1,
        studentCount: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveClasses([...initial, newClass]);

      // Check via legacy getter
      const updatedLegacy = getSavedClasses();
      expect(updatedLegacy.some((c) => c.id === "cls-legacy-1")).toBe(true);

      // Check via Zustand store
      expect(useAppStore.getState().classes.some((c) => c.id === "cls-legacy-1")).toBe(true);
    });

    it("getSavedStudents and saveStudents synchronize with Zustand store", () => {
      const initial = getSavedStudents();
      const newStudent: Student = {
        id: "std-legacy-test",
        classId: "cls-1",
        nisn: "0011223344",
        fullName: "Siswa Legacy",
        gender: "L",
        status: "AKTIF",
        bonusPoints: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveStudents([...initial, newStudent]);

      expect(getSavedStudents().some((s) => s.id === "std-legacy-test")).toBe(true);
      expect(useAppStore.getState().students.some((s) => s.id === "std-legacy-test")).toBe(true);
    });

    it("getSavedTPs and saveTPs synchronize with Zustand store", () => {
      const initial = getSavedTPs();
      const newTP: TP = {
        id: "tp-legacy-test",
        classId: "cls-1",
        cpElement: "BK",
        code: "TP-LEGACY",
        description: "Legacy TP Synchronized",
        bloomLevel: "C3",
        scope: "Legacy Scope",
        allocatedHours: 6,
        kktpModel: "INTERVAL_NILAI",
        kktpThreshold: 75,
      };

      saveTPs([...initial, newTP]);

      expect(getSavedTPs().some((t) => t.id === "tp-legacy-test")).toBe(true);
      expect(useAppStore.getState().tps.some((t) => t.id === "tp-legacy-test")).toBe(true);
    });
  });
});
