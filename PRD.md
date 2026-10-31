# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# GuruApp / KelasMerdeka: Indonesian Teacher Classroom Management & Kurikulum Merdeka AI Copilot Platform

- **Document Version**: 1.0.0 (Production-Grade Specification)
- **Status**: Approved & Baselined
- **Author**: Platform Architecture & Curriculum Systems Engineering Group
- **Regulatory Frameworks**: Permendikbudristek No. 12 Tahun 2024, Keputusan BSKAP No. 032/H/KR/2024, Panduan Pembelajaran dan Asesmen (PPA) Edisi Revisi 2024, Keputusan BSKAP No. 031/H/KR/2024
- **Target Deployment**: Google Cloud / Firebase Full-Stack Web App (PWA) + Gemini GenAI Engine + Google Workspace Integration
- **Classification**: Internal Engineering & Product Delivery Specification

---

## TABLE OF CONTENTS

1. [Executive Summary, Product Vision, Goals & Target Personas](#1-executive-summary-product-vision-goals--target-personas)
   - 1.1 Executive Summary & Problem Space
   - 1.2 Product Vision & Value Proposition
   - 1.3 Strategic Success Metrics & OKRs
   - 1.4 Target Personas & User Journeys
2. [Indonesian Kurikulum Merdeka Regulatory Compliance Baseline](#2-indonesian-kurikulum-merdeka-regulatory-compliance-baseline)
   - 2.1 Permendikbudristek No. 12 Tahun 2024 (National Curriculum Standard)
   - 2.2 Keputusan Kepala BSKAP No. 032/H/KR/2024 (Standard Capaian Pembelajaran)
   - 2.3 Panduan Pembelajaran dan Asesmen (PPA) Edisi Revisi 2024
   - 2.4 Keputusan Kepala BSKAP No. 031/H/KR/2024 (Profil Pelajar Pancasila / P5)
   - 2.5 Compliance Matrix & Statutory Checkpoints
3. [Class Roster Management Specification](#3-class-roster-management-specification)
   - 3.1 Educational Institution & Academic Hierarchy
   - 3.2 Grade Level Taxonomy & Fase Progression Matrix (Fase Fondasi to Fase F)
   - 3.3 Rombongan Belajar (Rombel / Sections) Management
   - 3.4 Subject Allocations & Teacher Assignments
   - 3.5 Weekly Timetable Scheduling & Conflict Detection Engine
   - 3.6 Academic Year Rollover & Cohort Advancement
4. [Student Roster Management Specification](#4-student-roster-management-specification)
   - 4.1 Student Master Data Model & Regulatory Identifiers (NIS, NISN, NIK, Consent)
   - 4.2 Guardian & Parent Profile Subsystem
   - 4.3 Dynamic Student Grouping & Cohort Engine
   - 4.4 Interactive Classroom Seating Grid (Denah Kelas)
   - 4.5 Dapodik Bidirectional Ingestion & Export Engine (Robust Parsing & Delimiter Sniffing)
5. [Attendance Tracking Subsystem (Presensi Siswa)](#5-attendance-tracking-subsystem-presensi-siswa)
   - 5.1 6-Status Attendance Taxonomy
   - 5.2 Dual-Scope Attendance Architecture (Homeroom vs. Subject Meeting)
   - 5.3 Attendance Capture Modalities
   - 5.4 Offline-First PWA Synchronization
   - 5.5 Medical Note & Excusal Digital Evidence Management
   - 5.6 Automated Early Warning System & WhatsApp Alert Gateway
6. [Gradebook & Assessment System (Buku Nilai Kurikulum Merdeka)](#6-gradebook--assessment-system-buku-nilai-kurikulum-merdeka)
   - 6.1 Strict Architectural Segregation: Formatif vs. Sumatif
   - 6.2 Formative Assessment Logging & Process Diagnostics
   - 6.3 Summative Assessment Engine (Lingkup Materi & Akhir Semester)
   - 6.4 Grade Computation Engines & Mathematical Formulations
   - 6.5 Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) Multi-Model Engine (Continuous Intervals)
   - 6.6 Remedial Intervention Engine & Score Revision Policies
   - 6.7 Pengayaan (Enrichment) Progression Engine
   - 6.8 Automated e-Rapor Qualitative Narrative Synthesis (Gemini 2.5 Flash & UU PDP Gateway)
   - 6.9 Official e-Rapor Document Generation & Archival
7. [Extra Credit & Bonus Point Management System](#7-extra-credit--bonus-point-management-system)
   - 7.1 Dual-Track Gamification Architecture: Engagement XP vs. Academic Bonus
   - 7.2 Academic Bonus Awarding Mechanics & Pedagogical Criteria
   - 7.3 Mathematical Boundary Constraints, Anti-Inflation Rules & Gradebook Reconciliation
   - 7.4 Cryptographically Verifiable Immutable Transaction Ledger
   - 7.5 Ethical Leaderboard Display & Privacy Protection
8. [Automated Curriculum Tools Generation Engine](#8-automated-curriculum-tools-generation-engine)
   - 8.1 Multi-Stage Pipeline Architecture & State Blackboard
   - 8.2 Capaian Pembelajaran (CP) Ingestion & Element Deconstruction
   - 8.3 Tujuan Pembelajaran (TP) Synthesis Engine (ABCD + Bloom KKO + P5)
   - 8.4 Alur Tujuan Pembelajaran (ATP) Algorithmic Progression Engine
   - 8.5 Automated KKTP Specification Builder
   - 8.6 Analisis Minggu Efektif (RME / AME) Computational Engine
   - 8.7 Program Tahunan (PROTA) Synthesizer
   - 8.8 Program Semester (PROSEM) Distribution Grid Engine
9. [Automated Lesson Plan (Modul Ajar) & LKPD Generation Engine](#9-automated-lesson-plan-modul-ajar--lkpd-generation-engine)
   - 9.1 Modul Ajar 3-Part Architecture (Informasi Umum, Komponen Inti, Lampiran)
   - 9.2 Differentiated Learning Integration (Konten, Proses, Produk)
   - 9.3 Meeting-Specific Lembar Kerja Peserta Didik (LKPD) Generator
   - 9.4 Scaffolding, Tiered Activity Structures & Assessment Rubrics
10. [Non-Functional Requirements & Platform Standards](#10-non-functional-requirements--platform-standards)
    - 10.1 High-Performance Data Grid & PWA Offline Specifications
    - 10.2 Security, Privacy & Indonesian Regulatory Compliance (UU PDP No. 27/2022)
    - 10.3 Interoperability, Document Export & Google Ecosystem Sync
    - 10.4 Resilience, Scalability & Disaster Recovery

---

## 1. EXECUTIVE SUMMARY, PRODUCT VISION, GOALS & TARGET PERSONAS

### 1.1 Executive Summary & Problem Space
Indonesian primary and secondary school educators are undergoing a monumental paradigm shift driven by the national transition to **Kurikulum Merdeka** (regulated definitively under **Permendikbudristek No. 12 Tahun 2024**). While Kurikulum Merdeka provides pedagogical autonomy, it has dramatically increased teachers' administrative workload. Teachers must:
1. Deconstruct national learning standards (**Capaian Pembelajaran / CP** via **BSKAP No. 032/H/KR/2024**) into individualized learning objectives (**Tujuan Pembelajaran / TP**), progressions (**Alur Tujuan Pembelajaran / ATP**), and criteria (**KKTP**).
2. Calculate effective weeks (**Analisis Minggu Efektif**), compile yearly plans (**PROTA**), and generate weekly scheduling grids (**PROSEM**).
3. Draft differentiated lesson plans (**Modul Ajar**) and meeting-specific student worksheets (**LKPD**) containing tiered scaffolding and higher-order thinking skills (**HOTS**).
4. Maintain daily and subject-level attendance records, manage student grouping, track formative diagnostic notes separately from summative assessments, manage remedial and enrichment programs, and craft individualized narrative paragraphs for every student across every competency on official report cards (**e-Rapor**).

Current administrative software options are either rigid legacy portals designed for K-13 (2013 Curriculum), generic Western LMS solutions (Google Classroom, Canvas) that lack Indonesian statutory data models (NISN, Dapodik, Fase A–F, P5, KKTP, e-Rapor narrative synthesis), or disconnected AI wrappers that generate ungrounded, non-standard pedagogical documents.

**GuruApp / KelasMerdeka** is an intelligent, unified, offline-first classroom management web application and pedagogical AI Copilot designed specifically for Indonesian teachers. Built to run seamlessly on Google Cloud and Firebase, leveraging Gemini GenAI models and bidirectional Google Workspace synchronization, the platform automates administrative compliance while elevating instructional quality.

### 1.2 Product Vision & Value Proposition
* **Vision**: To liberate every Indonesian educator from administrative fatigue by automating compliance documentation and classroom recordkeeping, enabling teachers to focus on student-centered, differentiated instruction.
* **Value Proposition**:
  - **10x Faster Curriculum Planning**: Generate fully compliant CP, TP, ATP, KKTP, RME, PROTA, PROSEM, Modul Ajar, and LKPD in minutes instead of weeks.
  - **100% Kurikulum Merdeka Compliance**: Built natively on Permendikbudristek No. 12/2024, BSKAP 032/H/KR/2024, PPA 2024, and BSKAP 031/H/KR/2024.
  - **Zero-Friction Classroom Management**: High-speed spreadsheet matrix gradebook, 6-status attendance with WhatsApp alerts, seating charts, and Dapodik-compliant bidirectional data exchange.
  - **Ethical, Transparent Gamification**: Dual-track engagement XP and academic bonus points with mathematical ceilings and immutable cryptographic audit trails.
  - **Offline-First Resilience**: Full PWA functionality for remote rural schools with intermittent connectivity, synchronizing within 3 seconds upon reconnecting.

### 1.3 Strategic Success Metrics & OKRs
| Objective | Key Result (KR) | Target Metric |
|---|---|---|
| **O1: Administrative Efficiency** | **KR 1.1**: Time spent by teachers generating complete annual planning (PROTA, PROSEM, ATP, Modul Ajar) | Reduced from ~40 hours/semester to < 1.5 hours/semester |
| | **KR 1.2**: Time required to synthesize end-of-term e-Rapor student narrative descriptions | Reduced from ~5 minutes/student to < 10 seconds/student (instant batch generation) |
| **O2: Platform Performance & Offline Resilience** | **KR 2.1**: Gradebook matrix UI responsiveness for dense classes (50 students x 30 TPs) | Constant 60 FPS scrolling and cell editing with input latency < 50ms |
| | **KR 2.2**: PWA offline-to-online background data synchronization | Reconcile 500 queued operations within 3.0 seconds of network restoration |
| **O3: Statutory Compliance & Interoperability** | **KR 3.1**: Dapodik CSV/Excel import/export schema fidelity | 100% roundtrip validation with zero data corruption or unmapped columns |
| | **KR 3.2**: e-Rapor narrative alignment with PPA 2024 dual-sentence standard | 100% compliance: explicit highest mastery + lowest growth area per student |

### 1.4 Target Personas & User Journeys

#### Persona 1: Guru Mata Pelajaran (Subject Teacher)
* **Profile**: Pak Eko (36), SMP Mathematics Teacher teaching 5 parallel sections of Class VII (Fase D).
* **Pain Points**: Re-typing student attendance across multiple classes; grading 160 students across 6 TPs; manually calculating weighted averages; spending entire weekends writing e-Rapor narrative paragraphs; designing differentiated LKPDs for mixed-ability classrooms.
* **Key User Journey**:
  1. Opens GuruApp on smartphone or laptop at the start of class; takes rapid attendance via interactive seating grid in 15 seconds.
  2. Selects current TP; logs formative check-ins using 4-tier rubric buttons during group work.
  3. Uses the AI Copilot to generate next week's Modul Ajar and differentiated LKPDs tailored to students' diagnostic baseline.
  4. Enters summative exam scores into the high-speed matrix gradebook; clicks "Generate e-Rapor Narratives" to review and approve AI-synthesized qualitative feedback.

#### Persona 2: Guru Kelas / Wali Kelas (Homeroom Teacher)
* **Profile**: Ibu Sri (44), SD Grade 4 Teacher (Fase B) and Homeroom Teacher.
* **Pain Points**: Tracking daily morning attendance; consolidating grades from religion and physical education teachers; generating semester report cards; communicating attendance anomalies to parents via WhatsApp.
* **Key User Journey**:
  1. Records morning class attendance; flagged absences automatically trigger formatted WhatsApp notification drafts to parents.
  2. Monitors holistic student progress across all subjects in the Homeroom Overview Dashboard.
  3. Manages P5 collaborative project teams, rating students across the 6 Pancasila dimensions.
  4. Generates complete, print-ready e-Rapor PDF packages and Dapodik upload spreadsheets with one click.

#### Persona 3: Kepala Sekolah & Tim Pengembang Kurikulum (School Leadership & Curriculum Coordinator)
* **Profile**: Pak Bambang (52), Vice Principal for Curriculum (Wakasek Kurikulum) at a public SMA.
* **Pain Points**: Ensuring all teachers submit complete teaching archives (Modul Ajar, ATP, PROTA, PROSEM); verifying alignment with the latest BSKAP regulations; managing teacher schedule conflicts.
* **Key User Journey**:
  1. Accesses School Curriculum Command Center; tracks document completion status across all departments.
  2. Configures the institutional academic calendar, non-effective weeks, and assessment windows.
  3. Uses conflict detection engine to resolve teacher timetable overlaps and room allocations.
  4. Audits grade distributions, remedial tracking compliance, and bonus point logs.

#### Persona 4: Siswa & Orang Tua/Wali (Student & Parent/Guardian)
* **Profile**: Rian (15, Student) and Ibu Dewi (42, Parent).
* **Pain Points**: Lack of visibility into learning progress until final report cards; unannounced absences; confusion regarding Kurikulum Merdeka grading standards.
* **Key User Journey**:
  1. Parent receives automated, respectful WhatsApp notifications if student is marked Alfa (unexcused absence) or Tardy.
  2. Student accesses read-only Student Portal to view upcoming assignments, TP mastery goals, engagement badges, and academic bonus stretch challenges.
  3. Parent views digital report cards with rich qualitative explanations of student competencies rather than cryptic numbers.

---

## 2. INDONESIAN KURIKULUM MERDEKA REGULATORY COMPLIANCE BASELINE

### 2.1 Permendikbudristek No. 12 Tahun 2024
The application's foundational data architecture and business rules strictly operationalize **Permendikbudristek No. 12 Tahun 2024**, which establishes Kurikulum Merdeka as the permanent national curriculum standard across Indonesia:
1. **Curriculum Structure Segregation**:
   - **Intrakurikuler**: Subject-specific mastery governed by national Capaian Pembelajaran.
   - **Kokurikuler (Projek Penguatan Profil Pelajar Pancasila / P5)**: Cross-disciplinary project learning allocated ~20%–30% of total annual Jam Pelajaran (JP).
   - **Ekstrakurikuler**: Talent and interest development tracked via qualitative ratings.
2. **Pedagogical Autonomy**: Schools and educators possess the statutory right to adapt learning pacing, sequence TPs flexibly across a Fase, and select instructional models based on student readiness.
3. **Flexible Progression**: Learning outcomes are evaluated over a **Fase** rather than isolated, rigid grade levels.

### 2.2 Keputusan Kepala BSKAP No. 032/H/KR/2024
The system completely replaces legacy BSKAP No. 033/H/KR/2022 and No. 008/H/KR/2022 with **Keputusan Kepala BSKAP No. 032/H/KR/2024** as the authoritative source for Capaian Pembelajaran:
* Contains updated, reorganized CP descriptions across all subjects for PAUD (Fondasi), SD (Fase A, B, C), SMP (Fase D), and SMA/SMK (Fase E, F).
* Refines subject elements (e.g., Mathematics structured into Bilangan, Aljabar, Pengukuran, Geometri, Analisis Data dan Peluang; Indonesian structured into Menyimak, Membaca dan Memirsa, Berbicara dan Mempresentasikan, Menulis).
* Mandates that all automated TP derivation algorithms must consume the exact textual elements and phase standards defined in BSKAP 032/H/KR/2024.

### 2.3 Panduan Pembelajaran dan Asesmen (PPA) Edisi Revisi 2024
The application strictly enforces the assessment and reporting principles detailed in the official **Panduan Pembelajaran dan Asesmen (PPA) Revisi 2024**:
* **Abolition of Single-Score KKM**: Rigid numeric cutoffs (e.g., 75 for all students) are strictly prohibited. The system enforces **KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)** based on qualitative indicators and learning needs.
* **Separation of Formative from Final Marks**: Formative assessments are strictly formative (Assessment *for* and *as* Learning). They must never be mathematically averaged into summative marks on report cards.
* **e-Rapor Narrative Construction Standard**: Report card narratives must articulate at least two distinct dimensions:
  1. Highest achievement attained (*Capaian kompetensi tertinggi yang dikuasai dengan sangat baik*).
  2. Lowest achievement requiring improvement (*Capaian kompetensi terendah yang memerlukan bimbingan lanjutan*).

### 2.4 Keputusan Kepala BSKAP No. 031/H/KR/2024 (P5)
The Kokurikuler subsystem implements the updated Profil Pelajar Pancasila framework under **BSKAP No. 031/H/KR/2024**:
* **6 Core Dimensions**:
  1. *Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia*
  2. *Berkebinekaan Global*
  3. *Gotong Royong*
  4. *Mandiri*
  5. *Bernalar Kritis*
  6. *Kreatif*
* **Official 4-Level P5 Achievement Scale**:
  - `MB` (*Mulai Berkembang*)
  - `SB` (*Sedang Berkembang*)
  - `BSH` (*Berkembang Sesuai Harapan*)
  - `SAB` (*Sangat Berkembang*)

### 2.5 Compliance Matrix & Statutory Checkpoints
```
+--------------------------------------------------------------------------------------------------------+
|                                  STATUTORY COMPLIANCE AUDIT MATRIX                                     |
+------------------------------+---------------------------+---------------------------------------------+
| Statutory Mandate            | Legal Instrument          | System Enforcement Mechanism                |
+------------------------------+---------------------------+---------------------------------------------+
| Fase-Based Pacing            | Permendikbudristek 12/2024| Roster and curriculum tools validate TP     |
|                              |                           | distribution across multi-year phases.      |
| Authoritative CP Database    | BSKAP 032/H/KR/2024       | System stores master CP text; disallows     |
|                              |                           | deprecated BSKAP 033/2022 competencies.     |
| P5 Dimensional Alignment     | BSKAP 031/H/KR/2024       | P5 module strictly limits rubrics to the    |
|                              |                           | 6 dimensions and MB/SB/BSH/SAB tiers.       |
| Formative Grade Isolation    | PPA Revisi 2024           | Formative grades stored in separate data-   |
|                              |                           | base collection; barred from sum formulas.  |
| KKTP Qualitative Approach    | PPA Revisi 2024           | Gradebook requires Deskripsi, Rubrik, or    |
|                              |                           | Interval definitions before grading TPs.    |
| Dual-Sentence e-Rapor        | PPA Revisi 2024           | AI synthesis algorithm strictly enforces    |
|                              |                           | [Highest Mastery] + [Growth Area] syntax.   |
| Dapodik Data Structure       | Permendikbudristek Dapodik| Data export matches official Ministry CSV   |
|                              | System Specifications     | column indices, formats, and headers.       |
+------------------------------+---------------------------+---------------------------------------------+
```

---

## 3. CLASS ROSTER MANAGEMENT SPECIFICATION

### 3.1 Educational Institution & Academic Hierarchy
The platform organizes classroom data into a deterministic, multi-tenant administrative hierarchy:
$$\text{Satuan Pendidikan (School)} \rightarrow \text{Tahun Ajaran} \rightarrow \text{Semester} \rightarrow \text{Fase \& Tingkat Kelas} \rightarrow \text{Rombongan Belajar (Rombel)} \rightarrow \text{Mata Pelajaran \& Guru}$$

#### Entity Schema: `SchoolProfile`
```json
{
  "schoolId": "sch_320101_00412",
  "npsn": "20219876",
  "schoolName": "SMP Negeri 1 Merdeka Jaya",
  "educationStage": "SMP",
  "status": "Negeri",
  "accreditation": "A",
  "headmaster": {
    "name": "Drs. H. Mulyadi, M.Pd.",
    "nip": "196805121994031004"
  },
  "address": {
    "street": "Jl. Pendidikan Pemuda No. 10",
    "district": "Cibinong",
    "regency": "Kabupaten Bogor",
    "province": "Jawa Barat",
    "postalCode": "16911"
  },
  "curriculumType": "Kurikulum Merdeka Mandiri Berbagi"
}
```

#### Entity Schema: `AcademicYear` & `Semester`
```json
{
  "academicYearId": "ay_2026_2027",
  "code": "2026/2027",
  "startDate": "2026-07-13",
  "endDate": "2027-06-25",
  "isActive": true,
  "semesters": [
    {
      "semesterId": "sem_2026_1",
      "type": "Ganjil",
      "startDate": "2026-07-13",
      "endDate": "2026-12-18",
      "isCurrent": true,
      "reportCardPrintDate": "2026-12-19"
    },
    {
      "semesterId": "sem_2027_2",
      "type": "Genap",
      "startDate": "2027-01-04",
      "endDate": "2027-06-25",
      "isCurrent": false,
      "reportCardPrintDate": "2027-06-26"
    }
  ]
}
```

### 3.2 Grade Level Taxonomy & Fase Progression Matrix (Fase Fondasi to Fase F)
The application maps institutional grades to national Kurikulum Merdeka Fases:
| Fase | Educational Stage | Target Grades | Typical Age | Statutory Curriculum Objectives |
|---|---|---|---|---|
| **Fase Fondasi** | PAUD (TK/RA/KB) | TK A & TK B | 4–6 Years | Early literacy, numeracy readiness, socio-emotional self-regulation, inquiry play. |
| **Fase A** | SD / MI | Kelas 1 & Kelas 2 | 7–8 Years | Foundational literacy, numeracy, concrete hands-on operations, basic character habits. |
| **Fase B** | SD / MI | Kelas 3 & Kelas 4 | 9–10 Years | Conceptual understanding expansion, intermediate numeracy, collaborative inquiry. |
| **Fase C** | SD / MI | Kelas 5 & Kelas 6 | 11–12 Years | Transition from concrete to abstract reasoning, integrated IPAS, critical digital literacy. |
| **Fase D** | SMP / MTs | Kelas 7, 8, & 9 | 13–15 Years | Formal operational logic, scientific investigation, computational thinking, analytical writing. |
| **Fase E** | SMA / SMK / MA | Kelas 10 | 16 Years | Holistic multidisciplinary exploration; general foundations prior to vocational/academic streaming. |
| **Fase F** | SMA / SMK / MA | Kelas 11 & Kelas 12 | 17–18 Years | Specialized elective subjects (MIPA, IPS, Bahasa, Vokasi Kejuruan), independent research, tertiary/workforce readiness. |

### 3.3 Rombongan Belajar (Rombel / Sections) Management
A **Rombel** represents an intact cohort of students assigned to a specific grade level, physical or virtual classroom, and overseen by a Homeroom Teacher (*Wali Kelas*).
* **Rombel Naming Standard**: Automatic or custom format (e.g., `VII-A`, `X-E1`, `XI-F-MIPA-2`, `XII-RPL-1`).
* **Capacity Tracking**: Default capacity set according to Ministry standards (SD: 28 students; SMP: 32 students; SMA/SMK: 36 students), with soft warnings when exceeded.
* **Wali Kelas Assignment**: Single primary teacher assigned per Rombel with full pastoral and pastoral report privileges.

### 3.4 Subject Allocations & Teacher Assignments
* **Subject Types Supported**:
  - `Intrakurikuler_Wajib`: National core subjects (Matematika, Bahasa Indonesia, IPA, IPS, Pendidikan Pancasila, dll.).
  - `Intrakurikuler_Pilihan`: Fase F elective courses (Fisika, Biologi, Ekonomi, Sosiologi, Desain Grafis, dll.).
  - `Muatan_Lokal`: Regional languages and arts (Bahasa Sunda, Bahasa Jawa, Kesenian Daerah).
  - `Kokurikuler_P5`: Projects allocated outside normal subject hours.
  - `Ekstrakurikuler`: Voluntary clubs (Pramuka, PMR, Paskibra, Robotika).
* **Teacher Assignment Matrix**: Maps Teacher ID $\leftrightarrow$ Rombel ID $\leftrightarrow$ Subject ID with assigned Jam Pelajaran (JP) per week (e.g., 4 JP @ 40 min for SMP Matematika).

### 3.5 Weekly Timetable Scheduling & Conflict Detection Engine
The scheduling subsystem manages the master weekly timetable (*Jadwal Pelajaran*):
* **Time Slot Definitions**: Supports standard periods (Jam Ke-1 to Jam Ke-10), customizable prayer breaks (Sholat Dzuhur), flag ceremony (Upacara Bendera Senin), and literacy breaks.
* **Real-Time Conflict Detection Matrix**:
  - **Teacher Overlap Constraint**: $\text{Teacher}(t) \text{ at Day}(d), \text{Period}(p) \le 1 \text{ Section}$.
  - **Room Overlap Constraint**: $\text{Room}(r) \text{ at Day}(d), \text{Period}(p) \le 1 \text{ Section}$.
  - **Section Continuity Constraint**: Classes cannot have unassigned gap periods during standard instructional hours without explicit warning.
* **Instant Visual Indicators**: Red highlighting and conflict cards appear instantly on the scheduling canvas when an overlap occurs.

### 3.6 Academic Year Rollover & Cohort Advancement
* **Automated Grade Promotion (Kenaikan Kelas)**:
  - Batch promotes intact sections (e.g., VII-A $\rightarrow$ VIII-A).
  - Supports Fase F student streaming into elective clusters.
  - Generates graduation archives for final-year cohorts (Kelas 6, Kelas 9, Kelas 12).
* **Immutable Snapshot Archival**: Past academic years, rosters, and gradebooks are locked as read-only snapshots to preserve legal transcripts.

---

## 4. STUDENT ROSTER MANAGEMENT SPECIFICATION

### 4.1 Student Master Data Model & Regulatory Identifiers
Every student record incorporates statutory Indonesian identification numbers and socio-demographic indicators:

```json
{
  "studentId": "std_320101_2026_00481",
  "registration": {
    "nis": "242507001",
    "nisn": "0098765432",
    "isPendingNisn": false,
    "tempNisnPlaceholderId": null,
    "nik": "3201015405090003",
    "admissionDate": "2024-07-15",
    "enrollmentType": "Siswa Baru",
    "schoolStatus": "Aktif"
  },
  "personal": {
    "fullName": "Ahmad Fauzi Pratama",
    "preferredName": "Fauzi",
    "gender": "L",
    "birthPlace": "Bogor",
    "birthDate": "2009-05-14",
    "religion": "Islam",
    "bloodType": "B",
    "avatarUrl": "https://storage.googleapis.com/guruapp-assets/avatars/std_00481.webp",
    "specialLearningNeeds": {
      "hasSpecialNeeds": true,
      "disabilityCategory": "Low Vision / Gangguan Penglihatan Ringan",
      "accommodationNotes": "Wajib duduk di baris pertama; memerlukan cetakan materi font minimal 16pt."
    }
  },
  "address": {
    "street": "Kp. Harapan Sejahtera RT 02/RW 04",
    "kelurahan": "Tengah",
    "kecamatan": "Cibinong",
    "city": "Kabupaten Bogor",
    "province": "Jawa Barat",
    "postalCode": "16914"
  },
  "enrollment": {
    "classSectionId": "cls_smp_1_vii_a",
    "currentGrade": 7,
    "fase": "D",
    "academicYearId": "ay_2026_2027",
    "rollNumber": 1
  },
  "parentalConsent": {
    "status": "CONSENTED",
    "consentingGuardianNik": "3201011203780005",
    "consentingGuardianName": "Bambang Pratama, S.T.",
    "consentedAtUtc": "2024-07-15T08:30:00Z",
    "consentDocumentUrl": "https://storage.googleapis.com/guruapp-assets/consents/cns_00481.pdf",
    "scope": [
      "ACADEMIC_PROCESSING",
      "ATTENDANCE_ALERTS",
      "HEALTH_ACCOMMODATION",
      "AI_ASSESSMENT_SYNTHESIS"
    ],
    "version": "1.0-UU-PDP-2022"
  }
}
```

#### Regulatory Identifiers & Privacy Governance Guardrails:
* **NISN String Preservation**: NISN must be stored and manipulated strictly as a **10-character string** (`string` type with regex `/^[0-9]{10}$/`). Coercion into numeric primitives is strictly prohibited to prevent catastrophic loss of leading zeros (e.g., student cohorts born 2000–2009 with NISN starting with `008...` or `009...` being truncated to 8 digits).
* **Relaxed NISN Policy for Newly Enrolled Cohorts (Grade 1 SD / Grade 7 SMP)**: Under official Kemendikbudristek Dapodik administration, newly enrolled students in Grade 1 (SD) and Grade 7 (SMP), as well as mid-year transfer students, frequently do not possess an active NISN issued by Pusdatin at the start of the academic year. The system makes NISN optional (`nisn: null`, `isPendingNisn: true`) for new enrollments, generating a deterministic temporary placeholder ID (`tempNisnPlaceholderId`: `TEMP-NISN-{NPSN}-{timestamp}-{seq}`) and anchoring uniqueness to the student's statutory 16-digit **NIK (Nomor Induk Kependudukan)** until Pusdatin synchronization completes.
* **Parental Consent Tracking under UU PDP No. 27/2022 (Article 25)**: Because primary and secondary school students are legal minors under the age of 18, Article 25 of the Indonesian Personal Data Protection Act (*UU Pelindungan Data Pribadi*) strictly dictates that processing of child personal data requires documented, verifiable consent from a parent or legal guardian. The `parentalConsent` entity tracks consent status (`CONSENTED`, `REFUSED`, `PENDING`), consenting guardian NIK and legal name, timestamp, digital audit document URL, and explicit permission scopes (including academic processing, attendance alerts, health/disability accommodations, and AI-assisted qualitative narrative synthesis). Processing without verified consent is blocked at the system gateway.

### 4.2 Guardian & Parent Profile Subsystem
Each student profile links to parent/guardian contacts with primary communication routing:
```json
{
  "guardians": [
    {
      "guardianId": "grd_00481_1",
      "relationship": "Ayah Kandung",
      "fullName": "Bambang Pratama, S.T.",
      "nik": "3201011203780005",
      "phoneNumber": "+6281234567890",
      "whatsappNumber": "+6281234567890",
      "email": "bambang.pratama@example.com",
      "occupation": "Karyawan Swasta",
      "isPrimaryContact": true
    },
    {
      "guardianId": "grd_00481_2",
      "relationship": "Ibu Kandung",
      "fullName": "Siti Nurjanah",
      "phoneNumber": "+6281398765432",
      "whatsappNumber": "+6281398765432",
      "occupation": "Wirausaha",
      "isPrimaryContact": false
    }
  ]
}
```

### 4.3 Dynamic Student Grouping & Cohort Engine
Teachers can create dynamic, non-permanent sub-groups within a class section:
* **Differentiated Readiness Groups (TaRL - Teaching at the Right Level)**:
  - *Kelompok Intervensi / Perlu Bimbingan*: Scaffolding tier based on diagnostic assessment.
  - *Kelompok Reguler / Cakap*: Standard instructional tier.
  - *Kelompok Pengayaan / Mahir*: Independent advanced study tier.
* **Heterogeneous Collaborative Groups**: System balances students across academic performance and gender to optimize peer tutoring.
* **P5 Project Squads**: Cross-section or intra-section teams assigned to specific themes and deliverables.

### 4.4 Interactive Classroom Seating Grid (Denah Kelas)
* **Visual Canvas**: 2D drag-and-drop desk layout editor (configurable for individual desks, paired seating, or horseshoe/U-shape collaborative pods).
* **Live Status Overlay**: Teachers can toggle overlays showing:
  - Real-time attendance status (Green = Hadir, Yellow = Terlambat, Red = Alfa).
  - Special educational needs flags (ABK accommodation badges).
  - Active gamification XP / bonus point badges.

### 4.5 Dapodik Bidirectional Ingestion & Export Engine
Direct, compliant integration with the Ministry's official **Dapodik (Data Pokok Pendidikan)** desktop database:
* **Supported Ingestion Files**: `.xlsx`, `.xls`, `.csv` generated from official Dapodik school exports.
* **Robust Ingestion Architecture & Parsing Pipeline**:
  ```
  [Uploaded File (.csv / .xlsx)]
                 │
                 ▼
  [Encoding & MIME Sniffing: UTF-8 / Windows-1252 / ISO-8859-1]
                 │
                 ▼
  [Delimiter Auto-Detection: Freq Analysis of ';', ',', '\t' in Header]
                 │
                 ▼
  [RFC 4180 Quote-Aware Lexer: Handles Commas in Academic Degrees/Titles]
                 │
                 ▼
  [Header Normalization & Alias Mapping: Standard vs. Regional Dapodik]
                 │
                 ▼
  [Validation & Type Preservation Engine]
   ├─ NISN String Preservation: Strict 10-digit string, zero-padded (008...)
   ├─ Relaxed New-Cohort Policy: Optional for Grade 1/7 with TEMP-NISN placeholder
   ├─ NIK: Exactly 16 digits, numeric validity check (primary identity anchor)
   ├─ Gender: Strict enum ['L', 'P']
   ├─ Date: Auto-parses 'YYYY-MM-DD', 'DD/MM/YYYY', or Excel serial numbers
   └─ Parental Consent: Ingests consent flag or marks status PENDING
                 │
                 ▼
  [In-Memory Deduplication: Map<string, StudentRecord> keyed by (nisn || nik)]
                 │
                 ▼
  [Chunked Firestore WriteBatch: Max 450 docs/batch with Rollback Guard]
  ```

#### Detailed Ingestion Robustness Specifications:
1. **Delimiter Auto-Detection (Indonesian Regional Settings Support)**:
   - In Indonesia, Microsoft Windows localized regional settings establish the standard list separator as **semicolon (`;`)** because the comma (`,`) is utilized as the national decimal separator. Official CSV exports from the Kemendikbudristek Dapodik desktop client frequently produce semicolon-delimited files (`No;NISN;NIK;Nama;JK;Tanggal_Lahir`).
   - The ingestion parser executes an automated delimiter detection algorithm (`sniffDelimiter(firstLine)`) prior to full file processing. It counts occurrences of `;`, `,`, and `\t` outside quoted strings. The candidate delimiter yielding the highest column count consistent with statutory Dapodik headers is dynamically selected. If detection is ambiguous, the system prompts the teacher with a 1-click preview toggle.
2. **Quote-Aware CSV Parsing (Handling Academic Titles and Honorifics)**:
   - Indonesian educator, guardian, and student legal names frequently contain commas separating academic degrees, religious titles, and honorifics (e.g., `"Drs. Syukri, M.Pd."`, `"Bambang Pratama, S.T."`, `"H. Ahmad Dahlan, S.Pd., M.M."`).
   - Standard naive string splitting (`line.split(',')`) causes severe column shifting, misaligning gender, birth dates, and identity numbers.
   - The parser strictly implements **RFC 4180 quote-aware parsing**: commas enclosed within double quotes are preserved as literal text characters, escaped double quotes (`""`) are converted to single quote literals, and records with multiline quotes are buffered safely without premature row termination.
3. **Mandatory String Preservation for NISN**:
   - NISN must never be cast or coerced into an integer or floating-point primitive. Coercing NISN strips leading zeros (e.g., `0081234567` $\rightarrow$ `81234567`), invalidating the national 10-digit format.
   - The parser enforces strict string retention: `String(rawNisn).trim().padStart(10, '0')`. Values failing the 10-digit numeric pattern `/^[0-9]{10}$/` are flagged for teacher review unless covered by the new-cohort exemption.
4. **Relaxed NISN Policy for Newly Enrolled Cohorts (Grade 1 SD & Grade 7 SMP)**:
   - Incoming students in early school phases (Kelas 1 SD, Kelas 7 SMP, and new transfer students) often experience bureaucratic latency before Pusdatin Kemendikbudristek assigns their official national NISN. In Dapodik exports, their NISN column is blank (`""`), `"0"`, or filled with a placeholder dash (`"-"`).
   - A strict 10-digit NISN requirement would block entire incoming cohorts from onboarding.
   - The ingestion engine relaxes this constraint for students marked with `enrollmentType: "Siswa Baru"`:
     * If NISN is missing or blank, `isPendingNisn` is set to `true`, and the system generates a temporary deterministic placeholder ID: `TEMP-NISN-{NPSN}-{YYYYMMDD}-{seq}`.
     * The student's 16-digit **NIK (Nomor Induk Kependudukan)** is mandated as the primary unique anchor.
     * When Pusdatin subsequently issues official NISNs, a seamless reconciliation wizard matches records by NIK and updates the temporary IDs without altering attendance or grade histories.
5. **In-Memory Deduplication & Batch Chunking**:
   - Dapodik exports occasionally contain duplicate rows for the same student (e.g., cross-listed electives, dual homeroom tags, or repeated registrations). Staging duplicate document IDs in a single Cloud Firestore `WriteBatch` triggers a fatal crash (`FirebaseFirestoreError: Cannot modify document multiple times in a single batch`).
   - The pipeline passes rows through an in-memory `Map<string, StudentRecord>` keyed by `nisn || nik`. Subsequent occurrences merge or overwrite previous attributes based on latest update timestamps.
   - Batches are segmented into chunks of **450 operations** (safely below Firestore's 500-write hard limit), wrapped in atomic transactions with descriptive client progress indicators.
* **One-Click Export**: Generates pixel-perfect `.xlsx` formatted exactly to Dapodik e-Rapor mass upload specifications.

---

## 5. ATTENDANCE TRACKING SUBSYSTEM (PRESENSI SISWA)

### 5.1 6-Status Attendance Taxonomy
The platform enforces a standardized 6-status attendance taxonomy compliant with Indonesian school administration:

```
+-------------------------------------------------------------------------------------------------------+
|                                    ATTENDANCE STATUS TAXONOMY                                         |
+-------------------+------+-----------+--------------------+-------------------------------------------+
| Status Name       | Code | Category  | Impact on Record   | Documentary Evidence Requirement          |
+-------------------+------+-----------+--------------------+-------------------------------------------+
| Hadir             | H    | Present   | Present (100%)     | None (Default state).                     |
| Sakit             | S    | Excused   | Excused Absence    | Digital medical note or parent letter.    |
| Izin              | I    | Excused   | Excused Absence    | Signed parental consent notice.           |
| Tanpa Keterangan  | A    | Unexcused | Truancy (Alfa)     | Triggers automated parent alerts.         |
| Terlambat         | T    | Late      | Partial Attendance | Recorded with arrival timestamp & mins.   |
| Dispensasi        | D    | Excused   | Official Duty      | School assignment letter (Surat Tugas).   |
+-------------------+------+-----------+--------------------+-------------------------------------------+
```

### 5.2 Dual-Scope Attendance Architecture (Homeroom vs. Subject Meeting)
The platform establishes two independent attendance tracking scopes:
1. **Homeroom Daily Attendance (Presensi Harian Wali Kelas)**:
   - Taken once daily (typically during morning homeroom / jam ke-0).
   - Serves as the official institutional attendance recorded on semester report cards and government audits.
2. **Subject Per-Meeting Attendance (Presensi Mata Pelajaran per Pertemuan)**:
   - Logged by subject teachers at the start of each instructional block.
   - Tracks meeting-level engagement and flags period-skipping (bolos mata pelajaran) where a student was marked Hadir in the morning but absent in a later class.

### 5.3 Attendance Capture Modalities
* **Modal 1: Rapid Bulk Matrix**: Single tap "Tandai Semua Hadir" (Mark All Present) with one-tap toggle overrides for exceptions. Allows a teacher to record 35 students in under 10 seconds.
* **Modal 2: Seating Chart Tap**: Interactive classroom seating map where tapping a student's desk cycles through attendance statuses.
* **Modal 3: Student QR / Barcode Scan**: Camera-based scanner or USB barcode scanner reading physical student ID cards upon classroom entry.
* **Modal 4: Kiosk / PIN Entry**: Classroom tablet kiosk where students enter their 4-digit PIN upon arrival.

### 5.4 Offline-First PWA Synchronization
* All attendance actions are written immediately to the browser's local **IndexedDB** database via Cloud Firestore offline persistence.
* Teachers can log attendance in remote, offline classrooms with zero internet connection.
* When connectivity is re-established, the PWA background sync engine reconciles offline mutations with Cloud Firestore within 3.0 seconds, resolving any conflict using server-timestamp precedence.

### 5.5 Medical Note & Excusal Digital Evidence Management
* Teachers or parents can upload digital evidence directly against an attendance entry (doctor's prescription, hospital certificate, written parental excuse letter, official school competition delegation decree).
* Uploads are stored securely in Cloud Storage for Firebase with thumbnail generation and viewable in the student's pastoral file.

### 5.6 Automated Early Warning System & WhatsApp Alert Gateway
* **Configurable Alert Triggers**:
  - *Trigger 1*: Single instance of Tanpa Keterangan (Alfa) marked during daily roll call.
  - *Trigger 2*: Student arrives late ($\text{Terlambat} \ge 3$ times in a month).
  - *Trigger 3*: Cumulative absence rate exceeding $10\%$ of total effective instructional days.
* **WhatsApp Gateway Integration**:
  - The system automatically compiles a polite, professional message template in Indonesian:
    > *"Yth. Bapak/Ibu Wali dari Ananda **Ahmad Fauzi Pratama**, kami menginformasikan bahwa pada hari ini, **Senin, 10 Agustus 2026**, ananda tercatat **Tanpa Keterangan (Alfa)** pada jam pelajaran pertama di SMP Negeri 1 Merdeka Jaya. Mohon konfirmasi kehadiran ananda melalui tautan berikut atau menghubungi Wali Kelas. Terima kasih."*
  - Provides a one-tap deep link for teachers to dispatch via WhatsApp Web / WhatsApp Mobile, or automatically dispatches via integrated WhatsApp Business Cloud Webhook API.

---

## 6. GRADEBOOK & ASSESSMENT SYSTEM (BUKU NILAI KURIKULUM MERDEKA)

### 6.1 Strict Architectural Segregation: Formatif vs. Sumatif
To uphold the statutory core of Kurikulum Merdeka (PPA 2024), the gradebook database maintains an inviolable barrier between formative feedback and summative marks:

```
                           +-------------------------------------+
                           |      STUDENT ASSESSMENT REPOSITORY  |
                           +------------------+------------------+
                                              |
                     +------------------------+------------------------+
                     |                                                 |
                     v                                                 v
    +---------------------------------+               +---------------------------------+
    |   COLLECTION: FormativeRecords  |               |   COLLECTION: SummativeRecords  |
    |   (Assessment FOR & AS Learning)|               |   (Assessment OF Learning)      |
    +---------------------------------+               +---------------------------------+
    | - Formatif Awal (Diagnostik)    |               | - Sumatif Lingkup Materi (SLM)  |
    | - Formatif Proses (Observasi)   |               |   (Graded mastery per TP)       |
    | - Rubrik Check-ins              |               | - Sumatif Akhir Semester (SAS)  |
    | - Catatan Refleksi Diri/Sebaya  |               |   (Optional end-of-term test)   |
    +---------------------------------+               +---------------------------------+
                     |                                                 |
                     v                                                 v
    +---------------------------------+               +---------------------------------+
    | STRICT STATUTORY RULE:          |               | REPORT CARD AGGREGATION:        |
    | NEVER averaged into final score!|               | Sole mathematical source for    |
    | Informs pedagogical adjustments |               | semester numeric marks ($0-100$)|
    | and narrative qualitative notes.|               | and academic progression.       |
    +---------------------------------+               +---------------------------------+
```

### 6.2 Formative Assessment Logging & Process Diagnostics
* **Assessment Techniques**: *Observasi Kinerja*, *Penilaian Diri (Self-Assessment)*, *Penilaian Antarteman (Peer-Assessment)*, *Catatan Anekdotal*, *Kuis Cepat / Exit Ticket*.
* **Recording Interface**: Teachers record qualitative rubric ratings (e.g., Perlu Bimbingan, Cukup, Baik, Mahir) or qualitative voice-to-text observational snippets during class.

### 6.3 Summative Assessment Management (Lingkup Materi & Akhir Semester)
* **Sumatif Lingkup Materi (SLM)**: Conducted upon the completion of one or more Tujuan Pembelajaran (TP). Evaluates competencies via written tests, performance tasks, or portfolio projects.
* **Sumatif Akhir Semester (SAS)**: Optional comprehensive end-of-semester assessment. Under PPA 2024, schools have the autonomy to omit SAS entirely and base report cards 100% on Sumatif Lingkup Materi.

### 6.4 Grade Computation Engines & Mathematical Formulations
The system provides two configurable, transparent calculation models:

#### Model A: Pure TP Average (Official Kemendikbud Baseline)
Recommended by PPA 2024 to emphasize continuous formative mastery over one-off high-stakes testing:
$$\text{Nilai Akhir Semester (NAS)} = \frac{1}{N_{TP}} \sum_{i=1}^{N_{TP}} S_i$$
Where:
* $S_i$ is the final verified score for Summative TP $i$ (including remedial adjustments).
* $N_{TP}$ is the total number of Summative TP assessments conducted during the semester.

#### Model B: Weighted Lingkup Materi + Sumatif Akhir Semester (SAS) Model
For schools electing to conduct formal mid-term or end-of-semester assessments:
$$\text{NAS} = \frac{W_{LM} \cdot \left( \frac{\sum_{i=1}^{k} w_i S_i}{\sum_{i=1}^{k} w_i} \right) + W_{SAS} \cdot S_{SAS}}{W_{LM} + W_{SAS}}$$
Where:
* $W_{LM}$ is the weight allocated to Sumatif Lingkup Materi (default $60\%$).
* $W_{SAS}$ is the weight allocated to Sumatif Akhir Semester (default $40\%$).
* $w_i$ is the individual weight of TP assessment $i$ (default $1.0$).
* **Rounding Rules**: Final grades are rounded to the nearest integer ($0 \le \text{NAS} \le 100$) for official e-Rapor printing, while internal calculations preserve two-decimal floating-point precision ($64$-bit float).

### 6.5 Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) Multi-Model Engine
The platform natively implements all 3 official KKTP approaches recognized under PPA 2024:

#### Model 1: Pendekatan Deskripsi Kriteria
Teachers define essential qualitative criteria. A student is declared competent if they satisfy the designated threshold (e.g., minimal 3 out of 4 criteria marked "Memadai"):
```json
{
  "kktpModel": "DESKRIPSI_KRITERIA",
  "tpId": "TP-MAT-7.1",
  "criteria": [
    {"id": "c1", "description": "Mampu mengidentifikasi bilangan bulat positif dan negatif dalam kehidupan sehari-hari.", "isMet": true},
    {"id": "c2", "description": "Mampu membandingkan dan mengurutkan bilangan bulat pada garis bilangan.", "isMet": true},
    {"id": "c3", "description": "Mampu melakukan operasi hitung penjumlahan dan pengurangan bilangan bulat.", "isMet": false},
    {"id": "c4", "description": "Mampu menyelesaikan masalah kontekstual yang melibatkan operasi bilangan bulat.", "isMet": false}
  ],
  "passingRule": "Minimal 3 kriteria berkategori Memadai.",
  "isMastered": false,
  "followUpAction": "Remedial parsial pada operasi hitung dan penyelesaian masalah kontekstual."
}
```

#### Model 2: Pendekatan Rubrik Berskala (4 Mastery Levels)
Evaluates student execution across 4 progressive qualitative bands:
| Level | Category Name | Mastery Description | Status | Pedagogical Action |
|---|---|---|---|---|
| **Level 1** | *Perlu Bimbingan* | Belum mampu menunjukkan pemahaman konsep dasar; membutuhkan bimbingan intensif dari guru. | Belum Tuntas | Remedial total seluruh materi dengan bimbingan individu atau tutor sebaya. |
| **Level 2** | *Cukup* | Menunjukkan pemahaman dasar namun masih sering melakukan kesalahan prosedural atau miskonsepsi. | Tuntas Bersyarat | Remedial terarah pada aspek prosedural tertentu; latihan mandiri terarah. |
| **Level 3** | *Baik* | Menguasai kompetensi secara mandiri, tepat, dan menyelesaikan tugas sesuai standar yang ditentukan. | Tuntas | Melanjutkan ke TP berikutnya tanpa remedial. |
| **Level 4** | *Mahir* | Menunjukkan penguasaan mendalam, akurasi tinggi, serta mampu mengeksplorasi konteks baru atau bernalar kritis. | Tuntas | Diberikan program pengayaan berbasis riset mandiri atau soal tantangan HOTS. |

#### Model 3: Pendekatan Skala Interval Nilai (Continuous Half-Open Partition)
Converts raw percentage and assessment scores into statutory pedagogical intervention tiers under PPA 2024. To prevent boundary voids and unmapped states in floating-point systems, the engine models score intervals as a **continuous, mathematically closed and half-open partition of $[0.00, 100.00]$**:

| Interval Nilai (%) | Notasi Himpunan | Status Ketercapaian | Tindak Lanjut Pedagogis Wajib |
|:---:|:---:|---|---|
| **$0.00\% - 40.00\%$** | $[0.00\%, 40.00\%]$ | Belum mencapai ketuntasan | **Remedial Intensif Seluruh Bagian**: Mengulang pembelajaran konsep dasar secara komprehensif tatap muka dengan media dan pendekatan berbeda. |
| **$>40.00\% - 65.00\%$** | $(40.00\%, 65.00\%]$ | Belum mencapai ketuntasan | **Remedial di Bagian yang Diperlukan**: Remedial parsial terarah hanya pada indikator atau materi spesifik yang belum tuntas. |
| **$>65.00\% - 85.00\%$** | $(65.00\%, 85.00\%]$ | Sudah mencapai ketuntasan | **Tuntas Standar (Tidak Perlu Remedial)**: Melanjutkan ke alur tujuan pembelajaran materi berikutnya secara reguler. |
| **$>85.00\% - 100.00\%$** | $(85.00\%, 100.00\%]$ | Sudah mencapai ketuntasan | **Pengayaan Khusus (Tantangan Lebih)**: Diberikan pengayaan, proyek riset mini, soal tantangan berpikir tingkat tinggi (HOTS), atau peran tutor sebaya. |

##### Mathematical Formalization & Zero-Gap Boundary Continuity:
The pedagogical evaluation mapping function $T(S)$ evaluates any raw or weighted score $S \in [0.00, 100.00]$ deterministically:
$$T(S) = \begin{cases} 
\text{Belum Tuntas (Remedial Seluruh Bagian)} & 0.00 \le S \le 40.00 \\
\text{Belum Tuntas (Remedial Bagian Tertentu)} & 40.00 < S \le 65.00 \\
\text{Sudah Tuntas (Tidak Perlu Remedial)} & 65.00 < S \le 85.00 \\
\text{Sudah Tuntas (Pengayaan / Tantangan Lebih)} & 85.00 < S \le 100.00
\end{cases}$$

* **Elimination of 297 Floating-Point Gaps**: Legacy discrete integer definitions ($0-40\%$, $41-65\%$, $66-85\%$, $86-100\%$) leave 297 unmapped score values across floating-point precision gaps in $(40.00, 41.00)$, $(65.00, 66.00)$, and $(85.00, 86.00)$ in a 64-bit IEEE-754 float system. For example, fractional test scores or weighted averages such as $40.50\%$, $65.25\%$, or $85.75\%$ produced `NULL` statuses in naive systems. The continuous half-open interval model guarantees that **every floating-point score maps deterministically to exactly one status** with zero unmapped values.
* **Deterministic Boundary Rules**: A score of exactly $40.00\%$ falls into Tier 1 ($[0.00\%, 40.00\%]$), whereas $40.01\%$ transitions strictly into Tier 2 ($(40.00\%, 65.00\%]$). Similarly, a score of $65.00\%$ is Tier 2, while $65.01\%$ enters Tier 3 (Tuntas). Exactly $85.00\%$ is Tuntas Standar, while $85.01\%$ qualifies for Pengayaan Khusus.

### 6.6 Remedial Intervention Engine & Score Revision Policies
When a student's initial score ($S_{\text{raw}}$) falls below the KKTP passing threshold, the system initiates a tracked remedial workflow. Teachers can configure one of three statutory remedial scoring policies:
1. **Policy 1: KKTP Capping (Batas Nilai KKTP)**:
   $$S_{\text{final}} = \begin{cases} S_{\text{retest}} & \text{if } S_{\text{retest}} < \text{KKTP} \\ \text{KKTP} & \text{if } S_{\text{retest}} \ge \text{KKTP} \end{cases}$$
2. **Policy 2: Actual Retest Score (Nilai Riil Retest)**:
   $$S_{\text{final}} = S_{\text{retest}}$$
3. **Policy 3: Blended Average (Rata-rata Nilai Awal & Retest)**:
   $$S_{\text{final}} = \frac{S_{\text{raw}} + S_{\text{retest}}}{2}$$
* **Floating-Point Precision Preservation**: All intermediate TP assessment scores and remedial computations (e.g. blended average $\frac{65.00 + 76.00}{2} = 70.50$) strictly preserve **two-decimal floating-point precision ($64$-bit float)** in the database and gradebook matrix. Integer rounding (`Math.round` / half-up to nearest whole integer $0 \le \text{NAS} \le 100$) is executed strictly during the final projection step for official printed e-Rapor transcripts, preventing mid-semester cumulative rounding drift.
* **Audit Trail**: The system stores all revisions (`initialScore`, `remedialDate`, `retestScore`, `appliedPolicy`, `finalScore`) to ensure complete evaluation transparency.

### 6.7 Pengayaan (Enrichment) Progression Engine
Students scoring in the top interval ($(85.00\%, 100.00\%]$) are tracked in the Enrichment Subsystem. The system recommends differentiated extension challenges, research assignments, or peer mentoring logs that are saved to the student's digital portfolio.

### 6.8 Automated e-Rapor Qualitative Narrative Synthesis (Gemini 2.5 Flash Pipeline)
The platform integrates **Gemini 2.5 Flash** with strict structured output formatting to eliminate the single most exhausting manual task in Indonesian education: writing customized report card descriptors.

```
+----------------------------------------------------------------------------------------------------+
|                         GEMINI e-RAPOR NARRATIVE SYNTHESIS PIPELINE                                |
+----------------------------------------------------------------------------------------------------+
  1. Gradebook Aggregator
     - Analyzes all Summative TP scores for Student X in Subject Y.
     - Identifies TP_MAX = argmax(TP_scores)  (e.g., TP 7.2: Score 96)
     - Identifies TP_MIN = argmin(TP_scores)  (e.g., TP 7.5: Score 62)
     |
     v
  2. Consent Gate & Pseudonymization Gateway (UU PDP No. 27/2022 Compliance)
     - Gate 1 (Consent Verification): Verifies student has `parentalConsent.status == "CONSENTED"`
       with active scope `AI_ASSESSMENT_SYNTHESIS`. If consent is PENDING/REFUSED, automated GenAI
       processing is blocked, and the teacher is prompted for manual narrative entry.
     - Gate 2 (Pseudonymization & De-identification): Real student names, NIK, NISN, and demographic
       identifiers are scrubbed. The student is tokenized as generic `[PESERTA_DIDIK]`.
     - Gate 3 (Sanitization): Formative observations are scrubbed of any medical, family, or PII cues.
     |
     v
  3. Context Prompt Synthesis
     - Ingests sanitized pseudonym token `[PESERTA_DIDIK]`, subject, TP_MAX statement,
       TP_MIN statement, and scrubbed formative behavioral notes.
     |
     v
  4. Gemini 2.5 Flash Execution (Temperature = 0.2, Structured Output JSON)
     - Enforces official PPA 2024 syntactic rules using third-person phrasing:
       Clause 1: "Peserta didik menunjukkan penguasaan yang sangat baik dalam [TP_MAX]..."
       Clause 2: "...namun masih perlu pendampingan dan peningkatan dalam [TP_MIN]."
     |
     v
  5. Client-Side Re-Identification & Teacher Verification Canvas
     - Client Re-hydration: Real student name is injected locally in the browser session.
     - Teacher reviews generated paragraph; can accept with one tap or fine-tune phrasing.
```

#### Production System Prompt Template:
```
You are the Official Indonesian Kurikulum Merdeka e-Rapor Narrative Synthesis Engine, strictly adhering to Panduan Pembelajaran dan Asesmen (PPA) Edisi Revisi 2024 and Indonesian UU PDP No. 27/2022 Data Minimization Standards.

Input Data:
- Student Reference: {student_pseudonym} (Privacy-Preserving Token: "Peserta Didik")
- Subject: {subject_name}
- Highest Competence Achieved: {tp_highest_desc} (Score: {score_highest})
- Competence Needing Improvement: {tp_lowest_desc} (Score: {score_lowest})
- Additional Sanitized Formative Notes: {sanitized_formative_notes}

Rules:
1. Synthesize exactly ONE cohesive Indonesian paragraph consisting of two balanced sentences.
2. The narrative MUST use standardized, respectful, third-person pedagogical phrasing ("Peserta didik menunjukkan penguasaan yang sangat baik dalam..." or "Menunjukkan penguasaan yang sangat baik dalam...").
3. DO NOT fabricate, assume, or insert real personal names, gendered pronouns, or identifying private details.
4. The first sentence MUST articulate the student's highest mastery, beginning with an affirmative phrase.
5. The second sentence MUST articulate the area needing scaffolding, connected using constructive pedagogical phrasing such as "...namun masih perlu pendampingan dalam..." or "...perlu peningkatan dalam...".
6. NEVER use punitive or discouraging language. Emphasize growth mindset.
7. Return strictly valid JSON matching the schema: {"narrative": string, "highest_competence_id": string, "lowest_competence_id": string}.
```

### 6.9 Official e-Rapor Document Generation & Archival
The platform renders and exports complete, pixel-perfect e-Rapor packages:
* **Halaman Identitas & Biodata Siswa**: Formatted with national coat of arms and official school header.
* **Lembar Nilai Akademik Intrakurikuler**: Subject list, numerical scores ($0-100$), and Gemini-synthesized Capaian Kompetensi narratives.
* **Lembar Rapor Kokurikuler P5**: Project title, description, and dimensional evaluation ($MB, SB, BSH, SAB$).
* **Lembar Ekstrakurikuler, Presensi, & Catatan Wali Kelas**: Attendance summary ($S, I, A$), teacher signature block, and official QR verification stamp.

---

## 7. EXTRA CREDIT & BONUS POINT MANAGEMENT SYSTEM

### 7.1 Dual-Track Gamification Architecture: Engagement XP vs. Academic Bonus
To prevent grade inflation and preserve academic validity, the system strictly separates classroom citizenship gamification from intellectual bonus points:

```
+----------------------------------------------------------------------------------------------------+
|                                 DUAL-TRACK REWARD ARCHITECTURE                                     |
+-------------------------------------------------+--------------------------------------------------+
| TRACK A: Engagement XP & Badges (Non-Academic)  | TRACK B: Academic Bonus Points (Grade-Bearing)   |
+-------------------------------------------------+--------------------------------------------------+
| - Purpose: Foster positive classroom habits,    | - Purpose: Incentivize intellectual rigor, deep  |
|   punctuality, active discussion, teamwork.     |   inquiry, and voluntary stretch learning.       |
| - Earning Triggers:                             | - Earning Triggers:                              |
|   * On-time attendance streaks                  |   * Solving advanced, optional Olympiad problems |
|   * Assisting classroom cleanup                 |   * Conducting independent scientific experiments|
|   * Active speaking in group discussion         |   * Serving as verified peer tutor for remedial  |
| - Rewards: Avatar customizations, virtual       | - Impact: Directly injects into academic score   |
|   badges, classroom privileges (e.g., choice    |   assessments, subject to strict mathematical    |
|   of seat, queue priority for lunch).           |   ceilings and immutable audit logging.          |
| - STRICT RULE: Never influences academic marks! | - STRICT RULE: Subject to hard anti-inflation cap|
+-------------------------------------------------+--------------------------------------------------+
```

### 7.2 Academic Bonus Awarding Mechanics & Pedagogical Criteria
Teachers can issue Track B Academic Bonus Points only under defined, verifiable criteria:
1. **Stretch Challenge Tasks**: Answering high-difficulty HOTS problems included at the conclusion of an assignment.
2. **Peer Tutoring (Tutor Sebaya)**: Leading a verified study session that helps a struggling peer improve during remedial.
3. **Independent Deep-Dive Inquiry**: Submitting an extracurricular research paper, working science model, or coding project.
4. **Pedagogical Correction Contribution**: Finding and mathematically proving an error in instructional materials or problem formulations.

### 7.3 Mathematical Boundary Constraints, Anti-Inflation Rules & Gradebook Reconciliation
The bonus point engine enforces three statutory mathematical boundary constraints, paired with transparent gradebook UI reconciliation and strict assessment attempt prerequisites:

#### Constraint 1: Hard Assessment Ceiling
An individual assessment's total score after bonus addition can **never** exceed the maximum baseline scale ($100$):
$$S_{\text{effective}} = \min(100, S_{\text{raw}} + P_{\text{bonus}})$$
*Example*: If a student scores $97$ on a summative test and earns $+5$ bonus points, their recorded score is capped at $100$. The surplus $2$ points are automatically redirected to the student's Track A Engagement XP pool.

#### Constraint 2: Semester Final Grade Elevation Cap & Gradebook Display Reconciliation
The cumulative total of all academic bonus points applied across all assessments in a subject can elevate the student's final semester grade by **no more than a maximum threshold of $+5.0$ points** ($\Delta_{\text{max}} = +5.0$):
$$\Delta_{\text{final}} = \text{NAS}_{\text{with\_bonus}} - \text{NAS}_{\text{raw}} \le 5.0$$
$$\text{NAS}_{\text{final}} = \min(100.0, \text{NAS}_{\text{raw}} + 5.0)$$

##### Gradebook UI Display Reconciliation Mechanism:
* **The "Ghost Points" Discrepancy Problem**: When a student earns multiple stretch bonuses across several assessments, the sum of effective visible cell scores ($S_{\text{effective}}$) may yield an unadjusted arithmetic mean substantially higher than $NAS_{\text{raw}} + 5.0$. For example, a student with $NAS_{\text{raw}} = 60.00$ who earns $+15$ bonus points across multiple assignments would have visible cell scores averaging $75.00$. If the final report card prints $65.00$ due to the statutory $+5.0$ cap, a $10.0$-point discrepancy emerges between the visible gradebook grid and the official report card, causing parent confusion and administrative disputes.
* **Explicit Visual Indicator Badge**: When accumulated bonus points push the potential semester grade increase beyond $+5.0$ points, the gradebook UI renders an explicit, high-contrast visual badge in the final summary column: **"Capped by Term Limit +5.0"** (Indonesian: *"Dibatasi Plafon Semester +5.0"*).
* **Matrix Cell Rendering**: Individual gradebook cells display both raw score and bonus addition (e.g., `60 (+15)` with an effective unadjusted cell score of `75`), ensuring complete visibility of student effort while distinguishing base academic achievement from bonus incentives.
* **Auditable Reconciliation Tooltip / Modal**: Clicking or hovering over the capped grade cell opens an itemized reconciliation modal detailing:
  - **Raw Semester Grade ($NAS_{\text{raw}}$)**: $60.00$ (Unweighted/weighted baseline before bonuses).
  - **Uncapped Visible Cell Average**: $75.00$ (Raw mean of visible cells; $\Delta_{\text{raw}} = +15.00$).
  - **Applied Academic Bonus Elevation**: $+5.00$ (Strict statutory cap enforced by system).
  - **Surplus / Unapplied Bonus Points**: $+10.00$ (Preserved as Track A Engagement XP and prestige profile badges).
  - **Final Official Semester Grade ($NAS_{\text{final}}$)**: $65.00$ ($\min(100.0, 60.00 + 5.00)$).
* This transparent reconciliation guarantees that educators, school leaders, and parents understand exactly how the final official mark was derived, preserving pedagogical trust and regulatory compliance.

#### Constraint 3: Mandatory Baseline Attempt Prerequisite & Missed Assessment Policy (Alfa Prohibition)
Academic bonus points are designed strictly to reward intellectual curiosity and stretch performance; they **cannot be used to offset, compensate for, or mask unattempted assessments**:
* **Strict Alfa / Missing Assessment Prohibition**: Students who missed a mandatory assessment without an authorized, verified excuse (recorded with attendance status `Alfa` / `Tanpa Keterangan`, or marked with submission status `MISSING` / `UNATTEMPTED`) **are strictly prohibited from receiving or applying academic bonus points** to offset the missed assessment.
* **Numeric Zero vs. Authentic Attempt Distinction**: Entering a score of `0` does not bypass this constraint. The assessment subsystem explicitly distinguishes between a genuine graded submission that scored zero (`submissionStatus: "GRADED"`, `attemptVerified: true`) and an unattempted exam due to unexcused absence (`submissionStatus: "MISSING"`, `attendanceCode: "A"`). Bonus points earned on other topics cannot be applied to compensate for an unattempted assessment.
* **Bonus Ledger Freezing State Machine**: If a student misses an assessment or is flagged with attendance status `Alfa`, all active academic bonus point transactions for that subject are automatically placed into a **`FROZEN`** state. In `FROZEN` status:
  - Bonus points remain visible in the audit ledger but are mathematically excluded from all provisional and final $NAS$ aggregations.
  - The Gradebook UI displays a warning badge: *"Bonus Points Frozen - Pending Missed Assessment Resolution"*.
* **Resolution & Unfreezing Protocol**: Bonus points are unfrozen and eligible for application if and only if the student completes an authorized makeup assessment (*asesmen susulan*) or presents verified excusal documentation (e.g., verified doctor's note *Surat Sakit*), converting the assessment record into a valid graded attempt (`attemptVerified: true`).
* **Direct Bonus Prohibition**: Bonus points cannot be awarded for, nor transferred into, an unattempted assessment cell.

### 7.4 Cryptographically Verifiable Immutable Transaction Ledger
Every single bonus point transaction is permanently appended to a tamper-evident audit ledger stored in Cloud Firestore:

```json
{
  "transactionId": "tx_bn_8912401",
  "timestamp": "2026-10-31T09:42:15.120Z",
  "issuerTeacherId": "usr_tch_eko_012",
  "recipientStudentId": "std_320101_2026_00481",
  "subjectId": "sub_mat_smp_7",
  "targetAssessmentId": "asm_sumatif_tp_7_2",
  "pointsAwarded": 3,
  "category": "STRETCH_CHALLENGE",
  "pedagogicalRationale": "Successfully derived alternative geometric proof for Pythagorean theorem variant.",
  "status": "APPLIED",
  "auditHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "previousHash": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
}
```
* **Audit Dashboard**: School Principals and Curriculum Coordinators can audit bonus point distributions to verify that grading equity is maintained.

### 7.5 Ethical Leaderboard Display & Privacy Protection
To eliminate toxic competition and anxiety, the platform provides three privacy modes for gamification displays:
1. **Private Mastery View (Default)**: Students only see their own badges, XP progress bar, and personal goals.
2. **Collaborative Team Pool**: XP is pooled by project groups, encouraging collective effort.
3. **Public Pseudonymous Board**: Displays avatar icons and chosen usernames only, hiding student real names and academic test scores.

---

## 8. AUTOMATED CURRICULUM TOOLS GENERATION ENGINE

### 8.1 Multi-Stage Pipeline Architecture & State Blackboard
The platform automates the authoring of all mandatory Kurikulum Merdeka instructional planning documents using a multi-agent Directed Acyclic Graph (DAG) operating on a shared transaction-safe blackboard object: `CurriculumWorkspaceState`.

```
[National CP Repository (BSKAP 032/H/KR/2024)]
                      |
                      v
      [1. CP Parsing & Element Deconstruction]
                      |
                      v
      [2. TP Generation Engine (ABCD + Bloom + P5)]
                      |
                      v
      [3. ATP Algorithmic Progression & JP Allocator]
                      |
           +----------+----------+
           |                     |
           v                     v
[4. KKTP Builder]      [5. Analisis Minggu Efektif (RME)]
           |                     |
           +----------+----------+
                      |
                      v
      [6. Program Tahunan (PROTA) Synthesizer]
                      |
                      v
      [7. Program Semester (PROSEM) Matrix Generator]
                      |
                      v
      [8. Modul Ajar (Complete 3-Part Lesson Plans)]
                      |
                      v
      [9. Meeting-Specific LKPD & Rubrics]
```

### 8.2 Capaian Pembelajaran (CP) Ingestion & Element Deconstruction
* **Data Source**: Embedded master database containing authoritative Capaian Pembelajaran text from **BSKAP No. 032/H/KR/2024**.
* **Element Extraction**: Deconstructs subject CP text into statutory elements (e.g., in SMP IPA: *Pemahaman IPA* dan *Keterampilan Proses*).
* **Semantic Analysis**: Identifies core knowledge verbs, subject matter boundaries, and prerequisite concepts.

### 8.3 Tujuan Pembelajaran (TP) Synthesis Engine
The system generates unambiguous, measurable TPs strictly satisfying the statutory four-part formulation:
$$\text{TP} = \text{Kompetensi (KKO)} + \text{Lingkup Materi} + \text{Dimensi P5} + [\text{Variasi / Konteks}]$$

#### Methodological Components:
1. **ABCD Formulation**:
   - **Audience (A)**: Targeted student cohort (*"Peserta didik kelas VII"*).
   - **Behavior (B)**: Observable competence verb (*"menganalisis hubungan antara gaya dan gerak"*).
   - **Condition (C)**: Instructional media or experimental setup (*"melalui percobaan simulasi virtual PhET"*).
   - **Degree (D)**: Standard of mastery (*"dengan menyajikan minimal 3 bukti empiris secara akurat"*).
2. **Bloom's Revised Taxonomy (Anderson & Krathwohl)**:
   - Enforces specific operational verbs (Kata Kerja Operasional / KKO) across levels:
     - $C_1$: *Mengingat* (Mengidentifikasi, Mendaftar, Menyebutkan).
     - $C_2$: *Memahami* (Menjelaskan, Mengklasifikasikan, Merangkum).
     - $C_3$: *Mengaplikasikan* (Menghitung, Mendemonstrasikan, Mengoperasikan).
     - $C_4$: *Menganalisis* (Membedakan, Mendiagnosis, Menguraikan).
     - $C_5$: *Mengevaluasi* (Memvalidasi, Mempertahankan, Mengkritisi).
     - $C_6$: *Menciptakan* (Merancang, Mengonstruksi, Memproduksi karya).
3. **Lingkup Materi**: Extracts core thematic content and essential terminology.
4. **Profil Pelajar Pancasila (P5)**: Binds relevant dimensions (e.g., *Bernalar Kritis*, *Gotong Royong*, *Kreatif*).

### 8.4 Alur Tujuan Pembelajaran (ATP) Algorithmic Progression Engine
Sequences generated TPs into a coherent learning trajectory across an entire Fase based on 6 pedagogical criteria:

```
+--------------------------------------------------------------------------------------------------------+
|                                  ATP SEQUENCING CRITERIA SPECIFICATION                                 |
+--------------------------+-----------------------------------------------------------------------------+
| Criteria Name            | Algorithmic Progression Rule & Pedagogical Logic                            |
+--------------------------+-----------------------------------------------------------------------------+
| 1. Pengurutan Hierarkis  | Prerequisite Dependency: Competency A must achieve 100% mastery before     |
|    (Hierarchical)        | Competency B is unlocked (e.g., Integer operations before linear equations).|
| 2. Pengurutan Prosedural | Sequential Workflow: Follows real-world experimental or procedural steps    |
|    (Procedural Flow)     | (e.g., Problem formulation -> Experimentation -> Analysis -> Reporting).   |
| 3. Konkret ke Abstrak    | Developmental Progression: Hands-on manipulative or physical observations   |
|    (Concrete to Abstract)| precede formal abstract mathematical or symbolic representations.           |
| 4. Mudah ke Sulit        | Cognitive Gradient: Scaffolds from single-variable problems to multi-       |
|    (Simple to Complex)   | variable complex scenarios.                                                 |
| 5. Pengurutan Deduktif   | Conceptual Scaffolding: Introduces foundational theories or umbrella concepts|
|    (General to Specific) | before analyzing granular case studies or exceptions.                       |
| 6. Scaffolding Spiral    | Spiral Progression: Revisits recurring concepts at increasing depths of     |
|    (Spiral Progression)  | cognitive complexity throughout the academic year.                          |
+--------------------------+-----------------------------------------------------------------------------+
```

* **Jam Pelajaran (JP) Allocation Engine**:
  $$JP_{TP} = \left\lceil \frac{K \times L}{2} \right\rceil + JP_{\text{formatif}} + JP_{\text{scaffolding}}$$
  Where $K \in \{1, 2, 3\}$ represents cognitive complexity (LOTS/MOTS/HOTS) and $L \in \{1, 2, 3\}$ represents content volume. The total sum of all TP allocations across the year is constrained to match the national curriculum standard (e.g., SMP Matematika $= 144$ JP/year).

### 8.5 Automated KKTP Specification Builder
For every derived TP, the system automatically builds:
* A qualitative **Deskripsi Kriteria** checklist.
* A 4-level **Rubrik Berskala** (*Perlu Bimbingan*, *Cukup*, *Baik*, *Mahir*).
* A mathematically continuous half-open **Skala Interval Nilai** table ($[0.00\%, 40.00\%]$, $(40.00\%, 65.00\%]$, $(65.00\%, 85.00\%]$, $(85.00\%, 100.00\%]$) guaranteeing zero unmapped floating-point values and concrete remedial/enrichment pedagogical action plans.

### 8.6 Analisis Minggu Efektif (RME / AME) Computational Engine
Calculates true instructional time by auditing the official regional academic calendar:

```
+----------------------------------------------------------------------------------------------------+
|                         ANALISIS MINGGU EFEKTIF (RME) CALCULATION ENGINE                           |
+----------------------------------------------------------------------------------------------------+
  1. Jumlah Minggu Kalender (JMK):
     Total calendar weeks in semester (typically 26 weeks across 6 months).

  2. Jumlah Minggu Tidak Efektif (JMTE):
     Sum of non-instructional weeks allocated for:
     - Masa Pengenalan Lingkungan Sekolah (MPLS)       : ~1 week
     - Libur Awal / Akhir Semester                     : ~3 weeks
     - Libur Hari Raya & Cuti Bersama Nasional         : ~1-2 weeks
     - Asesmen Sumatif Akhir Semester (SAS / SAT)      : ~1-2 weeks
     - Pengolahan Nilai & Penyerahan e-Rapor           : ~1 week
     - Kegiatan Jeda Tengah Semester / Class Meeting   : ~1 week
     ----------------------------------------------------------
     JMTE Total Formula: JMTE = Sum(all non-effective weeks)

  3. Jumlah Minggu Efektif (JME):
     JME = JMK - JMTE   (Statutory standard: 16 to 20 effective weeks)

  4. Jumlah Jam Pelajaran Efektif (JPE Total):
     JPE_Total = JME * W_struktur
     (Where W_struktur is the weekly JP allocation, e.g., 4 JP/week -> JPE = 18 * 4 = 72 JP)

  5. Statutory Allocation Distribution:
     - Jam Intrakurikuler Pembelajaran Materi : ~80% of JPE_Total
     - Jam Asesmen Sumatif Lingkup Materi     : ~12% of JPE_Total
     - Jam Cadangan Penyangga (Buffer)        : ~8% of JPE_Total
```

### 8.7 Program Tahunan (PROTA) Synthesizer
* Aggregates all derived TPs and allocates them across Semester 1 (Ganjil) and Semester 2 (Genap).
* Enforces mathematical parity:
  $$\sum JP_{\text{Semester 1}} + \sum JP_{\text{Semester 2}} = \text{Total National Annual JP}$$
* Generates exportable statutory PROTA tables including: No, Elemen CP, Capaian Pembelajaran, Kode & Deskripsi TP, Alokasi JP, and Semester Allocation.

### 8.8 Program Semester (PROSEM) Distribution Grid Engine
* Maps each TP from the PROTA into a weekly calendar distribution matrix (Months 1–6, Weeks 1–5 per month).
* Automatically shades and locks non-effective calendar blocks (`[MPLS]`, `[LIBUR]`, `[SAS]`, `[RAPOR]`).
* Distributes TP instructional hours across active weeks such that the sum of each row equals the TP's allocated JP, and the sum of each active week column equals the teacher's weekly credit hours ($W_{\text{struktur}}$).

---

## 9. AUTOMATED LESSON PLAN (MODUL AJAR) & LKPD GENERATION ENGINE

### 9.1 Modul Ajar 3-Part Architecture (BSKAP 2024 Compliance)
The Modul Ajar generator produces exhaustive, classroom-ready lesson plans strictly adhering to the 3-part statutory format:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   BAGIAN I: INFORMASI UMUM                                         │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ A. Identitas Modul:                                                                                │
│    - Nama Penyusun, Satuan Pendidikan, Tahun Ajaran, Jenjang, Fase, Tingkat Kelas, Alokasi Waktu.  │
│ B. Kompetensi Awal (Prerequisite Knowledge & Skills):                                              │
│    - Kemampuan prasyarat konkret yang wajib dikuasai sebelum memasuki materi unit.                 │
│ C. Profil Pelajar Pancasila (P5):                                                                  │
│    - Dimensi, Elemen, dan Subelemen spesifik yang diintegrasikan dalam pembelajaran.               │
│ D. Sarana dan Prasarana:                                                                           │
│    - Media visual/audio, alat laboratorium, lingkungan belajar, perangkat TIK yang digunakan.      │
│ E. Target Peserta Didik:                                                                           │
│    - Tipikal/Reguler, Peserta Didik dengan Kesulitan Belajar, Peserta Didik Berpencapaian Tinggi.  │
│ F. Model Pembelajaran:                                                                             │
│    - Problem-Based Learning (PBL), Project-Based Learning (PjBL), Discovery/Inquiry, TaRL, CRT.    │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                   BAGIAN II: KOMPONEN INTI                                         │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ A. Tujuan Pembelajaran (Spesifik per pertemuan pembelajaran).                                      │
│ B. Pemahaman Bermakna (Essential Real-World Understanding).                                         │
│ C. Pertanyaan Pemantik (Thought-provoking Inquiry Questions).                                      │
│ D. Persiapan Pembelajaran (Daftar kesiapan guru dan instrumen media).                              │
│ E. Rangkaian Kegiatan Pembelajaran Lengkap per Pertemuan:                                          │
│    1. Pendahuluan (10-15% JP): Orientasi, Apersepsi, Motivasi, Pemberian Acuan Belajar.            │
│    2. Inti (70-80% JP): Sintaks Model Pembelajaran lengkap + Diferensiasi (Konten/Proses/Produk).  │
│    3. Penutup (10-15% JP): Refleksi Bersama, Simpulan, Kuis Singkat / Exit Ticket, Tindak Lanjut.  │
│ F. Asesmen:                                                                                        │
│    - Asesmen Awal (Diagnostik Kognitif & Non-Kognitif)                                             │
│    - Asesmen Formatif (Observasi diskusi, lembar ceklist unjuk kerja, LKPD)                        │
│    - Asesmen Sumatif (Tes tertulis HOTS / Produk portofolio)                                       │
│ G. Pengayaan dan Remedial (Differentiated Intervention Plans).                                     │
│ H. Refleksi Diri Pendidik dan Peserta Didik.                                                       │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                   BAGIAN III: LAMPIRAN                                             │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ A. Lembar Kerja Peserta Didik (LKPD) untuk setiap pertemuan pembelajaran.                          │
│ B. Bahan Bacaan Guru dan Peserta Didik (Ringkasan konsep esensial).                                │
│ C. Glosarium (Daftar istilah penting beserta definisi operasional).                                │
│ D. Daftar Pustaka (Referensi buku teks, jurnal, dan sumber daring standar APA Style).              │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Differentiated Learning Integration (Konten, Proses, Produk)
The AI engine explicitly weaves differentiation into the core instructional syntax:
* **Diferensiasi Konten**: Recommends multi-modal formats (e.g., text summaries, infographics, short instructional videos, audio podcasts) tailored to visual, auditory, and kinesthetic learners.
* **Diferensiasi Proses**: Outlines tiered support during group work (e.g., Tier 1 receives step-by-step guided cue cards; Tier 2 conducts semi-autonomous investigations; Tier 3 pursues open-ended inquiry).
* **Diferensiasi Produk**: Permits varied demonstration modalities (e.g., written scientific report, infographic poster, video presentation, or interactive working model).

### 9.3 Meeting-Specific Lembar Kerja Peserta Didik (LKPD) Generator
For each instructional meeting, the generator crafts a dedicated, high-quality LKPD:
1. **Header & Identitas**: Catchy contextual title, class, meeting number, time limit, and group roster box.
2. **Capaian & Tujuan Pembelajaran**: Explicit student-facing statement of learning objectives.
3. **Petunjuk Pengerjaan & Keselamatan**: Step-by-step collaboration protocols and lab safety warnings.
4. **Stimulus Kontekstual**: Real-world news excerpt, environmental data table, or engineering challenge.
5. **Aktivitas Siswa Berjenjang**: Sequenced hands-on investigation steps.
6. **Pertanyaan Diskusi Berjenjang**: Guided analytical prompts.
7. **Rubrik Penilaian LKPD Lengkap**: Scoring guide across multiple dimensions.
8. **Kunci Jawaban Resmi & Panduan Guru (Teacher Key)**: Complete exemplar responses and common misconception guides for the teacher.

### 9.4 Scaffolding, Tiered Activity Structures & Assessment Rubrics
The LKPD engine operationalizes pedagogical scaffolding through explicit multi-tiered inquiry structures:

#### A. Three-Tiered Activity Scaffold (Differentiated Readiness)
* **Tier 1 (Kelompok Perlu Bimbingan / Foundation)**:
  - Guided step-by-step instructions with filled-in examples.
  - Graphic organizers, partially completed observation tables, visual cues, and essential concept word banks.
  - Focuses on foundational comprehension, tactile manipulation, and concrete observations.
* **Tier 2 (Kelompok Reguler / Proficient)**:
  - Standard inquiry protocols with open observation grids.
  - Requires students to collect, categorize, and cross-reference multiple variables independently.
  - Balanced cognitive challenge requiring deduction and procedural accuracy.
* **Tier 3 (Kelompok Mahir / Advanced)**:
  - Open-ended investigation prompts without pre-structured data tables.
  - Includes variable manipulation challenges (e.g., *"Design an alternative experimental condition to test edge case X"*).
  - Requires independent formulation of hypotheses, mathematical modeling, and error margin estimation.

#### B. Bloom's Revised Cognitive Progression within LKPD Questions
Every generated LKPD strictly sequences discussion questions from LOTS to HOTS:
```
+-------------------------------------------------------------------------------------------------------+
|                                    LKPD QUESTION TAXONOMY PROGRESSION                                 |
+------------+-----------------------+------------------------------------------------------------------+
| Level      | Cognitive Depth       | Example Prompt in Science / Math LKPD                            |
+------------+-----------------------+------------------------------------------------------------------+
| Step 1     | LOTS (C1-C2: Recall & | "Berdasarkan Tabel 1, sebutkan suhu tertinggi dan terendah yang   |
|            | Comprehension)        | terukur selama 15 menit pemanasan air."                          |
| Step 2     | MOTS (C3-C4: Apply &  | "Bandingkan laju kenaikan suhu antara air murni dan air garam,   |
|            | Analyze)              | lalu jelaskan faktor yang menyebabkan perbedaan grafik tersebut."|
| Step 3     | HOTS (C5-C6: Evaluate | "Jika volume air digandakan dan wadah diganti dengan isolator    |
|            | & Create / Innovate)  | termal, prediksi bentuk kurva suhu yang baru dan usulkan rancangan|
|            |                       | sistem pendingin hemat energi untuk waduk desa setempat."        |
+------------+-----------------------+------------------------------------------------------------------+
```

#### C. Comprehensive 4-Dimension LKPD Assessment Rubric
Each LKPD includes an integrated rubric evaluating both cognitive mastery and collaborative behaviors:
| Aspek Penilaian | Skor 1 (Perlu Bimbingan) | Skor 2 (Cukup) | Skor 3 (Baik) | Skor 4 (Mahir / Sangat Baik) |
|---|---|---|---|---|
| **1. Keterampilan Proses & Penyelidikan** | Data pengamatan tidak lengkap dan langkah kerja tidak runtut. | Data terisi namun terdapat kekeliruan pencatatan signifikan. | Seluruh data pengamatan terisi lengkap, akurat, dan runtut sesuai prosedur. | Data sangat presisi, dilengkapi catatan anomali dan analisis ketelitian alat. |
| **2. Analisis Konsep & Logika HOTS** | Jawaban pertanyaan diskusi keliru atau sebatas menyalin fakta mentah. | Mampu menjawab pertanyaan LOTS/MOTS namun gagal pada sintesis HOTS. | Menjawab seluruh pertanyaan hingga level HOTS dengan argumen logis dan tepat. | Menunjukkan penalaran kritis mendalam, sintesis lintas konsep, dan ide orisinal. |
| **3. Kolaborasi & Gotong Royong** | Pasif dalam kelompok; tidak berpartisipasi dalam pembagian tugas. | Berpartisipasi sebatas jika diminta anggota tim lain. | Aktif bekerja sama, mendengarkan pendapat rekan, dan berbagi tanggung jawab. | Memimpin koordinasi tim secara inklusif, menghargai rekan, dan memfasilitasi solusi. |
| **4. Komunikasi & Penyajian Karya** | Hasil LKPD tidak rapi, sulit dibaca, dan kesimpulan tidak koheren. | Tulisan rapi namun simpulan belum menjawab tujuan pembelajaran. | Laporan rapi, sistematis, dan kesimpulan dirumuskan secara lugas dan tepat. | Penyajian sangat estetis, sistematis, menggunakan diagram/visualisasi yang menarik. |


---

## 10. NON-FUNCTIONAL REQUIREMENTS & PLATFORM STANDARDS

### 10.1 High-Performance Data Grid & PWA Offline Specifications
* **Data Grid Throughput**: TanStack Table implementation maintaining a rock-solid **60 FPS** scroll rate on mid-tier hardware (e.g., 4GB RAM Chromebook or mobile device) when rendering a dense matrix of **50 students $\times$ 30 TPs** (1,500 interactive cells).
* **DOM Virtualization**: Active row and column virtualization ensuring no more than 60 DOM nodes are rendered in memory simultaneously.
* **Sub-3s Offline Sync**: IndexedDB mutation queue syncing up to 500 queued offline records within **3.0 seconds** of network reconnection.

### 10.2 Security, Privacy & Indonesian Regulatory Compliance (UU PDP No. 27/2022)
* **UU No. 27 Tahun 2022 Statutory Adherence**: Comprehensive compliance with Indonesia's Personal Data Protection Act (*Undang-Undang Pelindungan Data Pribadi*):
  - **Article 25 Compliance (Child & Minor Personal Data Protection)**: All primary and secondary school students are legal minors under the age of 18. The system mandates verifiable parental/guardian consent (`parentalConsent`) with granular scope tracking (`ACADEMIC_PROCESSING`, `ATTENDANCE_ALERTS`, `HEALTH_ACCOMMODATION`, `AI_ASSESSMENT_SYNTHESIS`). Any student record lacking active consent is restricted from automated processing, and automated GenAI narrative generation is disabled until consent documentation is attached.
  - **Articles 56 & 57 Compliance (Cross-Border Data Transfer & GenAI Pseudonymization)**: External LLM invocations (Google Gemini 2.5 Flash endpoints) are routed through an application-level **Pseudonymization & De-identification Gateway**. Direct transmission of student legal names, NIK, NISN, home addresses, or identifying family details across sovereign borders is strictly prohibited. The system substitutes synthetic privacy tokens (`[PESERTA_DIDIK]`), instructs the LLM to output gender-neutral third-person qualitative descriptors, and re-identifies student narratives client-side within the teacher's authenticated browser session in Indonesia.
  - **Specific / Sensitive Personal Data Safeguards (Article 4 Paragraph 2)**: Student national identity numbers (NIK), home addresses, disability accommodations, and guardian contact details are classified as *Data Pribadi yang Bersifat Spesifik*. These fields are encrypted at rest using **AES-256-GCM**, transmitted exclusively over **TLS 1.3**, and strictly isolated in Cloud Firestore security rules to prevent peer student enumeration.
  - **Data Sovereignty Compliance**: Primary operational database and application hosting are strictly located within Google Cloud Region Jakarta (`asia-southeast2`).
* **Authentication & Single Sign-On**: Firebase Authentication integrating **Google Workspace for Education SSO** (OAuth 2.0 / OpenID Connect) and standard email/password with multi-factor authentication (MFA) support for administrative roles.
* **Role-Based Access Control (RBAC) & Tenant Isolation**: Enforced via custom JWT claims and Firestore declarative security rules:
  - `super_admin` / `admin`: School-wide tenant administration, master roster imports, and audit oversight.
  - `wali_kelas`: Homeroom pastoral records, daily attendance consolidation, and final e-Rapor narrative assembly.
  - `guru_mapel`: Restricted exclusively to assigned rombel sections and subject gradebooks (cross-subject or cross-rombel grade mutations are blocked at the database layer).
  - `siswa`: Read-only access strictly confined to their own individual attendance, grades, and private XP badges (peer transaction auditing and peer PII queries are prohibited).
  - `orang_tua`: Read-only access strictly confined to their biological/legal child's progress, attendance notices, and official report cards.

### 10.3 Interoperability, Document Export & Google Ecosystem Sync
* **Pixel-Perfect PDF Generation**: Serverless generation of official Ministry e-Rapor with school crests, digital signatures, and barcode verification.
* **Dapodik Excel Export**: Generates `.xlsx` matching Ministry spreadsheet schemas for zero-error mass import.
* **Google Workspace Two-Way Sync**: Synchronizes rosters with Google Classroom and exports curriculum tools (Modul Ajar, LKPD) directly into **Google Docs** and **Google Drive**.

### 10.4 Resilience, Scalability & Disaster Recovery
* **Service Availability**: Designed for **99.9% uptime** during critical end-of-semester reporting windows.
* **Automated Backup**: Automated daily Firestore snapshot backups with point-in-time recovery (PITR) retained for 30 days.

---

*This document serves as the formal functional and non-functional baseline for all downstream architectural, multi-agent, and skill engineering specifications in the GuruApp / KelasMerdeka platform.*
