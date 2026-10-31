/**
 * Specification-Derived Test Fixtures for KelasMerdeka E2E Testing
 * Authoritative ground truth derived from:
 * - PRD.md (Sections 3, 4, 6, 7, 8, 9, 10)
 * - orchestrator_2/PROJECT.md
 * - spec_miner_athirah_2/spec_analysis.md
 */

export const VALID_DAPODIK_CSV = `No,Nama Peserta Didik,NISN,NIS,Jenis Kelamin,Tempat Lahir,Tanggal Lahir,NIK,Agama,Alamat,Nama Ayah,Nama Ibu,Pekerjaan Orang Tua,Nomor Telepon/HP
1,Muhammad Fatih Al-Farabi,0081234567,23001,L,Makassar,2008-04-12,7371011204080001,Islam,"Jl. Kajaolalido No. 14, Makassar",Ahmad Farabi,Siti Aminah,Wiraswasta,081234567890
2,Aisyah Putri Humaira,0082345678,23002,P,Gowa,2008-07-25,7371022507080002,Islam,Jl. Hertasning Blok E No. 9,Rahmat Hidayat,Nurul Fadilah,PNS,081234567891
3,Sulaiman Rasyid Al-Haddad,0083456789,23003,L,Maros,2008-01-19,7371031901080003,Islam,Jl. Perintis Kemerdekaan KM 10,Mansyur Rasyid,Khadijah,Dosen,081234567892
4,Fathimah Az-Zahra,0084567890,23004,P,Makassar,2008-11-03,7371040311080004,Islam,Jl. Pengayoman Komp. Mirah,Zulkifli,Rahmawati,Karyawan Swasta,081234567893
5,Umar Abdul Aziz,0085678901,23005,L,Makassar,2008-09-15,7371051509080005,Islam,Jl. Sultan Alauddin No. 45,Aziz Syam,Fatmawati,TNI,081234567894`;

export const SEMICOLON_DAPODIK_CSV = `No;Nama Peserta Didik;NISN;NIS;Jenis Kelamin;Tempat Lahir;Tanggal Lahir;NIK;Agama;Alamat;Nama Ayah;Nama Ibu;Pekerjaan Orang Tua;Nomor Telepon/HP
1;Muhammad Fatih Al-Farabi;0081234567;23001;L;Makassar;2008-04-12;7371011204080001;Islam;Jl. Kajaolalido No. 14;Ahmad Farabi;Siti Aminah;Wiraswasta;081234567890
2;Aisyah Putri Humaira;0082345678;23002;P;Gowa;2008-07-25;7371022507080002;Islam;Jl. Hertasning Blok E;Rahmat Hidayat;Nurul Fadilah;PNS;081234567891`;

export const BOM_QUOTED_DAPODIK_CSV = `\uFEFFNo,Nama Peserta Didik,NISN,NIS,Jenis Kelamin,Tempat Lahir,Tanggal Lahir,NIK,Agama,Alamat,Nama Ayah,Nama Ibu,Pekerjaan Orang Tua,Nomor Telepon/HP
1,"Farhan Al-Kautsar, S.Kom.",0089876543,23010,L,Makassar,2008-05-10,7371011005080006,Islam,"Jl. AP Pettarani, Ruko Bisnis No. 3",Drs. Syukri, M.Pd.,Hj. Maimunah,Guru,081299887766
2,Nadia Zulfa,0089876544,23011,P,Makassar,2008-08-18,7371011808080007,Islam,"Jl. Boulevard, Panakkukang",Ir. H. Baharuddin,Dra. Hasnah,Arsitek,081299887767`;

export const MISSING_NISN_DAPODIK_CSV = `No,Nama Peserta Didik,NISN,NIS,Jenis Kelamin,Tempat Lahir,Tanggal Lahir,NIK,Agama,Alamat,Nama Ayah,Nama Ibu,Pekerjaan Orang Tua,Nomor Telepon/HP
1,Ahmad Newbie SD,,SD-001,L,Makassar,2019-03-01,7371010103190001,Islam,Jl. Kajaolalido,Budi,Ani,Wiraswasta,081111111111
2,Siti Murid Baru, ,SD-002,P,Gowa,2019-06-15,7371011506190002,Islam,Jl. Malino,Iwan,Dewi,PNS,082222222222`;

