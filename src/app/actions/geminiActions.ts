"use server";

import { GoogleGenAI } from "@google/genai";
import type {
  GenerateAthirahModulAjarParams,
  GenerateAthirahModulAjarResult,
  ModulAjarAthirah,
  LkpdAthirah,
} from "../../types/index.ts";

/**
 * Konfigurasi Standar Google GenAI Server Actions
 * - Model: gemini-2.0-flash (resmi production)
 * - Timeout: 15.000 ms (15 detik) via AbortSignal
 * - Resiliensi: Full Offline / Fallback Generator saat API Key tidak ada atau koneksi gagal
 */
const GEMINI_MODEL = "gemini-2.0-flash";
const API_TIMEOUT_MS = 15000;

export async function getGeminiModel(): Promise<string> {
  return GEMINI_MODEL;
}

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

/**
 * Pembungkus Promise dengan AbortSignal & batas waktu 15 detik
 */
async function withTimeout<T>(
  action: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number = API_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(
      new Error(`Permintaan ke Gemini API melebihi batas waktu ${timeoutMs / 1000} detik.`)
    );
  }, timeoutMs);

  try {
    const promise = action(controller.signal);
    const timeoutPromise = new Promise<never>((_, reject) => {
      controller.signal.addEventListener("abort", () => {
        reject(controller.signal.reason || new Error("Request timed out"));
      });
    });
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Pembersih teks JSON dari format markdown
 */
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

import type { GeneratedTP } from "@/types";
export type { GeneratedTP };

/**
 * Offline Fallback Generator untuk Tujuan Pembelajaran (TP)
 */
function getFallbackTPs(subject: string, fase: string): GeneratedTP[] {
  const s = subject.toLowerCase();
  if (s.includes("informatika")) {
    return [
      {
        code: "TP-01",
        description: `Menerapkan strategi algoritmik standar untuk menyelesaikan persoalan optimasi, pemilahan data (sorting), dan pencarian (searching) pada Fase ${fase}.`,
        bloomLevel: "C3",
        scope: "Algoritma Pemilahan dan Pencarian Data",
        allocatedHours: 6,
        kktpThreshold: 75,
        kktpModel: "INTERVAL_NILAI",
      },
      {
        code: "TP-02",
        description: "Mengintegrasikan berbagai aplikasi perkantoran untuk menghasilkan dokumen laporan terstruktur dan terotomasi berbasis data.",
        bloomLevel: "C4",
        scope: "Integrasi Konten Aplikasi Perkantoran",
        allocatedHours: 9,
        kktpThreshold: 75,
        kktpModel: "RUBRIK_SKALA",
      },
      {
        code: "TP-03",
        description: "Menganalisis arsitektur internal perangkat keras, sistem operasi, dan komunikasi jaringan komputer lokal maupun internet.",
        bloomLevel: "C4",
        scope: "Sistem Komputer & Jaringan",
        allocatedHours: 6,
        kktpThreshold: 75,
        kktpModel: "INTERVAL_NILAI",
      },
      {
        code: "TP-04",
        description: "Mengevaluasi aspek hukum, privasi data pribadi, dan etika pemanfaatan teknologi informasi di ruang siber.",
        bloomLevel: "C5",
        scope: "Dampak Sosial Informatika & Etika Siber",
        allocatedHours: 6,
        kktpThreshold: 75,
        kktpModel: "DESKRIPSI_KRITERIA",
      },
    ];
  }

  // Fallback umum mata pelajaran lainnya
  return [
    {
      code: "TP-01",
      description: `Mengidentifikasi konsep esensial dan prinsip dasar ${subject} sesuai capaian pembelajaran Fase ${fase}.`,
      bloomLevel: "C2",
      scope: `Konsep Dasar ${subject}`,
      allocatedHours: 6,
      kktpThreshold: 75,
      kktpModel: "INTERVAL_NILAI",
    },
    {
      code: "TP-02",
      description: `Menganalisis keterkaitan konsep materi ${subject} dalam menyelesaikan masalah kontekstual nyata.`,
      bloomLevel: "C4",
      scope: `Aplikasi Konseptual ${subject}`,
      allocatedHours: 9,
      kktpThreshold: 75,
      kktpModel: "RUBRIK_SKALA",
    },
    {
      code: "TP-03",
      description: `Merancang proyek kolaboratif berbasis pemecahan masalah dengan menerapkan kaidah ${subject}.`,
      bloomLevel: "C6",
      scope: `Proyek Aplikasi ${subject}`,
      allocatedHours: 9,
      kktpThreshold: 75,
      kktpModel: "INTERVAL_NILAI",
    },
  ];
}

/**
 * 1. Otomasi Penurunan CP -> Tujuan Pembelajaran (TP)
 */
export async function generateTPFromCPAction(params: {
  subject: string;
  fase: string;
  cpText: string;
}): Promise<{
  success: boolean;
  data?: GeneratedTP[];
  isFallback?: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const ai = getClient();
    if (!ai) {
      // Offline fallback jika GEMINI_API_KEY tidak dikonfigurasi
      return {
        success: true,
        data: getFallbackTPs(params.subject, params.fase),
        isFallback: true,
        message:
          "Kunci GEMINI_API_KEY belum dikonfigurasi. Menampilkan Tujuan Pembelajaran terstandarisasi BSKAP 032/H/KR/2024 (Mode Offline).",
      };
    }

    const prompt = `Anda adalah Asisten Kurikulum Merdeka Kemendikbudristek RI berstandar Keputusan Kepala BSKAP No. 032/H/KR/2024.
Tugas Anda: Dekonstruksi Capaian Pembelajaran (CP) berikut menjadi 3 sampai 4 Tujuan Pembelajaran (TP) terstruktur.

Mata Pelajaran: ${params.subject}
Fase: ${params.fase}
Teks Capaian Pembelajaran (CP):
"""
${params.cpText}
"""

Instruksi Khusus:
1. Setiap TP harus memuat Kompetensi (Kata Kerja Operasional Taksonomi Bloom C1-C6) dan Lingkup Materi Pokok yang jelas.
2. Alokasikan jam pelajaran (JP) realistis (misal 3, 6, atau 9 JP).
3. Berikan ambang tuntas KKTP (misal 75).
4. WAJIB mengembalikan HANYA format JSON valid tanpa tanda kutip markdown pembungkus.

Format JSON yang diharapkan:
[
  {
    "code": "TP-01",
    "description": "...",
    "bloomLevel": "C3",
    "scope": "...",
    "allocatedHours": 6,
    "kktpThreshold": 75,
    "kktpModel": "INTERVAL_NILAI"
  }
]`;

    const response = await withTimeout(async () => {
      return await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
    });

    const rawText = response.text || "[]";
    const cleaned = cleanJsonOutput(rawText);
    const parsed: GeneratedTP[] = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return { success: true, data: parsed, isFallback: false };
    }

    // Jika parsing kosong, fallback ke template
    return {
      success: true,
      data: getFallbackTPs(params.subject, params.fase),
      isFallback: true,
      message: "Respons AI tidak menghasilkan array TP yang valid. Menggunakan data cadangan resmi.",
    };
  } catch (err: any) {
    console.warn("[geminiActions.generateTPFromCPAction] Error caught, using fallback:", err);
    return {
      success: true,
      data: getFallbackTPs(params.subject, params.fase),
      isFallback: true,
      message: `Terjadi kendala jaringan (${err.message || "Timeout"}). Menggunakan data kurikulum terstandarisasi BSKAP 032.`,
    };
  }
}

