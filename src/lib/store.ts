import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ClassItem,
  ClassSection,
  Student,
  TP,
  TujuanPembelajaran,
  AttendanceRecord,
  BonusPointLog,
  ModulAjarAthirah,
  LkpdAthirah,
} from "../types/index.ts";
import { mockClasses, mockStudents, mockTPs } from "./mockData.ts";

export const STORAGE_KEY_CLASSES = "kelasmerdeka_classes_v1";
export const STORAGE_KEY_STUDENTS = "kelasmerdeka_students_v1";
export const STORAGE_KEY_TPS = "kelasmerdeka_tps_v1";
export const STORAGE_KEY_APP = "kelasmerdeka_app_store_v1";

export interface AppState {
  // Slices
  classes: ClassItem[];
  selectedClassId: string;
  students: Student[];
  tps: TP[];
  scores: Record<string, Record<string, number>>; // studentId -> tpId -> numeric score (0-100)
  bonusLogs: BonusPointLog[];
  attendance: Record<string, AttendanceRecord[]>; // key (e.g. date or classId_date) -> records
  modulAjarList: ModulAjarAthirah[];
  lkpdList: LkpdAthirah[];

  // Class Actions
  setSelectedClassId: (id: string) => void;
  setClasses: (classes: ClassItem[]) => void;
  addClass: (cls: ClassItem) => void;
  updateClass: (cls: ClassItem) => void;
  deleteClass: (id: string) => void; // Cascades to students, TPs, scores, attendance, bonus logs

  // Student Actions
  setStudents: (students: Student[]) => void;
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void; // Cascades to scores, bonus logs, attendance

  // TP Actions
  setTPs: (tps: TP[]) => void;
  addTP: (tp: TP) => void;
  saveTPs: (tps: TP[]) => void;
  updateTP: (tp: TP) => void;
  deleteTP: (id: string) => void; // Cascades to scores for that TP UUID

  // Score Actions
  setScores: (scores: Record<string, Record<string, number>>) => void;
  setScore: (studentId: string, tpId: string, score: number) => void;
  getScore: (studentId: string, tpId: string) => number | undefined;

  // Bonus Point Actions
  addBonusPoints: (
    studentId: string,
    points: number,
    reason: string
  ) => { effectivePoints: number; newTotal: number };

  // Attendance Actions
  saveAttendance: (key: string, records: AttendanceRecord[]) => void;
  getAttendance: (key: string) => AttendanceRecord[] | undefined;

  // Teaching Documents Actions
  saveModulAjar: (modul: ModulAjarAthirah) => void;
  deleteModulAjar: (id: string) => void;
  saveLKPD: (lkpd: LkpdAthirah) => void;
  deleteLKPD: (id: string) => void;

  // Store Management
  resetStore: () => void;
}

export const universalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return (globalThis as any).__memStorage?.[key] || null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch {}
    } else {
      if (!(globalThis as any).__memStorage) (globalThis as any).__memStorage = {};
      (globalThis as any).__memStorage[key] = value;
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch {}
    } else {
      delete (globalThis as any).__memStorage?.[key];
    }
  },
};

