"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  CalendarCheck2, 
  CheckCircle2, 
  Clock, 
  Save, 
  Users, 
  Calendar,
  AlertCircle,
  School,
  CheckCheck
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { AttendanceStatus, AttendanceRecord } from "@/types";

export default function AttendancePage() {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    students,
    attendance,
    saveAttendance
  } = useAppStore();

  const [meetingNumber, setMeetingNumber] = useState<number>(1);
  const [date, setDate] = useState<string>("2026-08-04");
  const [topic, setTopic] = useState<string>("Pengenalan Strategi Algoritma & Bubble Sort");
  const [journal, setJournal] = useState<string>("Siswa sangat antusias saat simulasi menggunakan kartu angka.");
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  const [savedNotification, setSavedNotification] = useState(false);
  const [isClient, setIsClient] = useState(false);

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

  // Synchronize attendance state when date or selectedClassId changes
  useEffect(() => {
    if (!classStudents || classStudents.length === 0) return;

    const savedRecords = attendance[date];
    const initial: Record<string, AttendanceStatus> = {};

    if (savedRecords && Array.isArray(savedRecords) && savedRecords.length > 0) {
      classStudents.forEach(s => {
        const rec = savedRecords.find(r => r.studentId === s.id);
        initial[s.id] = rec ? rec.status : "HADIR";
      });
    } else {
      classStudents.forEach(s => {
        initial[s.id] = "HADIR";
      });
    }

    setAttendanceState(initial);
  }, [date, selectedClassId, classStudents, attendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach(s => {
      updated[s.id] = "HADIR";
    });
    setAttendanceState(updated);
  };

  const handleSave = () => {
    if (!classStudents || classStudents.length === 0) return;

    const records: AttendanceRecord[] = classStudents.map(s => ({
      studentId: s.id,
      status: attendanceState[s.id] || "HADIR",
      timestamp: new Date().toISOString(),
    }));

    // Save to canonical Zustand store
    saveAttendance(date, records);

    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3500);
  };

  // Live attendance counts
  const liveCounts = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = {
      HADIR: 0,
      SAKIT: 0,
      IZIN: 0,
      ALPA: 0,
      TERLAMBAT: 0,
      DISPENSASI: 0,
    };

    classStudents.forEach(s => {
      const st = attendanceState[s.id] || "HADIR";
      counts[st] = (counts[st] || 0) + 1;
    });

    return counts;
  }, [classStudents, attendanceState]);

  if (!isClient || !activeClass) {
    return <div className="p-8 text-center text-slate-400">Memuat presensi siswa...</div>;
  }

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
            Pencatatan 6 status kehadiran per pertemuan yang tersinkronisasi otomatis dengan buku besar dan pembekuan bonus.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <CheckCheck className="h-4 w-4 text-emerald-600" />
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
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Presensi dan jurnal mengajar berhasil disimpan ke basis data terpusat!</span>
        </div>
      )}

      {/* Meeting Parameters & Class Picker */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Rombel / Kelas</label>
          <select 
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full text-xs font-bold text-blue-700 p-2.5 rounded-lg border border-slate-200 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} • {c.subjectName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Pertemuan Ke-</label>
          <select 
            value={meetingNumber}
            onChange={(e) => setMeetingNumber(Number(e.target.value))}
            className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(n => (
              <option key={n} value={n}>Pertemuan {n} ({activeClass.teachingHoursPerWeek || 3} JP)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal KBM</label>
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Materi / Topik Pertemuan</label>
          <input 
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Live Attendance Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center">
          <div className="text-[10px] font-bold uppercase text-emerald-700">Hadir (H)</div>
          <div className="text-xl font-extrabold text-emerald-800">{liveCounts.HADIR}</div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-center">
          <div className="text-[10px] font-bold uppercase text-blue-700">Sakit (S)</div>
          <div className="text-xl font-extrabold text-blue-800">{liveCounts.SAKIT}</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-center">
          <div className="text-[10px] font-bold uppercase text-amber-700">Izin (I)</div>
          <div className="text-xl font-extrabold text-amber-800">{liveCounts.IZIN}</div>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-center">
          <div className="text-[10px] font-bold uppercase text-rose-700">Alpa (A)</div>
          <div className="text-xl font-extrabold text-rose-800">{liveCounts.ALPA}</div>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 text-center">
          <div className="text-[10px] font-bold uppercase text-purple-700">Terlambat (T)</div>
          <div className="text-xl font-extrabold text-purple-800">{liveCounts.TERLAMBAT}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-100/60 p-3 text-center">
          <div className="text-[10px] font-bold uppercase text-slate-700">Dispensasi (D)</div>
          <div className="text-xl font-extrabold text-slate-800">{liveCounts.DISPENSASI}</div>
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4">Nama Lengkap Siswa</th>
              <th className="py-3 px-4 text-center w-28">NISN</th>
              <th className="py-3 px-4 text-center">Pilihan Status Presensi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classStudents.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  Belum ada siswa di rombel ini. Buka menu "Kelas & Siswa" untuk menambahkan data siswa.
                </td>
              </tr>
            ) : (
              classStudents.map((student, idx) => {
                const currentStatus = attendanceState[student.id] || "HADIR";

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-center font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{student.fullName}</td>
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500">{student.nisn || "-"}</td>
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
              })
            )}
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