/**
 * 2. Otomasi Pembuatan Modul Ajar Lengkap & LKPD Per Pertemuan (Format Standar / Kompatibel)
 */
export async function generateLessonPlanAndLKPDAction(params: {
  meetingNumber: number;
  tpDescription: string;
  durationMinutes: number;
  gradeLevel: string;
}): Promise<{
  success: boolean;
  modulAjar?: any;
  lkpdSiswa?: string;
  lkpdGuruKunci?: string;
  isFallback?: boolean;
  message?: string;
  error?: string;
}> {
  const fallbackModul = {
    pemahamanBermakna: `Peserta didik menyadari bahwa penguasaan kompetensi "${params.tpDescription.slice(0, 80)}" berperan esensial dalam memecahkan masalah kontekstual kehidupan sehari-hari dengan prinsip keteraturan dan ketelitian.`,
    pertanyaanPemantik: [
      "Bagaimana konsep ini dapat membantu menyelesaikan persoalan di sekitar kita secara efektif?",
      "Mengapa keteraturan berpikir dan ketelitian sangat penting dalam proses penyelidikan ini?",
    ],
    profilPelajar: ["Penalaran Kritis", "Kreativitas", "Gotong Royong"],
    modelPembelajaran: "Problem-Based Learning",
    kegiatan: {
      pendahuluan: "15 Menit: Pembiasaan salam dan doa bersama berkesadaran, apersepsi keterkaitan materi dengan fenomena nyata, penyampaian tujuan pembelajaran.",
      inti: `${Math.max(30, params.durationMinutes - 30)} Menit: Orientasi masalah kontekstual, pembagian kelompok heterogen berjenjang (scaffolding 3-tier), penyelidikan dan pengerjaan LKPD kolaboratif, presentasi dan diskusi kelas.`,
      penutup: "15 Menit: Refleksi metakognitif (evaluasi capaian dan kendala), penegasan nilai hikmah dan etika belajar, doa penutup.",
    },
    lkpdSiswa: `LEMBAR KERJA PESERTA DIDIK (LKPD)\nPertemuan ke-${params.meetingNumber}\nTopik: ${params.tpDescription}\n\nPetunjuk Belajar:\n1. Berdoalah sebelum memulai kegiatan kelompok.\n2. Lakukan diskusi secara kolaboratif dan saling menghargai pendapat rekan tim.\n3. Lengkapi tabel pengamatan dan jawab pertanyaan analisis pada lembar respon yang disediakan.`,
    lkpdGuruKunci: `PANDUAN GURU & KUNCI JAWABAN LKPD\nPertemuan ke-${params.meetingNumber}\n\n1. Kunci Jawaban Model: Seluruh tahapan diselesaikan dengan runut sesuai rubrik ketercapaian.\n2. Rubrik Penskoran: Sangat Baik (Skor 4), Baik (Skor 3), Cukup (Skor 2), Perlu Bimbingan (Skor 1).\n3. Antisipasi Miskonsepsi: Berikan bimbingan terstruktur pada kelompok bimbingan (Tier 1) dan berikan studi kasus terbuka untuk kelompok mahir (Tier 3).`,
  };

  try {
    const ai = getClient();
    if (!ai) {
      return {
        success: true,
        modulAjar: fallbackModul,
        lkpdSiswa: fallbackModul.lkpdSiswa,
        lkpdGuruKunci: fallbackModul.lkpdGuruKunci,
        isFallback: true,
        message: "Kunci GEMINI_API_KEY tidak ditemukan. Modul Ajar dan LKPD dibangkitkan menggunakan template baku (Mode Offline).",
      };
    }

    const prompt = `Anda adalah Pakar Desain Instruksional Kurikulum Merdeka.
Buatlah Modul Ajar Pertemuan ke-${params.meetingNumber} beserta Lembar Kerja Peserta Didik (LKPD).

Tujuan Pembelajaran: ${params.tpDescription}
Tingkat Kelas: ${params.gradeLevel}
Alokasi Waktu: ${params.durationMinutes} Menit

Format Output WAJIB JSON:
{
  "pemahamanBermakna": "...",
  "pertanyaanPemantik": ["...", "..."],
  "profilPelajar": ["Penalaran Kritis", "Kreativitas", "Gotong Royong"],
  "modelPembelajaran": "Problem-Based Learning",
  "kegiatan": {
    "pendahuluan": "15 Menit: ...",
    "inti": "${Math.max(30, params.durationMinutes - 30)} Menit: ...",
    "penutup": "15 Menit: ..."
  },
  "lkpdSiswa": "Petunjuk aktivitas siswa, instruksi kerja kelompok, dan tabel jawaban...",
  "lkpdGuruKunci": "Kunci jawaban lengkap, rubrik penilaian, dan pedoman penskoran..."
}`;

    const response = await withTimeout(async () => {
      return await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
    });

    const rawText = response.text || "{}";
    const cleaned = cleanJsonOutput(rawText);
    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      modulAjar: parsed,
      lkpdSiswa: parsed.lkpdSiswa || fallbackModul.lkpdSiswa,
      lkpdGuruKunci: parsed.lkpdGuruKunci || fallbackModul.lkpdGuruKunci,
      isFallback: false,
    };
  } catch (err: any) {
    console.warn("[geminiActions.generateLessonPlanAndLKPDAction] Error, returning fallback:", err);
    return {
      success: true,
      modulAjar: fallbackModul,
      lkpdSiswa: fallbackModul.lkpdSiswa,
      lkpdGuruKunci: fallbackModul.lkpdGuruKunci,
      isFallback: true,
      message: `Terjadi kendala API (${err.message || "Timeout"}). Modul Ajar dihasilkan menggunakan template kurikulum terstandar.`,
    };
  }
}

