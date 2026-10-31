"use server";

import { GoogleGenAI } from "@google/genai";

/**
 * Server Action untuk memanggil Gemini API secara aman di sisi server.
 * API Key diambil dari variabel lingkungan GEMINI_API_KEY (tidak bocor ke browser).
 */
function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Kunci GEMINI_API_KEY belum diisi di file .env.local! Silakan dapatkan kunci gratis di aistudio.google.com"
    );
  }
  return new GoogleGenAI({ apiKey });
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

/**
 * 1. Otomasi Penurunan CP -> Tujuan Pembelajaran (TP)
 */
export async function generateTPFromCPAction(params: {
  subject: string;
  fase: string;
  cpText: string;
}): Promise<{ success: boolean; data?: GeneratedTP[]; error?: string }> {
  try {
    const ai = getClient();
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
4. WAJIB mengembalikan HANYA format JSON valid tanpa tanda kutip markdown pembungkus (\`\`\`json).

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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "[]";
    const parsed: GeneratedTP[] = JSON.parse(text);
    return { success: true, data: parsed };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memanggil Gemini API" };
  }
}

/**
 * 2. Otomasi Pembuatan Modul Ajar Lengkap & LKPD Per Pertemuan
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
  error?: string;
}> {
  try {
    const ai = getClient();
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
    "inti": "105 Menit: ...",
    "penutup": "15 Menit: ..."
  },
  "lkpdSiswa": "Petunjuk aktivitas siswa, instruksi kerja kelompok, dan tabel jawaban...",
  "lkpdGuruKunci": "Kunci jawaban lengkap, rubrik penilaian, dan pedoman penskoran..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      success: true,
      modulAjar: parsed,
      lkpdSiswa: parsed.lkpdSiswa,
      lkpdGuruKunci: parsed.lkpdGuruKunci,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal membuat modul ajar" };
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
}): Promise<{ success: boolean; taskText?: string; error?: string }> {
  try {
    const ai = getClient();
    const prompt = `Buatkan 2 soal remedial berbasis pemecahan masalah sederhana untuk siswa yang belum mencapai KKTP pada Tujuan Pembelajaran berikut:

Nama Siswa: ${params.studentName}
Nilai Saat Ini: ${params.score} (Ambang KKTP: ${params.kktp})
Tujuan Pembelajaran (${params.tpCode}): ${params.tpDescription}

Berikan instruksi penugasan yang ramah, jelas, mendidik, dan sertakan kunci jawaban singkat untuk guru di bagian bawah.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return { success: true, taskText: response.text || "" };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal membuat tugas remedial" };
  }
}

