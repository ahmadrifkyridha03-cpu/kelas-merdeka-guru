"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Download, 
  Calendar, 
  Layers, 
  Target, 
  ListOrdered, 
  Scale, 
  FileText,
  Clock,
  Printer,
  Copy,
  Lock,
  ArrowRight
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { mockTPs } from "@/lib/mockData";
import { generateTPFromCPAction } from "@/app/actions/geminiActions";
import type { TP, KurikulumFase } from "@/types";

const wizardSteps = [
  { id: 1, name: "Minggu Efektif", icon: Calendar, description: "Hitung JP riil semester" },
  { id: 2, name: "Capaian Pembelajaran (CP)", icon: Layers, description: "Pustaka resmi BSKAP 2024" },
  { id: 3, name: "Tujuan Pembelajaran (TP)", icon: Target, description: "Diturunkan via Taksonomi Bloom" },
  { id: 4, name: "Alur Tujuan (ATP)", icon: ListOrdered, description: "Urutan & alokasi JP per TP" },
  { id: 5, name: "Kriteria KKTP", icon: Scale, description: "Rubrik & ambang tuntas" },
  { id: 6, name: "PROTA & PROSEM", icon: FileSpreadsheet, description: "Matriks distribusi mingguan" },
];

const bloomTaxonomy = {
  C1: { code: "C1", label: "Mengingat", color: "bg-sky-50 text-sky-700 border-sky-200" },
  C2: { code: "C2", label: "Memahami", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  C3: { code: "C3", label: "Menerapkan", color: "bg-amber-50 text-amber-700 border-amber-200" },
  C4: { code: "C4", label: "Menganalisis", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  C5: { code: "C5", label: "Mengevaluasi", color: "bg-rose-50 text-rose-700 border-rose-200" },
  C6: { code: "C6", label: "Mencipta", color: "bg-purple-50 text-purple-700 border-purple-200" },
};

// Official BSKAP 032/H/KR/2024 CP Library
const cpElementsLibrary = [
  {
    code: "BK",
    name: "Berpikir Komputasional",
    desc: "Pada akhir fase E, peserta didik mampu memahami strategi algoritmik standar untuk menyelesaikan persoalan pemilahan dan pencarian; serta menerapkan dekomposisi, pengenalan pola, abstraksi, dan berpikir algoritmik pada persoalan kehidupan sehari-hari maupun pemrograman.",
  },
  {
    code: "DSI",
    name: "Dampak Sosial Informatika",
    desc: "Pada akhir fase E, peserta didik mampu memahami sejarah perkembangan komputer dan tokoh-tokohnya, memahami aspek hukum dan etika dalam pemanfaatan teknologi informasi dan komunikasi, serta mengkaji dampak sosial dari informatika pada masyarakat modern.",
  },
  {
    code: "AD",
    name: "Analisis Data",
    desc: "Pada akhir fase E, peserta didik mampu memahami aspek privasi dan keamanan data, mengumpulkan data secara otomatis dari berbagai sumber, memodelkan data, serta melakukan analisis data dan visualisasi data untuk pengambilan keputusan berbasis data.",
  },
  {
    code: "AP",
    name: "Algoritma dan Pemrograman",
    desc: "Pada akhir fase E, peserta didik mampu menerapkan praktik baik konsep pemrograman prosedural dalam salah satu bahasa pemrograman tekstual, mengembangkan program yang terstruktur, serta melakukan debugging dan pengujian program secara efisien.",
  },
  {
    code: "SK",
    name: "Sistem Komputer",
    desc: "Pada akhir fase E, peserta didik mampu menjelaskan cara kerja perangkat keras dan perangkat lunak komputer serta sistem operasi dalam mengelola pemrosesan data, manajemen memori, dan interaksi pengguna.",
  },
  {
    code: "JKI",
    name: "Jaringan Komputer dan Internet",
    desc: "Pada akhir fase E, peserta didik mampu memahami topologi jaringan, mekanisme pengalamatan IP, protokol internet, routing, serta aspek keamanan jaringan lokal maupun internet dalam komunikasi data publik dan privat.",
  },
];

const sixMonthCalendar = [
  { month: "Juli 2026", totalWeeks: 4, nonEffectiveWeeks: 2, effectiveWeeks: 2, jp: 6, notes: "MPLS & Libur Awal Semester Ganjil" },
  { month: "Agustus 2026", totalWeeks: 4, nonEffectiveWeeks: 1, effectiveWeeks: 3, jp: 9, notes: "KBM Efektif & Upacara HUT RI ke-81" },
  { month: "September 2026", totalWeeks: 4, nonEffectiveWeeks: 1, effectiveWeeks: 3, jp: 9, notes: "Sumatif Tengah Semester (STS) & Jeda" },
  { month: "Oktober 2026", totalWeeks: 5, nonEffectiveWeeks: 1, effectiveWeeks: 4, jp: 12, notes: "KBM Efektif & Jeda Tengah Semester" },
  { month: "November 2026", totalWeeks: 4, nonEffectiveWeeks: 0, effectiveWeeks: 4, jp: 12, notes: "KBM Efektif Penuh" },
  { month: "Desember 2026", totalWeeks: 4, nonEffectiveWeeks: 2, effectiveWeeks: 2, jp: 6, notes: "Sumatif Akhir Semester (SAS), Rapor & Libur" },
];

export default function CurriculumPage() {
  const { tps: storeTps, saveTPs, selectedClassId } = useAppStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [tps, setTps] = useState<TP[]>([]);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Analisis Minggu Efektif state
  const [effectiveWeeks, setEffectiveWeeks] = useState(18);
  const [teachingHoursPerWeek, setTeachingHoursPerWeek] = useState(3);
  const totalEffectiveHours = effectiveWeeks * teachingHoursPerWeek;

  // Step 2: CP State
  const [selectedFase, setSelectedFase] = useState<KurikulumFase>("E");
  const [selectedElementCode, setSelectedElementCode] = useState<string>("BK");
  const [customCpText, setCustomCpText] = useState<string>(cpElementsLibrary[0].desc);

  useEffect(() => {
    if (storeTps && storeTps.length > 0) {
      setTps(storeTps);
    } else {
      setTps(mockTPs);
    }
  }, [storeTps]);

  const handleSelectElement = (code: string) => {
    setSelectedElementCode(code);
    const found = cpElementsLibrary.find(e => e.code === code);
    if (found) {
      setCustomCpText(found.desc);
    }
  };

  const handleLockAndSyncTPs = () => {
    // Commit TPs to Zustand Store
    saveTPs(tps);
    setSyncSuccessToast(true);
    setTimeout(() => setSyncSuccessToast(false), 4000);
  };

  const handleSimulateAIGeneration = async () => {
    setIsGeneratingAI(true);
    setErrorMessage(null);

    const res = await generateTPFromCPAction({
      subject: "Informatika",
      fase: selectedFase,
      cpText: customCpText
    });

    setIsGeneratingAI(false);

    if (res.success && res.data && res.data.length > 0) {
      const activeElem = cpElementsLibrary.find(e => e.code === selectedElementCode);
      const elemName = activeElem ? `${activeElem.name} (${activeElem.code})` : "Berpikir Komputasional (BK)";

      const mapped: TP[] = res.data.map((item, idx) => ({
        id: `tp-live-${Date.now()}-${idx}`,
        classId: selectedClassId || "cls-1",
        cpElement: elemName,
        code: item.code || `TP-0${idx + 1}`,
        description: item.description,
        bloomLevel: (item.bloomLevel as any) || "C3",
        scope: item.scope || "Materi Pokok",
        allocatedHours: item.allocatedHours || 6,
        kktpModel: (item.kktpModel as any) || "INTERVAL_NILAI",
        kktpThreshold: item.kktpThreshold || 75
      }));
      setTps(mapped);
      setGenerationSuccess(true);
      setTimeout(() => setGenerationSuccess(false), 5000);
    } else {
      setErrorMessage(res.error || "Gagal menghubungi Gemini AI. Pastikan GEMINI_API_KEY sudah diisi di .env.local.");
    }
  };

  // Export to Word document (.doc formatted HTML)
  const handleExportWord = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Perangkat Kurikulum Merdeka</title>
        <style>
          body { font-family: 'Calibri', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #111; }
          h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 4px; }
          h2 { font-size: 13pt; font-weight: bold; margin-top: 18px; border-bottom: 1.5pt solid #333; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 16px; font-size: 10pt; }
          th, td { border: 1pt solid #444; padding: 6px 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <h1>PERANGKAT PEMBELAJARAN KURIKULUM MERDEKA</h1>
        <p class="center">Mata Pelajaran: Informatika | Fase: ${selectedFase} | Semester Ganjil 2026/2027</p>
        
        <h2>1. ANALISIS MINGGU EFEKTIF</h2>
        <p>Total Minggu Efektif: ${effectiveWeeks} Minggu | Jam Pelajaran (JP) per Minggu: ${teachingHoursPerWeek} JP | Total: ${totalEffectiveHours} JP</p>
        <table>
          <tr><th>Bulan</th><th>Jumlah Minggu</th><th>Tidak Efektif</th><th>Minggu Efektif</th><th>Alokasi JP</th><th>Keterangan</th></tr>
          ${sixMonthCalendar.map(c => `<tr><td>${c.month}</td><td class="center">${c.totalWeeks}</td><td class="center">${c.nonEffectiveWeeks}</td><td class="center">${c.effectiveWeeks}</td><td class="center">${c.jp} JP</td><td>${c.notes}</td></tr>`).join("")}
          <tr><th>TOTAL</th><th class="center">25</th><th class="center">7</th><th class="center">18</th><th class="center">54 JP</th><th>Semester Ganjil 18 Minggu Efektif</th></tr>
        </table>

        <h2>2. TUJUAN PEMBELAJARAN (TP)</h2>
        <table>
          <tr><th>Kode</th><th>Elemen CP</th><th>KKO Bloom</th><th>Deskripsi Tujuan Pembelajaran</th><th>Alokasi</th><th>Ambang KKTP</th></tr>
          ${tps.map(tp => `<tr><td>${tp.code}</td><td>${tp.cpElement}</td><td>${tp.bloomLevel}</td><td>${tp.description}</td><td class="center">${tp.allocatedHours} JP</td><td class="center">${tp.kktpThreshold} (${tp.kktpModel})</td></tr>`).join("")}
        </table>

        <h2>3. PROGRAM SEMESTER (PROSEM) - 6 BULAN (JULI - DESEMBER)</h2>
        <p>Total Alokasi Semester: 54 JP Terdistribusi Penuh</p>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Perangkat_Kurikulum_Informatika_Fase_${selectedFase}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md mb-2">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Modul 4: Otomasi Perangkat Ajar Kurikulum Merdeka
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Generator CP, TP, ATP, KKTP, PROTA & PROSEM
          </h1>
          <p className="text-sm text-slate-500">
            Wizard bertahap terstruktur. Data mengalir dari kalender 6-bulan efektif (54 JP) hingga matriks Program Semester.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Printer className="h-4 w-4" /> Cetak / Ekspor PDF
          </button>
          <button
            type="button"
            onClick={handleExportWord}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition"
          >
            <Download className="h-4 w-4" /> Unduh Dokumen Word (.docx)
          </button>
        </div>
      </div>

      {/* Step Indicator Progress Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-x-auto">
        <div className="flex items-center min-w-[750px] justify-between">
          {wizardSteps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className="flex items-center gap-3 text-left group transition focus:outline-none"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition ${
                    isCurrent
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                      : isCompleted
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-slate-400">Tahap {step.id}</div>
                    <div className={`text-xs font-bold ${isCurrent ? "text-slate-900" : "text-slate-600"}`}>
                      {step.name}
                    </div>
                  </div>
                </button>
                {idx < wizardSteps.length - 1 && (
                  <div className={`h-0.5 w-8 flex-1 mx-2 rounded ${
                    step.id < currentStep ? "bg-emerald-400" : "bg-slate-200"
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {syncSuccessToast && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Tujuan Pembelajaran berhasil dikunci dan disinkronkan ke Buku Nilai & Remedial Hub!</span>
        </div>
      )}

      {generationSuccess && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Gemini AI berhasil menurunkan Tujuan Pembelajaran terstruktur Taksonomi Bloom C1-C6 dan menyelaraskan alokasi waktu!</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs font-medium text-amber-800">
          <span className="font-bold text-amber-900">Perhatian:</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Analisis Minggu Efektif (6-Month Calendar) */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tahap 1: Analisis Minggu Efektif Semester Ganjil (Juli - Desember 2026)</h2>
              <p className="text-xs text-slate-500">
                Perhitungan kalender pendidikan Semester Ganjil: 6 Bulan, 18 Minggu Efektif KBM, 54 Jam Pelajaran (JP).
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-amber-900 text-xs font-bold">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>Total Beban: {totalEffectiveHours} JP (18 Minggu Efektif)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-700">Parameter Kalender</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minggu Efektif KBM Semester</label>
                <input 
                  type="number"
                  value={effectiveWeeks}
                  onChange={(e) => setEffectiveWeeks(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Beban JP per Minggu</label>
                <input 
                  type="number"
                  value={teachingHoursPerWeek}
                  onChange={(e) => setTeachingHoursPerWeek(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="p-3 rounded-lg bg-amber-100/60 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <div className="font-bold">Ketentuan Regulasi PPA 2024:</div>
                <div>18 Minggu KBM &times; 3 JP = <strong>54 JP Riil</strong> per semester ganjil.</div>
              </div>
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Bulan</th>
                    <th className="p-3 text-center">Jumlah Minggu</th>
                    <th className="p-3 text-center">Minggu Tidak Efektif</th>
                    <th className="p-3 text-center">Minggu Efektif</th>
                    <th className="p-3 text-center">Alokasi JP</th>
                    <th className="p-3">Keterangan Kegiatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sixMonthCalendar.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-900">{row.month}</td>
                      <td className="p-3 text-center">{row.totalWeeks}</td>
                      <td className="p-3 text-center text-rose-600 font-semibold">{row.nonEffectiveWeeks}</td>
                      <td className="p-3 text-center text-emerald-600 font-bold">{row.effectiveWeeks}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700">{row.jp} JP</td>
                      <td className="p-3 text-slate-500 text-[11px]">{row.notes}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                    <td className="p-3">TOTAL (6 Bulan)</td>
                    <td className="p-3 text-center">25</td>
                    <td className="p-3 text-center text-rose-600">7</td>
                    <td className="p-3 text-center text-emerald-700 font-extrabold">18</td>
                    <td className="p-3 text-center font-mono font-extrabold text-blue-700">{totalEffectiveHours} JP</td>
                    <td className="p-3 text-xs text-emerald-700 font-bold">18 Minggu Efektif Tercapai Sempurna</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Lanjut ke Pustaka CP BSKAP 032 <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Capaian Pembelajaran (CP) */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tahap 2: Verifikasi Capaian Pembelajaran (CP) Resmi</h2>
              <p className="text-xs text-slate-500">
                Pustaka CP terstandar berdasarkan Keputusan Kepala BSKAP No. 032/H/KR/2024.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Pilih Fase:</span>
              <select
                value={selectedFase}
                onChange={(e) => setSelectedFase(e.target.value as KurikulumFase)}
                className="text-xs font-bold p-1.5 rounded-lg border border-slate-200 bg-white text-blue-700"
              >
                <option value="A">Fase A (Kelas 1-2 SD)</option>
                <option value="B">Fase B (Kelas 3-4 SD)</option>
                <option value="C">Fase C (Kelas 5-6 SD)</option>
                <option value="D">Fase D (Kelas 7-9 SMP)</option>
                <option value="E">Fase E (Kelas 10 SMA)</option>
                <option value="F">Fase F (Kelas 11-12 SMA)</option>
              </select>
            </div>
          </div>

          {/* Element Selector Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Pilih Elemen Mata Pelajaran:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {cpElementsLibrary.map(elem => {
                const isSelected = selectedElementCode === elem.code;
                return (
                  <button
                    key={elem.code}
                    type="button"
                    onClick={() => handleSelectElement(elem.code)}
                    className={`p-3 rounded-xl border text-center transition ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold"
                    }`}
                  >
                    <div className="text-sm font-extrabold">{elem.code}</div>
                    <div className="text-[10px] truncate">{elem.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active CP Text */}
          <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Teks Resmi CP Elemen: {cpElementsLibrary.find(e => e.code === selectedElementCode)?.name} ({selectedElementCode}) - Fase {selectedFase}
              </h3>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(customCpText);
                  alert("Teks CP berhasil disalin!");
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
              >
                <Copy className="h-3.5 w-3.5" /> Salin Teks CP
              </button>
            </div>
            <textarea
              rows={4}
              value={customCpText}
              onChange={(e) => setCustomCpText(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed text-slate-700"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Lanjut Turunkan ke TP (Tujuan Pembelajaran) <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Tujuan Pembelajaran (TP) & Bloom KKO */}
      {currentStep === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tahap 3: Tujuan Pembelajaran (TP) Terstruktur</h2>
              <p className="text-xs text-slate-500">
                Setiap TP diklasifikasikan dengan Kata Kerja Operasional (KKO) Taksonomi Bloom C1-C6 dan alokasi JP.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSimulateAIGeneration}
                disabled={isGeneratingAI}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {isGeneratingAI ? "Menurunkan TP via Gemini AI..." : "Generate / Optimasi TP via AI"}
              </button>
              <button
                type="button"
                onClick={handleLockAndSyncTPs}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition"
              >
                <Lock className="h-4 w-4" /> Kunci & Sinkronkan ke Buku Nilai
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {tps.map((tp) => {
              const bloomInfo = bloomTaxonomy[tp.bloomLevel as keyof typeof bloomTaxonomy] || bloomTaxonomy.C3;

              return (
                <div key={tp.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5">
                        {tp.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {tp.cpElement}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded text-[11px] font-bold px-2.5 py-0.5 border ${bloomInfo.color}`}>
                        KKO: {tp.bloomLevel} - {bloomInfo.label}
                      </span>
                      <span className="rounded bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5">
                        {tp.allocatedHours} JP
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-800 leading-relaxed">
                    {tp.description}
                  </p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span>Materi Pokok: <strong className="text-slate-700">{tp.scope}</strong></span>
                    <span>•</span>
                    <span>Ambang KKTP: <strong className="text-emerald-700">{tp.kktpThreshold}</strong> ({tp.kktpModel})</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Kembali
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLockAndSyncTPs}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
              >
                <CheckCircle2 className="h-4 w-4" /> Kunci & Sinkronkan
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Lanjut ke Alur Tujuan (ATP) <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Alur Tujuan Pembelajaran (ATP) */}
      {currentStep === 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tahap 4: Alur Tujuan Pembelajaran (ATP)</h2>
              <p className="text-xs text-slate-500">
                Pengurutan logis materi berdasarkan prasyarat pengetahuan dan alokasi JP kumulatif (Total: 54 JP).
              </p>
            </div>
            <button
              type="button"
              onClick={handleLockAndSyncTPs}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <Lock className="h-4 w-4" /> Kunci & Sinkronkan ke Buku Nilai
            </button>
          </div>

          <div className="space-y-4">
            {tps.map((tp, idx) => {
              const bloomInfo = bloomTaxonomy[tp.bloomLevel as keyof typeof bloomTaxonomy] || bloomTaxonomy.C3;
              const cumulativeHours = tps.slice(0, idx + 1).reduce((acc, curr) => acc + curr.allocatedHours, 0);

              return (
                <div key={tp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-blue-400 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-blue-700">{tp.code}</span>
                      <span className="text-xs font-semibold text-slate-900">— {tp.scope}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${bloomInfo.color}`}>
                        {tp.bloomLevel} ({bloomInfo.label})
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                        {tp.allocatedHours} JP (Kumulatif: {cumulativeHours}/54 JP)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 pl-8">{tp.description}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Kembali
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLockAndSyncTPs}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
              >
                <CheckCircle2 className="h-4 w-4" /> Kunci & Sinkronkan
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Lanjut ke Kriteria KKTP <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Kriteria Ketercapaian (KKTP) */}
      {currentStep === 5 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tahap 5: Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)</h2>
              <p className="text-xs text-slate-500">
                Pilihan model evaluasi KKTP: Deskripsi Kriteria, Rubrik 4-Level Skala, atau Interval Nilai (0-100).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {tps.map((tp, idx) => (
              <div key={tp.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900">
                    {tp.code}: {tp.description}
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ambang Batas: {tp.kktpThreshold}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Model KKTP:</label>
                    <select
                      value={tp.kktpModel}
                      onChange={(e) => {
                        const updated = tps.map(t => t.id === tp.id ? { ...t, kktpModel: e.target.value as any } : t);
                        setTps(updated);
                      }}
                      className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <option value="INTERVAL_NILAI">Interval Nilai Kontinu ([0,40], (40,65], (65,85], (85,100])</option>
                      <option value="RUBRIK_SKALA">Rubrik Penilaian 4-Level Skala</option>
                      <option value="DESKRIPSI_KRITERIA">Deskripsi Checklist Indikator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ambang Tuntas Minimal:</label>
                    <input
                      type="number"
                      value={tp.kktpThreshold}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const updated = tps.map(t => t.id === tp.id ? { ...t, kktpThreshold: val } : t);
                        setTps(updated);
                      }}
                      className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Lanjut ke Matriks PROTA & PROSEM (6 Bulan) <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: PROTA & PROSEM (Full 6-Month Matrix) */}
      {currentStep === 6 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tahap 6: Program Tahunan (PROTA) & Program Semester (PROSEM)</h2>
              <p className="text-xs text-slate-500">
                Matriks distribusi mingguan Semester Ganjil 6 Bulan (Juli, Agustus, September, Oktober, November, Desember). Total 54 JP.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLockAndSyncTPs}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <Lock className="h-4 w-4" /> Kunci & Sinkronkan
              </button>
            </div>
          </div>

          {/* Full 6-Month PROSEM Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-16 text-center" rowSpan={2}>Kode</th>
                  <th className="p-3" rowSpan={2}>Tujuan Pembelajaran & Materi</th>
                  <th className="p-3 text-center w-16" rowSpan={2}>Alokasi</th>
                  <th className="p-2 text-center border-l border-slate-200" colSpan={4}>Juli</th>
                  <th className="p-2 text-center border-l border-slate-200" colSpan={4}>Agustus</th>
                  <th className="p-2 text-center border-l border-slate-200" colSpan={4}>September</th>
                  <th className="p-2 text-center border-l border-slate-200" colSpan={5}>Oktober</th>
                  <th className="p-2 text-center border-l border-slate-200" colSpan={4}>November</th>
                  <th className="p-2 text-center border-l border-slate-200" colSpan={4}>Desember</th>
                </tr>
                <tr className="bg-slate-100 text-[10px] text-center border-b border-slate-200">
                  {/* Juli (4) */}
                  <th className="border-l border-slate-200">1</th><th>2</th><th>3</th><th>4</th>
                  {/* Agustus (4) */}
                  <th className="border-l border-slate-200">1</th><th>2</th><th>3</th><th>4</th>
                  {/* September (4) */}
                  <th className="border-l border-slate-200">1</th><th>2</th><th>3</th><th>4</th>
                  {/* Oktober (5) */}
                  <th className="border-l border-slate-200">1</th><th>2</th><th>3</th><th>4</th><th>5</th>
                  {/* November (4) */}
                  <th className="border-l border-slate-200">1</th><th>2</th><th>3</th><th>4</th>
                  {/* Desember (4) */}
                  <th className="border-l border-slate-200">1</th><th>2</th><th>3</th><th>4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Non-Effective Row */}
                <tr className="bg-rose-50/40 text-[10px] text-rose-700 font-bold">
                  <td colSpan={3} className="p-2 text-center">Agenda Non-Efektif</td>
                  {/* Juli */}
                  <td className="p-2 text-center bg-rose-100 text-rose-800">MPLS</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">-</td>
                  {/* Ags */}
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center bg-rose-100 text-rose-800">HUT</td>
                  <td className="p-2 text-center">-</td>
                  {/* Sep */}
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center bg-rose-100 text-rose-800">STS</td>
                  <td className="p-2 text-center">-</td>
                  {/* Okt */}
                  <td className="p-2 text-center bg-rose-100 text-rose-800">JEDA</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">-</td>
                  {/* Nov */}
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">-</td>
                  {/* Des */}
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center bg-rose-100 text-rose-800">SAS</td>
                  <td className="p-2 text-center bg-rose-100 text-rose-800">RAPOR</td>
                </tr>

                {/* TP-01 */}
                <tr>
                  <td className="p-3 text-center font-bold text-blue-700">TP-01</td>
                  <td className="p-3 font-semibold text-slate-900">Strategi Algoritmik Pemilahan dan Pencarian</td>
                  <td className="p-3 text-center font-mono font-bold">6 JP</td>
                  {/* Juli */}
                  <td className="p-2 text-center text-slate-300">-</td>
                  <td className="p-2 text-center text-slate-300">-</td>
                  <td className="p-2 text-center bg-blue-100 text-blue-800 font-bold">3 JP</td>
                  <td className="p-2 text-center bg-blue-100 text-blue-800 font-bold">3 JP</td>
                  {/* Other 5 months */}
                  <td colSpan={21} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                </tr>

                {/* TP-02 */}
                <tr>
                  <td className="p-3 text-center font-bold text-blue-700">TP-02</td>
                  <td className="p-3 font-semibold text-slate-900">Integrasi Aplikasi Perkantoran & Otomasi Dokumen</td>
                  <td className="p-3 text-center font-mono font-bold">9 JP</td>
                  <td colSpan={4} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                  {/* Agustus */}
                  <td className="p-2 text-center bg-indigo-100 text-indigo-800 font-bold">3 JP</td>
                  <td className="p-2 text-center bg-indigo-100 text-indigo-800 font-bold">3 JP</td>
                  <td className="p-2 text-center text-slate-300">-</td>
                  <td className="p-2 text-center bg-indigo-100 text-indigo-800 font-bold">3 JP</td>
                  <td colSpan={17} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                </tr>

                {/* TP-03 */}
                <tr>
                  <td className="p-3 text-center font-bold text-blue-700">TP-03</td>
                  <td className="p-3 font-semibold text-slate-900">Arsitektur Komputer & Cara Kerja Sistem Operasi</td>
                  <td className="p-3 text-center font-mono font-bold">6 JP</td>
                  <td colSpan={8} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                  {/* September */}
                  <td className="p-2 text-center bg-sky-100 text-sky-800 font-bold">3 JP</td>
                  <td className="p-2 text-center bg-sky-100 text-sky-800 font-bold">3 JP</td>
                  <td className="p-2 text-center text-slate-300">-</td>
                  <td className="p-2 text-center text-slate-300">-</td>
                  <td colSpan={13} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                </tr>

                {/* TP-04 */}
                <tr>
                  <td className="p-3 text-center font-bold text-blue-700">TP-04</td>
                  <td className="p-3 font-semibold text-slate-900">Jaringan Komputer, Topologi & Pengalamatan IP</td>
                  <td className="p-3 text-center font-mono font-bold">9 JP</td>
                  <td colSpan={11} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                  {/* Sep W4 */}
                  <td className="p-2 text-center bg-amber-100 text-amber-800 font-bold">3 JP</td>
                  {/* Okt W1 - W5 */}
                  <td className="p-2 text-center text-slate-300">-</td>
                  <td className="p-2 text-center bg-amber-100 text-amber-800 font-bold">3 JP</td>
                  <td className="p-2 text-center bg-amber-100 text-amber-800 font-bold">3 JP</td>
                  <td className="p-2 text-center text-slate-300">-</td>
                  <td className="p-2 text-center text-slate-300">-</td>
                  <td colSpan={8} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                </tr>

                {/* TP-05 */}
                <tr>
                  <td className="p-3 text-center font-bold text-blue-700">TP-05</td>
                  <td className="p-3 font-semibold text-slate-900">Analisis Data, Pemodelan & Visualisasi Informasi</td>
                  <td className="p-3 text-center font-mono font-bold">6 JP</td>
                  <td colSpan={15} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                  {/* Okt W4, W5 */}
                  <td className="p-2 text-center bg-emerald-100 text-emerald-800 font-bold">3 JP</td>
                  <td className="p-2 text-center bg-emerald-100 text-emerald-800 font-bold">3 JP</td>
                  <td colSpan={8} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                </tr>

                {/* TP-06 */}
                <tr>
                  <td className="p-3 text-center font-bold text-blue-700">TP-06</td>
                  <td className="p-3 font-semibold text-slate-900">Algoritma & Pemrograman Prosedural (Python)</td>
                  <td className="p-3 text-center font-mono font-bold">12 JP</td>
                  <td colSpan={17} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                  {/* November (4 weeks x 3 JP = 12 JP) */}
                  <td className="p-2 text-center bg-purple-100 text-purple-800 font-bold">3 JP</td>
                  <td className="p-2 text-center bg-purple-100 text-purple-800 font-bold">3 JP</td>
                  <td className="p-2 text-center bg-purple-100 text-purple-800 font-bold">3 JP</td>
                  <td className="p-2 text-center bg-purple-100 text-purple-800 font-bold">3 JP</td>
                  <td colSpan={4} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                </tr>

                {/* TP-07 / Pengayaan */}
                <tr>
                  <td className="p-3 text-center font-bold text-blue-700">TP-07</td>
                  <td className="p-3 font-semibold text-slate-900">Dampak Sosial Informatika & Mini Proyek Akhir</td>
                  <td className="p-3 text-center font-mono font-bold">6 JP</td>
                  <td colSpan={21} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                  {/* Desember W1, W2 */}
                  <td className="p-2 text-center bg-teal-100 text-teal-800 font-bold">3 JP</td>
                  <td className="p-2 text-center bg-teal-100 text-teal-800 font-bold">3 JP</td>
                  <td className="p-2 text-center text-slate-300">-</td>
                  <td className="p-2 text-center text-slate-300">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleLockAndSyncTPs}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition"
            >
              <CheckCircle2 className="h-4 w-4" /> Kunci & Sinkronkan ke Buku Nilai & Modul Ajar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