/**
 * 3. Otomasi Generator Soal Remedial / Pengayaan Berdasarkan TP
 */
export async function generateRemedialTaskAction(params: {
  studentName: string;
  tpCode: string;
  tpDescription: string;
  score: number;
  kktp: number;
}): Promise<{
  success: boolean;
  taskText?: string;
  isFallback?: boolean;
  message?: string;
  error?: string;
}> {
  const fallbackTask = `LEMBAR TUGAS REMEDIAL ADAPTIF
Nama Peserta Didik: ${params.studentName}
Tujuan Pembelajaran (${params.tpCode}): ${params.tpDescription}
Ambang Ketuntasan (KKTP): ${params.kktp} | Nilai Saat Ini: ${params.score}

Instruksi Belajar Terarah:
Ananda ${params.studentName}, tugas remedial ini disusun untuk membantumu memperkuat pemahaman konsep dasar langkah-demi-langkah.

Soal 1 (Eksplorasi Konsep Dasar):
Uraikan kembali konsep utama pada ${params.tpDescription} dengan bahasamu sendiri, lalu berikan 1 contoh kasus penerapannya dalam kehidupan sehari-hari!

Soal 2 (Penyelesaian Masalah Terbimbing):
Diberikan situasi sederhana terkait ${params.tpDescription}. Identifikasi langkah-langkah solusi logis untuk menyelesaikan permasalahan tersebut secara runut!

---
KUNCI & PANDUAN PENSKORAN GURU (PANDUAN INTERNAL):
- Rubrik: Kemampuan menjelaskan konsep dasar (bobot 50%), ketepatan langkah solusi (bobot 50%).
- Nilai Ketuntasan Maksimal Pasca-Remedial: Setara batas KKTP (${params.kktp}).
- Rekomendasi: Berikan pendampingan teman sebaya jika siswa masih menemui kesulitan pada langkah identifikasi.`;

  try {
    const ai = getClient();
    if (!ai) {
      return {
        success: true,
        taskText: fallbackTask,
        isFallback: true,
        message: "Kunci GEMINI_API_KEY belum terpasang. Menampilkan lembar tugas remedial adaptif resmi (Mode Offline).",
      };
    }

    const prompt = `Buatkan 2 butir soal remedial adaptif berbasis pemecahan masalah kontekstual untuk siswa yang belum mencapai KKTP pada Tujuan Pembelajaran berikut:

Nama Siswa: ${params.studentName}
Nilai Saat Ini: ${params.score} (Ambang KKTP: ${params.kktp})
Tujuan Pembelajaran (${params.tpCode}): ${params.tpDescription}

Format Instruksi:
1. Sapa siswa dengan ramah dan suportif.
2. Berikan 2 soal berjenjang (Soal 1 penguatan konsep, Soal 2 penerapan sederhana).
3. Di bagian akhir, sertakan Kunci Jawaban Singkat & Rubrik Penskoran untuk guru.`;

    const response = await withTimeout(async () => {
      return await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });
    });

    const text = response.text || "";
    if (text.trim()) {
      return { success: true, taskText: text, isFallback: false };
    }

    return {
      success: true,
      taskText: fallbackTask,
      isFallback: true,
      message: "Respons AI kosong. Menggunakan lembar tugas remedial cadangan.",
    };
  } catch (err: any) {
    console.warn("[geminiActions.generateRemedialTaskAction] Error, returning fallback:", err);
    return {
      success: true,
      taskText: fallbackTask,
      isFallback: true,
      message: `Terjadi kendala jaringan (${err.message || "Timeout"}). Menampilkan lembar tugas remedial cadangan.`,
    };
  }
}

