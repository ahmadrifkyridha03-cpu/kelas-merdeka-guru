"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  Calculator, 
  Sparkles, 
  FileSpreadsheet, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  GraduationCap, 
  FileText,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { ClassSection, Student, TujuanPembelajaran } from "@/types";
import { getSavedClasses, getSavedStudents, getSavedTPs } from "@/lib/store";

export default function DashboardPage() {
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tps, setTps] = useState<TujuanPembelajaran[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const loadedClasses = getSavedClasses();
    const loadedStudents = getSavedStudents();
    const loadedTPs = getSavedTPs();
    setClasses(loadedClasses);
    setStudents(loadedStudents);
    setTps(loadedTPs);
    if (loadedClasses.length > 0) {
      setSelectedClassId(loadedClasses[0].id);
    }
  }, []);

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === selectedClassId);

  if (!isClient || !activeClass) {
    return <div className="p-8 text-center text-slate-400">Memuat dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-500/15">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Tahun Ajaran 2026/2027 • Semester Ganjil
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, Bapak Ahmad Fadillah
          </h1>
          <p className="text-blue-100 text-sm max-w-2xl">
            Sistem Manajemen Kelas & Asisten Otomasi Kurikulum Merdeka (Keputusan BSKAP 032/H/KR/2024). Semua data terhubung dari satu rantai terpadu.
          </p>
        </div>

        {/* Quick Class Picker */}
        <div className="flex-shrink-0 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
          <label className="block text-[11px] font-semibold text-blue-200 uppercase tracking-wider mb-1">
            Kelas Aktif
          </label>
          <select 
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full bg-white text-slate-900 font-semibold text-sm rounded-lg px-3 py-2 border-0 shadow-sm focus:ring-2 focus:ring-blue-400"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} • {c.subjectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Siswa</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{classStudents.length}</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <span>Rombel {activeClass.name}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target TP Selesai</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">2 / {tps.length || 3}</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>67% target tercapai</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kehadiran Rata-rata</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">97.4%</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <span>Dari 12 pertemuan</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Perlu Remedial</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">3 Siswa</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-amber-600 font-medium">
            <span>Di bawah ambang KKTP</span>
          </div>
        </div>
      </div>

      {/* Main 5 Functional Modules Hub */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Akses Cepat 5 Modul Terintegrasi</h2>
          <span className="text-xs text-slate-500">Satu alur data hulu ke hilir tanpa duplikasi input</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Kelas & Siswa */}
          <Link 
            href="/classes"
            className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition flex items-center gap-1">
                  Buka Modul <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                1. Daftar Kelas & Siswa
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Kelola rombel, roster siswa lengkap dengan NISN, presensi harian 6 status, dan impor data Dapodik otomatis.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">CSV/Excel Dapodik</span>
              <span>• 3 Rombel Terdaftar</span>
            </div>
          </Link>

          {/* Card 2: Input Nilai */}
          <Link 
            href="/grades"
            className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Calculator className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition flex items-center gap-1">
                  Buka Modul <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-emerald-600 transition">
                2. Input Nilai (TP & KKTP)
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Buku nilai virtual TanStack Grid. Terikat langsung ke UUID TP dengan 3 opsi model KKTP resmi dan kalkulasi rapor otomatis.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <span className="rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 font-medium">Formatif & Sumatif</span>
              <span>• Bebas Nilai Yatim</span>
            </div>
          </Link>

          {/* Card 3: Nilai Tambah & Remedial */}
          <Link 
            href="/remedial"
            className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition">
                  <Sparkles className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-purple-600 group-hover:translate-x-0.5 transition flex items-center gap-1">
                  Buka Modul <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-purple-600 transition">
                3. Nilai Tambah & Remedial
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Penyaringan otomatis siswa belum tuntas, generator soal remedial & pengayaan berbasis AI, dan poin keaktifan dengan audit ledger.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <span className="rounded bg-purple-50 text-purple-700 px-2 py-0.5 font-medium">Anti-Inflasi</span>
              <span>• Audit Trail Terverifikasi</span>
            </div>
          </Link>

          {/* Card 4: Perangkat Ajar Otomatis */}
          <Link 
            href="/curriculum"
            className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-amber-600 group-hover:translate-x-0.5 transition flex items-center gap-1">
                  Buka Modul <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-amber-600 transition">
                4. Generator Perangkat Ajar
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Wizard otomatis 7 tahap: Analisis Minggu Efektif $\rightarrow$ CP BSKAP 2024 $\rightarrow$ TP Taksonomi Bloom $\rightarrow$ ATP $\rightarrow$ KKTP $\rightarrow$ Prota $\rightarrow$ Prosem.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <span className="rounded bg-amber-50 text-amber-800 px-2 py-0.5 font-medium">CP Resmi BSKAP</span>
              <span>• Matriks Prosem</span>
            </div>
          </Link>

          {/* Card 5: Modul Ajar & LKPD */}
          <Link 
            href="/lesson-plans"
            className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-rose-600 group-hover:translate-x-0.5 transition flex items-center gap-1">
                  Buka Modul <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-rose-600 transition">
                5. Modul Ajar & LKPD Pertemuan
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Generator Modul Ajar 3 bagian resmi (8 Dimensi Profil Kelulusan) + LKPD siap cetak versi Siswa & Guru (dengan kunci jawaban).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <span className="rounded bg-rose-50 text-rose-800 px-2 py-0.5 font-medium">Deteksi Kop Otomatis</span>
              <span>• Ekspor Word & PDF</span>
            </div>
          </Link>

          {/* Card Extra: Ekspor & Integrasi */}
          <Link 
            href="/settings"
            className="group relative rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 hover:border-slate-400 hover:bg-slate-50 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 text-slate-700 group-hover:bg-slate-700 group-hover:text-white transition">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Pengaturan</span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Kop Sekolah & Template Word
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Unggah template dokumen resmi sekolah Anda. Sistem akan mendeteksi logo, kop, dan format tanda tangan kepala sekolah otomatis.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
              <span>Sesuai Format Lembaga Anda</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

