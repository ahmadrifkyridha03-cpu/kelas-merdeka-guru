"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  HelpCircle,
  FileCheck,
  Send,
  Zap,
  TrendingUp
} from "lucide-react";
import { mockStudents, mockTPs } from "@/lib/mockData";
import { generateRemedialTaskAction } from "@/app/actions/geminiActions";

export default function RemedialPage() {
  const [bonusList, setBonusList] = useState(mockStudents);
  const [activeTab, setActiveTab] = useState<"remedial" | "pengayaan" | "bonus">("remedial");
  const [isGeneratingTask, setIsGeneratingTask] = useState(false);
  const [generatedTask, setGeneratedTask] = useState<string | null>(null);

  const handleAddBonus = (studentId: string, amount: number) => {
    setBonusList(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, bonusPoints: s.bonusPoints + amount };
      }
      return s;
    }));
  };

  const handleGenerateAITask = async (tpCode: string, studentName: string = "Siswa") => {
    setIsGeneratingTask(true);
    setGeneratedTask(null);

    const res = await generateRemedialTaskAction({
      studentName: studentName,
      tpCode: tpCode,
      tpDescription: "Menerapkan strategi algoritmik standar untuk menyelesaikan persoalan pemilahan (sorting).",
      score: 65,
      kktp: 75
    });

    setIsGeneratingTask(false);

    if (res.success && res.taskText) {
      setGeneratedTask(res.taskText);
    } else {
      setGeneratedTask(`PERHATIAN: ${res.error || "Gagal menghubungi Gemini AI."}\n\nSilakan pastikan kunci GEMINI_API_KEY sudah diisi pada file .env.local.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Modul 3: Nilai Tambah & Remedial Hub
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Remedial, Pengayaan & Gamifikasi Poin Bonus
          </h1>
          <p className="text-sm text-slate-500">
            Siswa dengan nilai di bawah ambang KKTP otomatis masuk daftar remedial. AI membuatkan instrumen tugas penuntasan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 transition"
          >
            <History className="h-4 w-4" /> Riwayat Audit Ledger
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("remedial")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === "remedial"
              ? "bg-rose-600 text-white shadow-sm shadow-rose-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Antrean Remedial (Nilai &lt; KKTP)
        </button>
        <button
          onClick={() => setActiveTab("pengayaan")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === "pengayaan"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Peserta Pengayaan (Tuntas Mahir)
        </button>
        <button
          onClick={() => setActiveTab("bonus")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === "bonus"
              ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Log Cepat Poin Keaktifan (+1 Poin)
        </button>
      </div>

      {/* Remedial Tab Content */}
      {activeTab === "remedial" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-1">
                <AlertTriangle className="h-4 w-4" /> 2 Siswa Membutuhkan Remedial pada TP-01
              </div>
              <p className="text-xs text-rose-600">
                Nilai capaian sumatif lingkup materi berada di bawah KKTP (75). Penanganan remedial disarankan berupa penugasan terbimbing atau asesmen ulang.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">TP Belum Tercapai</th>
                    <th className="p-3 text-center">Nilai Asli</th>
                    <th className="p-3 text-center">Batas Maks Remedial</th>
                    <th className="p-3 text-center">Aksi Penanganan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Bagas Satria Nugraha</td>
                    <td className="p-3">
                      <span className="rounded bg-rose-50 text-rose-700 font-bold px-2 py-0.5 border border-rose-200">
                        TP-01: Algoritma Pemilahan
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-rose-600">65</td>
                    <td className="p-3 text-center font-bold text-slate-600">75 (KKTP)</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleGenerateAITask("TP-01")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-purple-700 transition"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Buat Tugas AI
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Dhimas Arya Putra</td>
                    <td className="p-3">
                      <span className="rounded bg-rose-50 text-rose-700 font-bold px-2 py-0.5 border border-rose-200">
                        TP-01: Algoritma Pemilahan
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-rose-600">70</td>
                    <td className="p-3 text-center font-bold text-slate-600">75 (KKTP)</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleGenerateAITask("TP-01")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-purple-700 transition"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Buat Tugas AI
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Task Generator Side Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600" /> Instrumen Remedial AI
              </h3>
              {isGeneratingTask && <span className="text-[10px] text-purple-600 font-bold animate-pulse">Menulis...</span>}
            </div>

            {generatedTask ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-4 text-xs font-mono text-slate-800 leading-relaxed border border-slate-200 whitespace-pre-line">
                  {generatedTask}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    Salin Tugas
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cetak Lembar Soal
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                Klik tombol <strong>"Buat Tugas AI"</strong> pada salah satu siswa di tabel untuk menghasilkan soal remedial terpersonalisasi.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bonus XP Tab Content */}
      {activeTab === "bonus" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pemberian Poin Bonus Keaktifan Cepat (Tap +1)</h2>
              <p className="text-xs text-slate-500">
                Poin tambahan untuk apresiasi keaktifan bertanya, tugas ekstra, atau kerja sama tim. Terbatas maksimal 10 poin per semester (anti-inflasi nilai).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {bonusList.map(student => (
              <div key={student.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex items-center justify-between hover:border-purple-300 transition">
                <div>
                  <div className="font-bold text-xs text-slate-900">{student.fullName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">NISN: {student.nisn}</div>
                  <div className="mt-1 text-xs font-extrabold text-purple-700">
                    Total: +{student.bonusPoints} Poin
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddBonus(student.id, 1)}
                    className="h-8 px-2.5 rounded-lg bg-purple-600 text-white font-bold text-xs shadow-sm hover:bg-purple-700 active:scale-95 transition"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBonus(student.id, 2)}
                    className="h-8 px-2.5 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-700 active:scale-95 transition"
                  >
                    +2
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

