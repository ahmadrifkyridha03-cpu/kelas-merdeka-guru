import { ClassSection, Student, TujuanPembelajaran } from "@/types";
import { mockClasses, mockStudents, mockTPs } from "@/lib/mockData";

const STORAGE_KEY_CLASSES = "kelasmerdeka_classes_v1";
const STORAGE_KEY_STUDENTS = "kelasmerdeka_students_v1";
const STORAGE_KEY_TPS = "kelasmerdeka_tps_v1";

export function getSavedClasses(): ClassSection[] {
  if (typeof window === "undefined") return mockClasses;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLASSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(mockClasses));
      return mockClasses;
    }
    return JSON.parse(raw);
  } catch {
    return mockClasses;
  }
}

export function saveClasses(classes: ClassSection[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
  } catch (err) {
    console.error("Gagal menyimpan classes ke localStorage", err);
  }
}

export function getSavedStudents(): Student[] {
  if (typeof window === "undefined") return mockStudents;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(mockStudents));
      return mockStudents;
    }
    return JSON.parse(raw);
  } catch {
    return mockStudents;
  }
}

export function saveStudents(students: Student[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error("Gagal menyimpan students ke localStorage", err);
  }
}

export function getSavedTPs(): TujuanPembelajaran[] {
  if (typeof window === "undefined") return mockTPs;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TPS, JSON.stringify(mockTPs));
      return mockTPs;
    }
    return JSON.parse(raw);
  } catch {
    return mockTPs;
  }
}

export function saveTPs(tps: TujuanPembelajaran[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_TPS, JSON.stringify(tps));
  } catch (err) {
    console.error("Gagal menyimpan TPs ke localStorage", err);
  }
}