// Fallback / legacy storage helper
function syncLegacyStorage(type: "classes" | "students" | "tps", data: unknown) {
  const key =
    type === "classes"
      ? STORAGE_KEY_CLASSES
      : type === "students"
      ? STORAGE_KEY_STUDENTS
      : STORAGE_KEY_TPS;
  try {
    universalStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[KelasMerdeka Store] Failed to sync ${key}:`, err);
  }
}

function getInitialClasses(): ClassItem[] {
  try {
    const raw = universalStorage.getItem(STORAGE_KEY_CLASSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return mockClasses;
}

function getInitialStudents(): Student[] {
  try {
    const raw = universalStorage.getItem(STORAGE_KEY_STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return mockStudents;
}

function getInitialTPs(): TP[] {
  try {
    const raw = universalStorage.getItem(STORAGE_KEY_TPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return mockTPs;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial Slices
      classes: getInitialClasses(),
      selectedClassId: getInitialClasses()[0]?.id || "cls-1",
      students: getInitialStudents(),
      tps: getInitialTPs(),
      scores: {},
      bonusLogs: [],
      attendance: {},
      modulAjarList: [],
      lkpdList: [],

      // --- Class Actions ---
      setSelectedClassId: (id: string) => set({ selectedClassId: id }),

      setClasses: (classes: ClassItem[]) => {
        syncLegacyStorage("classes", classes);
        set((state) => ({
          classes,
          selectedClassId:
            classes.some((c) => c.id === state.selectedClassId)
              ? state.selectedClassId
              : classes[0]?.id || "",
        }));
      },

      addClass: (cls: ClassItem) => {
        set((state) => {
          const updated = [...state.classes, cls];
          syncLegacyStorage("classes", updated);
          return {
            classes: updated,
            selectedClassId: state.selectedClassId || cls.id,
          };
        });
      },

      updateClass: (cls: ClassItem) => {
        set((state) => {
          const updated = state.classes.map((c) => (c.id === cls.id ? cls : c));
          syncLegacyStorage("classes", updated);
          return { classes: updated };
        });
      },

      deleteClass: (classId: string) => {
        set((state) => {
          const remainingClasses = state.classes.filter((c) => c.id !== classId);
          const newSelectedClassId =
            state.selectedClassId === classId
              ? remainingClasses[0]?.id || ""
              : state.selectedClassId;

          // Cascading referential integrity:
          // 1. Target students in this class
          const removedStudentIds = new Set(
            state.students.filter((s) => s.classId === classId).map((s) => s.id)
          );
          const remainingStudents = state.students.filter(
            (s) => s.classId !== classId
          );

          // 2. Target TPs in this class
          const removedTpIds = new Set(
            state.tps.filter((t) => t.classId === classId).map((t) => t.id)
          );
          const remainingTps = state.tps.filter((t) => t.classId !== classId);

          // 3. Remove scores of all deleted students AND any score referencing deleted TPs
          const newScores: Record<string, Record<string, number>> = {};
          for (const [sId, studentScores] of Object.entries(state.scores)) {
            if (!removedStudentIds.has(sId)) {
              const studentRemainingScores: Record<string, number> = {};
              for (const [tpId, sc] of Object.entries(studentScores)) {
                if (!removedTpIds.has(tpId)) {
                  studentRemainingScores[tpId] = sc;
                }
              }
              newScores[sId] = studentRemainingScores;
            }
          }

          // 4. Remove bonusLogs for this class and its deleted students
          const newBonusLogs = state.bonusLogs.filter(
            (log) => log.classId !== classId && !removedStudentIds.has(log.studentId)
          );

          // 5. Clean up attendance for this class and its deleted students
          const newAttendance: Record<string, AttendanceRecord[]> = {};
          for (const [key, records] of Object.entries(state.attendance)) {
            if (!key.includes(classId)) {
              newAttendance[key] = records.filter(
                (r) => !removedStudentIds.has(r.studentId)
              );
            }
          }

          // 6. Clean up teaching documents
          const newModulAjarList = state.modulAjarList.filter(
            (m) => (m as any).classId !== classId && (m as any).identitas?.kelas !== classId
          );
          const newLkpdList = state.lkpdList.filter(
            (l) => (l as any).classId !== classId
          );

          syncLegacyStorage("classes", remainingClasses);
          syncLegacyStorage("students", remainingStudents);
          syncLegacyStorage("tps", remainingTps);

          return {
            classes: remainingClasses,
            selectedClassId: newSelectedClassId,
            students: remainingStudents,
            tps: remainingTps,
            scores: newScores,
            bonusLogs: newBonusLogs,
            attendance: newAttendance,
            modulAjarList: newModulAjarList,
            lkpdList: newLkpdList,
          };
        });
      },

      // --- Student Actions ---
      setStudents: (students: Student[]) => {
        syncLegacyStorage("students", students);
        set({ students });
      },

      addStudent: (student: Student) => {
        set((state) => {
          const updated = [...state.students, student];
          const updatedClasses = state.classes.map((c) =>
            c.id === student.classId
              ? { ...c, studentCount: (c.studentCount || 0) + 1 }
              : c
          );
          syncLegacyStorage("students", updated);
          syncLegacyStorage("classes", updatedClasses);
          return {
            students: updated,
            classes: updatedClasses,
          };
        });
      },

      updateStudent: (student: Student) => {
        set((state) => {
          const updated = state.students.map((s) =>
            s.id === student.id ? student : s
          );
          syncLegacyStorage("students", updated);
          return { students: updated };
        });
      },

      deleteStudent: (studentId: string) => {
        set((state) => {
          const targetStudent = state.students.find((s) => s.id === studentId);
          const remainingStudents = state.students.filter(
            (s) => s.id !== studentId
          );

          // Update student count in associated class
          const updatedClasses = targetStudent
            ? state.classes.map((c) =>
                c.id === targetStudent.classId
                  ? { ...c, studentCount: Math.max(0, (c.studentCount || 1) - 1) }
                  : c
              )
            : state.classes;

          // Cascading referential integrity:
          // 1. Remove score entries for this student
          const newScores = { ...state.scores };
          delete newScores[studentId];

          // 2. Remove bonus logs for this student
          const newBonusLogs = state.bonusLogs.filter(
            (b) => b.studentId !== studentId
          );

          // 3. Remove student from all attendance records
          const newAttendance: Record<string, AttendanceRecord[]> = {};
          for (const [key, records] of Object.entries(state.attendance)) {
            newAttendance[key] = records.filter((r) => r.studentId !== studentId);
          }

          syncLegacyStorage("students", remainingStudents);
          syncLegacyStorage("classes", updatedClasses);

          return {
            students: remainingStudents,
            classes: updatedClasses,
            scores: newScores,
            bonusLogs: newBonusLogs,
            attendance: newAttendance,
          };
        });
      },

      // --- TP Actions ---
      setTPs: (tps: TP[]) => {
        syncLegacyStorage("tps", tps);
        set({ tps });
      },

      addTP: (tp: TP) => {
        set((state) => {
          const updated = [...state.tps, tp];
          syncLegacyStorage("tps", updated);
          return { tps: updated };
        });
      },

      saveTPs: (tps: TP[]) => {
        syncLegacyStorage("tps", tps);
        set({ tps });
      },

      updateTP: (tp: TP) => {
        set((state) => {
          const updated = state.tps.map((t) => (t.id === tp.id ? tp : t));
          syncLegacyStorage("tps", updated);
          return { tps: updated };
        });
      },

      deleteTP: (tpId: string) => {
        set((state) => {
          const remainingTps = state.tps.filter((t) => t.id !== tpId);

          // Cascading referential integrity:
          // Remove all score entries for this TP UUID across all students
          const newScores: Record<string, Record<string, number>> = {};
          for (const [sId, studentScores] of Object.entries(state.scores)) {
            const studentRemainingScores: Record<string, number> = {};
            for (const [tId, sc] of Object.entries(studentScores)) {
              if (tId !== tpId) {
                studentRemainingScores[tId] = sc;
              }
            }
            newScores[sId] = studentRemainingScores;
          }

          syncLegacyStorage("tps", remainingTps);

          return {
            tps: remainingTps,
            scores: newScores,
          };
        });
      },

      // --- Score Actions ---
      setScores: (scores: Record<string, Record<string, number>>) => set({ scores }),

      setScore: (studentId: string, tpId: string, score: number) => {
        const clampedScore = Math.min(100, Math.max(0, Math.round(score * 10) / 10));
        set((state) => {
          const studentScores = state.scores[studentId]
            ? { ...state.scores[studentId] }
            : {};
          studentScores[tpId] = clampedScore;
          return {
            scores: {
              ...state.scores,
              [studentId]: studentScores,
            },
          };
        });
      },

      getScore: (studentId: string, tpId: string) => {
        return get().scores[studentId]?.[tpId];
      },

      // --- Anti-Inflation Bonus Point System (Max +5.0 Cap) ---
      addBonusPoints: (studentId: string, points: number, reason: string) => {
        let effectivePoints = 0;
        let newTotal = 0;

        set((state) => {
          const student = state.students.find((s) => s.id === studentId);
          if (!student) {
            return state;
          }

          const currentBonus = Number(student.bonusPoints) || 0;
          // Cap bonus points at +5.0 semester elevation (min 0.0, max 5.0)
          newTotal = Math.min(5.0, Math.max(0, Math.round((currentBonus + points) * 10) / 10));
          effectivePoints = Math.round((newTotal - currentBonus) * 10) / 10;

          const updatedStudent: Student = {
            ...student,
            bonusPoints: newTotal,
            updatedAt: new Date().toISOString(),
          };

          const updatedStudents = state.students.map((s) =>
            s.id === studentId ? updatedStudent : s
          );

          const logEntry: BonusPointLog = {
            id: `bonus-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            studentId,
            classId: student.classId,
            points: effectivePoints,
            reason,
            timestamp: new Date().toISOString(),
            authorId: "teacher-1",
          };

          syncLegacyStorage("students", updatedStudents);

          return {
            students: updatedStudents,
            bonusLogs: [logEntry, ...state.bonusLogs],
          };
        });

        return { effectivePoints, newTotal };
      },

      // --- Attendance Actions ---
      saveAttendance: (key: string, records: AttendanceRecord[]) => {
        set((state) => ({
          attendance: {
            ...state.attendance,
            [key]: records,
          },
        }));
      },

      getAttendance: (key: string) => {
        return get().attendance[key];
      },

      // --- Teaching Documents Actions ---
      saveModulAjar: (modul: ModulAjarAthirah) => {
        set((state) => {
          const exists = state.modulAjarList.some((m) => m.id === modul.id);
          const updated = exists
            ? state.modulAjarList.map((m) => (m.id === modul.id ? modul : m))
            : [modul, ...state.modulAjarList];
          return { modulAjarList: updated };
        });
      },

      deleteModulAjar: (id: string) => {
        set((state) => ({
          modulAjarList: state.modulAjarList.filter((m) => m.id !== id),
        }));
      },

      saveLKPD: (lkpd: LkpdAthirah) => {
        set((state) => {
          const exists = state.lkpdList.some((l) => l.id === lkpd.id);
          const updated = exists
            ? state.lkpdList.map((l) => (l.id === lkpd.id ? l : l))
            : [lkpd, ...state.lkpdList];
          return { lkpdList: updated };
        });
      },

      deleteLKPD: (id: string) => {
        set((state) => ({
          lkpdList: state.lkpdList.filter((l) => l.id !== id),
        }));
      },

      // --- Reset Store ---
      resetStore: () => {
        const initialClasses = mockClasses;
        const initialStudents = mockStudents;
        const initialTPs = mockTPs;
        syncLegacyStorage("classes", initialClasses);
        syncLegacyStorage("students", initialStudents);
        syncLegacyStorage("tps", initialTPs);
        set({
          classes: initialClasses,
          selectedClassId: initialClasses[0]?.id || "cls-1",
          students: initialStudents,
          tps: initialTPs,
          scores: {},
          bonusLogs: [],
          attendance: {},
          modulAjarList: [],
          lkpdList: [],
        });
      },
    }),
    {
      name: STORAGE_KEY_APP,
      storage: createJSONStorage(() => universalStorage),
      partialize: (state) => ({
        classes: state.classes,
        selectedClassId: state.selectedClassId,
        students: state.students,
        tps: state.tps,
        scores: state.scores,
        bonusLogs: state.bonusLogs,
        attendance: state.attendance,
        modulAjarList: state.modulAjarList,
        lkpdList: state.lkpdList,
      }),
    }
  )
);

