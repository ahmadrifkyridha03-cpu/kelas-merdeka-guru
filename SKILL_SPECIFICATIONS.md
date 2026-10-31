# SPESIFIKASI TEKNIS CUSTOM SKILLS: SISTEM OTOMASI PERANGKAT AJAR & EVALUASI KELAS KURIKULUM MERDEKA
**Dokumen Spesifikasi Standar Keterampilan Agen Cerdas (Agent Custom Skills Specification)**  
**Platform Target**: Google Cloud / Firebase Web App Platform (Cloud Functions v2, Firebase Genkit, `@google/genai` SDK, Cloud Firestore)  
**Regulasi Acuan**: Permendikbudristek No. 12 Tahun 2024, Keputusan Kepala BSKAP No. 032/H/KR/2024 (Standar CP), Keputusan Kepala BSKAP No. 031/H/KR/2024 (Profil Pelajar Pancasila), dan Panduan Pembelajaran dan Asesmen (PPA) Edisi Revisi 2024.  
**Versi Dokumen**: 1.0.0 (Production Release)  
**Status**: Authoritative Technical Standard  

---

## DAFTAR ISI

1. [Kerangka Kerja Arsitektur & Standar Spesifikasi Skill](#1-kerangka-kerja-arsitektur--standar-spesifikasi-skill)
   - 1.1 Filosofi dan Standar Spesifikasi Keterampilan Agen
   - 1.2 Struktur Direktori Standar Repositori Skill
   - 1.3 Siklus Hidup Eksekusi Skill (Execution Lifecycle)
   - 1.4 Protokol Validasi Skema & Taksonomi Galat (Error Taxonomy)
2. [Spesifikasi Mendalam 8 Custom Skills](#2-spesifikasi-mendalam-8-custom-skills)
   - 2.1 `curriculum-cp-tp-derivation`: Dekomposisi Capaian Pembelajaran ke Tujuan Pembelajaran
   - 2.2 `curriculum-atp-sequencer`: Pengurutan Pedagogis Alur Tujuan Pembelajaran
   - 2.3 `curriculum-kktp-builder`: Pembangun Kriteria Ketercapaian Tujuan Pembelajaran (3 Model)
   - 2.4 `curriculum-minggu-efektif-analyzer`: Mesin Analisis Minggu & Jam Pelajaran Efektif (RME/AME)
   - 2.5 `curriculum-prota-prosem-generator`: Pembangun Program Tahunan & Matriks Program Semester
   - 2.6 `modul-ajar-generator`: Generator Modul Ajar Terintegrasi Pembelajaran Berdiferensiasi
   - 2.7 `lkpd-worksheet-generator`: Generator Lembar Kerja Peserta Didik Berjenjang (Scaffolded)
   - 2.8 `grade-analytics-and-bonus-evaluator`: Mesin Analitik Nilai, Kuota Poin Ekstra & Log Audit Kriptografis
3. [Packaging & Runtime Execution Engine pada Ekosistem Google](#3-packaging--runtime-execution-engine-pada-ekosistem-google)
   - 3.1 Tata Letak Repositori Monorepo & Integrasi Package
   - 3.2 Implementasi TypeScript Execution Runner (Firebase Functions v2 & Genkit)
   - 3.3 Pipeline Validasi Deterministik & Lingkaran Koreksi Mandiri (Self-Correction Loop)
   - 3.4 Mekanisme Sinkronisasi State Blackboard (`CurriculumWorkspaceState`) & Cloud Firestore
4. [Kerangka Kerja Spesifikasi Pengujian, Arsitektur Test Suite & Kriteria Keberterimaan Verifikasi](#4-kerangka-kerja-spesifikasi-pengujian-arsitektur-test-suite--kriteria-keberterimaan-verifikasi-verification-acceptance-criteria-framework)
   - 4.1 Prinsip Desain & Tata Kelola Pengujian Keterampilan Agen (Test Governance)
   - 4.2 Arsitektur Direktori Test Suite Standar (`tests/unit/`, `tests/integration/`, `tests/contracts/`)
   - 4.3 Spesifikasi Detail Kriteria Keberterimaan, Assertions, Test Inputs & Expected Outputs 8 Custom Skills
   - 4.4 Matriks Pelacakan Verifikasi & Status Kesiapan Implementasi

---

## 1. KERANGKA KERJA ARSITEKTUR & STANDAR SPESIFIKASI SKILL

### 1.1 Filosofi dan Standar Spesifikasi Keterampilan Agen

Dalam arsitektur sistem multi-agen modern, **Custom Skill** didefinisikan sebagai unit kapabilitas modular, independen, terisolasi, dan deterministik yang dapat dipanggil oleh satu atau beberapa agen otonom. Berbeda dari pemanggilan Model Bahasa Besar (LLM) monolitik yang rentan terhadap halusinasi dan inkonsistensi struktur, setiap custom skill pada sistem ini dirancang dengan prinsip **Pedagogical Determinism backed by Schema Enforcement**.

Prinsip fundamental perancangan skill:
1. **Zero Unconstrained Generation**: Tidak ada inferensi model yang dieksekusi tanpa batasan skema JSON ketat (*Draft 2020-12 Schema*) melalui fitur `responseSchema` pada Gemini API.
2. **Deterministic Mathematical Guardrails**: Setiap kalkulasi matematis (alokasi jam pelajaran, analisis kalender akademik, pembagian proporsi materi, pembatasan skor bonus) dieksekusi oleh mesin kalkulasi deterministik berbasis kode TypeScript/Python, **bukan diserahkan kepada penalaran numerik LLM**.
3. **Regulatory Grounding**: Struktur dokumen kurikulum mematuhi secara mutlak struktur regulasi Kemendikbudristek RI:
   - Capaian Pembelajaran (CP) berbasis Keputusan Kepala BSKAP No. 032/H/KR/2024.
   - Dimensi, Elemen, dan Subelemen Profil Pelajar Pancasila (P5) berbasis Keputusan Kepala BSKAP No. 031/H/KR/2024.
   - Pendekatan KKTP dan e-Rapor berbasis Panduan Pembelajaran dan Asesmen (PPA) 2024.
4. **Idempotensi & Transparansi Audit**: Skill bersifat idempoten terhadap parameter masukan yang sama. Operasi penilaian dan penambahan poin bonus menghasilkan jejak audit kriptografis (*audit log hash*) yang tidak dapat disangkal (*non-repudiable*).

---

### 1.2 Struktur Direktori Standar Repositori Skill

Setiap skill dikemas dalam struktur repositori mandiri yang terstandarisasi:

```
packages/skills/<skill-name>/
├── SKILL.md                          # Dokumen spesifikasi operasional & protokol eksekusi (YAML frontmatter)
├── schemas/
│   ├── input.schema.json             # JSON Schema Draft 2020-12 untuk payload parameter masukan
│   └── output.schema.json            # JSON Schema Draft 2020-12 untuk artefak luaran model
├── prompts/
│   ├── system.prompt.txt             # Instruksi persona, peran otoritatif, dan batas operasional
│   └── few_shot_exemplars.json       # Pasangan input-output kurikulum nyata (Matematika/B.Indo/Informatika)
├── src/
│   ├── index.ts                      # Handler runner eksekusi skill (Genkit flow / Cloud Function v2)
│   ├── validator.ts                  # Engine validasi aturan bisnis deterministik (non-LLM)
│   └── math.ts                       # Formula aritmetika khusus (kalkulator JP, interval KKTP, audit)
└── tests/
    ├── schema.test.ts                # Pengujian kepatuhan skema terhadap berbagai variasi payload
    ├── deterministic.test.ts         # Pengujian invarian matematis dan penanganan kondisi batas
    └── mock_payloads.json            # Data uji sintetis untuk pengujian regresi offline
```

---

### 1.3 Siklus Hidup Eksekusi Skill (Execution Lifecycle)

Setiap pemanggilan skill melewati 8 tahapan siklus hidup yang ketat dan terpantau:

```
+----------------------------------------------------------------------------------------------------+
|                                      SKILL EXECUTION LIFECYCLE                                     |
+----------------------------------------------------------------------------------------------------+
  1. Invocation & Parameter Binding
     - Agen pemanggil menerbitkan parameter masukan ke bus eksekusi skill.
     - Konteks sesi guru (satuan pendidikan, fase, kelas, mata pelajaran) diikat ke payload.
                    |
                    v
  2. Input Sanitization & Pre-Validation
     - Payload masukan divalidasi terhadap `schemas/input.schema.json`.
     - Pengecekan awal aturan batas (misal: panjang teks CP, kesesuaian kombinasi fase dan kelas).
                    |
                    v
  3. Dynamic Prompt & Context Assembly
     - Injeksi teks regulasi BSKAP yang relevan dari Context Cache Gemini.
     - Pemilihan few-shot exemplars yang paling sesuai dengan mata pelajaran dan fase target.
     - Pemasangan instruksi pedagogis dan batasan struktural.
                    |
                    v
  4. Model Inference via Google Gemini API / Firebase Genkit
     - Pemanggilan model (Gemini 2.5 Pro untuk sintesis pedagogis mendalam; Gemini 2.5 Flash untuk analitik).
     - Parameter determinisme: `temperature = 0.2`, `topP = 0.95`, `seed = 42`.
     - Penegakan format terstruktur menggunakan `responseSchema` (JSON Draft 2020-12).
                    |
                    v
  5. Schema Conformance Validation
     - Hasil inferensi diuji ulang menggunakan validator JSON Schema di sisi server (Ajv Draft 2020-12).
     - Menjamin tidak ada field wajib yang hilang, pola regex salah, atau tipe data meleset.
                    |
                    v
  6. Deterministic Mathematical & Pedagogical Assertion Verification
     - Evaluasi invarian murni kode: Paritas Jam Pelajaran, kelengkapan aljabar, keterurutan rubrik KKTP.
     - Pengecekan silang terhadap basis data KKO Bloom dan daftar subelemen P5.
                    |
                    v
  7. Post-Processing & State Mutation
     - Penyematan metadata eksekusi: stempel waktu UTC, versi skill, ID inferensi, dan hash audit.
     - Mutasi state bersama pada `CurriculumWorkspaceState` di Cloud Firestore.
                    |
                    v
  8. Artifact Output & Reporting
     - Pengembalian objek hasil terstruktur ke agen orkestrator atau penyajian ke antarmuka guru.
```

---

### 1.4 Protokol Validasi Skema & Taksonomi Galat (Error Taxonomy)

Sistem menetapkan kode kesalahan standar 4-digit yang dikelompokkan berdasarkan fase kegagalan:

| Rentang Kode | Kategori Galat | Deskripsi | Protokol Penanganan / Remediasi |
|---|---|---|---|
| `ERR_1000 - ERR_1099` | **Input & Parameter Error** | Parameter masukan tidak memenuhi skema, tipe data salah, atau nilai batas dilanggar. | Validasi ditolak di tingkat klien sebelum memanggil LLM; tampilkan form kesalahan spesifik pada UI guru. |
| `ERR_2000 - ERR_2099` | **Schema Conformance Error** | Luaran model LLM tidak sesuai dengan JSON Schema `output.schema.json` atau terjadi truncation/SyntaxError. | Picu *Auto-Correction Loop*: Kirim ulang pesan error validator Ajv / SyntaxError snippet ke model dengan instruksi perbaikan 1-shot. |
| `ERR_3000 - ERR_3099` | **Pedagogical Rule Violation** | Pelanggaran standar kurikulum (KKO tidak operasional, materi melenceng dari CP, dimensi P5 salah, KKM numerik tunggal). | Sistem menginjeksi kamus KKO resmi atau menyarankan pemetaan kompetensi terdekat, meminta konfirmasi guru. |
| `ERR_4000 - ERR_4099` | **Mathematical Parity & Graph Integrity Error** | Inkonsistensi perhitungan matematis ($\sum JP \neq JPE$, paritas baris-kolom PROSEM dilanggar, interval KKTP terputus, siklus DAG `ERR_4001`, atau referensi prasyarat dangling `ERR_4004`). | Modul deterministik mengkalkulasi ulang secara otomatis menggunakan algoritma perata proporsional (*proportional redistribution*), pemutus siklus Tarjan, atau penolak eksekusi referensi dangling. |
| `ERR_5000 - ERR_5099` | **Security & Audit Violation** | Pelanggaran pagu nilai bonus ($>100$), peningkatan semester melebihi $+5.0$ poin, aktivasi bonus pada asesmen belum tuntas, atau manipulasi identitas. | Transaksi ditolak seketika; catat insiden ke log keamanan Firestore dan kunci nilai pada batas aman. |

---

## 2. SPESIFIKASI MENDALAM 8 CUSTOM SKILLS

---

### 2.1 SKILL 1: `curriculum-cp-tp-derivation`

#### A. Metadata & Deskripsi
- **Skill Name**: `curriculum-cp-tp-derivation`
- **Version**: `1.0.0`
- **Category**: `Curriculum Engineering / Pedagogical Deconstruction`
- **Author**: `Teacher Assistant Engineering Team`
- **Description**: Mendekomposisi teks narasi resmi Capaian Pembelajaran (CP) per elemen dari Keputusan Kepala BSKAP No. 032/H/KR/2024 menjadi unit-unit Tujuan Pembelajaran (TP) yang atomik, terukur, dan memenuhi kriteria ABCD (Audience, Behavior, Condition, Degree). Setiap TP diurai menjadi Kata Kerja Operasional (KKO) berbasis Taksonomi Bloom Revisi (Level Kognitif C1-C6), Lingkup Materi Esensial, dan Penyelarasan 6 Dimensi Profil Pelajar Pancasila (P5) berbasis BSKAP 031/H/KR/2024.

#### B. Standard YAML Frontmatter
```yaml
---
name: curriculum-cp-tp-derivation
version: 1.0.0
category: curriculum-engineering
description: "Deconstructs government Capaian Pembelajaran (CP) text into atomic, measurable Tujuan Pembelajaran (TP) with Bloom C1-C6 KKO, scoped content, and P5 alignment."
author: Teacher Assistant Engineering Team
parameters:
  - name: raw_cp_text
    type: string
    required: true
    description: "Teks lengkap narasi Capaian Pembelajaran per elemen dari BSKAP 032/H/KR/2024."
  - name: subject_name
    type: string
    required: true
    description: "Nama mata pelajaran resmi (e.g., 'Matematika', 'Informatika', 'Bahasa Indonesia')."
  - name: element_name
    type: string
    required: true
    description: "Nama elemen kurikulum yang didekomposisi (e.g., 'Aljabar', 'Berpikir Komputasional')."
  - name: phase
    type: string
    required: true
    enum: ["Fondasi", "A", "B", "C", "D", "E", "F"]
    description: "Fase Kurikulum Merdeka sasaran."
  - name: grade_level
    type: integer
    required: true
    minimum: 1
    maximum: 12
    description: "Tingkat kelas target (1 s.d. 12)."
  - name: taxonomy_framework
    type: string
    required: false
    default: "Bloom_Revised"
    enum: ["Bloom_Revised", "Marzano", "UbD_Tighe_Wiggins"]
    description: "Kerangka taksonomi kompetensi yang digunakan."
  - name: max_tps_to_generate
    type: integer
    required: false
    default: 8
    minimum: 2
    maximum: 16
    description: "Batas maksimal jumlah TP atomik yang dihasilkan untuk elemen terkait."
validation_rules:
  - rule: "assert_bloom_kko_operational"
    description: "Setiap KKO pada TP wajib terdaftar pada kamus KKO operasional teruji (melarang kata pasif/vague seperti 'mengetahui' atau 'memahami' tanpa indikator)."
  - rule: "assert_no_compound_objectives"
    description: "Setiap TP wajib atomik; satu TP tidak boleh menggabungkan dua kompetensi yang memerlukan instrumen asesmen terpisah."
  - rule: "assert_p5_dimension_validity"
    description: "Dimensi P5 yang dipilih wajib berasal dari 6 dimensi resmi BSKAP 031/H/KR/2024."
---
```

#### C. Input Parameter Declarations
| Parameter | Tipe | Wajib | Nilai Baku (Default) | Deskripsi & Batasan Validasi |
|---|---|:---:|---|---|
| `raw_cp_text` | `string` | Ya | - | Teks mentah CP per elemen. Minimal 30 karakter, maksimal 3000 karakter. |
| `subject_name` | `string` | Ya | - | Nama mata pelajaran resmi sesuai Permendikbudristek No. 12/2024. |
| `element_name` | `string` | Ya | - | Nama elemen kompetensi mata pelajaran terkait. |
| `phase` | `string` | Ya | - | Salah satu dari: `"Fondasi"`, `"A"`, `"B"`, `"C"`, `"D"`, `"E"`, `"F"`. |
| `grade_level` | `integer` | Ya | - | Nilai integer antara 1 hingga 12 yang valid untuk fase yang dipilih. |
| `taxonomy_framework` | `string` | Tidak | `"Bloom_Revised"` | Pilihan kerangka: `"Bloom_Revised"`, `"Marzano"`, `"UbD_Tighe_Wiggins"`. |
| `max_tps_to_generate`| `integer` | Tidak | `8` | Rentang integer 2 s.d. 16. |

#### D. Input & Output JSON Schemas (Draft 2020-12 Compliant)

**Input JSON Schema (`schemas/input.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/curriculum-cp-tp-derivation/input.json",
  "title": "CurriculumCPTPDerivationInput",
  "type": "object",
  "required": ["raw_cp_text", "subject_name", "element_name", "phase", "grade_level"],
  "additionalProperties": false,
  "properties": {
    "raw_cp_text": {
      "type": "string",
      "minLength": 30,
      "maxLength": 3000,
      "description": "Verbatim paragraph text of the Capaian Pembelajaran element."
    },
    "subject_name": {
      "type": "string",
      "minLength": 3,
      "maxLength": 80
    },
    "element_name": {
      "type": "string",
      "minLength": 3,
      "maxLength": 80
    },
    "phase": {
      "type": "string",
      "enum": ["Fondasi", "A", "B", "C", "D", "E", "F"]
    },
    "grade_level": {
      "type": "integer",
      "minimum": 1,
      "maximum": 12
    },
    "taxonomy_framework": {
      "type": "string",
      "enum": ["Bloom_Revised", "Marzano", "UbD_Tighe_Wiggins"],
      "default": "Bloom_Revised"
    },
    "max_tps_to_generate": {
      "type": "integer",
      "minimum": 2,
      "maximum": 16,
      "default": 8
    }
  }
}
```

**Output JSON Schema (`schemas/output.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/curriculum-cp-tp-derivation/output.json",
  "title": "CurriculumCPTPDerivationOutput",
  "type": "object",
  "required": [
    "meta",
    "element_analysis",
    "derived_tps"
  ],
  "additionalProperties": false,
  "properties": {
    "meta": {
      "type": "object",
      "required": ["subject_name", "element_name", "phase", "grade_level", "total_tps_derived"],
      "additionalProperties": false,
      "properties": {
        "subject_name": { "type": "string" },
        "element_name": { "type": "string" },
        "phase": { "type": "string", "enum": ["Fondasi", "A", "B", "C", "D", "E", "F"] },
        "grade_level": { "type": "integer", "minimum": 1, "maximum": 12 },
        "taxonomy_framework": { "type": "string" },
        "total_tps_derived": { "type": "integer", "minimum": 1 }
      }
    },
    "element_analysis": {
      "type": "object",
      "required": ["core_competencies", "scoped_materials", "pedagogical_essence"],
      "additionalProperties": false,
      "properties": {
        "core_competencies": {
          "type": "array",
          "items": { "type": "string" },
          "minItems": 1
        },
        "scoped_materials": {
          "type": "array",
          "items": { "type": "string" },
          "minItems": 1
        },
        "pedagogical_essence": {
          "type": "string",
          "minLength": 20
        }
      }
    },
    "derived_tps": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": [
          "tp_code",
          "kompetensi",
          "lingkup_materi",
          "dimensi_p5",
          "bloom_cognitive_level",
          "operational_kko",
          "abcd_components",
          "tp_statement",
          "prerequisite_concepts"
        ],
        "additionalProperties": false,
        "properties": {
          "tp_code": {
            "type": "string",
            "pattern": "^TP-[A-Z]{3,4}-[A-F]-[0-9]{1,2}-[0-9]{2}$",
            "description": "Standard code, e.g. TP-MAT-D-7-01"
          },
          "kompetensi": {
            "type": "string",
            "description": "Observable cognitive or psychomotor action verb."
          },
          "lingkup_materi": {
            "type": "string",
            "description": "Specific conceptual, procedural, or factual content scope."
          },
          "dimensi_p5": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia",
                "Berkebinekaan Global",
                "Gotong Royong",
                "Mandiri",
                "Bernalar Kritis",
                "Kreatif"
              ]
            },
            "minItems": 1,
            "maxItems": 3
          },
          "bloom_cognitive_level": {
            "type": "string",
            "enum": ["C1", "C2", "C3", "C4", "C5", "C6"]
          },
          "operational_kko": {
            "type": "string",
            "description": "Formal Kata Kerja Operasional, e.g., 'Menganalisis', 'Menyelesaikan'."
          },
          "abcd_components": {
            "type": "object",
            "required": ["audience", "behavior", "condition", "degree"],
            "additionalProperties": false,
            "properties": {
              "audience": { "type": "string" },
              "behavior": { "type": "string" },
              "condition": { "type": "string" },
              "degree": { "type": "string" }
            }
          },
          "tp_statement": {
            "type": "string",
            "minLength": 25,
            "description": "Complete, grammatically cohesive Indonesian sentence expressing the TP."
          },
          "prerequisite_concepts": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      }
    }
  }
}
```

#### E. Core Algorithmic & Pedagogical Logic
1. **Langkah 1: Parsing Teks CP & Ekstraksi Semantik**:
   - Analisis sintaksis paragraf CP untuk mengidentifikasi seluruh kata kerja tindakan dan entitas konsep inti.
   - Pisahkan teks menjadi pasangan entitas: `(Kata Kerja) -> (Konsep Terkait)`.
2. **Langkah 2: Filter Taksonomi Bloom & Pemetaan KKO**:
   - Validasi setiap kata kerja terhadap kamus KKO Kemendikbudristek/Bloom Revisi.
   - Bila kata kerja berupa kata umum/abstrak seperti "memahami", lakukan dekonstruksi menjadi tindakan yang teramati (misal: "menjelaskan konsep X", "membedakan X dengan Y", "mengklasifikasikan Z").
   - Petakan ke tingkat kognitif yang sesuai ($C_1$ s.d. $C_6$).
3. **Langkah 3: Dekomposisi Atomik & Pembentukan Formula TP**:
   - Terapkan formula: $\text{TP} = \text{Kompetensi (KKO)} + \text{Lingkup Materi} + \text{Dimensi P5} + [\text{Variasi Konteks}]$.
   - Pecah kalimat majemuk menjadi TP mandiri jika materi mencakup lebih dari satu domain terpisah.
4. **Langkah 4: Enkapsulasi Model ABCD**:
   - *Audience*: Peserta didik kelas target (misal: "Peserta didik kelas VII").
   - *Behavior*: Perilaku terukur gabungan KKO dan materi (misal: "dapat memodelkan masalah linear").
   - *Condition*: Situasi atau media belajar (misal: "melalui investigasi data kontekstual pasar tradisional").
   - *Degree*: Tingkat ketuntasan minimal (misal: "dengan minimal 3 interpretasi variabel yang tepat").
5. **Langkah 5: Pengecekan Duplikasi & Penomoran Kode Terstandar**:
   - Format kode: `TP-[KODE_MAPEL]-[FASE]-[KELAS]-[URUTAN]`, contoh: `TP-MAT-D-7-01`.

#### F. Few-Shot Prompt Template (Kurikulum Merdeka Exemplar)

```text
[SYSTEM INSTRUCTION]
Anda adalah Kurikulum Architect AI, spesialis perancang Tujuan Pembelajaran (TP) berbasis standar resmi Kurikulum Merdeka (Permendikbudristek No. 12 Tahun 2024 dan BSKAP No. 032/H/KR/2024).
Tugas Anda adalah mendekomposisi teks Capaian Pembelajaran (CP) menjadi kumpulan Tujuan Pembelajaran (TP) yang atomik, terukur, dan memenuhi format ABCD serta menyelaraskan KKO Bloom Revisi dan 6 Dimensi Profil Pelajar Pancasila (BSKAP 031/H/KR/2024).

Kamus Tingkat Kognitif Bloom Revisi:
- C1: Mengingat (Menyebutkan, mengenali, mengidentifikasi)
- C2: Memahami (Menjelaskan, membedakan, mengklasifikasi, meringkas)
- C3: Mengaplikasikan (Menerapkan, menghitung, mendemonstrasikan, menggunakan)
- C4: Menganalisis (Menganalisis, membandingkan, menguraikan, mendeteksi korelasi)
- C5: Mengevaluasi (Menilai, mengkritik, memvalidasi, membuktikan kesalahan)
- C6: Menciptakan (Merancang, mengonstruksi, memproduksi, memodelkan)

Dilarang keras menggunakan kata kerja tidak operasional seperti: "mengetahui", "mengerti", "mendalami", "merasakan" tanpa operasionalisasi perilaku konkrit.

[FEW-SHOT EXEMPLAR 1: MATEMATIKA FASE D]
Input:
{
  "raw_cp_text": "Di akhir fase D, peserta didik dapat menyelesaikan persamaan dan pertidaksamaan linear satu variabel. Mereka dapat menyajikan, menganalisis, dan menyelesaikan masalah dengan menggunakan relasi, fungsi, dan bentuk aljabar.",
  "subject_name": "Matematika",
  "element_name": "Aljabar",
  "phase": "D",
  "grade_level": 7,
  "taxonomy_framework": "Bloom_Revised",
  "max_tps_to_generate": 4
}
Output:
{
  "meta": {
    "subject_name": "Matematika",
    "element_name": "Aljabar",
    "phase": "D",
    "grade_level": 7,
    "taxonomy_framework": "Bloom_Revised",
    "total_tps_derived": 3
  },
  "element_analysis": {
    "core_competencies": ["Menyelesaikan", "Menyajikan", "Menganalisis"],
    "scoped_materials": ["Persamaan linear satu variabel", "Pertidaksamaan linear satu variabel", "Relasi dan bentuk aljabar"],
    "pedagogical_essence": "Pengembangan pemikiran relasional aljabar dari aritmetika konkret menuju pemodelan matematis formal persamaan linear."
  },
  "derived_tps": [
    {
      "tp_code": "TP-MAT-D-7-01",
      "kompetensi": "Menjelaskan dan memodelkan konsep",
      "lingkup_materi": "Bentuk aljabar dan konsep persamaan linear satu variabel (PLSV)",
      "dimensi_p5": ["Bernalar Kritis", "Mandiri"],
      "bloom_cognitive_level": "C2",
      "operational_kko": "Menjelaskan",
      "abcd_components": {
        "audience": "Peserta didik kelas VII",
        "behavior": "dapat menjelaskan konsep variabel, koefisien, konstanta, dan suku dalam bentuk aljabar",
        "condition": "melalui eksplorasi kasus timbangan seimbang",
        "degree": "dengan tepat dan runtut"
      },
      "tp_statement": "Peserta didik mampu menjelaskan konsep variabel, koefisien, konstanta, dan suku pada bentuk aljabar melalui eksplorasi timbangan seimbang secara kritis dan mandiri.",
      "prerequisite_concepts": ["Operasi hitung bilangan bulat", "Sifat distributif aritmetika"]
    },
    {
      "tp_code": "TP-MAT-D-7-02",
      "kompetensi": "Menyelesaikan",
      "lingkup_materi": "Persamaan linear satu variabel (PLSV)",
      "dimensi_p5": ["Bernalar Kritis"],
      "bloom_cognitive_level": "C3",
      "operational_kko": "Menyelesaikan",
      "abcd_components": {
        "audience": "Peserta didik kelas VII",
        "behavior": "dapat menentukan nilai variabel dari persamaan linear satu variabel",
        "condition": "menggunakan sifat-sifat kesetaraan aljabar",
        "degree": "dengan tingkat akurasi perhitungan 100%"
      },
      "tp_statement": "Peserta didik mampu menyelesaikan persamaan linear satu variabel menggunakan sifat-sifat kesetaraan aljabar secara bernalar kritis.",
      "prerequisite_concepts": ["Bentuk aljabar", "Operasi pecahan dan bilangan bulat"]
    },
    {
      "tp_code": "TP-MAT-D-7-03",
      "kompetensi": "Menganalisis dan memecahkan masalah",
      "lingkup_materi": "Penerapan kontekstual persamaan dan pertidaksamaan linear satu variabel",
      "dimensi_p5": ["Bernalar Kritis", "Gotong Royong"],
      "bloom_cognitive_level": "C4",
      "operational_kko": "Menganalisis",
      "abcd_components": {
        "audience": "Peserta didik kelas VII",
        "behavior": "dapat menganalisis situasi masalah nyata dan menyelesaikannya dengan pemodelan PLSV/PtLSV",
        "condition": "melalui diskusi investigasi kelompok kasus transaksi jual beli",
        "degree": "dengan minimal 1 pemodelan matematis yang valid dan interpretasi solusi realistis"
      },
      "tp_statement": "Peserta didik mampu menganalisis masalah kontekstual kehidupan sehari-hari dan memecahkannya melalui pemodelan persamaan atau pertidaksamaan linear satu variabel secara kritis dan bergotong royong.",
      "prerequisite_concepts": ["Penyelesaian PLSV", "Pemahaman membaca teks soal cerita"]
    }
  ]
}
```

#### G. Deterministic Validation Rules & Mathematical Constraints
1. **Assertion 1: Operational Verb Enforcement**:
   - Setiap `operational_kko` dicocokkan dengan set KKO yang diizinkan:
     $$\text{KKO}_{\text{valid}} = \text{Dictionary}_{\text{BloomRevised}}[bloom\_cognitive\_level]$$
   - Jika `operational_kko` $\notin \text{KKO}_{\text{valid}}$, kembalikan error `ERR_3001`.
2. **Assertion 2: Atomic Non-Duplication**:
   - Matriks kesamaan kosinus (*Cosine Similarity*) antar teks `tp_statement` dalam satu elemen:
     $$\text{Sim}(TP_i, TP_j) < 0.85 \quad \forall i \neq j$$
   - Mencegah generasi dua TP dengan substansi semantik identik.
3. **Assertion 3: Completeness of CP Scope**:
   - Setiap konsep utama pada `element_analysis.scoped_materials` wajib muncul minimal pada satu `derived_tps[k].lingkup_materi`.

#### H. Error Codes & Remediation Guidelines
- `ERR_1001 (CP_TEXT_TOO_SHORT)`: Teks CP kurang dari 30 karakter. Remediasi: Minta pengguna memasukkan teks CP elemen resmi secara lengkap.
- `ERR_1002 (INVALID_PHASE_GRADE_PAIR)`: Tingkat kelas tidak sesuai dengan fase (misal Fase D tetapi Kelas 5). Remediasi: Tolak parameter dan tampilkan pemetaan fase resmi (Fase D hanya untuk Kelas 7, 8, 9).
- `ERR_3001 (KKO_NOT_OPERATIONAL)`: Model menghasilkan kata kerja pasif seperti "memahami". Remediasi: Picu auto-correction prompt untuk mengganti KKO dengan kata kerja turunan operasional.
- `ERR_3002 (P5_DIMENSION_INVALID)`: Dimensi karakter di luar 6 pilar BSKAP 031/H/KR/2024. Remediasi: Modul validasi otomatis memetakan ke nama pilar resmi terdekat.

---

### 2.2 SKILL 2: `curriculum-atp-sequencer`

#### A. Metadata & Deskripsi
- **Skill Name**: `curriculum-atp-sequencer`
- **Version**: `1.0.0`
- **Category**: `Curriculum Engineering / Pedagogical Progression`
- **Author**: `Teacher Assistant Engineering Team`
- **Description**: Mengurutkan sekumpulan Tujuan Pembelajaran (TP) menjadi Alur Tujuan Pembelajaran (ATP) linear dan logis sepanjang satu tahun ajaran (atau satu fase). Menerapkan 6 kriteria pengurutan pedagogis resmi (Hierarkis, Prosedural, Konkret-ke-Abstrak, Mudah-ke-Sulit, Deduktif, Scaffolding), memetakan prasyarat dependensi ke dalam Directed Acyclic Graph (DAG) menggunakan Algoritma Kahn dengan **Bloom-Aware Priority Queue** (mencegah *Bloom Cognitive Inversion* pada cabang independen), mendeteksi referensi prasyarat dangling (`ERR_4004`), dan mengestimasi serta menyeimbangkan alokasi Jam Pelajaran (JP) per TP dengan menjaga paritas mutlak terhadap beban struktur kurikulum nasional (Permendikbudristek No. 12/2024).

#### B. Standard YAML Frontmatter
```yaml
---
name: curriculum-atp-sequencer
version: 1.0.0
category: curriculum-engineering
description: "Sequences discrete TPs into a pedagogically sound Alur Tujuan Pembelajaran (ATP) with prerequisite DAG enforcement, Bloom-aware tie-breaking priority queue, and balanced Jam Pelajaran (JP) allocation."
author: Teacher Assistant Engineering Team
parameters:
  - name: tps_to_sequence
    type: array
    required: true
    description: "Daftar objek TP lengkap hasil luaran skill curriculum-cp-tp-derivation."
  - name: subject_name
    type: string
    required: true
    description: "Nama mata pelajaran."
  - name: grade_level
    type: integer
    required: true
    description: "Tingkat kelas sasaran."
  - name: total_annual_jp_budget
    type: integer
    required: true
    description: "Total alokasi Jam Pelajaran (JP) intrakurikuler per tahun ajaran sesuai struktur kurikulum."
  - name: preferred_sequencing_criteria
    type: string
    required: false
    default: "Hierarkis_dan_Scaffolding"
    enum: [
      "Hierarkis",
      "Prosedural",
      "Konkret_ke_Abstrak",
      "Mudah_ke_Sulit",
      "Deduktif",
      "Scaffolding",
      "Hierarkis_dan_Scaffolding"
    ]
    description: "Metode pedagogis utama yang dijadikan dasar pengurutan alur."
validation_rules:
  - rule: "assert_no_dag_cycles"
    description: "Graf ketergantungan prasyarat antar-TP tidak boleh mengandung siklus ketergantungan (circular dependency)."
  - rule: "assert_no_dangling_prerequisites"
    description: "Seluruh kode TP prasyarat yang direferensikan wajib terdaftar secara sah dalam himpunan TP masukan (ERR_4004)."
  - rule: "assert_bloom_priority_monotonicity"
    description: "Simpul-simpul independen berderajat-masuk nol wajib diurutkan berdasarkan kenaikan level kognitif Bloom (C1 s.d. C6) untuk mencegah inversi pedagogis."
  - rule: "assert_exact_jp_parity"
    description: "Total JP terdistribusi pada seluruh urutan ATP wajib sama persis dengan total_annual_jp_budget."
  - rule: "assert_semester_parity_balance"
    description: "Alokasi JP Semester Ganjil dan Genap harus seimbang dalam batas toleransi kalender (maksimal selisih 15%)."
---
```

#### C. Input Parameter Declarations
| Parameter | Tipe | Wajib | Nilai Baku | Batasan & Aturan |
|---|---|:---:|---|---|
| `tps_to_sequence` | `array` | Ya | - | Minimal 2 TP, maksimal 30 TP. Berisi objek TP terstruktur. |
| `subject_name` | `string` | Ya | - | Nama mata pelajaran. |
| `grade_level` | `integer` | Ya | - | Tingkat kelas (1 s.d. 12). |
| `total_annual_jp_budget` | `integer` | Ya | - | Beban JP tahunan resmi (misal: Matematika SMP = 144 JP, Informatika SMP = 72 JP). |
| `preferred_sequencing_criteria` | `string` | Tidak | `"Hierarkis_dan_Scaffolding"` | Salah satu dari 6 metode standar atau kombinasi hierarki-scaffolding. |

#### D. Input & Output JSON Schemas (Draft 2020-12 Compliant)

**Input JSON Schema (`schemas/input.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/curriculum-atp-sequencer/input.json",
  "title": "CurriculumATPSequencerInput",
  "type": "object",
  "required": ["tps_to_sequence", "subject_name", "grade_level", "total_annual_jp_budget"],
  "additionalProperties": false,
  "properties": {
    "tps_to_sequence": {
      "type": "array",
      "minItems": 2,
      "maxItems": 30,
      "items": {
        "type": "object",
        "required": ["tp_code", "tp_statement", "bloom_cognitive_level", "lingkup_materi"],
        "properties": {
          "tp_code": { "type": "string" },
          "tp_statement": { "type": "string" },
          "bloom_cognitive_level": { "type": "string", "enum": ["C1", "C2", "C3", "C4", "C5", "C6"] },
          "lingkup_materi": { "type": "string" },
          "prerequisite_concepts": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      }
    },
    "subject_name": { "type": "string" },
    "grade_level": { "type": "integer", "minimum": 1, "maximum": 12 },
    "total_annual_jp_budget": { "type": "integer", "minimum": 32, "maximum": 300 },
    "preferred_sequencing_criteria": {
      "type": "string",
      "enum": [
        "Hierarkis",
        "Prosedural",
        "Konkret_ke_Abstrak",
        "Mudah_ke_Sulit",
        "Deduktif",
        "Scaffolding",
        "Hierarkis_dan_Scaffolding"
      ],
      "default": "Hierarkis_dan_Scaffolding"
    }
  }
}
```

**Output JSON Schema (`schemas/output.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/curriculum-atp-sequencer/output.json",
  "title": "CurriculumATPSequencerOutput",
  "type": "object",
  "required": ["meta", "atp_progression", "jp_reconciliation"],
  "additionalProperties": false,
  "properties": {
    "meta": {
      "type": "object",
      "required": ["subject_name", "grade_level", "total_tps", "sequencing_strategy_used"],
      "additionalProperties": false,
      "properties": {
        "subject_name": { "type": "string" },
        "grade_level": { "type": "integer" },
        "total_tps": { "type": "integer" },
        "sequencing_strategy_used": { "type": "string" }
      }
    },
    "atp_progression": {
      "type": "array",
      "minItems": 2,
      "items": {
        "type": "object",
        "required": [
          "sequence_order",
          "tp_code",
          "target_semester",
          "allocated_jp",
          "pedagogical_sequencing_rationale",
          "prerequisite_tp_codes",
          "scope_of_assessment"
        ],
        "additionalProperties": false,
        "properties": {
          "sequence_order": { "type": "integer", "minimum": 1 },
          "tp_code": { "type": "string" },
          "target_semester": { "type": "integer", "enum": [1, 2] },
          "allocated_jp": { "type": "integer", "minimum": 2, "maximum": 40 },
          "pedagogical_sequencing_rationale": { "type": "string", "minLength": 20 },
          "prerequisite_tp_codes": {
            "type": "array",
            "items": { "type": "string" }
          },
          "scope_of_assessment": { "type": "string" }
        }
      }
    },
    "jp_reconciliation": {
      "type": "object",
      "required": [
        "total_budgeted_jp",
        "total_allocated_jp",
        "semester_1_jp",
        "semester_2_jp",
        "parity_confirmed"
      ],
      "additionalProperties": false,
      "properties": {
        "total_budgeted_jp": { "type": "integer" },
        "total_allocated_jp": { "type": "integer" },
        "semester_1_jp": { "type": "integer" },
        "semester_2_jp": { "type": "integer" },
        "parity_confirmed": { "type": "boolean" }
      }
    }
  }
}
```

#### E. Core Algorithmic & Pedagogical Logic
1. **Langkah 1: Validasi Integritas Graf & Algoritma Kahn dengan Bloom-Aware Priority Queue**:
   - **Representasi Graf**: Setiap TP dimodelkan sebagai simpul $V_i \in V$. Ketergantungan prasyarat membentuk busur terarah $V_j \to V_i$ (artinya TP $V_j$ wajib tuntas sebelum TP $V_i$).
   - **Validasi Pointer Prasyarat (Dangling Check)**: Sebelum graf diinisialisasi, sistem memvalidasi bahwa setiap kode prasyarat $u \in \text{prerequisite\_tp\_codes}(v)$ ada dalam himpunan $V$. Jika ditemukan kode prasyarat yang tidak terdaftar dalam dataset, eksekusi graf ditolak seketika dengan kode error `ERR_4004 (DANGLING_PREREQUISITE_REFERENCE)`.
   - **Kalkulasi Derajat Masuk (In-Degree)**: Untuk setiap simpul $v \in V$, hitung $\text{in\_degree}(v) = |\{u \in V \mid (u, v) \in E\}|$.
   - **Bloom Cognitive Priority Queue**: Masukkan seluruh simpul berderajat masuk nol ($\text{in\_degree}(v) == 0$) ke dalam antrean prioritas minimum (Min-Priority Queue) $Q$.
     - Fungsi Pembobot Kognitif Bloom:
       $$\text{BloomRank}(C_k) = \begin{cases} 1 & (C_1 - \text{Mengingat}) \\ 2 & (C_2 - \text{Memahami}) \\ 3 & (C_3 - \text{Mengaplikasikan}) \\ 4 & (C_4 - \text{Menganalisis}) \\ 5 & (C_5 - \text{Mengevaluasi}) \\ 6 & (C_6 - \text{Mencipta}) \end{cases}$$
     - **Aturan Pemutus Seri (Tie-Breaking Rule)**: Jika terdapat dua atau lebih simpul independen yang sama-sama berderajat masuk nol, simpul dengan $\text{BloomRank}$ lebih rendah diekstraksi terlebih dahulu ($C_1 \to C_2 \to C_3 \to C_4 \to C_5 \to C_6$). Jika level Bloom identik, simpul diurutkan berdasarkan urutan leksikal/kemunculan awal.
     - *Eliminasi Inversi Kognitif*: Aturan ini secara matematis mencegah fenomena *Bloom Cognitive Inversion* (di mana tujuan tingkat tinggi seperti C6 Merancang/Mencipta dieksekusi sebelum konsep dasar C1/C2 pada cabang materi yang tidak saling terhubung langsung).
   - **Pemrosesan Topologis**:
     - Dequeue simpul $u$ dari $Q$, tambahkan ke `atp_progression`.
     - Untuk setiap tetangga keluar $v$ dari $u$: kurangi $\text{in\_degree}(v)$ sebesar 1. Jika $\text{in\_degree}(v) == 0$, masukkan $v$ ke dalam Min-Priority Queue $Q$.
   - **Deteksi Siklus**: Jika jumlah simpul yang diproses $< |V|$, sistem menjalankan algoritma Tarjan DFS untuk melacak siklus aktif dan membangkitkan `ERR_4001 (ATP_CYCLIC_DEPENDENCY)`.
2. **Langkah 2: Aplikasi Kriteria Pengurutan Pedagogis Lanjutan**:
   - Terapkan penyelarasan pedagogis berdasarkan `preferred_sequencing_criteria`:
     - *Hierarkis*: Didukung mutlak oleh DAG prasyarat dan Bloom priority queue.
     - *Konkret ke Abstrak*: Mengelompokkan materi dengan objek konkret mendahului konsep abstrak formal.
     - *Prosedural*: Menjaga urutan langkah metodologis (observasi $\to$ analisis $\to$ sintesis).
     - *Scaffolding*: Gradasi dari instruksi terbimbing penuh menuju tugas mandiri.
3. **Langkah 3: Mesin Estimasi Jam Pelajaran (JP Estimator)**:
   - Hitung bobot kompleksitas awal per TP:
     $$W_i = \text{Score}_{\text{Bloom}}(C_k) \times \text{Weight}_{\text{Scope}}(L_k)$$
     Di mana $\text{Score}_{\text{Bloom}} \in \{C_1: 1, C_2: 1.5, C_3: 2, C_4: 2.5, C_5: 3, C_6: 3.5\}$.
   - Proporsikan alokasi JP sementara:
     $$JP_{\text{raw}, i} = \frac{W_i}{\sum W} \times \text{total\_annual\_jp\_budget}$$
   - Bulatkan ke bilangan bulat genap/kelipatan JP tatap muka mingguan, lalu lakukan **Reconciliation Adjustment** agar:
     $$\sum_{i=1}^{N} JP_{\text{final}, i} = \text{total\_annual\_jp\_budget}$$
4. **Langkah 4: Pembagian Semester 1 & Semester 2**:
   - Akumulasikan JP dari urutan ke-1 hingga mencapai $\approx 50\%$ dari total tahunan untuk Semester 1 (Ganjil).
   - Sisa urutan dialokasikan untuk Semester 2 (Genap).

#### F. Few-Shot Prompt Template
```text
[SYSTEM INSTRUCTION]
Anda adalah Master Curriculum Planner AI. Tugas Anda adalah mengurutkan sekumpulan Tujuan Pembelajaran (TP) menjadi Alur Tujuan Pembelajaran (ATP) linear untuk satu tahun ajaran penuh berdasarkan kriteria pedagogis resmi Kurikulum Merdeka (BSKAP PPA 2024).
Anda wajib menentukan ketergantungan prasyarat, semester target, serta mengestimasi Jam Pelajaran (JP) dengan prinsip konservasi matematika: Total alokasi JP seluruh TP wajib sama persis dengan total anggaran JP tahunan.

Kriteria Pengurutan Pedagogis:
1. Hierarkis: Konsep fondasi mendahului konsep turunan.
2. Konkret ke Abstrak: Konsep visual/nyata mendahului rumus abstrak.
3. Scaffolding: Tahapan bimbingan intensif mendahului tugas mandiri kompleks.

[FEW-SHOT EXEMPLAR: INFORMATIKA KELAS 7 (TOTAL 72 JP)]
Input:
{
  "tps_to_sequence": [
    { "tp_code": "TP-INF-7-01", "tp_statement": "Menerapkan berpikir komputasional untuk menyelesaikan dekomposisi persoalan komputasi.", "bloom_cognitive_level": "C3", "lingkup_materi": "Berpikir Komputasional" },
    { "tp_code": "TP-INF-7-02", "tp_statement": "Menjelaskan komponen perangkat keras dan sistem operasi komputer.", "bloom_cognitive_level": "C2", "lingkup_materi": "Sistem Komputer" },
    { "tp_code": "TP-INF-7-03", "tp_statement": "Merancang program visual sederhana menggunakan blok pemrograman Scratch.", "bloom_cognitive_level": "C6", "lingkup_materi": "Algoritma dan Pemrograman" },
    { "tp_code": "TP-INF-7-04", "tp_statement": "Mempraktikkan pengiriman data dan etika bermedia digital dalam jaringan internet.", "bloom_cognitive_level": "C3", "lingkup_materi": "Jaringan Komputer dan Internet" }
  ],
  "subject_name": "Informatika",
  "grade_level": 7,
  "total_annual_jp_budget": 72,
  "preferred_sequencing_criteria": "Hierarkis_dan_Scaffolding"
}
Output:
{
  "meta": {
    "subject_name": "Informatika",
    "grade_level": 7,
    "total_tps": 4,
    "sequencing_strategy_used": "Hierarkis_dan_Scaffolding"
  },
  "atp_progression": [
    {
      "sequence_order": 1,
      "tp_code": "TP-INF-7-02",
      "target_semester": 1,
      "allocated_jp": 16,
      "pedagogical_sequencing_rationale": "Pengenalan fisik perangkat keras dan interaksi sistem operasi merupakan fondasi konkret yang mutlak dipahami sebelum mempelajari logika komputasi dan jaringan.",
      "prerequisite_tp_codes": [],
      "scope_of_assessment": "Sumatif Lingkup Materi 1: Perangkat Keras dan Sistem Operasi"
    },
    {
      "sequence_order": 2,
      "tp_code": "TP-INF-7-01",
      "target_semester": 1,
      "allocated_jp": 20,
      "pedagogical_sequencing_rationale": "Berpikir komputasional menumbuhkan ketajaman logika berpikir siswa dalam dekomposisi masalah sebelum masuk ke implementasi pengodean di semester berikutnya.",
      "prerequisite_tp_codes": ["TP-INF-7-02"],
      "scope_of_assessment": "Sumatif Lingkup Materi 2: Logika Berpikir Komputasional"
    },
    {
      "sequence_order": 3,
      "tp_code": "TP-INF-7-04",
      "target_semester": 2,
      "allocated_jp": 16,
      "pedagogical_sequencing_rationale": "Konektivitas jaringan internet dan etika siber dipelajari saat siswa telah memiliki kedewasaan nalar dan literasi digital dasar.",
      "prerequisite_tp_codes": ["TP-INF-7-02"],
      "scope_of_assessment": "Sumatif Lingkup Materi 3: Jaringan Komputer dan Etika Siber"
    },
    {
      "sequence_order": 4,
      "tp_code": "TP-INF-7-03",
      "target_semester": 2,
      "allocated_jp": 20,
      "pedagogical_sequencing_rationale": "Pemrograman visual Scratch adalah fase sintesis tingkat tinggi (C6) yang memadukan logika berpikir komputasional dengan kreativitas perancangan produk mandiri.",
      "prerequisite_tp_codes": ["TP-INF-7-01"],
      "scope_of_assessment": "Sumatif Lingkup Materi 4 / Proyek: Pemrograman Blok Visual Scratch"
    }
  ],
  "jp_reconciliation": {
    "total_budgeted_jp": 72,
    "total_allocated_jp": 72,
    "semester_1_jp": 36,
    "semester_2_jp": 36,
    "parity_confirmed": true
  }
}
```

#### G. Deterministic Validation Rules & Mathematical Constraints
1. **Assertion 1: Invariant Paritas Anggaran JP**:
   $$\sum_{i=1}^{N} \text{atp\_progression}[i].\text{allocated\_jp} == \text{total\_annual\_jp\_budget}$$
   Wajib bernilai `true`. Jika terjadi selisih $\Delta JP \neq 0$, mesin deterministik mengalokasikan selisih ke TP dengan bobot JP terbesar secara otomatis.
2. **Assertion 2: DAG Non-Circularity**:
   - Algoritma deteksi siklus (Tarjan DFS): Jika simpul $V_i$ berada pada stack traversal aktif dan dikunjungi kembali, picu error `ERR_4001 (ATP_CYCLIC_DEPENDENCY)`.
3. **Assertion 3: Keterurutan Prasyarat Temporal**:
   - Jika $TP_A \in \text{prerequisite\_tp\_codes}(TP_B)$, maka:
     $$\text{sequence\_order}(TP_A) < \text{sequence\_order}(TP_B)$$
4. **Assertion 4: Validitas Referensi Prasyarat (No Dangling References)**:
   - Setiap kode TP prasyarat wajib ada dalam daftar simpul graf:
     $$\forall TP_i \in V, \quad \forall p \in TP_i.\text{prerequisite\_tp\_codes} \implies p \in \{v.\text{tp\_code} \mid v \in V\}$$
   - Pelanggaran memicu penolakan seketika dengan `ERR_4004 (DANGLING_PREREQUISITE_REFERENCE)`.
5. **Assertion 5: Monotonisitas Prioritas Kognitif Bloom**:
   - Untuk setiap pasang simpul independen $u, v$ yang masuk ke antrean derajat-nol secara simultan:
     $$\text{BloomRank}(u) < \text{BloomRank}(v) \implies \text{sequence\_order}(u) < \text{sequence\_order}(v)$$

#### H. Error Codes & Remediation Guidelines
- `ERR_4001 (ATP_CYCLIC_DEPENDENCY)`: Terdeteksi circular dependency antar-TP dalam graf pembelajaran. Remediasi: Putus relasi prasyarat yang berulang secara otomatis berdasarkan penelusuran Tarjan SCC dan beri notifikasi kepada guru.
- `ERR_4002 (JP_BUDGET_MISMATCH)`: Model LLM menghasilkan jumlah JP yang tidak sama dengan anggaran tahunan. Remediasi: Jalankan algoritma *deterministic redistributor* di lapisan `validator.ts`.
- `ERR_4003 (PREREQUISITE_SEQUENCE_INVERSION)`: TP prasyarat dijadwalkan setelah TP lanjutan. Remediasi: Tukar posisi urutan TP secara otomatis berdasarkan urutan topologis yang valid.
- `ERR_4004 (DANGLING_PREREQUISITE_REFERENCE)`: Kode TP prasyarat yang direferensikan tidak ditemukan dalam kumpulan TP aktif. Remediasi: Gagalkan kompilasi graf pra-eksekusi, sajikan daftar kode hilang pada UI guru, dan jangan lanjutkan kompilasi ATP dengan pointer kosong.

---
### 2.3 SKILL 3: `curriculum-kktp-builder`

#### A. Metadata & Deskripsi
- **Skill Name**: `curriculum-kktp-builder`
- **Version**: `1.0.0`
- **Category**: `Curriculum Assessment / Criterion-Referenced Evaluation`
- **Author**: `Teacher Assistant Engineering Team`
- **Description**: Menghasilkan Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) yang selaras secara psikometri dan pedagogis dengan Tujuan Pembelajaran (TP) tertentu. Mendukung penuh 3 pendekatan resmi Panduan Pembelajaran dan Asesmen (PPA) Edisi Revisi 2024: (1) Pendekatan Deskripsi Kriteria (checklist kualitatif Memadai/Belum Memadai), (2) Pendekatan Rubrik 4 Skala Bertingkat (Perlu Bimbingan, Cukup, Baik, Mahir) dengan indikator perilaku teramati (*observable behaviors*), dan (3) Pendekatan Skala Interval Nilai dengan batas setengah-terbuka kontinu (*continuous half-open intervals*): $[0.00, 40.00]$, $(40.00, 65.00]$, $(65.00, 85.00]$, $(85.00, 100.00]$ yang menutup seluruh ruang bilangan riil 64-bit float tanpa celah desimal, dilengkapi rekomendasi intervensi edukatif konkret (program remedial terfokus dan pengayaan mandiri).

#### B. Standard YAML Frontmatter
```yaml
---
name: curriculum-kktp-builder
version: 1.0.0
category: curriculum-assessment
description: "Builds criterion-referenced KKTP instruments across 3 official PPA 2024 approaches (Deskripsi Kriteria, 4-Tier Rubric, and Continuous Half-Open Interval Scale with remediation actions)."
author: Teacher Assistant Engineering Team
parameters:
  - name: tp_code
    type: string
    required: true
    description: "Kode unik Tujuan Pembelajaran (e.g., 'TP-MAT-D-7-02')."
  - name: tp_statement
    type: string
    required: true
    description: "Pernyataan narasi lengkap Tujuan Pembelajaran."
  - name: bloom_cognitive_level
    type: string
    required: true
    enum: ["C1", "C2", "C3", "C4", "C5", "C6"]
    description: "Tingkat kognitif Bloom TP target."
  - name: target_approach
    type: string
    required: false
    default: "All_Three_Approaches"
    enum: [
      "Deskripsi_Kriteria",
      "Rubrik_4_Skala",
      "Skala_Interval_Nilai",
      "All_Three_Approaches"
    ]
    description: "Format KKTP yang ingin di-generate."
  - name: assessment_type
    type: string
    required: false
    default: "Tes_Tertulis_dan_Kinerja"
    description: "Teknik asesmen yang direncanakan (e.g., 'Tes Tertulis', 'Unjuk Kerja', 'Proyek', 'Portofolio')."
validation_rules:
  - rule: "assert_no_bare_kkm"
    description: "Dilarang menghasilkan angka KKM tunggal seragam (misal 'KKM=75') tanpa deskriptor kualitatif operasional."
  - rule: "assert_rubric_monotonicity"
    description: "Kriteria deskripsi performa pada Rubrik 4 Skala wajib meningkat secara monoton dari Perlu Bimbingan hingga Mahir."
  - rule: "assert_continuous_half_open_intervals"
    description: "Interval nilai wajib menggunakan sistem batas setengah-terbuka kontinu [0.00, 40.00], (40.00, 65.00], (65.00, 85.00], (85.00, 100.00] menutup seluruh rentang 0.00 s.d. 100.00 tanpa celah floating-point sekecil apapun (zero-gap guarantee)."
---
```

#### C. Input Parameter Declarations
| Parameter | Tipe | Wajib | Nilai Baku | Deskripsi & Batasan |
|---|---|:---:|---|---|
| `tp_code` | `string` | Ya | - | Pola regex: `^TP-[A-Z]{3,4}-[A-F0-9-]+$`. |
| `tp_statement` | `string` | Ya | - | Kalimat TP lengkap, minimal 20 karakter. |
| `bloom_cognitive_level` | `string` | Ya | - | Salah satu dari: `"C1"` s.d. `"C6"`. |
| `target_approach` | `string` | Tidak | `"All_Three_Approaches"` | Pilihan pendekatan spesifik atau ketiga pendekatan sekaligus. |
| `assessment_type` | `string` | Tidak | `"Tes_Tertulis_dan_Kinerja"` | Moda instrumen penilaian. |

#### D. Input & Output JSON Schemas (Draft 2020-12 Compliant)

**Input JSON Schema (`schemas/input.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/curriculum-kktp-builder/input.json",
  "title": "CurriculumKKTPBuilderInput",
  "type": "object",
  "required": ["tp_code", "tp_statement", "bloom_cognitive_level"],
  "additionalProperties": false,
  "properties": {
    "tp_code": { "type": "string" },
    "tp_statement": { "type": "string", "minLength": 20 },
    "bloom_cognitive_level": { "type": "string", "enum": ["C1", "C2", "C3", "C4", "C5", "C6"] },
    "target_approach": {
      "type": "string",
      "enum": ["Deskripsi_Kriteria", "Rubrik_4_Skala", "Skala_Interval_Nilai", "All_Three_Approaches"],
      "default": "All_Three_Approaches"
    },
    "assessment_type": { "type": "string", "default": "Tes_Tertulis_dan_Kinerja" }
  }
}
```

**Output JSON Schema (`schemas/output.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/curriculum-kktp-builder/output.json",
  "title": "CurriculumKKTPBuilderOutput",
  "type": "object",
  "required": ["tp_code", "cognitive_alignment_note", "pendekatan_deskripsi", "pendekatan_rubrik", "pendekatan_interval"],
  "additionalProperties": false,
  "properties": {
    "tp_code": { "type": "string" },
    "cognitive_alignment_note": { "type": "string" },
    "pendekatan_deskripsi": {
      "type": "object",
      "required": ["kriteria_list", "ambang_ketuntasan_deskripsi", "rekomendasi_tindak_lanjut"],
      "additionalProperties": false,
      "properties": {
        "kriteria_list": {
          "type": "array",
          "minItems": 3,
          "items": {
            "type": "object",
            "required": ["indikator_kunci", "deskripsi_tidak_memadai", "deskripsi_memadai"],
            "additionalProperties": false,
            "properties": {
              "indikator_kunci": { "type": "string" },
              "deskripsi_tidak_memadai": { "type": "string" },
              "deskripsi_memadai": { "type": "string" }
            }
          }
        },
        "ambang_ketuntasan_deskripsi": { "type": "string" },
        "rekomendasi_tindak_lanjut": { "type": "string" }
      }
    },
    "pendekatan_rubrik": {
      "type": "object",
      "required": ["aspek_penilaian", "ambang_minimal_tuntas"],
      "additionalProperties": false,
      "properties": {
        "aspek_penilaian": {
          "type": "array",
          "minItems": 2,
          "items": {
            "type": "object",
            "required": [
              "nama_aspek",
              "deskriptor_perlu_bimbingan",
              "deskriptor_cukup",
              "deskriptor_baik",
              "deskriptor_mahir"
            ],
            "additionalProperties": false,
            "properties": {
              "nama_aspek": { "type": "string" },
              "deskriptor_perlu_bimbingan": { "type": "string" },
              "deskriptor_cukup": { "type": "string" },
              "deskriptor_baik": { "type": "string" },
              "deskriptor_mahir": { "type": "string" }
            }
          }
        },
        "ambang_minimal_tuntas": { "type": "string" }
      }
    },
    "pendekatan_interval": {
      "type": "object",
      "required": ["skala_interval"],
      "additionalProperties": false,
      "properties": {
        "skala_interval": {
          "type": "array",
          "minItems": 4,
          "maxItems": 4,
          "items": {
            "type": "object",
            "required": [
              "rentang_persentase",
              "min_score",
              "max_score",
              "min_inclusive",
              "max_inclusive",
              "kategori_ketercapaian",
              "intervensi_edukatif_pendidik",
              "tuntas"
            ],
            "additionalProperties": false,
            "properties": {
              "rentang_persentase": { "type": "string" },
              "min_score": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
              "max_score": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
              "min_inclusive": { "type": "boolean" },
              "max_inclusive": { "type": "boolean" },
              "kategori_ketercapaian": { "type": "string" },
              "intervensi_edukatif_pendidik": { "type": "string" },
              "tuntas": { "type": "boolean" }
            }
          }
        }
      }
    }
  }
}
```

#### E. Core Algorithmic & Pedagogical Logic
1. **Langkah 1: Alignment KKO ke Indikator Kinerja**:
   - Memastikan indikator penilaian menuntut tingkat proses kognitif yang setara atau bertahap menuju KKO target TP (misal: jika TP level $C_4$ [Menganalisis], rubrik harus memuat analisis pembanding, bukan sekadar menyebutkan definisi $C_1$).
2. **Langkah 2: Konstruksi Pendekatan Deskripsi Kriteria**:
   - Pecah kompetensi TP menjadi 3–5 indikator esensial.
   - Tetapkan ambang batas: minimal $k$ dari $n$ kriteria berstatus "Memadai" (misal: 3 dari 4 kriteria memadai).
3. **Langkah 3: Formulasi Rubrik 4 Skala Bertingkat**:
   - Skala 1 (Perlu Bimbingan): Belum mampu mandiri, banyak miskonsepsi, butuh bantuan penuh guru.
   - Skala 2 (Cukup): Menguasai sebagian konsep kunci dengan sedikit kesalahan minor, butuh pendampingan parsial.
   - Skala 3 (Baik - Target Ketuntasan): Menguasai seluruh konsep esensial secara tepat dan mandiri.
   - Skala 4 (Mahir): Menguasai secara mendalam, presisi tinggi, dan mampu memberikan analisis alternatif/kreatif.
4. **Langkah 4: Pemetaan Skala Interval Setengah-Terbuka Kontinu & Tindak Lanjut Diagnostik**:
   - Untuk mengeliminasi celah matematis desimal presisi ganda (*zero-gap floating-point partition*), sistem menggunakan relasi partisi interval setengah-terbuka:
     $$\text{Intervention}(S) = \begin{cases} 
     \text{Belum Tuntas (Remedial Seluruh Materi / Intensif)} & \text{jika } S \in [0.00, 40.00] \\
     \text{Belum Tuntas (Remedial Parsial / Indikator Tertentu)} & \text{jika } S \in (40.00, 65.00] \\
     \text{Sudah Tuntas (Tuntas Standar / Tanpa Remedial)} & \text{jika } S \in (65.00, 85.00] \\
     \text{Sudah Tuntas (Pengayaan / Akselerasi Mandiri)} & \text{jika } S \in (85.00, 100.00]
     \end{cases}$$
   - **[0.00, 40.00]**: Belum mencapai ketuntasan (`tuntas: false`). Intervensi: Remedial intensif menyeluruh secara tatap muka individual dengan guru pendamping.
   - **(40.00, 65.00]**: Belum mencapai ketuntasan (`tuntas: false`). Intervensi: Remedial terarah pada indikator spesifik yang belum dikuasai melalui bimbingan tutor sebaya atau modul terfokus.
   - **(65.00, 85.00]**: Sudah mencapai ketuntasan (`tuntas: true`). Intervensi: Melanjutkan ke materi pembelajaran berikutnya tanpa remedial; latihan penguatan reguler.
   - **(85.00, 100.00]**: Sudah mencapai ketuntasan (`tuntas: true`). Intervensi: Diberikan program pengayaan berbasis proyek eksploratif mandiri atau akselerasi kompetensi tingkat tinggi (HOTS).

#### F. Few-Shot Prompt Template
```text
[SYSTEM INSTRUCTION]
Anda adalah Spesialis Evaluasi & Asesmen Pembelajaran Kurikulum Merdeka (PPA BSKAP 2024).
Tugas Anda adalah merumuskan instrumen Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) dalam 3 pendekatan resmi untuk TP yang diberikan.
DILARANG KERAS menetapkan KKM angka tunggal tanpa deskripsi perilaku. Setiap deskriptor pada rubrik harus teramati (observable), spesifik, dan tidak menggunakan kata sifat subjektif yang ambigu.

[FEW-SHOT EXEMPLAR: BAHASA INDONESIA FASE D]
Input:
{
  "tp_code": "TP-BIN-D-7-03",
  "tp_statement": "Peserta didik mampu menganalisis struktur dan ciri kebahasaan teks prosedur serta menyajikannya dalam bentuk infografik secara kreatif dan bernalar kritis.",
  "bloom_cognitive_level": "C4",
  "target_approach": "All_Three_Approaches",
  "assessment_type": "Kinerja dan Produk Infografik"
}
Output:
{
  "tp_code": "TP-BIN-D-7-03",
  "cognitive_alignment_note": "Instrumen mengukur kemampuan analitis tingkat C4 (mengurai struktur teks prosedur) dan C6 (merancang produk komunikasi visual infografik).",
  "pendekatan_deskripsi": {
    "kriteria_list": [
      {
        "indikator_kunci": "Ketepatan Analisis Struktur Teks",
        "deskripsi_tidak_memadai": "Belum mampu membedakan bagian tujuan, alat/bahan, dan langkah-langkah secara tepat.",
        "deskripsi_memadai": "Mampu mengidentifikasi dan membedakan bagian tujuan, alat/bahan, dan langkah-langkah secara lengkap dan tepat."
      },
      {
        "indikator_kunci": "Analisis Ciri Kebahasaan",
        "deskripsi_tidak_memadai": "Hanya menemukan kurang dari 2 kalimat perintah/kata kerja aktif dalam teks.",
        "deskripsi_memadai": "Mampu menemukan dan menjelaskan minimal 4 penggunaan kalimat perintah, kata kerja aktif, dan konjungsi urutan."
      },
      {
        "indikator_kunci": "Kreativitas Penyajian Infografik",
        "deskripsi_tidak_memadai": "Tata letak tidak teratur dan pesan teks tidak terbaca jelas.",
        "deskripsi_memadai": "Menyajikan teks prosedur dalam infografik visual yang runtut, estetis, dan mudah dipahami pembaca."
      }
    ],
    "ambang_ketuntasan_deskripsi": "Peserta didik dinyatakan tuntas mencapai TP jika minimal 2 dari 3 kriteria dinyatakan 'Memadai'.",
    "rekomendasi_tindak_lanjut": "Peserta didik yang belum tuntas pada kriteria kebahasaan diberikan bimbingan lembar identifikasi kata kerja imperatif."
  },
  "pendekatan_rubrik": {
    "aspek_penilaian": [
      {
        "nama_aspek": "Analisis Struktur & Kaidah Bahasa",
        "deskriptor_perlu_bimbingan": "Belum mampu mengidentifikasi struktur teks dan kaidah bahasa secara mandiri; membutuhkan bantuan penuh guru.",
        "deskriptor_cukup": "Mampu mengidentifikasi struktur teks namun masih terdapat kesalahan dalam menganalisis kaidah kebahasaan imperatif.",
        "deskriptor_baik": "Mampu menganalisis seluruh struktur teks prosedur dan kaidah kebahasaan secara mandiri dan akurat.",
        "deskriptor_mahir": "Mampu menganalisis struktur dan kaidah bahasa serta memberikan alternatif perbaikan kalimat rancu pada teks secara presisi."
      },
      {
        "nama_aspek": "Kualitas Desain Produk Infografik",
        "deskriptor_perlu_bimbingan": "Visual infografik membingungkan, urutan langkah tidak berurutan dan teks terpotong.",
        "deskriptor_cukup": "Visual infografik rapi namun penyusunan alur langkah masih kurang kontras dan belum menarik perhatian.",
        "deskriptor_baik": "Infografik disajikan dengan alur langkah yang koheren, visualisasi ikon yang relevan, dan tipografi yang jelas.",
        "deskriptor_mahir": "Infografik sangat inovatif, tata letak visual sangat profesional, interaktif, dan komunikatif bagi audiens luas."
      }
    ],
    "ambang_minimal_tuntas": "Minimal mencapai kategori 'Baik' pada aspek Analisis Struktur dan minimal 'Cukup' pada aspek Desain Infografik."
  },
  "pendekatan_interval": {
    "skala_interval": [
      {
        "rentang_persentase": "[0.00, 40.00]",
        "min_score": 0.00,
        "max_score": 40.00,
        "min_inclusive": true,
        "max_inclusive": true,
        "kategori_ketercapaian": "Belum Mencapai Ketuntasan (Perlu Intervensi Penuh / Remedial Seluruh Materi)",
        "intervensi_edukatif_pendidik": "Remedial individual: Guru mendampingi membaca terbimbing teks prosedur dan menyediakan template infografik berstruktur tetap.",
        "tuntas": false
      },
      {
        "rentang_persentase": "(40.00, 65.00]",
        "min_score": 40.00,
        "max_score": 65.00,
        "min_inclusive": false,
        "max_inclusive": true,
        "kategori_ketercapaian": "Belum Mencapai Ketuntasan (Remedial Parsial Bagian Tertentu)",
        "intervensi_edukatif_pendidik": "Remedial kelompok: Melakukan perbaikan analisis ciri kebahasaan melalui diskusi kelompok terarah (tutor sebaya).",
        "tuntas": false
      },
      {
        "rentang_persentase": "(65.00, 85.00]",
        "min_score": 65.00,
        "max_score": 85.00,
        "min_inclusive": false,
        "max_inclusive": true,
        "kategori_ketercapaian": "Sudah Mencapai Ketuntasan (Tuntas Standar)",
        "intervensi_edukatif_pendidik": "Tidak perlu remedial; melanjutkan ke materi teks eksplanasi berikutnya dengan latihan penguatan reguler.",
        "tuntas": true
      },
      {
        "rentang_persentase": "(85.00, 100.00]",
        "min_score": 85.00,
        "max_score": 100.00,
        "min_inclusive": false,
        "max_inclusive": true,
        "kategori_ketercapaian": "Sudah Mencapai Ketuntasan (Pengayaan / Akselerasi)",
        "intervensi_edukatif_pendidik": "Pengayaan: Ditantang membuat video demonstrasi tutorial berbasis infografik untuk dipublikasikan di mading sekolah.",
        "tuntas": true
      }
    ]
  }
}
```

#### G. Deterministic Validation Rules & Mathematical Constraints
1. **Assertion 1: Kontinuitas Skala Interval Setengah-Terbuka (Continuous Half-Open Partition)**:
   - Interval wajib tepat 4 kelompok dengan batas setengah-terbuka:
     $$I_1 = [0.00, 40.00], \quad I_2 = (40.00, 65.00], \quad I_3 = (65.00, 85.00], \quad I_4 = (85.00, 100.00]$$
   - Memenuhi syarat partisi matematis lengkap tanpa celah dan tanpa irisan:
     $$\bigcup_{k=1}^4 I_k = [0.00, 100.00] \quad \text{dan} \quad I_j \cap I_k = \emptyset \quad (\forall j \neq k)$$
   - Verifikasi ketat: Untuk setiap nilai skor $S \in [0.00, 100.00]$ dengan resolusi float $0.01$ (10.001 titik uji sampel), terdapat tepat satu interval $I_k$ di mana $S \in I_k$, menjamin tidak ada nilai desimal yang jatuh ke dalam kondisi `null` / unmapped.
2. **Assertion 2: Monotonisitas Rubrik Kinerja**:
   - Jumlah kata atau kompleksitas deskriptor:
     $$\text{Panjang}(\text{Perlu Bimbingan}) < \text{Panjang}(\text{Mahir})$$
   - Serta deskriptor wajib memuat kata operasional spesifik tingkat kompetensi.

#### H. Error Codes & Remediation Guidelines
- `ERR_3010 (BARE_NUMERIC_KKM_DETECTED)`: Ditemukan nilai KKM angka tanpa deskripsi. Remediasi: Tolak output dan suntikkan deskripsi kualitatif otomatis.
- `ERR_3011 (INTERVAL_GAP_OR_OVERLAP)`: Rentang persentase terputus atau memiliki celah desimal (misal $40.01 - 40.99$ tidak terdefinisi). Remediasi: Terapkan batas partisi setengah-terbuka kontinu $[0.00, 40.00]$, $(40.00, 65.00]$, $(65.00, 85.00]$, $(85.00, 100.00]$ secara deterministik.

---

### 2.4 SKILL 4: `curriculum-minggu-efektif-analyzer`

#### A. Metadata & Deskripsi
- **Skill Name**: `curriculum-minggu-efektif-analyzer`
- **Version**: `1.0.0`
- **Category**: `Academic Operations / Calendar Mathematics`
- **Author**: `Teacher Assistant Engineering Team`
- **Description**: Menjalankan kalkulasi matematis presisi tinggi untuk menghitung Rincian Pekan Efektif / Analisis Minggu Efektif (RME/AME) bagi Semester Ganjil (Semester 1) dan Semester Genap (Semester 2). Menghitung Jumlah Minggu Kalender ($JMK$), Jumlah Minggu Tidak Efektif ($JMTE$) berdasarkan agenda resmi sekolah/dinas, Jumlah Minggu Efektif Bersih ($JME$), dan Total Jam Pembelajaran Efektif ($JPE$). Selanjutnya mendistribusikan $JPE$ secara proporsional ke dalam 3 kantong jam pembelajaran: Jam Tatap Muka Materi ($75\% - 80\%$), Jam Asesmen Formatif & Sumatif ($15\% - 20\%$), dan Jam Cadangan ($5\% - 10\%$) dengan jaminan paritas konservasi mutlak.

#### B. Standard YAML Frontmatter
```yaml
---
name: curriculum-minggu-efektif-analyzer
version: 1.0.0
category: academic-operations
description: "Zero-error calendar math engine calculating effective teaching weeks (ME), total effective hours (JPE), and proportional time distribution (Materi, Asesmen, Cadangan)."
author: Teacher Assistant Engineering Team
parameters:
  - name: academic_year
    type: string
    required: true
    description: "Tahun ajaran, format 'YYYY/YYYY' (e.g., '2026/2027')."
  - name: semester
    type: string
    required: true
    enum: ["Ganjil", "Genap"]
    description: "Semester kalender target."
  - name: weekly_jp_allocation
    type: integer
    required: true
    minimum: 1
    maximum: 10
    description: "Beban alokasi Jam Pelajaran (JP) per minggu sesuai struktur kurikulum nasional."
  - name: monthly_calendar_breakdown
    type: array
    required: true
    description: "Rincian bulan kalender beserta jumlah minggu kotor dan agenda non-efektif."
validation_rules:
  - rule: "assert_jme_non_negative"
    description: "Jumlah Minggu Efektif (JME) harus bernilai non-negatif (JMK >= JMTE)."
  - rule: "assert_exact_hours_conservation"
    description: "JPE = JP_Materi + JP_Asesmen + JP_Cadangan wajib terpenuhi dengan selisih 0 JP."
  - rule: "assert_valid_percentage_distribution"
    description: "Proporsi JP Materi wajib berada pada rentang 75% - 80%, Asesmen 15% - 20%, dan Cadangan 5% - 10%."
---
```

#### C. Input Parameter Declarations
| Parameter | Tipe | Wajib | Nilai Baku | Deskripsi & Validasi |
|---|---|:---:|---|---|
| `academic_year` | `string` | Ya | - | Pola regex: `^[0-9]{4}/[0-9]{4}$`. |
| `semester` | `string` | Ya | - | `"Ganjil"` atau `"Genap"`. |
| `weekly_jp_allocation` | `integer` | Ya | - | Integer positif antara 1 hingga 10 (misal: 3 JP/minggu). |
| `monthly_calendar_breakdown` | `array` | Ya | - | Daftar objek 6 bulan dalam semester terkait (Juli–Desember atau Januari–Juni). |

#### D. Input & Output JSON Schemas (Draft 2020-12 Compliant)

**Input JSON Schema (`schemas/input.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/curriculum-minggu-efektif-analyzer/input.json",
  "title": "CurriculumMingguEfektifAnalyzerInput",
  "type": "object",
  "required": ["academic_year", "semester", "weekly_jp_allocation", "monthly_calendar_breakdown"],
  "additionalProperties": false,
  "properties": {
    "academic_year": { "type": "string", "pattern": "^[0-9]{4}/[0-9]{4}$" },
    "semester": { "type": "string", "enum": ["Ganjil", "Genap"] },
    "weekly_jp_allocation": { "type": "integer", "minimum": 1, "maximum": 10 },
    "monthly_calendar_breakdown": {
      "type": "array",
      "minItems": 6,
      "maxItems": 6,
      "items": {
        "type": "object",
        "required": ["month_name", "total_calendar_weeks", "non_effective_events"],
        "additionalProperties": false,
        "properties": {
          "month_name": { "type": "string" },
          "total_calendar_weeks": { "type": "integer", "minimum": 4, "maximum": 6 },
          "non_effective_events": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["event_name", "weeks_consumed"],
              "additionalProperties": false,
              "properties": {
                "event_name": { "type": "string" },
                "weeks_consumed": { "type": "integer", "minimum": 1, "maximum": 4 }
              }
            }
          }
        }
      }
    }
  }
}
```

**Output JSON Schema (`schemas/output.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/curriculum-minggu-efektif-analyzer/output.json",
  "title": "CurriculumMingguEfektifAnalyzerOutput",
  "type": "object",
  "required": [
    "meta",
    "monthly_table",
    "summary_statistics",
    "hours_distribution",
    "audit_invariants"
  ],
  "additionalProperties": false,
  "properties": {
    "meta": {
      "type": "object",
      "required": ["academic_year", "semester", "weekly_jp_allocation"],
      "additionalProperties": false,
      "properties": {
        "academic_year": { "type": "string" },
        "semester": { "type": "string" },
        "weekly_jp_allocation": { "type": "integer" }
      }
    },
    "monthly_table": {
      "type": "array",
      "minItems": 6,
      "maxItems": 6,
      "items": {
        "type": "object",
        "required": [
          "month_name",
          "jmk",
          "jmte",
          "jme",
          "agenda_keterangan"
        ],
        "additionalProperties": false,
        "properties": {
          "month_name": { "type": "string" },
          "jmk": { "type": "integer", "description": "Jumlah Minggu Kotor" },
          "jmte": { "type": "integer", "description": "Jumlah Minggu Tidak Efektif" },
          "jme": { "type": "integer", "description": "Jumlah Minggu Efektif" },
          "agenda_keterangan": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      }
    },
    "summary_statistics": {
      "type": "object",
      "required": ["total_jmk", "total_jmte", "total_jme", "total_jpe"],
      "additionalProperties": false,
      "properties": {
        "total_jmk": { "type": "integer" },
        "total_jmte": { "type": "integer" },
        "total_jme": { "type": "integer" },
        "total_jpe": { "type": "integer" }
      }
    },
    "hours_distribution": {
      "type": "object",
      "required": [
        "jp_materi_intrakurikuler",
        "jp_asesmen_sumatif",
        "jp_cadangan",
        "percentage_materi",
        "percentage_asesmen",
        "percentage_cadangan"
      ],
      "additionalProperties": false,
      "properties": {
        "jp_materi_intrakurikuler": { "type": "integer" },
        "jp_asesmen_sumatif": { "type": "integer" },
        "jp_cadangan": { "type": "integer" },
        "percentage_materi": { "type": "number" },
        "percentage_asesmen": { "type": "number" },
        "percentage_cadangan": { "type": "number" }
      }
    },
    "audit_invariants": {
      "type": "object",
      "required": [
        "is_jme_valid",
        "is_conservation_preserved",
        "checksum"
      ],
      "additionalProperties": false,
      "properties": {
        "is_jme_valid": { "type": "boolean" },
        "is_conservation_preserved": { "type": "boolean" },
        "checksum": { "type": "string" }
      }
    }
  }
}
```

#### E. Core Algorithmic & Mathematical Logic
1. **Perhitungan Tiap Bulan**:
   - Untuk setiap bulan $b \in [1, 6]$:
     $$JMTE_b = \sum \text{weeks\_consumed}$$
     $$JME_b = JMK_b - JMTE_b$$
     Pastikan kondisi batas: $JME_b \ge 0$.
2. **Rekapitulasi Semester**:
   $$\text{Total } JMK = \sum_{b=1}^{6} JMK_b$$
   $$\text{Total } JMTE = \sum_{b=1}^{6} JMTE_b$$
   $$\text{Total } JME = \text{Total } JMK - \text{Total } JMTE$$
   $$\text{Total } JPE = \text{Total } JME \times \text{weekly\_jp\_allocation}$$
3. **Algoritma Alokasi Jam Proporsional Deterministik**:
   - Target Proporsi: Materi $= 75\%$, Asesmen $= 18\%$, Cadangan $= 7\%$.
   - Hitung alokasi dasar bertingkat integer (*floor arithmetic*):
     $$JP_{\text{materi}} = \lfloor 0.77 \times \text{Total } JPE \rfloor$$
     $$JP_{\text{asesmen}} = \lfloor 0.17 \times \text{Total } JPE \rfloor$$
     $$JP_{\text{cadangan}} = \text{Total } JPE - (JP_{\text{materi}} + JP_{\text{asesmen}})$$
   - Evaluasi persentase riil:
     $$P_{\text{materi}} = \frac{JP_{\text{materi}}}{\text{Total } JPE} \times 100\% \quad (75\% \le P_{\text{materi}} \le 80\%)$$
     $$P_{\text{asesmen}} = \frac{JP_{\text{asesmen}}}{\text{Total } JPE} \times 100\% \quad (15\% \le P_{\text{asesmen}} \le 20\%)$$
     $$P_{\text{cadangan}} = \frac{JP_{\text{cadangan}}}{\text{Total } JPE} \times 100\% \quad (5\% \le P_{\text{cadangan}} \le 10\%)$$
   - Jaminan Invarian: $JP_{\text{materi}} + JP_{\text{asesmen}} + JP_{\text{cadangan}} \equiv \text{Total } JPE$.

#### F. Few-Shot Prompt Template
```text
[SYSTEM INSTRUCTION]
Anda adalah Mesin Matematika Kalender Akademik Sekolah Kurikulum Merdeka.
Lakukan kalkulasi Minggu Efektif (JME) dan Jam Pembelajaran Efektif (JPE) berdasarkan data kalender.
Dilarang membulatkan angka secara sembarangan yang mengakibatkan hilangnya jam pelajaran. Terapkan prinsip konservasi matematis: Total JPE = JP Materi + JP Asesmen + JP Cadangan.

[FEW-SHOT EXEMPLAR: SEMESTER GANJIL KELAS VII (3 JP/MINGGU)]
Input:
{
  "academic_year": "2026/2027",
  "semester": "Ganjil",
  "weekly_jp_allocation": 3,
  "monthly_calendar_breakdown": [
    { "month_name": "Juli", "total_calendar_weeks": 4, "non_effective_events": [{ "event_name": "Libur Akhir Tahun Ajaran & MPLS", "weeks_consumed": 2 }] },
    { "month_name": "Agustus", "total_calendar_weeks": 5, "non_effective_events": [] },
    { "month_name": "September", "total_calendar_weeks": 4, "non_effective_events": [{ "event_name": "Jeda Tengah Semester", "weeks_consumed": 1 }] },
    { "month_name": "Oktober", "total_calendar_weeks": 4, "non_effective_events": [] },
    { "month_name": "November", "total_calendar_weeks": 5, "non_effective_events": [] },
    { "month_name": "Desember", "total_calendar_weeks": 4, "non_effective_events": [{ "event_name": "Asesmen Sumatif Akhir Semester & Pembagian Rapor", "weeks_consumed": 2 }, { "event_name": "Libur Semester 1", "weeks_consumed": 1 }] }
  ]
}
Output:
{
  "meta": {
    "academic_year": "2026/2027",
    "semester": "Ganjil",
    "weekly_jp_allocation": 3
  },
  "monthly_table": [
    { "month_name": "Juli", "jmk": 4, "jmte": 2, "jme": 2, "agenda_keterangan": ["Libur Akhir Tahun Ajaran & MPLS (2 mgg)"] },
    { "month_name": "Agustus", "jmk": 5, "jmte": 0, "jme": 5, "agenda_keterangan": ["Efektif Penuh"] },
    { "month_name": "September", "jmk": 4, "jmte": 1, "jme": 3, "agenda_keterangan": ["Jeda Tengah Semester (1 mgg)"] },
    { "month_name": "Oktober", "jmk": 4, "jmte": 0, "jme": 4, "agenda_keterangan": ["Efektif Penuh"] },
    { "month_name": "November", "jmk": 5, "jmte": 0, "jme": 5, "agenda_keterangan": ["Efektif Penuh"] },
    { "month_name": "Desember", "jmk": 4, "jmte": 3, "jme": 1, "agenda_keterangan": ["SAS & Rapor (2 mgg)", "Libur Semester 1 (1 mgg)"] }
  ],
  "summary_statistics": {
    "total_jmk": 26,
    "total_jmte": 6,
    "total_jme": 20,
    "total_jpe": 60
  },
  "hours_distribution": {
    "jp_materi_intrakurikuler": 46,
    "jp_asesmen_sumatif": 10,
    "jp_cadangan": 4,
    "percentage_materi": 76.67,
    "percentage_asesmen": 16.67,
    "percentage_cadangan": 6.66
  },
  "audit_invariants": {
    "is_jme_valid": true,
    "is_conservation_preserved": true,
    "checksum": "SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
  }
}
```

#### G. Deterministic Validation Rules & Mathematical Constraints
1. **Assertion 1: Konservasi Jumlah Jam**:
   $$JP_{\text{materi}} + JP_{\text{asesmen}} + JP_{\text{cadangan}} == \text{total\_jpe}$$
   Wajib bernilai `true`. Jika ada perbedaan 1 JP akibat pembulatan desimal, selisih dimasukkan ke `jp_cadangan`.
2. **Assertion 2: Batas Efektivitas Semester**:
   $$\text{total\_jme} \ge 16 \quad \text{dan} \quad \text{total\_jme} \le 22$$
   Standar kalender pendidikan nasional semester ganjil/genap berada pada rentang 16–22 minggu efektif.

#### H. Error Codes & Remediation Guidelines
- `ERR_4020 (NEGATIVE_EFFECTIVE_WEEKS)`: $JMTE > JMK$ pada suatu bulan. Remediasi: Validasi agenda libur; jumlah minggu libur tidak boleh melebihi minggu kalender bulan tersebut.
- `ERR_4021 (JPE_CONSERVATION_BROKEN)`: Penjumlahan alokasi jam materi, asesmen, dan cadangan tidak sama dengan total JPE. Remediasi: Mesin deterministik mengoreksi otomatis nilai cadangan.

---
### 2.5 SKILL 5: `curriculum-prota-prosem-generator`

#### A. Metadata & Deskripsi
- **Skill Name**: `curriculum-prota-prosem-generator`
- **Version**: `1.0.0`
- **Category**: `Academic Operations / Annual & Semester Scheduling`
- **Author**: `Teacher Assistant Engineering Team`
- **Description**: Menghasilkan dokumen perencanaan administratif Program Tahunan (PROTA) dan matriks mingguan Program Semester (PROSEM / PROMES) yang tersinkronisasi secara matematis dengan hasil analisis pekan efektif (skill `curriculum-minggu-efektif-analyzer`) dan rangkaian ATP (skill `curriculum-atp-sequencer`). Memetakan alokasi Jam Pelajaran (JP) setiap Tujuan Pembelajaran ke dalam tabel PROTA (Semester 1 & 2) serta menyebarkannya secara presisi ke dalam matriks mingguan 6 bulan per semester (Juli–Desember untuk Ganjil, Januari–Juni untuk Genap) dengan menandai minggu-minggu non-efektif (`[MPLS]`, `[LIBUR]`, `[SAS]`, `[RAPOR]`). **Menyelesaikan isu starvasi kolom PROSEM (*Column Starvation Resolution*)**: Mengingat intrakurikuler TP Kurikulum Merdeka hanya menyerap $\sim 80\%$ JPE, generator mengintegrasikan baris aktivitas resmi non-TP berkode `NON-TP-SUMATIF` ($\sim 12 - 15\%$ untuk Asesmen Sumatif Lingkup Materi / SAS) dan `NON-TP-CADANGAN` ($\sim 5 - 8\%$ untuk cadangan, remedial, dan pengayaan) guna menjamin paritas ganda: paritas baris ($\sum \text{TP JPs} = JPE_{\text{materi}}$) dan paritas kolom penuh ($\sum_{\text{rows}} \text{cell}[w] == W_{\text{struktur}}$ untuk seluruh $w \in JME$).

#### B. Standard YAML Frontmatter
```yaml
---
name: curriculum-prota-prosem-generator
version: 1.0.0
category: academic-operations
description: "Generates synchronized PROTA tables and 6-month weekly PROSEM distribution matrices with non-TP activity interleaving and strict dual row-column mathematical parity."
author: Teacher Assistant Engineering Team
parameters:
  - name: subject_name
    type: string
    required: true
    description: "Nama mata pelajaran resmi."
  - name: grade_level
    type: integer
    required: true
    description: "Tingkat kelas sasaran (1 s.d. 12)."
  - name: academic_year
    type: string
    required: true
    description: "Tahun ajaran, format 'YYYY/YYYY'."
  - name: weekly_jp_allocation
    type: integer
    required: true
    description: "Beban JP tatap muka per minggu."
  - name: atp_list
    type: array
    required: true
    description: "Daftar TP terurut dengan semester dan alokasi JP dari curriculum-atp-sequencer."
  - name: ame_ganjil
    type: object
    required: true
    description: "Hasil kalkulasi AME/RME Semester Ganjil dari curriculum-minggu-efektif-analyzer."
  - name: ame_genap
    type: object
    required: true
    description: "Hasil kalkulasi AME/RME Semester Genap dari curriculum-minggu-efektif-analyzer."
validation_rules:
  - rule: "assert_prota_total_equals_annual_budget"
    description: "Total alokasi JP pada PROTA wajib sama persis dengan total anggaran JP tahunan (JPE Ganjil + JPE Genap)."
  - rule: "assert_prosem_row_parity"
    description: "Untuk setiap baris di PROSEM (TP, NON-TP-SUMATIF, NON-TP-CADANGAN), penjumlahan alokasi mingguan wajib sama persis dengan alokasi JP baris tersebut."
  - rule: "assert_prosem_column_parity"
    description: "Pada setiap minggu aktif (JME) di PROSEM, penjumlahan jam seluruh baris yang terjadwal wajib sama persis dengan weekly_jp_allocation (mencegah starvasi kolom)."
  - rule: "assert_non_tp_activity_distribution"
    description: "Aktivitas non-TP (NON-TP-SUMATIF dan NON-TP-CADANGAN) wajib dijadwalkan secara terintegrasi untuk menyerap sisa alokasi JPE (~20%)."
  - rule: "assert_non_effective_weeks_blocked"
    description: "Pada kolom minggu tidak efektif, sel wajib berstatus non-aktif (0 JP) dan memuat kode agenda non-efektif."
---
```

#### C. Input Parameter Declarations
| Parameter | Tipe | Wajib | Nilai Baku | Deskripsi & Batasan |
|---|---|:---:|---|---|
| `subject_name` | `string` | Ya | - | Nama mata pelajaran. |
| `grade_level` | `integer` | Ya | - | Tingkat kelas (1 s.d. 12). |
| `academic_year` | `string` | Ya | - | Pola regex: `^[0-9]{4}/[0-9]{4}$`. |
| `weekly_jp_allocation` | `integer` | Ya | - | Beban JP mingguan (1 s.d. 10). |
| `atp_list` | `array` | Ya | - | Array objek TP hasil sequencing ATP. |
| `ame_ganjil` | `object` | Ya | - | Objek luaran RME Semester Ganjil. |
| `ame_genap` | `object` | Ya | - | Objek luaran RME Semester Genap. |

#### D. Input & Output JSON Schemas (Draft 2020-12 Compliant)

**Input JSON Schema (`schemas/input.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/curriculum-prota-prosem-generator/input.json",
  "title": "CurriculumProtaProsemGeneratorInput",
  "type": "object",
  "required": [
    "subject_name",
    "grade_level",
    "academic_year",
    "weekly_jp_allocation",
    "atp_list",
    "ame_ganjil",
    "ame_genap"
  ],
  "additionalProperties": false,
  "properties": {
    "subject_name": { "type": "string" },
    "grade_level": { "type": "integer", "minimum": 1, "maximum": 12 },
    "academic_year": { "type": "string", "pattern": "^[0-9]{4}/[0-9]{4}$" },
    "weekly_jp_allocation": { "type": "integer", "minimum": 1, "maximum": 10 },
    "atp_list": {
      "type": "array",
      "minItems": 2,
      "items": {
        "type": "object",
        "required": ["sequence_order", "tp_code", "tp_statement", "target_semester", "allocated_jp"],
        "properties": {
          "sequence_order": { "type": "integer" },
          "tp_code": { "type": "string" },
          "tp_statement": { "type": "string" },
          "target_semester": { "type": "integer", "enum": [1, 2] },
          "allocated_jp": { "type": "integer" }
        }
      }
    },
    "ame_ganjil": { "type": "object" },
    "ame_genap": { "type": "object" }
  }
}
```

**Output JSON Schema (`schemas/output.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/curriculum-prota-prosem-generator/output.json",
  "title": "CurriculumProtaProsemGeneratorOutput",
  "type": "object",
  "required": ["prota", "prosem_ganjil", "prosem_genap", "verification_invariants"],
  "additionalProperties": false,
  "properties": {
    "prota": {
      "type": "object",
      "required": ["meta", "semester_ganjil_entries", "semester_genap_entries", "total_annual_jp"],
      "additionalProperties": false,
      "properties": {
        "meta": {
          "type": "object",
          "required": ["subject_name", "grade_level", "academic_year"],
          "additionalProperties": false,
          "properties": {
            "subject_name": { "type": "string" },
            "grade_level": { "type": "integer" },
            "academic_year": { "type": "string" }
          }
        },
        "semester_ganjil_entries": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["no", "tp_code", "activity_category", "materi_pokok", "alokasi_jp"],
            "additionalProperties": false,
            "properties": {
              "no": { "type": "integer" },
              "tp_code": {
                "type": "string",
                "pattern": "^(TP-[A-Z0-9-]+|NON-TP-SUMATIF|NON-TP-CADANGAN)$"
              },
              "activity_category": {
                "type": "string",
                "enum": [
                  "INTRAKURIKULER_MATERI",
                  "ASESMEN_SUMATIF_LINGKUP_MATERI",
                  "ASESMEN_SUMATIF_AKHIR_SEMESTER",
                  "CADANGAN_REMEDIAL_PENGAYAAN"
                ]
              },
              "materi_pokok": { "type": "string" },
              "alokasi_jp": { "type": "integer" }
            }
          }
        },
        "semester_genap_entries": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["no", "tp_code", "activity_category", "materi_pokok", "alokasi_jp"],
            "additionalProperties": false,
            "properties": {
              "no": { "type": "integer" },
              "tp_code": {
                "type": "string",
                "pattern": "^(TP-[A-Z0-9-]+|NON-TP-SUMATIF|NON-TP-CADANGAN)$"
              },
              "activity_category": {
                "type": "string",
                "enum": [
                  "INTRAKURIKULER_MATERI",
                  "ASESMEN_SUMATIF_LINGKUP_MATERI",
                  "ASESMEN_SUMATIF_AKHIR_SEMESTER",
                  "CADANGAN_REMEDIAL_PENGAYAAN"
                ]
              },
              "materi_pokok": { "type": "string" },
              "alokasi_jp": { "type": "integer" }
            }
          }
        },
        "total_annual_jp": { "type": "integer" }
      }
    },
    "prosem_ganjil": {
      "type": "object",
      "required": ["semester", "month_names", "matrix_rows", "total_distributed_jp"],
      "additionalProperties": false,
      "properties": {
        "semester": { "type": "string", "enum": ["Ganjil"] },
        "month_names": {
          "type": "array",
          "items": { "type": "string" },
          "minItems": 6,
          "maxItems": 6
        },
        "matrix_rows": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["tp_code", "activity_category", "materi_pokok", "alokasi_jp", "weekly_cells"],
            "additionalProperties": false,
            "properties": {
              "tp_code": {
                "type": "string",
                "pattern": "^(TP-[A-Z0-9-]+|NON-TP-SUMATIF|NON-TP-CADANGAN)$"
              },
              "activity_category": {
                "type": "string",
                "enum": [
                  "INTRAKURIKULER_MATERI",
                  "ASESMEN_SUMATIF_LINGKUP_MATERI",
                  "ASESMEN_SUMATIF_AKHIR_SEMESTER",
                  "CADANGAN_REMEDIAL_PENGAYAAN"
                ]
              },
              "materi_pokok": { "type": "string" },
              "alokasi_jp": { "type": "integer" },
              "weekly_cells": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": ["month_name", "week_number", "jp_value", "status_tag"],
                  "additionalProperties": false,
                  "properties": {
                    "month_name": { "type": "string" },
                    "week_number": { "type": "integer" },
                    "jp_value": { "type": "integer", "minimum": 0 },
                    "status_tag": { "type": "string" }
                  }
                }
              }
            }
          }
        },
        "total_distributed_jp": { "type": "integer" }
      }
    },
    "prosem_genap": {
      "type": "object",
      "required": ["semester", "month_names", "matrix_rows", "total_distributed_jp"],
      "additionalProperties": false,
      "properties": {
        "semester": { "type": "string", "enum": ["Genap"] },
        "month_names": {
          "type": "array",
          "items": { "type": "string" },
          "minItems": 6,
          "maxItems": 6
        },
        "matrix_rows": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["tp_code", "activity_category", "materi_pokok", "alokasi_jp", "weekly_cells"],
            "additionalProperties": false,
            "properties": {
              "tp_code": {
                "type": "string",
                "pattern": "^(TP-[A-Z0-9-]+|NON-TP-SUMATIF|NON-TP-CADANGAN)$"
              },
              "activity_category": {
                "type": "string",
                "enum": [
                  "INTRAKURIKULER_MATERI",
                  "ASESMEN_SUMATIF_LINGKUP_MATERI",
                  "ASESMEN_SUMATIF_AKHIR_SEMESTER",
                  "CADANGAN_REMEDIAL_PENGAYAAN"
                ]
              },
              "materi_pokok": { "type": "string" },
              "alokasi_jp": { "type": "integer" },
              "weekly_cells": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": ["month_name", "week_number", "jp_value", "status_tag"],
                  "additionalProperties": false,
                  "properties": {
                    "month_name": { "type": "string" },
                    "week_number": { "type": "integer" },
                    "jp_value": { "type": "integer", "minimum": 0 },
                    "status_tag": { "type": "string" }
                  }
                }
              }
            }
          }
        },
        "total_distributed_jp": { "type": "integer" }
      }
    },
    "verification_invariants": {
      "type": "object",
      "required": ["prota_prosem_parity", "all_rows_valid", "all_columns_valid", "column_starvation_free"],
      "additionalProperties": false,
      "properties": {
        "prota_prosem_parity": { "type": "boolean" },
        "all_rows_valid": { "type": "boolean" },
        "all_columns_valid": { "type": "boolean" },
        "column_starvation_free": { "type": "boolean" }
      }
    }
  }
}
```

#### E. Core Algorithmic & Mathematical Logic
1. **Penyusunan PROTA & Alokasi Proporsional Kurikulum Merdeka**:
   - Filter `atp_list` ke dalam dua bucket: Semester 1 (`target_semester == 1`) dan Semester 2 (`target_semester == 2`).
   - Terapkan struktur pembagian alokasi waktu Kurikulum Merdeka (Panduan Pembelajaran dan Asesmen 2024):
     $$JPE_{\text{total}} = JPE_{\text{materi}} + JPE_{\text{sumatif}} + JPE_{\text{cadangan}}$$
     Di mana alokasi intrakurikuler materi (TP) menyerap $\approx 80\%$, Asesmen Sumatif Lingkup Materi dan Akhir Semester menyerap $\approx 12 - 15\%$, dan Jam Cadangan (remedial/pengayaan) menyerap $\approx 5 - 8\%$.
   - Petakan setiap elemen ke tabel PROTA dengan menyertakan kode aktivitas non-TP standar:
     - `TP-[MAPEL]-[FASE]-[KELAS]-[NO]`: Pembelajaran materi intrakurikuler.
     - `NON-TP-SUMATIF`: Asesmen Sumatif Lingkup Materi / Sumatif Akhir Semester (SAS/SAT).
     - `NON-TP-CADANGAN`: Jam Cadangan untuk penanganan ketidaktuntasan, remedial intensif, dan pengayaan.
2. **Konstruksi Matriks PROSEM Mingguan**:
   - Bangun array waktu linear untuk seluruh minggu kalender semester (misal 26 minggu: Juli M1 s.d. Desember M4/M5).
   - Identifikasi minggu tidak efektif berdasarkan data `monthly_table` pada AME. Sel-sel pada minggu tidak efektif diisi dengan `jp_value = 0` dan diberi label khusus (e.g. `[MPLS]`, `[LIBUR]`, `[SAS]`, `[RAPOR]`).
   - Identifikasi slot minggu aktif ($JME$). Setiap minggu aktif memiliki kapasitas beban tatap muka tepat sebesar `weekly_jp_allocation` ($W_{\text{struktur}}$).
3. **Penyelesaian Starvasi Kolom Matriks (Column Starvation Resolution)**:
   - *Akar Masalah Starvasi*: Apabila matriks PROSEM hanya mengalirkan jam TP intrakurikuler (58 JP dari total 72 JPE pada kursus 4 JP/minggu, 18 minggu efektif), jam TP akan habis pada pertengahan Minggu 15. Akibatnya, Minggu 16, 17, dan 18 mengalami starvasi kolom (0 JP), memicu kegagalan fatal pada invariant paritas kolom ($\sum_{\text{rows}} \text{cell}[w] == W_{\text{struktur}}$).
   - *Algoritma Interleaving Terjadwal (Integrated Waterflow Scheduling)*:
     a. Alirkan TP intrakurikuler berurutan ke dalam slot minggu aktif.
     b. Setelah tuntas setiap 1–2 Lingkup Materi utama, sisipkan baris `NON-TP-SUMATIF` (Asesmen Sumatif Lingkup Materi, 2–3 JP) pada minggu berikutnya.
     c. Pada minggu-minggu akhir sebelum ujian resmi (misal Minggu Aktif 16–17), jadwalkan baris `NON-TP-SUMATIF` (Asesmen Sumatif Akhir Semester).
     d. Pada minggu aktif penutup (Minggu Aktif 18), alokasikan baris `NON-TP-CADANGAN` (Cadangan Remedial / Pengayaan).
   - *Hasil Eksekusi*: Seluruh 18 minggu aktif terisi secara merata tanpa ada minggu yang kekurangan atau kelebihan jam pembelajaran.
4. **Verifikasi Paritas Ganda Baris dan Kolom Mutlak**:
   - **Paritas Baris (Row Parity)**:
     $$\sum_{w=1}^{JMK} \text{weekly\_cells}[i, w].\text{jp\_value} == \text{matrix\_rows}[i].\text{alokasi\_jp} \quad (\forall \text{ baris } i)$$
     $$\sum_{i \in \text{TP}} \text{alokasi\_jp}_i = JPE_{\text{materi}}, \quad \sum_{i \in \text{Sumatif}} \text{alokasi\_jp}_i = JPE_{\text{sumatif}}, \quad \sum_{i \in \text{Cadangan}} \text{alokasi\_jp}_i = JPE_{\text{cadangan}}$$
   - **Paritas Kolom (Column Parity)**:
     $$\forall w \in [1, JMK]: \quad \sum_{i=1}^{M} \text{matrix\_rows}[i].\text{weekly\_cells}[w].\text{jp\_value} = \begin{cases} W_{\text{struktur}} & (\text{jika } w \in JME \text{ / aktif}) \\ 0 & (\text{jika } w \in JMTE \text{ / non-efektif}) \end{cases}$$
   - **Konservasi Total Matriks**:
     $$\sum_{i=1}^{M} \text{alokasi\_jp}_i \equiv JPE_{\text{total}} \equiv \sum_{w \in JME} W_{\text{struktur}}$$

#### F. Few-Shot Prompt Template
```text
[SYSTEM INSTRUCTION]
Anda adalah Master Scheduler & Administrasi Kurikulum Merdeka AI.
Tugas Anda adalah memetakan data ATP dan Analisis Minggu Efektif (AME) ke dalam tabel Program Tahunan (PROTA) dan Program Semester (PROSEM).
Terapkan ketat aturan matriks kalender: Total JP baris wajib sama dengan alokasi TP/non-TP, dan total JP kolom pada setiap minggu efektif wajib sama dengan beban JP mingguan (W_struktur). Seluruh minggu aktif (JME) harus terjadwal penuh tanpa starvasi kolom dengan menjadwalkan baris NON-TP-SUMATIF dan NON-TP-CADANGAN. Minggu tidak efektif harus di-blok dengan status tag non-efektif.

[FEW-SHOT EXEMPLAR: INFORMATIKA KELAS VII SEMESTER 1 (3 JP/MINGGU, 20 MINGGU EFEKTIF, TOTAL JPE 60 JP)]
Output:
{
  "prota": {
    "meta": { "subject_name": "Informatika", "grade_level": 7, "academic_year": "2026/2027" },
    "semester_ganjil_entries": [
      { "no": 1, "tp_code": "TP-INF-7-01", "activity_category": "INTRAKURIKULER_MATERI", "materi_pokok": "Berpikir Komputasional & Dekomposisi", "alokasi_jp": 24 },
      { "no": 2, "tp_code": "NON-TP-SUMATIF", "activity_category": "ASESMEN_SUMATIF_LINGKUP_MATERI", "materi_pokok": "Asesmen Sumatif Lingkup Materi 1 (BK)", "alokasi_jp": 3 },
      { "no": 3, "tp_code": "TP-INF-7-02", "activity_category": "INTRAKURIKULER_MATERI", "materi_pokok": "Sistem Komputer & Perangkat Keras", "alokasi_jp": 21 },
      { "no": 4, "tp_code": "NON-TP-SUMATIF", "activity_category": "ASESMEN_SUMATIF_AKHIR_SEMESTER", "materi_pokok": "Asesmen Sumatif Akhir Semester (SAS)", "alokasi_jp": 6 },
      { "no": 5, "tp_code": "NON-TP-CADANGAN", "activity_category": "CADANGAN_REMEDIAL_PENGAYAAN", "materi_pokok": "Jam Cadangan, Pengayaan, dan Remedial", "alokasi_jp": 6 }
    ],
    "semester_genap_entries": [],
    "total_annual_jp": 120
  },
  "prosem_ganjil": {
    "semester": "Ganjil",
    "month_names": ["Juli", "Agustus", "September", "Oktober", "November", "Desember"],
    "matrix_rows": [
      {
        "tp_code": "TP-INF-7-01",
        "activity_category": "INTRAKURIKULER_MATERI",
        "materi_pokok": "Berpikir Komputasional & Dekomposisi",
        "alokasi_jp": 24,
        "weekly_cells": [
          { "month_name": "Juli", "week_number": 1, "jp_value": 0, "status_tag": "[LIBUR_TAHUN_LALU]" },
          { "month_name": "Juli", "week_number": 2, "jp_value": 0, "status_tag": "[MPLS]" },
          { "month_name": "Juli", "week_number": 3, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "Juli", "week_number": 4, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "Agustus", "week_number": 1, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "Agustus", "week_number": 2, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "Agustus", "week_number": 3, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "Agustus", "week_number": 4, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "Agustus", "week_number": 5, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "September", "week_number": 1, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "September", "week_number": 2, "jp_value": 0, "status_tag": "EFEKTIF_NEXT_ACTIVITY" }
        ]
      },
      {
        "tp_code": "NON-TP-SUMATIF",
        "activity_category": "ASESMEN_SUMATIF_LINGKUP_MATERI",
        "materi_pokok": "Asesmen Sumatif Lingkup Materi 1 (BK)",
        "alokasi_jp": 3,
        "weekly_cells": [
          { "month_name": "September", "week_number": 2, "jp_value": 3, "status_tag": "EFEKTIF" }
        ]
      },
      {
        "tp_code": "TP-INF-7-02",
        "activity_category": "INTRAKURIKULER_MATERI",
        "materi_pokok": "Sistem Komputer & Perangkat Keras",
        "alokasi_jp": 21,
        "weekly_cells": [
          { "month_name": "September", "week_number": 3, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "September", "week_number": 4, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "Oktober", "week_number": 1, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "Oktober", "week_number": 2, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "Oktober", "week_number": 3, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "Oktober", "week_number": 4, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "November", "week_number": 1, "jp_value": 3, "status_tag": "EFEKTIF" }
        ]
      },
      {
        "tp_code": "NON-TP-SUMATIF",
        "activity_category": "ASESMEN_SUMATIF_AKHIR_SEMESTER",
        "materi_pokok": "Asesmen Sumatif Akhir Semester (SAS)",
        "alokasi_jp": 6,
        "weekly_cells": [
          { "month_name": "November", "week_number": 2, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "November", "week_number": 3, "jp_value": 3, "status_tag": "EFEKTIF" }
        ]
      },
      {
        "tp_code": "NON-TP-CADANGAN",
        "activity_category": "CADANGAN_REMEDIAL_PENGAYAAN",
        "materi_pokok": "Jam Cadangan, Pengayaan, dan Remedial",
        "alokasi_jp": 6,
        "weekly_cells": [
          { "month_name": "November", "week_number": 4, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "Desember", "week_number": 1, "jp_value": 3, "status_tag": "EFEKTIF" },
          { "month_name": "Desember", "week_number": 2, "jp_value": 0, "status_tag": "[PENGOLAHAN_NILAI]" },
          { "month_name": "Desember", "week_number": 3, "jp_value": 0, "status_tag": "[RAPOR]" },
          { "month_name": "Desember", "week_number": 4, "jp_value": 0, "status_tag": "[LIBUR_SEMESTER_1]" }
        ]
      }
    ],
    "total_distributed_jp": 60
  },
  "prosem_genap": { "semester": "Genap", "month_names": ["Januari", "Februari", "Maret", "April", "Mei", "Juni"], "matrix_rows": [], "total_distributed_jp": 60 },
  "verification_invariants": { "prota_prosem_parity": true, "all_rows_valid": true, "all_columns_valid": true, "column_starvation_free": true }
}
```

#### G. Deterministic Validation Rules & Mathematical Constraints
1. **Assertion 1: Paritas Total Semester**:
   $$\sum \text{PROSEM}_{\text{Ganjil}}.\text{matrix\_rows}[i].\text{alokasi\_jp} == \text{JPE}_{\text{Ganjil}}$$
2. **Assertion 2: Paritas Kolom Mingguan Efektif (Column Parity)**:
   - Pada setiap minggu aktif $w \in JME$, jumlah alokasi seluruh baris wajib sama persis dengan beban mingguan:
     $$\forall w \in JME: \quad \sum_{i=1}^{M} \text{matrix\_rows}[i].\text{weekly\_cells}[w].\text{jp\_value} == \text{weekly\_jp\_allocation}$$
3. **Assertion 3: Integritas Kolom Minggu Tidak Efektif**:
   - Jika bulan $b$, minggu $w$ terdaftar sebagai non-efektif pada AME, maka:
     $$\forall i \quad \text{weekly\_cells}[b, w].\text{jp\_value} \equiv 0$$
4. **Assertion 4: Eliminasi Starvasi Kolom (Column Starvation Free)**:
   - Tidak boleh ada minggu efektif aktif $w \in JME$ yang memiliki total alokasi jam $0$:
     $$\forall w \in JME: \quad \sum_{i=1}^{M} \text{matrix\_rows}[i].\text{weekly\_cells}[w].\text{jp\_value} > 0$$

#### H. Error Codes & Remediation Guidelines
- `ERR_4030 (PROSEM_ROW_SUM_MISMATCH)`: Jumlah sel mingguan tidak sama dengan alokasi JP baris. Remediasi: Sesuaikan sel mingguan aktif secara otomatis menggunakan algoritma waterflow scheduling.
- `ERR_4031 (NON_EFFECTIVE_WEEK_CONTAMINATED)`: Ditemukan jam belajar pada minggu libur atau agenda non-efektif. Remediasi: Nol-kan sel dan geser jam tatap muka ke minggu efektif berikutnya.
- `ERR_4032 (PROSEM_COLUMN_SUM_MISMATCH)`: Jumlah alokasi JP pada suatu minggu aktif tidak sama dengan beban mingguan resmi. Remediasi: Mesin deterministik menyesuaikan alokasi baris non-TP untuk menyempurnakan paritas kolom.
- `ERR_4033 (PROSEM_COLUMN_STARVATION)`: Jam pembelajaran habis sebelum akhir semester (minggu aktif penutup kosong/0 JP). Remediasi: Secara otomatis injeksikan baris `NON-TP-SUMATIF` dan `NON-TP-CADANGAN` untuk menyerap proporsi resmi (~20% JPE) dan mengisi seluruh minggu aktif.

---

### 2.6 SKILL 6: `modul-ajar-generator`

#### A. Metadata & Deskripsi
- **Skill Name**: `modul-ajar-generator`
- **Version**: `1.0.0`
- **Category**: `Pedagogy & Lesson Planning / Differentiated Instructional Design`
- **Author**: `Teacher Assistant Engineering Team`
- **Description**: Menghasilkan dokumen perencanaan pembelajaran komprehensif **Modul Ajar (RPP Plus)** 3 Bagian (Informasi Umum, Komponen Inti, dan Lampiran) sesuai standar regulasi Permendikbudristek No. 12 Tahun 2024 dan PPA Edisi Revisi 2024. Mengintegrasikan secara organik prinsip **Pembelajaran Berdiferensiasi** (Diferensiasi Konten berdasarkan modalitas/kesiapan, Diferensiasi Proses melalui bimbingan berjenjang, dan Diferensiasi Produk melalui demonstrasi unjuk kerja multimodal), model pedagogis terstandar (Problem-Based Learning, Project-Based Learning, Discovery Learning, Inquiry, Teaching at the Right Level / TaRL, dan Culturally Responsive Teaching / CRT), serta pengintegrasian nyata 2–3 dimensi Profil Pelajar Pancasila (P5).

#### B. Standard YAML Frontmatter
```yaml
---
name: modul-ajar-generator
version: 1.0.0
category: lesson-planning
description: "Generates complete 3-part Modul Ajar (RPP Plus) integrating Differentiated Instruction (Content, Process, Product) and standard pedagogical models (PBL, PjBL, Discovery, TaRL, CRT)."
author: Teacher Assistant Engineering Team
parameters:
  - name: tp_code
    type: string
    required: true
    description: "Kode Tujuan Pembelajaran target."
  - name: tp_statement
    type: string
    required: true
    description: "Pernyataan narasi lengkap Tujuan Pembelajaran."
  - name: subject_name
    type: string
    required: true
    description: "Nama mata pelajaran."
  - name: phase
    type: string
    required: true
    enum: ["Fondasi", "A", "B", "C", "D", "E", "F"]
    description: "Fase kurikulum."
  - name: grade_level
    type: integer
    required: true
    description: "Tingkat kelas."
  - name: total_meetings
    type: integer
    required: true
    minimum: 1
    maximum: 8
    description: "Jumlah pertemuan tatap muka yang dicakup modul ini."
  - name: jp_per_meeting
    type: integer
    required: true
    minimum: 1
    maximum: 5
    description: "Alokasi Jam Pelajaran (JP) per satu sesi pertemuan."
  - name: pedagogical_model
    type: string
    required: true
    enum: [
      "Problem-Based Learning (PBL)",
      "Project-Based Learning (PjBL)",
      "Discovery Learning",
      "Inquiry Learning",
      "Teaching at the Right Level (TaRL)",
      "Culturally Responsive Teaching (CRT)"
    ]
    description: "Model pembelajaran utama yang diterapkan."
  - name: p5_focal_dimensions
    type: array
    required: true
    minItems: 1
    maxItems: 3
    description: "2 s.d. 3 dimensi Profil Pelajar Pancasila yang disasar secara intensif."
  - name: school_context
    type: object
    required: false
    description: "Konteks sarana prasarana sekolah dan profil awal murid."
validation_rules:
  - rule: "assert_three_part_architecture"
    description: "Modul Ajar wajib memuat secara lengkap Bagian I (Informasi Umum), Bagian II (Komponen Inti), dan Bagian III (Lampiran)."
  - rule: "assert_time_conservation_per_meeting"
    description: "Alokasi waktu Pendahuluan + Inti + Penutup wajib sama persis dengan (jp_per_meeting * menit_standar_jenjang)."
  - rule: "assert_explicit_differentiation"
    description: "Skenario kegiatan inti wajib memuat instruksi operasional konkret untuk Diferensiasi Konten, Diferensiasi Proses, dan Diferensiasi Produk."
---
```

#### C. Input Parameter Declarations
| Parameter | Tipe | Wajib | Nilai Baku | Deskripsi & Batasan |
|---|---|:---:|---|---|
| `tp_code` | `string` | Ya | - | Kode TP rujukan. |
| `tp_statement` | `string` | Ya | - | Pernyataan lengkap TP. |
| `subject_name` | `string` | Ya | - | Nama mata pelajaran. |
| `phase` | `string` | Ya | - | Fase kurikulum. |
| `grade_level` | `integer` | Ya | - | Tingkat kelas (1 s.d. 12). |
| `total_meetings` | `integer` | Ya | - | Rentang 1 s.d. 8 pertemuan. |
| `jp_per_meeting` | `integer` | Ya | - | Beban JP per pertemuan (misal: 2 JP @ 40 menit). |
| `pedagogical_model` | `string` | Ya | - | Model pembelajaran terstandar (PBL, PjBL, Discovery, dll.). |
| `p5_focal_dimensions` | `array` | Ya | - | 1–3 dimensi P5 resmi. |
| `school_context` | `object` | Tidak | `{}` | Konteks sarana prasarana dan profil murid. |

#### D. Input & Output JSON Schemas (Draft 2020-12 Compliant)

**Input JSON Schema (`schemas/input.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/modul-ajar-generator/input.json",
  "title": "ModulAjarGeneratorInput",
  "type": "object",
  "required": [
    "tp_code",
    "tp_statement",
    "subject_name",
    "phase",
    "grade_level",
    "total_meetings",
    "jp_per_meeting",
    "pedagogical_model",
    "p5_focal_dimensions"
  ],
  "additionalProperties": false,
  "properties": {
    "tp_code": { "type": "string" },
    "tp_statement": { "type": "string" },
    "subject_name": { "type": "string" },
    "phase": { "type": "string", "enum": ["Fondasi", "A", "B", "C", "D", "E", "F"] },
    "grade_level": { "type": "integer", "minimum": 1, "maximum": 12 },
    "total_meetings": { "type": "integer", "minimum": 1, "maximum": 8 },
    "jp_per_meeting": { "type": "integer", "minimum": 1, "maximum": 5 },
    "pedagogical_model": {
      "type": "string",
      "enum": [
        "Problem-Based Learning (PBL)",
        "Project-Based Learning (PjBL)",
        "Discovery Learning",
        "Inquiry Learning",
        "Teaching at the Right Level (TaRL)",
        "Culturally Responsive Teaching (CRT)"
      ]
    },
    "p5_focal_dimensions": {
      "type": "array",
      "minItems": 1,
      "maxItems": 3,
      "items": { "type": "string" }
    },
    "school_context": {
      "type": "object",
      "properties": {
        "sarana_prasarana": { "type": "string" },
        "profil_siswa_dominan": { "type": "string" }
      }
    }
  }
}
```

**Output JSON Schema (`schemas/output.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/modul-ajar-generator/output.json",
  "title": "ModulAjarGeneratorOutput",
  "type": "object",
  "required": [
    "bagian_1_informasi_umum",
    "bagian_2_komponen_inti",
    "bagian_3_lampiran"
  ],
  "additionalProperties": false,
  "properties": {
    "bagian_1_informasi_umum": {
      "type": "object",
      "required": [
        "identitas_modul",
        "kompetensi_awal",
        "profil_pelajar_pancasila",
        "sarana_dan_prasarana",
        "target_peserta_didik",
        "model_dan_metode_pembelajaran"
      ],
      "additionalProperties": false,
      "properties": {
        "identitas_modul": {
          "type": "object",
          "required": ["penyusun", "satuan_pendidikan", "mata_pelajaran", "fase", "kelas", "alokasi_waktu_total"],
          "additionalProperties": false,
          "properties": {
            "penyusun": { "type": "string" },
            "satuan_pendidikan": { "type": "string" },
            "mata_pelajaran": { "type": "string" },
            "fase": { "type": "string" },
            "kelas": { "type": "string" },
            "alokasi_waktu_total": { "type": "string" }
          }
        },
        "kompetensi_awal": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
        "profil_pelajar_pancasila": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["dimensi", "elemen", "subelemen_fase", "implementasi_dalam_kegiatan"],
            "additionalProperties": false,
            "properties": {
              "dimensi": { "type": "string" },
              "elemen": { "type": "string" },
              "subelemen_fase": { "type": "string" },
              "implementasi_dalam_kegiatan": { "type": "string" }
            }
          }
        },
        "sarana_dan_prasarana": {
          "type": "object",
          "required": ["media_pembelajaran", "alat_dan_bahan", "lingkungan_belajar", "sumber_belajar"],
          "additionalProperties": false,
          "properties": {
            "media_pembelajaran": { "type": "array", "items": { "type": "string" } },
            "alat_dan_bahan": { "type": "array", "items": { "type": "string" } },
            "lingkungan_belajar": { "type": "string" },
            "sumber_belajar": { "type": "array", "items": { "type": "string" } }
          }
        },
        "target_peserta_didik": { "type": "string" },
        "model_dan_metode_pembelajaran": {
          "type": "object",
          "required": ["model_utama", "pendekatan", "metode_khusus"],
          "additionalProperties": false,
          "properties": {
            "model_utama": { "type": "string" },
            "pendekatan": { "type": "string" },
            "metode_khusus": { "type": "array", "items": { "type": "string" } }
          }
        }
      }
    },
    "bagian_2_komponen_inti": {
      "type": "object",
      "required": [
        "tujuan_pembelajaran_spesifik",
        "pemahaman_bermakna",
        "pertanyaan_pemantik",
        "persiapan_pembelajaran",
        "kegiatan_pembelajaran_per_pertemuan",
        "asesmen",
        "pengayaan_dan_remedial",
        "refleksi_guru_dan_siswa"
      ],
      "additionalProperties": false,
      "properties": {
        "tujuan_pembelajaran_spesifik": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
        "pemahaman_bermakna": { "type": "string", "minLength": 30 },
        "pertanyaan_pemantik": { "type": "array", "items": { "type": "string" }, "minItems": 2 },
        "persiapan_pembelajaran": { "type": "array", "items": { "type": "string" } },
        "kegiatan_pembelajaran_per_pertemuan": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "required": [
              "pertemuan_ke",
              "alokasi_waktu_menit",
              "topik_spesifik",
              "kegiatan_pendahuluan",
              "kegiatan_inti_sintaks",
              "strategi_diferensiasi",
              "kegiatan_penutup"
            ],
            "additionalProperties": false,
            "properties": {
              "pertemuan_ke": { "type": "integer" },
              "alokasi_waktu_menit": { "type": "integer" },
              "topik_spesifik": { "type": "string" },
              "kegiatan_pendahuluan": {
                "type": "object",
                "required": ["durasi_menit", "langkah_langkah"],
                "additionalProperties": false,
                "properties": {
                  "durasi_menit": { "type": "integer" },
                  "langkah_langkah": { "type": "array", "items": { "type": "string" } }
                }
              },
              "kegiatan_inti_sintaks": {
                "type": "object",
                "required": ["durasi_menit", "fase_fase_model"],
                "additionalProperties": false,
                "properties": {
                  "durasi_menit": { "type": "integer" },
                  "fase_fase_model": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": ["nama_sintaks", "aktivitas_guru", "aktivitas_siswa"],
                      "additionalProperties": false,
                      "properties": {
                        "nama_sintaks": { "type": "string" },
                        "aktivitas_guru": { "type": "string" },
                        "aktivitas_siswa": { "type": "string" }
                      }
                    }
                  }
                }
              },
              "strategi_diferensiasi": {
                "type": "object",
                "required": ["diferensiasi_konten", "diferensiasi_proses", "diferensiasi_produk"],
                "additionalProperties": false,
                "properties": {
                  "diferensiasi_konten": { "type": "string" },
                  "diferensiasi_proses": { "type": "string" },
                  "diferensiasi_produk": { "type": "string" }
                }
              },
              "kegiatan_penutup": {
                "type": "object",
                "required": ["durasi_menit", "langkah_langkah"],
                "additionalProperties": false,
                "properties": {
                  "durasi_menit": { "type": "integer" },
                  "langkah_langkah": { "type": "array", "items": { "type": "string" } }
                }
              }
            }
          }
        },
        "asesmen": {
          "type": "object",
          "required": ["asesmen_diagnostik_awal", "asesmen_formatif_proses", "asesmen_sumatif_akhir"],
          "additionalProperties": false,
          "properties": {
            "asesmen_diagnostik_awal": { "type": "string" },
            "asesmen_formatif_proses": { "type": "string" },
            "asesmen_sumatif_akhir": { "type": "string" }
          }
        },
        "pengayaan_dan_remedial": {
          "type": "object",
          "required": ["rencana_pengayaan", "rencana_remedial"],
          "additionalProperties": false,
          "properties": {
            "rencana_pengayaan": { "type": "string" },
            "rencana_remedial": { "type": "string" }
          }
        },
        "refleksi_guru_dan_siswa": {
          "type": "object",
          "required": ["pertanyaan_refleksi_guru", "pertanyaan_refleksi_siswa"],
          "additionalProperties": false,
          "properties": {
            "pertanyaan_refleksi_guru": { "type": "array", "items": { "type": "string" } },
            "pertanyaan_refleksi_siswa": { "type": "array", "items": { "type": "string" } }
          }
        }
      }
    },
    "bagian_3_lampiran": {
      "type": "object",
      "required": [
        "lembar_kerja_peserta_didik_ringkasan",
        "bahan_bacaan_guru_dan_siswa",
        "glosarium",
        "daftar_pustaka"
      ],
      "additionalProperties": false,
      "properties": {
        "lembar_kerja_peserta_didik_ringkasan": { "type": "string" },
        "bahan_bacaan_guru_dan_siswa": { "type": "string", "minLength": 50 },
        "glosarium": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["istilah", "definisi"],
            "additionalProperties": false,
            "properties": {
              "istilah": { "type": "string" },
              "definisi": { "type": "string" }
            }
          }
        },
        "daftar_pustaka": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```

#### E. Core Algorithmic & Pedagogical Logic
1. **Langkah 1: Perhitungan Durasi Waktu Jam Pembelajaran**:
   - Tentukan durasi 1 JP berdasarkan jenjang: SD = 35 menit, SMP = 40 menit, SMA/SMK = 45 menit.
   - Total durasi pertemuan: $T_{\text{sesi}} = JP \times \text{Durasi}_{1JP}$ (contoh SMP 2 JP = 80 menit).
   - Bagi alokasi sesi:
     - Kegiatan Pendahuluan: $10 - 15\text{ menit}$.
     - Kegiatan Inti: $55 - 60\text{ menit}$.
     - Kegiatan Penutup: $10 - 15\text{ menit}$.
     - Penjumlahan wajib sama: $T_{\text{pend}} + T_{\text{inti}} + T_{\text{penutup}} \equiv T_{\text{sesi}}$.
2. **Langkah 2: Integrasi Sintaks Model Pembelajaran**:
   - Jika model adalah Problem-Based Learning (PBL), generate 5 fase sintaks baku:
     - *Fase 1*: Orientasi siswa pada masalah kontekstual.
     - *Fase 2*: Mengorganisasikan siswa untuk belajar.
     - *Fase 3*: Membimbing penyelidikan individu/kelompok.
     - *Fase 4*: Mengembangkan dan menyajikan hasil karya.
     - *Fase 5*: Menganalisis dan mengevaluasi proses pemecahan masalah.
3. **Langkah 3: Formulasi Pembelajaran Berdiferensiasi (Differentiated Instruction)**:
   - *Diferensiasi Konten*: Siapkan opsi materi berbasis visual (infografik/video), teks naratif bertingkat, atau alat peraga konkret.
   - *Diferensiasi Proses*: Sediakan scaffolding bertingkat (kelompok pemula mendapat lembar panduan langkah-demi-langkah dan bimbingan guru berkala; kelompok mandiri mengeksplorasi secara terbuka).
   - *Diferensiasi Produk*: Siswa diberi kebebasan memilih bentuk demonstrasi solusi (poster infografik, laporan tertulis, rekaman podcast pendek, atau presentasi lisan).
4. **Langkah 4: Operasionalisasi Dimensi P5**:
   - Setiap dimensi P5 yang dipilih dipetakan ke elemen dan subelemen fase BSKAP 031/H/KR/2024, lalu diintegrasikan ke dalam aktivitas belajar siswa nyata (bukan sekadar daftar istilah).

#### F. Few-Shot Prompt Template
```text
[SYSTEM INSTRUCTION]
Anda adalah Master Pedagogical Designer Kurikulum Merdeka (Permendikbudristek No. 12 Tahun 2024).
Tugas Anda adalah merancang dokumen Modul Ajar lengkap 3 Bagian (Informasi Umum, Komponen Inti, Lampiran) dengan integrasi nyata Pembelajaran Berdiferensiasi (Konten, Proses, Produk) dan sintaks model pembelajaran teruji.

[FEW-SHOT EXEMPLAR: MATEMATIKA KELAS VII SMP (MODEL PBL - 2 PERTEMUAN @ 2 JP)]
Output:
{
  "bagian_1_informasi_umum": {
    "identitas_modul": {
      "penyusun": "Guru Matematika Profesional",
      "satuan_pendidikan": "SMP Negeri 1 Indonesia",
      "mata_pelajaran": "Matematika",
      "fase": "D",
      "kelas": "VII",
      "alokasi_waktu_total": "2 Pertemuan (4 JP x 40 menit = 160 menit)"
    },
    "kompetensi_awal": ["Operasi hitung bilangan bulat", "Sifat distributif aritmetika"],
    "profil_pelajar_pancasila": [
      {
        "dimensi": "Bernalar Kritis",
        "elemen": "Memperoleh dan memproses informasi dan gagasan",
        "subelemen_fase": "Mengidentifikasi, mengklarifikasi, dan mengolah informasi dan gagasan yang relevan serta memprioritaskan beberapa gagasan tertentu.",
        "implementasi_dalam_kegiatan": "Siswa menganalisis relasi timbangan seimbang untuk menyimpulkan nilai variabel aljabar yang tidak diketahui."
      },
      {
        "dimensi": "Gotong Royong",
        "elemen": "Kolaborasi",
        "subelemen_fase": "Menyelaraskan tindakan sendiri dengan tindakan orang lain untuk melaksanakan kegiatan dan mencapai tujuan kelompok.",
        "implementasi_dalam_kegiatan": "Siswa berdiskusi aktif dalam kelompok heterogen menyusun strategi pemecahan masalah PLSV."
      }
    ],
    "sarana_dan_prasarana": {
      "media_pembelajaran": ["Alat peraga timbangan neraca dua lengan", "Simulasi PhET 'Equality Explorer'"],
      "alat_dan_bahan": ["Kelereng", "Kotak misteri (amplop tertutup)", "Kertas plano", "Spidol warna"],
      "lingkungan_belajar": "Ruang kelas dengan penataan meja format kelompok (4-5 siswa)",
      "sumber_belajar": ["Buku Siswa Matematika Kelas VII Kemendikbudristek", "Lembar Kerja Siswa"]
    },
    "target_peserta_didik": "Peserta didik reguler, dengan diferensiasi pendampingan bagi siswa berkesulitan belajar.",
    "model_dan_metode_pembelajaran": {
      "model_utama": "Problem-Based Learning (PBL)",
      "pendekatan": "Saintifik dan Teaching at the Right Level (TaRL)",
      "metode_khusus": ["Eksplorasi Konkret", "Diskusi Kelompok", "Presentasi Galeri"]
    }
  },
  "bagian_2_komponen_inti": {
    "tujuan_pembelajaran_spesifik": [
      "Menemukan konsep persamaan linear satu variabel melalui pemodelan kesetimbangan timbangan.",
      "Menyelesaikan persamaan linear satu variabel menggunakan sifat-sifat kesetaraan aljabar."
    ],
    "pemahaman_bermakna": "Persamaan matematis adalah representasi kesetimbangan dua sisi; apa pun perlakuan adil yang diberikan pada satu sisi harus dilakukan persis sama pada sisi lainnya untuk menjaga kesetaraan.",
    "pertanyaan_pemantik": [
      "Bagaimana pedagang buah di pasar tradisional mengetahui berat buah tanpa angka digital?",
      "Jika 2 kotak tertutup ditambah 3 kelereng seimbang dengan 11 kelereng, berapa kelereng di dalam tiap kotak?"
    ],
    "persiapan_pembelajaran": [
      "Guru menyiapkan alat peraga timbangan dan amplop berisi kelereng.",
      "Guru mencetak LKPD berdiferensiasi 3 tier."
    ],
    "kegiatan_pembelajaran_per_pertemuan": [
      {
        "pertemuan_ke": 1,
        "alokasi_waktu_menit": 80,
        "topik_spesifik": "Konsep Kesetaraan dan Bentuk Persamaan Linear Satu Variabel",
        "kegiatan_pendahuluan": {
          "durasi_menit": 10,
          "langkah_langkah": [
            "Guru membuka kelas dengan salam, doa bersama, dan presensi.",
            "Apersepsi: Menampilkan gambar timbangan tradisional dan mengajukan pertanyaan pemantik.",
            "Menyampaikan tujuan pembelajaran dan skenario kerja kelompok."
          ]
        },
        "kegiatan_inti_sintaks": {
          "durasi_menit": 60,
          "fase_fase_model": [
            {
              "nama_sintaks": "Fase 1: Orientasi Siswa pada Masalah Kontekstual",
              "aktivitas_guru": "Guru mendemonstrasikan timbangan dua lengan yang berisi 2 kotak misteri + 4 kelereng di lengan kiri dan 10 kelereng di lengan kanan.",
              "aktivitas_siswa": "Siswa mengamati posisi timbangan yang seimbang dan merumuskan dugaan jumlah kelereng dalam kotak misteri."
            },
            {
              "nama_sintaks": "Fase 2: Mengorganisasikan Siswa untuk Belajar",
              "aktivitas_guru": "Guru membagi siswa ke dalam kelompok heterogen dan membagikan LKPD tier 1, 2, dan 3 sesuai hasil asesmen diagnostik.",
              "aktivitas_siswa": "Siswa duduk bersama kelompoknya dan berbagi peran (pencatat data, operator timbangan, juru bicara)."
            },
            {
              "nama_sintaks": "Fase 3: Membimbing Penyelidikan Individu dan Kelompok",
              "aktivitas_guru": "Guru berkeliling memberikan scaffolding intensif pada kelompok Tier 1 (bimbingan fisik), dan memfasilitasi kelompok Tier 2 & 3.",
              "aktivitas_siswa": "Siswa mempraktikkan simulasi timbangan, membuang kelereng dalam jumlah sama di kedua sisi, dan mencatat bentuk matematisnya."
            },
            {
              "nama_sintaks": "Fase 4: Mengembangkan dan Menyajikan Hasil Karya",
              "aktivitas_guru": "Guru memandu jalannya presentasi galeri (gallery walk).",
              "aktivitas_siswa": "Setiap kelompok menempelkan lembar kesimpulan pemodelan aljabar di dinding dan 1 perwakilan menjelaskan ke kelompok lain."
            },
            {
              "nama_sintaks": "Fase 5: Menganalisis dan Mengevaluasi Proses Pemecahan Masalah",
              "aktivitas_guru": "Guru memberikan konfirmasi konsep formal: variabel, koefisien, konstanta, dan sifat kesetaraan penambahan/pengurangan.",
              "aktivitas_siswa": "Siswa menyamakan persepsi dan memperbaiki catatan rumus aljabarnya."
            }
          ]
        },
        "strategi_diferensiasi": {
          "diferensiasi_konten": "Kelompok kesiapan rendah menggunakan manipulasi kelereng fisik nyata; kelompok kesiapan tinggi menggunakan simulasi interaktif digital PhET dan aljabar formal.",
          "diferensiasi_proses": "Guru memberikan lembar panduan langkah semi-terbuka untuk kelompok mahir, dan pendampingan dialogis intensif untuk kelompok yang membutuhkan bimbingan.",
          "diferensiasi_produk": "Siswa dapat menyajikan kesimpulan dalam bentuk diagram visual timbangan, kalimat naratif, atau persamaan matematika murni."
        },
        "kegiatan_penutup": {
          "durasi_menit": 10,
          "langkah_langkah": [
            "Siswa dan guru menyimpulkan konsep utama PLSV.",
            "Refleksi singkat menggunakan 'Exit Ticket' (1 hal yang dipahami, 1 hal yang masih membingungkan).",
            "Guru menyampaikan pengantar materi pertemuan ke-2 dan menutup kelas dengan doa."
          ]
        }
      }
    ],
    "asesmen": {
      "asesmen_diagnostik_awal": "Kuis singkat 3 soal operasi hitung bilangan bulat pada awal sesi.",
      "asesmen_formatif_proses": "Observasi keterlibatan diskusi kelompok dan penilaian lembar aktivitas LKPD 1.",
      "asesmen_sumatif_akhir": "Tes tertulis pemodelan dan penyelesaian 4 soal uraian PLSV kontekstual di akhir unit."
    },
    "pengayaan_dan_remedial": {
      "rencana_pengayaan": "Tantangan eksplorasi pertidaksamaan linear multi-kondisi pada anggaran belanja keluarga.",
      "rencana_remedial": "Bimbingan kembali pemodelan timbangan menggunakan objek konkret bagi siswa dengan skor KKTP di bawah 65%."
    },
    "refleksi_guru_dan_siswa": {
      "pertanyaan_refleksi_guru": ["Apakah seluruh kelompok aktif terlibat dalam investigasi timbangan?", "Berapa persen siswa yang mampu menyusun bentuk aljabar secara mandiri?"],
      "pertanyaan_refleksi_siswa": ["Bagian mana dari aktivitas hari ini yang paling membantumu memahami persamaan?", "Apa kendala terbesar yang kamu temui saat berdiskusi?"]
    }
  },
  "bagian_3_lampiran": {
    "lembar_kerja_peserta_didik_ringkasan": "LKPD Pertemuan 1: 'Detektif Timbangan Kesetaraan Aljabar'.",
    "bahan_bacaan_guru_dan_siswa": "Bahan Ajar Ringkas: Persamaan Linear Satu Variabel adalah kalimat terbuka yang dihubungkan dengan tanda sama dengan (=) dan memuat satu variabel berpangkat satu. Sifat kesetaraan: Menambahkan, mengurangkan, mengalikan, atau membagi kedua ruas dengan bilangan yang sama tidak mengubah nilai kebenaran persamaan.",
    "glosarium": [
      { "istilah": "Variabel", "definisi": "Simbol atau huruf pengganti suatu nilai yang belum diketahui secara pasti." },
      { "istilah": "Koefisien", "definisi": "Faktor pengali konstanta di depan suatu variabel aljabar." },
      { "istilah": "Konstanta", "definisi": "Suku dalam bentuk aljabar yang berupa bilangan tetap tanpa variabel." }
    ],
    "daftar_pustaka": [
      "Kemendikbudristek. (2022). Matematika untuk SMP Kelas VII. Pusat Kurikulum dan Perbukuan.",
      "BSKAP Kemendikbudristek. (2024). Panduan Pembelajaran dan Asesmen Pendidikan Dasar dan Menengah."
    ]
  }
}
```

#### G. Deterministic Validation Rules & Mathematical Constraints
1. **Assertion 1: Konservasi Waktu Tatap Muka**:
   $$\text{durasi\_pendahuluan} + \text{durasi\_inti} + \text{durasi\_penutup} \equiv \text{alokasi\_waktu\_menit}$$
   Wajib bernilai `true` untuk setiap pertemuan.
2. **Assertion 2: Keberadaan 3 Dimensi Diferensiasi**:
   - `diferensiasi_konten`, `diferensiasi_proses`, dan `diferensiasi_produk` wajib terisi dengan deskripsi operasional masing-masing minimal 30 karakter.

#### H. Error Codes & Remediation Guidelines
- `ERR_3040 (INCOMPLETE_MODUL_STRUCTURE)`: Bagian 1, 2, atau 3 tidak lengkap. Remediasi: Picu auto-correction prompt untuk menyintesis bagian yang rumpang.
- `ERR_4040 (MEETING_TIME_MISALLOCATION)`: Penjumlahan durasi langkah kegiatan tidak sesuai durasi pertemuan. Remediasi: Mesin deterministik mengoreksi durasi kegiatan inti secara proporsional.

---
### 2.7 SKILL 7: `lkpd-worksheet-generator`

#### A. Metadata & Deskripsi
- **Skill Name**: `lkpd-worksheet-generator`
- **Version**: `1.0.0`
- **Category**: `Instructional Media & Activity Design / Scaffolded Student Worksheets`
- **Author**: `Teacher Assistant Engineering Team`
- **Description**: Menghasilkan dokumen **Lembar Kerja Peserta Didik (LKPD)** interaktif dan kontekstual untuk pertemuan spesifik yang dirancang pada Modul Ajar (skill `modul-ajar-generator`). Menerapkan model **3-Tier Scaffolding** (Tier 1: Terbimbing / Bantuan Penuh, Tier 2: Semi-Terbimbing / Reguler, Tier 3: Mandiri / Tantangan Terbuka) guna memfasilitasi pembelajaran berdiferensiasi. LKPD memuat stimulus wacana autentik berbasis kearifan lokal atau fenomena nyata Indonesia, petunjuk aktivitas penyelidikan langkah-demi-langkah, pertanyaan diskusi berjenjang dari LOTS (Lower-Order Thinking Skills) ke HOTS (Higher-Order Thinking Skills), rubrik penilaian unjuk kerja siswa 4 level, serta **Kunci Jawaban dan Panduan Penilaian Guru (Teacher Key)**.

#### B. Standard YAML Frontmatter
```yaml
---
name: lkpd-worksheet-generator
version: 1.0.0
category: instructional-media
description: "Generates meeting-specific Lembar Kerja Peserta Didik (LKPD) featuring authentic stimuli, 3-tier scaffolding, LOTS-to-HOTS inquiry prompts, and teacher scoring keys."
author: Teacher Assistant Engineering Team
parameters:
  - name: tp_code
    type: string
    required: true
    description: "Kode TP yang menjadi sasaran pembelajaran pada LKPD ini."
  - name: tp_statement
    type: string
    required: true
    description: "Pernyataan lengkap Tujuan Pembelajaran."
  - name: subject_name
    type: string
    required: true
    description: "Nama mata pelajaran."
  - name: grade_level
    type: integer
    required: true
    description: "Tingkat kelas siswa."
  - name: meeting_number
    type: integer
    required: true
    description: "Pertemuan ke berapa pada modul ajar."
  - name: activity_title
    type: string
    required: true
    description: "Judul konseptual dan menarik untuk aktivitas LKPD."
  - name: pedagogical_model
    type: string
    required: true
    description: "Model pembelajaran (e.g., 'Problem-Based Learning', 'Discovery Learning')."
  - name: target_scaffolding_tier
    type: string
    required: false
    default: "Tier_2_Semi_Guided"
    enum: ["Tier_1_Guided", "Tier_2_Semi_Guided", "Tier_3_Independent", "All_Three_Tiers"]
    description: "Tingkat bantuan belajar yang ingin dihasilkan."
validation_rules:
  - rule: "assert_authentic_stimulus_present"
    description: "LKPD wajib diawali dengan stimulus wacana/studi kasus kontekstual nyata (bukan sekadar daftar soal ujian)."
  - rule: "assert_lots_to_hots_progression"
    description: "Pertanyaan diskusi wajib berjenjang: minimal 1 pertanyaan LOTS (C1-C2), 1 pertanyaan MOTS (C3), dan minimal 1 pertanyaan HOTS (C4-C6)."
  - rule: "assert_rubric_and_key_completeness"
    description: "LKPD wajib dilengkapi rubrik penilaian unjuk kerja dan kunci jawaban resmi lengkap bagi guru."
---
```

#### C. Input Parameter Declarations
| Parameter | Tipe | Wajib | Nilai Baku | Deskripsi & Batasan |
|---|---|:---:|---|---|
| `tp_code` | `string` | Ya | - | Kode TP terkait. |
| `tp_statement` | `string` | Ya | - | Narasi lengkap TP. |
| `subject_name` | `string` | Ya | - | Nama mata pelajaran. |
| `grade_level` | `integer` | Ya | - | Tingkat kelas (1 s.d. 12). |
| `meeting_number` | `integer` | Ya | - | Nomor pertemuan dalam modul ajar. |
| `activity_title` | `string` | Ya | - | Judul menarik (misal: "Misi Detektif Aljabar"). |
| `pedagogical_model` | `string` | Ya | - | Model pembelajaran yang memandu sintaks kerja. |
| `target_scaffolding_tier` | `string` | Tidak | `"Tier_2_Semi_Guided"` | Pilihan tier bantuan belajar. |

#### D. Input & Output JSON Schemas (Draft 2020-12 Compliant)

**Input JSON Schema (`schemas/input.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/lkpd-worksheet-generator/input.json",
  "title": "LKPDWorksheetGeneratorInput",
  "type": "object",
  "required": [
    "tp_code",
    "tp_statement",
    "subject_name",
    "grade_level",
    "meeting_number",
    "activity_title",
    "pedagogical_model"
  ],
  "additionalProperties": false,
  "properties": {
    "tp_code": { "type": "string" },
    "tp_statement": { "type": "string" },
    "subject_name": { "type": "string" },
    "grade_level": { "type": "integer", "minimum": 1, "maximum": 12 },
    "meeting_number": { "type": "integer", "minimum": 1, "maximum": 16 },
    "activity_title": { "type": "string", "minLength": 5 },
    "pedagogical_model": { "type": "string" },
    "target_scaffolding_tier": {
      "type": "string",
      "enum": ["Tier_1_Guided", "Tier_2_Semi_Guided", "Tier_3_Independent", "All_Three_Tiers"],
      "default": "Tier_2_Semi_Guided"
    }
  }
}
```

**Output JSON Schema (`schemas/output.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/lkpd-worksheet-generator/output.json",
  "title": "LKPDWorksheetGeneratorOutput",
  "type": "object",
  "required": [
    "header_identitas",
    "tujuan_dan_indikator",
    "petunjuk_dan_keselamatan",
    "alat_dan_bahan",
    "stimulus_kontekstual",
    "langkah_penyelidikan_berjenjang",
    "pertanyaan_diskusi_lots_hots",
    "ruang_kesimpulan_siswa",
    "rubrik_penilaian_lkpd",
    "kunci_jawaban_guru"
  ],
  "additionalProperties": false,
  "properties": {
    "header_identitas": {
      "type": "object",
      "required": ["judul_aktivitas", "mata_pelajaran", "kelas", "pertemuan_ke", "alokasi_waktu", "format_kelompok"],
      "additionalProperties": false,
      "properties": {
        "judul_aktivitas": { "type": "string" },
        "mata_pelajaran": { "type": "string" },
        "kelas": { "type": "string" },
        "pertemuan_ke": { "type": "integer" },
        "alokasi_waktu": { "type": "string" },
        "format_kelompok": { "type": "string" }
      }
    },
    "tujuan_dan_indikator": {
      "type": "object",
      "required": ["tujuan_pembelajaran", "kriteria_ketercapaian"],
      "additionalProperties": false,
      "properties": {
        "tujuan_pembelajaran": { "type": "string" },
        "kriteria_ketercapaian": { "type": "array", "items": { "type": "string" } }
      }
    },
    "petunjuk_dan_keselamatan": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 2
    },
    "alat_dan_bahan": {
      "type": "array",
      "items": { "type": "string" }
    },
    "stimulus_kontekstual": {
      "type": "object",
      "required": ["judul_stimulus", "narasi_fenomena_kasus", "pertanyaan_pemantik_awal"],
      "additionalProperties": false,
      "properties": {
        "judul_stimulus": { "type": "string" },
        "narasi_fenomena_kasus": { "type": "string", "minLength": 50 },
        "pertanyaan_pemantik_awal": { "type": "string" }
      }
    },
    "langkah_penyelidikan_berjenjang": {
      "type": "object",
      "required": ["tier_1_guided", "tier_2_semi_guided", "tier_3_independent"],
      "additionalProperties": false,
      "properties": {
        "tier_1_guided": {
          "type": "object",
          "required": ["target_kelompok", "tahapan_instruksi", "tabel_pengamatan_terstruktur"],
          "additionalProperties": false,
          "properties": {
            "target_kelompok": { "type": "string" },
            "tahapan_instruksi": { "type": "array", "items": { "type": "string" } },
            "tabel_pengamatan_terstruktur": { "type": "string" }
          }
        },
        "tier_2_semi_guided": {
          "type": "object",
          "required": ["target_kelompok", "tahapan_instruksi", "tabel_pengamatan_mandiri"],
          "additionalProperties": false,
          "properties": {
            "target_kelompok": { "type": "string" },
            "tahapan_instruksi": { "type": "array", "items": { "type": "string" } },
            "tabel_pengamatan_mandiri": { "type": "string" }
          }
        },
        "tier_3_independent": {
          "type": "object",
          "required": ["target_kelompok", "tahapan_instruksi", "tantangan_eksplorasi_terbuka"],
          "additionalProperties": false,
          "properties": {
            "target_kelompok": { "type": "string" },
            "tahapan_instruksi": { "type": "array", "items": { "type": "string" } },
            "tantangan_eksplorasi_terbuka": { "type": "string" }
          }
        }
      }
    },
    "pertanyaan_diskusi_lots_hots": {
      "type": "array",
      "minItems": 3,
      "items": {
        "type": "object",
        "required": ["nomor_soal", "level_kognitif", "bloom_level", "butir_pertanyaan", "ruang_jawab_format"],
        "additionalProperties": false,
        "properties": {
          "nomor_soal": { "type": "integer" },
          "level_kognitif": { "type": "string", "enum": ["LOTS", "MOTS", "HOTS"] },
          "bloom_level": { "type": "string", "enum": ["C1", "C2", "C3", "C4", "C5", "C6"] },
          "butir_pertanyaan": { "type": "string" },
          "ruang_jawab_format": { "type": "string" }
        }
      }
    },
    "ruang_kesimpulan_siswa": {
      "type": "object",
      "required": ["panduan_perumusan", "template_kalimat_simpulan"],
      "additionalProperties": false,
      "properties": {
        "panduan_perumusan": { "type": "string" },
        "template_kalimat_simpulan": { "type": "string" }
      }
    },
    "rubrik_penilaian_lkpd": {
      "type": "array",
      "minItems": 3,
      "items": {
        "type": "object",
        "required": ["aspek_penilaian", "skor_1_perlu_bimbingan", "skor_2_cukup", "skor_3_baik", "skor_4_sangat_baik"],
        "additionalProperties": false,
        "properties": {
          "aspek_penilaian": { "type": "string" },
          "skor_1_perlu_bimbingan": { "type": "string" },
          "skor_2_cukup": { "type": "string" },
          "skor_3_baik": { "type": "string" },
          "skor_4_sangat_baik": { "type": "string" }
        }
      }
    },
    "kunci_jawaban_guru": {
      "type": "object",
      "required": ["jawaban_pertanyaan_diskusi", "ekspektasi_simpulan_konsep", "rubrik_penskoran_angka"],
      "additionalProperties": false,
      "properties": {
        "jawaban_pertanyaan_diskusi": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["nomor_soal", "kunci_jawaban_ideal", "kata_kunci_penilaian"],
            "additionalProperties": false,
            "properties": {
              "nomor_soal": { "type": "integer" },
              "kunci_jawaban_ideal": { "type": "string" },
              "kata_kunci_penilaian": { "type": "array", "items": { "type": "string" } }
            }
          }
        },
        "ekspektasi_simpulan_konsep": { "type": "string" },
        "rubrik_penskoran_angka": { "type": "string" }
      }
    }
  }
}
```

#### E. Core Algorithmic & Pedagogical Logic
1. **Penyusunan Stimulus Kontekstual Autentik**:
   - Memilih fenomena atau skenario kehidupan sehari-hari yang relevan dengan usia dan budaya Indonesia (contoh: transaksi di warung kelontong, perbandingan paket data internet, konservasi air bersih).
2. **Implementasi 3-Tier Scaffolding**:
   - *Tier 1 (Kelompok Perlu Bimbingan)*: Menyediakan tabel panduan dengan isian rumpang, visual pendukung, dan langkah kerja eksplisit per item.
   - *Tier 2 (Kelompok Reguler)*: Menyediakan tabel kosong dengan nama kolom terarah, memicu eksplorasi mandiri.
   - *Tier 3 (Kelompok Pengayaan)*: Menghilangkan panduan tabel; siswa merancang sendiri cara pengorganisasian data dan meneliti variasi kondisi baru.
3. **Penyusunan Pertanyaan Berjenjang LOTS ke HOTS**:
   - Soal 1 (LOTS - C1/C2): Membaca dan mengidentifikasi data dari tabel observasi.
   - Soal 2 (MOTS - C3): Menghitung atau menerapkan pola matematika/prosedur ilmiah pada data.
   - Soal 3 (HOTS - C4/C5): Membandingkan, mendeteksi kesalahan, atau menguji kondisi ekstrem.
   - Soal 4 (HOTS - C6): Merumuskan strategi solusi orisinal atau memprediksi akibat perubahan variabel.
4. **Konstruksi Teacher Scoring Key**:
   - Setiap pertanyaan dipasangkan dengan kunci jawaban ideal, toleransi jawaban alternatif, dan kata kunci esensial untuk penilaian cepat guru.

#### F. Few-Shot Prompt Template
```text
[SYSTEM INSTRUCTION]
Anda adalah Desainer Media dan Lembar Kerja Pembelajaran Aktif Kurikulum Merdeka.
Tugas Anda adalah menghasilkan Lembar Kerja Peserta Didik (LKPD) lengkap, berjenjang (3-tier scaffolding), berorientasi HOTS, dan dilengkapi rubrik penilaian serta Kunci Jawaban Guru.

[FEW-SHOT EXEMPLAR: INFORMATIKA KELAS VII - BERPIKIR KOMPUTASIONAL]
Input:
{
  "tp_code": "TP-INF-7-01",
  "tp_statement": "Peserta didik mampu menerapkan berpikir komputasional untuk menyelesaikan dekomposisi masalah pengurutan data.",
  "subject_name": "Informatika",
  "grade_level": 7,
  "meeting_number": 2,
  "activity_title": "Tantangan Robot Gudang: Memilah Paket Pengiriman",
  "pedagogical_model": "Problem-Based Learning",
  "target_scaffolding_tier": "All_Three_Tiers"
}
Output:
{
  "header_identitas": {
    "judul_aktivitas": "Tantangan Robot Gudang: Memilah Paket Pengiriman dengan Algoritma",
    "mata_pelajaran": "Informatika",
    "kelas": "VII",
    "pertemuan_ke": 2,
    "alokasi_waktu": "2 JP (80 Menit)",
    "format_kelompok": "Kelompok Kolaboratif (4 Siswa)"
  },
  "tujuan_dan_indikator": {
    "tujuan_pembelajaran": "Menerapkan prinsip dekomposisi dan pengenalan pola berpikir komputasional dalam menyusun algoritma pemilahan data.",
    "kriteria_ketercapaian": [
      "Mampu mengurai masalah besar menjadi bagian-bagian kecil (dekomposisi).",
      "Mampu menyusun langkah algoritma pengurutan data paket secara logis."
    ]
  },
  "petunjuk_dan_keselamatan": [
    "Bekerjalah bersama kelompok dengan membagi peran secara adil.",
    "Gunakan kartu simulasi paket dengan hati-hati dan jaga kerapian meja kerja."
  ],
  "alat_dan_bahan": ["Set kartu paket simulasi dengan berat berbeda (10 buah)", "Papan jalur pengurutan (kertas plano)", "Spidol"],
  "stimulus_kontekstual": {
    "judul_stimulus": "Gudang Logistik Menjelang Hari Raya",
    "narasi_fenomena_kasus": "Sebuah pusat logistik e-commerce lokal di kota Anda menerima 1.000 paket setiap jam menjelang hari raya. Robot pemilah di gudang harus menyusun paket berdasarkan berat (dari teringan ke terberat) agar truk pengantar tidak oleng. Namun, timbangan otomatis robot hanya dapat membandingkan dua paket sekaligus dalam satu waktu. Jika robot menyusun secara acak, ratusan paket akan terlambat dikirim.",
    "pertanyaan_pemantik_awal": "Bagaimana cara menyusun 10 paket secara berurutan jika Anda hanya boleh membandingkan dua paket dalam sekali timbang?"
  },
  "langkah_penyelidikan_berjenjang": {
    "tier_1_guided": {
      "target_kelompok": "Kelompok Fondasi (Perlu Bimbingan Konkret)",
      "tahapan_instruksi": [
        "1. Ambil 4 kartu paket bertanda A, B, C, D.",
        "2. Bandingkan kartu A dan B, letakkan yang lebih ringan di sebelah kiri.",
        "3. Lanjutkan membandingkan kartu berikutnya ke jalur panduan panah pada lembar kerja."
      ],
      "tabel_pengamatan_terstruktur": "| Langkah Ke- | Pasangan Kartu | Kartu Lebih Ringan | Kartu Lebih Berat | Posisi Sementara |\n| 1 | A vs B | ... | ... | [ ] [ ] [ ] [ ] |"
    },
    "tier_2_semi_guided": {
      "target_kelompok": "Kelompok Reguler (Cakap)",
      "tahapan_instruksi": [
        "1. Ambil 6 kartu paket secara acak.",
        "2. Ujilah metode membandingkan dua elemen berdekatan secara berulang (Bubble Sort dasar).",
        "3. Hitung berapa kali kelompok Anda melakukan perbandingan timbangan hingga seluruh kartu berurutan."
      ],
      "tabel_pengamatan_mandiri": "Buatlah diagram alur atau tabel pencatatan iterasi perbandingan kelompok secara mandiri."
    },
    "tier_3_independent": {
      "target_kelompok": "Kelompok Pengayaan (Mahir)",
      "tahapan_instruksi": [
        "1. Ambil 8 hingga 10 kartu paket.",
        "2. Rancanglah dua strategi algoritma berbeda (misal: membandingkan pasangan berurutan vs mencari paket paling ringan terlebih dahulu).",
        "3. Analisis strategi mana yang membutuhkan jumlah penimbangan paling sedikit."
      ],
      "tantangan_eksplorasi_terbuka": "Tuliskan pseudocode atau representasi grafis algoritma optimal temuan kelompok Anda untuk memproses 100 paket."
    }
  },
  "pertanyaan_diskusi_lots_hots": [
    {
      "nomor_soal": 1,
      "level_kognitif": "LOTS",
      "bloom_level": "C1",
      "butir_pertanyaan": "Berapa banyak paket yang berhasil diurutkan kelompokmu pada percobaan pertama?",
      "ruang_jawab_format": "Isian singkat angka"
    },
    {
      "nomor_soal": 2,
      "level_kognitif": "MOTS",
      "bloom_level": "C3",
      "butir_pertanyaan": "Tuliskan urutan langkah logis (algoritma) yang digunakan kelompokmu saat memindahkan kartu-kartu tersebut!",
      "ruang_jawab_format": "Paragraf nomor urut 1, 2, 3..."
    },
    {
      "nomor_soal": 3,
      "level_kognitif": "HOTS",
      "bloom_level": "C4",
      "butir_pertanyaan": "Bandingkan jumlah perbandingan jika paket awalnya sudah hampir terurut vs jika posisinya terbalik total. Apa kesimpulanmu mengenai efisiensi algoritma tersebut?",
      "ruang_jawab_format": "Analisis komparatif 2-3 kalimat"
    },
    {
      "nomor_soal": 4,
      "level_kognitif": "HOTS",
      "bloom_level": "C6",
      "butir_pertanyaan": "Jika kalian diminta memodifikasi algoritma tersebut agar robot gudang dapat bekerja dua kali lebih cepat, ide inovatif apa yang akan kalian terapkan?",
      "ruang_jawab_format": "Gagasan kreatif solusi"
    }
  ],
  "ruang_kesimpulan_siswa": {
    "panduan_perumusan": "Hubungkan hasil simulasi kartu dengan konsep berpikir komputasional (dekomposisi dan algoritma).",
    "template_kalimat_simpulan": "Berdasarkan aktivitas pemilahan paket hari ini, kami menyimpulkan bahwa berpikir komputasional membantu menyelesaikan masalah pengurutan dengan cara ... sehingga proses kerja menjadi lebih ..."
  },
  "rubrik_penilaian_lkpd": [
    {
      "aspek_penilaian": "Keterampilan Penyelidikan & Kerjasama",
      "skor_1_perlu_bimbingan": "Pasif, hanya 1 siswa yang bekerja, kartu tidak disusun berurutan.",
      "skor_2_cukup": "Bekerja bersama namun sering bingung dengan urutan langkah simulasi.",
      "skor_3_baik": "Seluruh anggota kelompok berbagi peran aktif dan menyelesaikan simulasi sesuai petunjuk.",
      "skor_4_sangat_baik": "Sangat kolaboratif, memimpin investigasi, dan mengarahkan teman secara santun."
    },
    {
      "aspek_penilaian": "Ketajaman Analisis Jawaban Diskusi",
      "skor_1_perlu_bimbingan": "Hanya menjawab soal LOTS, jawaban HOTS kosong.",
      "skor_2_cukup": "Menjawab seluruh soal tetapi analisis HOTS masih bersifat tebakan tanpa alasan logis.",
      "skor_3_baik": "Menjawab seluruh soal dengan argumen logis dan alasan yang jelas.",
      "skor_4_sangat_baik": "Jawaban sangat mendalam, membandingkan variasi algoritma secara kritis dan matematis."
    }
  ],
  "kunci_jawaban_guru": {
    "jawaban_pertanyaan_diskusi": [
      {
        "nomor_soal": 1,
        "kunci_jawaban_ideal": "Jumlah paket terurut sesuai kartu yang dibagikan (4, 6, atau 10).",
        "kata_kunci_penilaian": ["jumlah data", "selesai"]
      },
      {
        "nomor_soal": 2,
        "kunci_jawaban_ideal": "Langkah: 1) Ambil dua kartu terdepan; 2) Bandingkan; 3) Tukar jika kiri > kanan; 4) Ulangi untuk pasangan berikutnya hingga akhir putaran.",
        "kata_kunci_penilaian": ["bandingkan", "tukar", "ulangi", "alur runtut"]
      },
      {
        "nomor_soal": 3,
        "kunci_jawaban_ideal": "Posisi terbalik total memerlukan jumlah operasi penukaran maksimal (kasus terburuk / worst-case), sedangkan posisi hampir terurut memerlukan perbandingan minimal.",
        "kata_kunci_penilaian": ["efisiensi", "jumlah pertukaran", "kondisi awal"]
      },
      {
        "nomor_soal": 4,
        "kunci_jawaban_ideal": "Ide inovatif: Membagi paket menjadi dua kelompok terlebih dahulu (Divide and Conquer) lalu mengurutkannya secara paralel, atau memilah berdasarkan kategori bobot besar/kecil terlebih dahulu.",
        "kata_kunci_penilaian": ["dekomposisi lanjutan", "pembagian kelompok", "paralel", "divide and conquer"]
      }
    ],
    "ekspektasi_simpulan_konsep": "Dekomposisi memecah antrean paket menjadi perbandingan dua objek; algoritma memberikan panduan pasti bagi sistem untuk mencapai keadaan terurut.",
    "rubrik_penskoran_angka": "Total Nilai = (Skor Perolehan / Skor Maksimal 16) x 100"
  }
}
```

#### G. Deterministic Validation Rules & Mathematical Constraints
1. **Assertion 1: Keberadaan Pertanyaan Berjenjang**:
   - Jumlah soal diskusi $\ge 3$.
   - Harus terdapat minimal satu item dengan `level_kognitif: "LOTS"`, satu `"MOTS"`, dan satu `"HOTS"`.
2. **Assertion 2: Cakupan Kunci Jawaban Lengkap**:
   $$\text{len}(\text{kunci\_jawaban\_guru.jawaban\_pertanyaan\_diskusi}) == \text{len}(\text{pertanyaan\_diskusi\_lots\_hots})$$
   Setiap butir pertanyaan wajib memiliki kunci penilaian yang terhubung.

#### H. Error Codes & Remediation Guidelines
- `ERR_3050 (MISSING_HOTS_QUESTION)`: Tidak ditemukan pertanyaan tingkat HOTS pada LKPD. Remediasi: Sistem menolak draft dan menyuntikkan template pertanyaan analisis/evaluasi.
- `ERR_3051 (INCOMPLETE_TEACHER_KEY)`: Kunci jawaban guru tidak mencakup semua soal. Remediasi: Lengkapi kunci jawaban secara deterministik sesuai indikator TP.

---

### 2.8 SKILL 8: `grade-analytics-and-bonus-evaluator`

#### A. Metadata & Deskripsi
- **Skill Name**: `grade-analytics-and-bonus-evaluator`
- **Version**: `1.0.0`
- **Category**: `Classroom Analytics / Gradebook Engine & Audit Verification`
- **Author**: `Teacher Assistant Engineering Team`
- **Description**: Memproses data penilaian formatif dan sumatif kelas, mengalkulasi distribusi statistik (mean, median, standar deviasi, ketuntasan KKTP), dan mengevaluasi pemberian **Poin Ekstra / Nilai Bonus**. Menegakkan batas matematis anti-inflasi secara absolut: pagu nilai mentah plus bonus tidak boleh melebihi 100 ($Raw + Bonus \le 100$), serta kenaikan nilai akhir semester maksimal dibatasi $+5\%$ (5 poin). Mewajibkan verifikasi justifikasi pedagogis dan menerbitkan **Payload Log Audit Kriptografis (HMAC SHA-256)** untuk setiap transaksi bonus. Menghasilkan narasi deskripsi capaian ganda e-Rapor resmi (Capaian Tertinggi dan Area Perlu Peningkatan) bertenaga Gemini 2.5 Flash.

#### B. Standard YAML Frontmatter
```yaml
---
name: grade-analytics-and-bonus-evaluator
version: 1.0.0
category: classroom-analytics
description: "Evaluates grades, verifies extra credit/bonus ceilings (Score <= 100, max +5% term boost), generates HMAC audit trails, and synthesizes official e-Rapor narratives."
author: Teacher Assistant Engineering Team
parameters:
  - name: subject_name
    type: string
    required: true
    description: "Nama mata pelajaran."
  - name: class_name
    type: string
    required: true
    description: "Nama rombongan belajar (e.g., 'VII-A', 'X-E1')."
  - name: semester
    type: string
    required: true
    enum: ["Ganjil", "Genap"]
  - name: kktp_threshold
    type: number
    required: true
    minimum: 50.0
    maximum: 90.0
    description: "Ambang batas ketercapaian kompetensi (default: 75.0)."
  - name: student_grade_records
    type: array
    required: true
    description: "Daftar rekam nilai siswa (skor sumatif per TP, formatif, dan transaksi bonus diajukan)."
  - name: bonus_policy_config
    type: object
    required: true
    description: "Kebijakan pagu bonus: max_bonus_per_assessment, max_final_grade_boost, allowed_categories."
validation_rules:
  - rule: "assert_strict_score_ceiling_100"
    description: "Skor akhir siswa pada setiap asesmen tidak boleh melebihi 100.0 setelah penambahan bonus (Clamping: min(100, Raw + Bonus))."
  - rule: "assert_term_bonus_elevation_cap"
    description: "Poin bonus kumulatif tidak boleh menaikkan nilai akhir semester siswa lebih dari +5.0 poin dari rata-rata mentahnya."
  - rule: "assert_bonus_audit_integrity"
    description: "Setiap transaksi bonus wajib memuat kategori yang valid, guru penginput, dan signature hash HMAC SHA-256."
  - rule: "assert_mandatory_assessments_completed"
    description: "Poin bonus tidak dapat digunakan untuk menggantikan atau menutupi asesmen sumatif wajib yang belum dikerjakan (skor 0)."
---
```

#### C. Input Parameter Declarations
| Parameter | Tipe | Wajib | Nilai Baku | Deskripsi & Batasan |
|---|---|:---:|---|---|
| `subject_name` | `string` | Ya | - | Nama mata pelajaran. |
| `class_name` | `string` | Ya | - | Nama rombel / kelas. |
| `semester` | `string` | Ya | - | `"Ganjil"` atau `"Genap"`. |
| `kktp_threshold` | `number` | Ya | `75.0` | Ambang batas nilai tuntas ($50.0 \le \text{KKTP} \le 90.0$). |
| `student_grade_records` | `array` | Ya | - | Array objek data nilai siswa (1 s.d. 60 siswa). |
| `bonus_policy_config` | `object` | Ya | - | Konfigurasi batas bonus dan kategori yang sah. |

#### D. Input & Output JSON Schemas (Draft 2020-12 Compliant)

**Input JSON Schema (`schemas/input.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/grade-analytics-and-bonus-evaluator/input.json",
  "title": "GradeAnalyticsAndBonusEvaluatorInput",
  "type": "object",
  "required": [
    "subject_name",
    "class_name",
    "semester",
    "kktp_threshold",
    "student_grade_records",
    "bonus_policy_config"
  ],
  "additionalProperties": false,
  "properties": {
    "subject_name": { "type": "string" },
    "class_name": { "type": "string" },
    "semester": { "type": "string", "enum": ["Ganjil", "Genap"] },
    "kktp_threshold": { "type": "number", "minimum": 50.0, "maximum": 90.0 },
    "student_grade_records": {
      "type": "array",
      "minItems": 1,
      "maxItems": 60,
      "items": {
        "type": "object",
        "required": ["student_id", "student_name", "tp_scores", "proposed_bonus_items"],
        "additionalProperties": false,
        "properties": {
          "student_id": { "type": "string" },
          "student_name": { "type": "string" },
          "tp_scores": {
            "type": "array",
            "minItems": 1,
            "items": {
              "type": "object",
              "required": ["tp_code", "tp_title", "raw_score"],
              "additionalProperties": false,
              "properties": {
                "tp_code": { "type": "string" },
                "tp_title": { "type": "string" },
                "raw_score": { "type": "number", "minimum": 0.0, "maximum": 100.0 }
              }
            }
          },
          "proposed_bonus_items": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["bonus_category", "points_requested", "rationale", "teacher_id"],
              "additionalProperties": false,
              "properties": {
                "bonus_category": {
                  "type": "string",
                  "enum": [
                    "Tantangan_Soal_HOTS",
                    "Keaktifan_Diskusi_Kelas",
                    "Tutor_Sebaya",
                    "Proyek_Inovasi_Mandiri",
                    "Kedisiplinan_dan_Karakter"
                  ]
                },
                "points_requested": { "type": "number", "minimum": 0.5, "maximum": 15.0 },
                "rationale": { "type": "string", "minLength": 10 },
                "teacher_id": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "bonus_policy_config": {
      "type": "object",
      "required": ["max_bonus_per_assessment", "max_final_grade_boost", "hard_ceiling"],
      "additionalProperties": false,
      "properties": {
        "max_bonus_per_assessment": { "type": "number", "default": 10.0 },
        "max_final_grade_boost": { "type": "number", "default": 5.0 },
        "hard_ceiling": { "type": "number", "default": 100.0 }
      }
    }
  }
}
```

**Output JSON Schema (`schemas/output.schema.json`)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://classroom.google.app/schemas/skills/grade-analytics-and-bonus-evaluator/output.json",
  "title": "GradeAnalyticsAndBonusEvaluatorOutput",
  "type": "object",
  "required": [
    "class_summary_statistics",
    "evaluated_student_grades",
    "audit_trail_payloads"
  ],
  "additionalProperties": false,
  "properties": {
    "class_summary_statistics": {
      "type": "object",
      "required": [
        "total_students",
        "mean_raw_grade",
        "mean_final_grade",
        "median_final_grade",
        "standard_deviation",
        "mastery_rate_percentage",
        "outlier_student_ids"
      ],
      "additionalProperties": false,
      "properties": {
        "total_students": { "type": "integer" },
        "mean_raw_grade": { "type": "number" },
        "mean_final_grade": { "type": "number" },
        "median_final_grade": { "type": "number" },
        "standard_deviation": { "type": "number" },
        "mastery_rate_percentage": { "type": "number" },
        "outlier_student_ids": { "type": "array", "items": { "type": "string" } }
      }
    },
    "evaluated_student_grades": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "student_id",
          "student_name",
          "raw_average_grade",
          "total_bonus_applied",
          "final_grade",
          "is_mastered",
          "competency_descriptors"
        ],
        "additionalProperties": false,
        "properties": {
          "student_id": { "type": "string" },
          "student_name": { "type": "string" },
          "raw_average_grade": { "type": "number" },
          "total_bonus_applied": { "type": "number" },
          "final_grade": { "type": "number" },
          "is_mastered": { "type": "boolean" },
          "competency_descriptors": {
            "type": "object",
            "required": [
              "capaian_tertinggi_tp",
              "capaian_perlu_bimbingan_tp",
              "narasi_rapor_kurikulum_merdeka"
            ],
            "additionalProperties": false,
            "properties": {
              "capaian_tertinggi_tp": { "type": "string" },
              "capaian_perlu_bimbingan_tp": { "type": "string" },
              "narasi_rapor_kurikulum_merdeka": { "type": "string", "minLength": 30 }
            }
          }
        }
      }
    },
    "audit_trail_payloads": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "transaction_id",
          "student_id",
          "teacher_id",
          "bonus_category",
          "points_awarded",
          "raw_points_requested",
          "was_clamped",
          "rationale",
          "timestamp_utc",
          "hmac_sha256_signature"
        ],
        "additionalProperties": false,
        "properties": {
          "transaction_id": { "type": "string" },
          "student_id": { "type": "string" },
          "teacher_id": { "type": "string" },
          "bonus_category": { "type": "string" },
          "points_awarded": { "type": "number" },
          "raw_points_requested": { "type": "number" },
          "was_clamped": { "type": "boolean" },
          "rationale": { "type": "string" },
          "timestamp_utc": { "type": "string" },
          "hmac_sha256_signature": { "type": "string" }
        }
      }
    }
  }
}
```

#### E. Core Algorithmic & Mathematical Logic
1. **Pengecekan Nilai Mentah & Prasyarat Keikutsertaan**:
   - Jika terdapat TP wajib dengan skor $0$ tanpa keterangan izin resmi, status siswa ditandai `Incomplete`. Poin bonus tidak boleh diaktifkan sebelum asesmen susulan diselesaikan.
2. **Mesin Kalkulasi Skor Mentah**:
   $$\text{Raw Average} = \frac{1}{M} \sum_{j=1}^{M} S_{\text{raw}, j}$$
3. **Penerapan Kebijakan Poin Ekstra & Pembatasan Ganda (Dual-Ceiling Logic)**:
   - *Pagu Level Transaksi*:
     $$P_{\text{awarded}} = \min(P_{\text{requested}}, \text{max\_bonus\_per\_assessment})$$
   - *Pagu Skor Sempurna (Hard Ceiling 100)*:
     $$S_{\text{potential}} = \text{Raw Average} + \sum P_{\text{awarded}}$$
     $$S_{\text{clamped\_100}} = \min(100.0, S_{\text{potential}})$$
   - *Pagu Kenaikan Nilai Semester (Max +5% / 5 Poin Boost)*:
     $$\text{Final Grade} = \min(S_{\text{clamped\_100}}, \text{Raw Average} + \text{max\_final\_grade\_boost})$$
   - $\text{Total Bonus Applied} = \text{Final Grade} - \text{Raw Average}$.
4. **Penerbitan Hash Audit Kriptografis (HMAC SHA-256)**:
   - Untuk setiap transaksi bonus yang disetujui, bentuk string kanonikal:
     $$\text{Data} = \text{tx\_id} + "|" + \text{student\_id} + "|" + \text{teacher\_id} + "|" + \text{points\_awarded} + "|" + \text{timestamp}$$
   - Hitung signature:
     $$\text{Signature} = \text{HMAC-SHA256}(\text{Data}, \text{SecretKey}_{\text{SchoolAudit}})$$
5. **Sintesis Narasi e-Rapor Otomatis (Gemini 2.5 Flash)**:
   - Ekstrak TP dengan skor tertinggi ($TP_{\text{max}}$) dan TP dengan skor terendah ($TP_{\text{min}}$).
   - Bentuk narasi terstruktur:
     - *Jika seluruh TP tuntas*: "Menunjukkan penguasaan yang sangat baik dalam [Materi TP Max] serta [Materi TP Lainnya]."
     - *Jika ada TP di bawah KKTP*: "Menunjukkan penguasaan yang baik dalam [Materi TP Max], namun masih memerlukan bimbingan dan penguatan dalam [Materi TP Min]."

#### F. Few-Shot Prompt Template
```text
[SYSTEM INSTRUCTION]
Anda adalah Mesin Analitik Nilai & Generator Deskripsi e-Rapor Kurikulum Merdeka (Gemini 2.5 Flash).
Lakukan evaluasi nilai, terapkan pagu bonus secara matematis (nilai maksimal 100, kenaikan maksimal +5 poin), buat log audit transaksi, dan susun deskripsi narasi rapor formal berbahasa Indonesia yang memadukan capaian tertinggi dan area yang perlu ditingkatkan.

[FEW-SHOT EXEMPLAR: EVALUASI KELAS MATEMATIKA]
Input:
{
  "subject_name": "Matematika",
  "class_name": "VII-A",
  "semester": "Ganjil",
  "kktp_threshold": 75.0,
  "student_grade_records": [
    {
      "student_id": "STD-001",
      "student_name": "Ahmad Dani",
      "tp_scores": [
        { "tp_code": "TP-MAT-7-01", "tp_title": "Bentuk Aljabar", "raw_score": 92.0 },
        { "tp_code": "TP-MAT-7-02", "tp_title": "Persamaan Linear Satu Variabel", "raw_score": 68.0 }
      ],
      "proposed_bonus_items": [
        {
          "bonus_category": "Tantangan_Soal_HOTS",
          "points_requested": 4.0,
          "rationale": "Menyelesaikan tantangan pembuktian persamaan aljabar alternatif",
          "teacher_id": "GURU-MAT-01"
        }
      ]
    }
  ],
  "bonus_policy_config": {
    "max_bonus_per_assessment": 10.0,
    "max_final_grade_boost": 5.0,
    "hard_ceiling": 100.0
  }
}
Output:
{
  "class_summary_statistics": {
    "total_students": 1,
    "mean_raw_grade": 80.0,
    "mean_final_grade": 84.0,
    "median_final_grade": 84.0,
    "standard_deviation": 0.0,
    "mastery_rate_percentage": 100.0,
    "outlier_student_ids": []
  },
  "evaluated_student_grades": [
    {
      "student_id": "STD-001",
      "student_name": "Ahmad Dani",
      "raw_average_grade": 80.0,
      "total_bonus_applied": 4.0,
      "final_grade": 84.0,
      "is_mastered": true,
      "competency_descriptors": {
        "capaian_tertinggi_tp": "TP-MAT-7-01 (Bentuk Aljabar)",
        "capaian_perlu_bimbingan_tp": "TP-MAT-7-02 (Persamaan Linear Satu Variabel)",
        "narasi_rapor_kurikulum_merdeka": "Menunjukkan penguasaan yang sangat baik dalam memahami konsep bentuk aljabar dan pemodelan variabel, namun masih memerlukan bimbingan dalam menyelesaikan persamaan linear satu variabel secara cermat."
      }
    }
  ],
  "audit_trail_payloads": [
    {
      "transaction_id": "TX-BONUS-20261031-001",
      "student_id": "STD-001",
      "teacher_id": "GURU-MAT-01",
      "bonus_category": "Tantangan_Soal_HOTS",
      "points_awarded": 4.0,
      "raw_points_requested": 4.0,
      "was_clamped": false,
      "rationale": "Menyelesaikan tantangan pembuktian persamaan aljabar alternatif",
      "timestamp_utc": "2026-10-31T08:00:00Z",
      "hmac_sha256_signature": "a6b7e88299ef871b29a28c30d9472e39c4a5c531d27943fbe0cf726d910a34b2"
    }
  ]
}
```

#### G. Deterministic Validation Rules & Mathematical Constraints
1. **Assertion 1: Pagu Keras Batas Nilai 100**:
   $$\forall i \quad \text{final\_grade}_i \le 100.0$$
2. **Assertion 2: Batas Kenaikan Poin Semester**:
   $$\forall i \quad (\text{final\_grade}_i - \text{raw\_average\_grade}_i) \le \text{max\_final\_grade\_boost}$$
3. **Assertion 3: Verifikasi Tanda Tangan Audit HMAC**:
   - Signature hash wajib valid saat diverifikasi dengan kunci rahasia audit sekolah di sisi server sebelum komit data ke Cloud Firestore.

#### H. Error Codes & Remediation Guidelines
- `ERR_5001 (BONUS_CEILING_EXCEEDED)`: Poin bonus menyebabkan nilai mentah melebihi 100. Remediasi: Mesin deterministik melakukan *clamping* otomatis pada nilai 100.0 dan mencatat flag `was_clamped = true`.
- `ERR_5002 (EMPTY_BONUS_RATIONALE)`: Pengajuan poin bonus tidak memiliki alasan pedagogis. Remediasi: Transaksi ditolak seketika; guru diwajibkan memilih kategori dan memberikan catatan edukatif.

---
## 3. SKILL PACKAGING & RUNTIME EXECUTION ENGINE PADA EKOSISTEM GOOGLE

### 3.1 Tata Letak Repositori Monorepo & Integrasi Package

Dalam platform aplikasi web manajemen kelas guru (berbasis **Firebase App Hosting / Next.js** dan **Firebase Cloud Functions v2**), seluruh custom skill dikemas sebagai monorepo package yang dapat diimpor secara langsung oleh handler Cloud Functions maupun runner agen.

```
guru-classroom-app/
├── package.json
├── firebase.json
├── firestore.rules
├── packages/
│   ├── skills/                                    # Repositori Resmi 8 Custom Skills
│   │   ├── curriculum-cp-tp-derivation/
│   │   ├── curriculum-atp-sequencer/
│   │   ├── curriculum-kktp-builder/
│   │   ├── curriculum-minggu-efektif-analyzer/
│   │   ├── curriculum-prota-prosem-generator/
│   │   ├── modul-ajar-generator/
│   │   ├── lkpd-worksheet-generator/
│   │   └── grade-analytics-and-bonus-evaluator/
│   └── shared-types/                              # Shared TypeScript Types & Interfaces
│       └── src/
│           ├── curriculum.ts                      # CurriculumWorkspaceState interface
│           ├── schemas.ts
│           └── audit.ts
└── functions/                                     # Firebase Cloud Functions v2 (Serverless Engine)
    ├── src/
    │   ├── index.ts                               # Exported Cloud Functions endpoints
    │   ├── genkit.config.ts                       # Inisialisasi Firebase Genkit & Gemini
    │   ├── runners/                               # Execution Runner Engine
    │   │   ├── skillRunner.ts                     # Generic Skill Invocation & Lifecycle Controller
    │   │   ├── schemaValidator.ts                 # Server-side Ajv Schema Validator
    │   │   └── selfCorrectionLoop.ts              # Automated Healing / Repair Retry Pipeline
    │   └── services/
    │       ├── firestoreStateService.ts           # Blackboard State Sync
    │       └── auditCryptoService.ts              # HMAC SHA-256 Audit Signing
    └── package.json
```

---

### 3.2 Implementasi TypeScript Execution Runner (Firebase Functions v2 & Genkit)

Berikut adalah implementasi produksi `SkillRunner` dalam TypeScript yang mengorkestrasi eksekusi model Gemini menggunakan Firebase Genkit dan Google GenAI SDK (`@google/genai`):

```typescript
/**
 * packages/functions/src/runners/skillRunner.ts
 * Authoritative Custom Skill Execution Runner for Kurikulum Merdeka Automation
 */

import { GoogleGenAI } from '@google/genai';
import { defineFlow, run } from '@genkit-ai/flow';
import Ajv, { ValidateFunction } from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Inisialisasi Ajv dengan standar Draft 2020-12
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export interface SkillInvocationContext {
  userId: string;
  orgId: string;
  projectId: string;
  secretAuditKey: string;
}

export interface SkillExecutionResult<T> {
  success: boolean;
  data?: T;
  executionTimeMs: number;
  tokensUsed?: { prompt: number; candidates: number };
  retriesCount: number;
  errorCode?: string;
  errorMessage?: string;
  auditChecksum: string;
}

export class CustomSkillRunner {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("FATAL: GEMINI_API_KEY environment variable is missing.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Menjalankan custom skill secara aman melewati 8 tahapan siklus hidup
   */
  public async executeSkill<TInput, TOutput>(
    skillName: string,
    inputPayload: TInput,
    context: SkillInvocationContext
  ): Promise<SkillExecutionResult<TOutput>> {
    const startTime = Date.now();
    let retriesCount = 0;
    const maxRetries = 2;

    // 1. Load Schemas & Prompts
    const skillDir = path.resolve(__dirname, `../../packages/skills/${skillName}`);
    const inputSchemaPath = path.join(skillDir, 'schemas/input.schema.json');
    const outputSchemaPath = path.join(skillDir, 'schemas/output.schema.json');
    const systemPromptPath = path.join(skillDir, 'prompts/system.prompt.txt');

    if (!fs.existsSync(inputSchemaPath) || !fs.existsSync(outputSchemaPath)) {
      throw new Error(`Skill definition error: Schemas not found for skill '${skillName}'.`);
    }

    const inputSchema = JSON.parse(fs.readFileSync(inputSchemaPath, 'utf-8'));
    const outputSchema = JSON.parse(fs.readFileSync(outputSchemaPath, 'utf-8'));
    const systemInstruction = fs.readFileSync(systemPromptPath, 'utf-8');

    // 2. Pre-Validation (Input Sanitization)
    const validateInput: ValidateFunction = ajv.compile(inputSchema);
    const isInputValid = validateInput(inputPayload);
    if (!isInputValid) {
      return {
        success: false,
        executionTimeMs: Date.now() - startTime,
        retriesCount: 0,
        errorCode: 'ERR_1001_INVALID_INPUT_SCHEMA',
        errorMessage: ajv.errorsText(validateInput.errors),
        auditChecksum: ''
      };
    }

    // 3. Model Inference dengan Self-Correction Loop
    const validateOutput: ValidateFunction = ajv.compile(outputSchema);
    let currentPrompt = JSON.stringify(inputPayload, null, 2);
    let lastErrorDetails = '';

    while (retriesCount <= maxRetries) {
      try {
        // Tentukan model berdasarkan jenis task
        const modelName = (skillName.includes('grade-analytics') || skillName.includes('analyzer'))
          ? 'gemini-2.5-flash'
          : 'gemini-2.5-pro';

        const response = await this.ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [{ text: currentPrompt }]
            }
          ],
          config: {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            temperature: 0.2, // Rendah untuk menjamin kepatuhan pedagogis dan determinisme
            topP: 0.95,
            responseMimeType: 'application/json',
            responseSchema: outputSchema // Strict JSON schema enforcement
          }
        });

        const rawText = response.text;
        if (!rawText) {
          throw new Error("Model returned empty response text.");
        }

        let parsedOutput: TOutput;
        try {
          parsedOutput = JSON.parse(rawText) as TOutput;
        } catch (jsonErr: any) {
          lastErrorDetails = `SyntaxError: Keluaran model terpotong atau bukan JSON valid (${jsonErr.message}).`;
          console.warn(`[SkillRunner] JSON parsing failed (Attempt ${retriesCount + 1}): ${lastErrorDetails}`);
          // Auto-Correction 1-Shot untuk SyntaxError / respon terpotong
          currentPrompt = `Keluaran sebelumnya mengalami SyntaxError (JSON terpotong atau format tidak valid): ${jsonErr.message}.
Harap pastikan menghasilkan dokumen JSON utuh dan valid sesuai skema tanpa terpotong token.
Cuplikan teks respons sebelumnya: ${rawText.slice(-300)}
Input asli: ${JSON.stringify(inputPayload)}`;
          retriesCount++;
          continue;
        }

        // 4. Server-Side Schema Conformance Check
        const isOutputValid = validateOutput(parsedOutput);
        if (!isOutputValid) {
          lastErrorDetails = ajv.errorsText(validateOutput.errors);
          console.warn(`[SkillRunner] Output schema validation failed (Attempt ${retriesCount + 1}): ${lastErrorDetails}`);
          
          // Siapkan prompt reparasi (Auto-Correction 1-Shot)
          currentPrompt = `Keluaran sebelumnya gagal memenuhi skema JSON resmi dengan error: ${lastErrorDetails}.
Harap perbaiki JSON keluaran agar 100% mematuhi schema berikut tanpa mengubah data substantif yang sudah benar.
Input asli: ${JSON.stringify(inputPayload)}`;
          retriesCount++;
          continue;
        }

        // 5. Deterministic Assertion Check (Pure Math & Business Rules)
        const deterministicError = this.runDeterministicValidators(skillName, parsedOutput);
        if (deterministicError) {
          lastErrorDetails = deterministicError;
          console.warn(`[SkillRunner] Deterministic rule check failed: ${deterministicError}`);
          currentPrompt = `Keluaran JSON memenuhi skema tetapi melanggar aturan matematis/pedagogis: ${deterministicError}.
Harap sesuaikan kalkulasi agar konsisten dan seimbang. Input: ${JSON.stringify(inputPayload)}`;
          retriesCount++;
          continue;
        }

        // 6. Generate Cryptographic Audit Checksum
        const auditPayload = JSON.stringify(parsedOutput);
        const auditChecksum = crypto
          .createHmac('sha256', context.secretAuditKey)
          .update(auditPayload)
          .digest('hex');

        return {
          success: true,
          data: parsedOutput,
          executionTimeMs: Date.now() - startTime,
          retriesCount,
          auditChecksum
        };

      } catch (err: any) {
        lastErrorDetails = err.message || String(err);
        const isQuotaError = lastErrorDetails.includes('429') || lastErrorDetails.includes('ResourceExhausted');
        if (isQuotaError) {
          const delayMs = Math.min(1000 * Math.pow(2, retriesCount) + Math.random() * 500, 10000);
          console.warn(`[SkillRunner] Rate limit HTTP 429 terdeteksi. Menerapkan exponential backoff dengan jitter: ${Math.round(delayMs)}ms`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          currentPrompt = `Terjadi kesalahan eksekusi runtime pada percobaan sebelumnya: ${lastErrorDetails}.
Harap hasilkan kembali dokumen dalam format JSON yang valid dan lengkap.
Input: ${JSON.stringify(inputPayload)}`;
        }
        retriesCount++;
      }
    }

    // Jika seluruh retry habis
    return {
      success: false,
      executionTimeMs: Date.now() - startTime,
      retriesCount,
      errorCode: 'ERR_2001_GENERATION_FAILED_AFTER_RETRIES',
      errorMessage: `Gagal menghasilkan dokumen yang valid setelah ${maxRetries} perbaikan mandiri. Rincian: ${lastErrorDetails}`,
      auditChecksum: ''
    };
  }

  /**
   * Evaluator aturan bisnis deterministik non-LLM
   */
  private runDeterministicValidators(skillName: string, output: any): string | null {
    if (skillName === 'curriculum-minggu-efektif-analyzer') {
      const dist = output.hours_distribution;
      const stats = output.summary_statistics;
      const totalAllocated = dist.jp_materi_intrakurikuler + dist.jp_asesmen_sumatif + dist.jp_cadangan;
      if (totalAllocated !== stats.total_jpe) {
        return `Konservasi JPE gagal: ${totalAllocated} != ${stats.total_jpe}`;
      }
    }

    if (skillName === 'curriculum-atp-sequencer') {
      const rec = output.jp_reconciliation;
      if (rec.total_allocated_jp !== rec.total_budgeted_jp) {
        return `Paritas ATP gagal: total dialokasikan (${rec.total_allocated_jp}) != anggaran (${rec.total_budgeted_jp})`;
      }
    }

    if (skillName === 'grade-analytics-and-bonus-evaluator') {
      const students = output.evaluated_student_grades;
      for (const s of students) {
        if (s.final_grade > 100.0) {
          return `Pelanggaran pagu nilai: siswa ${s.student_id} memiliki nilai akhir ${s.final_grade} > 100`;
        }
      }
    }

    return null;
  }
}
```

---

### 3.3 Pipeline Validasi Deterministik & Lingkaran Koreksi Mandiri (Self-Correction Loop)

Untuk memastikan keandalan tingkat enterprise pada lingkungan produksi sekolah, kegagalan inferensi model tidak langsung mengembalikan *fatal error* kepada guru. Sistem menerapkan **3-Tier Recovery Pipeline**:

```
[Inference Output from Gemini]
              |
              v
[Tier 1: Server-Side Schema Linter (Ajv Draft 2020-12)]
  ├── PASS  ──> Lanjut ke Tier 2
  └── FAIL  ──> Ekstrak path field yang error (e.g. "root.derived_tps[2].dimensi_p5")
                Picu 1-Shot Schema Repair Prompt ke model
                Maksimal 2 kali percobaan
              |
              v
[Tier 2: Mathematical Invariant Assertions]
  ├── PASS  ──> Lanjut ke Tier 3
  └── FAIL  ──> Jika berupa selisih desimal pembulatan jam (1-2 JP):
                - Mesin TypeScript langsung melakukan auto-redistribute ke Jam Cadangan
                Jika berupa selisih besar:
                - Picu Prompt Reparasi Matematis ke model
              |
              v
[Tier 3: Pedagogical Grounding & KKO Checker]
  ├── PASS  ──> Terbitkan Hash Audit HMAC SHA-256
  └── FAIL  ──> Auto-mapping ke KKO Bloom operasional terdekat dari kamus resmi
              |
              v
[State Commit ke Cloud Firestore: projects/{projectId}/curriculumWorkspaceState]
```

---

### 3.4 Mekanisme Sinkronisasi State Blackboard (`CurriculumWorkspaceState`) & Cloud Firestore

State kurikulum dikelola sebagai arsitektur blackboard terdistribusi pada Cloud Firestore dengan model transaksi optimistik. Mengingat batas keras dokumen Firestore adalah **1 MiB (1.048.576 byte)**, menyimpan seluruh array 18–36 dokumen Modul Ajar dan LKPD semesteran ke dalam satu dokumen root tunggal akan melampaui batas kuota pada pertemuan ke-22 (~1,3 MiB). Oleh karena itu, sistem mengimplementasikan **Partitioned Subcollection Architecture**: dokumen root hanya menyimpan metadata indeks ringkas (`lessons.modul_ajar_summary_list` dan `lessons.lkpd_summary_list`), sedangkan payload lengkap setiap pertemuan dipartisi ke dalam subkoleksi independen.

```typescript
/**
 * packages/functions/src/services/firestoreStateService.ts
 * Shared Blackboard State Manager with Subcollection Partitioning (1 MiB Protection)
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export interface CurriculumWorkspaceState {
  project_id: string;
  version: number;
  stage: number;
  updated_at: string;
  meta: {
    school_npsn: string;
    school_name: string;
    subject: string;
    phase: 'Fondasi' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    grade: string;
    academic_year: string;
    semester: 'Ganjil' | 'Genap';
    teacher_id: string;
  };
  curriculum: {
    raw_cp?: string;
    tp_registry?: Array<any>;
    atp_flow?: Array<any>;
    total_atp_jp?: number;
  };
  calendar: {
    ame_analysis?: {
      ganjil?: any;
      genap?: any;
    };
    prota?: any;
    prosem?: {
      ganjil?: any;
      genap?: any;
    };
  };
  assessments: {
    kktp_registry?: Array<any>;
    summative_blueprints?: Array<any>;
  };
  lessons: {
    // Lightweight Partitioned Index: Mencegah pelanggaran hard-limit 1 MiB root doc Firestore
    modul_ajar_summary_list: Array<{
      meeting_number: number;
      tp_code: string;
      topic: string;
      subcollection_path: string;
      updated_at: string;
      status: 'DRAFT' | 'READY';
    }>;
    lkpd_summary_list: Array<{
      meeting_number: number;
      tp_code: string;
      topic: string;
      subcollection_path: string;
      updated_at: string;
      status: 'DRAFT' | 'READY';
    }>;
  };
  intelligence: {
    gradebook_matrix?: Array<any>;
    bonus_audit_ledger?: Array<any>;
    erapor_narratives?: Array<any>;
    intervention_plans?: Array<any>;
  };
}

export class FirestoreStateService {
  private db = getFirestore();

  /**
   * Memperbarui state blackboard setelah eksekusi skill berhasil
   * Menerapkan Subcollection Partitioning untuk Modul Ajar dan LKPD
   */
  public async commitSkillOutput(
    projectId: string,
    skillName: string,
    skillOutput: any,
    auditChecksum: string
  ): Promise<void> {
    const rootDocRef = this.db.collection('curriculum_workspaces').doc(projectId);

    await this.db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(rootDocRef);
      if (!snapshot.exists) {
        throw new Error(`Curriculum workspace document '${projectId}' does not exist.`);
      }

      const updatePayload: Record<string, any> = {
        'updated_at': new Date().toISOString(),
        [`audit_trail.${skillName}`]: {
          timestamp: new Date().toISOString(),
          checksum: auditChecksum,
          version: '1.0.0'
        }
      };

      // Mutasi node spesifik berdasarkan nama skill (selaras dengan nested domain schema)
      switch (skillName) {
        case 'curriculum-cp-tp-derivation':
          updatePayload['curriculum.tp_registry'] = skillOutput.derived_tps;
          break;

        case 'curriculum-atp-sequencer':
          updatePayload['curriculum.atp_flow'] = skillOutput.atp_progression;
          updatePayload['curriculum.total_atp_jp'] = skillOutput.jp_reconciliation.total_allocated_jp;
          break;

        case 'curriculum-kktp-builder':
          updatePayload['assessments.kktp_registry'] = FieldValue.arrayUnion(skillOutput);
          break;

        case 'curriculum-minggu-efektif-analyzer': {
          const semesterKey = skillOutput.meta.semester.toLowerCase();
          updatePayload[`calendar.ame_analysis.${semesterKey}`] = skillOutput;
          break;
        }

        case 'curriculum-prota-prosem-generator':
          updatePayload['calendar.prota'] = skillOutput.prota;
          updatePayload['calendar.prosem'] = {
            ganjil: skillOutput.prosem_ganjil,
            genap: skillOutput.prosem_genap
          };
          break;

        case 'modul-ajar-generator': {
          const meetingNo = skillOutput.bagian_2_komponen_inti.kegiatan_pembelajaran_per_pertemuan[0].pertemuan_ke;
          const subDocRef = rootDocRef.collection('modul_ajar').doc(String(meetingNo));

          // 1. Tulis seluruh dokumen lengkap ke Subkoleksi Firestore (Isolasi Payload Besar)
          transaction.set(subDocRef, {
            ...skillOutput,
            project_id: projectId,
            updated_at: new Date().toISOString(),
            audit_checksum: auditChecksum
          });

          // 2. Simpan metadata indeks ringkas ke dokumen root blackboard
          const summaryEntry = {
            meeting_number: meetingNo,
            tp_code: skillOutput.identitas_modul.target_tp_code,
            topic: skillOutput.identitas_modul.lingkup_materi,
            subcollection_path: `curriculum_workspaces/${projectId}/modul_ajar/${meetingNo}`,
            updated_at: new Date().toISOString(),
            status: 'READY'
          };
          updatePayload['lessons.modul_ajar_summary_list'] = FieldValue.arrayUnion(summaryEntry);
          break;
        }

        case 'lkpd-worksheet-generator': {
          const lkpdMeeting = skillOutput.header_identitas.pertemuan_ke;
          const subDocRef = rootDocRef.collection('lkpd_documents').doc(String(lkpdMeeting));

          // 1. Tulis seluruh dokumen LKPD berjenjang ke Subkoleksi Firestore
          transaction.set(subDocRef, {
            ...skillOutput,
            project_id: projectId,
            updated_at: new Date().toISOString(),
            audit_checksum: auditChecksum
          });

          // 2. Simpan metadata indeks ringkas ke dokumen root blackboard
          const summaryEntry = {
            meeting_number: lkpdMeeting,
            tp_code: skillOutput.header_identitas.target_tp_code,
            topic: skillOutput.header_identitas.lingkup_materi,
            subcollection_path: `curriculum_workspaces/${projectId}/lkpd_documents/${lkpdMeeting}`,
            updated_at: new Date().toISOString(),
            status: 'READY'
          };
          updatePayload['lessons.lkpd_summary_list'] = FieldValue.arrayUnion(summaryEntry);
          break;
        }

        case 'grade-analytics-and-bonus-evaluator':
          updatePayload['intelligence.gradebook_matrix'] = skillOutput.student_evaluations;
          updatePayload['intelligence.bonus_audit_ledger'] = skillOutput.bonus_audit_ledger;
          updatePayload['intelligence.erapor_narratives'] = skillOutput.erapor_narratives;
          break;
      }

      transaction.update(rootDocRef, updatePayload);
    });
  }
}
```

---

## 4. KERANGKA KERJA SPESIFIKASI PENGUJIAN, ARSITEKTUR TEST SUITE & KRITERIA KEBERTERIMAAN VERIFIKASI (VERIFICATION ACCEPTANCE CRITERIA FRAMEWORK)

### 4.1 Prinsip Desain & Tata Kelola Pengujian Keterampilan Agen (Test Governance)

Sesuai dengan protokol integritas rekayasa perangkat lunak (*Integrity Mandate*), seluruh custom skills pada dokumen spesifikasi ini dirancang dengan pendekatan **Specification-Driven Testing (SDT)**. Mengingat dokumen ini merupakan cetak biru spesifikasi teknis pra-proyek (*pre-project specification*), bab ini menetapkan arsitektur pengujian komprehensif, struktur direktori uji, skenario kasus uji kritis, invarian matematis, asersi logis, masukan uji (*test inputs*), serta luaran yang diharapkan (*expected outputs*). 

Seluruh kriteria pengujian dalam kerangka kerja ini berstatus resmi:  
**`SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE`**  
(Dispesifikasikan secara otoritatif / Wajib diverifikasi secara empiris pada fase implementasi perangkat lunak).

Prinsip dasar pengujian:
1. **Pemisahan Pengujian Kontrak & Pengujian Deterministik**: Validasi kepatuhan skema JSON (Draft 2020-12) dipisahkan secara tegas dari kalkulasi matematika deterministik (alokasi jam kalender, paritas baris-kolom, partisi interval setengah-terbuka, dan deteksi siklus graf).
2. **Zero Facade / Anti-Pembodohan Pengujian**: Pengujian tidak boleh menggunakan nilai *hardcoded*, pengujian tiruan (*facade*), atau asersi semu. Setiap pengujian harus menguji *state* riil dan logika operasional sesungguhnya.
3. **Pengujian Batas Ekstrem (Edge Cases & Boundary Scanning)**: Menguji kondisi batas ekstrem, termasuk pemindaian 10.001 titik nilai pecahan desimal, pemotongan kalender darurat, dan pencegahan manipulasi batas nilai bonus.

---

### 4.2 Arsitektur Direktori Test Suite Standar

Struktur direktori pengujian standar yang wajib diwujudkan pada repositori pengembangan:

```
tests/
├── contracts/                               # Pengujian Kepatuhan Kontrak Skema JSON (Draft 2020-12)
│   ├── schemas.contract.test.ts             # Kompilasi & validasi seluruh input/output JSON schemas via Ajv Draft 2020-12
│   ├── inter_skill_contracts.test.ts        # Validasi kompatibilitas antar-output Skill N terhadap input Skill N+1
│   └── error_taxonomy_contract.test.ts      # Pengujian format respons galat standar ERR_1000 - ERR_5099
├── unit/                                    # Pengujian Unit Logika Bisnis & Invarian Matematis Deterministik
│   ├── kko_bloom_dictionary.test.ts         # Verifikasi operasional KKO Bloom Revisi C1-C6 (BSKAP 032/H/KR/2024)
│   ├── dag_topological_sort.test.ts         # Algoritma Kahn dengan Bloom-Aware Priority Queue & Tarjan SCC cycle check
│   ├── kktp_half_open_intervals.test.ts     # Pemindaian 10.001 titik continuous float [0, 40], (40, 65], (65, 85], (85, 100]
│   ├── ame_calendar_math.test.ts            # Konservasi aritmetika JMK, JMTE, JME, dan distribusi 80/12/8 JPE
│   ├── prosem_matrix_parity.test.ts         # Paritas baris, paritas kolom W_struktur, dan resolusi starvasi NON-TP
│   ├── modul_differentiated.test.ts         # Verifikasi 3 bagian modul ajar & sintaks diferensiasi waktu
│   ├── lkpd_scaffolding.test.ts             # Verifikasi kelengkapan 3-tier scaffolding bimbingan & rubrik LOTS-HOTS
│   └── grade_bonus_audit.test.ts            # Pagu nilai <= 100, semester boost <= 5.0, audit hash HMAC SHA-256
└── integration/                             # Pengujian Integrasi Alur Runtime, Gating, & Database Cloud
    ├── runner_self_correction.test.ts       # Pengujian self-correction loop terhadap SyntaxError & HTTP 429 jitter backoff
    ├── firestore_partitioning.test.ts       # Pengujian batas 1 MiB Firestore via subcollection partitioning
    └── e2e_dag_pipeline.test.ts             # Eksekusi pipeline multi-agen end-to-end dari CP dekonstruksi hingga e-Rapor
```

---

### 4.3 Spesifikasi Detail Kriteria Keberterimaan, Assertions, Test Inputs & Expected Outputs

#### 1. Skill 1: `curriculum-cp-tp-derivation`
- **Target Test File**: `tests/unit/kko_bloom_dictionary.test.ts` & `tests/contracts/schemas.contract.test.ts`
- **Test Inputs**:
  ```json
  {
    "raw_cp_text": "Pada akhir Fase D, peserta didik mampu menyelesaikan masalah kontekstual menggunakan konsep aljabar linear satu variabel, pertidaksamaan linear, dan relasi fungsi.",
    "subject_name": "Matematika",
    "element_name": "Aljabar",
    "phase": "D",
    "grade_level": 7,
    "taxonomy_framework": "Bloom_Revised",
    "max_tps_to_generate": 4
  }
  ```
- **Assertions & Acceptance Criteria**:
  1. `assert(ajv.validate(outputSchema, result.data) === true)`: Luaran 100% mematuhi `output.schema.json`.
  2. `assert(result.data.derived_tps.length >= 2 && result.data.derived_tps.length <= 4)`: Jumlah TP atomik berada dalam batas toleransi parameter.
  3. `assert(every(tp => KKO_BLOOM_DICTIONARY[tp.bloom_level].includes(tp.operational_kko)))`: KKO wajib terdaftar aktif pada kamus Bloom C1–C6; menolak kata non-operasional ("mengetahui", "memahami konsep").
  4. `assert(every(tp => tp.abcd_components.audience && tp.abcd_components.behavior && tp.abcd_components.condition && tp.abcd_components.degree))`: Seluruh elemen ABCD terdefinisi eksplisit.
  5. `assert(every(tp => VALID_P5_DIMENSIONS.includes(tp.p5_alignment.dimension_code)))`: Kode dimensi P5 mematuhi BSKAP No. 031/H/KR/2024.
- **Expected Output**: Objek JSON terstruktur memuat array `derived_tps` ter-atomisasi dengan narasi TP lengkap, KKO terstandarisasi, dan target profil pelajar Pancasila.
- **Status Kesiapan**: `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE`.

---

#### 2. Skill 2: `curriculum-atp-sequencer`
- **Target Test File**: `tests/unit/dag_topological_sort.test.ts`
- **Test Inputs**:
  - Himpunan 6 TP dengan variasi level Bloom ($TP_1 [C_6], TP_2 [C_2], TP_3 [C_4], TP_4 [C_1], TP_5 [C_3], TP_6 [C_5]$).
  - Kasus Uji A (Simpul Independen Tanpa Relasi Prasyarat, $\text{in\_degree} \equiv 0$).
  - Kasus Uji B (Injeksi Siklus: $TP_1 \to TP_2 \to TP_3 \to TP_1$).
  - Kasus Uji C (Injeksi Referensi Dangling: $TP_1$ mereferensikan prasyarat `TP-GHOST-999`).
  - Total Anggaran JP: 144 JP.
- **Assertions & Acceptance Criteria**:
  1. **Bloom-Aware Priority Queue Invariant (Kasus Uji A)**:
     $$\text{Urutan Hasil} = [TP_4 (C_1), TP_2 (C_2), TP_5 (C_3), TP_3 (C_4), TP_6 (C_5), TP_1 (C_6)]$$
     Asersi: Untuk semua simpul berderajat masuk nol, urutan hasil wajib monoton naik berdasarkan tingkat kognitif Bloom. Pembalikan kognitif (*Bloom Inversion*, e.g. C6 sebelum C1) wajib menghasilkan nilai evaluasi `false`.
  2. **Tarjan Cycle Rejection (Kasus Uji B)**:
     Asersi: Eksekusi mendeteksi siklus dan melempar pengecualian `ERR_4001 (ATP_CYCLIC_DEPENDENCY)` dengan daftar simpul siklus yang akurat.
  3. **Dangling Pointer Rejection (Kasus Uji C)**:
     Asersi: Sistem menolak kompilasi graf pra-eksekusi dan memicu kode error `ERR_4004 (DANGLING_PREREQUISITE_REFERENCE)`.
  4. **Konservasi JP Mutlak**:
     `assert(sumBy(result.data.atp_progression, 'allocated_jp') === 144)`: Paritas alokasi JP bernilai benar tanpa selisih residu.
- **Expected Output**: Rangkaian linear `atp_progression` terurut pedagogis, `parity_confirmed: true`, dan alokasi semester seimbang ($50\% \pm 10\%$).
- **Status Kesiapan**: `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE`.

---

#### 3. Skill 3: `curriculum-kktp-builder`
- **Target Test File**: `tests/unit/kktp_half_open_intervals.test.ts`
- **Test Inputs**:
  ```json
  {
    "tp_code": "TP-MAT-D-7-02",
    "tp_statement": "Peserta didik mampu menyelesaikan persamaan linear satu variabel menggunakan sifat-sifat kesetaraan aljabar.",
    "bloom_cognitive_level": "C3",
    "target_approach": "All_Three_Approaches"
  }
  ```
- **Assertions & Acceptance Criteria**:
  1. **Pemberantasan Angka KKM Tunggal**: Asersi memverifikasi tidak ada kemunculan angka mutlak tunggal tanpa deskripsi operasional (`assert(!result.rawText.includes("KKM = 75"))`).
  2. **Monotonisitas Rubrik 4 Skala**:
     $$\text{Length}(\text{Perlu Bimbingan}) < \text{Length}(\text{Mahir}) \quad \land \quad \text{Kompleksitas}(\text{Skala } k) < \text{Kompleksitas}(\text{Skala } k+1)$$
  3. **Continuous Half-Open Interval Coverage (Zero-Gap Guarantee)**:
     Harness pengujian mengeksekusi pemindaian matematis atas 10.001 titik nilai pecahan desimal:
     $$\forall S \in \{0.00, 0.01, 0.02, \dots, 99.99, 100.00\}$$
     Asersi:
     - Jika $0.00 \le S \le 40.00 \implies \text{Interval } 1 \land \text{tuntas} == \text{false}$.
     - Jika $40.00 < S \le 65.00 \implies \text{Interval } 2 \land \text{tuntas} == \text{false}$.
     - Jika $65.00 < S \le 85.00 \implies \text{Interval } 3 \land \text{tuntas} == \text{true}$.
     - Jika $85.00 < S \le 100.00 \implies \text{Interval } 4 \land \text{tuntas} == \text{true}$.
     - `assert(unmappedScoresCount === 0)`: Tidak ada satu pun nilai desimal (termasuk nilai kritis 40.01, 65.25, 85.50) yang menghasilkan `null` atau kategori tak terdefinisi.
- **Expected Output**: Artefak instrumen KKTP memuat Deskripsi Kriteria, Rubrik 4 Skala, dan 4 Interval Setengah-Terbuka Kontinu beserta program tindak lanjut intervensi edukatif.
- **Status Kesiapan**: `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE`.

---

#### 4. Skill 4: `curriculum-minggu-efektif-analyzer`
- **Target Test File**: `tests/unit/ame_calendar_math.test.ts`
- **Test Inputs**:
  - Kalender Akademik Semester Ganjil 2026/2027 (Juli s.d. Desember, 26 minggu kalender).
  - Agenda Non-Efektif: MPLS (1 mgg), Libur Awal Puasa/Daerah (1 mgg), Sumatif Akhir Semester (2 mgg), Pengolahan Rapor (1 mgg), Libur Semester 1 (1 mgg) $\implies JMTE = 6$ minggu.
  - Beban Tatap Muka: $W_{\text{struktur}} = 4$ JP/minggu.
- **Assertions & Acceptance Criteria**:
  1. `assert(result.data.summary_statistics.total_jme === 20)`: $JME = 26 - 6 = 20$ minggu efektif.
  2. `assert(result.data.summary_statistics.total_jpe === 80)`: $JPE = 20 \times 4 = 80$ JP.
  3. **Invarian Distribusi Jam Permendikbudristek No. 12/2024**:
     - `jp_materi_intrakurikuler`: $64$ JP ($\approx 80\%$)
     - `jp_asesmen_sumatif`: $10$ JP ($\approx 12.5\%$)
     - `jp_cadangan`: $6$ JP ($\approx 7.5\%$)
  4. **Invarian Konservasi Total**:
     `assert(jp_materi + jp_asesmen + jp_cadangan === total_jpe)` ($64 + 10 + 6 \equiv 80$).
- **Expected Output**: Tabel bulanan RME lengkap, statistik ringkasan, dan distribusi proporsional jam efektif.
- **Status Kesiapan**: `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE`.

---

#### 5. Skill 5: `curriculum-prota-prosem-generator`
- **Target Test File**: `tests/unit/prosem_matrix_parity.test.ts`
- **Test Inputs**:
  - $JME = 18$ minggu aktif, $W_{\text{struktur}} = 4$ JP/minggu $\implies JPE_{\text{total}} = 72$ JP.
  - Alokasi TP Intrakurikuler: 58 JP (terbagi ke dalam 4 TP: 14 JP, 16 JP, 14 JP, 14 JP).
  - Alokasi Non-TP: Asesmen Sumatif Lingkup Materi & SAS = 9 JP (`NON-TP-SUMATIF`), Jam Cadangan & Remedial = 5 JP (`NON-TP-CADANGAN`).
- **Assertions & Acceptance Criteria**:
  1. **Paritas Baris Matriks (Row Parity)**:
     `assert(every(row => sumBy(row.weekly_cells, 'jp_value') === row.alokasi_jp))`: Penjumlahan horizontal setiap baris TP dan baris Non-TP sama persis dengan alokasi target.
  2. **Paritas Kolom Minggu Efektif (Column Parity)**:
     $$\forall w \in [1, 18], \quad \sum_{i=1}^{\text{total\_rows}} \text{cell}[i, w].\text{jp\_value} \equiv 4 \text{ JP}$$
     `assert(colErrors.length === 0)`: Tidak ada minggu aktif yang mengalami kekurangan atau kelebihan alokasi jam.
  3. **Pencegahan Starvasi Kolom (Column Starvation Free)**:
     `assert(every(w => getActiveWeekSum(w) > 0))`: Minggu aktif ke-15, 16, 17, dan 18 terisi penuh oleh aktivitas `NON-TP-SUMATIF` dan `NON-TP-CADANGAN`, membuktikan eliminasi starvasi kolom.
  4. **Integritas Minggu Libur**:
     `assert(every(cell => cell.status_tag.startsWith('[') ? cell.jp_value === 0 : true))`: Kolom non-efektif terblokir 0 JP.
- **Expected Output**: Tabel PROTA dan matriks mingguan PROSEM 6 bulan bebas starvasi kolom dengan `verification_invariants.column_starvation_free: true`.
- **Status Kesiapan**: `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE`.

---

#### 6. Skill 6: `modul-ajar-generator`
- **Target Test File**: `tests/unit/modul_differentiated.test.ts`
- **Test Inputs**: TP-MAT-D-7-02, Model Problem-Based Learning (PBL), Kelas VII SMP, Alokasi 2 Pertemuan $\times$ 3 JP (6 JP = 240 menit).
- **Assertions & Acceptance Criteria**:
  1. **Kelengkapan 3 Bagian Resmi Permendikbud 12/2024**:
     - Bagian I: Informasi Umum (Identitas, Kompetensi Awal, P5, Sarpras, Target Peserta Didik, Model Pembelajaran).
     - Bagian II: Komponen Inti (Tujuan, Pemahaman Bermakna, Pertanyaan Pemantik, Kegiatan Pembelajaran Berdiferensiasi, Asesmen, Refleksi).
     - Bagian III: Lampiran (LKPD, Pengayaan & Remedial, Bahan Bacaan, Glosarium, Daftar Pustaka).
  2. **Integrasi Diferensiasi 3 Jalur**:
     - Konten: Tersedia akomodasi auditori, visual, kinestetik.
     - Proses: Struktur bimbingan berjenjang (perancah bertahap).
     - Produk: Pilihan unjuk kerja multimodal (laporan tertulis, infografis, rekaman presentasi).
  3. **Konservasi Waktu Tatap Muka**:
     `assert(sum(kegiatan.pendahuluan_menit + kegiatan.inti_menit + kegiatan.penutup_menit) === 120)`: Durasi menit per pertemuan sama persis dengan $3 \times 40$ menit.
- **Expected Output**: Dokumen Modul Ajar komprehensif siap tayang yang mematuhi standar PPA 2024.
- **Status Kesiapan**: `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE`.

---

#### 7. Skill 7: `lkpd-worksheet-generator`
- **Target Test File**: `tests/unit/lkpd_scaffolding.test.ts`
- **Test Inputs**: TP-MAT-D-7-02, Pertemuan Ke-1, Materi Persamaan Linear Satu Variabel.
- **Assertions & Acceptance Criteria**:
  1. **Integritas Scaffolding 3-Tier**:
     - `Tier 1 (Kelompok Perlu Bimbingan)`: Memuat panduan langkah demi langkah (*worked examples*) dan kalimat rumpang.
     - `Tier 2 (Kelompok Menengah)`: Memuat instruksi pemantik parsial (*guided prompts*) tanpa jawaban langsung.
     - `Tier 3 (Kelompok Mahir)`: Memuat studi kasus terbuka tanpa perancah (*open-ended complex challenge*).
  2. **Gradasi Kognitif Soal**: Soal tersusun bertingkat dari LOTS ($C_1 - C_2$) menuju HOTS ($C_4 - C_6$).
  3. **Kunci Jawaban & Rubrik Penilaian**: Seluruh lembar kerja dilengkapi kunci jawaban komprehensif dan rubrik penilaian objektif bagi guru.
- **Expected Output**: Dokumen lembar kerja siswa berjenjang (*scaffolded worksheet*) siap cetak dan instrumen asesmen kinerja.
- **Status Kesiapan**: `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE`.

---

#### 8. Skill 8: `grade-analytics-and-bonus-evaluator`
- **Target Test File**: `tests/unit/grade_bonus_audit.test.ts`
- **Test Inputs**:
  - Kohor 30 siswa dengan nilai mentah bervariasi (termasuk nilai ekstrem: $Raw=98$, $Raw=0$, dan status *unattempted/missing*).
  - Transaksi Poin Bonus Ekstra: $+10$ poin reward keaktifan.
- **Assertions & Acceptance Criteria**:
  1. **Hard Score Ceiling Invariant**:
     $$\forall i, \quad S_{\text{effective}, i} = \min(100.00, S_{\text{raw}, i} + P_{\text{bonus}, i}) \le 100.00$$
     Siswa dengan $Raw=98$ dan $Bonus=10$ menghasilkan $S_{\text{effective}} = 100.00$, bukan $108.00$.
  2. **Semester Term Elevation Cap**:
     $$\Delta_{\text{final}} = \text{NAS}_{\text{effective}} - \text{NAS}_{\text{raw}} \le 5.00 \text{ poin}$$
     Total dongkrakan nilai akhir semester dari akumulasi bonus tidak pernah melampaui batas statuler $+5.00$ poin.
  3. **Unattempted Assessment Guardrail**:
     Jika siswa memiliki asesmen wajib dengan status `"MISSING"` / belum dikerjakan, bonus poin dibekukan (`status: "FROZEN"`) dan dilarang mendongkrak nilai akhir hingga ujian susulan diselesaikan.
  4. **Preservasi Presisi Desimal 64-Bit Float**:
     Seluruh perhitungan nilai per TP dan remedial mempertahankan 2 tempat desimal ($70.50$); pembulatan integer (`Math.round`) hanya dieksekusi saat proyeksi nilai rapor akhir e-Rapor.
  5. **Integritas Hash Kriptografis HMAC SHA-256**:
     `assert(verifyHmacSha256(result.data, context.secretAuditKey, result.auditChecksum) === true)`: Setiap hasil kalkulasi diverifikasi keabsahan jejak auditnya.
- **Expected Output**: Payload analitik nilai kelas, proyeksi nilai rapor berkeadilan, dan catatan buku besar audit anti-inflasi nilai.
- **Status Kesiapan**: `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE`.

---

### 4.4 Matriks Pelacakan Verifikasi & Status Kesiapan Implementasi

Berikut adalah matriks resmi status kesiapan kerangka kerja pengujian custom skills:

| # | Komponen Verifikasi | Kriteria Pengujian Spesifik | Target Test Suite (Planned) | Status Kesiapan |
|:---:|---|---|---|:---:|
| 1 | **Kepatuhan Skema JSON Draft 2020-12** | Validasi skema input & output seluruh 8 skill tanpa *dangling references*. | `tests/contracts/schemas.contract.test.ts` | `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE` |
| 2 | **Kamus KKO Taksonomi Bloom BSKAP 032/2024** | Dekomposisi CP menggunakan kata kerja operasional aktif level C1–C6 dan komponen ABCD. | `tests/unit/kko_bloom_dictionary.test.ts` | `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE` |
| 3 | **Pengurutan Graf Pembelajaran (Kahn + Bloom PQ)** | Pengurutan topologis dengan Bloom Min-PQ tie-breaker, deteksi siklus Tarjan, dan penolakan pointer dangling (`ERR_4004`). | `tests/unit/dag_topological_sort.test.ts` | `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE` |
| 4 | **Kontinuitas Interval Setengah-Terbuka KKTP** | Pemindaian 10.001 titik float menutup $[0, 40]$, $(40, 65]$, $(65, 85]$, $(85, 100]$ tanpa celah desimal (*zero-gap*). | `tests/unit/kktp_half_open_intervals.test.ts` | `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE` |
| 5 | **Konservasi Matematis Jam Efektif (AME)** | $\sum JMK - \sum JMTE \equiv \sum JME$ dan distribusi alokasi $80\% / 12\% / 8\% \equiv JPE$. | `tests/unit/ame_calendar_math.test.ts` | `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE` |
| 6 | **Paritas Ganda Matriks PROSEM & Non-TP Interleaving** | Paritas baris TP, paritas kolom $W_{\text{struktur}}$ pada seluruh 18 minggu aktif, dan eliminasi starvasi kolom via `NON-TP-SUMATIF` / `NON-TP-CADANGAN`. | `tests/unit/prosem_matrix_parity.test.ts` | `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE` |
| 7 | **Struktur 3 Bagian & Diferensiasi Modul Ajar** | Modul mencakup Bagian I, II, III, diferensiasi konten/proses/produk, dan sintaks waktu menit presisi. | `tests/unit/modul_differentiated.test.ts` | `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE` |
| 8 | **Scaffolding 3-Tier LKPD & Rubrik HOTS** | Variasi perancah bimbingan Tier 1–3, gradasi LOTS-HOTS, kunci jawaban, dan rubrik asesmen. | `tests/unit/lkpd_scaffolding.test.ts` | `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE` |
| 9 | **Pagu Poin Ekstra & Log Audit Kriptografis** | Batas skor efektif $\le 100$, kenaikan semester $\le +5.0$, pencegahan bypass nilai nol, dan HMAC SHA-256 audit. | `tests/unit/grade_bonus_audit.test.ts` | `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE` |
| 10 | **Resiliensi Runner & Subcollection Partitioning** | Penanganan SyntaxError truncation, HTTP 429 jitter backoff, dan partisi subkoleksi Modul Ajar/LKPD terhadap limit 1 MiB. | `tests/integration/runner_self_correction.test.ts` | `SPECIFIED / TO BE VERIFIED DURING IMPLEMENTATION PHASE` |

---
*Catatan Rilis Teknis: Seluruh spesifikasi arsitektur pengujian di atas telah diformulasikan secara definitif dan berfungsi sebagai kriteria penerimaan resmi (official acceptance criteria) yang wajib dieksekusi dan dibuktikan lulus pada tahap konstruksi kode perangkat lunak.*
