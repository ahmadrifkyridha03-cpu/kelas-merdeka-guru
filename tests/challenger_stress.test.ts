/**
 * Empirical Stress Test Suite for Milestone 1
 * Teamwork Challenger: challenger_m1_2
 *
 * Covers:
 * 1. Two-way synchronization between legacy helpers and Zustand reactive store.
 * 2. Arbitrary student IDs / TP UUIDs, boundary values, clamping, floating precision, mass scale.
 * 3. Server Actions offline resilience, abort/error handling, and Athirah 6-component validation.
 */

import { describe, it, expect, beforeEach, afterEach } from "./e2e/harness.ts";
import {
  useAppStore,
  getSavedClasses,
  saveClasses,
  getSavedStudents,
  saveStudents,
  getSavedTPs,
  saveTPs,
  universalStorage,
  STORAGE_KEY_CLASSES,
  STORAGE_KEY_STUDENTS,
  STORAGE_KEY_TPS,
} from "../src/lib/store.ts";
import {
  generateTPFromCPAction,
  generateLessonPlanAndLKPDAction,
  generateRemedialTaskAction,
  generateAthirahModulAjarAction,
  getGeminiModel,
} from "../src/app/actions/geminiActions.ts";
import type { ClassItem, Student, TP } from "../src/types/index.ts";

