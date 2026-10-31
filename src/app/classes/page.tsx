"use client";

import React, { useState } from "react";
import { 
  Users, 
  Plus, 
  FileUp, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  School,
  Trash2,
  Edit
} from "lucide-react";
import { mockClasses, mockStudents } from "@/lib/mockData";
import { Student } from "@/types";

export default function ClassesPage() {
  const [classes, setClasses] = useState(mockClasses);
  const [selectedClassId, setSelectedClassId] = useState(classes[0].id);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const filteredStudents = students.filter(s => 
    s.classId === selectedClassId && 
    (s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery))
  );

  const handleSimulateDapodikImport = () => {
    // Simulasi impor Dapodik
    const newStudents: Student[] = [
      {
        id: `std-${Date.now()}-1`,
        classId: selectedClassId,
        nisn: "0089912341",
        nis: "2425006",
        fullName: "Fajar Maulana Sidik",
        gender: "L",
        status: "AKTIF",
        bonusPoints: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `std-${Date.now()}-2`,
        classId: selectedClassId,
        nisn: "0089912342",
        nis: "2425007",
        fullName: "Gita Permatasari",
        gender: "P",
        status: "AKTIF",
        bonusPoints: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    setStudents(prev => [...prev, ...newStudents]);
    setIsImportModalOpen(false);
    setImportNotification("Berhasil mengimpor 2 siswa dari berkas CSV Dapodik Kemendikbudristek!");
    setTimeout(() => setImportNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
            <School className="h-3.5 w-3.5" /> Modul 1: Manajemen Rombel & Siswa
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Daftar Kelas & Roster Siswa
          </h1>
          <p className="text-sm text-slate-500">
            Fondasi data siswa terpusat. Mendukung sinkronisasi format resmi Dapodik Kemendikbudristek.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <FileUp className="h-4 w-4 text-blue-600" />
            Impor CSV/Excel Dapodik
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {importNotification && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{importNotification}</span>
        </div>
      )}

      {/* Class Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {classes.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedClassId(c.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
              selectedClassId === c.id
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>{c.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              selectedClassId === c.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {c.studentCount} Siswa
            </span>
          </button>
        ))}
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-blue-600 border border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah Rombel
        </button>
      </div>

      {/* Active Class Summary Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            {activeClass.name.substring(0, 2)}
          </div>
          <div>
            <div className="text-base font-bold text-slate-900">{activeClass.name} • {activeClass.subjectName}</div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Tingkat Kelas: {activeClass.gradeLevel}</span>
              <span>•</span>
              <span className="font-semibold text-blue-600">Kurikulum Merdeka Fase {activeClass.fase}</span>
              <span>•</span>
              <span>{activeClass.teachingHoursPerWeek} JP/Minggu</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap Siswa</th>
                <th className="py-3 px-4">NISN / NIS</th>
                <th className="py-3 px-4 text-center">L/P</th>
                <th className="py-3 px-4">Catatan Khusus & Diagnostik Awal</th>
                <th className="py-3 px-4 text-center">Poin Bonus</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data siswa yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-center font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{student.fullName}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{student.nisn}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        student.gender === "L" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                      }`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {student.specialNeeds ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          {student.specialNeeds}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Tidak ada catatan diagnostik</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs">
                        <Sparkles className="h-3 w-3" />
                        +{student.bonusPoints}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" className="text-slate-400 hover:text-blue-600 transition">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" className="text-slate-400 hover:text-rose-600 transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dapodik Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Impor Data Roster dari Dapodik
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Unggah file CSV atau Excel yang diekspor langsung dari aplikasi Dapodik sekolah. Sistem akan memetakan NISN, Nama, dan Gender otomatis.
            </p>

            <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-blue-500 hover:bg-blue-50/20 transition cursor-pointer mb-5">
              <FileUp className="mx-auto h-8 w-8 text-blue-600 mb-2" />
              <div className="text-xs font-semibold text-slate-800">
                Klik atau seret file Dapodik ke sini
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Format: .csv atau .xlsx (Maks. 5 MB)
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSimulateDapodikImport}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Simulasikan Impor Dapodik
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

