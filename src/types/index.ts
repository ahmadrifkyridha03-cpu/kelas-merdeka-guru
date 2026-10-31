/**
 * Core Data Models & Schemas for KelasMerdeka
 * Aligned with Kepmendikbudristek No. 032/H/KR/2024, Panduan Pembelajaran dan Asesmen 2024,
 * UU PDP No. 27/2022, and Official Sekolah Islam Athirah Curriculum Standards.
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

// Backward-compatible alias
export type ClassItem = ClassSection;

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

// Backward-compatible alias
export type AttendanceRecord = AttendanceEntry;

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

// Backward-compatible alias
export type TP = TujuanPembelajaran;

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

/* ========================================================================= */
/* SEKOLAH ISLAM ATHIRAH CURRICULUM DATA MODELS (OFFICIAL SPECIFICATION)    */
/* ========================================================================= */

export type AthirahUnit = 
  | 'SD Islam Athirah 1 Makassar'
  | 'SD Islam Athirah 2 Bukit Baruga'
  | 'SMP Islam Athirah Kajaolalido'
  | 'SMP Islam Athirah Bukit Baruga'
  | 'SMP Islam Athirah Bone'
  | 'SMA Islam Athirah 1 Makassar'
  | 'SMA Islam Athirah Bukit Baruga'
  | 'SMA Islam Athirah Bone';

export type AthirahProfilLulusan =
  | 'ANGGUN_BERAKHLAK'             // Beriman, Bertakwa & Berakhlak Mulia
  | 'UNGGUL_PRESTASINYA'           // Cerdas Berpikir & Akademik
  | 'KOKOH_SPIRITUALNYA'           // Teguh Aqidah & Tertib Ibadah
  | 'TANGGUH_KARAKTERNYA'          // Mandiri & Kepemimpinan
  | 'BERWAWASAN_GLOBAL_LINGKUNGAN' // Eco-Minded & Global Mindset
  | 'BERNALAR_KRITIS'              // Analitis & Evaluatif
  | 'KREATIF_INOVATIF'             // Solutif & Orisinal
  | 'BERGOTONG_ROYONG';            // Kolaboratif & Peduli Sesama

export type ProgramKhasRenstra =
  | 'ATHIRAH_BERQURAN'             // Tahsin, Tahfidz, Tadabbur
  | 'BILINGUAL_IMMERSION'          // English & Arabic Daily
  | 'DIGITAL_TRANSFORMATION'       // Smart School & AI Ethics
  | 'ECO_SCHOOL_ADIWIYATA'         // Konservasi Lingkungan
  | 'LEADER_IN_ME'                 // 7 Habits of Highly Effective People
  | 'KALLA_CORE_VALUES';           // Kerja Keras, Lebih Cepat, Jujur, Bersama

export type PedagogiMerdekaPrinciple =
  | 'BERKESADARAN'                 // Mindful [Biru - #2563EB]
  | 'BERMAKNA'                     // Meaningful [Hijau - #16A34A]
  | 'MENGGEMBIRAKAN';              // Joyful [Orange - #EA580C]

export type MatriksPenguatanCode =
  | 'MH-1' | 'MH-2' | 'MH-3'       // Memahami (LOTS C1, MOTS C2, HOTS C4)
  | 'MA-1' | 'MA-2' | 'MA-3'       // Mengaplikasi (Prosedural C3, Semi-Mandiri C3-C4, Kreasi C5-C6)
  | 'MR-1' | 'MR-2' | 'MR-3';      // Merefleksi (Metakognisi, Evaluasi Kritis, Spiritual Action)

export interface AyatAlQuran {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translationId: string;
  contextualTafsir: string;        // Relevansi konsep materi dengan ayat
}

export interface HaditsShahih {
  narrator: string;                // e.g. "HR. Al-Bukhari & Muslim"
  arabicText: string;
  translationId: string;
  pedagogicalMeaning: string;      // Nilai karakter yang ditekankan
}

export interface SirahTokohIslam {
  figureName: string;              // e.g. "Al-Khwarizmi", "Ibnu Al-Haitsam"
  historicalEra: string;
  contribution: string;
  inspirationalValue: string;
}

export interface KitabFatwaRujukan {
  title: string;                   // e.g. "Al-Jabr wa Al-Muqabala" / "Fatwa MUI"
  authorOrIssuer: string;
  ethicalGuideline: string;
}

export interface SpiritualisasiAthirah {
  quranVerse: AyatAlQuran;
  hadith?: HaditsShahih;
  islamicHistory?: SirahTokohIslam;
  classicalTextOrFatwa?: KitabFatwaRujukan;
  coreSpiritualValue: string;      // e.g. "Itqan, Amanah, Keteraturan Sunnatullah"
}

export interface TujuanPembelajaranABCD {
  audience: string;                // A: Peserta didik kelas X
  behavior: string;                // B: menganalisis algoritma pemilahan data (C4)
  condition: string;               // C: melalui simulasi kartu interaktif
  degree: string;                  // D: dengan tepat minimal 3 tahapan iterasi
  integratedSpiritualGoal: string; // TP Spiritual
  fullStatement: string;           // Rumusan utuh TP
}

export interface PedagogicalPractices {
  modelPembelajaran: string;       // e.g. "Problem-Based Learning"
  metodePembelajaran: string[];    // e.g. ["Simulasi", "Diskusi Terarah", "Presentasi"]
  diferensiasiKonten: string;
  diferensiasiProses: string;
  diferensiasiProduk: string;
}