/**
 * 4. Otomasi Generator Modul Ajar Resmi Sekolah Islam Athirah & LKPD Dual-Version
 */
export async function generateAthirahModulAjarAction(
  params: GenerateAthirahModulAjarParams
): Promise<GenerateAthirahModulAjarResult> {
  const now = new Date().toISOString();
  const durasiMenit = params.durationMinutes || 135;
  const jpCount = Math.round(durasiMenit / 45);

  const fallbackAthirahModul: ModulAjarAthirah = {
    id: `modul-athirah-${Date.now()}`,
    identitas: {
      unit: params.unit,
      kelas: params.gradeLevel,
      fase: params.fase,
      mataPelajaran: params.subject,
      materiPokok: params.materiPokok,
      durasiPertemuanMinutes: durasiMenit,
      alokasiWaktuDisplay: `${jpCount} JP (${durasiMenit} Menit)`,
      pertemuanKe: params.meetingNumber,
      semester: 1,
      tahunAjaran: "2026/2027",
      namaPenyusun: "Guru Mata Pelajaran Sekolah Islam Athirah",
    },
    identifikasi: {
      profilLulusanAthirah: [
        "ANGGUN_BERAKHLAK",
        "KOKOH_SPIRITUALNYA",
        "UNGGUL_PRESTASINYA",
        "BERNALAR_KRITIS",
      ],
      programKhasRenstra: params.renstraPrograms || [
        "ATHIRAH_BERQURAN",
        "KALLA_CORE_VALUES",
        "DIGITAL_TRANSFORMATION",
      ],
      kosmologiKurikulumNote:
        "Memadukan pemahaman Ayat Kauniyah (sains dan teknologi terapan) dengan Ayat Qauliyah (Al-Quran & Sunnah) dalam kerangka Tauhid terintegrasi.",
    },
    spiritualisasi: {
      quranVerse: {
        surahNumber: 54,
        surahName: "Al-Qamar",
        ayahNumber: 49,
        arabicText: "إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ",
        translationId:
          "Sungguh, Kami menciptakan segala sesuatu menurut ukuran (takaran dan algoritma yang tepat).",
        contextualTafsir: `Pembelajaran materi ${params.materiPokok} mencerminkan bagaimana Allah SWT telah merancang alam semesta dengan ukuran, keteraturan, dan ketelitian yang sempurna.`,
      },
      hadith: {
        narrator: "HR. Al-Bukhari & Muslim",
        arabicText: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ",
        translationId:
          "Sesungguhnya Allah mencintai seseorang di antara kalian yang apabila mengerjakan suatu pekerjaan, ia melakukannya secara itqan (profesional, tekun, dan rapi).",
        pedagogicalMeaning:
          "Melatih peserta didik menyelesaikan tugas dan pemecahan masalah dengan sikap itqan, teliti, dan penuh tanggung jawab.",
      },
      islamicHistory: {
        figureName: "Abu Ja'far Muhammad bin Musa Al-Khwarizmi",
        historicalEra: "Zaman Keemasan Islam (Baitul Hikmah, Baghdad)",
        contribution:
          "Peletak dasar konsep algoritma dan aljabar sistematis yang menjadi fondasi komputasi dan sains modern.",
        inspirationalValue:
          "Meneladani integritas ilmuwan Muslim yang mendedikasikan riset sains demi kemaslahatan ibadah dan peradaban umat.",
      },
      coreSpiritualValue: "Itqan, Amanah, Keteraturan Sunnatullah, dan Syukur",
    },
    desainPembelajaran: {
      tujuanPembelajaran: {
        audience: `Peserta didik Kelas ${params.gradeLevel} (${params.unit})`,
        behavior: `menganalisis dan menerapkan konsep ${params.materiPokok}`,
        condition: "melalui simulasi kontekstual, studi kasus terarah, dan kolaborasi kelompok",
        degree: "dengan tepat, terukur, dan berlandaskan sikap itqan",
        integratedSpiritualGoal:
          "Mengagumi keteraturan ciptaan Allah SWT serta menunjukkan adab islami dalam berkolaborasi.",
        fullStatement: `Peserta didik mampu menerapkan konsep ${params.materiPokok} melalui penyelidikan kolaboratif terpadu secara tepat, kritis, dan berkarakter islami.`,
      },
      pedagogicalPractices: {
        modelPembelajaran: "Problem-Based Learning (PBL) Terpadu",
        metodePembelajaran: ["Eksplorasi Konsep", "Diskusi Terarah", "Praktik Kolaboratif", "Refleksi"],
        diferensiasiKonten: "Penyediaan modul bacaan teks, infografis visual, dan kartu konsep.",
        diferensiasiProses: "Scaffolding 3-tier (Tier 1 bimbingan terstruktur, Tier 2 mandiri, Tier 3 pengayaan eksploratif).",
        diferensiasiProduk: "Ragam bentuk laporan respon (tabel analisis, diagram alir, atau simpulan ringkas).",
      },
      mediaDanLingkungan: {
        mediaFisik: ["Kartu Aktivitas", "Papan Pajang Refleksi", "Lembar Kerja Kertas"],
        sumberDigital: ["Platform Athirah Smart School", "Al-Quran Digital Kemenag", "Slide Presentasi Interaktif"],
        lingkunganBelajar: ["Ruang Kelas Kolaboratif Meja Melingkar", "Laboratorium Komputer"],
        kemitraan: ["Paguyuban Orang Tua Murid (POMD)", "Yayasan Hadji Kalla"],
      },
    },
    pengalamanBelajar: {
      memahami: [
        {
          stepNumber: 1,
          phase: "MEMAHAMI",
          title: "Orientasi Berkesadaran & Tadabbur Kalamullah",
          durationMinutes: 15,
          teacherActivity: "Membuka kelas dengan salam islami, memandu doa, dan membacakan ayat Al-Quran terkait topik.",
          studentActivity: "Menyimak dengan khusyuk, melafalkan doa, dan merefleksikan makna ayat dalam konteks materi.",
          pmPrinciple: "BERKESADARAN",
          matrixCode: "MH-1",
        },
        {
          stepNumber: 2,
          phase: "MEMAHAMI",
          title: "Apersepsi Bermakna & Bedah Kasus Kontekstual",
          durationMinutes: 20,
          teacherActivity: "Menyajikan fenomena autentik di lingkungan sekitar dan mengajukan pertanyaan pemantik.",
          studentActivity: "Mengemukakan gagasan awal, menganalisis keterkaitan konsep dengan realitas kehidupan.",
          pmPrinciple: "BERMAKNA",
          matrixCode: "MH-2",
        },
      ],
      mengaplikasi: [
        {
          stepNumber: 3,
          phase: "MENGAPLIKASI",
          title: "Penyelidikan Kolaboratif & Pengerjaan LKPD Berjenjang",
          durationMinutes: 50,
          teacherActivity: "Memfasilitasi kerja kelompok berjenjang (scaffolding tier 1-3) dan memberikan intervensi terarah.",
          studentActivity: "Bekerja sama dalam kelompok, membagi tugas, dan menyelesaikan tantangan pada LKPD.",
          pmPrinciple: "MENGGEMBIRAKAN",
          matrixCode: "MA-2",
          differentiatedTier: "TIER_2_REGULER",
        },
        {
          stepNumber: 4,
          phase: "MENGAPLIKASI",
          title: "Presentasi Solusi & Uji Gagasan Antarkelompok",
          durationMinutes: 30,
          teacherActivity: "Mengatur alur presentasi kelompok dan memoderasi sesi tanya jawab antarteman.",
          studentActivity: "Mempresentasikan hasil kerja kelompok, menanggapi masukan rekan dengan adab yang santun.",
          pmPrinciple: "BERMAKNA",
          matrixCode: "MA-3",
        },
      ],
      merefleksi: [
        {
          stepNumber: 5,
          phase: "MEREFLEKSI",
          title: "Sintesis Konsep, Penilaian Diri & Komitmen Amaliyah",
          durationMinutes: 20,
          teacherActivity: "Membimbing siswa merangkum benang merah materi dan menghubungkan kembali dengan nilai spiritual itqan.",
          studentActivity: "Mengisi instrumen refleksi diri/antarteman, menarik simpulan, dan menutup pembelajaran dengan doa.",
          pmPrinciple: "BERKESADARAN",
          matrixCode: "MR-3",
        },
      ],
    },
    lampiranAsesmen: [
      {
        no: 1,
        materiPokok: params.materiPokok,
        tpCode: "TP-01",
        tpDescription: params.tpDescription,
        indikatorAsesmen: "Mampu menjelaskan dan menganalisis tahapan pemecahan masalah dengan tepat.",
        jenisAsesmen: "TULIS",
        uraianSoalTertulis: "Uraikan 3 langkah sistematis dalam menganalisis permasalahan kontekstual pada materi ini!",
        isLkpdAttached: true,
      },
      {
        no: 2,
        materiPokok: params.materiPokok,
        tpCode: "TP-01",
        tpDescription: params.tpDescription,
        indikatorAsesmen: "Mampu mendemonstrasikan hasil kolaborasi tim dan mempresentasikan solusi dengan adab islami.",
        jenisAsesmen: "NONTULIS",
        deskripsiAktivitasNontulis: "Penilaian kinerja presentasi kelompok dan unjuk kerja pada lembar aktivitas kolaboratif.",
        isLkpdAttached: true,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const fallbackLkpdSiswa: LkpdAthirah = {
    id: `lkpd-siswa-${Date.now()}`,
    modulAjarId: fallbackAthirahModul.id,
    meetingNumber: params.meetingNumber,
    unit: params.unit,
    mataPelajaran: params.subject,
    kelas: params.gradeLevel,
    materiPokok: params.materiPokok,
    alokasiWaktuMinutes: durasiMenit,
    openingDuaAndAdab: {
      bismillahText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      ayatStimulusSnippet: "QS. Al-Qamar: 49 — Sungguh, Kami menciptakan segala sesuatu menurut ukuran yang tepat.",
      adabBelajarTips: [
        "Niat ikhlas menuntut ilmu karena Allah SWT.",
        "Mendengarkan rekan saat berbicara tanpa memotong pembicaraan.",
        "Menjunjung kejujuran data dan saling tolong-menolong dalam kebaikan.",
      ],
    },
    contextualStimulus: {
      title: `Eksplorasi Autentik: ${params.materiPokok}`,
      narrative: `Dalam kehidupan nyata, penguasaan ${params.materiPokok} sangat menentukan efisiensi dan keakuratan hasil. Melalui lembar kerja ini, kamu bersama kelompok akan menganalisis studi kasus nyata secara bertahap.`,
    },
    aktivitasSiswa: {
      faseMemahami: [
        {
          tierLevel: 1,
          targetGroup: "PERLU_BIMBINGAN",
          instructions: "Baca wacana pengantar di atas dan identifikasi 2 fakta penting yang menjadi dasar permasalahan!",
          taskPrompt: "Tuliskan 2 fakta penting yang kalian temukan pada teks stimulus:",
          answerType: "ESSAY",
          scoreWeight: 20,
        },
      ],
      faseMengaplikasi: [
        {
          tierLevel: 2,
          targetGroup: "REGULER",
          instructions: "Lakukan analisis pemecahan masalah bersama tim dan sajikan langkah-langkah penyelesaiannya secara berurutan!",
          taskPrompt: "Lengkapi tabel analisis solusi kelompok berikut:",
          answerType: "TABLE",
          scoreWeight: 50,
        },
      ],
      faseMerefleksi: [
        {
          tierLevel: 3,
          targetGroup: "MAHIR",
          instructions: "Tarik simpulan akhir dan refleksikan hikmah nilai keteraturan ciptaan Allah SWT dalam kegiatan belajarmu hari ini!",
          taskPrompt: "Bagaimana nilai itqan (ketelitian) membantumu menghasilkan solusi yang berkualitas?",
          answerType: "ESSAY",
          scoreWeight: 30,
        },
      ],
    },
    createdAt: now,
    updatedAt: now,
  };

  const fallbackLkpdGuruKunci: LkpdAthirah = {
    ...fallbackLkpdSiswa,
    id: `lkpd-guru-${Date.now()}`,
    guruAnswerKeyGuide: {
      exemplarAnswersByTier: {
        tier_1: "Jawaban model mencantumkan minimal 2 fakta terverifikasi dari stimulus dengan penjelasan logis.",
        tier_2: "Tabel analisis terisi lengkap dengan tahapan solusi runut, logis, dan bebas dari kesalahan fatal.",
        tier_3: "Refleksi mengintegrasikan pemahaman konsep teknis dengan kesadaran nilai itqan dan sikap syukur.",
      },
      misconceptionAnticipations: [
        {
          misconception: "Siswa mengira penyelesaian masalah hanya ada satu cara baku.",
          remedy: "Guru menegaskan keberagaman strategi dan mendorong evaluasi efisiensi masing-masing pendekatan.",
        },
      ],
      differentiationActionGuide: [
        {
          condition: "Kelompok Tier 1 mengalami hambatan pada analisis tabel.",
          action: "Guru memberikan petunjuk visual sebagian (guided hints) dan scaffolding terstruktur.",
        },
        {
          condition: "Kelompok Tier 3 menyelesaikan tugas lebih awal.",
          action: "Guru memberikan tantangan pengayaan berupa pengujian kasus ekstrem (edge-case challenge).",
        },
      ],
      rubrikPenilaian4Level: [
        {
          aspek: "Ketepatan Analisis Konsep",
          skor1_perluBimbingan: "Belum mampu mengidentifikasi komponen konsep dasar.",
          skor2_cukup: "Mengidentifikasi konsep dasar dengan bantuan intensif guru.",
          skor3_baik: "Menganalisis konsep secara tepat dan mandiri.",
          skor4_mahir: "Menganalisis konsep secara mendalam dan mampu mengaitkan dengan konteks baru.",
          bobotNilai: 40,
        },
        {
          aspek: "Kolaborasi & Adab Islami",
          skor1_perluBimbingan: "Pasif dalam kelompok dan sering melanggar adab diskusi.",
          skor2_cukup: "Cukup berpartisipasi namun membutuhkan pengingat adab berkala.",
          skor3_baik: "Aktif berkolaborasi dan menerapkan adab islami dengan baik.",
          skor4_mahir: "Menunjukkan kepemimpinan teladan, santun, dan saling membantu rekan tim.",
          bobotNilai: 30,
        },
        {
          aspek: "Kualitas Penyajian Produk LKPD",
          skor1_perluBimbingan: "Lembar respon tidak lengkap dan tidak terstruktur.",
          skor2_cukup: "Lembar respon terisi cukup rapi dengan beberapa kekurangan minor.",
          skor3_baik: "Lembar respon terisi lengkap, runut, dan mudah dipahami.",
          skor4_mahir: "Penyajian sangat rapi, sistematis, kreatif, dan mencerminkan sikap itqan tinggi.",
          bobotNilai: 30,
        },
      ],
      mappedGradebookTpId: "TP-01",
    },
  };

  return {
    success: true,
    modulAjar: fallbackAthirahModul,
    lkpdSiswa: fallbackLkpdSiswa,
    lkpdGuruKunci: fallbackLkpdGuruKunci,
    isFallback: true,
    message: "Modul Ajar & LKPD Sekolah Islam Athirah berhasil disusun menggunakan template kurikulum resmi (Mode Offline).",
  };
}