export const MALFORMED_ROWS_DAPODIK_CSV = `No,Nama Peserta Didik,NISN,NIS,Jenis Kelamin,Tempat Lahir,Tanggal Lahir,NIK,Agama,Alamat,Nama Ayah,Nama Ibu,Pekerjaan Orang Tua,Nomor Telepon/HP
1,Murid Valid,0081112223,23099,L,Makassar,2008-01-01,7371010101080001,Islam,Alamat,Ayah,Ibu,PNS,081234
2,Baris Rusak Tanpa Kolom Lengkap,0081112224
3,Murid Valid Kedua,0081112225,23100,P,Makassar,2008-02-02,7371010202080002,Islam,Alamat,Ayah,Ibu,PNS,081235
,,,
`;

export const ATHIRAH_UNITS = [
  "SD Islam Athirah 1 Makassar",
  "SD Islam Athirah 2 Bukit Baruga",
  "SMP Islam Athirah Kajaolalido",
  "SMP Islam Athirah Bukit Baruga",
  "SMP Islam Athirah Bone",
  "SMA Islam Athirah 1 Makassar",
  "SMA Islam Athirah Bukit Baruga",
  "SMA Islam Athirah Bone",
] as const;

export const ATHIRAH_PLA_DIMENSIONS = [
  "ANGGUN_BERAKHLAK",
  "UNGGUL_PRESTASINYA",
  "KOKOH_SPIRITUALNYA",
  "TANGGUH_KARAKTERNYA",
  "BERWAWASAN_GLOBAL_LINGKUNGAN",
  "BERNALAR_KRITIS",
  "KREATIF_INOVATIF",
  "BERGOTONG_ROYONG",
] as const;

export const ATHIRAH_RENSTRA_PROGRAMS = [
  "ATHIRAH_BERQURAN",
  "BILINGUAL_IMMERSION",
  "DIGITAL_TRANSFORMATION",
  "ECO_SCHOOL_ADIWIYATA",
  "LEADER_IN_ME",
  "KALLA_CORE_VALUES",
] as const;

export const PEDAGOGI_MERDEKA_PRINCIPLES = [
  "BERKESADARAN", // Mindful [Biru]
  "BERMAKNA",     // Meaningful [Hijau]
  "MENGGEMBIRAKAN", // Joyful [Orange]
] as const;

export const MATRIKS_PENGUATAN_CODES = [
  "MH-1", "MH-2", "MH-3",
  "MA-1", "MA-2", "MA-3",
  "MR-1", "MR-2", "MR-3",
] as const;

export const SAMPLE_CP_INFORMATIKA_FASE_E = 
  "Pada akhir fase E, peserta didik mampu memahami strategi algoritmik standar untuk menyelesaikan persoalan pemilahan dan pencarian; serta menerapkan dekomposisi, pengenalan pola, abstraksi, dan berpikir algoritmik pada persoalan kehidupan sehari-hari maupun pemrograman.";

