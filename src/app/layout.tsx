import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "KelasMerdeka - Platform Manajemen Kelas & Guru Copilot",
  description: "Aplikasi manajemen kelas guru berstandar Kurikulum Merdeka dengan otomasi perangkat ajar dan buku nilai terpadu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased bg-slate-50 min-h-screen">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

