/**
/**
 * KKTP (Kriteria Ketercapaian Tujuan Pembelajaran) Multi-Model Calculation Engine
 * Strictly adhering to:
 * - Panduan Pembelajaran dan Asesmen (PPA) 2024 Kemendikbudristek
 * - Keputusan BSKAP No. 032/H/KR/2024
 * - Standar Kurikulum Sekolah Islam Athirah
 */

export type KKTPStatus = "TUNTAS" | "PERLU_BIMBINGAN" | "PENGAYAAN";

export type KKTPModelType = 
  | "DESKRIPSI" 
  | "RUBRIK" 
  | "INTERVAL"
  | "DESKRIPSI_KRITERIA" 
  | "RUBRIK_SKALA" 
  | "INTERVAL_NILAI";

export interface KKTPConfig {
  threshold?: number;
  rubricMax?: number;
  customIntervals?: {
    tier1Max: number;
    tier2Max: number;
    tier3Max: number;
  };
}

export interface KKTPResult {
  isMastered: boolean;
  status: KKTPStatus;
  tierLabel: string;
  recommendation: string;
  intervention: string;
  summary: string;
  tier?: number;
  levelName?: string;
  numericScore?: number;
}

export interface CriterionItem {
  id?: string;
  name?: string;
  isAchieved: boolean;
}

/**
 * Model 1: Deskripsi / Checklist Kriteria Ketuntasan
 * Evaluasi:
 * - 100% kriteria tercapai: Tuntas (Sangat Baik), pengayaan/lanjut materi
 * - 75% kriteria tercapai: Tuntas (Baik), tidak perlu remedial
 * - 25% - 50% kriteria tercapai: Belum tuntas, remedial pada kriteria yang belum tercapai
 * - 0% kriteria tercapai: Belum tuntas, perlu bimbingan penuh / remedial seluruh materi
 */
export function evaluateDeskripsiKKTP(
  criteriaInput: boolean[] | CriterionItem[]
): KKTPResult {
  if (!Array.isArray(criteriaInput) || criteriaInput.length === 0) {
    throw new Error("KKTP Deskripsi model requires a non-empty array of criteria");
  }

  const flags: boolean[] = criteriaInput.map(item => 
    typeof item === "boolean" ? item : Boolean(item.isAchieved)
  );

  const total = flags.length;
  const passedCount = flags.filter(Boolean).length;
  const ratio = passedCount / total;

  let isMastered = false;
  let status: KKTPStatus = "PERLU_BIMBINGAN";
  let tierLabel = "";
  let recommendation = "";
  let intervention = "";

  if (ratio === 1.0) {
    isMastered = true;
    status = "TUNTAS";
    tierLabel = "Tuntas Kriteria (Sangat Baik)";
    recommendation = "Seluruh kriteria tercapai, lanjut ke TP berikutnya atau materi pengayaan";
    intervention = "Tidak perlu remedial. Diberikan materi pengayaan untuk pendalaman konsep.";
  } else if (ratio >= 0.75) {
    isMastered = true;
    status = "TUNTAS";
    tierLabel = "Tuntas Kriteria (Baik)";
    recommendation = `Tercapai ${passedCount}/${total} kriteria. Tuntas, tidak perlu remedial`;
    intervention = "Tidak perlu remedial. Lanjutkan pembelajaran materi berikutnya.";
  } else if (ratio > 0) {
    isMastered = false;
    status = "PERLU_BIMBINGAN";
    tierLabel = "Belum Memenuhi Seluruh Kriteria";
    recommendation = `Tercapai ${passedCount}/${total} kriteria. Remedial pada kriteria yang belum tuntas`;
    intervention = `Perlu bimbingan remedial khusus pada ${total - passedCount} kriteria/indikator yang belum tercapai.`;
  } else {
    isMastered = false;
    status = "PERLU_BIMBINGAN";
    tierLabel = "Perlu Bimbingan Penuh";
    recommendation = `Tercapai 0/${total} kriteria. Perlu bimbingan intensif seluruhnya`;
    intervention = "Perlu intervensi dan remedial penuh di seluruh bagian indikator ketercapaian materi.";
  }

  const summary = `${passedCount}/${total} kriteria tercapai (${Math.round(ratio * 100)}%) - ${isMastered ? "TUNTAS" : "BELUM TUNTAS"}`;

  return {
    isMastered,
    status,
    tierLabel,
    recommendation,
    intervention,
    summary,
    numericScore: Math.round(ratio * 100),
  };
}

