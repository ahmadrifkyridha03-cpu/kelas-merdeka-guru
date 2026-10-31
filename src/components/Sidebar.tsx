"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  Sparkles, 
  FileSpreadsheet, 
  BookOpen, 
  Settings,
  CalendarCheck2,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Utama",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ]
  },
  {
    title: "Manajemen Kelas",
    items: [
      { name: "Kelas & Siswa", href: "/classes", icon: Users, badge: "Dapodik" },
      { name: "Presensi Harian", href: "/attendance", icon: CalendarCheck2 },
    ]
  },
  {
    title: "Penilaian & Hasil",
    items: [
      { name: "Input Nilai (TP & KKTP)", href: "/grades", icon: Calculator },
      { name: "Nilai Tambah & Remedial", href: "/remedial", icon: Sparkles, badge: "AI Ready" },
    ]
  },
  {
    title: "Otomasi Kurikulum",
    items: [
      { name: "Perangkat Ajar (CP-Prosem)", href: "/curriculum", icon: FileSpreadsheet },
      { name: "Modul Ajar & LKPD", href: "/lesson-plans", icon: BookOpen, badge: "Otomatis" },
    ]
  },
  {
    title: "Konfigurasi",
    items: [
      { name: "Profil & Template Kop", href: "/settings", icon: Settings },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <nav className="space-y-6">
        {navigationItems.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {section.title}
            </div>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-4 w-4 transition", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                          isActive
                            ? "bg-blue-700/80 text-white"
                            : "bg-blue-50 text-blue-700 border border-blue-200/50"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Kurikulum Status Card */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
        <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
          <span>Standar Regulasi</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Sesuai Keputusan Kepala BSKAP No. 032/H/KR/2024 & Panduan PPA 2024.
        </p>
      </div>
    </aside>
  );
}

