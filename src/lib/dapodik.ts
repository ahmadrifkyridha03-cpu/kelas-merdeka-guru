/**
 * Dapodik (Data Pokok Pendidikan) Roster Parser & Exporter
 * Compliant with:
 * - Kemendikbudristek Dapodik Excel/CSV Export Standards
 * - RFC 4180 Quotation and Escaping Specifications
 * - Indonesian Locale Windows Excel Semicolon Delimiters
 * - Strict 10-digit NISN Leading Zero Preservation
 */

import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { Student } from "../types/index.ts";

export interface DapodikStudent extends Student {
  isPendingNisn?: boolean;
  birthPlace?: string;
  birthDate?: string;
  nik?: string;
}

export interface ParseDapodikResult {
  success: boolean;
  students: DapodikStudent[];
  warnings: string[];
  errors: string[];
  totalRows: number;
  importedCount: number;
}

/**
 * Sniffs the primary delimiter (comma, semicolon, or tab) from the header line
 */
export function detectDelimiter(firstLine: string): string {
  let inQuotes = false;
  let commas = 0;
  let semicolons = 0;
  let tabs = 0;

  for (let i = 0; i < firstLine.length; i++) {
    const char = firstLine[i];
    if (char === '"') {
      if (inQuotes && firstLine[i + 1] === '"') {
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes) {
      if (char === ";") semicolons++;
      else if (char === ",") commas++;
      else if (char === "\t") tabs++;
    }
  }

  if (tabs > semicolons && tabs > commas) return "\t";
  if (semicolons >= commas) return ";";
  return ",";
}

/**
 * Normalizes gender strings into standard 'L' (Laki-laki) or 'P' (Perempuan)
 */
export function normalizeGender(val: string): "L" | "P" {
  const clean = (val || "").trim().toUpperCase();
  if (clean.startsWith("P") || clean === "PEREMPUAN" || clean === "WANITA" || clean === "W") {
    return "P";
  }
  return "L";
}

/**
 * Normalizes header strings for flexible matching against official Dapodik variants
 */
function normalizeHeaderName(header: string): string {
  return (header || "").toLowerCase().trim().replace(/[\r\n\t]/g, " ");
}

/**
 * Parses a 2D array of string cells into structured DapodikStudent records.
 * Can be used by both CSV (via PapaParse / custom) and Excel (via SheetJS).
 */
export function parseDapodikGrid(
  rows: string[][],
  classId: string = "default-class"
): ParseDapodikResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const students: DapodikStudent[] = [];

  // Filter out completely empty rows
  const cleanRows = rows.filter(r => r && r.some(cell => String(cell).trim().length > 0));

  if (cleanRows.length < 2) {
    return {
      success: false,
      students: [],
      warnings: [],
      errors: ["File Dapodik kosong atau tidak memiliki baris data siswa."],
      totalRows: cleanRows.length,
      importedCount: 0,
    };
  }

  // Find column indices from header row
  const rawHeaders = cleanRows[0].map(h => normalizeHeaderName(String(h)));
  
  const nameIdx = rawHeaders.findIndex(
    h => (h.includes("nama") || h.includes("peserta didik") || h.includes("siswa")) &&
         !h.includes("ayah") && !h.includes("ibu") && !h.includes("wali")
  );
  
  const nisnIdx = rawHeaders.findIndex(
    h => h.includes("nisn") || h.includes("nomor induk siswa nasional")
  );
  
  const nisIdx = rawHeaders.findIndex(
    h => (h.includes("nis") || h.includes("nipd") || h.includes("nomor induk")) &&
         !h.includes("nisn")
  );
  
  const genderIdx = rawHeaders.findIndex(
    h => h.includes("kelamin") || h === "jk" || h.includes("l/p") || h === "sex" || h === "gender"
  );
  
  const specialNeedsIdx = rawHeaders.findIndex(
    h => h.includes("kebutuhan khusus") || h.includes("catatan") || h.includes("diagnostik")
  );

  const nikIdx = rawHeaders.findIndex(
    h => h.includes("nik") || h.includes("nomor induk kependudukan")
  );

  const birthPlaceIdx = rawHeaders.findIndex(h => h.includes("tempat lahir"));
  const birthDateIdx = rawHeaders.findIndex(h => h.includes("tanggal lahir"));

  if (nameIdx === -1) {
    return {
      success: false,
      students: [],
      warnings: [],
      errors: ["Kolom wajib 'Nama Peserta Didik' tidak ditemukan dalam berkas."],
      totalRows: cleanRows.length,
      importedCount: 0,
    };
  }

  const headerColCount = rawHeaders.length;

  for (let rowIdx = 1; rowIdx < cleanRows.length; rowIdx++) {
    const row = cleanRows[rowIdx];
    const nonBlankCells = row.filter(c => String(c).trim().length > 0);

    // Skip empty trailing rows
    if (nonBlankCells.length === 0) continue;

    // Malformed row guard: significantly fewer columns than header (e.g. < 5 cols when header >= 8)
    if (row.length < 5 && headerColCount >= 8) {
      warnings.push(`Baris ${rowIdx + 1}: Baris tidak valid atau kolom tidak lengkap (${row.length}/${headerColCount} kolom).`);
      continue;
    }

    const rawName = row[nameIdx] ? String(row[nameIdx]).trim() : "";
    if (!rawName) {
      warnings.push(`Baris ${rowIdx + 1}: Nama peserta didik kosong, dilewati.`);
      continue;
    }

    // Preserve NISN as string with leading zeroes intact
    let rawNisn = nisnIdx !== -1 && row[nisnIdx] ? String(row[nisnIdx]).trim() : "";
    let isPendingNisn = false;

    // Handle early grade cohorts missing official NISN
    if (!rawNisn) {
      isPendingNisn = true;
      rawNisn = `PENDING-${rowIdx}-${Date.now().toString().slice(-4)}`;
      warnings.push(`Baris ${rowIdx + 1}: Siswa "${rawName}" belum memiliki NISN resmi (diberikan kode sementara ${rawNisn}).`);
    } else {
      // Clean quotes or whitespace if present
      rawNisn = rawNisn.replace(/^["']|["']$/g, "").trim();
    }

    const rawNis = nisIdx !== -1 && row[nisIdx] ? String(row[nisIdx]).trim().replace(/^["']|["']$/g, "") : undefined;
    const rawGender = genderIdx !== -1 && row[genderIdx] ? normalizeGender(String(row[genderIdx])) : "L";
    const specialNeeds = specialNeedsIdx !== -1 && row[specialNeedsIdx] ? String(row[specialNeedsIdx]).trim() : undefined;
    const nik = nikIdx !== -1 && row[nikIdx] ? String(row[nikIdx]).trim() : undefined;
    const birthPlace = birthPlaceIdx !== -1 && row[birthPlaceIdx] ? String(row[birthPlaceIdx]).trim() : undefined;
    const birthDate = birthDateIdx !== -1 && row[birthDateIdx] ? String(row[birthDateIdx]).trim() : undefined;

    const student: DapodikStudent = {
      id: `std-${Date.now()}-${rowIdx}`,
      classId,
      nisn: rawNisn,
      nis: rawNis || undefined,
      fullName: rawName,
      gender: rawGender,
      specialNeeds: specialNeeds || undefined,
      initialDiagnosticNotes: specialNeeds ? `Kebutuhan: ${specialNeeds}` : undefined,
      status: "AKTIF",
      bonusPoints: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPendingNisn,
      nik: nik || undefined,
      birthPlace: birthPlace || undefined,
      birthDate: birthDate || undefined,
    };

    students.push(student);
  }

  return {
    success: errors.length === 0 && students.length > 0,
    students,
    warnings,
    errors,
    totalRows: cleanRows.length - 1,
    importedCount: students.length,
  };
}

/**
 * Parses raw CSV string from Dapodik file
 * Features:
 * - UTF-8 BOM removal
 * - Auto-detects comma, semicolon, tab
 * - Preserves RFC 4180 quotes & academic titles ("Drs. Syukri, M.Pd.")
 * - Preserves leading zeros on NISN ("0081234567")
 */
export function parseDapodikCSV(
  csvContent: string,
  classId: string = "default-class"
): ParseDapodikResult {
  // 1. Strip UTF-8 Byte Order Mark if present
  let clean = (csvContent || "").replace(/^\uFEFF/, "").trim();
  if (!clean) {
    return {
      success: false,
      students: [],
      warnings: [],
      errors: ["File CSV kosong."],
      totalRows: 0,
      importedCount: 0,
    };
  }

  // 2. Identify first line and sniff delimiter
  const firstLine = clean.split(/\r?\n/)[0];
  const delimiter = detectDelimiter(firstLine);

  // 3. Parse via PapaParse with string typing
  const parseResult = Papa.parse<string[]>(clean, {
    delimiter,
    skipEmptyLines: false, // We handle empty & malformed rows with custom guards
    dynamicTyping: false,  // CRITICAL: Prevent conversion of "0081234567" to number 81234567
  });

  const rows = parseResult.data as string[][];
  return parseDapodikGrid(rows, classId);
}

/**
 * Parses Excel (.xlsx, .xls) buffer from Dapodik export
 * Uses SheetJS with raw: false to ensure formatted strings preserve leading zeros.
 */
export function parseDapodikExcel(
  data: ArrayBuffer | Uint8Array | Buffer,
  classId: string = "default-class"
): ParseDapodikResult {
  try {
    const workbook = XLSX.read(data, {
      type: "array",
      cellText: true,
      raw: false, // Retain string representations so leading zeros are preserved
    });

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        students: [],
        warnings: [],
        errors: ["Lembar kerja (sheet) tidak ditemukan dalam berkas Excel."],
        totalRows: 0,
        importedCount: 0,
      };
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      raw: false,
      defval: "",
    });

    return parseDapodikGrid(rows, classId);
  } catch (err: any) {
    return {
      success: false,
      students: [],
      warnings: [],
      errors: [`Gagal membaca berkas Excel: ${err?.message || "Format tidak valid"}`],
      totalRows: 0,
      importedCount: 0,
    };
  }
}

/**
 * Exports roster to RFC 4180 compliant CSV string
 */
export function exportRosterToCSV(students: Student[], className?: string): string {
  const headers = ["No", "Nama Peserta Didik", "NISN", "NIS", "Jenis Kelamin", "Kebutuhan Khusus", "Status"];
  
  function escapeCSVField(val: string | number | undefined | null): string {
    if (val === undefined || val === null) return "";
    const str = String(val);
    if (str.includes(",") || str.includes(";") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const lines: string[] = [];
  lines.push(headers.join(","));

  students.forEach((s, idx) => {
    const row = [
      idx + 1,
      escapeCSVField(s.fullName),
      escapeCSVField(s.nisn),
      escapeCSVField(s.nis || ""),
      escapeCSVField(s.gender),
      escapeCSVField(s.specialNeeds || "-"),
      escapeCSVField(s.status),
    ];
    lines.push(row.join(","));
  });

  return lines.join("\r\n");
}

/**
 * Exports roster to Excel (.xlsx) binary buffer
 */
export function exportRosterToExcel(students: Student[], className: string = "Roster"): Uint8Array {
  const headers = ["No", "Nama Peserta Didik", "NISN", "NIS", "Jenis Kelamin", "Kebutuhan Khusus", "Status", "Poin Bonus"];
  
  const data = [
    headers,
    ...students.map((s, idx) => [
      idx + 1,
      s.fullName,
      s.nisn,
      s.nis || "-",
      s.gender,
      s.specialNeeds || "-",
      s.status,
      s.bonusPoints,
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths for clean readability
  worksheet["!cols"] = [
    { wch: 6 },  // No
    { wch: 32 }, // Nama
    { wch: 16 }, // NISN
    { wch: 12 }, // NIS
    { wch: 14 }, // JK
    { wch: 20 }, // Kebutuhan Khusus
    { wch: 10 }, // Status
    { wch: 12 }, // Poin Bonus
  ];

  const workbook = XLSX.utils.book_new();
  const safeSheetName = (className || "Daftar_Siswa").replace(/[:\\/?*[\]]/g, "_").slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
}

/**
 * Helper to download file in the browser environment
 */
export function downloadFile(
  content: any,
  fileName: string,
  mimeType: string = "application/octet-stream"
): void {
  if (typeof window === "undefined" || !window.document) return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
