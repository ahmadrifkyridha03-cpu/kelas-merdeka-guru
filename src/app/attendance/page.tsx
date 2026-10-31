"use client";

import React, { useState } from "react";
import { 
  CalendarCheck2, 
  CheckCircle2, 
  Clock, 
  Save, 
  Users, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { mockStudents, mockClasses } from "@/lib/mockData";
import { AttendanceStatus } from "@/types";

export default function AttendancePage() {
  const [meetingNumber, setMeetingNumber] = useState(1);
  const [date, setDate] = useState("2026-08-04");
  const [topic, setTopic] = useState("Pengenalan Strategi Algoritma & Bubble Sort");
  const [journal, setJournal] = useState("Siswa sangat antusias saat simulasi menggunakan kartu angka. Bagas butuh pendampingan tambahan saat membaca instruksi tertulis.");
  
  // State presensi per siswa: studentId -> status
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({
    "std-1": "HADIR",
    "std-2": "HADIR",
    "std-3": "HADIR",
    "std-4": "HADIR",
    "std-5": "HADIR",
  });

  const [savedNotification, setSavedNotification] = useState(false);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    mockStudents.forEach(s => {
      updated[s.id] = "HADIR";
    });
    setAttendance(updated);
  };

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const statusOptions: { label: string; code: AttendanceStatus; color: string }[] = [
    { label: "Hadir", code: "HADIR", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    { label: "Sakit", code: "SAKIT", color: "bg-blue-100 text-blue-800 border-blue-300" },
    { label: "Izin", code: "IZIN", color: "bg-amber-100 text-amber-800 border-amber-300" },
    { label: "Alpa", code: "ALPA", color: "bg-rose-100 text-rose-800 border-rose-300" },
    { label: "Terlambat", code: "TERLAMBAT", color: "bg-purple-100 text-purple-800 border-purple-300" },
    { label: "Dispensasi", code: "DISPENSASI", color: "bg-slate-100 text-slate-800 border-slate-300" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
            <CalendarCheck2 className="h-3.5 w-3.5" /> Presensi & Jurnal Mengajar Harian
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Presensi Siswa & Jurnal Pembelajaran
          </h1>
          <p className="text-sm text-slate-500">
            Mencatat 6 status kehadiran per pertemuan yang langsung terhubung ke rekap jurnal guru.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Tandai Semua Hadir
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Save className="h-4 w-4" /> Simpan Presensi & Jurnal
          </button>
        </div>
      </div>

      {savedNotification && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Presensi dan jurnal mengajar berhasil disimpan ke database lokal dan cloud!</span>
        </div>
      )}

      {/* Meeting Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Pertemuan Ke-</label>
          <select 
            value={meetingNumber}
            onChange={(e) => setMeetingNumber(Number(e.target.value))}
            className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-slate-50"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <option key={n} value={n}>Pertemuan {n} (3 JP)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal KBM</label>
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Materi / Topik Pertemuan</label>
          <input 
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-slate-50"
          />
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4">Nama Lengkap Siswa</th>
              <th className="py-3 px-4 text-center w-24">NISN</th>
              <th className="py-3 px-4 text-center">Pilihan Status Presensi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockStudents.map((student, idx) => {
              const currentStatus = attendance[student.id] || "HADIR";

              return (
                <tr key={student.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 text-center font-medium text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{student.fullName}</td>
                  <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500">{student.nisn}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {statusOptions.map(opt => {
                        const isSelected = currentStatus === opt.code;
                        return (
                          <button
                            key={opt.code}
                            type="button"
                            onClick={() => handleStatusChange(student.id, opt.code)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                              isSelected
                                ? opt.color + " shadow-sm ring-1 ring-blue-500 font-bold"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Jurnal Mengajar Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase text-slate-700">
          Catatan Jurnal Mengajar & Refleksi Pertemuan
        </h3>
        <textarea
          rows={3}
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          placeholder="Tuliskan catatan kejadian pembelajaran, ketercapaian siswa, atau kendala di kelas..."
          className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>
    </div>
  );
}

