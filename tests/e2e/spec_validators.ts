/**
 * Authoritative Specification Validators & Reference Calculation Oracles
 * Strictly adhering to PRD.md, PROJECT.md, and spec_miner_athirah_2/spec_analysis.md
 */

import {
  ATHIRAH_UNITS,
  ATHIRAH_PLA_DIMENSIONS,
  ATHIRAH_RENSTRA_PROGRAMS,
  PEDAGOGI_MERDEKA_PRINCIPLES,
  MATRIKS_PENGUATAN_CODES,
} from "./fixtures.ts";

export interface KKTPResult {
  isMastered: boolean;
  status: "TUNTAS" | "PERLU_BIMBINGAN" | "PENGAYAAN";
  tierLabel: string;
  recommendation: string;
  numericScore?: number;
}

/**
 * KKTP Continuous Interval Piecewise Evaluator
 * Partitions:
 * - [0.00, 40.00]: Tier 1 - Perlu Bimbingan Dasar
 * - (40.00, 65.00]: Tier 2 - Perlu Bimbingan Khusus
 * - (65.00, 85.00]: Tier 3 - Tuntas Standar
 * - (85.00, 100.00]: Tier 4 - Pengayaan Khusus
 */
export function evaluateKKTPReference(
  model: "DESKRIPSI" | "RUBRIK" | "INTERVAL",
  scoreOrCriteria: number | boolean[] | number[],
  config: { threshold?: number; rubricMax?: number } = {}
): KKTPResult {
  if (model === "INTERVAL") {
    const score = Number(scoreOrCriteria);
    if (isNaN(score)) {
      throw new Error("KKTP Interval evaluation requires a valid numeric score");
    }
    if (score < 0 || score > 100) {
      throw new Error(`Score ${score} out of valid statutory range [0, 100]`);
    }

    if (score <= 40.0) {
      return {
        isMastered: false,
        status: "PERLU_BIMBINGAN",
        tierLabel: "Perlu Bimbingan Dasar",
        recommendation: "Remedial Intensif Seluruh Materi",
        numericScore: score,
      };
    } else if (score <= 65.0) {
      return {
        isMastered: false,
        status: "PERLU_BIMBINGAN",
        tierLabel: "Perlu Bimbingan Khusus",
        recommendation: "Remedial Parsial Bagian yang Belum Dikuasai",
        numericScore: score,
      };
    } else if (score <= 85.0) {
      return {
        isMastered: true,
        status: "TUNTAS",
        tierLabel: "Tuntas Standar",
        recommendation: "Tuntas Standar, Lanjut Materi Berikutnya",
        numericScore: score,
      };
    } else {
      return {
        isMastered: true,
        status: "PENGAYAAN",
        tierLabel: "Pengayaan Khusus / Mahir",
        recommendation: "Pengayaan Khusus / Pendalaman Tantangan",
        numericScore: score,
      };
    }
  }

  if (model === "DESKRIPSI") {
    if (!Array.isArray(scoreOrCriteria)) {
      throw new Error("KKTP Deskripsi model requires an array of boolean criteria");
    }
    const criteria = scoreOrCriteria as boolean[];
    const passedCount = criteria.filter(Boolean).length;
    const isMastered = passedCount === criteria.length;
    return {
      isMastered,
      status: isMastered ? "TUNTAS" : "PERLU_BIMBINGAN",
      tierLabel: isMastered ? "Tuntas Kriteria" : "Belum Memenuhi Seluruh Kriteria",
      recommendation: isMastered
        ? "Seluruh kriteria tercapai, lanjut ke TP berikutnya"
        : `Tercapai ${passedCount}/${criteria.length} kriteria. Remedial pada kriteria yang belum tuntas`,
    };
  }

  if (model === "RUBRIK") {
    // 4-level scale (1: Perlu Bimbingan, 2: Cukup, 3: Baik, 4: Sangat Baik)
    const level = Number(scoreOrCriteria);
    if (![1, 2, 3, 4].includes(level)) {
      throw new Error("KKTP Rubrik scale requires a level between 1 and 4");
    }
    const isMastered = level >= 3;
    const status = level === 4 ? "PENGAYAAN" : level === 3 ? "TUNTAS" : "PERLU_BIMBINGAN";
    const labels: Record<number, string> = {
      1: "Perlu Bimbingan (Level 1)",
      2: "Cukup (Level 2)",
      3: "Baik / Tuntas (Level 3)",
      4: "Sangat Baik / Mahir (Level 4)",
    };
    return {
      isMastered,
      status,
      tierLabel: labels[level],
      recommendation: isMastered
        ? level === 4
          ? "Mahir: Berikan tantangan pengayaan"
          : "Baik: Lanjutkan pembelajaran materi berikutnya"
        : "Belum tuntas: Perlu bimbingan intervensi guru",
      numericScore: level,
    };
  }

  throw new Error(`Unsupported KKTP model: ${model}`);
}

