import { describe, it, expect, beforeEach, afterEach } from "./e2e/harness.ts";
import {
  generateTPFromCPAction,
  generateLessonPlanAndLKPDAction,
  generateRemedialTaskAction,
  generateAthirahModulAjarAction,
  getGeminiModel,
} from "../src/app/actions/geminiActions.ts";

describe("Server Actions & Gemini AI Integration", () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    // Clear key to test offline / fallback resilience
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalKey) {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it("uses the verified gemini-2.0-flash production model identifier", async () => {
    const model = await getGeminiModel();
    expect(model).toBe("gemini-2.0-flash");
  });

  it("generateTPFromCPAction returns valid structured fallback when offline", async () => {
    const res = await generateTPFromCPAction({
      subject: "Informatika",
      fase: "E",
      cpText: "Pada akhir fase E, peserta didik mampu menerapkan strategi algoritmik...",
    });

    expect(res.success).toBe(true);
    expect(res.isFallback).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data!.length).toBeGreaterThanOrEqual(3);

    const firstTP = res.data![0];
    expect(firstTP.code).toBeDefined();
    expect(firstTP.description).toBeDefined();
    expect(firstTP.bloomLevel).toBeDefined();
    expect(firstTP.allocatedHours).toBeGreaterThan(0);
    expect(firstTP.kktpThreshold).toBe(75);
  });

  it("generateLessonPlanAndLKPDAction returns complete fallback Modul Ajar and LKPD", async () => {
    const res = await generateLessonPlanAndLKPDAction({
      meetingNumber: 1,
      tpDescription: "Menerapkan strategi pemilahan (sorting) data",
      durationMinutes: 135,
      gradeLevel: "10",
    });

    expect(res.success).toBe(true);
    expect(res.isFallback).toBe(true);
    expect(res.modulAjar).toBeDefined();
    expect(res.modulAjar.pemahamanBermakna).toBeDefined();
    expect(res.modulAjar.pertanyaanPemantik.length).toBeGreaterThan(0);
    expect(res.modulAjar.kegiatan).toBeDefined();
    expect(res.lkpdSiswa).toBeDefined();
    expect(res.lkpdGuruKunci).toBeDefined();
  });

  it("generateRemedialTaskAction returns structured adaptive remedial task", async () => {
    const res = await generateRemedialTaskAction({
      studentName: "Aditya Pratama",
      tpCode: "TP-01",
      tpDescription: "Menerapkan strategi algoritmik pemilahan (sorting)",
      score: 65,
      kktp: 75,
    });

    expect(res.success).toBe(true);
    expect(res.isFallback).toBe(true);
    expect(res.taskText).toBeDefined();
    expect(res.taskText).toContain("Aditya Pratama");
    expect(res.taskText).toContain("TP-01");
    expect(res.taskText).toContain("Ambang Ketuntasan (KKTP): 75");
  });

  it("generateAthirahModulAjarAction produces comprehensive 6-component Athirah Modul Ajar and Dual LKPD", async () => {
    const res = await generateAthirahModulAjarAction({
      unit: "SMA Islam Athirah 1 Makassar",
      subject: "Informatika",
      gradeLevel: "X",
      fase: "E",
      materiPokok: "Strategi Algoritmik Pemilahan Data (Bubble & Selection Sort)",
      meetingNumber: 1,
      durationMinutes: 135,
      tpDescription: "Menerapkan algoritma sorting pada data terstruktur",
    });

    expect(res.success).toBe(true);
    expect(res.isFallback).toBe(true);
    expect(res.modulAjar).toBeDefined();

    // 1. Identitas
    expect(res.modulAjar?.identitas.unit).toBe("SMA Islam Athirah 1 Makassar");
    expect(res.modulAjar?.identitas.alokasiWaktuDisplay).toContain("3 JP");

    // 2. Identifikasi
    expect(res.modulAjar?.identifikasi.profilLulusanAthirah).toContain("ANGGUN_BERAKHLAK");
    expect(res.modulAjar?.identifikasi.programKhasRenstra).toContain("ATHIRAH_BERQURAN");

    // 3. Spiritualisasi
    expect(res.modulAjar?.spiritualisasi.quranVerse.surahName).toBe("Al-Qamar");
    expect(res.modulAjar?.spiritualisasi.quranVerse.arabicText).toBeDefined();
    expect(res.modulAjar?.spiritualisasi.hadith).toBeDefined();
    expect(res.modulAjar?.spiritualisasi.islamicHistory?.figureName).toContain("Al-Khwarizmi");

    // 4. Desain Pembelajaran
    expect(res.modulAjar?.desainPembelajaran.tujuanPembelajaran.audience).toBeDefined();
    expect(res.modulAjar?.desainPembelajaran.pedagogicalPractices.modelPembelajaran).toBeDefined();

    // 5. Pengalaman Belajar (3M + PM principles + Matriks codes)
    expect(res.modulAjar?.pengalamanBelajar.memahami.length).toBeGreaterThan(0);
    expect(res.modulAjar?.pengalamanBelajar.mengaplikasi.length).toBeGreaterThan(0);
    expect(res.modulAjar?.pengalamanBelajar.merefleksi.length).toBeGreaterThan(0);

    const firstStep = res.modulAjar?.pengalamanBelajar.memahami[0];
    expect(firstStep?.pmPrinciple).toBe("BERKESADARAN");
    expect(firstStep?.matrixCode).toBe("MH-1");

    // 6. Lampiran Asesmen (8-column table)
    expect(res.modulAjar?.lampiranAsesmen.length).toBeGreaterThanOrEqual(2);
    expect(res.modulAjar?.lampiranAsesmen[0].isLkpdAttached).toBe(true);

    // Dual-version LKPD
    expect(res.lkpdSiswa).toBeDefined();
    expect(res.lkpdSiswa?.openingDuaAndAdab.bismillahText).toContain("بِسْمِ اللَّهِ");
    expect(res.lkpdSiswa?.aktivitasSiswa.faseMemahami.length).toBeGreaterThan(0);

    expect(res.lkpdGuruKunci?.guruAnswerKeyGuide).toBeDefined();
    expect(res.lkpdGuruKunci?.guruAnswerKeyGuide?.rubrikPenilaian4Level.length).toBeGreaterThan(0);
  });
});
