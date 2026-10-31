import type {
  AthirahUnit,
  AthirahProfilLulusan,
  ProgramKhasRenstra,
  PedagogiMerdekaPrinciple,
  MatriksPenguatanCode,
  ModulAjarAthirah,
  LkpdAthirah,
} from "../../types/index.ts";

export const ATHIRAH_UNITS_LIST: { id: AthirahUnit; label: string; city: string; level: "SD" | "SMP" | "SMA" }[] = [
  { id: "SMA Islam Athirah 1 Makassar", label: "SMA Islam Athirah 1 Makassar", city: "Makassar", level: "SMA" },
  { id: "SMA Islam Athirah Bukit Baruga", label: "SMA Islam Athirah Bukit Baruga", city: "Makassar (Baruga)", level: "SMA" },
  { id: "SMA Islam Athirah Bone", label: "SMA Islam Athirah Bone", city: "Bone", level: "SMA" },
  { id: "SMP Islam Athirah Kajaolalido", label: "SMP Islam Athirah Kajaolalido (Makassar)", city: "Makassar", level: "SMP" },
  { id: "SMP Islam Athirah Bukit Baruga", label: "SMP Islam Athirah Bukit Baruga", city: "Makassar (Baruga)", level: "SMP" },
  { id: "SMP Islam Athirah Bone", label: "SMP Islam Athirah Bone", city: "Bone", level: "SMP" },
  { id: "SD Islam Athirah 1 Makassar", label: "SD Islam Athirah 1 Makassar", city: "Makassar", level: "SD" },
  { id: "SD Islam Athirah 2 Bukit Baruga", label: "SD Islam Athirah 2 Bukit Baruga", city: "Makassar (Baruga)", level: "SD" },
];

export const PLA_DIMENSIONS_CONFIG: Record<
  AthirahProfilLulusan,
  { label: string; shortName: string; description: string; badgeColor: string }
> = {
  ANGGUN_BERAKHLAK: {
    label: "Anggun Berakhlak (Keislaman & Akhlak Mulia)",
    shortName: "Keislaman",
    description: "Menghayati ajaran Islam, berintegritas tinggi, sopan santun, dan menjunjung adab islami.",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
  },
  UNGGUL_PRESTASINYA: {
    label: "Unggul Prestasinya (Cerdas Berpikir & Komunikasi)",
    shortName: "Komunikasi",
    description: "Kecakapan kognitif tinggi, bernalar logis, fasih berkomunikasi, dan pembelajar sepanjang hayat.",
    badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-300",
  },
  KOKOH_SPIRITUALNYA: {
    label: "Kokoh Spiritualnya (Teguh Aqidah & Ibadah)",
    shortName: "Spiritual",
    description: "Menjalankan ibadah fardhu & sunnah secara tertib, mencintai Al-Quran, dan bertauhid murni.",
    badgeColor: "bg-teal-50 text-teal-800 border-teal-300",
  },
  TANGGUH_KARAKTERNYA: {
    label: "Tangguh Karakternya (Kemandirian & Kepemimpinan)",
    shortName: "Kemandirian",
    description: "Pantang menyerah, ulet, memiliki jiwa kepemimpinan (leadership), dan meregulasi diri.",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-300",
  },
  BERWAWASAN_GLOBAL_LINGKUNGAN: {
    label: "Berwawasan Global & Lingkungan (Eco-Minded)",
    shortName: "Kebangsaan",
    description: "Memahami dinamika internasional, fasih bahasa asing, cinta tanah air, dan peduli Adiwiyata.",
    badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-300",
  },
  BERNALAR_KRITIS: {
    label: "Bernalar Kritis (Analitis & Problem Solving)",
    shortName: "Kritis",
    description: "Mampu memproses informasi, mengevaluasi bukti secara objektif, dan memecahkan masalah kompleks.",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-300",
  },
  KREATIF_INOVATIF: {
    label: "Kreatif & Inovatif (Solutif & Orisinal)",
    shortName: "Kreativitas",
    description: "Menghasilkan gagasan orisinal, karya kreatif, dan solusi alternatif yang bernilai guna.",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-300",
  },
  BERGOTONG_ROYONG: {
    label: "Bergotong Royong (Kolaborasi & Peduli Sesama)",
    shortName: "Kolaborasi",
    description: "Kolaboratif, empati terhadap sesama, peduli kaum dhuafa, dan berjiwa sosial tinggi.",
    badgeColor: "bg-rose-50 text-rose-800 border-rose-300",
  },
};