// ============================================================================
// BACKWARD-COMPATIBLE LEGACY WRAPPER HELPERS
// Ensures any existing call to getSavedClasses(), saveClasses(), etc. continues
// to work seamlessly and remains synchronized with the reactive Zustand store.
// ============================================================================

export function getSavedClasses(): ClassSection[] {
  const inStore = useAppStore.getState().classes;
  if (inStore && inStore.length > 0) return inStore;
  try {
    const raw = universalStorage.getItem(STORAGE_KEY_CLASSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return mockClasses;
}

export function saveClasses(classes: ClassSection[]) {
  useAppStore.getState().setClasses(classes);
  syncLegacyStorage("classes", classes);
}

export function getSavedStudents(): Student[] {
  const inStore = useAppStore.getState().students;
  if (inStore && inStore.length > 0) return inStore;
  try {
    const raw = universalStorage.getItem(STORAGE_KEY_STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return mockStudents;
}

export function saveStudents(students: Student[]) {
  useAppStore.getState().setStudents(students);
  syncLegacyStorage("students", students);
}

export function getSavedTPs(): TujuanPembelajaran[] {
  const inStore = useAppStore.getState().tps;
  if (inStore && inStore.length > 0) return inStore;
  try {
    const raw = universalStorage.getItem(STORAGE_KEY_TPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return mockTPs;
}

export function saveTPs(tps: TujuanPembelajaran[]) {
  useAppStore.getState().saveTPs(tps);
  syncLegacyStorage("tps", tps);
}
