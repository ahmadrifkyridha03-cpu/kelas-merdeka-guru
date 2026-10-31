"use client";

import React from "react";
import {
  Sparkles,
  Download,
  Printer,
  School,
  Calendar,
  Layers,
  ChevronDown,
} from "lucide-react";
import type { AthirahUnit } from "../../types/index.ts";
import { ATHIRAH_UNITS_LIST } from "./athirahConstants";

interface AthirahHeaderProps {
  selectedUnit: AthirahUnit;
  onSelectUnit: (unit: AthirahUnit) => void;
  selectedMeeting: number;
  onSelectMeeting: (meeting: number) => void;
  isGenerating: boolean;
  onGenerateAI: () => void;
  onDownloadModulDocx: () => void;
  onDownloadLkpdDocx: () => void;
  onPrintPdf: () => void;
}

export function AthirahHeader({
  selectedUnit,
  onSelectUnit,
  selectedMeeting,
  onSelectMeeting,
  isGenerating,
  onGenerateAI,
  onDownloadModulDocx,
  onDownloadLkpdDocx,
  onPrintPdf,
}: AthirahHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top Banner with Official Athirah Branding */}
      <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-700/60 border border-emerald-400/40 text-emerald-100">
                <School className="w-3.5 h-3.5" /> Yayasan Hadji Kalla
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-emerald-200 border border-white/10">
                <Layers className="w-3 h-3" /> Kurikulum Sekolah Islam Athirah
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Modul Ajar & LKPD Sekolah Islam Athirah
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Generator cerdas Kurikulum Merdeka Terintegrasi Islam: Memuat 6 Komponen Resmi, 8 Dimensi Profil Lulusan Athirah, Nilai Spiritual Al-Quran & Hadits, Alur 3M, Prinsip PM, Matriks Penguatan MH/MA/MR, serta LKPD Dua Versi (Siswa vs Kunci Guru).
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onGenerateAI}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold shadow-md shadow-amber-900/20 transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Sparkles className={`w-4 h-4 text-emerald-900 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Menyusun Modul..." : "Buat / Regenerasi Modul AI"}
            </button>

            <button
              type="button"
              onClick={onDownloadModulDocx}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-sm transition active:scale-95"
              title="Unduh Modul Ajar Resmi Format MS Word (.docx)"
            >
              <Download className="w-4 h-4 text-emerald-300" /> Modul (.docx)
            </button>

            <button
              type="button"
              onClick={onDownloadLkpdDocx}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-sm transition active:scale-95"
              title="Unduh LKPD Format MS Word (.docx)"
            >
              <Download className="w-4 h-4 text-teal-300" /> LKPD (.docx)
            </button>

            <button
              type="button"
              onClick={onPrintPdf}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-sm transition active:scale-95"
              title="Cetak Dokumen atau Simpan PDF"
            >
              <Printer className="w-4 h-4 text-amber-200" /> Cetak PDF
            </button>
          </div>
        </div>
      </div>

      {/* Unit Selector and Meeting Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm">
        {/* Unit Selector */}
        <div className="md:col-span-5 flex items-center gap-2.5">
          <label htmlFor="athirah-unit-select" className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
            <School className="w-4 h-4 text-emerald-600" />
            <span>Satuan Unit:</span>
          </label>
          <div className="relative flex-1">
            <select
              id="athirah-unit-select"
              value={selectedUnit}
              onChange={(e) => onSelectUnit(e.target.value as AthirahUnit)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition cursor-pointer"
            >
              {ATHIRAH_UNITS_LIST.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Meeting Number Pills (1 to 6) */}
        <div className="md:col-span-7 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none justify-start md:justify-end">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Pertemuan:
          </span>
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const isSelected = selectedMeeting === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onSelectMeeting(num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
                  isSelected
                    ? "bg-emerald-700 text-white shadow-sm shadow-emerald-700/20"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                }`}
              >
                Pertemuan {num} (3 JP)
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
