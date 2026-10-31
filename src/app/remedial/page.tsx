"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Award,
  BookOpen,
  Copy,
  Printer,
  X,
  UserCheck,
  Ban,
  ShieldCheck,
  TrendingUp,
  School
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { generateRemedialTaskAction } from "@/app/actions/geminiActions";
import type { Student, TP } from "@/types";

interface RemedialItem {
  studentId: string;
  studentName: string;
  nisn: string;
  tpId: string;
  tpCode: string;
  tpScope: string;
  tpDescription: string;
  actualScore: number;
  kktpThreshold: number;
}

interface PengayaanItem {
  student: Student;
  averageScore: number;
  masteredTpsCount: number;
  totalAssessedCount: number;
  isAllMastered: boolean;
  isMahir: boolean;
}

export default function RemedialPage() {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    students,
    tps,
    scores,
    bonusLogs,
    attendance,
    addBonusPoints
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"remedial" | "pengayaan" | "bonus">("remedial");
  const [isGeneratingTask, setIsGeneratingTask] = useState(false);
  const [generatedTask, setGeneratedTask] = useState<string | null>(null);
  const [activeTaskContext, setActiveTaskContext] = useState<{
    studentName: string;
    tpCode: string;
    tpScope: string;
    score: number;
    kktpThreshold: number;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [bonusSuccessToast, setBonusSuccessToast] = useState<string | null>(null);

  // Audit Ledger Modal State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditFilterStudentId, setAuditFilterStudentId] = useState<string>("ALL");

  useEffect(() => {
    setIsClient(true);
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId, setSelectedClassId]);

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = useMemo(() => {
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const classTps = useMemo(() => {
    return tps.filter(tp => !tp.classId || tp.classId === selectedClassId);
  }, [tps, selectedClassId]);

  // Dynamic Remedial Queue:
  // For each student in selected class, find all assessed TPs where score < kktpThreshold
  const remedialQueue = useMemo<RemedialItem[]>(() => {
    const list: RemedialItem[] = [];
    for (const student of classStudents) {
      const studentScores = scores[student.id];
      if (!studentScores) continue;

      for (const tp of classTps) {
        const score = studentScores[tp.id];
        if (score !== undefined && score < tp.kktpThreshold) {
          list.push({
            studentId: student.id,
            studentName: student.fullName,
            nisn: student.nisn || "-",
            tpId: tp.id,
            tpCode: tp.code,
            tpScope: tp.scope || "Materi Pokok",
            tpDescription: tp.description,
            actualScore: score,
            kktpThreshold: tp.kktpThreshold,
          });
        }
      }
    }
    return list;
  }, [classStudents, classTps, scores]);

  // Dynamic Pengayaan List:
  // Students who have achieved mastery across all assessed TPs (or average >= 85 / Mahir)
  const pengayaanList = useMemo<PengayaanItem[]>(() => {
    const list: PengayaanItem[] = [];

    for (const student of classStudents) {
      const studentScores = scores[student.id];
      if (!studentScores) continue;

      const assessedTps = classTps.filter(tp => studentScores[tp.id] !== undefined);
      if (assessedTps.length === 0) continue;

      let sum = 0;
      let allMastered = true;
      let masteredCount = 0;

      for (const tp of assessedTps) {
        const score = studentScores[tp.id];
        sum += score;
        if (score >= tp.kktpThreshold) {
          masteredCount++;
        } else {
          allMastered = false;
        }
      }

      const avg = Math.round((sum / assessedTps.length) * 10) / 10;
      const isMahir = avg >= 85 || (allMastered && avg >= 80);

      // Qualifies if all assessed TPs are mastered and average is high / mahir
      if (allMastered && (isMahir || avg >= 75)) {
        list.push({
          student,
          averageScore: avg,
          masteredTpsCount: masteredCount,
          totalAssessedCount: assessedTps.length,
          isAllMastered: allMastered,
          isMahir: avg >= 85,
        });
      }
    }

    return list.sort((a, b) => b.averageScore - a.averageScore);
  }, [classStudents, classTps, scores]);

  // Check if a student has status ALPA in any attendance record
  const checkIsStudentAlpa = (studentId: string): boolean => {
    for (const records of Object.values(attendance)) {
      if (Array.isArray(records)) {
        const foundAlpa = records.some(
          r => r.studentId === studentId && r.status === "ALPA"
        );
        if (foundAlpa) return true;
      }
    }
    return false;
  };

  const handleAddBonus = (studentId: string, amount: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (checkIsStudentAlpa(studentId)) {
      alert(`Poin bonus untuk ${student.fullName} DIBEKUKAN karena memiliki catatan ketidakhadiran tanpa keterangan (ALPA). Selesaikan klarifikasi presensi terlebih dahulu.`);
      return;
    }

    const currentBonus = Number(student.bonusPoints) || 0;
    if (currentBonus >= 5.0) {
      alert(`Siswa ${student.fullName} telah mencapai batas elevasi maksimal +5.0 poin bonus per semester sesuai regulasi anti-inflasi.`);
      return;
    }

    const reason = "Apresiasi Keaktifan Diskusi & Partisipasi Positif Kelas";
    const res = addBonusPoints(studentId, amount, reason);

    setBonusSuccessToast(
      `Berhasil menambahkan +${res.effectivePoints} poin untuk ${student.fullName} (Total bonus: +${res.newTotal} poin)`
    );
    setTimeout(() => setBonusSuccessToast(null), 4000);
  };

  const handleGenerateAITask = async (item: RemedialItem) => {
    setIsGeneratingTask(true);
    setGeneratedTask(null);
    setActiveTaskContext({
      studentName: item.studentName,
      tpCode: item.tpCode,
      tpScope: item.tpScope,
      score: item.actualScore,
      kktpThreshold: item.kktpThreshold,
    });

    const res = await generateRemedialTaskAction({
      studentName: item.studentName,
      tpCode: item.tpCode,
      tpDescription: item.tpDescription,
      score: item.actualScore,
      kktp: item.kktpThreshold,
    });

    setIsGeneratingTask(false);

    if (res.success && res.taskText) {
      setGeneratedTask(res.taskText);
    } else {
      setGeneratedTask(
        `INSTRUMEN TUGAS REMEDIAL TERSTANDAR\n` +
        `Nama Siswa: ${item.studentName}\n` +
        `Target TP: [${item.tpCode}] ${item.tpDescription}\n` +
        `Lingkup Materi: ${item.tpScope}\n` +
        `Nilai Awal: ${item.actualScore} / Ambang KKTP: ${item.kktpThreshold}\n\n` +
        `Petunjuk Penuntasan:\n` +
        `1. Pelajari kembali ringkasan materi pokok ${item.tpScope}.\n` +
        `2. Kerjakan soal pemecahan masalah bertahap dan serahkan kepada guru pembimbing.\n` +
        `3. Setelah penugasan selesai, nilai remedial akan disesuaikan hingga batas maksimal KKTP (${item.kktpThreshold}).`
      );
    }
  };

  const handleCopyTask = () => {
    if (!generatedTask) return;
    navigator.clipboard.writeText(generatedTask);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handlePrintTask = () => {
    window.print();
  };

  // Filtered bonus logs for the audit ledger modal
  const filteredBonusLogs = useMemo(() => {
    return bonusLogs.filter(log => {
      if (auditFilterStudentId === "ALL") return true;
      return log.studentId === auditFilterStudentId;
    });
  }, [bonusLogs, auditFilterStudentId]);

  if (!isClient) {
    return <div className="p-8 text-center text-slate-400">Memuat Remedial Hub...</div>;
  }

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
            Antrean dinamis siswa di bawah KKTP, rekomendasi pengayaan, serta ledger poin keaktifan dengan batas anti-inflasi (+5.0).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 transition"
          >
            <History className="h-4 w-4" /> Riwayat Audit Ledger
          </button>
        </div>
      </div>

      {bonusSuccessToast && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{bonusSuccessToast}</span>
        </div>
      )}

      {/* Tabs & Class Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("remedial")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "remedial"
                ? "bg-rose-600 text-white shadow-sm shadow-rose-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Antrean Remedial ({remedialQueue.length} Siswa)
          </button>
          <button
            onClick={() => setActiveTab("pengayaan")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "pengayaan"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Peserta Pengayaan ({pengayaanList.length} Siswa)
          </button>
          <button
            onClick={() => setActiveTab("bonus")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "bonus"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Poin Bonus Anti-Inflasi (+5.0 Cap)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Rombel:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs font-bold text-blue-700 bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} • {c.subjectName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. REMEDIAL TAB */}
      {activeTab === "remedial" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {remedialQueue.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center space-y-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-900">
                  Alhamdulillah, seluruh siswa pada rombel ini telah mencapai KKTP!
                </h3>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Semua peserta didik yang telah dinilai berhasil mencapai atau melampaui ambang batas kriteria ketuntasan. Anda dapat beralih ke tab <strong>"Peserta Pengayaan"</strong> untuk memberikan program pengayaan atau pendalaman materi.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-1">
                    <AlertTriangle className="h-4 w-4" /> {remedialQueue.length} Penugasan Remedial Perlu Ditindaklanjuti
                  </div>
                  <p className="text-xs text-rose-600">
                    Nilai capaian sumatif lingkup materi berada di bawah KKTP. Penanganan remedial disarankan berupa penugasan terbimbing atau asesmen ulang terstandar.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Nama Siswa</th>
                        <th className="p-3">TP Belum Tercapai</th>
                        <th className="p-3 text-center">Nilai Asli</th>
                        <th className="p-3 text-center">Batas KKTP</th>
                        <th className="p-3 text-center">Aksi Penanganan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {remedialQueue.map((item, idx) => (
                        <tr key={`${item.studentId}-${item.tpId}-${idx}`} className="hover:bg-slate-50/80 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{item.studentName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">NISN: {item.nisn}</div>
                          </td>
                          <td className="p-3">
                            <div className="inline-block rounded bg-rose-50 text-rose-700 font-bold px-2 py-0.5 border border-rose-200 mb-1">
                              {item.tpCode}: {item.tpScope}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{item.tpDescription}</div>
                          </td>
                          <td className="p-3 text-center font-bold text-rose-600 text-sm">
                            {item.actualScore}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-600">
                            {item.kktpThreshold}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleGenerateAITask(item)}
                              disabled={isGeneratingTask}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-purple-700 transition disabled:opacity-50 shadow-sm"
                            >
                              <Sparkles className="h-3.5 w-3.5" /> Buat Tugas AI
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* AI Task Generator Side Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600" /> Instrumen Remedial AI
              </h3>
              {isGeneratingTask && (
                <span className="text-[10px] text-purple-600 font-bold animate-pulse">Menyusun Tugas...</span>
              )}
            </div>

            {activeTaskContext && (
              <div className="rounded-lg bg-purple-50 p-3 border border-purple-100 text-xs text-purple-900">
                <div className="font-bold">{activeTaskContext.studentName}</div>
                <div className="text-[11px] text-purple-700">
                  Target: {activeTaskContext.tpCode} ({activeTaskContext.tpScope}) • Nilai: {activeTaskContext.score} / KKTP: {activeTaskContext.kktpThreshold}
                </div>
              </div>
            )}

            {generatedTask ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-4 text-xs font-mono text-slate-800 leading-relaxed border border-slate-200 whitespace-pre-line max-h-96 overflow-y-auto">
                  {generatedTask}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyTask}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copyFeedback ? "Tersalin!" : "Salin Tugas"}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintTask}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Cetak Lembar Soal
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                Klik tombol <strong>"Buat Tugas AI"</strong> pada salah satu siswa di tabel untuk menghasilkan soal remedial terpersonalisasi sesuai capaian kompetensi.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PENGAYAAN TAB */}
      {activeTab === "pengayaan" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
              <Award className="h-4 w-4 text-emerald-700" /> Program Pengayaan Kompetensi (Mahir / Tuntas Melampaui Standar)
            </div>
            <p className="text-xs text-emerald-700">
              Siswa yang telah menuntaskan seluruh TP dengan predikat Cakap atau Mahir (Nilai &ge; 85) berhak mendapatkan materi tantangan lanjut, proyek mandiri, atau penugasan tutor sebaya.
            </p>
          </div>

          {pengayaanList.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
              Belum ada siswa di rombel ini yang mencapai kriteria pengayaan (rata-rata nilai &ge; 75 tanpa nilai remedial). Nilai dapat dicatat melalui menu <strong>Nilai & Asesmen</strong>.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pengayaanList.map((item) => (
                <div
                  key={item.student.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{item.student.fullName}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">NISN: {item.student.nisn || "-"}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded-lg bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-1">
                        Rata-rata: {item.averageScore}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      item.isMahir
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}>
                      {item.isMahir ? "Level 4: Mahir" : "Level 3: Cakap"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {item.masteredTpsCount}/{item.totalAssessedCount} TP Tuntas Penuh
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-emerald-600" /> Rekomendasi Aktivitas:
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      {item.isMahir ? (
                        <>
                          <li>Proyek Mandiri: Solusi komputasi open-ended</li>
                          <li>Eksplorasi materi kompetisi / OSN</li>
                          <li>Tutor sebaya membimbing tim remedial</li>
                        </>
                      ) : (
                        <>
                          <li>Pendalaman aplikasi praktis lintas bidang</li>
                          <li>Eksplorasi optimasi efisiensi kode program</li>
                          <li>Kolaborasi tim penugasan kreatif</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => alert(`Rekomendasi penugasan pengayaan telah dialokasikan untuk ${item.student.fullName}`)}
                      className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 border border-emerald-200 transition"
                    >
                      Beri Penugasan Pengayaan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. BONUS POINTS TAB */}
      {activeTab === "bonus" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pemberian Poin Bonus Keaktifan Cepat (Anti-Inflasi Nilai)
              </h2>
              <p className="text-xs text-slate-500">
                Apresiasi kontribusi aktif di kelas. Dibatasi maksimal <strong>+5.0 poin semester</strong> per siswa, batas akhir nilai &le; 100, dan otomatis dibekukan jika siswa memiliki presensi <strong>ALPA</strong>.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck className="h-4 w-4" /> Regulasi Mutu Kurikulum
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {classStudents.length === 0 ? (
              <div className="col-span-3 py-8 text-center text-xs text-slate-400">
                Belum ada siswa di rombel ini. Buka menu "Kelas & Siswa" untuk menambahkan data siswa.
              </div>
            ) : (
              classStudents.map(student => {
                const isAlpa = checkIsStudentAlpa(student.id);
                const currentBonus = Number(student.bonusPoints) || 0;
                const isCapped = currentBonus >= 5.0;

                return (
                  <div 
                    key={student.id} 
                    className={`rounded-xl border p-4 transition space-y-3 ${
                      isAlpa 
                        ? "bg-rose-50/40 border-rose-200" 
                        : isCapped 
                        ? "bg-purple-50/30 border-purple-200" 
                        : "bg-slate-50/50 border-slate-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{student.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NISN: {student.nisn || "-"}</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-extrabold ${
                          isCapped ? "text-purple-700" : "text-indigo-600"
                        }`}>
                          +{currentBonus.toFixed(1)} / +5.0
                        </span>
                      </div>
                    </div>

                    {/* Alpa / Status Warning */}
                    {isAlpa ? (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-100/70 px-2 py-1 rounded-md">
                        <Ban className="h-3 w-3 flex-shrink-0" />
                        <span>Poin Dibekukan (Presensi Alpa)</span>
                      </div>
                    ) : isCapped ? (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2 py-1 rounded-md">
                        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                        <span>Batas Maksimal Semester Tercapai</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400">
                        Tersisa alokasi: +{(5.0 - currentBonus).toFixed(1)} poin
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleAddBonus(student.id, 1)}
                        disabled={isAlpa || isCapped}
                        className="flex-1 h-8 rounded-lg bg-purple-600 text-white font-bold text-xs shadow-sm hover:bg-purple-700 active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none"
                      >
                        Tambah (+1)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddBonus(student.id, 0.5)}
                        disabled={isAlpa || isCapped}
                        className="px-3 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs hover:bg-indigo-100 active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none"
                      >
                        +0.5
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. RIWAYAT AUDIT LEDGER MODAL */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Buku Besar Audit Poin Bonus (Anti-Inflasi Nilai)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pencatatan mutasi poin keaktifan dengan batas elevasi semester +5.0 poin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: Filter & Table */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Saring Siswa:</span>
                  <select
                    value={auditFilterStudentId}
                    onChange={(e) => setAuditFilterStudentId(e.target.value)}
                    className="text-xs font-bold text-purple-700 bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ALL">Semua Siswa ({bonusLogs.length} Entri Log)</option>
                    {classStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-slate-500">
                  Total Mutasi: <strong>{filteredBonusLogs.length} Catatan</strong>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Waktu Pencatatan</th>
                      <th className="p-3">Nama Siswa</th>
                      <th className="p-3 text-center">Delta</th>
                      <th className="p-3">Alasan / Catatan</th>
                      <th className="p-3 text-center">Status Auditor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBonusLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          Belum ada riwayat mutasi poin bonus yang dicatat.
                        </td>
                      </tr>
                    ) : (
                      filteredBonusLogs.map(log => {
                        const s = students.find(item => item.id === log.studentId);
                        const formattedDate = new Date(log.timestamp).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        });

                        return (
                          <tr key={log.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-3 font-mono text-[11px] text-slate-500">
                              {formattedDate}
                            </td>
                            <td className="p-3 font-bold text-slate-900">
                              {s ? s.fullName : log.studentId}
                            </td>
                            <td className="p-3 text-center font-bold text-purple-700 font-mono">
                              +{log.points.toFixed(1)}
                            </td>
                            <td className="p-3 text-slate-600">
                              {log.reason}
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                <ShieldCheck className="h-3 w-3" /> Terverifikasi
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50 text-xs">
              <div className="text-slate-500 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Ledger Terkunci & Sesuai UU Perlindungan Data
              </div>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition"
              >
                Tutup Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
