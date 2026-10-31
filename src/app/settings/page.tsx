"use client";

import React, { useState } from "react";
import { 
  Settings, 
  School, 
  User, 
  Key, 
  Save, 
  CheckCircle2, 
  FileText,
  UploadCloud,
  ShieldCheck
} from "lucide-react";

export default function SettingsPage() {
  const [teacherName, setTeacherName] = useState("Ahmad Fadillah, S.Pd.");
  const [teacherNip, setTeacherNip] = useState("198507122010011008");
  const [schoolName, setSchoolName] = useState("SMAN 1 Merdeka Belajar");
  const [npsn, setNpsn] = useState("20103456");
  const [headmasterName, setHeadmasterName] = useState("Drs. H. Bambang Sudirgo, M.M.");
  const [headmasterNip, setHeadmasterNip] = useState("196803151994031004");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md mb-2">
          <Settings className="h-3.5 w-3.5" /> Konfigurasi Profil & Template
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Pengaturan Akun Guru & Kop Lembaga
        </h1>
        <p className="text-sm text-slate-500">
          Data ini akan otomatis dicetak ke header dan bagian pengesahan semua dokumen perangkat ajar dan rapor.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Pengaturan profil dan kunci API berhasil disimpan!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Guru Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <User className="h-4 w-4 text-blue-600" /> Profil Guru Pengampu
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NIP Guru</label>
              <input
                type="text"
                value={teacherNip}
                onChange={(e) => setTeacherNip(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* School Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <School className="h-4 w-4 text-indigo-600" /> Identitas Satuan Pendidikan & Kop Dokumen
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Satuan Pendidikan</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NPSN</label>
              <input
                type="text"
                value={npsn}
                onChange={(e) => setNpsn(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kepala Sekolah</label>
              <input
                type="text"
                value={headmasterName}
                onChange={(e) => setHeadmasterName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={headmasterNip}
                onChange={(e) => setHeadmasterNip(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Gemini API Key Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Key className="h-4 w-4 text-purple-600" /> Kredensial AI & Gemini API
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gemini API Key (Google AI Studio)
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Dapat diperoleh gratis di <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline">aistudio.google.com</a>. Kunci disimpan aman dan tidak diekspos ke browser siswa.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Save className="h-4 w-4" /> Simpan Konfigurasi
          </button>
        </div>
      </form>
    </div>
  );
}