/**
 * Model 2: Rubrik Penilaian (4 Tiers)
 * - Tier 1: Baru Berkembang (Skor 0-60) -> Belum Tuntas (Perlu intervensi intensif)
 * - Tier 2: Layak / Cukup (Skor 61-74) -> Belum Tuntas (Perlu bimbingan khusus)
 * - Tier 3: Cakap / Baik (Skor 75-85) -> Tuntas (Mencapai KKTP)
 * - Tier 4: Mahir / Sangat Baik (Skor 86-100) -> Tuntas (Pengayaan / tantangan lebih)
 */
export function evaluateRubrikKKTP(
  levelOrScore: number,
  config?: KKTPConfig
): KKTPResult {
  const num = Number(levelOrScore);
  if (isNaN(num)) {
    throw new Error("KKTP Rubrik requires a valid numeric score or level (1-4)");
  }

  let tier: 1 | 2 | 3 | 4;
  let numericScore: number | undefined;

  // Determine if input is level (1-4) or percentage score (0-100)
  if (num >= 1 && num <= 4 && Number.isInteger(num)) {
    tier = num as 1 | 2 | 3 | 4;
    numericScore = num;
  } else if (num >= 0 && num <= 100) {
    numericScore = num;
    if (num <= 60) tier = 1;
    else if (num <= 74) tier = 2;
    else if (num <= 85) tier = 3;
    else tier = 4;
  } else {
    throw new Error(`Score or level ${num} out of valid range (level 1-4 or score 0-100)`);
  }

  const tierMetadata = {
    1: {
      levelName: "Baru Berkembang",
      tierLabel: "Perlu Bimbingan (Level 1)",
      status: "PERLU_BIMBINGAN" as KKTPStatus,
      isMastered: false,
      recommendation: "Belum tuntas: Perlu bimbingan intervensi guru",
      intervention: "Intervensi intensif dan remedial menyeluruh pada kompetensi dasar.",
    },
    2: {
      levelName: "Layak",
      tierLabel: "Cukup (Level 2)",
      status: "PERLU_BIMBINGAN" as KKTPStatus,
      isMastered: false,
      recommendation: "Belum tuntas: Perlu bimbingan intervensi guru",
      intervention: "Bimbingan khusus dan remedial pada aspek yang belum memenuhi standar.",
    },
    3: {
      levelName: "Cakap",
      tierLabel: "Baik / Tuntas (Level 3)",
      status: "TUNTAS" as KKTPStatus,
      isMastered: true,
      recommendation: "Baik: Lanjutkan pembelajaran materi berikutnya",
      intervention: "Tuntas mencapai KKTP. Lanjutkan ke tujuan pembelajaran berikutnya.",
    },
    4: {
      levelName: "Mahir",
      tierLabel: "Sangat Baik / Mahir (Level 4)",
      status: "PENGAYAAN" as KKTPStatus,
      isMastered: true,
      recommendation: "Mahir: Berikan tantangan pengayaan",
      intervention: "Sangat melampaui KKTP. Diberikan materi pengayaan dan tantangan pemecahan masalah.",
    },
  };

  const meta = tierMetadata[tier];
  const summary = `Level ${tier} (${meta.levelName}) - ${meta.isMastered ? "TUNTAS" : "BELUM TUNTAS"}`;

  return {
    isMastered: meta.isMastered,
    status: meta.status,
    tierLabel: meta.tierLabel,
    recommendation: meta.recommendation,
    intervention: meta.intervention,
    summary,
    tier,
    levelName: meta.levelName,
    numericScore,
  };
}

/**
 * Model 3: Continuous Piecewise Half-Open Interval Nilai
 * Partisi Kontinu Tanpa Celah:
 * - [0.00, 40.00]: Tier 1 - Belum mencapai ketuntasan, remedial di seluruh bagian
 * - (40.00, 65.00]: Tier 2 - Belum mencapai ketuntasan, remedial di bagian yang diperlukan
 * - (65.00, 85.00]: Tier 3 - Sudah mencapai ketuntasan, tidak perlu remedial
 * - (85.00, 100.00]: Tier 4 - Sudah mencapai ketuntasan, perlu pengayaan atau tantangan lebih
 */