export const SAMPLE_ATHIRAH_MODUL_AJAR = {
  id: "modul-athirah-x-inf-01",
  identitas: {
    unit: "SMA Islam Athirah 1 Makassar",
    kelas: "Kelas X / Fase E",
    fase: "E",
    mataPelajaran: "Informatika",
    materiPokok: "Strategi Algoritmik dan Pemilahan Data (Sorting)",
    durasiPertemuanMinutes: 135,
    alokasiWaktuDisplay: "3 JP (3 x 45 Menit)",
    pertemuanKe: 1,
    semester: 1,
    tahunAjaran: "2026/2027",
    namaPenyusun: "Ahmad Fadillah, S.Pd., Gr.",
  },
  identifikasi: {
    profilLulusanAthirah: [
      "ANGGUN_BERAKHLAK",
      "UNGGUL_PRESTASINYA",
      "KOKOH_SPIRITUALNYA",
      "BERNALAR_KRITIS",
    ],
    programKhasRenstra: [
      "ATHIRAH_BERQURAN",
      "DIGITAL_TRANSFORMATION",
      "KALLA_CORE_VALUES",
    ],
    kosmologiKurikulumNote: "Keteraturan algoritma mencerminkan sunnatullah dalam penciptaan alam semesta yang terukur sempurna.",
  },
  spiritualisasi: {
    quranVerse: {
      surahNumber: 54,
      surahName: "Al-Qamar",
      ayahNumber: 49,
      arabicText: "إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ",
      translationId: "Sungguh, Kami menciptakan segala sesuatu menurut ukuran (takaran/algoritma yang tepat).",
      contextualTafsir: "Pembelajaran algoritma pemilahan data (sorting) merefleksikan bagaimana Allah SWT menata alam semesta dengan ukuran, presisi, dan keteraturan tinggi.",
    },
    hadith: {
      narrator: "HR. Al-Bukhari & Muslim",
      arabicText: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ",
      translationId: "Sesungguhnya Allah menyukai jika seseorang di antara kalian mengerjakan suatu amalan secara itqan (rapi dan profesional).",
      pedagogicalMeaning: "Mendorong ketelitian dan efisiensi dalam menyusun kode algoritma.",
    },
    islamicHistory: {
      figureName: "Abu Ja'far Muhammad bin Musa Al-Khwarizmi",
      historicalEra: "Baitul Hikmah, Daulah Abbasiyah (Abad ke-9 M)",
      contribution: "Perintis aljabar dan konsep dasar algoritma komputasi modern.",
      inspirationalValue: "Sains dan matematika adalah ibadah untuk mengabdi kepada umat dan mengenal keagungan Sang Pencipta.",
    },
    coreSpiritualValue: "Itqan, Amanah, Keteraturan Sunnatullah",
  },
  desainPembelajaran: {
    tujuanPembelajaran: {
      audience: "Peserta didik Kelas X Fase E",
      behavior: "menganalisis dan menerapkan strategi algoritmik bubble sort dan insertion sort",
      condition: "melalui simulasi visual kartu interaktif dan diskusi kelompok kolaboratif",
      degree: "dengan tepat minimal 3 tahapan iterasi pertukaran data secara akurat",
      integratedSpiritualGoal: "Menunjukkan sikap itqan dan mengagumi keteraturan ciptaan Allah SWT sebagaimana diisyaratkan dalam QS. Al-Qamar: 49",
      fullStatement: "Peserta didik Kelas X Fase E mampu menganalisis dan menerapkan strategi algoritmik sorting melalui simulasi kartu interaktif dengan tepat minimal 3 iterasi serta menunjukkan sikap itqan dan bersyukur atas keteraturan ciptaan Allah SWT.",
    },
    pedagogicalPractices: {
      modelPembelajaran: "Problem-Based Learning",
      metodePembelajaran: ["Simulasi Interaktif", "Diskusi Kelompok", "Presentasi"],
      diferensiasiKonten: "Kartu angka fisik bertingkat dan animasi visual interaktif.",
      diferensiasiProses: "Scaffolding bertingkat: kelompok bimbingan mendapat lembar alur panduan terstruktur, kelompok mandiri menyelesaikan persoalan optimasi terbuka.",
      diferensiasiProduk: "Laporan analisis alur sorting berupa tabel trace manual atau diagram alir digital.",
    },
    mediaDanLingkungan: {
      mediaFisik: ["Kartu Angka Simulasi", "Papan Pajang Post-it"],
      sumberDigital: ["Platform Pembelajaran Athirah Smart School", "Simulator Algoritma Online"],
      lingkunganBelajar: ["Laboratorium Komputer / Ruang Kelas Meja Kelompok"],
      kemitraan: ["Paguyuban Orang Tua Murid (POMD)", "Yayasan Hadji Kalla"],
    },
  },
  pengalamanBelajar: {
    memahami: [
      {
        stepNumber: 1,
        phase: "MEMAHAMI",
        title: "Orientasi Bermakna & Tadabbur QS. Al-Qamar: 49",
        durationMinutes: 15,
        teacherActivity: "Guru membuka dengan salam, basmalah, dan memantik tadabbur keteraturan alam semesta.",
        studentActivity: "Peserta didik menyimak wacana dan mengidentifikasi definisi algoritma sorting.",
        pmPrinciple: "BERKESADARAN",
        matrixCode: "MH-1",
      },
      {
        stepNumber: 2,
        phase: "MEMAHAMI",
        title: "Eksplorasi Konsep Bubble Sort & Trace Table",
        durationMinutes: 25,
        teacherActivity: "Guru mendemonstrasikan pertukaran pasangan kartu di papan tulis.",
        studentActivity: "Siswa menjelaskan kembali mekanisme perbandingan berpasangan dengan bahasa sendiri.",
        pmPrinciple: "BERMAKNA",
        matrixCode: "MH-2",
      },
    ],
    mengaplikasi: [
      {
        stepNumber: 3,
        phase: "MENGAPLIKASI",
        title: "Simulasi Kolaboratif LKPD Berjenjang 3-Tier",
        durationMinutes: 45,
        teacherActivity: "Guru memfasilitasi kerja kelompok dan memberikan bimbingan sesuai kebutuhan kelompok.",
        studentActivity: "Siswa membagi peran dalam kelompok untuk mempraktikkan simulasi 5 kartu dan mencatat hasil pass.",
        pmPrinciple: "MENGGEMBIRAKAN",
        matrixCode: "MA-2",
        differentiatedTier: "TIER_2_REGULER",
      },
      {
        stepNumber: 4,
        phase: "MENGAPLIKASI",
        title: "Tantangan Optimasi Kasus Terburuk (Worst-Case Analysis)",
        durationMinutes: 25,
        teacherActivity: "Guru menantang kelompok mahir menganalisis array terbalik.",
        studentActivity: "Kelompok mahir memodifikasi algoritma untuk mendeteksi array yang sudah terurut lebih cepat.",
        pmPrinciple: "BERMAKNA",
        matrixCode: "MA-3",
        differentiatedTier: "TIER_3_MANDIRI",
      },
    ],
    merefleksi: [
      {
        stepNumber: 5,
        phase: "MEREFLEKSI",
        title: "Presentasi dan Evaluasi Kritis Hasil Simulasi",
        durationMinutes: 15,
        teacherActivity: "Guru mengarahkan tanya jawab antarkelompok.",
        studentActivity: "Kelompok menyajikan perbandingan efisiensi iterasi pass dan mendiskusikan kriteria rubrik.",
        pmPrinciple: "BERMAKNA",
        matrixCode: "MR-2",
      },
      {
        stepNumber: 6,
        phase: "MEREFLEKSI",
        title: "Muhasabah Nilai Itqan & Komitmen Akhlak",
        durationMinutes: 10,
        teacherActivity: "Guru merangkum hikmah spiritual dan menutup dengan doa.",
        studentActivity: "Siswa menuliskan refleksi diri mengenai sikap ketelitian (itqan) dalam mengerjakan tugas.",
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
      tpDescription: "Menganalisis dan menerapkan mekanisme bubble sort pada deret data",
      indikatorAsesmen: "Menentukan urutan pertukaran pass ke-2 pada algoritma bubble sort deret angka acak",
      jenisAsesmen: "TULIS",
      uraianSoalTertulis: "Diberikan deret angka [8, 3, 5, 1, 9]. Tuliskan susunan array setelah iterasi Pass 1 dan Pass 2 selesai!",
      deskripsiAktivitasNontulis: "-",
      isLkpdAttached: true,
    },
    {
      no: 2,
      materiPokok: "Strategi Algoritma Sorting",
      tpCode: "TP-01",
      tpDescription: "Mendemonstrasikan kerja sama tim dalam peragaan simulasi sorting",
      indikatorAsesmen: "Mendemonstrasikan pertukaran kartu fisik secara teratur dan menjelaskan alur pass dengan tepat",
      jenisAsesmen: "NONTULIS",
      uraianSoalTertulis: "-",
      deskripsiAktivitasNontulis: "Kinerja peragaan kelompok menggunakan 5 kartu angka dengan mencatat waktu dan keakuratan langkah.",
      isLkpdAttached: true,
    },
  ],
};

export const SAMPLE_ATHIRAH_LKPD_STUDENT = {
  id: "lkpd-std-x-inf-01",
  modulAjarId: "modul-athirah-x-inf-01",
  meetingNumber: 1,
  unit: "SMA Islam Athirah 1 Makassar",
  mataPelajaran: "Informatika",
  kelas: "Kelas X",
  materiPokok: "Strategi Algoritmik dan Pemilahan Data (Sorting)",
  alokasiWaktuMinutes: 45,
  openingDuaAndAdab: {
    bismillahText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    ayatStimulusSnippet: "QS. Al-Qamar (54) : 49 — Sungguh, Kami menciptakan segala sesuatu menurut ukuran yang tepat.",
    adabBelajarTips: [
      "Awali pengerjaan dengan niat ikhlas mencari ridha Allah SWT.",
      "Hormati pendapat teman satu kelompok dan dengarkan dengan seksama.",
      "Terapkan sikap itqan (teliti dan jujur) dalam mencatat hasil eksperimen.",
      "Jaga kebersihan dan kerapian meja kerja kelompok.",
    ],
  },
  contextualStimulus: {
    title: "Tantangan Logistik Panen Kakao Sulawesi Selatan",
    narrative: "Sebuah gudang penampungan hasil bumi di Kabupaten Luwu menerima 5 karung biji kakao dengan bobot acak: [48 kg, 32 kg, 65 kg, 20 kg, 55 kg]. Untuk memenuhi standar pengiriman ekspor, karung-karung tersebut harus diurutkan dari yang teringan ke terberat menggunakan strategi pertukaran berpasangan.",
  },
  aktivitasSiswa: {
    faseMemahami: [
      {
        tierLevel: 1,
        targetGroup: "PERLU_BIMBINGAN",
        instructions: "Perhatikan deret 5 angka di atas. Lengkapi tabel perbandingan pasangan pertama pada Pass 1.",
        hintsOrScaffolding: "Bandingkan Karung 1 (48) dan Karung 2 (32). Karena 48 > 32, tukar posisinya!",
        taskPrompt: "Tuliskan hasil susunan karung setelah perbandingan pertama!",
        answerType: "TABLE",
        scoreWeight: 20,
      },
    ],
    faseMengaplikasi: [
      {
        tierLevel: 2,
        targetGroup: "REGULER",
        instructions: "Lakukan simulasi lengkap Pass 1 hingga Pass 4 menggunakan kartu angka yang disediakan di meja.",
        taskPrompt: "Catat susunan array di setiap akhir putaran Pass pada tabel pengamatan kelompok!",
        answerType: "TABLE",
        scoreWeight: 50,
      },
      {
        tierLevel: 3,
        targetGroup: "MAHIR",
        instructions: "Analisis jika deret awal adalah [65, 55, 48, 32, 20]. Berapa jumlah pertukaran maksimum yang dibutuhkan?",
        taskPrompt: "Jelaskan mengapa kasus ini disebut kondisi terburuk (worst case) dan rumuskan rumusnya!",
        answerType: "ESSAY",
        scoreWeight: 30,
      },
    ],
    faseMerefleksi: [
      {
        tierLevel: 2,
        targetGroup: "REGULER",
        instructions: "Tuliskan 1 kesulitan kelompok saat simulasi dan nilai spiritual apa yang kalian pelajari hari ini.",
        taskPrompt: "Lembar refleksi adab dan itqan.",
        answerType: "CHECKLIST",
        scoreWeight: 10,
      },
    ],
  },
};

export const SAMPLE_ATHIRAH_LKPD_TEACHER_KEY = {
  ...SAMPLE_ATHIRAH_LKPD_STUDENT,
  id: "lkpd-guru-x-inf-01",
  guruAnswerKeyGuide: {
    exemplarAnswersByTier: {
      "tier-1": "Perbandingan Karung 1 & 2: [32, 48, 65, 20, 55]. Terjadi 1 kali pertukaran.",
      "tier-2": "Pass 1: [32, 48, 20, 55, 65] (elemen 65 terkunci). Pass 2: [32, 20, 48, 55, 65] (elemen 55 terkunci). Pass 3: [20, 32, 48, 55, 65] (elemen 48 terkunci). Pass 4: Selesai terurut sempurna.",
      "tier-3": "Deret terbalik membutuhkan n*(n-1)/2 = 5*4/2 = 10 kali pertukaran. Disebut worst-case karena setiap elemen berada pada posisi berlawanan dari urutan target.",
    },
    misconceptionAnticipations: [
      {
        misconception: "Siswa mengira jika pass 2 sudah terlihat terurut, algoritma otomatis berhenti.",
        remedy: "Guru menegaskan bahwa komputer membutuhkan bendera (flag isSwapped) untuk mengetahui bahwa tidak ada lagi pertukaran sebelum berhenti dini.",
      },
      {
        misconception: "Siswa membandingkan elemen pertama dengan elemen terakhir sekaligus.",
        remedy: "Guru mendemonstrasikan bahwa bubble sort HANYA membandingkan 2 elemen yang bersebelahan secara runut.",
      },
    ],
    differentiationActionGuide: [
      {
        condition: "Kelompok Tier 1 bingung menentukan elemen mana yang terkunci di akhir pass.",
        action: "Berikan stiker warna merah pada posisi indeks n-k sebagai penanda bahwa elemen tersebut sudah berada di posisi final.",
      },
      {
        condition: "Kelompok Tier 3 selesai dalam 15 menit.",
        action: "Berikan kartu tambahan ke-6 dan minta mereka membandingkan efisiensi Bubble Sort vs Insertion Sort.",
      },
    ],
    rubrikPenilaian4Level: [
      {
        aspek: "Ketepatan Langkah Algoritma (Kognitif)",
        skor1_perluBimbingan: "Hanya mampu menyelesaikan Pass 1 dengan bantuan penuh guru.",
        skor2_cukup: "Menyelesaikan Pass 1 dan 2 dengan maksimal 1 kesalahan pertukaran.",
        skor3_baik: "Menyelesaikan seluruh pass 1-4 secara tepat dan mandiri.",
        skor4_mahir: "Menyelesaikan seluruh pass secara tepat serta mampu menjelaskan worst-case analysis secara logis.",
        bobotNilai: 60,
      },
      {
        aspek: "Kolaborasi & Kinerja Simulasi (Psikomotorik)",
        skor1_perluBimbingan: "Pasif dalam kelompok, peragaan kartu tidak teratur.",
        skor2_cukup: "Aktif membantu namun terkadang mendahului instruksi tanpa koordinasi tim.",
        skor3_baik: "Berbagi tugas secara teratur dan memperagakan simulasi dengan rapi.",
        skor4_mahir: "Memimpin peragaan kelompok secara dinamis, inklusif, dan tertib.",
        bobotNilai: 20,
      },
      {
        aspek: "Adab Islami & Sikap Itqan (Afektif)",
        skor1_perluBimbingan: "Menunjukkan sikap tergesa-gesa dan kurang teliti mencatat data.",
        skor2_cukup: "Cukup teliti tetapi membutuhkan pengingat guru untuk menjaga adab santun.",
        skor3_baik: "Menunjukkan ketelitian (itqan), sopan kepada sesama rekan, dan menghargai masukan.",
        skor4_mahir: "Sangat itqan, menjaga adab islami selama pembelajaran, dan menginspirasi rekan.",
        bobotNilai: 20,
      },
    ],
    mappedGradebookTpId: "TP-01",
  },
};
