"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  FileText, 
  Download, 
  Sparkles, 
  Printer, 
  CheckCircle2, 
  Copy, 
  Eye, 
  UploadCloud,
  FileCheck2,
  Clock,
  Layers,
  HelpCircle,
  BrainCircuit
} from "lucide-react";
import { mockTPs } from "@/lib/mockData";

export default function LessonPlansPage() {
  const [selectedMeeting, setSelectedMeeting] = useState(1);
  const [activeVersion, setActiveVersion] = useState<"siswa" | "guru">("siswa");
  const [isGeneratingModul, setIsGeneratingModul] = useState(false);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [templateStatus, setTemplateStatus] = useState<string | null>(null);

  const handleSimulateTemplateUpload = () => {
    setIsUploadingTemplate(true);
    setTimeout(() => {
      setIsUploadingTemplate(false);
      setTemplateStatus("Template Dokumen Sekolah Terdeteksi: Kop SMAN 1 Merdeka Belajar & Format Tanda Tangan Kepala Sekolah Berhasil Dipetakan!");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md mb-2">
            <BookOpen className="h-3.5 w-3.5" /> Modul 5: Modul Ajar & LKPD Kurikulum Merdeka
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pembuat Modul Ajar Lengkap & LKPD Per Pertemuan
          </h1>
          <p className="text-sm text-slate-500">
            Dibuat otomatis dari item ATP & jadwal Prosem. Memuat 8 Dimensi Profil Kelulusan, sintaks model pembelajaran, dan LKPD 2 versi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Printer className="h-4 w-4" /> Cetak PDF LKPD
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition"
          >
            <Download className="h-4 w-4" /> Unduh Modul Ajar (.docx)
          </button>
        </div>
      </div>

      {/* Upload School Template Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Unggah Template Format Sekolah</h3>
            <p className="text-[11px] text-slate-500">
              Sistem AI secara otomatis mengenali kop surat sekolah, format tabel, dan kolom tanda tangan tanpa salah.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSimulateTemplateUpload}
          disabled={isUploadingTemplate}
          className="rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 px-4 py-2 text-xs font-bold text-rose-800 transition whitespace-nowrap"
        >
          {isUploadingTemplate ? "Mendeteksi Format..." : "Unggah Template (.docx / .pdf)"}
        </button>
      </div>

      {templateStatus && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{templateStatus}</span>
        </div>
      )}

      {/* Meeting Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[1, 2, 3, 4, 5, 6].map(num => (
          <button
            key={num}
            onClick={() => setSelectedMeeting(num)}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
              selectedMeeting === num
                ? "bg-rose-600 text-white shadow-sm shadow-rose-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Pertemuan ke-{num} (3 JP)
          </button>
        ))}
      </div>

      {/* Two Column Layout: Modul Ajar Left, LKPD Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Modul Ajar Specification */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Komponen Resmi BSKAP 2024</span>
              <h2 className="text-base font-bold text-slate-900">
                Modul Ajar Pertemuan ke-{selectedMeeting}
              </h2>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-rose-600" /> Regenerasi Bagian
            </button>
          </div>

          {/* Bagian 1: Informasi Umum */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-600"></span> I. Informasi Umum
            </h3>
            <div className="rounded-xl bg-slate-50 p-4 text-xs space-y-2 border border-slate-200/80">
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Penyusun: <strong className="text-slate-900">Ahmad Fadillah, S.Pd.</strong></div>
                <div>Satuan Pendidikan: <strong className="text-slate-900">SMAN 1 Merdeka Belajar</strong></div>
                <div>Fase / Kelas: <strong className="text-slate-900">Fase E / Kelas X</strong></div>
                <div>Alokasi Waktu: <strong className="text-slate-900">3 JP (3 x 45 Menit)</strong></div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Dimensi Profil Kelulusan:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">Penalaran Kritis</span>
                  <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">Kreativitas</span>
                  <span className="rounded bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[10px] font-bold">Kolaborasi & Gotong Royong</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian 2: Komponen Inti */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-600"></span> II. Komponen Inti
            </h3>
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 text-xs text-slate-700">
              <div>
                <strong className="text-slate-900">Tujuan Pembelajaran (TP):</strong>
                <p className="mt-0.5 text-slate-600 leading-relaxed">
                  Peserta didik mampu menerapkan strategi algoritmik standar untuk menyelesaikan persoalan pemilahan (Bubble Sort & Selection Sort) secara kolaboratif.
                </p>
              </div>

              <div>
                <strong className="text-slate-900">Pemahaman Bermakna:</strong>
                <p className="mt-0.5 text-slate-600 leading-relaxed">
                  Komputer memerlukan instruksi sistematis untuk mengatur data dalam jumlah masif agar pencarian dapat dilakukan dengan sangat efisien.
                </p>
              </div>

              <div>
                <strong className="text-slate-900">Pertanyaan Pemantik:</strong>
                <ul className="list-disc list-inside mt-0.5 text-slate-600 space-y-0.5">
                  <li>Bagaimana cara Anda menyusun deretan kartu remi acak menjadi berurutan paling cepat?</li>
                  <li>Mengapa buku di perpustakaan selalu diurutkan berdasarkan kode nomor tertentu?</li>
                </ul>
              </div>

              <div>
                <strong className="text-slate-900">Kegiatan Pembelajaran (Pendahuluan, Inti, Penutup):</strong>
                <div className="mt-2 space-y-2">
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                    <span className="font-bold text-slate-800">1. Pendahuluan (15 Menit):</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">Doa, presensi, apersepsi peragaan kartu acak di depan kelas, dan penyampaian tujuan pembelajaran.</p>
                  </div>
                  <div className="rounded-lg bg-blue-50/50 p-2.5 border border-blue-200">
                    <span className="font-bold text-blue-900">2. Kegiatan Inti (105 Menit) - Problem Based Learning:</span>
                    <p className="text-[11px] text-blue-800 mt-0.5">Orientasi masalah, pembagian kelompok LKPD, eksplorasi simulasi Bubble Sort, diferensiasi proses (bantuan visual kartu untuk kelompok bimbingan), dan presentasi.</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                    <span className="font-bold text-slate-800">3. Penutup (15 Menit):</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">Refleksi bersama, kuis formatif singkat, dan penyampaian materi pertemuan berikutnya.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Lembar Kerja Peserta Didik (LKPD) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Lembar Kerja Terpadu</span>
              <h2 className="text-base font-bold text-slate-900">
                LKPD Pertemuan ke-{selectedMeeting}
              </h2>
            </div>

            {/* Version Switcher: Siswa vs Guru */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveVersion("siswa")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeVersion === "siswa"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Versi Siswa
              </button>
              <button
                type="button"
                onClick={() => setActiveVersion("guru")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeVersion === "guru"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Versi Guru (Kunci)
              </button>
            </div>
          </div>

          {/* LKPD Preview Box */}
          <div className="rounded-xl border border-slate-200 p-5 bg-white space-y-4 text-xs">
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="font-bold text-sm uppercase text-slate-900">
                Lembar Kerja Peserta Didik (LKPD)
              </div>
              <div className="text-[11px] text-slate-500">Materi: Strategi Algoritma Pemilahan (Sorting) • Pertemuan {selectedMeeting}</div>
              <div className="mt-2 grid grid-cols-2 text-left text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                <div>Kelompok: ................................</div>
                <div>Kelas: X-A</div>
                <div>Nama Anggota: .......................</div>
                <div>Tanggal: .............................</div>
              </div>
            </div>

            <div>
              <strong className="text-slate-900 block mb-1">A. Petunjuk Belajar:</strong>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                <li>Bacalah instruksi dan skenario persoalan dengan seksama.</li>
                <li>Gunakan 5 kartu angka yang telah dibagikan untuk mensimulasikan langkah algoritma.</li>
                <li>Catat setiap pertukaran posisi pada tabel kerja di bawah ini.</li>
              </ol>
            </div>

            <div>
              <strong className="text-slate-900 block mb-1">B. Aktivitas Simulasi:</strong>
              <p className="text-slate-600 leading-relaxed">
                Diberikan deret kartu angka: <code>[8, 3, 5, 1, 9]</code>. Lakukan algoritma <strong>Bubble Sort</strong> secara bertahap hingga seluruh kartu terurut dari kecil ke besar.
              </p>
            </div>

            {/* Answer or Solution Area */}
            <div>
              <strong className="text-slate-900 block mb-1">C. Ruang Kerja & Hasil Pemilahan:</strong>
              {activeVersion === "guru" ? (
                <div className="rounded-xl bg-purple-50 p-3 text-[11px] font-mono text-purple-900 border border-purple-200 space-y-1">
                  <div className="font-bold text-purple-950 uppercase tracking-wider mb-1">
                    [KUNCI JAWABAN GURU & PEDOMAN PENSKORAN]
                  </div>
                  <div>• Pass 1: [3, 5, 1, 8, 9] (3 pertukaran) - Skor 30</div>
                  <div>• Pass 2: [3, 1, 5, 8, 9] (1 pertukaran) - Skor 30</div>
                  <div>• Pass 3: [1, 3, 5, 8, 9] (1 pertukaran) - Skor 30</div>
                  <div>• Pass 4: Tidak ada pertukaran (selesai) - Skor 10</div>
                  <div className="pt-1 font-bold text-purple-900">Total Nilai Maksimal: 100 (Masuk Kolom Nilai TP-01 Formatif)</div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 italic">
                  [Ruang Jawaban Siswa: Tuliskan barisan angka pada setiap tahap pertukaran di sini]
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {activeVersion === "siswa" ? "Versi siap bagikan ke siswa" : "Versi pegangan guru dengan rubrik nilai"}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              <Download className="h-4 w-4" /> Unduh LKPD {activeVersion === "siswa" ? "Siswa" : "Guru"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