export const RENSTRA_PROGRAMS_CONFIG: Record<
  ProgramKhasRenstra,
  { label: string; category: string; description: string; iconBg: string }
> = {
  ATHIRAH_BERQURAN: {
    label: "Al-Quran & Tahfidz (Athirah Berquran)",
    category: "Spiritual",
    description: "Gerakan Tahsin, Tahfidz Al-Quran, dan Tadabbur tematik ayat-ayat kauniyah/sains.",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  BILINGUAL_IMMERSION: {
    label: "English & Arabic Immersion",
    category: "Bahasa",
    description: "Penguasaan Bahasa Inggris dan Arab dalam instruksi kelas dan pembiasaan harian.",
    iconBg: "bg-sky-100 text-sky-700",
  },
  DIGITAL_TRANSFORMATION: {
    label: "Digital Native & Coding (Smart School)",
    category: "Teknologi",
    description: "Pemanfaatan platform digital Athirah Smart School, berpikir komputasional, dan etika siber.",
    iconBg: "bg-indigo-100 text-indigo-700",
  },
  ECO_SCHOOL_ADIWIYATA: {
    label: "Green School / Peduli Lingkungan",
    category: "Lingkungan",
    description: "Budaya hemat energi, konservasi lingkungan Adiwiyata, dan pemilahan sampah organik/anorganik.",
    iconBg: "bg-green-100 text-green-700",
  },
  LEADER_IN_ME: {
    label: "Budi Pekerti Athirah (Leader in Me / 7 Habits)",
    category: "Karakter",
    description: "Internalisasi 7 kebiasaan manusia efektif yang diintegrasikan dengan adab islami.",
    iconBg: "bg-amber-100 text-amber-700",
  },
  KALLA_CORE_VALUES: {
    label: "Kalla Core Values (Jujur, Kerja Keras, Cepat, Bersama)",
    category: "Yayasan Kalla",
    description: "Nilai luhur Kalla Group: Lebih Cepat, Lebih Baik, Aktif Bekerja Sama, dan Berintegritas.",
    iconBg: "bg-rose-100 text-rose-700",
  },
};

export const PM_PRINCIPLES_CONFIG: Record<
  PedagogiMerdekaPrinciple,
  { label: string; colorCode: string; hex: string; badgeClass: string; meaning: string }
> = {
  BERKESADARAN: {
    label: "Berkesadaran",
    colorCode: "Biru",
    hex: "#2563EB",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
    meaning: "Menyadari tujuan hadir di kelas, niat ikhlas menuntut ilmu lillahi ta'ala, mindfulness, dan adab.",
  },
  BERMAKNA: {
    label: "Bermakna",
    colorCode: "Hijau",
    hex: "#16A34A",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    meaning: "Terhubung dengan konteks nyata kehidupan siswa, pemecahan masalah riil, dan sunnatullah.",
  },
  MENGGEMBIRAKAN: {
    label: "Menggembirakan",
    colorCode: "Orange",
    hex: "#EA580C",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    meaning: "Suasana belajar dinamis, interaktif, gamifikasi, simulasi gerak, dan collaborative challenges.",
  },
};

export const MATRIKS_PENGUATAN_INFO: Record<
  MatriksPenguatanCode,
  { code: MatriksPenguatanCode; phase: "MEMAHAMI" | "MENGAPLIKASI" | "MEREFLEKSI"; level: string; bloom: string; desc: string }
> = {
  "MH-1": { code: "MH-1", phase: "MEMAHAMI", level: "Tingkat 1", bloom: "C1: Mengingat", desc: "Mengenal istilah, menyimak ayat, menyebutkan fakta dasar dan definisi." },
  "MH-2": { code: "MH-2", phase: "MEMAHAMI", level: "Tingkat 2", bloom: "C2: Menjelaskan", desc: "Menguraikan konsep dengan bahasa sendiri, merangkum prinsip kerja." },
  "MH-3": { code: "MH-3", phase: "MEMAHAMI", level: "Tingkat 3", bloom: "C4: Menganalisis", desc: "Membedakan karakteristik, mengidentifikasi pola persoalan, membedah struktur." },
  "MA-1": { code: "MA-1", phase: "MENGAPLIKASI", level: "Tingkat 1", bloom: "C3: Prosedural", desc: "Mengikuti langkah terstruktur, mengisi tabel pengamatan sesuai panduan." },
  "MA-2": { code: "MA-2", phase: "MENGAPLIKASI", level: "Tingkat 2", bloom: "C3-C4: Semi-Mandiri", desc: "Menyelesaikan studi kasus kontekstual melalui kolaborasi tim secara mandiri." },
  "MA-3": { code: "MA-3", phase: "MENGAPLIKASI", level: "Tingkat 3", bloom: "C5-C6: Kreasi Orisinal", desc: "Merancang skema baru, memodifikasi algoritma, menciptakan karya tim." },
  "MR-1": { code: "MR-1", phase: "MEREFLEKSI", level: "Tingkat 1", bloom: "Metakognisi Diri", desc: "Mengidentifikasi konsep yang sudah dikuasai serta kesulitan belajar." },
  "MR-2": { code: "MR-2", phase: "MEREFLEKSI", level: "Tingkat 2", bloom: "Evaluasi Kritis", desc: "Menilai efektivitas strategi kerja kelompok, membandingkan hasil terhadap rubrik." },
  "MR-3": { code: "MR-3", phase: "MEREFLEKSI", level: "Tingkat 3", bloom: "Spiritual & Aksi", desc: "Mengambil hikmah nilai keislaman, menyusun komitmen perbaikan diri dan amaliyah." },
};

/**
 * Creates default initial Athirah Modul Ajar object matching all 6 mandatory components
 */
export function createDefaultAthirahModulAjar(
  unit: AthirahUnit = "SMA Islam Athirah 1 Makassar",
  meetingNumber: number = 1
): ModulAjarAthirah {
  const id = `modul-athirah-m${meetingNumber}-${unit.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  const lkpdId = `lkpd-athirah-m${meetingNumber}-${unit.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

  return {
    id,
    associatedLkpdId: lkpdId,
    identitas: {
      unit,
      kelas: "Kelas X",
      fase: "E",
      mataPelajaran: "Informatika",
      materiPokok: "Algoritma Pemilahan (Sorting) & Berpikir Komputasional",
      durasiPertemuanMinutes: 135,
      alokasiWaktuDisplay: "3 JP (3 x 45 Menit)",
      pertemuanKe: meetingNumber,
      semester: 1,
      tahunAjaran: "2026/2027",
      namaPenyusun: "Ahmad Fadillah, S.Pd., Gr.",
    },
    identifikasi: {
      profilLulusanAthirah: [
        "ANGGUN_BERAKHLAK",
        "UNGGUL_PRESTASINYA",
        "KOKOH_SPIRITUALNYA",
        "TANGGUH_KARAKTERNYA",
        "BERWAWASAN_GLOBAL_LINGKUNGAN",
        "BERNALAR_KRITIS",
        "KREATIF_INOVATIF",
        "BERGOTONG_ROYONG",
      ],
      programKhasRenstra: [
        "ATHIRAH_BERQURAN",
        "DIGITAL_TRANSFORMATION",
        "LEADER_IN_ME",
        "KALLA_CORE_VALUES",
        "ECO_SCHOOL_ADIWIYATA",
      ],
      kosmologiKurikulumNote:
        "Memadukan pemahaman Ayat Kauniyah (sains komputasi terapan) dengan Ayat Qauliyah (Al-Quran & Hadits) dalam kerangka Tauhidik terintegrasi tanpa dikotomi ilmu.",
    },
    spiritualisasi: {
      quranVerse: {
        surahNumber: 54,
        surahName: "Al-Qamar",
        ayahNumber: 49,
        arabicText: "إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ",
        translationId: "Sungguh, Kami menciptakan segala sesuatu menurut ukuran (takaran yang tepat dan sistematis).",
        contextualTafsir:
          "Pembelajaran strategi algoritmik pemilahan data (sorting) mencerminkan bagaimana Allah SWT telah mengatur seluruh alam semesta dengan ukuran, keteraturan, ketelitian, dan presisi yang sempurna sebagai cerminan sunnatullah.",
      },
      hadith: {
        narrator: "HR. Al-Bukhari & Muslim (dari Aisyah r.a.)",
        arabicText: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ",
        translationId:
          "Sesungguhnya Allah menyukai jika seseorang di antara kalian mengerjakan suatu amalan secara itqan (rapi, teratur, tekun, dan profesional).",
        pedagogicalMeaning:
          "Melatih siswa menyusun langkah algoritma secara runut, teratur, teliti, dan bebas dari kesalahan logika sebagai cerminan sikap itqan seorang mukmin sejati.",
      },
      islamicHistory: {
        figureName: "Abu Ja'far Muhammad bin Musa Al-Khwarizmi",
        historicalEra: "Zaman Keemasan Islam (Baitul Hikmah, Baghdad abad ke-9 M)",
        contribution:
          "Peletak dasar ilmu aljabar (al-jabr) dan konsep algoritma sistematis yang menjadi fondasi seluruh ilmu komputasi dan kecerdasan buatan dunia modern.",
        inspirationalValue:
          "Integritas ilmuwan Muslim yang mendedikasikan penemuan sains matematis untuk memudahkan perhitungan mawaris (waris) dan arah kiblat bagi kemaslahatan umat.",
      },
      classicalTextOrFatwa: {
        title: "Kitab Al-Jabr wa Al-Muqabala & Ihya Ulumiddin",
        authorOrIssuer: "Al-Khwarizmi & Imam Al-Ghazali",
        ethicalGuideline:
          "Amanah ilmiah dalam menjaga kejujuran data, adab menuntut ilmu, dan memanfaatkan kecakapan teknologi hanya untuk kebaikan bersama.",
      },
      coreSpiritualValue: "Itqan (Ketelitian), Amanah, Keteraturan Sunnatullah, Tawadhu, dan Syukur",
    },
    desainPembelajaran: {
      tujuanPembelajaran: {
        audience: "Peserta didik Fase E Kelas X Sekolah Islam Athirah",
        behavior: "menganalisis dan menerapkan mekanisme strategi algoritmik pemilahan (Bubble Sort & Selection Sort)",
        condition: "melalui simulasi kartu interaktif, diskusi kelompok terarah, dan studi kasus pemecahan masalah",
        degree: "dengan tepat, terurut, dan mampu mengidentifikasi efisiensi langkah iterasi secara akurat",
        integratedSpiritualGoal:
          "Mengagumi keteraturan ciptaan Allah SWT serta menunjukkan sikap itqan, teliti, dan adab islami dalam berkolaborasi.",
        fullStatement:
          "Melalui simulasi kartu interaktif dan studi kasus pemecahan masalah, peserta didik Fase E Kelas X mampu menganalisis serta menerapkan strategi algoritmik pemilahan data (Bubble Sort) secara tepat, mandiri, dan berkarakter itqan sesuai nilai-nilai Islam.",
      },
      pedagogicalPractices: {
        modelPembelajaran: "Problem-Based Learning (PBL) Terpadu",
        metodePembelajaran: [
          "Demonstrasi Konsep",
          "Simulasi Kartu Angka (Unplugged)",
          "Diskusi Kelompok Terarah",
          "Presentasi Solusi",
          "Refleksi Spiritual",
        ],
        diferensiasiKonten:
          "Penyediaan modul infografis visual warna-warni, kartu simulasi konkret, serta wacana studi kasus logistik komoditas.",
        diferensiasiProses:
          "Scaffolding 3-tier berjenjang: Tier 1 (panduan langkah terstruktur untuk kelompok bimbingan), Tier 2 (analisis tabel reguler), Tier 3 (tantangan optimasi worst-case untuk kelompok mahir).",
        diferensiasiProduk:
          "Ragam bentuk respon: tabel trace pass algoritma, diagram alur logika, atau presentasi peragaan simulasi tim.",
      },
      mediaDanLingkungan: {
        mediaFisik: ["Set Kartu Angka Simulasi [8, 3, 5, 1, 9]", "Papan Pajang Post-it", "Lembar Kerja Siswa Athirah"],
        sumberDigital: [
          "Platform Athirah Smart School",
          "Simulator Algoritma Visual Online",
          "Al-Quran Digital Kemenag",
        ],
        lingkunganBelajar: [
          "Ruang Kelas Meja Melingkar Kolaboratif",
          "Laboratorium Komputer Ber-AC",
          "Area Asri Adiwiyata Sekolah",
        ],
        kemitraan: [
          "Paguyuban Orang Tua Murid (POMD)",
          "Yayasan Hadji Kalla (Program CSR & Pendidikan)",
          "Praktisi Industri Teknologi Alumni Athirah",
        ],
      },
    },
    pengalamanBelajar: {
      memahami: [
        {
          stepNumber: 1,
          phase: "MEMAHAMI",
          title: "Orientasi Berkesadaran, Doa & Tadabbur QS. Al-Qamar: 49",
          durationMinutes: 15,
          teacherActivity:
            "Guru membuka kelas dengan salam hangat islami, memandu doa belajar, dan memantik tadabbur QS. Al-Qamar: 49 tentang sunnatullah keteraturan alam.",
          studentActivity:
            "Peserta didik melafalkan doa belajar bersama secara khusyuk, menyimak ayat dengan seksama, dan mengenali definisi awal algoritma pemilahan data.",
          pmPrinciple: "BERKESADARAN",
          matrixCode: "MH-1",
        },
        {
          stepNumber: 2,
          phase: "MEMAHAMI",
          title: "Eksplorasi Konsep Bermakna & Simulasi Pasangan Angka",
          durationMinutes: 20,
          teacherActivity:
            "Guru mendemonstrasikan mekanisme pertukaran berpasangan di depan kelas menggunakan kartu angka acak dan mengajukan pertanyaan pemantik kontekstual.",
          studentActivity:
            "Peserta didik mengemukakan ide awal dengan bahasa sendiri, menganalisis mengapa data acak butuh diurutkan, dan mencermati alur pass.",
          pmPrinciple: "BERMAKNA",
          matrixCode: "MH-2",
        },
      ],
      mengaplikasi: [
        {
          stepNumber: 3,
          phase: "MENGAPLIKASI",
          title: "Penyelidikan Kolaboratif LKPD Berjenjang (3-Tier Scaffolding)",
          durationMinutes: 50,
          teacherActivity:
            "Guru mengorganisir kelompok belajar heterogen, membagikan LKPD 3-tier, serta memberikan pendampingan adaptif bagi kelompok bimbingan.",
          studentActivity:
            "Peserta didik berbagi peran di kelompoknya, mempraktikkan simulasi 5 kartu di meja, dan mencatat setiap pertukaran posisi pada tabel kerja LKPD.",
          pmPrinciple: "MENGGEMBIRAKAN",
          matrixCode: "MA-2",
          differentiatedTier: "TIER_2_REGULER",
        },
        {
          stepNumber: 4,
          phase: "MENGAPLIKASI",
          title: "Tantangan Optimasi & Presentasi Solusi Tim",
          durationMinutes: 30,
          teacherActivity:
            "Guru memoderasi presentasi silang antarkelompok dan memberikan tantangan pengayaan kasus ekstrem (deret terbalik) bagi kelompok cepat selesai.",
          studentActivity:
            "Perwakilan kelompok mempresentasikan hasil iterasi pass secara santun, menanggapi feedback rekan, dan membuktikan efisiensi jumlah pertukaran.",
          pmPrinciple: "BERMAKNA",
          matrixCode: "MA-3",
          differentiatedTier: "TIER_3_MANDIRI",
        },
      ],
      merefleksi: [
        {
          stepNumber: 5,
          phase: "MEREFLEKSI",
          title: "Sintesis Konsep, Evaluasi Kritis Rubrik & Muhasabah Adab Itqan",
          durationMinutes: 20,
          teacherActivity:
            "Guru memfasilitasi refleksi bersama, mengaitkan keberhasilan kerja algoritma dengan sikap itqan, dan menutup sesi dengan doa kafaratul majlis.",
          studentActivity:
            "Peserta didik mengisi lembar refleksi diri/antarteman, menilai ketelitian kelompok terhadap rubrik, dan menyusun komitmen perbaikan sikap amaliyah.",
          pmPrinciple: "BERKESADARAN",
          matrixCode: "MR-3",
        },
      ],
    },
    lampiranAsesmen: [
      {
        no: 1,
        materiPokok: "Strategi Algoritma Sorting",
        tpCode: "TP-01",
        tpDescription: "Menganalisis dan menerapkan mekanisme algoritma Bubble Sort pada deret data terstruktur",
        indikatorAsesmen: "Menentukan susunan array dan jumlah pertukaran setelah iterasi Pass 1 dan Pass 2 selesai",
        jenisAsesmen: "TULIS",
        uraianSoalTertulis:
          "Diberikan deret kartu angka [8, 3, 5, 1, 9]. Tuliskan susunan lengkap array dan catat berapa kali pertukaran elemen yang terjadi pada akhir Pass 1 dan akhir Pass 2!",
        deskripsiAktivitasNontulis: "-",
        isLkpdAttached: true,
      },
      {
        no: 2,
        materiPokok: "Strategi Algoritma Sorting",
        tpCode: "TP-01",
        tpDescription: "Mendemonstrasikan kerja sama tim dalam simulasi kinestetik algoritma pemilahan data",
        indikatorAsesmen:
          "Mendemonstrasikan pertukaran kartu secara rapi, tertib, dan mampu menjelaskan alasan logika pertukaran secara komunikatif",
        jenisAsesmen: "NONTULIS",
        uraianSoalTertulis: "-",
        deskripsiAktivitasNontulis:
          "Penilaian unjuk kerja peragaan kelompok menggunakan 5 kartu fisik: ketepatan peragaan pass, pembagian tugas anggota tim, dan adab santun dalam berdiskusi.",
        isLkpdAttached: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Creates default initial Athirah LKPD objects (Synchronized Student and Teacher versions)
 */
export function createDefaultAthirahLkpd(
  modulAjar: ModulAjarAthirah
): { student: LkpdAthirah; teacher: LkpdAthirah } {
  const baseId = modulAjar.associatedLkpdId || `lkpd-${modulAjar.id}`;

  const student: LkpdAthirah = {
    id: `${baseId}-siswa`,
    modulAjarId: modulAjar.id,
    meetingNumber: modulAjar.identitas.pertemuanKe,
    unit: modulAjar.identitas.unit,
    mataPelajaran: modulAjar.identitas.mataPelajaran,
    kelas: modulAjar.identitas.kelas,
    materiPokok: modulAjar.identitas.materiPokok,
    alokasiWaktuMinutes: modulAjar.identitas.durasiPertemuanMinutes,
    openingDuaAndAdab: {
      bismillahText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      ayatStimulusSnippet:
        "QS. Al-Qamar: 49 — 'Sungguh, Kami menciptakan segala sesuatu menurut ukuran (takaran yang tepat).'",
      adabBelajarTips: [
        "Awali setiap pekerjaan dengan niat ikhlas menuntut ilmu karena Allah SWT.",
        "Mendengarkan rekan saat menyampaikan pendapat tanpa memotong pembicaraan.",
        "Menjunjung tinggi kejujuran data eksperimen dan saling tolong-menolong dalam kebaikan.",
        "Menjaga kebersihan meja kerja dan merapikan kembali media pembelajaran setelah selesai.",
      ],
    },
    contextualStimulus: {
      title: "Studi Kasus: Pemilahan Distribusi Karung Beras Gudang Logistik Sulawesi Selatan",
      narrative:
        "Sebuah gudang logistik beras di Sulawesi Selatan menerima 5 karung beras dengan nomor kode acak: [8, 3, 5, 1, 9]. Agar distribusi ke pasar berjalan lancar, karung-karung tersebut harus diurutkan dari bobot terkecil ke terbesar. Bagaimana algoritma Bubble Sort membantu pekerja menyusun karung beras tersebut secara sistematis dan minim kesalahan?",
    },
    aktivitasSiswa: {
      faseMemahami: [
        {
          tierLevel: 1,
          targetGroup: "PERLU_BIMBINGAN",
          instructions:
            "Baca wacana stimulus di atas dengan seksama. Diskusikan dengan kelompokmu dan jawablah pertanyaan pemantik berikut!",
          taskPrompt:
            "1. Tuliskan 2 fakta penting dari permasalahan distribusi gudang beras di atas!\n2. Mengapa urutan karung beras harus disusun dari yang terkecil ke terbesar?",
          answerType: "ESSAY",
          scoreWeight: 20,
        },
      ],
      faseMengaplikasi: [
        {
          tierLevel: 2,
          targetGroup: "REGULER",
          instructions:
            "Gunakan 5 kartu angka yang dibagikan guru. Simulasikan langkah demi langkah algoritma Bubble Sort dan catat setiap hasil iterasi (Pass) pada tabel kerja berikut!",
          hintsOrScaffolding:
            "Petunjuk: Pada setiap pass, bandingkan 2 elemen bersebelahan (indeks i dan i+1). Jika elemen kiri > kanan, tukar posisinya!",
          taskPrompt:
            "Tabel Simulasi Iterasi Bubble Sort:\n- Data Awal: [8, 3, 5, 1, 9]\n- Pass 1: [ ... , ... , ... , ... , ... ] (Jumlah pertukaran: ...)\n- Pass 2: [ ... , ... , ... , ... , ... ] (Jumlah pertukaran: ...)\n- Pass 3: [ ... , ... , ... , ... , ... ] (Jumlah pertukaran: ...)\n- Pass 4: [ ... , ... , ... , ... , ... ] (Jumlah pertukaran: ...)",
          answerType: "TABLE",
          scoreWeight: 50,
        },
      ],
      faseMerefleksi: [
        {
          tierLevel: 3,
          targetGroup: "MAHIR",
          instructions:
            "Tarik kesimpulan bersama kelompokmu dan refleksikan nilai karakter itqan yang kamu rasakan hari ini!",
          taskPrompt:
            "1. Apa yang terjadi jika ada dua angka yang bernilai sama saat pemilahan?\n2. Bagaimana sikap itqan (ketelitian) membantumu menyelesaikan tugas ini tanpa kesalahan data?",
          answerType: "ESSAY",
          scoreWeight: 30,
        },
      ],
    },
    createdAt: modulAjar.createdAt,
    updatedAt: modulAjar.updatedAt,
  };

  const teacher: LkpdAthirah = {
    ...student,
    id: `${baseId}-guru`,
    guruAnswerKeyGuide: {
      exemplarAnswersByTier: {
        "tier-1":
          "1. Fakta penting: Terdapat 5 karung beras dengan susunan acak [8, 3, 5, 1, 9]; harus diurutkan dari kecil ke besar untuk efisiensi distribusi logistik.\n2. Manfaat pengurutan: Memudahkan pencarian data, mempercepat inventarisasi barang, dan meminimalkan kekeliruan pengiriman.",
        "tier-2":
          "Hasil Simulasi Bubble Sort Lengkap:\n• Pass 1: [3, 5, 1, 8, 9] (Pertukaran: (8,3) tukar, (8,5) tukar, (8,1) tukar, (8,9) tidak tukar -> Total 3 pertukaran. Elemen 9 terkunci di posisi akhir).\n• Pass 2: [3, 1, 5, 8, 9] (Pertukaran: (3,5) tidak tukar, (5,1) tukar, (5,8) tidak tukar -> Total 1 pertukaran. Elemen 8 terkunci).\n• Pass 3: [1, 3, 5, 8, 9] (Pertukaran: (3,1) tukar, (3,5) tidak tukar -> Total 1 pertukaran. Elemen 5 terkunci).\n• Pass 4: [1, 3, 5, 8, 9] (Pemeriksaan: Tidak ada pertukaran -> Selesai dan terurut sempurna).\nTotal pertukaran keseluruhan: 5 kali.",
        "tier-3":
          "1. Jika terdapat dua angka bernilai sama, algoritma Bubble Sort tidak akan menukar posisinya (bersifat stable sorting), sehingga urutan awal relatif tetap terjaga.\n2. Nilai itqan mengajarkan kehati-hatian dalam setiap langkah pembandingan. Ketelitian memastikan tidak ada angka yang terlewat atau salah catat, mencerminkan integritas muslim.",
      },
      misconceptionAnticipations: [
        {
          misconception: "Siswa mengira jika sebuah pass tampak sudah terurut, algoritma langsung berhenti secara otomatis.",
          remedy:
            "Guru menegaskan bahwa komputer membutuhkan indikator logika (boolean flag 'isSwapped') untuk memastikan tidak ada lagi pertukaran sebelum menyatakan berhenti.",
        },
        {
          misconception: "Siswa membandingkan elemen pertama dengan elemen terakhir secara melompat.",
          remedy:
            "Guru memperagakan kembali di meja peraga bahwa Bubble Sort HANYA membandingkan dua elemen yang bersebelahan (adjacent elements).",
        },
      ],
      differentiationActionGuide: [
        {
          condition: "Kelompok Tier 1 (Perlu Bimbingan) kesulitan menentukan elemen mana yang sudah terkunci.",
          action:
            "Guru memberikan stiker warna hijau pada angka yang sudah terkunci di sebelah kanan sebagai batas aman.",
        },
        {
          condition: "Kelompok Tier 3 (Mahir) telah menyelesaikan tugas dalam waktu kurang dari 20 menit.",
          action:
            "Guru memberikan kartu ke-6 dan tantangan analisis kasus terburuk (deret terbalik [9, 8, 5, 3, 1]) serta menghitung rumus n*(n-1)/2 pertukaran.",
        },
      ],
      rubrikPenilaian4Level: [
        {
          aspek: "Ketepatan Analisis Konsep Dasar",
          skor1_perluBimbingan: "Belum mampu mengidentifikasi fakta stimulus dan konsep dasar pemilahan data.",
          skor2_cukup: "Mampu menyebutkan fakta stimulus namun membutuhkan bimbingan untuk memahami tujuan sorting.",
          skor3_baik: "Menganalisis fakta dan konsep pemilahan secara tepat dan mandiri.",
          skor4_mahir: "Menganalisis konsep secara mendalam, kritis, dan mampu mengaitkannya dengan persoalan nyata lain.",
          bobotNilai: 30,
        },
        {
          aspek: "Penerapan Algoritma & Prosedur Iterasi",
          skor1_perluBimbingan: "Hanya mampu menyelesaikan Pass 1 dengan banyak kesalahan pertukaran angka.",
          skor2_cukup: "Menyelesaikan Pass 1 dan 2 dengan maksimal 1 kesalahan pertukaran.",
          skor3_baik: "Menyelesaikan seluruh Pass 1-4 secara tepat, runut, dan menghitung jumlah pertukaran dengan benar.",
          skor4_mahir: "Menyelesaikan seluruh pass secara sempurna serta mampu menjelaskan efisiensi langkah secara sistematis.",
          bobotNilai: 30,
        },
        {
          aspek: "Kolaborasi Tim & Adab Islami",
          skor1_perluBimbingan: "Pasif dalam kelompok dan memerlukan pengingat berulang terkait adab berdiskusi.",
          skor2_cukup: "Cukup berpartisipasi aktif namun terkadang mendominasi tanpa mendengarkan rekan tim.",
          skor3_baik: "Aktif berbagi tugas, saling mendengarkan, dan menerapkan adab islami dengan baik.",
          skor4_mahir: "Menunjukkan kepemimpinan teladan, santun, memotivasi rekan, dan menjunjung tinggi adab tolong-menolong.",
          bobotNilai: 20,
        },
        {
          aspek: "Refleksi Nilai Karakter & Kualitas Produk LKPD",
          skor1_perluBimbingan: "Lembar respon tidak lengkap, coretan tidak rapi, dan belum memuat refleksi bermakna.",
          skor2_cukup: "Lembar respon terisi cukup rapi dengan refleksi sederhana mengenai kesulitan belajar.",
          skor3_baik: "Lembar respon terisi lengkap, tulisan rapi, dan mampu menghubungkan pengalaman dengan nilai itqan.",
          skor4_mahir: "Penyajian sangat rapi, estetis, sistematis, serta refleksi spiritual sangat mendalam dan inspiratif.",
          bobotNilai: 20,
        },
      ],
      mappedGradebookTpId: "TP-01",
    },
  };

  return { student, teacher };
}
