"use client";

import React, { useState } from "react";
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
  Printer
} from "lucide-react";
import { mockTPs } from "@/lib/mockData";
import { generateTPFromCPAction } from "@/app/actions/geminiActions";
import type { GeneratedTP } from "@/types";

const wizardSteps = [
  { id: 1, name: "Minggu Efektif", icon: Calendar, description: "Hitung JP riil semester" },
  { id: 2, name: "Capaian Pembelajaran (CP)", icon: Layers, description: "Pustaka resmi BSKAP 2024" },
  { id: 3, name: "Tujuan Pembelajaran (TP)", icon: Target, description: "Diturunkan via Taksonomi Bloom" },
  { id: 4, name: "Alur Tujuan (ATP)", icon: ListOrdered, description: "Urutan & alokasi JP per TP" },
  { id: 5, name: "Kriteria KKTP", icon: Scale, description: "Rubrik & ambang tuntas" },
  { id: 6, name: "PROTA & PROSEM", icon: FileSpreadsheet, description: "Matriks distribusi mingguan" },
];

export default function CurriculumPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [tps, setTps] = useState(mockTPs);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  // Analisis Minggu Efektif state
  const [effectiveWeeks, setEffectiveWeeks] = useState(18);
  const [teachingHoursPerWeek, setTeachingHoursPerWeek] = useState(3);
  const totalEffectiveHours = effectiveWeeks * teachingHoursPerWeek;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSimulateAIGeneration = async () => {
    setIsGeneratingAI(true);
    setErrorMessage(null);

    const cpText = "Pada akhir fase E, peserta didik mampu memahami strategi algoritmik standar untuk menyelesaikan persoalan pemilahan dan pencarian; serta menerapkan dekomposisi, pengenalan pola, abstraksi, dan berpikir algoritmik pada persoalan kehidupan sehari-hari maupun pemrograman.";

    const res = await generateTPFromCPAction({
      subject: "Informatika",
      fase: "E",
      cpText: cpText
    });

    setIsGeneratingAI(false);

    if (res.success && res.data && res.data.length > 0) {
      const mapped = res.data.map((item, idx) => ({
        id: `tp-live-${Date.now()}-${idx}`,
        classId: "cls-1",
        cpElement: "Berpikir Komputasional (BK)",
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
      // Jika belum pasang API Key atau error, tampilkan pesan ramah
      setErrorMessage(res.error || "Gagal menghubungi Gemini AI. Pastikan GEMINI_API_KEY sudah diisi di .env.local.");
    }
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
            Wizard bertahap terstruktur. Data mengalir dari analisis kalender efektif hingga matriks Program Semester.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Printer className="h-4 w-4" /> Cetak / Ekspor PDF
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition"
          >
            <Download className="h-4 w-4" /> Unduh Dokumen Word (.docx)
          </button>
        </div>
      </div>

      {/* Step Indicator Progress Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-x-auto">
        <div className="flex items-center min-w-[700px] justify-between">
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

      {generationSuccess && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Gemini AI berhasil menghasilkan perangkat ajar terstruktur dan menyelaraskan alokasi waktu!</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs font-medium text-amber-800">
          <span className="font-bold text-amber-900">Perhatian:</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Analisis Minggu Efektif */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tahap 1: Analisis Minggu Efektif Semester Ganjil 2026/2027</h2>
              <p className="text-xs text-slate-500">
                Menghitung total jam pelajaran (JP) efektif berdasarkan kalender pendidikan sekolah.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200/60 px-4 py-2 text-amber-900 text-xs font-bold">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>Total Alokasi JP Efektif: {totalEffectiveHours} JP</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-700">Parameter Dasar</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minggu Efektif KBM</label>
                <input 
                  type="number"
                  value={effectiveWeeks}
                  onChange={(e) => setEffectiveWeeks(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Beban JP per Minggu</label>
                <input 
                  type="number"
                  value={teachingHoursPerWeek}
                  onChange={(e) => setTeachingHoursPerWeek(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-white"
                />
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
                    <th className="p-3">Keterangan Kegiatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Juli 2026</td>
                    <td className="p-3 text-center">4</td>
                    <td className="p-3 text-center text-rose-600 font-semibold">2</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">2</td>
                    <td className="p-3 text-slate-500 text-[11px]">MPLS & Libur Semester Genap</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Agustus 2026</td>
                    <td className="p-3 text-center">5</td>
                    <td className="p-3 text-center text-rose-600 font-semibold">1</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">4</td>
                    <td className="p-3 text-slate-500 text-[11px]">HUT RI ke-81</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">September 2026</td>
                    <td className="p-3 text-center">4</td>
                    <td className="p-3 text-center text-rose-600 font-semibold">0</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">4</td>
                    <td className="p-3 text-slate-500 text-[11px]">KBM Efektif Penuh</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Oktober 2026</td>
                    <td className="p-3 text-center">4</td>
                    <td className="p-3 text-center text-rose-600 font-semibold">0</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">4</td>
                    <td className="p-3 text-slate-500 text-[11px]">Asesmen Sumatif Tengah Semester</td>
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
              Lanjut ke Pustaka CP <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Capaian Pembelajaran (CP) */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tahap 2: Verifikasi Capaian Pembelajaran (CP) Resmi</h2>
              <p className="text-xs text-slate-500">
                Pustaka CP resmi read-only dari Keputusan Kepala BSKAP No. 032/H/KR/2024. Mapel: Informatika Fase E.
              </p>
            </div>
            <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-700 text-xs font-semibold">
              Terverifikasi BSKAP 2024
            </span>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Elemen 1: Berpikir Komputasional (BK)
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Pada akhir fase E, peserta didik mampu memahami strategi algoritmik standar untuk menyelesaikan persoalan pemilahan dan pencarian; serta menerapkan dekomposisi, pengenalan pola, abstraksi, dan berpikir algoritmik pada persoalan kehidupan sehari-hari maupun pemrograman.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Elemen 2: Teknologi Informasi dan Komunikasi (TIK)
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Pada akhir fase E, peserta didik mampu memanfaatkan fitur lanjut aplikasi perkantoran (pengolah kata, angka, dan presentasi) beserta otomasinya untuk mengintegrasikan dan menyajikan konten secara efektif dan kolaboratif.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Elemen 3: Sistem Komputer (SK)
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Pada akhir fase E, peserta didik mampu menjelaskan cara kerja perangkat keras dan perangkat lunak komputer serta sistem operasi dalam mengelola pemrosesan data dan interaksi pengguna.
              </p>
            </div>
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

      {/* STEP 3: Tujuan Pembelajaran (TP) */}
      {currentStep === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tahap 3: Tujuan Pembelajaran (TP) Terstruktur</h2>
              <p className="text-xs text-slate-500">
                Setiap TP memiliki ID unik permanen. TP ini menjadi acuan langsung kolom nilai, KKTP, dan Modul Ajar.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSimulateAIGeneration}
              disabled={isGeneratingAI}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {isGeneratingAI ? "Menurunkan TP via Gemini AI..." : "Generate / Optimasi TP via AI"}
            </button>
          </div>

          <div className="space-y-3">
            {tps.map((tp) => (
              <div key={tp.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 transition">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5">
                      {tp.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {tp.cpElement}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-50 text-indigo-700 text-[11px] font-semibold px-2 py-0.5 border border-indigo-200">
                      KKO: {tp.bloomLevel}
                    </span>
                    <span className="rounded bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5">
                      {tp.allocatedHours} JP
                    </span>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-800 leading-relaxed">
                  {tp.description}
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-3">
                  <span>Materi Pokok: <strong className="text-slate-700">{tp.scope}</strong></span>
                  <span>•</span>
                  <span>Ambang KKTP: <strong className="text-emerald-700">{tp.kktpThreshold}</strong> ({tp.kktpModel})</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Kembali
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
      )}

      {/* STEP 4, 5, 6 Summary Views */}
      {currentStep >= 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {currentStep === 4 && "Tahap 4: Alur Tujuan Pembelajaran (ATP)"}
                {currentStep === 5 && "Tahap 5: Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)"}
                {currentStep === 6 && "Tahap 6: Program Tahunan (PROTA) & Program Semester (PROSEM)"}
              </h2>
              <p className="text-xs text-slate-500">
                {currentStep === 4 && "Pengurutan logis materi berdasarkan prasyarat pengetahuan dan alokasi JP efektif."}
                {currentStep === 5 && "Ambang batas ketercapaian kompetensi untuk modul penilaian dan status rapor."}
                {currentStep === 6 && "Matriks minggu efektif pembelajaran per bulan semester ganjil."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSimulateAIGeneration}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition"
            >
              <Sparkles className="h-4 w-4" /> Optimalkan Matriks
            </button>
          </div>

          {currentStep === 6 ? (
            /* Prosem Table */
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-16 text-center">Kode</th>
                    <th className="p-3">Tujuan Pembelajaran & Materi</th>
                    <th className="p-3 text-center w-16">Alokasi</th>
                    <th className="p-3 text-center" colSpan={4}>Juli</th>
                    <th className="p-3 text-center" colSpan={4}>Agustus</th>
                    <th className="p-3 text-center" colSpan={4}>September</th>
                  </tr>
                  <tr className="bg-slate-100 text-[10px] text-center border-b border-slate-200">
                    <th colSpan={3}></th>
                    <th>1</th><th>2</th><th>3</th><th>4</th>
                    <th>1</th><th>2</th><th>3</th><th>4</th>
                    <th>1</th><th>2</th><th>3</th><th>4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 text-center font-bold text-blue-700">TP-01</td>
                    <td className="p-3 font-semibold text-slate-900">Algoritma Pemilahan dan Pencarian</td>
                    <td className="p-3 text-center font-mono font-bold">6 JP</td>
                    <td className="p-2 text-center bg-rose-50 text-rose-500 text-[9px] font-bold">MPLS</td>
                    <td className="p-2 text-center bg-rose-50 text-rose-500 text-[9px] font-bold">LIBUR</td>
                    <td className="p-2 text-center bg-blue-100 text-blue-800 font-bold">3 JP</td>
                    <td className="p-2 text-center bg-blue-100 text-blue-800 font-bold">3 JP</td>
                    <td colSpan={8} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-center font-bold text-blue-700">TP-02</td>
                    <td className="p-3 font-semibold text-slate-900">Integrasi Aplikasi Perkantoran</td>
                    <td className="p-3 text-center font-mono font-bold">9 JP</td>
                    <td colSpan={4} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                    <td className="p-2 text-center bg-indigo-100 text-indigo-800 font-bold">3 JP</td>
                    <td className="p-2 text-center bg-indigo-100 text-indigo-800 font-bold">3 JP</td>
                    <td className="p-2 text-center bg-rose-50 text-rose-500 text-[9px] font-bold">HUT-RI</td>
                    <td className="p-2 text-center bg-indigo-100 text-indigo-800 font-bold">3 JP</td>
                    <td colSpan={4} className="p-2 bg-slate-50 text-center text-slate-300">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              {tps.map(tp => (
                <div key={tp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-700">{tp.code}: </span>
                    <span className="text-xs font-semibold text-slate-800">{tp.description}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                    {tp.allocatedHours} JP
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Kembali
            </button>
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Lanjut ke Tahap Berikutnya <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                <CheckCircle2 className="h-4 w-4" /> Kunci & Sinkronkan ke Modul Ajar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

