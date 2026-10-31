"use client";

import React, { useState, useEffect } from "react";
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
  Edit,
  X,
  BookOpen,
  Layers,
  Clock
} from "lucide-react";
import { ClassSection, Student, KurikulumFase } from "@/types";
import { 
  getSavedClasses, 
  saveClasses, 
  getSavedStudents, 
  saveStudents 
} from "@/lib/store";

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Modals state
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State: Tambah / Edit Rombel
  const [classForm, setClassForm] = useState<{
    id?: string;
    name: string;
    subjectName: string;
    gradeLevel: number;
    fase: KurikulumFase;
    teachingHoursPerWeek: number;
  }>({
    name: "",
    subjectName: "Informatika",
    gradeLevel: 10,
    fase: "E",
    teachingHoursPerWeek: 3
  });

  // Form State: Tambah Siswa
  const [studentForm, setStudentForm] = useState<{
    fullName: string;
    nisn: string;
    nis: string;
    gender: "L" | "P";
    specialNeeds: string;
  }>({
    fullName: "",
    nisn: "",
    nis: "",
    gender: "L",
    specialNeeds: ""
  });

  // Inisialisasi data dari localStorage
  useEffect(() => {
    setIsClient(true);
    const loadedClasses = getSavedClasses();
    const loadedStudents = getSavedStudents();
    setClasses(loadedClasses);
    setStudents(loadedStudents);
    if (loadedClasses.length > 0) {
      setSelectedClassId(loadedClasses[0].id);
    }
  }, []);

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const filteredStudents = students.filter(s => 
    s.classId === selectedClassId && 
    (s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery))
  );

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Otomatis tentukan fase saat tingkat kelas berubah
  const handleGradeLevelChange = (level: number) => {
    let autoFase: KurikulumFase = "E";
    if (level <= 2) autoFase = "A";
    else if (level <= 4) autoFase = "B";
    else if (level <= 6) autoFase = "C";
    else if (level <= 9) autoFase = "D";
    else if (level === 10) autoFase = "E";
    else autoFase = "F";

    setClassForm(prev => ({
      ...prev,
      gradeLevel: level,
      fase: autoFase
    }));
  };

  // Simpan Rombel Baru
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name.trim() || !classForm.subjectName.trim()) {
      alert("Nama Rombel dan Mata Pelajaran wajib diisi!");
      return;
    }

    if (isEditClassModalOpen && classForm.id) {
      // Edit Rombel
      const updated = classes.map(c => {
        if (c.id === classForm.id) {
          return {
            ...c,
            name: classForm.name,
            subjectName: classForm.subjectName,
            gradeLevel: classForm.gradeLevel,
            fase: classForm.fase,
            teachingHoursPerWeek: classForm.teachingHoursPerWeek,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      });
      setClasses(updated);
      saveClasses(updated);
      setIsEditClassModalOpen(false);
      showNotify(`Rombel ${classForm.name} berhasil diperbarui!`);
    } else {
      // Tambah Rombel Baru
      const newClass: ClassSection = {
        id: `cls-${Date.now()}`,
        teacherId: "teacher-1",
        name: classForm.name,
        gradeLevel: classForm.gradeLevel,
        fase: classForm.fase,
        subjectName: classForm.subjectName,
        teachingHoursPerWeek: classForm.teachingHoursPerWeek,
        academicYearId: "ay-2026",
        semesterNumber: 1,
        studentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updated = [...classes, newClass];
      setClasses(updated);
      saveClasses(updated);
      setSelectedClassId(newClass.id);
      setIsAddClassModalOpen(false);
      showNotify(`Rombel baru "${newClass.name}" (Fase ${newClass.fase}) berhasil ditambahkan!`);
    }
  };

  // Buka Modal Edit Rombel
  const handleOpenEditClass = () => {
    if (!activeClass) return;
    setClassForm({
      id: activeClass.id,
      name: activeClass.name,
      subjectName: activeClass.subjectName,
      gradeLevel: activeClass.gradeLevel,
      fase: activeClass.fase,
      teachingHoursPerWeek: activeClass.teachingHoursPerWeek
    });
    setIsEditClassModalOpen(true);
  };

  // Hapus Rombel
  const handleDeleteClass = (classId: string, className: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Rombel "${className}" beserta seluruh data siswanya?`)) {
      const updatedClasses = classes.filter(c => c.id !== classId);
      const updatedStudents = students.filter(s => s.classId !== classId);
      setClasses(updatedClasses);
      setStudents(updatedStudents);
      saveClasses(updatedClasses);
      saveStudents(updatedStudents);
      if (updatedClasses.length > 0) {
        setSelectedClassId(updatedClasses[0].id);
      }
      showNotify(`Rombel "${className}" telah dihapus.`);
    }
  };

  // Simpan Siswa Baru Manual
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.fullName.trim() || !studentForm.nisn.trim()) {
      alert("Nama Lengkap dan NISN siswa wajib diisi!");
      return;
    }

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      classId: selectedClassId,
      nisn: studentForm.nisn.trim(),
      nis: studentForm.nis.trim() || undefined,
      fullName: studentForm.fullName.trim(),
      gender: studentForm.gender,
      specialNeeds: studentForm.specialNeeds.trim() || undefined,
      status: "AKTIF",
      bonusPoints: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    saveStudents(updatedStudents);

    // Update jumlah siswa di kelas
    const updatedClasses = classes.map(c => {
      if (c.id === selectedClassId) {
        return { ...c, studentCount: c.studentCount + 1 };
      }
      return c;
    });
    setClasses(updatedClasses);
    saveClasses(updatedClasses);

    // Reset Form
    setStudentForm({
      fullName: "",
      nisn: "",
      nis: "",
      gender: "L",
      specialNeeds: ""
    });
    setIsAddStudentModalOpen(false);
    showNotify(`Siswa "${newStudent.fullName}" berhasil ditambahkan ke ${activeClass?.name}!`);
  };

  // Hapus Siswa
  const handleDeleteStudent = (studentId: string, studentName: string) => {
    if (confirm(`Hapus siswa "${studentName}" dari rombel ini?`)) {
      const updatedStudents = students.filter(s => s.id !== studentId);
      setStudents(updatedStudents);
      saveStudents(updatedStudents);

      const updatedClasses = classes.map(c => {
        if (c.id === selectedClassId) {
          return { ...c, studentCount: Math.max(0, c.studentCount - 1) };
        }
        return c;
      });
      setClasses(updatedClasses);
      saveClasses(updatedClasses);
      showNotify(`Siswa "${studentName}" berhasil dihapus.`);
    }
  };

  // Simulasi Impor Dapodik
  const handleSimulateDapodikImport = () => {
    const imported: Student[] = [
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

    const updated = [...students, ...imported];
    setStudents(updated);
    saveStudents(updated);

    const updatedClasses = classes.map(c => {
      if (c.id === selectedClassId) {
        return { ...c, studentCount: c.studentCount + imported.length };
      }
      return c;
    });
    setClasses(updatedClasses);
    saveClasses(updatedClasses);

    setIsImportModalOpen(false);
    showNotify("Berhasil mengimpor 2 siswa dari berkas CSV Dapodik Kemendikbudristek!");
  };

  if (!isClient || !activeClass) {
    return <div className="p-8 text-center text-slate-400">Memuat data kelas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
            <School className="h-3.5 w-3.5" /> Modul 1: Manajemen Rombel & Siswa
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Daftar Kelas, Pelajaran & Siswa
          </h1>
          <p className="text-sm text-slate-500">
            Atur mata pelajaran yang diampu, rombel, fase Kurikulum Merdeka (A-F), serta data siswa aktif.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <FileUp className="h-4 w-4 text-blue-600" />
            Impor Dapodik
          </button>
          <button
            type="button"
            onClick={() => setIsAddStudentModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Class Selector Tabs with Add Class button */}
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
          onClick={() => {
            setClassForm({
              name: "",
              subjectName: "Informatika",
              gradeLevel: 10,
              fase: "E",
              teachingHoursPerWeek: 3
            });
            setIsAddClassModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-600 border border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah Rombel Baru
        </button>
      </div>

      {/* Active Class Details & Configuration Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {activeClass.name.substring(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">{activeClass.name}</span>
              <span className="text-slate-400">•</span>
              <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {activeClass.subjectName}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
              <span>Kelas {activeClass.gradeLevel}</span>
              <span>•</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Fase {activeClass.fase} Kurikulum Merdeka
              </span>
              <span>•</span>
              <span>{activeClass.teachingHoursPerWeek} JP/Minggu</span>
            </div>
          </div>
        </div>

        {/* Action Buttons & Search */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenEditClass}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Edit className="h-3.5 w-3.5 text-blue-600" /> Atur Rombel
          </button>
          <button
            type="button"
            onClick={() => handleDeleteClass(activeClass.id, activeClass.name)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-600" /> Hapus Rombel
          </button>

          <div className="relative w-full md:w-56">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari siswa atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
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
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    Belum ada siswa di rombel ini. Klik <strong>"Tambah Siswa"</strong> atau <strong>"Impor Dapodik"</strong> untuk memasukkan data siswa.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-center font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{student.fullName}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {student.nisn} {student.nis ? `• NIS: ${student.nis}` : ""}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        student.gender === "L" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                      }`}>
                        {student.gender === "L" ? "Laki-laki" : "Perempuan"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {student.specialNeeds ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          {student.specialNeeds}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Normal / Reguler</span>
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
                      <button 
                        type="button" 
                        onClick={() => handleDeleteStudent(student.id, student.fullName)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: TAMBAH / EDIT ROMBEL ================= */}
      {(isAddClassModalOpen || isEditClassModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <School className="h-4 w-4 text-blue-600" />
                {isEditClassModalOpen ? "Atur Rombel / Kelas" : "Tambah Rombel (Kelas) Baru"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddClassModalOpen(false);
                  setIsEditClassModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Rombel / Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: X-A, VII-B, XII-MIPA-1"
                    value={classForm.name}
                    onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran yang Diampu *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Informatika, Matematika"
                    value={classForm.subjectName}
                    onChange={(e) => setClassForm({ ...classForm, subjectName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tingkat Kelas
                  </label>
                  <select
                    value={classForm.gradeLevel}
                    onChange={(e) => handleGradeLevelChange(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(lvl => (
                      <option key={lvl} value={lvl}>Kelas {lvl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fase Kurikulum
                  </label>
                  <select
                    value={classForm.fase}
                    onChange={(e) => setClassForm({ ...classForm, fase: e.target.value as KurikulumFase })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-blue-700"
                  >
                    <option value="A">Fase A (SD 1-2)</option>
                    <option value="B">Fase B (SD 3-4)</option>
                    <option value="C">Fase C (SD 5-6)</option>
                    <option value="D">Fase D (SMP 7-9)</option>
                    <option value="E">Fase E (SMA 10)</option>
                    <option value="F">Fase F (SMA 11-12)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Beban JP / Minggu
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={classForm.teachingHoursPerWeek}
                    onChange={(e) => setClassForm({ ...classForm, teachingHoursPerWeek: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-blue-50/60 p-3 text-[11px] text-blue-800 border border-blue-200/60 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Fase yang dipilih (misal <strong>Fase {classForm.fase}</strong>) akan otomatis dipakai oleh modul pembuat CP, TP, ATP, dan Modul Ajar AI.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddClassModalOpen(false);
                    setIsEditClassModalOpen(false);
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  {isEditClassModalOpen ? "Simpan Perubahan" : "Tambahkan Rombel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH SISWA MANUAL ================= */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Tambah Siswa ke {activeClass.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Data siswa akan langsung tersimpan di daftar roster dan buku nilai.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  value={studentForm.fullName}
                  onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NISN (10 Digit) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0081234567"
                    value={studentForm.nisn}
                    onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIS Sekolah (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 2425008"
                    value={studentForm.nis}
                    onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelamin *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                    studentForm.gender === "L"
                      ? "bg-blue-50 border-blue-400 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}>
                    <input
                      type="radio"
                      name="gender"
                      value="L"
                      checked={studentForm.gender === "L"}
                      onChange={() => setStudentForm({ ...studentForm, gender: "L" })}
                      className="hidden"
                    />
                    Laki-laki (L)
                  </label>

                  <label className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                    studentForm.gender === "P"
                      ? "bg-pink-50 border-pink-400 text-pink-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}>
                    <input
                      type="radio"
                      name="gender"
                      value="P"
                      checked={studentForm.gender === "P"}
                      onChange={() => setStudentForm({ ...studentForm, gender: "P" })}
                      className="hidden"
                    />
                    Perempuan (P)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Diagnostik Awal / Kebutuhan Khusus
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Gaya belajar visual, disleksia ringan, berbakat istimewa..."
                  value={studentForm.specialNeeds}
                  onChange={(e) => setStudentForm({ ...studentForm, specialNeeds: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: IMPOR DAPODIK ================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Impor Data Roster dari Dapodik
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Unggah file CSV atau Excel yang diekspor dari aplikasi Dapodik sekolah. Sistem otomatis memetakan NISN, Nama, dan Gender ke rombel {activeClass.name}.
            </p>

            <div 
              onClick={handleSimulateDapodikImport}
              className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-blue-500 hover:bg-blue-50/20 transition cursor-pointer mb-5"
            >
              <FileUp className="mx-auto h-8 w-8 text-blue-600 mb-2" />
              <div className="text-xs font-semibold text-slate-800">
                Klik untuk Simulasikan Impor Berkas Dapodik
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
                Impor Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
