"use client";

import React, { useState, useEffect, useRef } from "react";
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
  FileSpreadsheet,
  FileText,
  AlertTriangle
} from "lucide-react";
import { ClassSection, Student, KurikulumFase } from "@/types";
import { useAppStore } from "@/lib/store";
import { 
  parseDapodikCSV, 
  parseDapodikExcel, 
  exportRosterToCSV, 
  exportRosterToExcel, 
  downloadFile 
} from "@/lib/dapodik";

export default function ClassesPage() {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    students,
    addClass,
    updateClass,
    deleteClass,
    setStudents,
    addStudent,
    deleteStudent,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Modals state
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<{
    isLoading: boolean;
    errors: string[];
    warnings: string[];
  }>({
    isLoading: false,
    errors: [],
    warnings: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    teachingHoursPerWeek: 3,
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
    specialNeeds: "",
  });

  // Hydration check
  useEffect(() => {
    setIsClient(true);
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId, setSelectedClassId]);

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const filteredStudents = students.filter(
    (s) =>
      s.classId === selectedClassId &&
      (s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery))
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

    setClassForm((prev) => ({
      ...prev,
      gradeLevel: level,
      fase: autoFase,
    }));
  };

  // Simpan Rombel Baru / Edit
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name.trim() || !classForm.subjectName.trim()) {
      alert("Nama Rombel dan Mata Pelajaran wajib diisi!");
      return;
    }

    if (isEditClassModalOpen && classForm.id) {
      // Edit Rombel
      const target = classes.find((c) => c.id === classForm.id);
      if (target) {
        updateClass({
          ...target,
          name: classForm.name,
          subjectName: classForm.subjectName,
          gradeLevel: classForm.gradeLevel,
          fase: classForm.fase,
          teachingHoursPerWeek: classForm.teachingHoursPerWeek,
          updatedAt: new Date().toISOString(),
        });
      }
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
        updatedAt: new Date().toISOString(),
      };

      addClass(newClass);
      setSelectedClassId(newClass.id);
      setIsAddClassModalOpen(false);
      showNotify(
        `Rombel baru "${newClass.name}" (Fase ${newClass.fase}) berhasil ditambahkan!`
      );
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
      teachingHoursPerWeek: activeClass.teachingHoursPerWeek,
    });
    setIsEditClassModalOpen(true);
  };

  // Hapus Rombel
  const handleDeleteClass = (classId: string, className: string) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus Rombel "${className}" beserta seluruh data siswanya?`
      )
    ) {
      deleteClass(classId);
      const remaining = classes.filter((c) => c.id !== classId);
      if (remaining.length > 0) {
        setSelectedClassId(remaining[0].id);
      }
      showNotify(`Rombel "${className}" telah dihapus.`);
    }
  };

  // Simpan Siswa Baru Manual (dengan Fleksibel NISN)
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.fullName.trim()) {
      alert("Nama Lengkap siswa wajib diisi!");
      return;
    }

    let finalNisn = studentForm.nisn.trim();
    // Validasi format jika NISN diisi
    if (finalNisn) {
      if (!/^\d{10}$/.test(finalNisn)) {
        if (!confirm("NISN biasanya terdiri dari 10 digit angka. Apakah Anda ingin tetap melanjutkan?")) {
          return;
        }
      }
    } else {
      // Jika kosong (misal siswa baru jenjang SD kelas 1 atau SMP kelas 7 yang belum terbit NISN)
      finalNisn = `PENDING-${Date.now().toString().slice(-6)}`;
    }

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      classId: selectedClassId,
      nisn: finalNisn,
      nis: studentForm.nis.trim() || undefined,
      fullName: studentForm.fullName.trim(),
      gender: studentForm.gender,
      specialNeeds: studentForm.specialNeeds.trim() || undefined,
      status: "AKTIF",
      bonusPoints: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addStudent(newStudent);

    // Update jumlah siswa di kelas
    if (activeClass) {
      updateClass({
        ...activeClass,
        studentCount: activeClass.studentCount + 1,
      });
    }

    // Reset Form
    setStudentForm({
      fullName: "",
      nisn: "",
      nis: "",
      gender: "L",
      specialNeeds: "",
    });
    setIsAddStudentModalOpen(false);
    showNotify(
      `Siswa "${newStudent.fullName}" berhasil ditambahkan ke ${activeClass?.name}!`
    );
  };

  // Hapus Siswa
  const handleDeleteStudent = (studentId: string, studentName: string) => {
    if (confirm(`Hapus siswa "${studentName}" dari rombel ini?`)) {
      deleteStudent(studentId);
      if (activeClass) {
        updateClass({
          ...activeClass,
          studentCount: Math.max(0, activeClass.studentCount - 1),
        });
      }
      showNotify(`Siswa "${studentName}" berhasil dihapus.`);
    }
  };

  // Real Dapodik File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportStatus({ isLoading: false, errors: [], warnings: [] });
    }
  };

  const handleProcessImport = () => {
    if (!importFile) {
      alert("Silakan pilih berkas CSV atau Excel terlebih dahulu!");
      return;
    }

    setImportStatus({ isLoading: true, errors: [], warnings: [] });
    const fileName = importFile.name.toLowerCase();
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    const reader = new FileReader();

    if (isExcel) {
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const result = parseDapodikExcel(buffer, selectedClassId);
          handleImportResult(result);
        } catch (err: any) {
          setImportStatus({
            isLoading: false,
            errors: [`Gagal memproses file Excel: ${err?.message || "Kesalahan tidak dikenal"}`],
            warnings: [],
          });
        }
      };
      reader.onerror = () => {
        setImportStatus({
          isLoading: false,
          errors: ["Gagal membaca berkas Excel dari perangkat."],
          warnings: [],
        });
      };
      reader.readAsArrayBuffer(importFile);
    } else {
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const result = parseDapodikCSV(text, selectedClassId);
          handleImportResult(result);
        } catch (err: any) {
          setImportStatus({
            isLoading: false,
            errors: [`Gagal memproses file CSV: ${err?.message || "Kesalahan tidak dikenal"}`],
            warnings: [],
          });
        }
      };
      reader.onerror = () => {
        setImportStatus({
          isLoading: false,
          errors: ["Gagal membaca berkas CSV dari perangkat."],
          warnings: [],
        });
      };
      reader.readAsText(importFile, "UTF-8");
    }
  };

  const handleImportResult = (result: ReturnType<typeof parseDapodikCSV>) => {
    if (!result.success || result.students.length === 0) {
      setImportStatus({
        isLoading: false,
        errors: result.errors.length > 0 ? result.errors : ["Tidak ada data siswa valid yang dapat diimpor."],
        warnings: result.warnings,
      });
      return;
    }

    // Append parsed students to store
    const existing = students.filter((s) => s.classId === selectedClassId);
    const existingNisns = new Set(existing.map((s) => s.nisn));

    // Avoid duplicate NISNs within same class if already present
    const newStudentsToAdd: Student[] = [];
    let skippedDuplicates = 0;

    for (const s of result.students) {
      if (s.nisn && !s.isPendingNisn && existingNisns.has(s.nisn)) {
        skippedDuplicates++;
      } else {
        newStudentsToAdd.push(s);
      }
    }

    if (newStudentsToAdd.length > 0) {
      setStudents([...students, ...newStudentsToAdd]);
      if (activeClass) {
        updateClass({
          ...activeClass,
          studentCount: activeClass.studentCount + newStudentsToAdd.length,
        });
      }
    }

    setIsImportModalOpen(false);
    setImportFile(null);
    setImportStatus({ isLoading: false, errors: [], warnings: [] });

    let msg = `Berhasil mengimpor ${newStudentsToAdd.length} siswa ke ${activeClass?.name}!`;
    if (skippedDuplicates > 0) {
      msg += ` (${skippedDuplicates} siswa dilewati karena NISN sudah ada)`;
    }
    showNotify(msg);
  };

  // Export Roster Handlers
  const handleExportCSV = () => {
    if (!activeClass || filteredStudents.length === 0) {
      alert("Tidak ada siswa untuk diekspor!");
      return;
    }
    const csvData = exportRosterToCSV(filteredStudents, activeClass.name);
    downloadFile(
      csvData,
      `Roster_${activeClass.name.replace(/\s+/g, "_")}.csv`,
      "text/csv;charset=utf-8;"
    );
    showNotify(`Roster ${activeClass.name} berhasil diekspor ke CSV!`);
  };

  const handleExportExcel = () => {
    if (!activeClass || filteredStudents.length === 0) {
      alert("Tidak ada siswa untuk diekspor!");
      return;
    }
    const excelBuffer = exportRosterToExcel(filteredStudents, activeClass.name);
    downloadFile(
      excelBuffer,
      `Roster_${activeClass.name.replace(/\s+/g, "_")}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    showNotify(`Roster ${activeClass.name} berhasil diekspor ke Excel!`);
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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition"
              title="Ekspor CSV"
            >
              <FileText className="h-3.5 w-3.5 text-blue-600" /> CSV
            </button>
            <div className="w-[1px] h-4 bg-slate-200" />
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition"
              title="Ekspor Excel (.xlsx)"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Excel
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setImportFile(null);
              setImportStatus({ isLoading: false, errors: [], warnings: [] });
              setIsImportModalOpen(true);
            }}
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
        {classes.map((c) => (
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
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedClassId === c.id
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
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
              teachingHoursPerWeek: 3,
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
                      <span className={student.nisn.startsWith("PENDING") ? "text-amber-600 italic font-sans text-[10px]" : ""}>
                        {student.nisn}
                      </span>
                      {student.nis ? ` • NIS: ${student.nis}` : ""}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          student.gender === "L"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-pink-50 text-pink-700"
                        }`}
                      >
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
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((lvl) => (
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
                    onChange={(e) =>
                      setClassForm({ ...classForm, fase: e.target.value as KurikulumFase })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-blue-700"
                  >
                    {["A", "B", "C", "D", "E", "F"].map((f) => (
                      <option key={f} value={f}>Fase {f}</option>
                    ))}
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
                    required
                    value={classForm.teachingHoursPerWeek}
                    onChange={(e) =>
                      setClassForm({
                        ...classForm,
                        teachingHoursPerWeek: Number(e.target.value),
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
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
                  {isEditClassModalOpen ? "Simpan Perubahan" : "Buat Rombel"}
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
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Tambah Siswa ke {activeClass.name}
              </h3>
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
                  placeholder="Contoh: Muhammad Fatih Al-Farabi"
                  value={studentForm.fullName}
                  onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NISN (10 Digit, opsional)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="Kosongkan bila belum ada"
                    value={studentForm.nisn}
                    onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Otomatis generate jika kosong</p>
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
                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      studentForm.gender === "L"
                        ? "bg-blue-50 border-blue-400 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
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

                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      studentForm.gender === "P"
                        ? "bg-pink-50 border-pink-400 text-pink-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
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

      {/* ================= MODAL: REAL IMPOR DAPODIK ================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileUp className="h-5 w-5 text-blue-600" />
                Impor Data Roster Dapodik
              </h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Unggah file CSV atau Excel yang diekspor langsung dari aplikasi Dapodik Kemendikbudristek untuk rombel <strong>{activeClass.name}</strong>.
            </p>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload Drag/Click Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed p-6 text-center transition cursor-pointer mb-4 ${
                importFile
                  ? "border-emerald-400 bg-emerald-50/30"
                  : "border-slate-300 hover:border-blue-500 hover:bg-blue-50/20"
              }`}
            >
              {importFile ? (
                <div>
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                  <div className="text-xs font-bold text-slate-900 break-all">
                    {importFile.name}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    {(importFile.size / 1024).toFixed(1)} KB • Siap diproses
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImportFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-[11px] text-rose-600 underline mt-2"
                  >
                    Ganti file
                  </button>
                </div>
              ) : (
                <div>
                  <FileUp className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                  <div className="text-xs font-semibold text-slate-800">
                    Klik untuk Memilih File CSV atau Excel
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Mendukung delimit koma (,), titik-koma (;), dan .xlsx
                  </div>
                </div>
              )}
            </div>

            {/* Error or Warnings Feedback */}
            {importStatus.errors.length > 0 && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                  Gagal Mengimpor File
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {importStatus.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {importStatus.warnings.length > 0 && (
              <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 max-h-32 overflow-y-auto">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  Pemberitahuan Baris:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {importStatus.warnings.slice(0, 5).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                  {importStatus.warnings.length > 5 && (
                    <li className="font-semibold italic">...dan {importStatus.warnings.length - 5} lainnya</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={!importFile || importStatus.isLoading}
                onClick={handleProcessImport}
                className={`rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-sm transition flex items-center gap-1.5 ${
                  !importFile || importStatus.isLoading
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {importStatus.isLoading ? (
                  <>Memproses File...</>
                ) : (
                  <>
                    <FileUp className="h-3.5 w-3.5" /> Proses Impor Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
