"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { AthirahUnit, ModulAjarAthirah, LkpdAthirah } from "../../types/index.ts";
import { useAppStore } from "../../lib/store.ts";
import { generateAthirahModulAjarAction } from "../actions/geminiActions.ts";
import { AthirahHeader } from "./AthirahHeader";
import { ModulAjarViewer } from "./ModulAjarViewer";
import { LkpdDualView } from "./LkpdDualView";
import {
  createDefaultAthirahModulAjar,
  createDefaultAthirahLkpd,
} from "./athirahConstants";
import { exportModulAjarToDocx, exportLkpdToDocx } from "./exportDocx";
import {
  BookOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";

export default function LessonPlansPage() {
  const { modulAjarList, lkpdList, saveModulAjar, saveLKPD } = useAppStore();

  const [selectedUnit, setSelectedUnit] = useState<AthirahUnit>(
    "SMA Islam Athirah 1 Makassar"
  );
  const [selectedMeeting, setSelectedMeeting] = useState<number>(1);
  const [activeMainTab, setActiveMainTab] = useState<"modul" | "lkpd">("modul");
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "info" | "error";
  } | null>(null);

  // Active Modul Ajar for the selected unit and meeting
  const currentModul: ModulAjarAthirah = useMemo(() => {
    const existing = modulAjarList.find(
      (m) =>
        m.identitas.unit === selectedUnit &&
        m.identitas.pertemuanKe === selectedMeeting
    );
    if (existing) return existing;
    return createDefaultAthirahModulAjar(selectedUnit, selectedMeeting);
  }, [modulAjarList, selectedUnit, selectedMeeting]);

  // Synchronized LKPD (Student & Teacher) for the selected unit and meeting
  const { currentStudentLkpd, currentTeacherLkpd } = useMemo(() => {
    const student = lkpdList.find(
      (l) =>
        l.unit === selectedUnit &&
        l.meetingNumber === selectedMeeting &&
        !l.id.includes("-guru") &&
        !l.guruAnswerKeyGuide
    );
    const teacher = lkpdList.find(
      (l) =>
        l.unit === selectedUnit &&
        l.meetingNumber === selectedMeeting &&
        (l.id.includes("-guru") || !!l.guruAnswerKeyGuide)
    );

    if (student && teacher) {
      return { currentStudentLkpd: student, currentTeacherLkpd: teacher };
    }

    const defaults = createDefaultAthirahLkpd(currentModul);
    return {
      currentStudentLkpd: student || defaults.student,
      currentTeacherLkpd: teacher || defaults.teacher,
    };
  }, [lkpdList, selectedUnit, selectedMeeting, currentModul]);

  // Persist default models to store on initial mount if not already present
  useEffect(() => {
    const hasModul = modulAjarList.some(
      (m) =>
        m.identitas.unit === selectedUnit &&
        m.identitas.pertemuanKe === selectedMeeting
    );
    if (!hasModul) {
      saveModulAjar(currentModul);
    }

    const hasLkpdStudent = lkpdList.some(
      (l) =>
        l.unit === selectedUnit &&
        l.meetingNumber === selectedMeeting &&
        !l.id.includes("-guru")
    );
    if (!hasLkpdStudent) {
      saveLKPD(currentStudentLkpd);
    }

    const hasLkpdTeacher = lkpdList.some(
      (l) =>
        l.unit === selectedUnit &&
        l.meetingNumber === selectedMeeting &&
        (l.id.includes("-guru") || !!l.guruAnswerKeyGuide)
    );
    if (!hasLkpdTeacher) {
      saveLKPD(currentTeacherLkpd);
    }
  }, [
    selectedUnit,
    selectedMeeting,
    modulAjarList,
    lkpdList,
    currentModul,
    currentStudentLkpd,
    currentTeacherLkpd,
    saveModulAjar,
    saveLKPD,
  ]);

  // Handle Modul Ajar modifications from user interactions
  const handleUpdateModul = (updated: ModulAjarAthirah) => {
    saveModulAjar(updated);
    setNotification({
      text: "Perubahan Modul Ajar berhasil disimpan ke sistem penyimpanan lokal.",
      type: "success",
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Generate / Regenerate via Gemini AI Server Action
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setNotification({
      text: `Menghubungi AI Engine untuk menyusun Modul Ajar & LKPD resmi ${selectedUnit} (Pertemuan ${selectedMeeting})...`,
      type: "info",
    });

    try {
      const res = await generateAthirahModulAjarAction({
        unit: selectedUnit,
        subject: currentModul.identitas.mataPelajaran || "Informatika",
        gradeLevel: currentModul.identitas.kelas || "Kelas X",
        fase: currentModul.identitas.fase || "E",
        materiPokok: currentModul.identitas.materiPokok,
        meetingNumber: selectedMeeting,
        durationMinutes: currentModul.identitas.durasiPertemuanMinutes || 135,
        tpDescription: currentModul.desainPembelajaran.tujuanPembelajaran.fullStatement,
        renstraPrograms: currentModul.identifikasi.programKhasRenstra,
      });

      if (res.success && res.modulAjar) {
        saveModulAjar(res.modulAjar);
        if (res.lkpdSiswa) saveLKPD(res.lkpdSiswa);
        if (res.lkpdGuruKunci) saveLKPD(res.lkpdGuruKunci);

        setNotification({
          text: res.isFallback
            ? "Modul Ajar & LKPD berhasil disusun menggunakan standar kurikulum Sekolah Islam Athirah (Mode Offline)."
            : "Alhamdulillah! Modul Ajar & LKPD berhasil digenerasikan oleh Gemini AI secara komprehensif.",
          type: "success",
        });
      } else {
        setNotification({
          text: res.error || "Gagal menyusun dokumen. Silakan coba kembali.",
          type: "error",
        });
      }
    } catch (err: any) {
      setNotification({
        text: `Kendala teknis: ${err.message || "Gagal memproses permohonan"}`,
        type: "error",
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Download Handlers
  const handleDownloadModulDocx = () => {
    exportModulAjarToDocx(currentModul);
    setNotification({
      text: "Dokumen Modul Ajar (.docx) berhasil diunduh.",
      type: "success",
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDownloadLkpdDocx = (version: "siswa" | "guru" = "siswa") => {
    const target = version === "guru" ? currentTeacherLkpd : currentStudentLkpd;
    exportLkpdToDocx(target, version);
    setNotification({
      text: `Dokumen LKPD ${version === "guru" ? "Pegangan Guru" : "Siswa"} (.docx) berhasil diunduh.`,
      type: "success",
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Print PDF handler
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Top Header & Unit Selector */}
      <div className="print:hidden">
        <AthirahHeader
          selectedUnit={selectedUnit}
          onSelectUnit={setSelectedUnit}
          selectedMeeting={selectedMeeting}
          onSelectMeeting={setSelectedMeeting}
          isGenerating={isGenerating}
          onGenerateAI={handleGenerateAI}
          onDownloadModulDocx={handleDownloadModulDocx}
          onDownloadLkpdDocx={() => handleDownloadLkpdDocx("siswa")}
          onPrintPdf={handlePrintPdf}
        />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-xs font-semibold shadow-sm transition print:hidden ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : notification.type === "error"
              ? "bg-rose-50 text-rose-900 border border-rose-200"
              : "bg-blue-50 text-blue-900 border border-blue-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : notification.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Tab Switcher: Modul Ajar vs Dual-Version LKPD */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 print:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMainTab("modul")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
              activeMainTab === "modul"
                ? "bg-emerald-800 text-white shadow-sm shadow-emerald-800/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Modul Ajar 6-Komponen
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("lkpd")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
              activeMainTab === "lkpd"
                ? "bg-indigo-800 text-white shadow-sm shadow-indigo-800/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-4 h-4" /> LKPD Dual-Version (Siswa vs Guru)
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block font-medium">
          {selectedUnit} • Pertemuan ke-{selectedMeeting}
        </div>
      </div>

      {/* Main View Area */}
      {activeMainTab === "modul" ? (
        <ModulAjarViewer
          modul={currentModul}
          onChangeModul={handleUpdateModul}
        />
      ) : (
        <LkpdDualView
          studentLkpd={currentStudentLkpd}
          teacherLkpd={currentTeacherLkpd}
          onDownloadDocx={handleDownloadLkpdDocx}
        />
      )}

      {/* Inline Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #fff !important;
            color: #000 !important;
          }
          nav,
          header,
          aside,
          .print\\:hidden {
            display: none !important;
          }
          .shadow-sm,
          .shadow-md {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
