"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Bell, UserCheck, ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">KelasMerdeka</span>
              <span className="ml-2 hidden rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 sm:inline-block border border-blue-200/60">
                Guru Copilot
              </span>
            </div>
          </Link>
        </div>

        {/* School & Academic Info */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="font-medium">SMAN 1 Merdeka Belajar</span>
            <span className="text-slate-400">|</span>
            <span className="font-semibold text-slate-900">TP 2026/2027 (Ganjil)</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            title="Notifikasi"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600"></span>
          </button>

          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-semibold text-sm border border-blue-200">
              <UserCheck className="h-5 w-5 text-blue-700" />
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-semibold text-slate-900">Ahmad Fadillah, S.Pd.</div>
              <div className="text-slate-500">Guru Informatika (Fase E & F)</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

