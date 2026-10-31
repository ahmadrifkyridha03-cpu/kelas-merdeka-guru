"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  HelpCircle,
  FileCheck,
  Award
} from "lucide-react";
import * as XLSX from "xlsx";
import { useAppStore } from "@/lib/store";
import { calculateStudentAverage, evaluateScoreAgainstThreshold } from "@/lib/kktp";
import { downloadFile } from "@/lib/dapodik";

export default function GradesPage() {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    students,
    tps,
    scores,
    setScore,
  } = useAppStore();

  const [isClient, setIsClient] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId, setSelectedClassId]);

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Filter TPs for current class/subject
  const classTps = tps.filter(
    (tp) => !tp.classId || tp.classId === selectedClassId
  );
  const displayedTps = classTps.length > 0 ? classTps : tps;

  const handleScoreChange = (studentId: string, tpId: string, val: string) => {
    if (val.trim() === "") {
      // Allow clearing score
      setScore(studentId, tpId, 0); // or delete/empty
      return;
    }
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setScore(studentId, tpId, num);
    setNotification("Nilai tersimpan otomatis ke penyimpanan reaktif!");
    setTimeout(() => setNotification(null), 2000);
  };

  // Ekspor Matrix Nilai ke Excel (.xlsx)
  const handleExportExcel = () => {
    if (!activeClass || classStudents.length === 0) {
      alert("Tidak ada data siswa untuk diekspor!");
      return;
    }

    const headers: string[] = [
      "No",
      "Nama Lengkap Siswa",
      "NISN",
      ...displayedTps.map((tp) => `${tp.code} (${tp.scope}) [KKTP: ${tp.kktpThreshold}]`),
      "Poin Bonus",
      "Rata-rata Murni",
      "Nilai Akhir",
      "Status Ketercapaian",
    ];

    const rows: (string | number)[][] = classStudents.map((student, idx) => {
      const studentScores = scores[student.id] || {};
      const scoreValues = displayedTps.map((tp) => studentScores[tp.id]);
      const avgData = calculateStudentAverage(scoreValues);

      const finalScore =
        avgData.average !== null
          ? Math.min(100, Math.round(avgData.average + (student.bonusPoints || 0)))
          : "-";

      // Remedial calculation strictly on assessed TPs
      const assessedBelowThreshold = displayedTps.filter((tp) => {
        const val = studentScores[tp.id];
        return typeof val === "number" && !isNaN(val) && val < tp.kktpThreshold;
      });

      let status = "Belum Dinilai";
      if (avgData.hasScores) {
        if (assessedBelowThreshold.length > 0) {
          status = `Perlu Remedial (${assessedBelowThreshold.length} TP)`;
        } else {
          status = (finalScore as number) >= 85 ? "Tuntas (Pengayaan)" : "Tuntas";
        }
      }

      return [
        idx + 1,
        student.fullName,
        student.nisn,
        ...displayedTps.map((tp) => {
          const val = studentScores[tp.id];
          return typeof val === "number" ? val : "-";
        }),
        student.bonusPoints || 0,
        avgData.average !== null ? avgData.average : "-",
        finalScore,
        status,
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Format column widths
    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 16 },
      ...displayedTps.map(() => ({ wch: 18 })),
      { wch: 12 },
      { wch: 16 },
      { wch: 14 },
      { wch: 22 },
    ];

    const workbook = XLSX.utils.book_new();
    const sheetName = (activeClass?.name || "Buku_Nilai").replace(/[:\\/?*[\]]/g, "_").slice(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    downloadFile(
      excelBuffer,
      `Buku_Nilai_${activeClass.name.replace(/\s+/g, "_")}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    setNotification("Buku nilai berhasil diekspor ke Excel (.xlsx)!");
    setTimeout(() => setNotification(null), 3000);
  };

  // Download Format e-Rapor Kemendikbudristek
  const handleExportERapor = () => {
    if (!activeClass || classStudents.length === 0) {
      alert("Tidak ada data siswa untuk diekspor!");
      return;
    }

    const titleRows = [
      ["LEMBAR RAPOR CAPAIAN KOMPETENSI (FORMAT e-RAPOR KURIKULUM MERDEKA)"],
      [`Mata Pelajaran: ${activeClass.subjectName}`, `Fase: ${activeClass.fase}`, `Kelas / Rombel: ${activeClass.name}`],
      [`Tahun Ajaran: 2026/2027`, `Semester: 1 (Ganjil)`, `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`],
      [], // blank line
    ];

    const tableHeaders = [
      "No",
      "NISN",
      "NIS",
      "Nama Peserta Didik",
      "Nilai Akhir Rapor",
      "Predikat",
      "Capaian Kompetensi Tertinggi (Kekuatan)",
      "Capaian Kompetensi yang Perlu Bimbingan (Intervensi)",
    ];

    const dataRows = classStudents.map((student, idx) => {
      const studentScores = scores[student.id] || {};
      const scoreValues = displayedTps.map((tp) => studentScores[tp.id]);
      const avgData = calculateStudentAverage(scoreValues);

      const finalScore =
        avgData.average !== null
          ? Math.min(100, Math.round(avgData.average + (student.bonusPoints || 0)))
          : null;

      // Identify highest mastered TP and lowest TP needing intervention
      let highestTpDesc = "Belum ada asesmen yang dicapai";
      let lowestTpDesc = "Tidak ada kompetensi yang memerlukan bimbingan khusus";

      const assessedTpsWithScore = displayedTps
        .map((tp) => ({
          tp,
          score: studentScores[tp.id],
        }))
        .filter((item): item is { tp: (typeof displayedTps)[0]; score: number } => 
          typeof item.score === "number" && !isNaN(item.score)
        );

      if (assessedTpsWithScore.length > 0) {
        assessedTpsWithScore.sort((a, b) => b.score - a.score);
        const highest = assessedTpsWithScore[0];
        const lowest = assessedTpsWithScore[assessedTpsWithScore.length - 1];

        if (highest.score >= highest.tp.kktpThreshold) {
          highestTpDesc = `Menunjukkan penguasaan sangat baik dalam ${highest.tp.description.toLowerCase()} (${highest.tp.code})`;
        } else {
          highestTpDesc = `Cukup menguasai ${highest.tp.description.toLowerCase()}`;
        }

        if (lowest.score < lowest.tp.kktpThreshold) {
          lowestTpDesc = `Perlu bimbingan dan intervensi remedial dalam ${lowest.tp.description.toLowerCase()} (${lowest.tp.code})`;
        }
      }

      let predikat = "-";
      if (finalScore !== null) {
        if (finalScore >= 88) predikat = "A (Sangat Baik)";
        else if (finalScore >= 76) predikat = "B (Baik)";
        else if (finalScore >= 65) predikat = "C (Cukup)";
        else predikat = "D (Perlu Bimbingan)";
      }

      return [
        idx + 1,
        student.nisn,
        student.nis || "-",
        student.fullName,
        finalScore !== null ? finalScore : "-",
        predikat,
        highestTpDesc,
        lowestTpDesc,
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([...titleRows, tableHeaders, ...dataRows]);

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 12 },
      { wch: 30 },
      { wch: 18 },
      { wch: 18 },
      { wch: 45 },
      { wch: 45 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Format_e-Rapor");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    downloadFile(
      excelBuffer,
      `e-Rapor_${activeClass.name.replace(/\s+/g, "_")}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    setNotification("Berkas format e-Rapor siap unduh!");
    setTimeout(() => setNotification(null), 3000);
  };

  if (!isClient || !activeClass) {
    return <div className="p-8 text-center text-slate-400">Memuat buku nilai...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md mb-2">
            <Calculator className="h-3.5 w-3.5" /> Modul 2: Buku Nilai & Ketercapaian TP
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Input Nilai Asesmen Terikat KKTP
          </h1>
          <p className="text-sm text-slate-500">
            Setiap kolom nilai terikat ke ID TP permanen. Ketercapaian dihitung otomatis dari ambang KKTP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Ekspor ke Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={handleExportERapor}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Download className="h-4 w-4" /> Download Format e-Rapor
          </button>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Class Selector & Legend */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Pilih Rombel:</label>
          <select 
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500/20"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} • {c.subjectName} (Fase {c.fase})
              </option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Tuntas (Skor &ge; KKTP)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-600">Perlu Remedial (Skor &lt; KKTP)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-slate-300"></span>
            <span className="text-slate-600">Belum Dinilai (Abaikan 0)</span>
          </div>
        </div>
      </div>

      {/* Spreadsheet Matrix Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center" rowSpan={2}>No</th>
                <th className="py-3 px-4 min-w-[200px]" rowSpan={2}>Nama Lengkap Siswa</th>
                <th className="py-3 px-4 text-center w-28" rowSpan={2}>NISN</th>
                {displayedTps.map((tp) => (
                  <th key={tp.id} className="py-2 px-3 text-center border-l border-slate-200 bg-slate-100/60" colSpan={1}>
                    <div className="text-blue-700 font-extrabold">{tp.code}</div>
                    <div className="text-[10px] font-medium text-slate-500 capitalize truncate max-w-[140px]" title={tp.scope}>
                      {tp.scope}
                    </div>
                    <div className="text-[9px] text-emerald-700 font-semibold mt-0.5">
                      Ambang: {tp.kktpThreshold}
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-center border-l border-slate-200 w-24" rowSpan={2}>Poin Bonus</th>
                <th className="py-3 px-4 text-center border-l border-slate-200 w-24" rowSpan={2}>Rata-rata</th>
                <th className="py-3 px-4 text-center border-l border-slate-200 w-32" rowSpan={2}>Status Rapor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={displayedTps.length + 6} className="py-8 text-center text-slate-400">
                    Belum ada siswa di rombel ini. Buka menu &quot;Kelas &amp; Siswa&quot; untuk menambahkan data siswa.
                  </td>
                </tr>
              ) : (
                classStudents.map((student, idx) => {
                  const studentScores = scores[student.id] || {};
                  const scoreValues = displayedTps.map((tp) => studentScores[tp.id]);
                  const avgData = calculateStudentAverage(scoreValues);

                  const finalAvg =
                    avgData.average !== null
                      ? Math.min(100, Math.round(avgData.average + (student.bonusPoints || 0)))
                      : null;

                  // Remedial evaluation strictly on assessed TPs
                  const assessedTpsNeedingRemedial = displayedTps.filter((tp) => {
                    const val = studentScores[tp.id];
                    return typeof val === "number" && !isNaN(val) && val < tp.kktpThreshold;
                  });

                  const hasRemedial = assessedTpsNeedingRemedial.length > 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{student.fullName}</td>
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500">{student.nisn}</td>
                      
                      {/* Score Cells per TP */}
                      {displayedTps.map((tp) => {
                        const rawVal = studentScores[tp.id];
                        const hasValue = typeof rawVal === "number" && !isNaN(rawVal);
                        const isBelow = hasValue && rawVal < tp.kktpThreshold;

                        return (
                          <td key={tp.id} className="py-2 px-3 text-center border-l border-slate-100">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={hasValue ? rawVal : ""}
                              placeholder="-"
                              onChange={(e) => handleScoreChange(student.id, tp.id, e.target.value)}
                              className={`w-16 text-center font-bold text-xs p-1.5 rounded-lg border transition focus:outline-none focus:ring-2 ${
                                !hasValue
                                  ? "bg-slate-50/50 text-slate-400 border-slate-200 placeholder:text-slate-300 focus:ring-blue-400"
                                  : isBelow
                                  ? "bg-rose-50 text-rose-700 border-rose-300 focus:ring-rose-400"
                                  : "bg-emerald-50/40 text-emerald-900 border-emerald-200 focus:ring-emerald-400"
                              }`}
                            />
                          </td>
                        );
                      })}

                      {/* Bonus Points */}
                      <td className="py-3 px-4 text-center border-l border-slate-100">
                        <span className="font-bold text-purple-700 text-xs bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-flex items-center gap-0.5">
                          <Sparkles className="h-3 w-3" />
                          +{student.bonusPoints || 0}
                        </span>
                      </td>

                      {/* Average (Calculated strictly on assessed TPs) */}
                      <td className="py-3 px-4 text-center border-l border-slate-100 font-mono font-bold text-slate-900">
                        {finalAvg !== null ? (
                          <span>{finalAvg}</span>
                        ) : (
                          <span className="text-slate-400 font-normal italic">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center border-l border-slate-100">
                        {!avgData.hasScores ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                            <HelpCircle className="h-3 w-3 text-slate-400" /> Belum Dinilai
                          </span>
                        ) : hasRemedial ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700 border border-rose-200">
                            <AlertTriangle className="h-3 w-3" /> Remedial ({assessedTpsNeedingRemedial.length} TP)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Tercapai
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