/**
 * Effective weeks calculation per PRD Section 8.6
 */
export function calculateEffectiveHours(effectiveWeeks: number, hoursPerWeek: number): number {
  if (effectiveWeeks <= 0 || hoursPerWeek <= 0) {
    throw new Error("Effective weeks and hours per week must be positive integers");
  }
  return effectiveWeeks * hoursPerWeek;
}

/**
 * Anti-Inflation Bonus Point Calculation Engine
 * Rules:
 * 1. An individual raw score + bonus must not exceed 100.0.
 * 2. Stacking bonus points must not elevate the semester term average by more than +5.0 points.
 * 3. An authentic assessment attempt is mandatory (cannot award bonus on unexcused Alfa).
 */
export function applyBonusPointsWithAntiInflation(params: {
  rawScore: number;
  bonusPointsToAdd: number;
  hasUnexcusedAbsence?: boolean;
  termContext?: {
    totalTps: number;
    rawTermSum: number;
    currentBonusTermSum: number;
  };
}): {
  effectiveScore: number;
  rawPlusBonus: number;
  isAssignmentCapped: boolean;
  isTermCapped: boolean;
  termElevation: number;
  isFrozenDueToAbsence: boolean;
} {
  const { rawScore, bonusPointsToAdd, hasUnexcusedAbsence, termContext } = params;

  if (hasUnexcusedAbsence) {
    return {
      effectiveScore: rawScore,
      rawPlusBonus: rawScore,
      isAssignmentCapped: false,
      isTermCapped: false,
      termElevation: 0,
      isFrozenDueToAbsence: true,
    };
  }

  const rawPlusBonus = rawScore + bonusPointsToAdd;
  const assignmentCappedScore = Math.min(100.0, rawPlusBonus);
  const isAssignmentCapped = rawPlusBonus > 100.0;

  let isTermCapped = false;
  let effectiveScore = assignmentCappedScore;
  let termElevation = 0;

  if (termContext && termContext.totalTps > 0) {
    const rawTermAvg = termContext.rawTermSum / termContext.totalTps;
    const newBonusSum = termContext.currentBonusTermSum + bonusPointsToAdd;
    const potentialAvg = (termContext.rawTermSum + newBonusSum) / termContext.totalTps;
    termElevation = potentialAvg - rawTermAvg;

    if (termElevation > 5.0) {
      isTermCapped = true;
      termElevation = 5.0;
      // Cap assignment score contribution to prevent term elevation > 5.0
      const allowedBonusSum = 5.0 * termContext.totalTps;
      const allowedBonusForThis = Math.max(0, allowedBonusSum - termContext.currentBonusTermSum);
      effectiveScore = Math.min(100.0, rawScore + allowedBonusForThis);
    }
  }

  return {
    effectiveScore,
    rawPlusBonus,
    isAssignmentCapped,
    isTermCapped,
    termElevation: Math.round(termElevation * 100) / 100,
    isFrozenDueToAbsence: false,
  };
}

/**
 * Pure RFC 4180 / Indonesian Semicolon CSV Parser
 * Handles:
 * - Commas vs Semicolons
 * - Quotes enclosing commas / academic degrees
 * - UTF-8 BOM
 * - Leading zeros preservation on NISN
 * - Early grade missing NISN
 * - Malformed row tolerance
 */
