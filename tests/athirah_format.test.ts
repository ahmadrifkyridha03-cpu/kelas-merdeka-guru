import { describe, it, expect, beforeEach } from "./e2e/harness.ts";
import { useAppStore } from "../src/lib/store.ts";
import {
  ATHIRAH_UNITS_LIST,
  PLA_DIMENSIONS_CONFIG,
  RENSTRA_PROGRAMS_CONFIG,
  PM_PRINCIPLES_CONFIG,
  MATRIKS_PENGUATAN_INFO,
  createDefaultAthirahModulAjar,
  createDefaultAthirahLkpd,
} from "../src/app/lesson-plans/athirahConstants.ts";
import {
  validateAthirahModulAjarStructure,
  validateAthirahLkpdDualVersion,
} from "./e2e/spec_validators.ts";
import type {
  AthirahProfilLulusan,
  ProgramKhasRenstra,
  PedagogiMerdekaPrinciple,
  MatriksPenguatanCode,
} from "../src/types/index.ts";

describe("Milestone 4: Sekolah Islam Athirah Modul Ajar & LKPD Test Suite", () => {
  beforeEach(() => {
    // Clean and reset store state
    useAppStore.getState().resetStore();
  });

  // =========================================================================
  // 1. Kelengkapan 6 Komponen Wajib Modul Ajar Athirah
  // =========================================================================
  it("Test 1: Modul Ajar contains all 6 mandatory Athirah components", () => {
    const modul = createDefaultAthirahModulAjar("SMA Islam Athirah 1 Makassar", 1);
    expect(modul).toBeDefined();

    // 1. Identitas
    expect(modul.identitas).toBeDefined();
    expect(modul.identitas.unit).toBe("SMA Islam Athirah 1 Makassar");
    expect(modul.identitas.mataPelajaran).toBe("Informatika");
    expect(modul.identitas.materiPokok).toBeDefined();
    expect(modul.identitas.alokasiWaktuDisplay).toContain("3 JP");

    // 2. Identifikasi
    expect(modul.identifikasi).toBeDefined();
    expect(Array.isArray(modul.identifikasi.profilLulusanAthirah)).toBe(true);
    expect(Array.isArray(modul.identifikasi.programKhasRenstra)).toBe(true);
    expect(modul.identifikasi.kosmologiKurikulumNote).toBeDefined();

    // 3. Spiritualisasi
    expect(modul.spiritualisasi).toBeDefined();
    expect(modul.spiritualisasi.quranVerse).toBeDefined();
    expect(modul.spiritualisasi.coreSpiritualValue).toBeDefined();

    // 4. Desain Pembelajaran
    expect(modul.desainPembelajaran).toBeDefined();
    expect(modul.desainPembelajaran.tujuanPembelajaran).toBeDefined();
    expect(modul.desainPembelajaran.pedagogicalPractices).toBeDefined();
    expect(modul.desainPembelajaran.mediaDanLingkungan).toBeDefined();

    // 5. Pengalaman Belajar (3M)
    expect(modul.pengalamanBelajar).toBeDefined();
    expect(Array.isArray(modul.pengalamanBelajar.memahami)).toBe(true);
    expect(Array.isArray(modul.pengalamanBelajar.mengaplikasi)).toBe(true);
    expect(Array.isArray(modul.pengalamanBelajar.merefleksi)).toBe(true);

    // 6. Lampiran Asesmen (8 Kolom)
    expect(modul.lampiranAsesmen).toBeDefined();
    expect(Array.isArray(modul.lampiranAsesmen)).toBe(true);
    expect(modul.lampiranAsesmen.length).toBeGreaterThanOrEqual(2);

    // Validate using statutory oracle validator
    const validation = validateAthirahModulAjarStructure(modul);
    expect(validation.valid).toBe(true);
    expect(validation.missingComponents.length).toBe(0);
    expect(validation.errors.length).toBe(0);
  });

  // =========================================================================
  // 2. Satuan Unit Sekolah Islam Athirah (8 Unit Resmi)
  // =========================================================================
  it("Test 2: Supports all 8 official Sekolah Islam Athirah units across SD, SMP, SMA", () => {
    expect(ATHIRAH_UNITS_LIST.length).toBe(8);

    const unitNames = ATHIRAH_UNITS_LIST.map((u) => u.id);
    expect(unitNames).toContain("SMA Islam Athirah 1 Makassar");
    expect(unitNames).toContain("SMA Islam Athirah Bukit Baruga");
    expect(unitNames).toContain("SMA Islam Athirah Bone");
    expect(unitNames).toContain("SMP Islam Athirah Kajaolalido");
    expect(unitNames).toContain("SMP Islam Athirah Bukit Baruga");
    expect(unitNames).toContain("SMP Islam Athirah Bone");
    expect(unitNames).toContain("SD Islam Athirah 1 Makassar");
    expect(unitNames).toContain("SD Islam Athirah 2 Bukit Baruga");

    // Verify generator dynamically accommodates different units
    const modulBone = createDefaultAthirahModulAjar("SMA Islam Athirah Bone", 2);
    expect(modulBone.identitas.unit).toBe("SMA Islam Athirah Bone");
    expect(modulBone.identitas.pertemuanKe).toBe(2);

    const valBone = validateAthirahModulAjarStructure(modulBone);
    expect(valBone.valid).toBe(true);
  });

  // =========================================================================
  // 3. 8 Dimensi Profil Lulusan Athirah (PLA)
  // =========================================================================
  it("Test 3: Supports and verifies all 8 Dimensions of Profil Lulusan Athirah (PLA)", () => {
    const plaKeys = Object.keys(PLA_DIMENSIONS_CONFIG) as AthirahProfilLulusan[];
    expect(plaKeys.length).toBe(8);

    const expectedDimensions: AthirahProfilLulusan[] = [
      "ANGGUN_BERAKHLAK",
      "UNGGUL_PRESTASINYA",
      "KOKOH_SPIRITUALNYA",
      "TANGGUH_KARAKTERNYA",
      "BERWAWASAN_GLOBAL_LINGKUNGAN",
      "BERNALAR_KRITIS",
      "KREATIF_INOVATIF",
      "BERGOTONG_ROYONG",
    ];

    for (const dim of expectedDimensions) {
      expect(plaKeys).toContain(dim);
      expect(PLA_DIMENSIONS_CONFIG[dim].label).toBeDefined();
      expect(PLA_DIMENSIONS_CONFIG[dim].shortName).toBeDefined();
      expect(PLA_DIMENSIONS_CONFIG[dim].description).toBeDefined();
      expect(PLA_DIMENSIONS_CONFIG[dim].badgeColor).toBeDefined();
    }

    const modul = createDefaultAthirahModulAjar();
    expect(modul.identifikasi.profilLulusanAthirah.length).toBe(8);
    for (const dim of expectedDimensions) {
      expect(modul.identifikasi.profilLulusanAthirah).toContain(dim);
    }
  });

  // =========================================================================
  // 4. Program Khas Renstra Yayasan Hadji Kalla & Kosmologi Kurikulum
  // =========================================================================
  it("Test 4: Integrates Program Khas Renstra and non-dichotomous Kosmologi Kurikulum", () => {
    const renstraKeys = Object.keys(RENSTRA_PROGRAMS_CONFIG) as ProgramKhasRenstra[];
    expect(renstraKeys.length).toBe(6);

    expect(renstraKeys).toContain("ATHIRAH_BERQURAN");
    expect(renstraKeys).toContain("BILINGUAL_IMMERSION");
    expect(renstraKeys).toContain("DIGITAL_TRANSFORMATION");
    expect(renstraKeys).toContain("ECO_SCHOOL_ADIWIYATA");
    expect(renstraKeys).toContain("LEADER_IN_ME");
    expect(renstraKeys).toContain("KALLA_CORE_VALUES");

    const modul = createDefaultAthirahModulAjar();
    expect(modul.identifikasi.kosmologiKurikulumNote).toContain("Ayat Kauniyah");
    expect(modul.identifikasi.kosmologiKurikulumNote).toContain("Ayat Qauliyah");
    expect(modul.identifikasi.kosmologiKurikulumNote).toContain("Tauhid");
  });

  // =========================================================================
  // 5. Spiritualisasi: Teks Arab Berharakat, Hadits, & Tafsir Tematik
  // =========================================================================
  it("Test 5: Spiritualisasi features genuine Al-Quran and Hadits Arabic texts with harakat", () => {
    const modul = createDefaultAthirahModulAjar();
    const quran = modul.spiritualisasi.quranVerse;

    expect(quran.surahName).toBe("Al-Qamar");
    expect(quran.surahNumber).toBe(54);
    expect(quran.ayahNumber).toBe(49);
    expect(quran.arabicText).toBe("إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ");
    expect(quran.translationId).toContain("ukuran");
    expect(quran.contextualTafsir).toContain("sunnatullah");

    const hadith = modul.spiritualisasi.hadith;
    expect(hadith).toBeDefined();
    expect(hadith!.narrator).toContain("HR. Al-Bukhari");
    expect(hadith!.arabicText).toBe("إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ");
    expect(hadith!.translationId).toContain("itqan");
    expect(hadith!.pedagogicalMeaning).toContain("itqan");

    expect(modul.spiritualisasi.coreSpiritualValue).toContain("Itqan");
  });

  // =========================================================================
  // 6. Spiritualisasi: Sirah Tokoh Islam & Turats / Fatwa Kontemporer
  // =========================================================================
  it("Test 6: Spiritualisasi incorporates Islamic scientific figures (Al-Khwarizmi) and Turats", () => {
    const modul = createDefaultAthirahModulAjar();
    const sirah = modul.spiritualisasi.islamicHistory;

    expect(sirah).toBeDefined();
    expect(sirah!.figureName).toContain("Al-Khwarizmi");
    expect(sirah!.historicalEra).toContain("Baghdad");
    expect(sirah!.contribution).toContain("algoritma");
    expect(sirah!.inspirationalValue).toBeDefined();

    const turats = modul.spiritualisasi.classicalTextOrFatwa;
    expect(turats).toBeDefined();
    expect(turats!.title).toContain("Al-Jabr");
    expect(turats!.authorOrIssuer).toContain("Al-Khwarizmi");
    expect(turats!.ethicalGuideline).toBeDefined();
  });

  // =========================================================================
  // 7. Desain Pembelajaran: Format ABCD & Spiritualized TP
  // =========================================================================
  it("Test 7: Desain Pembelajaran formulates complete ABCD TP and integrated spiritual TP", () => {
    const modul = createDefaultAthirahModulAjar();
    const tp = modul.desainPembelajaran.tujuanPembelajaran;

    expect(tp.audience).toContain("Peserta didik");
    expect(tp.behavior).toBeDefined();
    expect(tp.condition).toBeDefined();
    expect(tp.degree).toBeDefined();
    expect(tp.integratedSpiritualGoal).toContain("Allah SWT");
    expect(tp.fullStatement).toContain("peserta didik");
  });

  // =========================================================================
  // 8. Desain Pembelajaran: Model, Metode & Diferensiasi Berjenjang
  // =========================================================================
  it("Test 8: Pedagogical practices detail PBL model, varied methods, and 3-way differentiation", () => {
    const modul = createDefaultAthirahModulAjar();
    const ped = modul.desainPembelajaran.pedagogicalPractices;

    expect(ped.modelPembelajaran).toContain("Problem-Based Learning");
    expect(Array.isArray(ped.metodePembelajaran)).toBe(true);
    expect(ped.metodePembelajaran.length).toBeGreaterThanOrEqual(3);

    // 3 Differentiation types
    expect(ped.diferensiasiKonten).toBeDefined();
    expect(ped.diferensiasiProses).toContain("3-tier");
    expect(ped.diferensiasiProduk).toBeDefined();

    // Media & Environment
    const env = modul.desainPembelajaran.mediaDanLingkungan;
    expect(env.mediaFisik.length).toBeGreaterThan(0);
    expect(env.sumberDigital.length).toBeGreaterThan(0);
    expect(env.kemitraan).toContain("Yayasan Hadji Kalla (Program CSR & Pendidikan)");
  });

  // =========================================================================
  // 9. Pengalaman Belajar: Alur 3M (Memahami, Mengaplikasi, Merefleksi) & Durasi
  // =========================================================================
  it("Test 9: Pengalaman Belajar executes 3M flow with preserved duration conservation", () => {
    const modul = createDefaultAthirahModulAjar();
    const pb = modul.pengalamanBelajar;

    expect(pb.memahami.length).toBeGreaterThanOrEqual(1);
    expect(pb.mengaplikasi.length).toBeGreaterThanOrEqual(1);
    expect(pb.merefleksi.length).toBeGreaterThanOrEqual(1);

    const durMemahami = pb.memahami.reduce((sum, a) => sum + a.durationMinutes, 0);
    const durMengaplikasi = pb.mengaplikasi.reduce((sum, a) => sum + a.durationMinutes, 0);
    const durMerefleksi = pb.merefleksi.reduce((sum, a) => sum + a.durationMinutes, 0);

    const totalCalculated = durMemahami + durMengaplikasi + durMerefleksi;
    expect(totalCalculated).toBe(modul.identitas.durasiPertemuanMinutes);
    expect(totalCalculated).toBe(135); // 3 JP = 135 minutes
  });

  // =========================================================================
  // 10. Prinsip Pedagogi Merdeka (PM) [Biru]/[Hijau]/[Orange]
  // =========================================================================
  it("Test 10: Every learning step is tagged with statutory PM principles and color codes", () => {
    const modul = createDefaultAthirahModulAjar();
    const allActivities = [
      ...modul.pengalamanBelajar.memahami,
      ...modul.pengalamanBelajar.mengaplikasi,
      ...modul.pengalamanBelajar.merefleksi,
    ];

    const validPrinciples: PedagogiMerdekaPrinciple[] = [
      "BERKESADARAN",
      "BERMAKNA",
      "MENGGEMBIRAKAN",
    ];

    const usedPrinciples = new Set<PedagogiMerdekaPrinciple>();

    for (const act of allActivities) {
      expect(validPrinciples).toContain(act.pmPrinciple);
      usedPrinciples.add(act.pmPrinciple);

      const cfg = PM_PRINCIPLES_CONFIG[act.pmPrinciple];
      expect(cfg).toBeDefined();
      expect(cfg.label).toBeDefined();
      expect(cfg.colorCode).toBeDefined();
      expect(cfg.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }

    // Verify all 3 PM principles are represented in the lesson plan
    expect(usedPrinciples.has("BERKESADARAN")).toBe(true);
    expect(usedPrinciples.has("BERMAKNA")).toBe(true);
    expect(usedPrinciples.has("MENGGEMBIRAKAN")).toBe(true);
  });

  // =========================================================================
  // 11. Matriks Penguatan Aktivitas (MH, MA, MR 1-3)
  // =========================================================================
  it("Test 11: Activities bind to structured Activity Reinforcement Matrix codes (MH, MA, MR)", () => {
    const modul = createDefaultAthirahModulAjar();

    // Verify Memahami steps use MH-1..3
    for (const act of modul.pengalamanBelajar.memahami) {
      expect(act.matrixCode.startsWith("MH")).toBe(true);
      expect(MATRIKS_PENGUATAN_INFO[act.matrixCode]).toBeDefined();
    }

    // Verify Mengaplikasi steps use MA-1..3
    for (const act of modul.pengalamanBelajar.mengaplikasi) {
      expect(act.matrixCode.startsWith("MA")).toBe(true);
      expect(MATRIKS_PENGUATAN_INFO[act.matrixCode]).toBeDefined();
    }

    // Verify Merefleksi steps use MR-1..3
    for (const act of modul.pengalamanBelajar.merefleksi) {
      expect(act.matrixCode.startsWith("MR")).toBe(true);
      expect(MATRIKS_PENGUATAN_INFO[act.matrixCode]).toBeDefined();
    }
  });

  // =========================================================================
  // 12. Lampiran Asesmen (Tabel 8 Kolom)
  // =========================================================================
  it("Test 12: Lampiran Asesmen conforms strictly to statutory 8-column table structure", () => {
    const modul = createDefaultAthirahModulAjar();
    const rows = modul.lampiranAsesmen;

    expect(rows.length).toBeGreaterThanOrEqual(2);

    let hasWrittenAssessment = false;
    let hasNonWrittenAssessment = false;

    for (const row of rows) {
      // 8 Columns verification:
      expect(row.no).toBeGreaterThan(0); // 1. No
      expect(row.materiPokok).toBeDefined(); // 2. Materi Pokok
      expect(row.tpCode).toBeDefined(); // 3. TP
      expect(row.indikatorAsesmen).toBeDefined(); // 4. Indikator Asesmen
      expect(["TULIS", "NONTULIS"]).toContain(row.jenisAsesmen); // 5. Jenis Asesmen
      expect(typeof row.isLkpdAttached).toBe("boolean"); // 8. Checkbox LKPD

      if (row.jenisAsesmen === "TULIS") {
        hasWrittenAssessment = true;
        expect(row.uraianSoalTertulis).toBeDefined(); // 6. Uraian Soal Tertulis
      }
      if (row.jenisAsesmen === "NONTULIS") {
        hasNonWrittenAssessment = true;
        expect(row.deskripsiAktivitasNontulis).toBeDefined(); // 7. Deskripsi Aktivitas Nontulis
      }
    }

    expect(hasWrittenAssessment).toBe(true);
    expect(hasNonWrittenAssessment).toBe(true);
  });

  // =========================================================================
  // 13. Dual-Version LKPD Generator (Student Version)
  // =========================================================================
  it("Test 13: Student LKPD provides Bismillah opening, Islamic adab, stimulus, and 3-tier tasks", () => {
    const modul = createDefaultAthirahModulAjar();
    const { student } = createDefaultAthirahLkpd(modul);

    expect(student.id).toContain("-siswa");
    expect(student.modulAjarId).toBe(modul.id);
    expect(student.meetingNumber).toBe(modul.identitas.pertemuanKe);
    expect(student.unit).toBe(modul.identitas.unit);

    // Islamic Opening & Adab
    expect(student.openingDuaAndAdab.bismillahText).toContain("بِسْمِ اللَّهِ");
    expect(student.openingDuaAndAdab.adabBelajarTips.length).toBeGreaterThanOrEqual(3);

    // Contextual Stimulus
    expect(student.contextualStimulus.title).toBeDefined();
    expect(student.contextualStimulus.narrative.length).toBeGreaterThan(20);

    // Tiered 3M Tasks
    expect(student.aktivitasSiswa.faseMemahami.length).toBeGreaterThan(0);
    expect(student.aktivitasSiswa.faseMengaplikasi.length).toBeGreaterThan(0);
    expect(student.aktivitasSiswa.faseMerefleksi.length).toBeGreaterThan(0);

    // Student version must NOT contain teacher key guide
    expect(student.guruAnswerKeyGuide).toBeUndefined();
  });

  // =========================================================================
  // 14. Dual-Version LKPD Generator (Teacher Key Version)
  // =========================================================================
  it("Test 14: Teacher Key LKPD provides complete exemplar solutions and misconception remedies", () => {
    const modul = createDefaultAthirahModulAjar();
    const { teacher } = createDefaultAthirahLkpd(modul);

    expect(teacher.id).toContain("-guru");
    expect(teacher.guruAnswerKeyGuide).toBeDefined();

    const guide = teacher.guruAnswerKeyGuide!;

    // Exemplar answers per tier
    expect(guide.exemplarAnswersByTier["tier-1"]).toBeDefined();
    expect(guide.exemplarAnswersByTier["tier-2"]).toBeDefined();
    expect(guide.exemplarAnswersByTier["tier-3"]).toBeDefined();

    // Misconceptions
    expect(guide.misconceptionAnticipations.length).toBeGreaterThanOrEqual(2);
    for (const m of guide.misconceptionAnticipations) {
      expect(m.misconception).toBeDefined();
      expect(m.remedy).toBeDefined();
    }

    // Differentiation guides
    expect(guide.differentiationActionGuide.length).toBeGreaterThanOrEqual(2);

    // Gradebook mapped TP
    expect(guide.mappedGradebookTpId).toBe("TP-01");
  });

  // =========================================================================
  // 15. Rubrik Penilaian Analitik 4 Tingkat Tepat 100 Poin
  // =========================================================================
  it("Test 15: Teacher Key rubric features 4 criteria with 4 levels summing to exactly 100 points", () => {
    const modul = createDefaultAthirahModulAjar();
    const { student, teacher } = createDefaultAthirahLkpd(modul);

    const guide = teacher.guruAnswerKeyGuide!;
    const rubrics = guide.rubrikPenilaian4Level;

    // 4 Criteria
    expect(rubrics.length).toBe(4);

    let totalWeight = 0;
    for (const r of rubrics) {
      expect(r.aspek).toBeDefined();
      // 4 Levels per criterion
      expect(r.skor1_perluBimbingan).toBeDefined();
      expect(r.skor2_cukup).toBeDefined();
      expect(r.skor3_baik).toBeDefined();
      expect(r.skor4_mahir).toBeDefined();
      expect(r.bobotNilai).toBeGreaterThan(0);
      totalWeight += r.bobotNilai;
    }

    // Sum must be exactly 100 points
    expect(totalWeight).toBe(100);

    // Verify dual version validation passes statutory oracle
    const dualVal = validateAthirahLkpdDualVersion(student, teacher, modul.id);
    expect(dualVal.valid).toBe(true);
    expect(dualVal.errors.length).toBe(0);
  });

  // =========================================================================
  // 16. Store Persistence & Referential Synchronization
  // =========================================================================
  it("Test 16: Zustand store persists Modul Ajar and LKPD across mutations without data loss", () => {
    const store = useAppStore.getState();

    const modul = createDefaultAthirahModulAjar("SMA Islam Athirah 1 Makassar", 1);
    const { student, teacher } = createDefaultAthirahLkpd(modul);

    // Save to store
    store.saveModulAjar(modul);
    store.saveLKPD(student);
    store.saveLKPD(teacher);

    const updatedState = useAppStore.getState();

    // Verify retrieval
    expect(updatedState.modulAjarList.some((m) => m.id === modul.id)).toBe(true);
    expect(updatedState.lkpdList.some((l) => l.id === student.id)).toBe(true);
    expect(updatedState.lkpdList.some((l) => l.id === teacher.id)).toBe(true);

    const retrievedModul = updatedState.modulAjarList.find((m) => m.id === modul.id);
    expect(retrievedModul?.identitas.unit).toBe("SMA Islam Athirah 1 Makassar");
    expect(retrievedModul?.spiritualisasi.quranVerse.arabicText).toBe("إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ");

    // Mutation update
    const mutatedModul = {
      ...modul,
      identitas: {
        ...modul.identitas,
        namaPenyusun: "Dr. H. Ahmad Fadillah, S.Pd., M.Pd.",
      },
    };
    store.saveModulAjar(mutatedModul);

    const finalState = useAppStore.getState();
    const finalModul = finalState.modulAjarList.find((m) => m.id === modul.id);
    expect(finalModul?.identitas.namaPenyusun).toBe("Dr. H. Ahmad Fadillah, S.Pd., M.Pd.");
  });
});
