import type { ModulAjarAthirah, LkpdAthirah } from "../../types/index.ts";
import {
  PLA_DIMENSIONS_CONFIG,
  RENSTRA_PROGRAMS_CONFIG,
  PM_PRINCIPLES_CONFIG,
  MATRIKS_PENGUATAN_INFO,
} from "./athirahConstants";

function downloadFile(content: string, filename: string, mimeType: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports official Athirah Modul Ajar to MS Word (.docx) format
 */
export function exportModulAjarToDocx(modul: ModulAjarAthirah) {
  const plaLabels = modul.identifikasi.profilLulusanAthirah
    .map((k) => PLA_DIMENSIONS_CONFIG[k]?.label || k)
    .join("; ");

  const renstraLabels = modul.identifikasi.programKhasRenstra
    .map((k) => RENSTRA_PROGRAMS_CONFIG[k]?.label || k)
    .join("; ");

  const allActivities = [
    ...modul.pengalamanBelajar.memahami,
    ...modul.pengalamanBelajar.mengaplikasi,
    ...modul.pengalamanBelajar.merefleksi,
  ];

  const html = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Modul Ajar - ${modul.identitas.unit}</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; color: #111; margin: 20mm; }
    h1, h2, h3, h4 { font-family: Arial, sans-serif; }
    .header-kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 16px; }
    .kop-yayasan { font-size: 12pt; font-weight: bold; letter-spacing: 1px; color: #333; }
    .kop-sekolah { font-size: 16pt; font-weight: bold; color: #1e3a8a; }
    .kop-unit { font-size: 12pt; font-weight: bold; color: #047857; }
    .kop-address { font-size: 9pt; color: #555; }
    .doc-title { text-align: center; font-size: 14pt; font-weight: bold; margin: 16px 0; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10pt; }
    th, td { border: 1px solid #777; padding: 6px 8px; vertical-align: top; }
    th { background-color: #f1f5f9; font-weight: bold; }
    .section-title { font-size: 12pt; font-weight: bold; color: #1e293b; background-color: #e2e8f0; padding: 4px 8px; margin-top: 14px; margin-bottom: 6px; }
    .arabic { font-family: 'Traditional Arabic', 'Scheherazade New', 'Amiri', serif; font-size: 16pt; direction: rtl; text-align: right; line-height: 1.8; color: #064e3b; }
    .badge { display: inline-block; padding: 2px 6px; font-size: 8pt; font-weight: bold; border-radius: 4px; margin-right: 4px; }
    .badge-blue { background-color: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
    .badge-green { background-color: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
    .badge-orange { background-color: #ffedd5; color: #9a3412; border: 1px solid #fdba74; }
  </style>
</head>
<body>
  <div class="header-kop">
    <div class="kop-yayasan">YAYASAN HADJI KALLA</div>
    <div class="kop-sekolah">SEKOLAH ISLAM ATHIRAH</div>
    <div class="kop-unit">${modul.identitas.unit.toUpperCase()}</div>
    <div class="kop-address">Kampus Kajaolalido / Bukit Baruga / Bone • Akreditasi A • Kurikulum Merdeka Terintegrasi Islam</div>
  </div>

  <div class="doc-title">MODUL AJAR KURIKULUM SEKOLAH ISLAM ATHIRAH</div>

  <!-- BAGIAN 1: IDENTITAS -->
  <div class="section-title">I. IDENTITAS MODUL</div>
  <table>
    <tr><td width="30%"><strong>Satuan Pendidikan (Unit)</strong></td><td>${modul.identitas.unit}</td></tr>
    <tr><td><strong>Mata Pelajaran</strong></td><td>${modul.identitas.mataPelajaran}</td></tr>
    <tr><td><strong>Fase / Kelas / Semester</strong></td><td>Fase ${modul.identitas.fase} / ${modul.identitas.kelas} / Semester ${modul.identitas.semester === 1 ? "Ganjil" : "Genap"} (${modul.identitas.tahunAjaran})</td></tr>
    <tr><td><strong>Materi Pokok</strong></td><td>${modul.identitas.materiPokok}</td></tr>
    <tr><td><strong>Alokasi Waktu</strong></td><td>Pertemuan ke-${modul.identitas.pertemuanKe} • ${modul.identitas.alokasiWaktuDisplay}</td></tr>
    <tr><td><strong>Guru Penyusun</strong></td><td>${modul.identitas.namaPenyusun}</td></tr>
  </table>

  <!-- BAGIAN 2: IDENTIFIKASI -->
  <div class="section-title">II. IDENTIFIKASI (PROFIL LULUSAN & RENSTRA)</div>
  <table>
    <tr><td width="30%"><strong>Dimensi Profil Lulusan Athirah (PLA)</strong></td><td>${plaLabels}</td></tr>
    <tr><td><strong>Program Khas Renstra</strong></td><td>${renstraLabels}</td></tr>
    <tr><td><strong>Kosmologi Kurikulum Athirah</strong></td><td>${modul.identifikasi.kosmologiKurikulumNote}</td></tr>
  </table>

  <!-- BAGIAN 3: SPIRITUALISASI -->
  <div class="section-title">III. SPIRITUALISASI (INTEGRASI NILAI ISLAM)</div>
  <table>
    <tr>
      <td width="30%"><strong>Ayat Al-Quran</strong></td>
      <td>
        <strong>QS. ${modul.spiritualisasi.quranVerse.surahName} (${modul.spiritualisasi.quranVerse.surahNumber}) : ${modul.spiritualisasi.quranVerse.ayahNumber}</strong><br/>
        <div class="arabic">${modul.spiritualisasi.quranVerse.arabicText}</div>
        <em>"${modul.spiritualisasi.quranVerse.translationId}"</em><br/><br/>
        <strong>Tafsir & Kontekstualisasi:</strong> ${modul.spiritualisasi.quranVerse.contextualTafsir}
      </td>
    </tr>
    ${modul.spiritualisasi.hadith ? `
    <tr>
      <td><strong>Hadits Shahih</strong></td>
      <td>
        <strong>${modul.spiritualisasi.hadith.narrator}</strong><br/>
        <div class="arabic">${modul.spiritualisasi.hadith.arabicText}</div>
        <em>"${modul.spiritualisasi.hadith.translationId}"</em><br/><br/>
        <strong>Hikmah Karakter:</strong> ${modul.spiritualisasi.hadith.pedagogicalMeaning}
      </td>
    </tr>` : ""}
    ${modul.spiritualisasi.islamicHistory ? `
    <tr>
      <td><strong>Keteladanan Tokoh Islam</strong></td>
      <td>
        <strong>${modul.spiritualisasi.islamicHistory.figureName}</strong> (${modul.spiritualisasi.islamicHistory.historicalEra})<br/>
        <strong>Kontribusi:</strong> ${modul.spiritualisasi.islamicHistory.contribution}<br/>
        <strong>Nilai Inspiratif:</strong> ${modul.spiritualisasi.islamicHistory.inspirationalValue}
      </td>
    </tr>` : ""}
    ${modul.spiritualisasi.classicalTextOrFatwa ? `
    <tr>
      <td><strong>Rujukan Turats / Fatwa</strong></td>
      <td>
        <strong>${modul.spiritualisasi.classicalTextOrFatwa.title}</strong> (${modul.spiritualisasi.classicalTextOrFatwa.authorOrIssuer})<br/>
        ${modul.spiritualisasi.classicalTextOrFatwa.ethicalGuideline}
      </td>
    </tr>` : ""}
    <tr><td><strong>Nilai Inti Spiritual</strong></td><td><strong>${modul.spiritualisasi.coreSpiritualValue}</strong></td></tr>
  </table>

  <!-- BAGIAN 4: DESAIN PEMBELAJARAN -->
  <div class="section-title">IV. DESAIN PEMBELAJARAN</div>
  <table>
    <tr>
      <td width="30%"><strong>Tujuan Pembelajaran (ABCD)</strong></td>
      <td>
        <ul>
          <li><strong>Audience:</strong> ${modul.desainPembelajaran.tujuanPembelajaran.audience}</li>
          <li><strong>Behavior:</strong> ${modul.desainPembelajaran.tujuanPembelajaran.behavior}</li>
          <li><strong>Condition:</strong> ${modul.desainPembelajaran.tujuanPembelajaran.condition}</li>
          <li><strong>Degree:</strong> ${modul.desainPembelajaran.tujuanPembelajaran.degree}</li>
        </ul>
        <p><strong>TP Terintegrasi Spiritual:</strong> ${modul.desainPembelajaran.tujuanPembelajaran.integratedSpiritualGoal}</p>
        <p><strong>Rumusan Lengkap TP:</strong> <em>${modul.desainPembelajaran.tujuanPembelajaran.fullStatement}</em></p>
      </td>
    </tr>
    <tr>
      <td><strong>Praktik Pedagogis</strong></td>
      <td>
        <strong>Model:</strong> ${modul.desainPembelajaran.pedagogicalPractices.modelPembelajaran}<br/>
        <strong>Metode:</strong> ${modul.desainPembelajaran.pedagogicalPractices.metodePembelajaran.join(", ")}<br/>
        <strong>Diferensiasi Konten:</strong> ${modul.desainPembelajaran.pedagogicalPractices.diferensiasiKonten}<br/>
        <strong>Diferensiasi Proses:</strong> ${modul.desainPembelajaran.pedagogicalPractices.diferensiasiProses}<br/>
        <strong>Diferensiasi Produk:</strong> ${modul.desainPembelajaran.pedagogicalPractices.diferensiasiProduk}
      </td>
    </tr>
    <tr>
      <td><strong>Media & Lingkungan Belajar</strong></td>
      <td>
        <strong>Media Fisik:</strong> ${modul.desainPembelajaran.mediaDanLingkungan.mediaFisik.join(", ")}<br/>
        <strong>Sumber Digital:</strong> ${modul.desainPembelajaran.mediaDanLingkungan.sumberDigital.join(", ")}<br/>
        <strong>Lingkungan Belajar:</strong> ${modul.desainPembelajaran.mediaDanLingkungan.lingkunganBelajar.join(", ")}<br/>
        <strong>Kemitraan:</strong> ${modul.desainPembelajaran.mediaDanLingkungan.kemitraan.join(", ")}
      </td>
    </tr>
  </table>

  <!-- BAGIAN 5: PENGALAMAN BELAJAR -->
  <div class="section-title">V. PENGALAMAN BELAJAR (ALUR 3M & MATRIKS PENGUATAN AKTIVITAS)</div>
  <table>
    <thead>
      <tr>
        <th width="5%">No</th>
        <th width="12%">Fase 3M</th>
        <th width="28%">Aktivitas Guru</th>
        <th width="28%">Aktivitas Siswa</th>
        <th width="8%">Waktu</th>
        <th width="10%">Prinsip PM</th>
        <th width="9%">Kode Matriks</th>
      </tr>
    </thead>
    <tbody>
      ${allActivities
        .map((act) => {
          const pm = PM_PRINCIPLES_CONFIG[act.pmPrinciple];
          const mat = MATRIKS_PENGUATAN_INFO[act.matrixCode];
          return `
        <tr>
          <td align="center">${act.stepNumber}</td>
          <td><strong>${act.phase}</strong><br/><small>${act.title}</small></td>
          <td>${act.teacherActivity}</td>
          <td>${act.studentActivity}</td>
          <td align="center">${act.durationMinutes} mnt</td>
          <td align="center"><strong>[${pm?.label || act.pmPrinciple}]</strong><br/><small>${pm?.colorCode}</small></td>
          <td align="center"><strong>${act.matrixCode}</strong><br/><small>${mat?.bloom || ""}</small></td>
        </tr>`;
        })
        .join("")}
    </tbody>
  </table>

  <!-- BAGIAN 6: LAMPIRAN ASESMEN -->
  <div class="section-title">VI. LAMPIRAN ASESMEN PEMBELAJARAN (TABEL 8 KOLOM)</div>
  <table>
    <thead>
      <tr>
        <th width="4%">No</th>
        <th width="14%">Materi Pokok</th>
        <th width="10%">TP (Kode)</th>
        <th width="18%">Indikator Asesmen</th>
        <th width="8%">Jenis Asesmen</th>
        <th width="20%">Uraian Soal Tertulis</th>
        <th width="20%">Deskripsi Aktivitas Nontulis</th>
        <th width="6%">LKPD</th>
      </tr>
    </thead>
    <tbody>
      ${modul.lampiranAsesmen
        .map(
          (item) => `
        <tr>
          <td align="center">${item.no}</td>
          <td>${item.materiPokok}</td>
          <td><strong>${item.tpCode}</strong><br/><small>${item.tpDescription}</small></td>
          <td>${item.indikatorAsesmen}</td>
          <td align="center"><strong>${item.jenisAsesmen}</strong></td>
          <td>${item.uraianSoalTertulis || "-"}</td>
          <td>${item.deskripsiAktivitasNontulis || "-"}</td>
          <td align="center"><strong>${item.isLkpdAttached ? "✓ (Ada)" : "✗"}</strong></td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>

  <br/><br/>
  <table style="border:none;">
    <tr style="border:none;">
      <td style="border:none; width: 60%;"></td>
      <td style="border:none; text-align: center;">
        ${modul.identitas.unit.includes("Makassar") ? "Makassar" : "Bone"}, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br/>
        Guru Mata Pelajaran,<br/><br/><br/><br/>
        <strong><u>${modul.identitas.namaPenyusun}</u></strong><br/>
        NIP/NIY. Guru Sekolah Islam Athirah
      </td>
    </tr>
  </table>
</body>
</html>`;

  const filename = `Modul_Ajar_${modul.identitas.mataPelajaran}_Pertemuan_${modul.identitas.pertemuanKe}_${modul.identitas.unit.replace(/[^a-zA-Z0-9]/g, "_")}.doc`;
  downloadFile(html, filename, "application/msword");
}

/**
 * Exports official Athirah LKPD (Student version or Teacher Key) to MS Word format
 */
export function exportLkpdToDocx(lkpd: LkpdAthirah, version: "siswa" | "guru") {
  const isTeacher = version === "guru";
  const guide = lkpd.guruAnswerKeyGuide;

  const html = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>LKPD ${isTeacher ? "Pegangan Guru" : "Siswa"} - ${lkpd.unit}</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; color: #111; margin: 20mm; }
    h1, h2, h3, h4 { font-family: Arial, sans-serif; }
    .header-kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 16px; }
    .kop-yayasan { font-size: 12pt; font-weight: bold; letter-spacing: 1px; color: #333; }
    .kop-sekolah { font-size: 16pt; font-weight: bold; color: #1e3a8a; }
    .kop-unit { font-size: 12pt; font-weight: bold; color: #047857; }
    .doc-title { text-align: center; font-size: 14pt; font-weight: bold; margin: 12px 0; text-transform: uppercase; color: ${isTeacher ? "#6b21a8" : "#0f172a"}; }
    .sub-title { text-align: center; font-size: 11pt; margin-bottom: 14px; color: #475569; }
    .box-info { border: 1px solid #94a3b8; background-color: #f8fafc; padding: 10px; margin-bottom: 14px; font-size: 10pt; }
    .arabic { font-family: 'Traditional Arabic', 'Scheherazade New', 'Amiri', serif; font-size: 16pt; direction: rtl; text-align: right; line-height: 1.8; color: #064e3b; }
    .section-title { font-size: 11pt; font-weight: bold; color: #0f172a; border-left: 4px solid ${isTeacher ? "#9333ea" : "#2563eb"}; padding-left: 8px; margin-top: 14px; margin-bottom: 6px; }
    .answer-box { border: 1px dashed #94a3b8; min-height: 80px; padding: 10px; margin-top: 6px; background-color: #fafafa; font-style: italic; color: #64748b; }
    .exemplar-box { border: 1px solid #d8b4fe; background-color: #faf5ff; padding: 10px; margin-top: 6px; font-family: monospace; font-size: 9.5pt; color: #581c87; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9.5pt; }
    th, td { border: 1px solid #777; padding: 6px 8px; vertical-align: top; }
    th { background-color: #f1f5f9; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header-kop">
    <div class="kop-yayasan">YAYASAN HADJI KALLA</div>
    <div class="kop-sekolah">SEKOLAH ISLAM ATHIRAH</div>
    <div class="kop-unit">${lkpd.unit.toUpperCase()}</div>
  </div>

  <div class="doc-title">LEMBAR KERJA PESERTA DIDIK (LKPD)</div>
  <div class="sub-title">
    ${isTeacher ? "<strong>[VERSI GURU: KUNCI JAWABAN & RUBRIK PENILAIAN ANALITIK]</strong><br/>" : "<strong>[VERSI SISWA / KELOMPOK]</strong><br/>"}
    Mata Pelajaran: ${lkpd.mataPelajaran} • ${lkpd.kelas} • Pertemuan ke-${lkpd.meetingNumber} • Alokasi Waktu: ${lkpd.alokasiWaktuMinutes} Menit
  </div>

  <div class="box-info">
    <table style="border:none; margin:0;">
      <tr style="border:none;"><td style="border:none; width:50%;"><strong>Nama Kelompok:</strong> .................................................</td><td style="border:none;"><strong>Hari / Tanggal:</strong> ....................................</td></tr>
      <tr style="border:none;"><td style="border:none;"><strong>Nama Anggota:</strong><br/>1. ............................................................<br/>2. ............................................................<br/>3. ............................................................</td><td style="border:none;"><strong>Kelas:</strong> ${lkpd.kelas}<br/><strong>Materi Pokok:</strong> ${lkpd.materiPokok}</td></tr>
    </table>
  </div>

  <!-- KALAM PEMBUKA & ADAB BELAJAR -->
  <div class="section-title">A. KALAM PEMBUKA & ADAB MENUNTUT ILMU</div>
  <div style="text-align:center; margin: 10px 0;">
    <div class="arabic">${lkpd.openingDuaAndAdab.bismillahText}</div>
    <div style="font-size: 10pt; color: #047857; margin-top: 4px;"><em>"${lkpd.openingDuaAndAdab.ayatStimulusSnippet}"</em></div>
  </div>
  <div style="font-size: 10pt; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px; border-radius: 4px;">
    <strong>Adab Belajar Islami Ananda:</strong>
    <ol style="margin: 4px 0 0 16px; padding: 0;">
      ${lkpd.openingDuaAndAdab.adabBelajarTips.map((tip) => `<li>${tip}</li>`).join("")}
    </ol>
  </div>

  <!-- WACANA STIMULUS KONTEKSTUAL -->
  <div class="section-title">B. WACANA STIMULUS KONTEKSTUAL</div>
  <div style="font-size: 10pt; line-height: 1.5; padding: 8px; border: 1px solid #e2e8f0; background-color: #f8fafc;">
    <strong>${lkpd.contextualStimulus.title}</strong>
    <p style="margin-top: 4px;">${lkpd.contextualStimulus.narrative}</p>
  </div>

  <!-- AKTIVITAS 3M BERJENJANG -->
  <div class="section-title">C. AKTIVITAS PENYELIDIKAN BERJENJANG (ALUR 3M)</div>

  <!-- FASE 1: MEMAHAMI -->
  <h4>1. Fase Memahami (Tier 1: Bimbingan & Konsep Dasar)</h4>
  ${lkpd.aktivitasSiswa.faseMemahami
    .map(
      (act, idx) => `
    <div style="margin-bottom: 12px;">
      <p><strong>Aktivitas 1.${idx + 1}:</strong> ${act.instructions}</p>
      <div style="background-color: #eff6ff; padding: 6px; border-left: 3px solid #3b82f6; font-size: 10pt;">
        <strong>Tantangan Tugas (Bobot ${act.scoreWeight}%):</strong><br/>
        <pre style="font-family: inherit; white-space: pre-wrap; margin: 4px 0;">${act.taskPrompt}</pre>
      </div>
      ${
        isTeacher && guide?.exemplarAnswersByTier["tier-1"]
          ? `<div class="exemplar-box"><strong>[KUNCI JAWABAN MODEL GURU - TIER 1]:</strong><br/>${guide.exemplarAnswersByTier["tier-1"]}</div>`
          : `<div class="answer-box">[Ruang Jawaban Peserta Didik]</div>`
      }
    </div>`
    )
    .join("")}

  <!-- FASE 2: MENGAPLIKASI -->
  <h4>2. Fase Mengaplikasi (Tier 2: Eksperimen & Analisis Solusi Mandiri)</h4>
  ${lkpd.aktivitasSiswa.faseMengaplikasi
    .map(
      (act, idx) => `
    <div style="margin-bottom: 12px;">
      <p><strong>Aktivitas 2.${idx + 1}:</strong> ${act.instructions}</p>
      ${act.hintsOrScaffolding ? `<p style="font-size: 9.5pt; color: #475569;"><em>Petunjuk Bimbingan: ${act.hintsOrScaffolding}</em></p>` : ""}
      <div style="background-color: #f0fdf4; padding: 6px; border-left: 3px solid #10b981; font-size: 10pt;">
        <strong>Tantangan Tugas (Bobot ${act.scoreWeight}%):</strong><br/>
        <pre style="font-family: inherit; white-space: pre-wrap; margin: 4px 0;">${act.taskPrompt}</pre>
      </div>
      ${
        isTeacher && guide?.exemplarAnswersByTier["tier-2"]
          ? `<div class="exemplar-box"><strong>[KUNCI JAWABAN MODEL GURU - TIER 2]:</strong><br/>${guide.exemplarAnswersByTier["tier-2"]}</div>`
          : `<div class="answer-box">[Ruang Tabel Analisis & Langkah Kerja Kelompok]</div>`
      }
    </div>`
    )
    .join("")}

  <!-- FASE 3: MEREFLEKSI -->
  <h4>3. Fase Merefleksi (Tier 3: Kesimpulan, Optimasi & Adab Itqan)</h4>
  ${lkpd.aktivitasSiswa.faseMerefleksi
    .map(
      (act, idx) => `
    <div style="margin-bottom: 12px;">
      <p><strong>Aktivitas 3.${idx + 1}:</strong> ${act.instructions}</p>
      <div style="background-color: #fffbeb; padding: 6px; border-left: 3px solid #f59e0b; font-size: 10pt;">
        <strong>Refleksi & Sintesis (Bobot ${act.scoreWeight}%):</strong><br/>
        <pre style="font-family: inherit; white-space: pre-wrap; margin: 4px 0;">${act.taskPrompt}</pre>
      </div>
      ${
        isTeacher && guide?.exemplarAnswersByTier["tier-3"]
          ? `<div class="exemplar-box"><strong>[KUNCI JAWABAN MODEL GURU - TIER 3]:</strong><br/>${guide.exemplarAnswersByTier["tier-3"]}</div>`
          : `<div class="answer-box">[Ruang Refleksi Diri & Komitmen Amaliyah]</div>`
      }
    </div>`
    )
    .join("")}

  ${
    isTeacher && guide
      ? `
  <!-- PANDUAN INTERNAL GURU -->
  <div class="section-title">D. PANDUAN DIFERENSIASI & ANTISIPASI MISKONSEPSI SISWA</div>
  <table>
    <thead>
      <tr><th width="50%">Potensi Miskonsepsi Siswa</th><th width="50%">Langkah Intervensi / Solusi Guru</th></tr>
    </thead>
    <tbody>
      ${guide.misconceptionAnticipations
        .map(
          (m) => `
        <tr>
          <td><strong style="color:#b91c1c;">Miskonsepsi:</strong> ${m.misconception}</td>
          <td><strong style="color:#15803d;">Solusi Guru:</strong> ${m.remedy}</td>
        </tr>`
        )
        .join("")}
      ${guide.differentiationActionGuide
        .map(
          (d) => `
        <tr>
          <td><strong style="color:#1d4ed8;">Kondisi:</strong> ${d.condition}</td>
          <td><strong style="color:#7c3aed;">Tindakan Diferensiasi:</strong> ${d.action}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>

  <!-- RUBRIK PENILAIAN ANALITIK (TOTAL BOBOT = 100) -->
  <div class="section-title">E. RUBRIK PENILAIAN ANALITIK 4 TINGKAT (TOTAL SKOR = 100 POIN)</div>
  <table>
    <thead>
      <tr>
        <th width="20%">Aspek Penilaian</th>
        <th width="18%">Skor 1 (Perlu Bimbingan)</th>
        <th width="18%">Skor 2 (Cukup)</th>
        <th width="18%">Skor 3 (Baik)</th>
        <th width="18%">Skor 4 (Mahir)</th>
        <th width="8%">Bobot</th>
      </tr>
    </thead>
    <tbody>
      ${guide.rubrikPenilaian4Level
        .map(
          (rub) => `
        <tr>
          <td><strong>${rub.aspek}</strong></td>
          <td>${rub.skor1_perluBimbingan}</td>
          <td>${rub.skor2_cukup}</td>
          <td>${rub.skor3_baik}</td>
          <td>${rub.skor4_mahir}</td>
          <td align="center"><strong>${rub.bobotNilai} Poin</strong></td>
        </tr>`
        )
        .join("")}
      <tr style="background-color: #f1f5f9;">
        <td colspan="5" align="right"><strong>TOTAL BOBOT SKOR MAKSIMAL:</strong></td>
        <td align="center"><strong>${guide.rubrikPenilaian4Level.reduce((s, r) => s + r.bobotNilai, 0)} Poin</strong></td>
      </tr>
    </tbody>
  </table>
  <p style="font-size:9.5pt; color: #475569;"><em>*Nilai akhir dikonversi ke skala 0-100 dan dicatat pada Buku Nilai untuk Capaian ${guide.mappedGradebookTpId}.</em></p>
  `
      : `
  <div class="section-title">D. LEMBAR PENILAIAN DIRI & ADAB BERKELOMPOK</div>
  <table>
    <thead>
      <tr><th width="5%">No</th><th>Pernyataan Sikap & Pembiasaan Islami</th><th width="15%">Ya</th><th width="15%">Tidak</th></tr>
    </thead>
    <tbody>
      <tr><td align="center">1</td><td>Saya mengawali pengerjaan LKPD dengan membaca Basmalah dan doa.</td><td></td><td></td></tr>
      <tr><td align="center">2</td><td>Saya mendengarkan pendapat rekan dan tidak memotong pembicaraan.</td><td></td><td></td></tr>
      <tr><td align="center">3</td><td>Saya mencatat data simulasi dengan jujur, teliti, dan itqan.</td><td></td><td></td></tr>
      <tr><td align="center">4</td><td>Saya ikut membersihkan dan merapikan media kartu sebelum selesai.</td><td></td><td></td></tr>
    </tbody>
  </table>
  `
  }
</body>
</html>`;

  const filename = `LKPD_${isTeacher ? "Guru_Kunci" : "Siswa"}_${lkpd.mataPelajaran}_Pertemuan_${lkpd.meetingNumber}_${lkpd.unit.replace(/[^a-zA-Z0-9]/g, "_")}.doc`;
  downloadFile(html, filename, "application/msword");
}
