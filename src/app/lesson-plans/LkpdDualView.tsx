"use client";

import React, { useState } from "react";
import type { LkpdAthirah } from "../../types/index.ts";
import {
  FileText,
  Key,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  BookOpen,
  Calendar,
  Sparkles,
  Download,
  HelpCircle,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

interface LkpdDualViewProps {
  studentLkpd: LkpdAthirah;
  teacherLkpd: LkpdAthirah;
  onDownloadDocx: (version: "siswa" | "guru") => void;
}

export function LkpdDualView({
  studentLkpd,
  teacherLkpd,
  onDownloadDocx,
}: LkpdDualViewProps) {
  const [activeVersion, setActiveVersion] = useState<"siswa" | "guru">("siswa");

  const currentLkpd = activeVersion === "guru" ? teacherLkpd : studentLkpd;
  const guide = teacherLkpd.guruAnswerKeyGuide;

  const totalRubricScore =
    guide?.rubrikPenilaian4Level.reduce((sum, r) => sum + r.bobotNilai, 0) || 100;

  return (
    <div className="space-y-4">
      {/* Version Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
              activeVersion === "guru"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {activeVersion === "guru" ? <Key className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {activeVersion === "guru"
                ? "LKPD Versi Guru (Kunci Jawaban & Rubrik Analitik)"
                : "LKPD Versi Siswa (Siap Bagikan & Cetak)"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {activeVersion === "guru"
                ? "Memuat kunci jawaban model, antisipasi miskonsepsi, dan rubrik analitik berbobot 100 poin"
                : "Memuat adab belajar, stimulus kontekstual, dan aktivitas bertingkat 3M"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Button */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveVersion("siswa")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeVersion === "siswa"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Versi Siswa
            </button>
            <button
              type="button"
              onClick={() => setActiveVersion("guru")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeVersion === "guru"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Versi Guru (Kunci)
            </button>
          </div>

          <button
            type="button"
            onClick={() => onDownloadDocx(activeVersion)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
              activeVersion === "guru"
                ? "bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100"
                : "bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Unduh .docx
          </button>
        </div>
      </div>

      {/* Main Document Preview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-xs">
        {/* Kop Surat Resmi Athirah */}
        <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
          <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
            Yayasan Hadji Kalla
          </div>
          <div className="text-xl font-extrabold text-emerald-900 tracking-tight">
            SEKOLAH ISLAM ATHIRAH
          </div>
          <div className="text-sm font-bold text-slate-800">
            {currentLkpd.unit.toUpperCase()}
          </div>
          <div className="text-[11px] text-slate-500">
            Mata Pelajaran: <strong>{currentLkpd.mataPelajaran}</strong> • {currentLkpd.kelas} • Pertemuan ke-{currentLkpd.meetingNumber} ({currentLkpd.alokasiWaktuMinutes} Menit)
          </div>

          {activeVersion === "guru" && (
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-purple-100 border border-purple-300 text-purple-900 font-extrabold text-[11px] tracking-wide uppercase">
              [DOKUMEN PEGANGAN GURU: KUNCI JAWABAN & PEDOMAN PENSKORAN]
            </div>
          )}
        </div>

        {/* Kotak Identitas Siswa / Kelompok */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
            <div>
              <span className="font-bold text-slate-900">Nama Kelompok:</span> ....................................................
            </div>
            <div>
              <span className="font-bold text-slate-900">Hari / Tanggal:</span> ............................................
            </div>
            <div className="sm:col-span-2">
              <span className="font-bold text-slate-900">Anggota Kelompok:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1 text-[11px] text-slate-500">
                <div>1. ......................................................... (Ketua)</div>
                <div>2. .........................................................</div>
                <div>3. .........................................................</div>
                <div>4. .........................................................</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bagian A: Pembuka Islami & Adab Belajar */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            A. Kalam Pembuka & Adab Menuntut Ilmu
          </h4>

          <div className="text-center py-2 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
            <div className="text-2xl font-serif text-emerald-950 font-arabic">
              {currentLkpd.openingDuaAndAdab.bismillahText}
            </div>
            <div className="text-[11px] text-emerald-800 italic">
              {currentLkpd.openingDuaAndAdab.ayatStimulusSnippet}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5">
            <strong className="text-slate-800 block text-[11px]">
              Adab Belajar & Pengingat Akhlak Mulia:
            </strong>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
              {currentLkpd.openingDuaAndAdab.adabBelajarTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bagian B: Wacana Stimulus Kontekstual Autentik */}
        <div className="space-y-2">
          <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
            <BookOpen className="w-4 h-4 text-blue-600" />
            B. Wacana Stimulus Kontekstual
          </h4>

          <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 space-y-1.5">
            <span className="font-bold text-blue-950 text-xs block">
              {currentLkpd.contextualStimulus.title}
            </span>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              {currentLkpd.contextualStimulus.narrative}
            </p>
          </div>
        </div>

        {/* Bagian C: Aktivitas Bertingkat 3M (Tier 1, Tier 2, Tier 3) */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
            <Layers className="w-4 h-4 text-indigo-600" />
            C. Aktivitas Penyelidikan Berjenjang (Alur 3M)
          </h4>

          {/* Tier 1: Fase Memahami */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px]">1</span>
                Aktivitas 1: Fase Memahami (Tier 1 - Perlu Bimbingan)
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                Bobot: 20 Poin
              </span>
            </div>

            {currentLkpd.aktivitasSiswa.faseMemahami.map((act, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-slate-700">{act.instructions}</p>
                <div className="p-3 rounded-lg bg-indigo-50/40 border border-indigo-100 font-medium text-slate-800 whitespace-pre-wrap">
                  {act.taskPrompt}
                </div>

                {activeVersion === "guru" && guide?.exemplarAnswersByTier["tier-1"] ? (
                  <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-purple-950 font-mono text-[11px] space-y-1">
                    <strong className="block text-purple-900 font-bold tracking-wide uppercase">
                      [KUNCI JAWABAN MODEL GURU - TIER 1]:
                    </strong>
                    <div className="whitespace-pre-wrap">{guide.exemplarAnswersByTier["tier-1"]}</div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-slate-400 italic">
                    [Ruang Jawaban Peserta Didik: Tuliskan fakta penting dan jawaban analisis di sini]
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tier 2: Fase Mengaplikasi */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">2</span>
                Aktivitas 2: Fase Mengaplikasi (Tier 2 - Reguler / Mandiri)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Bobot: 50 Poin
              </span>
            </div>

            {currentLkpd.aktivitasSiswa.faseMengaplikasi.map((act, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-slate-700">{act.instructions}</p>
                {act.hintsOrScaffolding && (
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-100">
                    💡 <strong>Panduan Bimbingan:</strong> {act.hintsOrScaffolding}
                  </p>
                )}
                <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 font-mono text-slate-800 whitespace-pre-wrap">
                  {act.taskPrompt}
                </div>

                {activeVersion === "guru" && guide?.exemplarAnswersByTier["tier-2"] ? (
                  <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-purple-950 font-mono text-[11px] space-y-1">
                    <strong className="block text-purple-900 font-bold tracking-wide uppercase">
                      [KUNCI JAWABAN MODEL GURU - TIER 2]:
                    </strong>
                    <div className="whitespace-pre-wrap">{guide.exemplarAnswersByTier["tier-2"]}</div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-400 italic">
                    [Ruang Kerja Kelompok: Tuliskan susunan angka dan jumlah pertukaran tiap pass di sini]
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tier 3: Fase Merefleksi */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px]">3</span>
                Aktivitas 3: Fase Merefleksi (Tier 3 - Mahir / Pengayaan)
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                Bobot: 30 Poin
              </span>
            </div>

            {currentLkpd.aktivitasSiswa.faseMerefleksi.map((act, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-slate-700">{act.instructions}</p>
                <div className="p-3 rounded-lg bg-amber-50/40 border border-amber-100 font-medium text-slate-800 whitespace-pre-wrap">
                  {act.taskPrompt}
                </div>

                {activeVersion === "guru" && guide?.exemplarAnswersByTier["tier-3"] ? (
                  <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-purple-950 font-mono text-[11px] space-y-1">
                    <strong className="block text-purple-900 font-bold tracking-wide uppercase">
                      [KUNCI JAWABAN MODEL GURU - TIER 3]:
                    </strong>
                    <div className="whitespace-pre-wrap">{guide.exemplarAnswersByTier["tier-3"]}</div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-slate-400 italic">
                    [Ruang Refleksi Sikap Itqan & Rencana Aksi Amaliyah]
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Khusus Versi Guru: Rubrik Penilaian Analitik 4 Level & Panduan Guru */}
        {activeVersion === "guru" && guide ? (
          <div className="space-y-5 pt-4 border-t border-purple-200">
            {/* Panduan Miskonsepsi & Intervensi Guru */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-purple-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                D. Panduan Antisipasi Miskonsepsi & Intervensi Guru
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
                  <strong className="text-purple-950 block text-[11px]">
                    Antisipasi Miskonsepsi Umum Siswa:
                  </strong>
                  {guide.misconceptionAnticipations.map((m, idx) => (
                    <div key={idx} className="text-[11px] space-y-0.5 border-b border-purple-200/60 pb-2 last:border-none last:pb-0">
                      <div className="text-rose-700 font-bold">Miskonsepsi: {m.misconception}</div>
                      <div className="text-emerald-800">Solusi: {m.remedy}</div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
                  <strong className="text-purple-950 block text-[11px]">
                    Panduan Aksi Diferensiasi Guru di Kelas:
                  </strong>
                  {guide.differentiationActionGuide.map((d, idx) => (
                    <div key={idx} className="text-[11px] space-y-0.5 border-b border-purple-200/60 pb-2 last:border-none last:pb-0">
                      <div className="text-blue-700 font-bold">Kondisi: {d.condition}</div>
                      <div className="text-slate-700">Tindakan: {d.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rubrik Penilaian Analitik 4 Tingkat (Tepat 100 Poin) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-purple-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  E. Rubrik Penilaian Analitik 4 Tingkat (Total = 100 Poin)
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold text-[10px]">
                  Total Bobot: {totalRubricScore} Poin
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-purple-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-100 text-purple-950 text-[11px] font-extrabold uppercase border-b border-purple-200">
                    <tr>
                      <th className="p-2.5 border-r border-purple-200 w-36">Kriteria / Aspek</th>
                      <th className="p-2.5 border-r border-purple-200">1: Perlu Bimbingan</th>
                      <th className="p-2.5 border-r border-purple-200">2: Cukup</th>
                      <th className="p-2.5 border-r border-purple-200">3: Baik</th>
                      <th className="p-2.5 border-r border-purple-200">4: Sangat Baik / Mahir</th>
                      <th className="p-2.5 text-center w-20">Bobot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-200 text-[11px]">
                    {guide.rubrikPenilaian4Level.map((r, idx) => (
                      <tr key={idx} className="hover:bg-purple-50/50">
                        <td className="p-2.5 font-bold text-purple-950 border-r border-purple-200">
                          {r.aspek}
                        </td>
                        <td className="p-2.5 text-slate-600 border-r border-purple-200">
                          {r.skor1_perluBimbingan}
                        </td>
                        <td className="p-2.5 text-slate-600 border-r border-purple-200">
                          {r.skor2_cukup}
                        </td>
                        <td className="p-2.5 text-slate-700 border-r border-purple-200">
                          {r.skor3_baik}
                        </td>
                        <td className="p-2.5 text-slate-900 font-medium border-r border-purple-200">
                          {r.skor4_mahir}
                        </td>
                        <td className="p-2.5 text-center font-bold text-purple-900">
                          {r.bobotNilai} Poin
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-purple-100/70 font-extrabold text-purple-950">
                      <td colSpan={5} className="p-2.5 text-right border-r border-purple-200">
                        TOTAL BOBOT SKOR ANALITIK:
                      </td>
                      <td className="p-2.5 text-center text-purple-900">
                        {totalRubricScore} Poin
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                *Nilai hasil penskoran langsung disinkronkan ke Buku Nilai KelasMerdeka untuk kode capaian {guide.mappedGradebookTpId}.
              </p>
            </div>
          </div>
        ) : (
          /* Khusus Versi Siswa: Lembar Penilaian Diri & Adab Berkelompok */
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              D. Lembar Penilaian Diri & Adab Berkelompok
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase">
                  <tr>
                    <th className="p-2 text-center w-10 border-r border-slate-200">No</th>
                    <th className="p-2 border-r border-slate-200">Pernyataan Sikap & Pembiasaan Islami</th>
                    <th className="p-2 text-center w-20 border-r border-slate-200">Ya</th>
                    <th className="p-2 text-center w-20">Tidak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  <tr>
                    <td className="p-2 text-center font-bold border-r border-slate-200">1</td>
                    <td className="p-2 border-r border-slate-200">Saya mengawali pengerjaan LKPD dengan membaca Basmalah dan doa bersama.</td>
                    <td className="p-2 text-center border-r border-slate-200">☐</td>
                    <td className="p-2 text-center">☐</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center font-bold border-r border-slate-200">2</td>
                    <td className="p-2 border-r border-slate-200">Saya mendengarkan pendapat rekan dan tidak memotong pembicaraan.</td>
                    <td className="p-2 text-center border-r border-slate-200">☐</td>
                    <td className="p-2 text-center">☐</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center font-bold border-r border-slate-200">3</td>
                    <td className="p-2 border-r border-slate-200">Saya mencatat data simulasi dengan jujur, teliti, dan bersikap itqan.</td>
                    <td className="p-2 text-center border-r border-slate-200">☐</td>
                    <td className="p-2 text-center">☐</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center font-bold border-r border-slate-200">4</td>
                    <td className="p-2 border-r border-slate-200">Saya ikut merapikan kembali media kartu sebelum pembelajaran ditutup.</td>
                    <td className="p-2 text-center border-r border-slate-200">☐</td>
                    <td className="p-2 text-center">☐</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