export interface MediaDanLingkungan {
  mediaFisik: string[];
  sumberDigital: string[];
  lingkunganBelajar: string[];
  kemitraan: string[];             // e.g. ["Paguyuban Orang Tua", "Yayasan Kalla"]
}

export interface AktivitasLangkahPembelajaran {
  stepNumber: number;
  phase: 'MEMAHAMI' | 'MENGAPLIKASI' | 'MEREFLEKSI';
  title: string;
  durationMinutes: number;
  teacherActivity: string;
  studentActivity: string;
  pmPrinciple: PedagogiMerdekaPrinciple; // BERKESADARAN, BERMAKNA, MENGGEMBIRAKAN
  matrixCode: MatriksPenguatanCode;       // MH-1..3, MA-1..3, MR-1..3
  differentiatedTier?: 'TIER_1_BIMBINGAN' | 'TIER_2_REGULER' | 'TIER_3_MANDIRI';
}

export interface ItemLampiranAsesmen {
  no: number;
  materiPokok: string;
  tpCode: string;
  tpDescription: string;
  indikatorAsesmen: string;
  jenisAsesmen: 'TULIS' | 'NONTULIS';
  uraianSoalTertulis?: string;
  deskripsiAktivitasNontulis?: string;
  isLkpdAttached: boolean;          // Checkbox ✓/✗
}

export interface ModulAjarAthirah {
  id: string;
  // 1. Identitas
  identitas: {
    unit: AthirahUnit;
    kelas: string;
    fase: KurikulumFase;
    mataPelajaran: string;
    materiPokok: string;
    durasiPertemuanMinutes: number;
    alokasiWaktuDisplay: string;   // e.g. "3 JP (3 x 45 Menit)"
    pertemuanKe: number;
    semester: 1 | 2;
    tahunAjaran: string;
    namaPenyusun: string;
  };
  // 2. Identifikasi
  identifikasi: {
    profilLulusanAthirah: AthirahProfilLulusan[];
    programKhasRenstra: ProgramKhasRenstra[];
    kosmologiKurikulumNote: string;
  };
  // 3. Spiritualisasi
  spiritualisasi: SpiritualisasiAthirah;
  // 4. Desain Pembelajaran
  desainPembelajaran: {
    tujuanPembelajaran: TujuanPembelajaranABCD;
    pedagogicalPractices: PedagogicalPractices;
    mediaDanLingkungan: MediaDanLingkungan;
  };
  // 5. Pengalaman Belajar
  pengalamanBelajar: {
    memahami: AktivitasLangkahPembelajaran[];
    mengaplikasi: AktivitasLangkahPembelajaran[];
    merefleksi: AktivitasLangkahPembelajaran[];
  };
  // 6. Lampiran Asesmen
  lampiranAsesmen: ItemLampiranAsesmen[];
  
  associatedLkpdId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LkpdActivityTier {
  tierLevel: 1 | 2 | 3;
  targetGroup: 'PERLU_BIMBINGAN' | 'REGULER' | 'MAHIR';
  instructions: string;
  hintsOrScaffolding?: string;
  taskPrompt: string;
  answerType: 'ESSAY' | 'TABLE' | 'FLOWCHART' | 'CHECKLIST';
  modelAnswer?: string;            // Khusus versi guru
  scoreWeight: number;             // e.g. 30
}

export interface LkpdAthirah {
  id: string;
  modulAjarId: string;
  meetingNumber: number;
  unit: AthirahUnit;
  mataPelajaran: string;
  kelas: string;
  materiPokok: string;
  alokasiWaktuMinutes: number;
  
  // Pembuka Islami & Adab
  openingDuaAndAdab: {
    bismillahText: string;
    ayatStimulusSnippet: string;
    adabBelajarTips: string[];
  };
  
  // Wacana Kontekstual Autentik
  contextualStimulus: {
    title: string;
    narrative: string;
    sourceOrDataUrl?: string;
  };
  
  // Aktivitas 3M Berjenjang
  aktivitasSiswa: {
    faseMemahami: LkpdActivityTier[];
    faseMengaplikasi: LkpdActivityTier[];
    faseMerefleksi: LkpdActivityTier[];
  };
  
  // Khusus Versi Guru
  guruAnswerKeyGuide?: {
    exemplarAnswersByTier: Record<string, string>;
    misconceptionAnticipations: Array<{ misconception: string; remedy: string }>;
    differentiationActionGuide: Array<{ condition: string; action: string }>;
    rubrikPenilaian4Level: Array<{
      aspek: string;
      skor1_perluBimbingan: string;
      skor2_cukup: string;
      skor3_baik: string;
      skor4_mahir: string;
      bobotNilai: number;
    }>;
    mappedGradebookTpId: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface GenerateAthirahModulAjarParams {
  unit: AthirahUnit;
  subject: string;
  gradeLevel: string;
  fase: KurikulumFase;
  materiPokok: string;
  meetingNumber: number;
  durationMinutes: number;
  tpDescription: string;
  renstraPrograms?: ProgramKhasRenstra[];
}

export interface GenerateAthirahModulAjarResult {
  success: boolean;
  modulAjar?: ModulAjarAthirah;
  lkpdSiswa?: LkpdAthirah;
  lkpdGuruKunci?: LkpdAthirah;
  isFallback?: boolean;
  message?: string;
  error?: string;
}

export interface GeneratedTP {
  code: string;
  description: string;
  bloomLevel: string;
  scope: string;
  allocatedHours: number;
  kktpThreshold: number;
  kktpModel: string;
}