export function parseDapodikCsvString(csvContent: string): {
  students: Array<{
    no: number;
    fullName: string;
    nisn: string;
    nis?: string;
    gender: "L" | "P";
    birthPlace?: string;
    birthDate?: string;
    nik?: string;
    isPendingNisn: boolean;
  }>;
  warnings: string[];
  errors: string[];
} {
  // Strip BOM if present
  let cleanCsv = csvContent.replace(/^\uFEFF/, "").trim();
  const lines = cleanCsv.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length < 2) {
    return { students: [], warnings: [], errors: ["CSV file is empty or contains no data rows"] };
  }

  // Detect delimiter: check semicolon vs comma frequency in header
  const headerLine = lines[0];
  const semicolonCount = (headerLine.match(/;/g) || []).length;
  const commaCount = (headerLine.match(/,/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ";" : ",";

  // Parse a single delimited line with quotes awareness
  function parseLine(line: string, delim: string): string[] {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delim && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    return fields;
  }

  const rawHeaders = parseLine(lines[0], delimiter).map(h => h.toLowerCase());
  const nameIdx = rawHeaders.findIndex(h => h.includes("nama") && !h.includes("ayah") && !h.includes("ibu"));
  const nisnIdx = rawHeaders.findIndex(h => h.includes("nisn"));
  const nisIdx = rawHeaders.findIndex(h => h.includes("nis") && !h.includes("nisn"));
  const genderIdx = rawHeaders.findIndex(h => h.includes("kelamin") || h === "jk");
  const nikIdx = rawHeaders.findIndex(h => h.includes("nik"));
  const birthPlaceIdx = rawHeaders.findIndex(h => h.includes("tempat lahir"));
  const birthDateIdx = rawHeaders.findIndex(h => h.includes("tanggal lahir"));

  if (nameIdx === -1) {
    return { students: [], warnings: [], errors: ["Required column 'Nama Peserta Didik' is missing"] };
  }

  const students: any[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
    const cols = parseLine(lines[rowIdx], delimiter);
    // Skip empty trailing lines
    if (cols.length === 0 || (cols.length === 1 && cols[0] === "") || cols.every(c => c === "")) {
      continue;
    }

    // Malformed row check: if row has significantly fewer columns than header (e.g. < 5 columns out of 14)
    if (cols.length < 5 && rawHeaders.length >= 8) {
      warnings.push(`Row ${rowIdx + 1}: Skipped malformed row with insufficient columns (${cols.length}/${rawHeaders.length})`);
      continue;
    }

    const name = cols[nameIdx] || "";
    if (!name) {
      warnings.push(`Row ${rowIdx + 1}: Skipped row due to empty student name`);
      continue;
    }

    let rawNisn = nisnIdx !== -1 && cols[nisnIdx] ? cols[nisnIdx].trim() : "";
    let isPendingNisn = false;
    let cleanNisn = rawNisn;

    if (!rawNisn || rawNisn.length === 0) {
      isPendingNisn = true;
      cleanNisn = `PENDING-${rowIdx}`;
      warnings.push(`Row ${rowIdx + 1}: Student '${name}' has no NISN (flagged as pending cohort)`);
    } else {
      // Ensure leading zeros are preserved and only digits
      cleanNisn = cleanNisn.replace(/[^0-9]/g, "");
      if (cleanNisn.length > 0 && cleanNisn.length < 10) {
        cleanNisn = cleanNisn.padStart(10, "0");
      }
    }

    const rawGender = genderIdx !== -1 && cols[genderIdx] ? cols[genderIdx].toUpperCase().trim() : "L";
    const gender = rawGender.startsWith("P") ? "P" : "L";

    students.push({
      no: students.length + 1,
      fullName: name,
      nisn: cleanNisn,
      nis: nisIdx !== -1 ? cols[nisIdx] : undefined,
      gender,
      birthPlace: birthPlaceIdx !== -1 ? cols[birthPlaceIdx] : undefined,
      birthDate: birthDateIdx !== -1 ? cols[birthDateIdx] : undefined,
      nik: nikIdx !== -1 ? cols[nikIdx] : undefined,
      isPendingNisn,
    });
  }

  return { students, warnings, errors };
}

/**
 * Validate Official Athirah Modul Ajar 6-Component Structure
 */
export function validateAthirahModulAjarStructure(modul: any): {
  valid: boolean;
  missingComponents: string[];
  errors: string[];
} {
  const missingComponents: string[] = [];
  const errors: string[] = [];

  if (!modul) {
    return { valid: false, missingComponents: ["ALL"], errors: ["Modul Ajar object is null or undefined"] };
  }

  // 1. Identitas
  if (!modul.identitas) {
    missingComponents.push("1. Identitas");
  } else {
    const { unit, kelas, fase, mataPelajaran, materiPokok, alokasiWaktuDisplay } = modul.identitas;
    if (!unit || !ATHIRAH_UNITS.includes(unit)) {
      errors.push(`Identitas: Unit '${unit}' is not a recognized Sekolah Islam Athirah unit`);
    }
    if (!kelas) errors.push("Identitas: 'kelas' is required");
    if (!fase || !["A", "B", "C", "D", "E", "F"].includes(fase)) {
      errors.push(`Identitas: 'fase' must be Kurikulum Merdeka Fase A-F, got '${fase}'`);
    }
    if (!mataPelajaran) errors.push("Identitas: 'mataPelajaran' is required");
    if (!materiPokok) errors.push("Identitas: 'materiPokok' is required");
    if (!alokasiWaktuDisplay) errors.push("Identitas: 'alokasiWaktuDisplay' (JP) is required");
  }

  // 2. Identifikasi
  if (!modul.identifikasi) {
    missingComponents.push("2. Identifikasi");
  } else {
    const { profilLulusanAthirah, programKhasRenstra } = modul.identifikasi;
    if (!Array.isArray(profilLulusanAthirah) || profilLulusanAthirah.length === 0) {
      errors.push("Identifikasi: Must specify at least one Profil Lulusan Athirah dimension");
    } else {
      for (const p of profilLulusanAthirah) {
        if (!ATHIRAH_PLA_DIMENSIONS.includes(p)) {
          errors.push(`Identifikasi: Unknown PLA dimension '${p}'`);
        }
      }
    }
    if (!Array.isArray(programKhasRenstra) || programKhasRenstra.length === 0) {
      errors.push("Identifikasi: Must specify at least one Program Khas Renstra");
    } else {
      for (const r of programKhasRenstra) {
        if (!ATHIRAH_RENSTRA_PROGRAMS.includes(r)) {
          errors.push(`Identifikasi: Unknown Renstra program '${r}'`);
        }
      }
    }
  }

  // 3. Spiritualisasi
  if (!modul.spiritualisasi) {
    missingComponents.push("3. Spiritualisasi");
  } else {
    const { quranVerse, hadith, islamicHistory, coreSpiritualValue } = modul.spiritualisasi;
    if (!quranVerse || !quranVerse.arabicText || !quranVerse.translationId || !quranVerse.contextualTafsir) {
      errors.push("Spiritualisasi: Must include complete Quran verse with Arabic text, translation, and contextual tafsir");
    }
    if (!coreSpiritualValue) {
      errors.push("Spiritualisasi: Must specify coreSpiritualValue (e.g. Itqan, Amanah)");
    }
  }

  // 4. Desain Pembelajaran
  if (!modul.desainPembelajaran) {
    missingComponents.push("4. Desain Pembelajaran");
  } else {
    const { tujuanPembelajaran, pedagogicalPractices, mediaDanLingkungan } = modul.desainPembelajaran;
    if (!tujuanPembelajaran || !tujuanPembelajaran.audience || !tujuanPembelajaran.behavior || !tujuanPembelajaran.integratedSpiritualGoal) {
      errors.push("Desain Pembelajaran: Tujuan Pembelajaran must follow ABCD format with integrated spiritual goal");
    }
    if (!pedagogicalPractices || !pedagogicalPractices.modelPembelajaran) {
      errors.push("Desain Pembelajaran: Model pembelajaran is required");
    }
    if (!mediaDanLingkungan) {
      errors.push("Desain Pembelajaran: Media dan lingkungan belajar is required");
    }
  }

  // 5. Pengalaman Belajar (3M + PM + Matriks)
  if (!modul.pengalamanBelajar) {
    missingComponents.push("5. Pengalaman Belajar");
  } else {
    const { memahami, mengaplikasi, merefleksi } = modul.pengalamanBelajar;
    if (!Array.isArray(memahami) || memahami.length === 0) {
      errors.push("Pengalaman Belajar: Fase 'Memahami' must have at least one learning activity");
    }
    if (!Array.isArray(mengaplikasi) || mengaplikasi.length === 0) {
      errors.push("Pengalaman Belajar: Fase 'Mengaplikasi' must have at least one learning activity");
    }
    if (!Array.isArray(merefleksi) || merefleksi.length === 0) {
      errors.push("Pengalaman Belajar: Fase 'Merefleksi' must have at least one learning activity");
    }

    const allSteps = [...(memahami || []), ...(mengaplikasi || []), ...(merefleksi || [])];
    for (const step of allSteps) {
      if (!step.pmPrinciple || !PEDAGOGI_MERDEKA_PRINCIPLES.includes(step.pmPrinciple)) {
        errors.push(`Pengalaman Belajar step '${step.title}': Must include valid PM principle (BERKESADARAN, BERMAKNA, MENGGEMBIRAKAN)`);
      }
      if (!step.matrixCode || !MATRIKS_PENGUATAN_CODES.includes(step.matrixCode)) {
        errors.push(`Pengalaman Belajar step '${step.title}': Must include valid Matrix Code (MH-1..3, MA-1..3, MR-1..3)`);
      }
    }
  }

  // 6. Lampiran Asesmen (8 Columns)
  if (!modul.lampiranAsesmen) {
    missingComponents.push("6. Lampiran Asesmen");
  } else {
    if (!Array.isArray(modul.lampiranAsesmen) || modul.lampiranAsesmen.length === 0) {
      errors.push("Lampiran Asesmen: Must contain at least one assessment row");
    } else {
      for (const item of modul.lampiranAsesmen) {
        if (!item.no || !item.materiPokok || !item.tpCode || !item.indikatorAsesmen || !item.jenisAsesmen) {
          errors.push(`Lampiran Asesmen row ${item.no || "?"}: Missing required column in 8-column assessment table`);
        }
        if (!["TULIS", "NONTULIS"].includes(item.jenisAsesmen)) {
          errors.push(`Lampiran Asesmen row ${item.no}: jenisAsesmen must be 'TULIS' or 'NONTULIS'`);
        }
      }
    }
  }

  const valid = missingComponents.length === 0 && errors.length === 0;
  return { valid, missingComponents, errors };
}

/**
 * Validate Dual-Version LKPD Synchronization
 */
export function validateAthirahLkpdDualVersion(
  studentLkpd: any,
  teacherKeyLkpd: any,
  modulAjarId: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!studentLkpd) errors.push("Student LKPD is missing");
  if (!teacherKeyLkpd) errors.push("Teacher Key LKPD is missing");

  if (studentLkpd && teacherKeyLkpd) {
    if (studentLkpd.modulAjarId !== modulAjarId || teacherKeyLkpd.modulAjarId !== modulAjarId) {
      errors.push("LKPD versions do not match the expected Modul Ajar ID");
    }
    if (studentLkpd.meetingNumber !== teacherKeyLkpd.meetingNumber) {
      errors.push("Student and Teacher LKPD meeting numbers are out of sync");
    }
    if (!studentLkpd.openingDuaAndAdab || !studentLkpd.openingDuaAndAdab.bismillahText) {
      errors.push("Student LKPD must contain Islamic opening dua and adab reminders");
    }
    if (!studentLkpd.aktivitasSiswa || !studentLkpd.aktivitasSiswa.faseMemahami || !studentLkpd.aktivitasSiswa.faseMengaplikasi) {
      errors.push("Student LKPD must contain 3M tiered activities");
    }

    // Teacher key specific checks
    if (!teacherKeyLkpd.guruAnswerKeyGuide) {
      errors.push("Teacher Key LKPD must include guruAnswerKeyGuide");
    } else {
      const guide = teacherKeyLkpd.guruAnswerKeyGuide;
      if (!guide.exemplarAnswersByTier || Object.keys(guide.exemplarAnswersByTier).length === 0) {
        errors.push("Teacher Key must provide exemplar solutions across tiers");
      }
      if (!guide.misconceptionAnticipations || guide.misconceptionAnticipations.length === 0) {
        errors.push("Teacher Key must provide student misconception anticipations and pedagogical remedies");
      }
      if (!Array.isArray(guide.rubrikPenilaian4Level) || guide.rubrikPenilaian4Level.length === 0) {
        errors.push("Teacher Key must provide 4-level analytic rubrics");
      } else {
        const totalWeight = guide.rubrikPenilaian4Level.reduce((sum: number, r: any) => sum + (r.bobotNilai || 0), 0);
        if (totalWeight !== 100) {
          errors.push(`Teacher Key rubrics must sum to exactly 100 points, got ${totalWeight}`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
