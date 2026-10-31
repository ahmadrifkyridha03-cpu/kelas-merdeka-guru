"use client";

import React, { useState } from "react";
import type {
  ModulAjarAthirah,
  AthirahProfilLulusan,
  ProgramKhasRenstra,
} from "../../types/index.ts";
import {
  PLA_DIMENSIONS_CONFIG,
  RENSTRA_PROGRAMS_CONFIG,
  PM_PRINCIPLES_CONFIG,
  MATRIKS_PENGUATAN_INFO,
} from "./athirahConstants";
import {
  BookOpen,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Tag,
  Target,
  Users,
  Lightbulb,
  GraduationCap,
  ScrollText,
  BookmarkCheck,
  CheckSquare,
  Square,
  Table as TableIcon,
  Layers,
} from "lucide-react";

interface ModulAjarViewerProps {
  modul: ModulAjarAthirah;
  onChangeModul: (modul: ModulAjarAthirah) => void;
}

export function ModulAjarViewer({ modul, onChangeModul }: ModulAjarViewerProps) {
  const [active3MPhase, setActive3MPhase] = useState<"ALL" | "MEMAHAMI" | "MENGAPLIKASI" | "MEREFLEKSI">("ALL");

  // Toggle PLA dimension
  const togglePLA = (dim: AthirahProfilLulusan) => {
    const current = modul.identifikasi.profilLulusanAthirah;
    const exists = current.includes(dim);
    const updated = exists ? current.filter((d) => d !== dim) : [...current, dim];
    onChangeModul({
      ...modul,
      identifikasi: {
        ...modul.identifikasi,
        profilLulusanAthirah: updated.length > 0 ? updated : current,
      },
    });
  };

  // Toggle Renstra program
  const toggleRenstra = (prog: ProgramKhasRenstra) => {
    const current = modul.identifikasi.programKhasRenstra;
    const exists = current.includes(prog);
    const updated = exists ? current.filter((p) => p !== prog) : [...current, prog];
    onChangeModul({
      ...modul,
      identifikasi: {
        ...modul.identifikasi,
        programKhasRenstra: updated.length > 0 ? updated : current,
      },
    });
  };

  const allActivities = [
    ...modul.pengalamanBelajar.memahami,
    ...modul.pengalamanBelajar.mengaplikasi,
    ...modul.pengalamanBelajar.merefleksi,
  ];

  const filteredActivities =
    active3MPhase === "ALL"
      ? allActivities
      : allActivities.filter((a) => a.phase === active3MPhase);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. BAGIAN IDENTITAS MODUL                                                 */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                I. Identitas Modul Ajar
              </h2>
              <p className="text-[11px] text-slate-500">
                Data struktural satuan pendidikan dan alokasi pembelajaran
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {modul.identitas.alokasiWaktuDisplay}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Satuan Unit</span>
            <span className="font-bold text-slate-900">{modul.identitas.unit}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Mata Pelajaran</span>
            <span className="font-bold text-slate-900">{modul.identitas.mataPelajaran}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Fase & Kelas</span>
            <span className="font-bold text-slate-900">
              Fase {modul.identitas.fase} / {modul.identitas.kelas}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Materi Pokok</span>
            <span className="font-bold text-slate-900">{modul.identitas.materiPokok}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Pertemuan & Alokasi</span>
            <span className="font-bold text-slate-900">
              Pertemuan ke-{modul.identitas.pertemuanKe} ({modul.identitas.durasiPertemuanMinutes} Menit)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Semester & Tahun Ajaran</span>
            <span className="font-bold text-slate-900">
              Semester {modul.identitas.semester === 1 ? "Ganjil" : "Genap"} / TA {modul.identitas.tahunAjaran}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Guru Penyusun</span>
            <span className="font-bold text-slate-900">{modul.identitas.namaPenyusun}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BAGIAN IDENTIFIKASI (PLA & RENSTRA / KOSMO)                            */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                II. Identifikasi: Profil Lulusan Athirah & Renstra
              </h2>
              <p className="text-[11px] text-slate-500">
                Pondasi pembentukan karakter 8 Dimensi PLA dan Program Khas Renstra Kalla
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {modul.identifikasi.profilLulusanAthirah.length}/8 Dimensi Terpilih
          </span>
        </div>

        {/* 8 Dimensi Profil Lulusan Athirah (PLA) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>8 Dimensi Profil Lulusan Athirah (PLA):</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {(Object.keys(PLA_DIMENSIONS_CONFIG) as AthirahProfilLulusan[]).map((dimKey) => {
              const cfg = PLA_DIMENSIONS_CONFIG[dimKey];
              const isSelected = modul.identifikasi.profilLulusanAthirah.includes(dimKey);
              return (
                <button
                  key={dimKey}
                  type="button"
                  onClick={() => togglePLA(dimKey)}
                  className={`flex items-start gap-2 p-2.5 rounded-xl border text-left text-xs transition active:scale-98 ${
                    isSelected
                      ? `${cfg.badgeColor} shadow-sm font-bold`
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <span className="mt-0.5">
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-current" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </span>
                  <div>
                    <span className="font-bold block leading-tight">{cfg.shortName}</span>
                    <span className="text-[10px] opacity-80 line-clamp-1">{cfg.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Program Khas Renstra / Kosmo */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>Program Khas Renstra Yayasan Hadji Kalla:</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(RENSTRA_PROGRAMS_CONFIG) as ProgramKhasRenstra[]).map((renstraKey) => {
              const cfg = RENSTRA_PROGRAMS_CONFIG[renstraKey];
              const isSelected = modul.identifikasi.programKhasRenstra.includes(renstraKey);
              return (
                <button
                  key={renstraKey}
                  type="button"
                  onClick={() => toggleRenstra(renstraKey)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition active:scale-95 ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kosmologi Kurikulum Note */}
        <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-3 text-xs text-amber-900 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-amber-950">
            <Compass className="w-3.5 h-3.5 text-amber-700" />
            Kosmologi Pendidikan Athirah (Tauhidik Terpadu):
          </span>
          <p className="text-[11px] leading-relaxed text-amber-900/90">
            {modul.identifikasi.kosmologiKurikulumNote}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BAGIAN SPIRITUALISASI (INTEGRASI NILAI ISLAM)                          */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/40 to-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              3
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
                III. Spiritualisasi (Integrasi Nilai Islam Tematik)
              </h2>
              <p className="text-[11px] text-emerald-700">
                Penyelarasan konsep materi dengan teks Al-Quran, Hadits Shahih, Sirah, & Turats
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Nilai: {modul.spiritualisasi.coreSpiritualValue}
          </span>
        </div>

        {/* Ayat Al-Quran */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <ScrollText className="w-4 h-4 text-emerald-600" />
              Ayat Al-Quran: QS. {modul.spiritualisasi.quranVerse.surahName} ({modul.spiritualisasi.quranVerse.surahNumber}) : {modul.spiritualisasi.quranVerse.ayahNumber}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Ayat Kauniyah & Qauliyah</span>
          </div>

          {/* Arabic Text with Harakat */}
          <div className="text-right text-xl sm:text-2xl font-serif text-emerald-950 leading-loose py-2 px-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60 font-arabic">
            {modul.spiritualisasi.quranVerse.arabicText}
          </div>

          <div className="text-xs text-slate-700 italic border-l-2 border-emerald-400 pl-3">
            &ldquo;{modul.spiritualisasi.quranVerse.translationId}&rdquo;
          </div>

          <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <strong className="text-slate-800 block mb-0.5">Tafsir & Kontekstualisasi Terhadap Materi:</strong>
            {modul.spiritualisasi.quranVerse.contextualTafsir}
          </div>
        </div>

        {/* Hadits & Sirah Tokoh */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Hadits Shahih */}
          {modul.spiritualisasi.hadith && (
            <div className="rounded-2xl border border-teal-200 bg-white p-4 space-y-2 shadow-sm">
              <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4 text-teal-600" />
                Hadits Shahih: {modul.spiritualisasi.hadith.narrator}
              </span>
              <div className="text-right text-base font-serif text-teal-950 py-1 font-arabic">
                {modul.spiritualisasi.hadith.arabicText}
              </div>
              <div className="text-xs text-slate-700 italic border-l-2 border-teal-400 pl-2">
                &ldquo;{modul.spiritualisasi.hadith.translationId}&rdquo;
              </div>
              <div className="text-[11px] text-slate-600 bg-teal-50/50 p-2 rounded-lg">
                <strong className="text-teal-900">Hikmah Karakter:</strong> {modul.spiritualisasi.hadith.pedagogicalMeaning}
              </div>
            </div>
          )}

          {/* Sirah Tokoh Islam */}
          {modul.spiritualisasi.islamicHistory && (
            <div className="rounded-2xl border border-blue-200 bg-white p-4 space-y-2 shadow-sm">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                Keteladanan Ilmuwan: {modul.spiritualisasi.islamicHistory.figureName}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 block">
                Era: {modul.spiritualisasi.islamicHistory.historicalEra}
              </span>
              <p className="text-xs text-slate-700">
                <strong>Kontribusi Sains:</strong> {modul.spiritualisasi.islamicHistory.contribution}
              </p>
              <div className="text-[11px] text-slate-600 bg-blue-50/50 p-2 rounded-lg">
                <strong className="text-blue-900">Nilai Inspiratif:</strong> {modul.spiritualisasi.islamicHistory.inspirationalValue}
              </div>
            </div>
          )}
        </div>

        {/* Kitab Klasik / Fatwa Rujukan */}
        {modul.spiritualisasi.classicalTextOrFatwa && (
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 flex items-start gap-2.5">
            <BookOpen className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-slate-900">
                Rujukan Turats / Fatwa: {modul.spiritualisasi.classicalTextOrFatwa.title}
              </strong>
              <span className="text-[10px] text-slate-500 ml-1">
                ({modul.spiritualisasi.classicalTextOrFatwa.authorOrIssuer})
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {modul.spiritualisasi.classicalTextOrFatwa.ethicalGuideline}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. BAGIAN DESAIN PEMBELAJARAN                                             */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                IV. Desain Pembelajaran (ABCD & Pedagogis)
              </h2>
              <p className="text-[11px] text-slate-500">
                Tujuan Pembelajaran format ABCD, TP Spiritual, sintaks model, dan diferensiasi
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            {modul.desainPembelajaran.pedagogicalPractices.modelPembelajaran}
          </span>
        </div>

        {/* Tujuan Pembelajaran ABCD */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/30 p-4 space-y-2.5 text-xs">
          <div className="font-bold text-sky-950 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-sky-600" />
            <span>Rumusan Tujuan Pembelajaran (Format ABCD & Spiritualized TP):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-white border border-sky-100">
              <strong className="text-sky-800 block">Audience (A):</strong>
              <span className="text-slate-700">{modul.desainPembelajaran.tujuanPembelajaran.audience}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-sky-100">
              <strong className="text-sky-800 block">Behavior (B):</strong>
              <span className="text-slate-700">{modul.desainPembelajaran.tujuanPembelajaran.behavior}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-sky-100">
              <strong className="text-sky-800 block">Condition (C):</strong>
              <span className="text-slate-700">{modul.desainPembelajaran.tujuanPembelajaran.condition}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-sky-100">
              <strong className="text-sky-800 block">Degree (D):</strong>
              <span className="text-slate-700">{modul.desainPembelajaran.tujuanPembelajaran.degree}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px]">
            <strong>Tujuan Pembelajaran Spiritual:</strong> {modul.desainPembelajaran.tujuanPembelajaran.integratedSpiritualGoal}
          </div>

          <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px]">
            <strong>Rumusan Lengkap TP:</strong> &ldquo;{modul.desainPembelajaran.tujuanPembelajaran.fullStatement}&rdquo;
          </div>
        </div>

        {/* Praktik Pedagogis & Diferensiasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <strong className="text-slate-900 block flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              Sintaks Model & Metode Pembelajaran:
            </strong>
            <p className="text-slate-700">
              <strong>Model:</strong> {modul.desainPembelajaran.pedagogicalPractices.modelPembelajaran}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {modul.desainPembelajaran.pedagogicalPractices.metodePembelajaran.map((m, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-700">
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <strong className="text-slate-900 block flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              Strategi Pembelajaran Berdiferensiasi:
            </strong>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div><strong className="text-slate-800">Konten:</strong> {modul.desainPembelajaran.pedagogicalPractices.diferensiasiKonten}</div>
              <div><strong className="text-slate-800">Proses:</strong> {modul.desainPembelajaran.pedagogicalPractices.diferensiasiProses}</div>
              <div><strong className="text-slate-800">Produk:</strong> {modul.desainPembelajaran.pedagogicalPractices.diferensiasiProduk}</div>
            </div>
          </div>
        </div>

        {/* Media & Lingkungan Kemitraan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Media Fisik</span>
            <div className="space-y-0.5 text-[11px] text-slate-700">
              {modul.desainPembelajaran.mediaDanLingkungan.mediaFisik.map((item, idx) => (
                <div key={idx}>• {item}</div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Sumber Belajar Digital</span>
            <div className="space-y-0.5 text-[11px] text-slate-700">
              {modul.desainPembelajaran.mediaDanLingkungan.sumberDigital.map((item, idx) => (
                <div key={idx}>• {item}</div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Lingkungan Belajar</span>
            <div className="space-y-0.5 text-[11px] text-slate-700">
              {modul.desainPembelajaran.mediaDanLingkungan.lingkunganBelajar.map((item, idx) => (
                <div key={idx}>• {item}</div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Kemitraan Sekolah</span>
            <div className="space-y-0.5 text-[11px] text-slate-700">
              {modul.desainPembelajaran.mediaDanLingkungan.kemitraan.map((item, idx) => (
                <div key={idx}>• {item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BAGIAN PENGALAMAN BELAJAR (3M, PM, MATRIKS MH/MA/MR)                   */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              5
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                V. Pengalaman Belajar (Alur 3M & Matriks Penguatan)
              </h2>
              <p className="text-[11px] text-slate-500">
                Alur Memahami, Mengaplikasi, Merefleksi dengan Penanda PM (Biru/Hijau/Orange) & Kode MH/MA/MR
              </p>
            </div>
          </div>

          {/* 3M Phase Filter Pills */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs">
            {(["ALL", "MEMAHAMI", "MENGAPLIKASI", "MEREFLEKSI"] as const).map((phase) => (
              <button
                key={phase}
                type="button"
                onClick={() => setActive3MPhase(phase)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  active3MPhase === phase
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {phase === "ALL" ? "Semua Alur 3M" : phase}
              </button>
            ))}
          </div>
        </div>

        {/* Legend of PM Principles & Matrix Codes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {(Object.keys(PM_PRINCIPLES_CONFIG) as (keyof typeof PM_PRINCIPLES_CONFIG)[]).map((pKey) => {
            const cfg = PM_PRINCIPLES_CONFIG[pKey];
            return (
              <div key={pKey} className={`p-2.5 rounded-xl border ${cfg.badgeClass} space-y-0.5`}>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[11px]">[{cfg.label}]</span>
                  <span className="text-[10px] font-mono font-bold">{cfg.colorCode} ({cfg.hex})</span>
                </div>
                <p className="text-[10px] opacity-90 leading-tight">{cfg.meaning}</p>
              </div>
            );
          })}
        </div>

        {/* List of Step Activities */}
        <div className="space-y-3">
          {filteredActivities.map((act) => {
            const pm = PM_PRINCIPLES_CONFIG[act.pmPrinciple];
            const mat = MATRIKS_PENGUATAN_INFO[act.matrixCode];
            return (
              <div
                key={act.stepNumber}
                className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-slate-50 transition space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[11px]">
                      {act.stepNumber}
                    </span>
                    <span className="font-bold text-slate-900">{act.title}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">({act.phase})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* PM Principle Badge */}
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${pm?.badgeClass}`}>
                      [{pm?.label || act.pmPrinciple}] - {pm?.colorCode}
                    </span>
                    {/* Matrix Code Badge */}
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold" title={mat?.desc}>
                      {act.matrixCode} ({mat?.bloom})
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {act.durationMinutes} Menit
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <strong className="text-slate-900 block mb-0.5">Aktivitas Guru:</strong>
                    <p className="text-slate-600 leading-relaxed">{act.teacherActivity}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <strong className="text-slate-900 block mb-0.5">Aktivitas Peserta Didik:</strong>
                    <p className="text-slate-600 leading-relaxed">{act.studentActivity}</p>
                  </div>
                </div>

                {act.differentiatedTier && (
                  <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded inline-block">
                    Diferensiasi: {act.differentiatedTier.replace(/_/g, " ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Matriks Penguatan Aktivitas Table */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <TableIcon className="w-4 h-4 text-indigo-600" />
              Matriks Penguatan Aktivitas Athirah (Activity Reinforcement Matrix):
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Kode Standar: MH-1..3, MA-1..3, MR-1..3</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase">
                <tr>
                  <th className="p-2 border border-slate-200 text-center w-12">Langkah</th>
                  <th className="p-2 border border-slate-200">Aktivitas Pembelajaran</th>
                  <th className="p-2 border border-slate-200 text-center w-20">Fase 3M</th>
                  <th className="p-2 border border-slate-200 text-center w-20">Durasi</th>
                  <th className="p-2 border border-slate-200 text-center w-32">Prinsip PM</th>
                  <th className="p-2 border border-slate-200 text-center w-28">Kode Matriks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {allActivities.map((act) => {
                  const pm = PM_PRINCIPLES_CONFIG[act.pmPrinciple];
                  const mat = MATRIKS_PENGUATAN_INFO[act.matrixCode];
                  return (
                    <tr key={act.stepNumber} className="hover:bg-slate-50/80">
                      <td className="p-2 border border-slate-200 text-center font-bold">{act.stepNumber}</td>
                      <td className="p-2 border border-slate-200 font-medium text-slate-900">{act.title}</td>
                      <td className="p-2 border border-slate-200 text-center font-semibold text-slate-600">{act.phase}</td>
                      <td className="p-2 border border-slate-200 text-center font-bold text-slate-800">{act.durationMinutes} mnt</td>
                      <td className="p-2 border border-slate-200 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pm?.badgeClass}`}>
                          {pm?.label} [{pm?.colorCode}]
                        </span>
                      </td>
                      <td className="p-2 border border-slate-200 text-center">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono font-bold text-[10px]">
                          {act.matrixCode}
                        </span>
                        <div className="text-[9px] text-slate-500">{mat?.bloom}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. BAGIAN LAMPIRAN ASESMEN (TABEL 8 KOLOM WAJIB)                          */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs">
              6
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                VI. Lampiran Asesmen Pembelajaran (Tabel 8 Kolom Resmi)
              </h2>
              <p className="text-[11px] text-slate-500">
                Struktur wajib asesmen kurikulum Athirah: Tulis vs Nontulis dan Checkbox LKPD
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {modul.lampiranAsesmen.length} Butir Asesmen
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-extrabold uppercase border-b border-slate-200">
              <tr>
                <th className="p-2.5 text-center w-10 border-r border-slate-200">No</th>
                <th className="p-2.5 w-32 border-r border-slate-200">Materi Pokok</th>
                <th className="p-2.5 w-28 border-r border-slate-200">Tujuan (TP)</th>
                <th className="p-2.5 border-r border-slate-200">Indikator Asesmen</th>
                <th className="p-2.5 text-center w-24 border-r border-slate-200">Jenis Asesmen</th>
                <th className="p-2.5 border-r border-slate-200">Uraian Soal Tertulis</th>
                <th className="p-2.5 border-r border-slate-200">Deskripsi Aktivitas Nontulis</th>
                <th className="p-2.5 text-center w-16">LKPD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {modul.lampiranAsesmen.map((item) => (
                <tr key={item.no} className="hover:bg-slate-50">
                  <td className="p-2.5 text-center font-bold text-slate-800 border-r border-slate-200">
                    {item.no}
                  </td>
                  <td className="p-2.5 font-medium text-slate-900 border-r border-slate-200">
                    {item.materiPokok}
                  </td>
                  <td className="p-2.5 border-r border-slate-200">
                    <span className="font-bold text-indigo-700 block">{item.tpCode}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-2">{item.tpDescription}</span>
                  </td>
                  <td className="p-2.5 text-slate-700 border-r border-slate-200">
                    {item.indikatorAsesmen}
                  </td>
                  <td className="p-2.5 text-center border-r border-slate-200">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.jenisAsesmen === "TULIS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {item.jenisAsesmen}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-600 border-r border-slate-200">
                    {item.uraianSoalTertulis || "-"}
                  </td>
                  <td className="p-2.5 text-slate-600 border-r border-slate-200">
                    {item.deskripsiAktivitasNontulis || "-"}
                  </td>
                  <td className="p-2.5 text-center font-bold">
                    {item.isLkpdAttached ? (
                      <span className="text-emerald-600 text-sm" title="LKPD Tersedia">
                        ✓
                      </span>
                    ) : (
                      <span className="text-rose-500 text-sm" title="LKPD Tidak Tersedia">
                        ✗
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
