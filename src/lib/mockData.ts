import { ClassSection, Student, TujuanPembelajaran } from "@/types";

export const mockClasses: ClassSection[] = [
  {
    id: "cls-1",
    teacherId: "teacher-1",
    name: "X-A (Fase E)",
    gradeLevel: 10,
    fase: "E",
    subjectName: "Informatika",
    teachingHoursPerWeek: 3,
    academicYearId: "ay-2026",
    semesterNumber: 1,
    studentCount: 36,
    createdAt: "2026-07-15T08:00:00Z",
    updatedAt: "2026-10-30T10:00:00Z"
  },
  {
    id: "cls-2",
    teacherId: "teacher-1",
    name: "X-B (Fase E)",
    gradeLevel: 10,
    fase: "E",
    subjectName: "Informatika",
    teachingHoursPerWeek: 3,
    academicYearId: "ay-2026",
    semesterNumber: 1,
    studentCount: 35,
    createdAt: "2026-07-15T08:00:00Z",
    updatedAt: "2026-10-30T10:00:00Z"
  },
  {
    id: "cls-3",
    teacherId: "teacher-1",
    name: "XI-IPA-1 (Fase F)",
    gradeLevel: 11,
    fase: "F",
    subjectName: "Informatika Lanjutan",
    teachingHoursPerWeek: 5,
    academicYearId: "ay-2026",
    semesterNumber: 1,
    studentCount: 32,
    createdAt: "2026-07-15T08:00:00Z",
    updatedAt: "2026-10-30T10:00:00Z"
  }
];

export const mockStudents: Student[] = [
  {
    id: "std-1",
    classId: "cls-1",
    nisn: "0081234567",
    nis: "2425001",
    fullName: "Aditya Pratama",
    gender: "L",
    status: "AKTIF",
    bonusPoints: 3,
    createdAt: "2026-07-15T08:00:00Z",
    updatedAt: "2026-10-30T10:00:00Z"
  },
  {
    id: "std-2",
    classId: "cls-1",
    nisn: "0081234568",
    nis: "2425002",
    fullName: "Annisa Rahmawati",
    gender: "P",
    status: "AKTIF",
    bonusPoints: 5,
    createdAt: "2026-07-15T08:00:00Z",
    updatedAt: "2026-10-30T10:00:00Z"
  },
  {
    id: "std-3",
    classId: "cls-1",
    nisn: "0081234569",
    nis: "2425003",
    fullName: "Bagas Satria Nugraha",
    gender: "L",
    status: "AKTIF",
    bonusPoints: 0,
    specialNeeds: "Disleksia ringan (butuh waktu membaca tambahan)",
    createdAt: "2026-07-15T08:00:00Z",
    updatedAt: "2026-10-30T10:00:00Z"
  },
  {
    id: "std-4",
    classId: "cls-1",
    nisn: "0081234570",
    nis: "2425004",
    fullName: "Citra Dewi Lestari",
    gender: "P",
    status: "AKTIF",
    bonusPoints: 2,
    createdAt: "2026-07-15T08:00:00Z",
    updatedAt: "2026-10-30T10:00:00Z"
  },
  {
    id: "std-5",
    classId: "cls-1",
    nisn: "0081234571",
    nis: "2425005",
    fullName: "Dhimas Arya Putra",
    gender: "L",
    status: "AKTIF",
    bonusPoints: 1,
    createdAt: "2026-07-15T08:00:00Z",
    updatedAt: "2026-10-30T10:00:00Z"
  }
];

export const mockTPs: TujuanPembelajaran[] = [
  {
    id: "tp-1",
    classId: "cls-1",
    cpElement: "Berpikir Komputasional (BK)",
    code: "TP-01",
    description: "Menerapkan strategi algoritmik standar untuk menyelesaikan persoalan pemilahan (sorting) dan pencarian (searching).",
    bloomLevel: "C3",
    scope: "Algoritma Pemilahan dan Pencarian",
    allocatedHours: 6,
    kktpModel: "INTERVAL_NILAI",
    kktpThreshold: 75
  },
  {
    id: "tp-2",
    classId: "cls-1",
    cpElement: "Teknologi Informasi dan Komunikasi (TIK)",
    code: "TP-02",
    description: "Mengintegrasikan berbagai aplikasi perkantoran untuk menghasilkan laporan penelitian berbasis data secara terstruktur.",
    bloomLevel: "C4",
    scope: "Integrasi Konten Aplikasi Perkantoran",
    allocatedHours: 9,
    kktpModel: "RUBRIK_SKALA",
    kktpThreshold: 75
  },
  {
    id: "tp-3",
    classId: "cls-1",
    cpElement: "Sistem Komputer (SK)",
    code: "TP-03",
    description: "Menganalisis mekanisme internal kerja perangkat keras, sistem operasi, dan jaringan komputer.",
    bloomLevel: "C4",
    scope: "Arsitektur Komputer & OS",
    allocatedHours: 6,
    kktpModel: "INTERVAL_NILAI",
    kktpThreshold: 75
  }
];