export function evaluateIntervalKKTP(
  score: number,
  config?: KKTPConfig
): KKTPResult {
  const num = Number(score);
  if (isNaN(num)) {
    throw new Error("KKTP Interval evaluation requires a valid numeric score");
  }

  if (num < 0 || num > 100) {
    throw new Error(`Score ${num} out of valid statutory range [0, 100]`);
  }

  // Exact continuous interval mapping
  if (num <= 40.0) {
    return {
      isMastered: false,
      status: "PERLU_BIMBINGAN",
      tierLabel: "Perlu Bimbingan Dasar",
      recommendation: "Remedial Intensif Seluruh Materi",
      intervention: "Remedial intensif di seluruh materi atau penugasan terbimbing penuh dari awal.",
      summary: `Skor ${num} dalam interval [0, 40] (Belum Tuntas)`,
      tier: 1,
      levelName: "Dasar",
      numericScore: num,
    };
  } else if (num <= 65.0) {
    return {
      isMastered: false,
      status: "PERLU_BIMBINGAN",
      tierLabel: "Perlu Bimbingan Khusus",
      recommendation: "Remedial Parsial Bagian yang Belum Dikuasai",
      intervention: "Remedial pada indikator atau bagian tertentu yang belum dikuasai peserta didik.",
      summary: `Skor ${num} dalam interval (40, 65] (Belum Tuntas)`,
      tier: 2,
      levelName: "Menengah Bawah",
      numericScore: num,
    };
  } else if (num <= 85.0) {
    return {
      isMastered: true,
      status: "TUNTAS",
      tierLabel: "Tuntas Standar",
      recommendation: "Tuntas Standar, Lanjut Materi Berikutnya",
      intervention: "Mencapai ketuntasan standar, tidak perlu remedial. Siap untuk materi berikutnya.",
      summary: `Skor ${num} dalam interval (65, 85] (Tuntas)`,
      tier: 3,
      levelName: "Cakap",
      numericScore: num,
    };
  } else {
    return {
      isMastered: true,
      status: "PENGAYAAN",
      tierLabel: "Pengayaan Khusus / Mahir",
      recommendation: "Pengayaan Khusus / Pendalaman Tantangan",
      intervention: "Melampaui ketuntasan minimal, diberikan materi pengayaan atau tantangan eksplorasi lebih.",
      summary: `Skor ${num} dalam interval (85, 100] (Pengayaan)`,
      tier: 4,
      levelName: "Mahir",
      numericScore: num,
    };
  }
}

/**
 * Custom Threshold Evaluation
 * Memeriksa nilai terhadap ambang batas KKTP khusus (misal 75).
 */
export function evaluateScoreAgainstThreshold(
  score: number,
  threshold: number = 75
): {
  isMastered: boolean;
  delta: number;
  status: KKTPStatus;
  recommendation: string;
} {
  const num = Number(score);
  if (isNaN(num)) {
    throw new Error("Score must be a valid number");
  }

  const isMastered = num >= threshold;
  const delta = Math.round((num - threshold) * 100) / 100;
  
  let status: KKTPStatus = "PERLU_BIMBINGAN";
  if (isMastered) {
    status = num >= 85 ? "PENGAYAAN" : "TUNTAS";
  }

  const recommendation = isMastered
    ? (num >= 85 ? "Sangat baik, berikan materi pengayaan" : "Tuntas, lanjutkan ke TP berikutnya")
    : `Belum mencapai KKTP (selisih ${Math.abs(delta)} poin), perlu bimbingan remedial`;

  return {
    isMastered,
    delta,
    status,
    recommendation,
  };
}

/**
 * Universal KKTP Dispatcher
 * Mendukung semua model KKTP resmi dan aliasnya.
 */
export function evaluateKKTP(
  model: KKTPModelType,
  scoreOrCriteria: number | boolean[] | CriterionItem[],
  config: KKTPConfig = {}
): KKTPResult {
  switch (model) {
    case "DESKRIPSI":
    case "DESKRIPSI_KRITERIA":
      return evaluateDeskripsiKKTP(scoreOrCriteria as boolean[] | CriterionItem[]);

    case "RUBRIK":
    case "RUBRIK_SKALA":
      return evaluateRubrikKKTP(scoreOrCriteria as number, config);

    case "INTERVAL":
    case "INTERVAL_NILAI":
      return evaluateIntervalKKTP(scoreOrCriteria as number, config);

    default:
      throw new Error(`Unsupported KKTP model: ${model}`);
  }
}

/**
 * Menghitung rata-rata nilai siswa secara presisi
 * KRITIKAL: Sel nilai yang belum dinilai (undefined, null, NaN) TIDAK dihitung sebagai 0!
 * Hanya nilai asesmen nyata yang disertakan dalam perhitungan pembagi.
 */
export function calculateStudentAverage(
  scores: (number | undefined | null)[]
): {
  average: number | null;
  assessedCount: number;
  totalCount: number;
  hasScores: boolean;
} {
  const totalCount = scores.length;
  const validScores: number[] = [];

  for (const s of scores) {
    if (typeof s === "number" && !isNaN(s) && isFinite(s)) {
      validScores.push(s);
    }
  }

  const assessedCount = validScores.length;
  if (assessedCount === 0) {
    return {
      average: null,
      assessedCount: 0,
      totalCount,
      hasScores: false,
    };
  }

  const sum = validScores.reduce((acc, curr) => acc + curr, 0);
  const rawAvg = sum / assessedCount;
  const average = Math.round(rawAvg * 100) / 100;

  return {
    average,
    assessedCount,
    totalCount,
    hasScores: true,
  };
}