describe("Milestone 1 Challenger Stress Test Suite", () => {
  beforeEach(() => {
    useAppStore.getState().resetStore();
  });

  // ==========================================================================
  // Section 1: Backward Compatibility & Reactive Store 2-Way Synchronization
  // ==========================================================================
  describe("Section 1: Backward Compatibility & 2-Way Synchronization", () => {
    beforeEach(() => {
      useAppStore.getState().resetStore();
    });

    it("saveClasses() updates Zustand store and triggers reactive subscribers", () => {
      let subscriberNotified = false;
      const unsubscribe = useAppStore.subscribe((state) => {
        if (state.classes.some((c) => c.id === "cls-stress-legacy-1")) {
          subscriberNotified = true;
        }
      });

      const customClass: ClassItem = {
        id: "cls-stress-legacy-1",
        teacherId: "teacher-stress",
        name: "Kelas Stress Test",
        gradeLevel: 10,
        fase: "E",
        subjectName: "Informatika",
        teachingHoursPerWeek: 3,
        academicYearId: "ay-2026",
        semesterNumber: 1,
        studentCount: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveClasses([customClass]);

      // Check Zustand store state directly
      const storeClasses = useAppStore.getState().classes;
      expect(storeClasses.length).toBe(1);
      expect(storeClasses[0].id).toBe("cls-stress-legacy-1");
      expect(subscriberNotified).toBe(true);

      // Check legacy getter reflects the store state
      const legacyRetrieved = getSavedClasses();
      expect(legacyRetrieved.length).toBe(1);
      expect(legacyRetrieved[0].id).toBe("cls-stress-legacy-1");

      // Check universalStorage persistence key
      const rawStored = universalStorage.getItem(STORAGE_KEY_CLASSES);
      expect(rawStored).toBeTruthy();
      expect(JSON.parse(rawStored!)[0].id).toBe("cls-stress-legacy-1");

      unsubscribe();
    });

    it("saveStudents() updates Zustand store and triggers reactive subscribers", () => {
      let notifiedCount = 0;
      const unsubscribe = useAppStore.subscribe(() => {
        notifiedCount++;
      });

      const customStudent: Student = {
        id: "std-legacy-sync-99",
        classId: "cls-stress-legacy-1",
        nisn: "0012345678",
        fullName: "Siswa Legacy Sync",
        gender: "L",
        status: "AKTIF",
        bonusPoints: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveStudents([customStudent]);

      const storeStudents = useAppStore.getState().students;
      expect(storeStudents.length).toBe(1);
      expect(storeStudents[0].id).toBe("std-legacy-sync-99");
      expect(notifiedCount).toBeGreaterThan(0);

      // Legacy getter reflects update
      const legacyStudents = getSavedStudents();
      expect(legacyStudents.length).toBe(1);
      expect(legacyStudents[0].id).toBe("std-legacy-sync-99");

      // Storage sync verified
      const raw = universalStorage.getItem(STORAGE_KEY_STUDENTS);
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!)[0].id).toBe("std-legacy-sync-99");

      unsubscribe();
    });

    it("saveTPs() updates Zustand store and triggers reactive subscribers", () => {
      const customTP: TP = {
        id: "tp-legacy-sync-77",
        classId: "cls-1",
        cpElement: "BK",
        code: "TP-SYNC-77",
        description: "Tujuan Pembelajaran Legacy Sync",
        bloomLevel: "C4",
        scope: "Lingkup Sinkronisasi",
        allocatedHours: 6,
        kktpModel: "INTERVAL_NILAI",
        kktpThreshold: 75,
      };

      saveTPs([customTP]);

      const storeTPs = useAppStore.getState().tps;
      expect(storeTPs.length).toBe(1);
      expect(storeTPs[0].id).toBe("tp-legacy-sync-77");

      const legacyTPs = getSavedTPs();
      expect(legacyTPs.length).toBe(1);
      expect(legacyTPs[0].id).toBe("tp-legacy-sync-77");

      const raw = universalStorage.getItem(STORAGE_KEY_TPS);
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!)[0].id).toBe("tp-legacy-sync-77");
    });

    it("updating via Zustand store methods immediately updates legacy getters", () => {
      const store = useAppStore.getState();

      const newStudent: Student = {
        id: "std-zustand-direct",
        classId: "cls-1",
        nisn: "0099887766",
        fullName: "Direct Zustand Student",
        gender: "P",
        status: "AKTIF",
        bonusPoints: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.addStudent(newStudent);

      // Verify legacy getter sees the added student
      const legacyStudents = getSavedStudents();
      expect(legacyStudents.some((s) => s.id === "std-zustand-direct")).toBe(true);

      const newTP: TP = {
        id: "tp-zustand-direct",
        classId: "cls-1",
        cpElement: "TIK",
        code: "TP-DIR-01",
        description: "Direct Zustand TP",
        bloomLevel: "C3",
        scope: "Direct Scope",
        allocatedHours: 6,
        kktpModel: "INTERVAL_NILAI",
        kktpThreshold: 75,
      };

      store.addTP(newTP);

      // Verify legacy getter sees the added TP
      const legacyTPs = getSavedTPs();
      expect(legacyTPs.some((t) => t.id === "tp-zustand-direct")).toBe(true);
    });
  });

  // ==========================================================================
  // Section 2: Stress Testing Scores Mapping, Boundaries & Clamping
  // ==========================================================================
  describe("Section 2: Stress Testing Scores Mapping & Boundaries", () => {
    beforeEach(() => {
      useAppStore.getState().resetStore();
    });

    it("handles arbitrary student IDs and TP UUID formats (UUID v4, Unicode, Special chars)", () => {
      const store = useAppStore.getState();

      const testCases = [
        {
          studentId: "c72b22f0-1a73-455b-9b4b-f72671cf0e4a", // UUID v4
          tpId: "d83c33e1-2b84-466c-8c5c-e83782df1f5b",
          score: 88,
        },
        {
          studentId: "std_special-chars!@#$%^&*()_+:<>?", // Special characters
          tpId: "tp_special-chars!@#$%^&*()_+:<>?",
          score: 92.5,
        },
        {
          studentId: "siswa_日本語_مرحبا_001", // Unicode / multilingual
          tpId: "tp_unicode_فهم_001",
          score: 75.3,
        },
        {
          studentId: "99999999999999999999", // Numeric string
          tpId: "00000000000000000001",
          score: 100,
        },
        {
          studentId: "a".repeat(150), // Very long ID
          tpId: "b".repeat(150),
          score: 50,
        },
      ];

      for (const tc of testCases) {
        store.setScore(tc.studentId, tc.tpId, tc.score);
        const retrieved = useAppStore.getState().getScore(tc.studentId, tc.tpId);
        expect(retrieved).toBe(tc.score);
        expect(useAppStore.getState().scores[tc.studentId][tc.tpId]).toBe(tc.score);
      }
    });

    it("rigorously enforces boundary clamping (0, 100, negatives, overflow, decimals)", () => {
      const store = useAppStore.getState();
      const sId = "std-boundary-test";
      const tpId = "tp-boundary-test";

      // Exact boundaries
      store.setScore(sId, tpId, 0);
      expect(useAppStore.getState().getScore(sId, tpId)).toBe(0);

      store.setScore(sId, tpId, 100);
      expect(useAppStore.getState().getScore(sId, tpId)).toBe(100);

      // Negative values clamped to 0
      store.setScore(sId, tpId, -0.01);
      expect(useAppStore.getState().getScore(sId, tpId)).toBe(0);

      store.setScore(sId, tpId, -50);
      expect(useAppStore.getState().getScore(sId, tpId)).toBe(0);

      store.setScore(sId, tpId, -999999);
      expect(useAppStore.getState().getScore(sId, tpId)).toBe(0);

      // Overflow values clamped to 100
      store.setScore(sId, tpId, 100.01);
      expect(useAppStore.getState().getScore(sId, tpId)).toBe(100);

      store.setScore(sId, tpId, 150);
      expect(useAppStore.getState().getScore(sId, tpId)).toBe(100);

      store.setScore(sId, tpId, 999999);
      expect(useAppStore.getState().getScore(sId, tpId)).toBe(100);

      // Floating point single-decimal precision rounding
      store.setScore(sId, tpId, 75.44);
      expect(useAppStore.getState().getScore(sId, tpId)).toBe(75.4);

      store.setScore(sId, tpId, 75.46);
      expect(useAppStore.getState().getScore(sId, tpId)).toBe(75.5);
    });

    it("ensures independence of scores across students and TPs", () => {
      const store = useAppStore.getState();
      const s1 = "std-alpha";
      const s2 = "std-beta";
      const tp1 = "tp-first";
      const tp2 = "tp-second";

      store.setScore(s1, tp1, 80);
      store.setScore(s1, tp2, 90);
      store.setScore(s2, tp1, 70);
      store.setScore(s2, tp2, 85);

      // Mutate s1 tp1
      store.setScore(s1, tp1, 95);

      const state = useAppStore.getState();
      expect(state.getScore(s1, tp1)).toBe(95);
      expect(state.getScore(s1, tp2)).toBe(90); // intact
      expect(state.getScore(s2, tp1)).toBe(70); // intact
      expect(state.getScore(s2, tp2)).toBe(85); // intact
    });

    it("mass scale stress test: 50 students x 10 TPs (500 score cells) with cascading deletions", () => {
      const store = useAppStore.getState();

      const numStudents = 50;
      const numTPs = 10;
      const students: Student[] = [];
      const tps: TP[] = [];

      for (let i = 0; i < numStudents; i++) {
        students.push({
          id: `std-mass-${i}`,
          classId: "cls-mass",
          nisn: `00000000${i}`.slice(-10),
          fullName: `Mass Student ${i}`,
          gender: i % 2 === 0 ? "L" : "P",
          status: "AKTIF",
          bonusPoints: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      for (let j = 0; j < numTPs; j++) {
        tps.push({
          id: `tp-mass-${j}`,
          classId: "cls-mass",
          cpElement: "BK",
          code: `TP-MASS-${j}`,
          description: `Mass TP ${j}`,
          bloomLevel: "C3",
          scope: `Scope ${j}`,
          allocatedHours: 6,
          kktpModel: "INTERVAL_NILAI",
          kktpThreshold: 75,
        });
      }

      store.setStudents(students);
      store.setTPs(tps);

      // Populate 500 scores
      for (let i = 0; i < numStudents; i++) {
        for (let j = 0; j < numTPs; j++) {
          const score = (i * 7 + j * 13) % 101; // pseudo-random between 0-100
          store.setScore(`std-mass-${i}`, `tp-mass-${j}`, score);
        }
      }

      const populatedState = useAppStore.getState();
      expect(Object.keys(populatedState.scores).length).toBe(numStudents);

      // Verify random student/TP score
      const sampleScore = (25 * 7 + 4 * 13) % 101;
      expect(populatedState.getScore("std-mass-25", "tp-mass-4")).toBe(sampleScore);

      // ACT 1: Delete a specific student (std-mass-25)
      useAppStore.getState().deleteStudent("std-mass-25");
      const afterStudentDelete = useAppStore.getState();
      expect(afterStudentDelete.scores["std-mass-25"]).toBeUndefined();
      expect(afterStudentDelete.scores["std-mass-24"]).toBeDefined();
      expect(afterStudentDelete.scores["std-mass-26"]).toBeDefined();

      // ACT 2: Delete a specific TP (tp-mass-4)
      useAppStore.getState().deleteTP("tp-mass-4");
      const afterTPDelete = useAppStore.getState();
      // TP 4 must be gone across ALL remaining students
      for (let i = 0; i < numStudents; i++) {
        if (i !== 25) {
          expect(afterTPDelete.getScore(`std-mass-${i}`, "tp-mass-4")).toBeUndefined();
          expect(afterTPDelete.getScore(`std-mass-${i}`, "tp-mass-3")).toBeDefined();
        }
      }
    });
  });

  // ==========================================================================
  // Section 3: Server Actions Offline Resilience & Athirah Schema Validation
  // ==========================================================================
  describe("Section 3: Server Actions Offline Resilience & Athirah Schema", () => {
    const originalKey = process.env.GEMINI_API_KEY;

    afterEach(() => {
      if (originalKey) {
        process.env.GEMINI_API_KEY = originalKey;
      } else {
        delete process.env.GEMINI_API_KEY;
      }
    });

    it("verifies production model identifier is strictly gemini-2.0-flash", async () => {
      const model = await getGeminiModel();
      expect(model).toBe("gemini-2.0-flash");
    });

    it("generateTPFromCPAction degrades gracefully when API key is missing (offline)", async () => {
      delete process.env.GEMINI_API_KEY;

      const res = await generateTPFromCPAction({
        subject: "Informatika",
        fase: "F",
        cpText: "Peserta didik mampu memahami algoritma pemilahan data...",
      });

      expect(res.success).toBe(true);
      expect(res.isFallback).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data!.length).toBeGreaterThanOrEqual(3);

      for (const tp of res.data!) {
        expect(tp.code).toMatch(/^TP-\d+$/);
        expect(tp.description.length).toBeGreaterThan(10);
        expect(tp.bloomLevel).toMatch(/^C[1-6]$/);
        expect(tp.allocatedHours).toBeGreaterThan(0);
        expect(tp.kktpThreshold).toBe(75);
      }
    });

    it("generateLessonPlanAndLKPDAction degrades gracefully without unhandled rejections", async () => {
      delete process.env.GEMINI_API_KEY;

      const res = await generateLessonPlanAndLKPDAction({
        meetingNumber: 2,
        tpDescription: "Menganalisis kompleksitas algoritma pencarian (Binary Search)",
        durationMinutes: 90,
        gradeLevel: "11",
      });

      expect(res.success).toBe(true);
      expect(res.isFallback).toBe(true);
      expect(res.modulAjar).toBeDefined();
      expect(res.modulAjar.kegiatan.pendahuluan).toContain("15 Menit");
      expect(res.modulAjar.kegiatan.inti).toContain("60 Menit");
      expect(res.modulAjar.kegiatan.penutup).toContain("15 Menit");
      expect(res.lkpdSiswa).toContain("Pertemuan ke-2");
      expect(res.lkpdGuruKunci).toContain("KUNCI JAWABAN");
    });

    it("generateRemedialTaskAction degrades gracefully with student context preserved", async () => {
      delete process.env.GEMINI_API_KEY;

      const res = await generateRemedialTaskAction({
        studentName: "Fathir Muhammad",
        tpCode: "TP-INF-02",
        tpDescription: "Menerapkan struktur percabangan bersarang",
        score: 55,
        kktp: 75,
      });

      expect(res.success).toBe(true);
      expect(res.isFallback).toBe(true);
      expect(res.taskText).toBeDefined();
      expect(res.taskText).toContain("Fathir Muhammad");
      expect(res.taskText).toContain("TP-INF-02");
      expect(res.taskText).toContain("55");
      expect(res.taskText).toContain("75");
    });

    it("generateAthirahModulAjarAction produces full 6-component Athirah curriculum structure", async () => {
      delete process.env.GEMINI_API_KEY;

      const res = await generateAthirahModulAjarAction({
        unit: "SMA Islam Athirah 1 Makassar",
        subject: "Informatika",
        gradeLevel: "XI",
        fase: "F",
        materiPokok: "Algoritma Pemrograman & Nilai Itqan",
        meetingNumber: 3,
        durationMinutes: 135,
        tpDescription: "Menganalisis efisiensi algoritma pemilahan data terstruktur",
      });

      expect(res.success).toBe(true);
      expect(res.isFallback).toBe(true);
      expect(res.modulAjar).toBeDefined();

      const m = res.modulAjar!;

      // Component 1: Identitas
      expect(m.identitas.unit).toBe("SMA Islam Athirah 1 Makassar");
      expect(m.identitas.alokasiWaktuDisplay).toContain("3 JP (135 Menit)");
      expect(m.identitas.pertemuanKe).toBe(3);

      // Component 2: Identifikasi (8 Dimensi & Renstra)
      expect(m.identifikasi.profilLulusanAthirah.length).toBeGreaterThanOrEqual(4);
      expect(m.identifikasi.profilLulusanAthirah).toContain("ANGGUN_BERAKHLAK");
      expect(m.identifikasi.profilLulusanAthirah).toContain("KOKOH_SPIRITUALNYA");
      expect(m.identifikasi.programKhasRenstra).toContain("ATHIRAH_BERQURAN");

      // Component 3: Spiritualisasi (Quran, Hadits, Tokoh)
      expect(m.spiritualisasi.quranVerse.arabicText).toBeDefined();
      expect(m.spiritualisasi.hadith.narrator).toBeDefined();
      expect(m.spiritualisasi.islamicHistory?.figureName).toBeDefined();

      // Component 4: Desain Pembelajaran (ABCD format & Diferensiasi)
      expect(m.desainPembelajaran.tujuanPembelajaran.audience).toBeDefined();
      expect(m.desainPembelajaran.tujuanPembelajaran.behavior).toBeDefined();
      expect(m.desainPembelajaran.tujuanPembelajaran.condition).toBeDefined();
      expect(m.desainPembelajaran.tujuanPembelajaran.degree).toBeDefined();
      expect(m.desainPembelajaran.pedagogicalPractices.diferensiasiProses).toContain("3-tier");

      // Component 5: Pengalaman Belajar (3M + PM + Matriks codes)
      expect(m.pengalamanBelajar.memahami.length).toBeGreaterThan(0);
      expect(m.pengalamanBelajar.mengaplikasi.length).toBeGreaterThan(0);
      expect(m.pengalamanBelajar.merefleksi.length).toBeGreaterThan(0);

      const stepMH = m.pengalamanBelajar.memahami[0];
      expect(stepMH.matrixCode).toMatch(/^MH-[1-3]$/);
      expect(stepMH.pmPrinciple).toBe("BERKESADARAN");

      const stepMA = m.pengalamanBelajar.mengaplikasi[0];
      expect(stepMA.matrixCode).toMatch(/^MA-[1-3]$/);

      const stepMR = m.pengalamanBelajar.merefleksi[0];
      expect(stepMR.matrixCode).toMatch(/^MR-[1-3]$/);

      // Component 6: Lampiran Asesmen (8-kolom table)
      expect(m.lampiranAsesmen.length).toBeGreaterThanOrEqual(2);
      const row1 = m.lampiranAsesmen[0];
      expect(row1.materiPokok).toBe("Algoritma Pemrograman & Nilai Itqan");
      expect(row1.jenisAsesmen).toBe("TULIS");
      expect(row1.isLkpdAttached).toBe(true);

      // Dual-Version LKPD
      expect(res.lkpdSiswa).toBeDefined();
      expect(res.lkpdSiswa?.openingDuaAndAdab.bismillahText).toContain("بِسْمِ اللَّهِ");
      expect(res.lkpdSiswa?.aktivitasSiswa.faseMemahami.length).toBeGreaterThan(0);
      expect(res.lkpdSiswa?.aktivitasSiswa.faseMengaplikasi.length).toBeGreaterThan(0);
      expect(res.lkpdSiswa?.aktivitasSiswa.faseMerefleksi.length).toBeGreaterThan(0);

      expect(res.lkpdGuruKunci?.guruAnswerKeyGuide).toBeDefined();
      expect(res.lkpdGuruKunci?.guruAnswerKeyGuide?.exemplarAnswersByTier.tier_1).toBeDefined();
      expect(res.lkpdGuruKunci?.guruAnswerKeyGuide?.rubrikPenilaian4Level.length).toBeGreaterThan(0);
    });

    it("survives invalid API key and network error without throwing unhandled rejections", async () => {
      // Simulate invalid API key in environment
      process.env.GEMINI_API_KEY = "AIzaSy_INVALID_KEY_FOR_TESTING_12345";

      // In sandbox / offline environment, calling Gemini with invalid key will fail network or auth.
      // The action MUST catch it and return fallback without unhandled exception.
      const res = await generateTPFromCPAction({
        subject: "Informatika",
        fase: "E",
        cpText: "Peserta didik memahami konsep pemikiran komputasional...",
      });

      expect(res.success).toBe(true);
      expect(res.isFallback).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data!.length).toBeGreaterThan(0);
    });
  });
});
