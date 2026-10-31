"use client";

import React, { useState } from "react";
import { 
  Calculator, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import { mockClasses, mockStudents, mockTPs } from "@/lib/mockData";

export default function GradesPage() {
  const [selectedClassId, setSelectedClassId] = useState(mockClasses[0].id);
  const activeClass = mockClasses.find(c => c.id === selectedClassId) || mockClasses[0];

  // State nilai siswa: studentId -> { [tpId]: score }
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({
    "std-1": { "tp-1": 85, "tp-2": 88, "tp-3": 90 },
    "std-2": { "tp-1": 92, "tp-2": 95, "tp-3": 90 },
    "std-3": { "tp-1": 65, "tp-2": 70, "tp-3": 68 }, // Perlu remedial
    "std-4": { "tp-1": 78, "tp-2": 82, "tp-3": 80 },
    "std-5": { "tp-1": 70, "tp-2": 76, "tp-3": 75 }, // TP-1 perlu remedial
  });

  const [notification, setNotification] = useState<string | null>(null);

  const handleScoreChange = (studentId: string, tpId: string, val: string) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [tpId]: num
      }
    }));
    setNotification("Nilai tersimpan otomatis!");
    setTimeout(() => setNotification(null), 2000);
  };

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

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Ekspor ke Excel (.xlsx)
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Download className="h-4 w-4" /> Download Format e-Rapor
          </button>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800">
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
            className="text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50"
          >
            {mockClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name} • {c.subjectName}</option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Tuntas ($\ge$ KKTP 75)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-600">Perlu Remedial (&lt; 75)</span>
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
                <th className="py-3 px-4 text-center w-24" rowSpan={2}>NISN</th>
                {mockTPs.map(tp => (
                  <th key={tp.id} className="py-2 px-3 text-center border-l border-slate-200 bg-slate-100/60" colSpan={1}>
                    <div className="text-blue-700 font-extrabold">{tp.code}</div>
                    <div className="text-[10px] font-medium text-slate-400 capitalize">{tp.scope}</div>
                    <div className="text-[9px] text-emerald-700 font-semibold mt-0.5">KKTP: {tp.kktpThreshold}</div>
                  </th>
                ))}
                <th className="py-3 px-4 text-center border-l border-slate-200 w-24" rowSpan={2}>Poin Bonus</th>
                <th className="py-3 px-4 text-center border-l border-slate-200 w-24" rowSpan={2}>Rata-rata</th>
                <th className="py-3 px-4 text-center border-l border-slate-200 w-32" rowSpan={2}>Status Rapor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockStudents.map((student, idx) => {
                const studentScores = scores[student.id] || {};
                const scoreValues = mockTPs.map(tp => studentScores[tp.id] || 0);
                const avgRaw = scoreValues.reduce((a, b) => a + b, 0) / (scoreValues.length || 1);
                const finalAvg = Math.min(100, Math.round(avgRaw + student.bonusPoints));
                const hasRemedial = mockTPs.some(tp => (studentScores[tp.id] || 0) < tp.kktpThreshold);

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{student.fullName}</td>
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500">{student.nisn}</td>
                    
                    {/* Score Cells per TP */}
                    {mockTPs.map(tp => {
                      const val = studentScores[tp.id] ?? "";
                      const numVal = Number(val);
                      const isBelow = numVal > 0 && numVal < tp.kktpThreshold;

                      return (
                        <td key={tp.id} className="py-2 px-3 text-center border-l border-slate-100">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={val}
                            onChange={(e) => handleScoreChange(student.id, tp.id, e.target.value)}
                            className={`w-16 text-center font-bold text-xs p-1.5 rounded-lg border transition focus:outline-none focus:ring-2 ${
                              isBelow
                                ? "bg-rose-50 text-rose-700 border-rose-300 focus:ring-rose-400"
                                : "bg-white text-slate-900 border-slate-200 focus:ring-blue-400"
                            }`}
                          />
                        </td>
                      );
                    })}

                    {/* Bonus Points */}
                    <td className="py-3 px-4 text-center border-l border-slate-100">
                      <span className="font-bold text-purple-700 text-xs bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        +{student.bonusPoints}
                      </span>
                    </td>

                    {/* Average */}
                    <td className="py-3 px-4 text-center border-l border-slate-100 font-mono font-bold text-slate-900">
                      {finalAvg}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center border-l border-slate-100">
                      {hasRemedial ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700 border border-rose-200">
                          <AlertTriangle className="h-3 w-3" /> Perlu Remedial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Tercapai Penuh
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

