/**
 * Core Data Models & Schemas for KelasMerdeka
 * Aligned with Kepmendikbudristek No. 032/H/KR/2024 & UU PDP No. 27/2022
 */

export type KurikulumFase = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type AttendanceStatus = 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA' | 'TERLAMBAT' | 'DISPENSASI';

export type KktpModel = 'DESKRIPSI_KRITERIA' | 'RUBRIK_SKALA' | 'INTERVAL_NILAI';

export interface TeacherProfile {
  uid: string;
  email: string;
  fullName: string;
  nip?: string;
  schoolName: string;
  npsn?: string;
  headmasterName?: string;
  headmasterNip?: string;
  schoolLogoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicYear {
  id: string;
  label: string; // e.g. "2026/2027"
  startDate: string;
  endDate: string;
  isActive: boolean;
  semesters: {
    semesterNumber: 1 | 2;
    startDate: string;
    endDate: string;
    effectiveWeeksCount: number;
    effectiveTeachingHours: number;
  }[];
}

export interface ClassSection {
  id: string;
  teacherId: string;
  name: string; // e.g. "X-IPA-1", "7A"
  gradeLevel: number; // 1-12
  fase: KurikulumFase;
  subjectName: string; // e.g. "Informatika"
  teachingHoursPerWeek: number;
  academicYearId: string;
  semesterNumber: 1 | 2;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  classId: string;
  nisn: string;
  nis?: string;
  fullName: string;
  gender: 'L' | 'P';
  specialNeeds?: string;
  initialDiagnosticNotes?: string;
  status: 'AKTIF' | 'MUTASI' | 'KELUAR';
  seatingPosition?: {
    row: number;
    col: number;
  };
  bonusPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
  timestamp: string;
}

export interface AttendanceMeeting {
  id: string;
  classId: string;
  meetingNumber: number;
  date: string;
  topic?: string;
  records: Record<string, AttendanceStatus>; // studentId -> status
  notes?: string;
  journalEntry?: string;
}

export interface TujuanPembelajaran {
  id: string; // UUID v4
  classId: string;
  cpElement: string;
  code: string; // e.g. "TP-01"
  description: string;
  bloomLevel: 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';
  scope: string; // Materi Pokok
  allocatedHours: number;
  kktpModel: KktpModel;
  kktpThreshold: number; // e.g. 75
  kktpRubricLevels?: {
    level: 1 | 2 | 3 | 4;
    label: string; // e.g. "Perlu Bimbingan", "Cukup", "Baik", "Sangat Baik"
    description: string;
    minScore: number;
    maxScore: number;
  }[];
}

export interface AssessmentItem {
  id: string;
  classId: string;
  tpId: string; // terikat ke TP unik
  title: string;
  type: 'FORMATIF' | 'SUMATIF_MATERI' | 'SUMATIF_AKHIR';
  weight: number;
  maxScore: number;
  date: string;
}

export interface StudentScore {
  id: string;
  assessmentId: string;
  studentId: string;
  tpId: string;
  rawScore: number;
  remedialScore?: number;
  finalScore: number;
  isPassed: boolean;
  feedback?: string;
  updatedAt: string;
}

export interface BonusPointLog {
  id: string;
  studentId: string;
  classId: string;
  tpId?: string;
  points: number; // e.g. +1, +5
  reason: string;
  timestamp: string;
  authorId: string;
}

export interface ModulAjar {
  id: string;
  classId: string;
  tpId: string;
  meetingNumber: number;
  topic: string;
  durationMinutes: number;
  targetProfilLulusan: string[]; // 8 Dimensi Profil Pelajar Pancasila
  targetPesertaDidik: string;
  modelPembelajaran: string; // e.g. Problem-Based Learning
  pemahamanBermakna: string;
  pertanyaanPemantik: string[];
  kegiatanPembelajaran: {
    pendahuluan: { timeMinutes: number; activities: string[] };
    inti: { timeMinutes: number; activities: string[]; differentiation?: { type: 'KONTEN' | 'PROSES' | 'PRODUK'; guide: string } };
    penutup: { timeMinutes: number; activities: string[] };
  };
  asesmen: {
    formatif: string;
    sumatif?: string;
    rubrik: string;
  };
  refleksiGuru: string[];
  refleksiSiswa: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LKPD {
  id: string;
  modulAjarId: string;
  meetingNumber: number;
  title: string;
  petunjukBelajar: string[];
  aktivitas: {
    sectionTitle: string;
    instructions: string;
    tasks: string[];
    answerSpace: 'ESSAY' | 'TABLE' | 'DRAWING';
  }[];
  rubrikPenilaian: string;
  teacherAnswerKey: string; // Hanya untuk versi guru
}

