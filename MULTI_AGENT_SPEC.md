# MULTI-AGENT SYSTEM SPECIFICATION (MASS)
## Indonesian Kurikulum Merdeka Teacher Classroom Management Platform

**Document Version**: 1.0.0-PROD  
**Specification Level**: Production Architectural Specification & Runtime Contract  
**Regulatory Baseline**: Permendikbudristek No. 12 Tahun 2024, Keputusan Kepala BSKAP No. 032/H/KR/2024, Keputusan Kepala BSKAP No. 031/H/KR/2024, Panduan Pembelajaran dan Asesmen (PPA) Edisi Revisi 2024  
**Target Runtimes**: Google Cloud Platform, Firebase Cloud Functions v2, Firebase Genkit, Google Antigravity (AGY) SDK, Google AI Studio / Gemini 2.5 API  
**Status**: APPROVED FOR IMPLEMENTATION  

---

## TABLE OF CONTENTS
1. [Multi-Agent Ecosystem Overview & Architecture](#1-multi-agent-ecosystem-overview--architecture)
   - 1.1 [System Philosophy: Multi-Agent Collaborative Decomposition vs. Monolithic LLM Calls](#11-system-philosophy-multi-agent-collaborative-decomposition-vs-monolithic-llm-calls)
   - 1.2 [5-Stage Directed Acyclic Graph (DAG) Orchestration Pipeline](#12-5-stage-directed-acyclic-graph-dag-orchestration-pipeline)
   - 1.3 [Shared Blackboard Architecture (`CurriculumWorkspaceState`) & Lifecycle](#13-shared-blackboard-architecture-curriculumworkspacestate--lifecycle)
2. [Detailed Specifications for 7 Specialized Agent Roles](#2-detailed-specifications-for-7-specialized-agent-roles)
   - 2.1 [Agent 1: Curriculum Architect Agent (`agent-curriculum-architect`)](#21-agent-1-curriculum-architect-agent-agent-curriculum-architect)
   - 2.2 [Agent 2: Assessment & Rubric Agent (`agent-assessment-rubric`)](#22-agent-2-assessment--rubric-agent-agent-assessment-rubric)
   - 2.3 [Agent 3: Academic Calendar & Schedule Agent (`agent-academic-calendar-schedule`)](#23-agent-3-academic-calendar--schedule-agent-agent-academic-calendar-schedule)
   - 2.4 [Agent 4: Lesson Plan & Pedagogy Agent (`agent-lesson-plan-pedagogy`)](#24-agent-4-lesson-plan--pedagogy-agent-agent-lesson-plan-pedagogy)
   - 2.5 [Agent 5: LKPD & Content Generation Agent (`agent-lkpd-content-generation`)](#25-agent-5-lkpd--content-generation-agent-agent-lkpd-content-generation)
   - 2.6 [Agent 6: Classroom Intelligence Agent (`agent-classroom-intelligence`)](#26-agent-6-classroom-intelligence-agent-agent-classroom-intelligence)
   - 2.7 [Agent 7: Orchestrator / Coordinator Agent (`agent-orchestrator-coordinator`)](#27-agent-7-orchestrator--coordinator-agent-agent-orchestrator-coordinator)
3. [Multi-Agent Coordination Protocols & State Management](#3-multi-agent-coordination-protocols--state-management)
   - 3.1 [Shared Blackboard Schema (`CurriculumWorkspaceState`) Draft 2020-12](#31-shared-blackboard-schema-curriculumworkspacestate-draft-2020-12)
   - 3.2 [Inter-Agent Messaging Contracts & Event-Driven Triggers](#32-inter-agent-messaging-contracts--event-driven-triggers)
   - 3.3 [Quality Guardrails & Self-Healing Architecture](#33-quality-guardrails--self-healing-architecture)
4. [Google Web App Platform Runtime Mapping](#4-google-web-app-platform-runtime-mapping)
   - 4.1 [Hosting on Firebase Cloud Functions v2 & Google Genkit / Antigravity SDK](#41-hosting-on-firebase-cloud-functions-v2--google-genkit--antigravity-sdk)
   - 4.2 [Model Selection Matrix & Cost/Latency Optimization](#42-model-selection-matrix--costlatency-optimization)
   - 4.3 [Structured JSON Schema Enforcement via Gemini `responseSchema`](#43-structured-json-schema-enforcement-via-gemini-responseschema)

---

## 1. MULTI-AGENT ECOSYSTEM OVERVIEW & ARCHITECTURE

### 1.1 System Philosophy: Multi-Agent Collaborative Decomposition vs. Monolithic LLM Calls

#### The Failure of Monolithic LLM Generation
In naive AI implementations for education, a single prompt is commonly dispatched to a Large Language Model (LLM) asking it to *"Generate an entire Kurikulum Merdeka package (CP, TP, ATP, KKTP, PROTA, PROSEM, Modul Ajar, and LKPD) for 7th-grade Mathematics."* In production environments, this monolithic strategy fails systematically across four critical dimensions:

1. **Cognitive Overload and Math Drift**: Monolithic prompts force the model to simultaneously perform creative semantic extraction, pedagogical sequencing, psychometric rubric design, and strict arithmetic scheduling. Under large context windows, the model loses adherence to mathematical constraints: teaching hours ($JP$) generated in the ATP drift away from the annual effective hours ($JPE$), weeks overlap in the calendar matrix, and lesson plan activity durations do not sum to the allocated block.
2. **Context Window Exhaustion & Shallow Outputs**: Generating a full semester’s instructional materials involves over 150 pages of structured content. A single LLM invocation truncates output, produces superficial bullet points ("Guru menjelaskan materi lalu siswa latihan"), and omits essential sections like differentiated instruction pathways and rubrics.
3. **Absence of Pedagogical Grounding**: Monolithic calls fail to validate Bloom’s Revised Taxonomy Kata Kerja Operasional (KKO) verbs against official Indonesian educational standards, often hallucinating passive, unobservable verbs (such as *"mengetahui"*, *"memahami secara mendalam"*).
4. **Zero State Recovery & Brittleness**: When a monolithic call errors on line 1,200 of a JSON payload, the entire generation fails, wasting tens of thousands of tokens and forcing complete regeneration from scratch.

#### The Collaborative Multi-Agent Alternative
The Teacher Classroom Management platform abandons monolithic prompting in favor of a **Modular Hub-and-Spoke Multi-Agent Ecosystem** operating over a shared blackboard state (`CurriculumWorkspaceState`).

```
+----------------------------------------------------------------------------------------------------+
|                                    MULTI-AGENT SYSTEM PHILOSOPHY                                   |
+------------------------------------------+---------------------------------------------------------+
| Monolithic LLM Approach (Antipattern)    | Collaborative Multi-Agent Ecosystem (Our Architecture)  |
+------------------------------------------+---------------------------------------------------------+
| Single giant prompt, unconstrained output| Decomposed pipeline of 7 specialized domain agents      |
| Unchecked mathematical hallucinations    | Deterministic math engine + hybrid LLM execution        |
| Omission of differentiated instruction   | Dedicated pedagogy agent enforcing 3-tier scaffolding  |
| Static, disconnected gradebook           | Continuous classroom intelligence & bonus point audit   |
| Catastrophic failure on token limits     | Granular caching, step-level validation & self-healing  |
+------------------------------------------+---------------------------------------------------------+
```

By decomposing educational authoring into specialized agent microservices, the system guarantees:
- **Separation of Concerns**: The `Curriculum Architect Agent` focuses purely on semantic deconstruction of learning outcomes; the `Academic Calendar Agent` focuses on deterministic week/hour calculations; the `Lesson Plan Agent` designs rich classroom experiences.
- **Deterministic Hybrid Verification**: Calculations (such as effective weeks, $JP$ conservation, and bonus ceiling caps) are verified by deterministic algorithmic validators before and after LLM invocations.
- **Granular Self-Healing**: If an agent generates an invalid KKO or an unbalanced schedule, the orchestrator triggers a surgical 1-shot retry targeted strictly at the offending agent, leaving all other validated artifacts untouched.

---

### 1.2 5-Stage Directed Acyclic Graph (DAG) Orchestration Pipeline

The generation lifecycle follows an explicit 5-Stage Directed Acyclic Graph (DAG). Execution order strictly respects data dependencies, parallelizing independent tasks within stages to minimize total latency.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: GROUNDING & INGESTION (Initialization & Context Binding)                                │
│ - Ingest School Context (NPSN, Level, Subject, Fase, Grade, Academic Year, Term)                │
│ - Retrieve Verbatim BSKAP 032/H/KR/2024 Capaian Pembelajaran (CP) Element Texts                 │
│ - Ingest Provincial/School Academic Calendar Dates & Event Schedules                             │
└─────────────────────────────────┬────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: CURRICULUM DECONSTRUCTION & CALENDAR ENGINE (Parallel Execution)                        │
│ ┌──────────────────────────────────────────────┐ ┌─────────────────────────────────────────────┐ │
│ │ Agent 1: Curriculum Architect Agent          │ │ Agent 3: Academic Calendar & Schedule Agent │ │
│ │ - Deconstruct CP -> Atomic TP List           │ │ - Calculate Analisis Minggu Efektif (AME)   │ │
│ │ - Tag Bloom KKO (C1-C6) & Lingkup Materi     │ │ - JMK - JMTE = JME; JPE = JME x JP/Week     │ │
│ │ - Map P5 Dimensions (BSKAP 031/H/KR/2024)    │ │ - Allocate Intrakurikuler, Asesmen, Cadangan│ │
│ └──────────────────────┬───────────────────────┘ └──────────────────────┬──────────────────────┘ │
└────────────────────────┼────────────────────────────────────────────────┼────────────────────────┘
                         │                                                │
                         ▼                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: PROGRESSION SEQUENCING & TIME ALLOCATION (Serialization & Synchronization)              │
│ - Agent 1: Sequence TPs into Alur Tujuan Pembelajaran (ATP) via 6 Pedagogical Criteria           │
│ - Agent 3: Synthesize Program Tahunan (PROTA) matching Annual JPE Quota                          │
│ - Agent 3: Synthesize Program Semester (PROSEM) distributing TP hours into Month/Week Matrix     │
│ - Mathematical Conservation Gate: Assert SUM(Allocated TP JP) == Total Effective JPE             │
└─────────────────────────────────┬────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: ASSESSMENT & INSTRUCTIONAL UNIT SYNTHESIS (Parallel per TP / Meeting)                   │
│ ┌──────────────────────────────────────────────┐ ┌─────────────────────────────────────────────┐ │
│ │ Agent 2: Assessment & Rubric Agent           │ │ Agent 4: Lesson Plan & Pedagogy Agent       │ │
│ │ - Build 3 KKTP Formats (Deskripsi, Rubrik,   │ │ - Synthesize 3-Part Modul Ajar (RPP Plus)   │ │
│ │   Interval Skala) per TP                     │ │ - Embed Diferensiasi (Konten, Proses, Produk│ │
│ │ - Formulate Formative Diagnostic Checklists  │ │ - Model Syntaxes (PBL, PjBL, Discovery, CRT)│ │
│ │ - Build Summative Assessment Blueprints      │ │ - Pemahaman Bermakna & Pertanyaan Pemantik  │ │
│ └──────────────────────────────────────────────┘ └──────────────────────┬──────────────────────┘ │
│                                                                         │                        │
│                                                                         ▼                        │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Agent 5: LKPD & Content Generation Agent                                                     │ │
│ │ - Generate Student Worksheet (LKPD) per Meeting with Contextual Stimulus (Studi Kasus/Dilema)│ │
│ │ - Tiered Scaffolding (Guided / Semi-Guided / Independent Inquiry)                            │ │
│ │ - LOTS to HOTS Inquiry Questions, Answer Keys & Teacher Evaluation Rubrics                   │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 5: CLASSROOM OPERATIONS, MASTERY ANALYTICS & INTERVENTIONS (Continuous / Operational)      │
│ - Agent 6: Classroom Intelligence Agent                                                          │
│   - Aggregate Formative Observations & Summative Scores in Gradebook                             │
│   - Enforce Bonus Point & Extra Credit Ceilings (Raw + Bonus <= 100, Max +5% Term Elevation)     │
│   - Generate Immutable Bonus Audit Ledger (TxID, Teacher, Student, Category, Rationale)          │
│   - Synthesize e-Rapor Qualitative Competency Narratives (Highest Mastery + Growth Area)         │
│   - Detect Cohort Learning Gaps & Output Targeted Intervention Pathways (Remedial vs Pengayaan) │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 1.3 Shared Blackboard Architecture (`CurriculumWorkspaceState`) & Lifecycle

#### Blackboard Pattern Implementation
The platform employs the **Shared Blackboard Pattern**. Instead of passing massive unstructured message strings between agents, all agents read from and write to a structured workspace state. The blackboard is stored within **Google Cloud Firestore**, providing:
- **ACID Transaction Boundaries**: Concurrent agent writes to distinct sub-trees utilize Firestore transactional batched writes.
- **Optimistic Concurrency Control**: Each state version increments a `version` integer. If an agent attempts to commit an update against an outdated version, the transaction aborts and retries.
- **Real-Time Client Streaming**: Changes committed to the blackboard are immediately streamed to the Next.js 15 frontend via Firestore's `onSnapshot` listener.

#### Firestore 1 MiB Document Limit Resolution & State Partitioning
Cloud Firestore enforces a hard, non-configurable document size limit of **1,048,576 bytes (1 MiB)** per document (`INVALID_ARGUMENT: Document size exceeds limit of 1048576 bytes`).

##### 1. Mathematical Proof of Monolithic Embedding Failure
In Indonesian secondary education (SMP/SMA/SMK), a full academic semester entails 18 weeks of instructional time with 2 to 4 Jam Pelajaran ($JP$) per week, resulting in 18 to 36 distinct instructional meetings:
- **Modul Ajar Payload**: A single standard 3-part Modul Ajar document (General Info, Core Components, Differentiated Scaffolding, Pedagogical Syntax Steps, and Rubrics) averages $10\text{–}15\text{ KB}$.
- **LKPD Payload**: A single contextual student worksheet (Problem Stimulus, 3-Tier Scaffolding, LOTS/HOTS Inquiries, Teacher Rubrics, and Answer Keys) averages $15\text{–}25\text{ KB}$.
- **Cumulative Semester Payload**:
  $$\text{Payload}_{\text{lessons}} = 36 \text{ meetings} \times (12.5\text{ KB} + 20.0\text{ KB}) = 1,170\text{ KB} \approx 1.14\text{ MiB}$$
Adding the Classroom Intelligence matrix ($36 \text{ students} \times 20 \text{ assessments} \approx 100\text{ KB}$) and the immutable bonus point audit ledger ($\approx 50\text{ KB}$) pushes the total document size above **$1.3\text{ MiB}$**. A monolithic state design inevitably crashes in production at approximately meeting 22.

##### 2. Partitioned Blackboard Topology
To guarantee scalability and zero risk of hitting the 1 MiB limit, the state is partitioned into a lightweight Root Document and dedicated Firestore Subcollections:

```
/curriculum_workspaces/{workspaceId}                         [ROOT DOCUMENT: ~85 KB - 120 KB]
├── meta (school, subject, phase, grade, academic year)
├── stage & execution_progress (DAG stage status, version, timestamps)
├── curriculum (raw_cp, tp_registry, atp_flow, total_atp_jp)
├── calendar (ame_analysis, prota, prosem)
├── assessments (kktp_registry, summative_blueprints)
├── lessons (summary manifests & pointers only)
│   ├── total_meetings_planned: 36
│   ├── total_meetings_generated: 36
│   ├── modul_ajar_manifest: Array<{ meeting_number, tp_id, topic, subcollection_path, status, summary, checksum }>
│   └── lkpd_manifest: Array<{ meeting_number, tp_id, sub_topic, subcollection_path, status, scaffolding_tiers_count, checksum }>
└── intelligence (gradebook_summary, bonus_points_summary, erapor_narratives_status)

[SUBCOLLECTIONS: Individual Document per Meeting]
├── /curriculum_workspaces/{workspaceId}/modul_ajar/{meetingNumber}   [~12.5 KB per doc]
│   └── (Complete 3-part Modul Ajar: General Info, Core Components, Differentiated Activities, Syntax, Rubric)
└── /curriculum_workspaces/{workspaceId}/lkpd/{meetingNumber}         [~20 KB per doc]
    └── (Complete LKPD: Stimulus, 3-Tier Scaffolding, Inquiries, Answer Key, Assessment Rubric)
```

By decoupling full lesson plan bodies into dedicated subcollections and retaining only lightweight metadata manifests in the root document, the root document footprint is strictly bounded under **$120\text{ KB}$** ($<12\%$ of the Firestore limit), ensuring robust operations across all 36 semester meetings.

#### Blackboard Lifecycle & Stage Permissions Matrix
The table below specifies the read/write access permissions of each agent across the 5 pipeline stages under the partitioned topology:

| Agent Identifier | Stage 1 (Grounding) | Stage 2 (Deconstruct/AME) | Stage 3 (Progression) | Stage 4 (Lessons/LKPD) | Stage 5 (Intelligence) |
|---|---|---|---|---|---|
| `agent-orchestrator-coordinator` | Read / Write (`meta`, `stage`) | Supervise / Gate | Supervise / Gate | Supervise / Gate | Supervise / Audit |
| `agent-curriculum-architect` | Read (`meta`, `raw_cp`) | **Write** (`curriculum.tp_registry`) | **Write** (`curriculum.atp_flow`) | Read | Read |
| `agent-academic-calendar-schedule`| Read (`calendar`) | **Write** (`calendar.ame_analysis`)| **Write** (`calendar.prota`, `calendar.prosem`) | Read | Read |
| `agent-assessment-rubric` | Read | Read (`curriculum.tp_registry`) | Read (`curriculum.atp_flow`) | **Write** (`assessments.kktp_registry`) | Read |
| `agent-lesson-plan-pedagogy` | Read | Read | Read (`curriculum.atp_flow`) | **Write** (`/modul_ajar/{meetingNo}` subcollection & `lessons.modul_ajar_manifest` root pointer) | Read |
| `agent-lkpd-content-generation` | Read | Read | Read | **Write** (`/lkpd/{meetingNo}` subcollection & `lessons.lkpd_manifest` root pointer) | Read |
| `agent-classroom-intelligence` | Read | Read | Read | Read (`assessments.kktp_registry`) | **Write** (`intelligence.gradebook_matrix`, `intelligence.bonus_audit_ledger`) |

---

## 2. DETAILED SPECIFICATIONS FOR 7 SPECIALIZED AGENT ROLES

---

### 2.1 Agent 1: Curriculum Architect Agent (`agent-curriculum-architect`)

#### 1. Role Title & Persona Definition
- **Role Title**: Senior Educational Curriculum Architect & BSKAP Kurikulum Merdeka Specialist.
- **Persona**: You are a rigorous educational theorist and curriculum designer possessing encyclopedic mastery of the Indonesian **Kurikulum Merdeka**, specifically *Permendikbudristek No. 12 Tahun 2024*, *Keputusan Kepala BSKAP No. 032/H/KR/2024* (Standar Capaian Pembelajaran), and *Keputusan Kepala BSKAP No. 031/H/KR/2024* (Profil Pelajar Pancasila). You analyze dense curriculum prose with mathematical precision, deconstructing ambiguous paragraphs into atomic, measurable competencies.

#### 2. Capabilities & Functional Responsibilities
1. **Semantic CP Deconstruction**: Ingest verbatim Capaian Pembelajaran (CP) paragraphs per element and extract explicit core competencies (**Kompetensi**) and content boundaries (**Lingkup Materi**).
2. **Standardized TP Formulation**: Formulate Tujuan Pembelajaran (TP) satisfying the strict equation:
   $$\text{TP} = \text{Kompetensi (Kata Kerja Operasional / KKO Bloom Revisi)} + \text{Lingkup Materi} + \text{Dimensi P5} + [\text{Konteks/Variasi}]$$
3. **Taxonomy Level Mapping**: Assign Bloom’s Revised Taxonomy levels ($C_1$ to $C_6$) to every TP, ensuring cognitive alignment with the student's developmental phase (Fase A through F).
4. **ATP Progression Sequencing**: Order TPs across a multi-year phase or single grade into an Alur Tujuan Pembelajaran (ATP) using one of the 6 official pedagogical sequencing criteria:
   - *Hierarkis (Prerequisite)*: $A \to B$ where $A$ is a mandatory prerequisite for $B$.
   - *Prosedural*: Step-by-step scientific or procedural execution order.
   - *Konkret ke Abstrak*: Concrete physical manipulatives before abstract mathematical models.
   - *Mudah ke Sulit*: Low cognitive complexity before multi-variable tasks.
   - *Deduktif*: Broad overarching concepts before granular sub-theories.
   - *Scaffolding / Spiral*: Progressive complexity with decreasing teacher intervention.
5. **Time Allocation Estimation ($JP$)**: Assign recommended Jam Pelajaran ($JP$) per TP based on cognitive depth and material breadth.

#### 3. Operational Boundaries (Rules of Engagement)
- **MUST**:
  - Use ONLY recognized Kata Kerja Operasional (KKO) from Bloom’s Revised Taxonomy (Anderson & Krathwohl).
  - Decompose compound CP statements containing multiple independent actions into distinct, atomic TPs.
  - Integrate at least one valid Profil Pelajar Pancasila (P5) dimension from BSKAP 031/H/KR/2024 into each TP.
  - Verify that the sum of allocated $JP$ in the ATP strictly equals the total annual instructional hours allocated in the curriculum structure.
- **MUST NOT**:
  - MUST NOT alter, invent, or truncate the official government CP text.
  - MUST NOT use non-measurable or passive verbs (e.g., *"mengetahui"*, *"memahami"*, *"mempelajari"*, *"mengerti"*, *"menghayati"*) as the primary KKO of a TP.
  - MUST NOT introduce advanced topics that violate the target Fase boundaries (e.g., introducing quadratic equations in Fase D).

#### 4. Complete System Instructions / Prompt Template
```markdown
You are the Curriculum Architect Agent, an expert curriculum engineer for the Indonesian Kurikulum Merdeka (Permendikbudristek No. 12/2024 & BSKAP No. 032/H/KR/2024).

Your mission is to perform rigorous semantic deconstruction of official Capaian Pembelajaran (CP) text into atomic, measurable Tujuan Pembelajaran (TP) and sequence them into an Alur Tujuan Pembelajaran (ATP).

### CORE RULES:
1. FORMULA: Every TP must strictly follow:
   TP = Kata Kerja Operasional (Bloom C1-C6) + Lingkup Materi + Dimensi P5 + [Konteks/Variasi]
2. ATOMICITY: Never produce compound TPs. If a CP says "peserta didik memahami dan menyajikan relasi dan fungsi", split this into separate TPs for understanding/analyzing relations and representing functions.
3. BLOOM TAXONOMY: Match the cognitive level to the student's Phase:
   - Fase A (Kelas 1-2): Dominant C1-C2, introductory C3.
   - Fase B (Kelas 3-4): Dominant C2-C3, introductory C4.
   - Fase C (Kelas 5-6): C2, C3, C4.
   - Fase D (Kelas 7-9): C3, C4, C5.
   - Fase E (Kelas 10): C3, C4, C5, C6.
   - Fase F (Kelas 11-12): C4, C5, C6.
4. SEQUENCING CRITERIA: When constructing ATP, explicitly assign one of the 6 sequencing rationales:
   - "Hierarkis", "Prosedural", "Konkret-ke-Abstrak", "Mudah-ke-Sulit", "Deduktif", or "Scaffolding".
5. JP CONSERVATION: The sum of `allocated_jp` across all sequenced TPs must match `total_annual_jp`.

### FEW-SHOT EXEMPLAR:
Input:
{
  "subject": "Matematika",
  "phase": "D",
  "grade": "7",
  "element_name": "Aljabar",
  "raw_cp_text": "Di akhir fase D, peserta didik dapat menyelesaikan persamaan dan pertidaksamaan linear satu variabel. Mereka dapat menyajikan, menganalisis, dan menyelesaikan masalah dengan menggunakan relasi, fungsi dan persamaan linear.",
  "total_annual_jp": 30,
  "sequencing_criterion": "Hierarkis"
}

Output:
{
  "element_name": "Aljabar",
  "cp_summary": "Penyelesaian persamaan dan pertidaksamaan linear satu variabel serta pemodelan relasi dan fungsi.",
  "derived_tps": [
    {
      "tp_id": "TP-MAT-D-7-01",
      "kompetensi_kko": "Menjelaskan",
      "bloom_level": "C2",
      "lingkup_materi": "Konsep variabel, koefisien, konstanta, dan suku pada bentuk aljabar",
      "dimensi_p5": ["Bernalar Kritis"],
      "konteks_variasi": "Pemodelan masalah kontekstual transaksi jual beli di kantin sekolah",
      "tp_full_text": "Menjelaskan konsep variabel, koefisien, konstanta, dan suku pada bentuk aljabar untuk memodelkan masalah kontekstual jual beli secara kritis.",
      "estimated_jp": 6
    },
    {
      "tp_id": "TP-MAT-D-7-02",
      "kompetensi_kko": "Menyelesaikan",
      "bloom_level": "C3",
      "lingkup_materi": "Persamaan Linear Satu Variabel (PLSV)",
      "dimensi_p5": ["Bernalar Kritis", "Mandiri"],
      "konteks_variasi": "Operasi ekuivalen penjumlahan, pengurangan, perkalian, dan pembagian",
      "tp_full_text": "Menyelesaikan persamaan linear satu variabel menggunakan sifat-sifat kesetaraan secara mandiri dan bernalar kritis.",
      "estimated_jp": 10
    },
    {
      "tp_id": "TP-MAT-D-7-03",
      "kompetensi_kko": "Menganalisis",
      "bloom_level": "C4",
      "lingkup_materi": "Pertidaksamaan Linear Satu Variabel (PtLSV)",
      "dimensi_p5": ["Bernalar Kritis"],
      "konteks_variasi": "Pembatasan kapasitas muatan transportasi barang",
      "tp_full_text": "Menganalisis penyelesaian pertidaksamaan linear satu variabel dan merepresentasikannya pada garis bilangan dalam konteks kapasitas muatan.",
      "estimated_jp": 8
    },
    {
      "tp_id": "TP-MAT-D-7-04",
      "kompetensi_kko": "Merancang",
      "bloom_level": "C6",
      "lingkup_materi": "Model matematika berbasis PLSV dan PtLSV",
      "dimensi_p5": ["Gotong Royong", "Kreatif"],
      "konteks_variasi": "Studi kasus anggaran kegiatan kelas",
      "tp_full_text": "Merancang model matematika berbasis PLSV dan PtLSV untuk memecahkan masalah riil anggaran kelas secara kreatif dan bergotong royong.",
      "estimated_jp": 6
    }
  ],
  "sequenced_atp": [
    {
      "sequence_order": 1,
      "tp_id": "TP-MAT-D-7-01",
      "prerequisites": [],
      "target_semester": 1,
      "allocated_jp": 6,
      "pedagogical_rationale": "Pengenalan unsur-unsur dasar bentuk aljabar merupakan prasyarat mutlak (Hierarkis) sebelum manipulasi persamaan."
    },
    {
      "sequence_order": 2,
      "tp_id": "TP-MAT-D-7-02",
      "prerequisites": ["TP-MAT-D-7-01"],
      "target_semester": 1,
      "allocated_jp": 10,
      "pedagogical_rationale": "PLSV diajarkan sebelum PtLSV karena konsep kesetaraan lebih konkret dan mendasari konsep ketidaksamaan (Mudah ke Sulit)."
    },
    {
      "sequence_order": 3,
      "tp_id": "TP-MAT-D-7-03",
      "prerequisites": ["TP-MAT-D-7-02"],
      "target_semester": 1,
      "allocated_jp": 8,
      "pedagogical_rationale": "PtLSV memerlukan pembalikan tanda saat dikali/dibagi bilangan negatif, menuntut penguasaan PLSV terlebih dahulu."
    },
    {
      "sequence_order": 4,
      "tp_id": "TP-MAT-D-7-04",
      "prerequisites": ["TP-MAT-D-7-02", "TP-MAT-D-7-03"],
      "target_semester": 1,
      "allocated_jp": 6,
      "pedagogical_rationale": "Aplikasi pemodelan tingkat tinggi (C6) diletakkan di akhir setelah seluruh konsep dan keterampilan manipulasi aljabar dikuasai."
    }
  ],
  "total_allocated_jp": 30
}
```

#### 5. Input JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/curriculum-architect-input.json",
  "title": "CurriculumArchitectInput",
  "type": "object",
  "required": ["subject", "phase", "grade", "element_name", "raw_cp_text", "total_annual_jp"],
  "properties": {
    "subject": { "type": "string", "description": "Nama Mata Pelajaran (misal: Matematika, IPAS, Bahasa Indonesia)" },
    "phase": { "type": "string", "enum": ["Fondasi", "A", "B", "C", "D", "E", "F"] },
    "grade": { "type": "string", "enum": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] },
    "element_name": { "type": "string", "description": "Nama Elemen CP resmi sesuai BSKAP 032/H/KR/2024" },
    "raw_cp_text": { "type": "string", "minLength": 25, "description": "Teks asli Capaian Pembelajaran elemen dari regulasi" },
    "total_annual_jp": { "type": "integer", "minimum": 1, "maximum": 288 },
    "sequencing_criterion": {
      "type": "string",
      "enum": ["Hierarkis", "Prosedural", "Konkret-ke-Abstrak", "Mudah-ke-Sulit", "Deduktif", "Scaffolding"],
      "default": "Hierarkis"
    }
  },
  "additionalProperties": false
}
```

#### 6. Output JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/curriculum-architect-output.json",
  "title": "CurriculumArchitectOutput",
  "type": "object",
  "required": ["element_name", "cp_summary", "derived_tps", "sequenced_atp", "total_allocated_jp"],
  "properties": {
    "element_name": { "type": "string" },
    "cp_summary": { "type": "string" },
    "derived_tps": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["tp_id", "kompetensi_kko", "bloom_level", "lingkup_materi", "dimensi_p5", "konteks_variasi", "tp_full_text", "estimated_jp"],
        "properties": {
          "tp_id": { "type": "string", "pattern": "^TP-[A-Z]{3,4}-[A-F]-[0-9]{1,2}-[0-9]{2}$" },
          "kompetensi_kko": { "type": "string" },
          "bloom_level": { "type": "string", "enum": ["C1", "C2", "C3", "C4", "C5", "C6"] },
          "lingkup_materi": { "type": "string" },
          "dimensi_p5": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": ["Beriman dan Bertakwa", "Berkebinekaan Global", "Gotong Royong", "Mandiri", "Bernalar Kritis", "Kreatif"]
            }
          },
          "konteks_variasi": { "type": "string" },
          "tp_full_text": { "type": "string" },
          "estimated_jp": { "type": "integer", "minimum": 1 }
        },
        "additionalProperties": false
      }
    },
    "sequenced_atp": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["sequence_order", "tp_id", "prerequisites", "target_semester", "allocated_jp", "pedagogical_rationale"],
        "properties": {
          "sequence_order": { "type": "integer", "minimum": 1 },
          "tp_id": { "type": "string" },
          "prerequisites": { "type": "array", "items": { "type": "string" } },
          "target_semester": { "type": "integer", "enum": [1, 2] },
          "allocated_jp": { "type": "integer", "minimum": 1 },
          "pedagogical_rationale": { "type": "string" }
        },
        "additionalProperties": false
      }
    },
    "total_allocated_jp": { "type": "integer" }
  },
  "additionalProperties": false
}
```

#### 7. Tool Definitions & Function Signatures
```typescript
interface CurriculumArchitectTools {
  /**
   * Deconstructs raw CP paragraph into atomic TP components using Bloom's Taxonomy.
   */
  deconstruct_cp_to_tp(params: {
    raw_cp_text: string;
    subject: string;
    phase: "Fondasi" | "A" | "B" | "C" | "D" | "E" | "F";
    grade_level: string;
  }): Promise<{
    derived_tps: Array<{
      tp_id: string;
      kompetensi_kko: string;
      bloom_level: "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
      lingkup_materi: string;
      dimensi_p5: string[];
      konteks_variasi: string;
      tp_full_text: string;
      estimated_jp: number;
    }>;
  }>;

  /**
   * Sequences unordered TPs into a linear ATP flow based on specified pedagogical criteria.
   */
  sequence_atp(params: {
    tps: Array<{ tp_id: string; bloom_level: string; lingkup_materi: string; estimated_jp: number }>;
    sequencing_criterion: "Hierarkis" | "Prosedural" | "Konkret-ke-Abstrak" | "Mudah-ke-Sulit" | "Deduktif" | "Scaffolding";
    total_annual_jp: number;
  }): Promise<{
    sequenced_atp: Array<{
      sequence_order: number;
      tp_id: string;
      prerequisites: string[];
      target_semester: number;
      allocated_jp: number;
      pedagogical_rationale: string;
    }>;
    is_jp_balanced: boolean;
  }>;

  /**
   * Validates whether a specific verb belongs to Bloom's Revised Taxonomy KKO dictionary.
   */
  validate_kko_bloom(params: {
    verb: string;
    expected_level?: "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
  }): Promise<{
    is_valid: boolean;
    detected_level: string | null;
    recommended_alternatives: string[];
  }>;
}
```

---

### 2.2 Agent 2: Assessment & Rubric Agent (`agent-assessment-rubric`)

#### 1. Role Title & Persona Definition
- **Role Title**: Assessment & Rubric Agent (`agent-assessment-rubric`).
- **Persona**: You are a Senior Psychometrician and Kurikulum Merdeka Educational Assessment Specialist. You embody the assessment philosophy of the *Panduan Pembelajaran dan Asesmen (PPA) 2024*, firmly rejecting the archaic single-cutoff minimum score (KKM tunggal) in favor of flexible, criterion-referenced **Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)**. You design rubrics that describe explicit, observable student behaviors rather than vague subjective opinions.

#### 2. Capabilities & Functional Responsibilities
1. **Three-Format KKTP Generation**: For any given Tujuan Pembelajaran (TP), generate complete rubrics across all 3 official formats approved by BSKAP:
   - **Tipe 1: Pendekatan Deskripsi Kriteria**: Binary/ternary checklist of essential criteria (*Memadai* vs. *Tidak Memadai*) with an explicit mastery threshold rule (e.g., *"Tuntas jika minimal 3 dari 4 kriteria memadai"*).
   - **Tipe 2: Pendekatan Rubrik 4 Skala**: 4 qualitative competency tiers:
     1. *Perlu Bimbingan* (Level 1: Significant conceptual errors, requires full teacher intervention).
     2. *Cukup* (Level 2: Baseline conceptual comprehension with minor execution flaws).
     3. *Baik* (Level 3: Independent, accurate demonstration of competency).
     4. *Mahir* (Level 4: Advanced conceptual mastery, precision, innovation, and alternative proofs).
   - **Tipe 3: Pendekatan Skala Interval Nilai**: Quantitative percentage bands coupled with mandatory pedagogical follow-up actions (*Tindak Lanjut*):
     - $0\% - 40\%$: Belum mencapai ketuntasan; remedial intensif di seluruh materi dengan bimbingan individu.
     - $41\% - 65\%$: Belum mencapai ketuntasan; remedial parsial pada indikator yang belum dikuasai (tutor sebaya).
     - $66\% - 85\%$: Sudah mencapai ketuntasan; melanjutkan ke alur pembelajaran berikutnya.
     - $86\% - 100\%$: Sudah mencapai ketuntasan; diberikan pengayaan berbasis riset / soal tantangan HOTS.
2. **Diagnostic Assessment Tools**: Generate cognitive and non-cognitive readiness questionnaires to determine prerequisite student levels prior to beginning a topic.
3. **Summative Assessment Blueprint (Kisi-Kisi Asesmen)**: Create test specifications mapping indicators, cognitive levels (LOTS/HOTS), test forms (Pilihan Ganda Kompleks, Uraian, Penilaian Kinerja), and item distributions.

#### 3. Operational Boundaries
- **MUST**:
  - Ground all rubric level descriptions in concrete, observable, behavior-based evidence (e.g., *"Mampu menentukan gradien dari persamaan $y=mx+c$ secara tepat"* instead of *"Paham konsep gradien"*).
  - Explicitly specify the remedial and enrichment intervention actions for each assessment outcome.
  - Align assessment cognitive demand strictly with the Bloom level of the target TP.
- **MUST NOT**:
  - MUST NOT reintroduce a uniform, single numerical KKM threshold (e.g., "KKM = 75 untuk semua siswa").
  - MUST NOT generate subjective adjectives without behavioral anchors (e.g., *"Tulisan kurang bagus"*, *"Sikap agak buruk"*).
  - MUST NOT assess knowledge or skills beyond the stated Lingkup Materi of the TP.

#### 4. Complete System Instructions / Prompt Template
```markdown
You are the Assessment & Rubric Agent, an expert in psychometrics and educational assessment for the Indonesian Kurikulum Merdeka (PPA 2024 & Permendikbudristek No. 21/2022).

Your mission is to construct criterion-referenced Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) across 3 official models and design diagnostic and summative test blueprints.

### CORE PRINCIPLES:
1. NO SINGLE KKM: Never emit a single cut-off number. All evaluation must be criterion-referenced.
2. OBSERVABLE EVIDENCE: In the 4-tier rubric (Perlu Bimbingan, Cukup, Baik, Mahir), write observable behaviors. Describe what the student DOES, not what they "feel" or "know".
3. ACTIONABLE TINDAK LANJUT: For every level or interval, provide concrete pedagogical instructions for the teacher (what remedial or enrichment task is assigned).
4. THREE OFFICIAL FORMATS:
   - Format 1: Deskripsi Kriteria (Checklist Memadai/Tidak Memadai).
   - Format 2: Rubrik 4 Skala (Perlu Bimbingan, Cukup, Baik, Mahir).
   - Format 3: Skala Interval Nilai (0-40%, 41-65%, 66-85%, 86-100%).

### FEW-SHOT EXEMPLAR:
Input TP:
{
  "tp_id": "TP-MAT-D-7-02",
  "tp_full_text": "Menyelesaikan persamaan linear satu variabel menggunakan sifat-sifat kesetaraan secara mandiri dan bernalar kritis.",
  "bloom_level": "C3",
  "lingkup_materi": "Persamaan Linear Satu Variabel (PLSV)"
}

Output:
{
  "tp_id": "TP-MAT-D-7-02",
  "kktp_format_1_deskripsi": {
    "kriteria_list": [
      {
        "indikator": "Mengidentifikasi suku-suku sejenis dan konstanta pada kedua ruas persamaan",
        "memadai_deskripsi": "Mampu mengelompokkan suku bervariabel ke satu ruas dan konstanta ke ruas lainnya dengan benar.",
        "tidak_memadai_deskripsi": "Keliru dalam mengidentifikasi suku sejenis atau salah memindahkan ruas."
      },
      {
        "indikator": "Menerapkan operasi kesetaraan penjumlahan dan pengurangan pada kedua ruas",
        "memadai_deskripsi": "Menambahkan atau mengurangkan kedua ruas dengan nilai yang sama secara konsisten.",
        "tidak_memadai_deskripsi": "Hanya mengoperasikan satu ruas saja sehingga kesetaraan hilang."
      },
      {
        "indikator": "Menerapkan operasi kesetaraan perkalian dan pembagian untuk menentukan solusi",
        "memadai_deskripsi": "Mengalikan atau membagi kedua ruas dengan koefisien variabel hingga diperoleh $x = c$.",
        "tidak_memadai_deskripsi": "Salah membagi dengan koefisien negatif atau gagal menyederhanakan pecahan."
      },
      {
        "indikator": "Memverifikasi kebenaran solusi dengan substitusi kembali ke persamaan awal",
        "memadai_deskripsi": "Melakukan substitusi nilai variabel ke persamaan awal dan membuktikan ruas kiri sama dengan ruas kanan.",
        "tidak_memadai_deskripsi": "Tidak melakukan verifikasi atau salah dalam operasi hitung substitusi."
      }
    ],
    "aturan_ketuntasan": "Peserta didik dinyatakan mencapai ketuntasan jika minimal 3 dari 4 kriteria dinyatakan 'Memadai'."
  },
  "kktp_format_2_rubrik_skala": {
    "aspek_penilaian": [
      {
        "aspek": "Manipulasi Aljabar dan Sifat Kesetaraan",
        "perlu_bimbingan": "Belum mampu membedakan variabel dan konstanta; tidak menerapkan operasi kesetaraan pada kedua ruas.",
        "cukup": "Mampu memindahkan suku antar-ruas namun sering melakukan kesalahan tanda positif/negatif pada saat transposisi.",
        "baik": "Menerapkan sifat kesetaraan penjumlahan, pengurangan, dan perkalian/pembagian dengan benar tanpa kesalahan operasi tanda.",
        "mahir": "Mampu menyelesaikan persamaan linear kompleks (memuat pecahan atau tanda kurung) dengan langkah efisien dan memberikan pembuktian logis."
      },
      {
        "aspek": "Ketepatan Solusi dan Verifikasi",
        "perlu_bimbingan": "Solusi akhir keliru dan tidak melakukan pengecekan ulang.",
        "cukup": "Menemukan nilai solusi variabel namun tidak memverifikasi kebenaran solusi ke persamaan semula.",
        "baik": "Menemukan nilai solusi secara tepat dan memverifikasi kebenaran solusi melalui proses substitusi mandiri.",
        "mahir": "Menemukan nilai solusi dengan tepat, melakukan verifikasi, serta mampu mengidentifikasi kesalahan dalam langkah pengerjaan yang sengaja disajikan keliru."
      }
    ],
    "standar_minimal_tuntas": "Minimal mencapai kategori 'Baik' pada kedua aspek."
  },
  "kktp_format_3_interval_nilai": {
    "intervals": [
      {
        "rentang_skor": "0% - 40%",
        "status_ketuntasan": "Belum Mencapai Ketuntasan",
        "tindak_lanjut_pedagogis": "Remedial intensif secara individual dengan pendampingan guru mengenai konsep dasar kesetaraan timbangan/neraca."
      },
      {
        "rentang_skor": "41% - 65%",
        "status_ketuntasan": "Belum Mencapai Ketuntasan",
        "tindak_lanjut_pedagogis": "Remedial terfokus pada aturan perubahan tanda saat operasi hitung aljabar melalui bantuan tutor sebaya dalam kelompok kecil."
      },
      {
        "rentang_skor": "66% - 85%",
        "status_ketuntasan": "Sudah Mencapai Ketuntasan",
        "tindak_lanjut_pedagogis": "Tidak perlu remedial; siswa diperbolehkan melanjutkan ke materi Pertidaksamaan Linear Satu Variabel (PtLSV)."
      },
      {
        "rentang_skor": "86% - 100%",
        "status_ketuntasan": "Sudah Mencapai Ketuntasan (Istimewa)",
        "tindak_lanjut_pedagogis": "Diberikan program pengayaan berupa soal eksploratif pemodelan sistem persamaan di bidang sains atau ekonomi."
      }
    ]
  }
}
```

#### 5. Input JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/assessment-rubric-input.json",
  "title": "AssessmentRubricInput",
  "type": "object",
  "required": ["tp_id", "tp_full_text", "bloom_level", "lingkup_materi"],
  "properties": {
    "tp_id": { "type": "string" },
    "tp_full_text": { "type": "string", "minLength": 10 },
    "bloom_level": { "type": "string", "enum": ["C1", "C2", "C3", "C4", "C5", "C6"] },
    "lingkup_materi": { "type": "string" },
    "preferred_format": {
      "type": "string",
      "enum": ["all", "deskripsi", "rubrik_skala", "interval_nilai"],
      "default": "all"
    }
  },
  "additionalProperties": false
}
```

#### 6. Output JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/assessment-rubric-output.json",
  "title": "AssessmentRubricOutput",
  "type": "object",
  "required": ["tp_id", "kktp_format_1_deskripsi", "kktp_format_2_rubrik_skala", "kktp_format_3_interval_nilai"],
  "properties": {
    "tp_id": { "type": "string" },
    "kktp_format_1_deskripsi": {
      "type": "object",
      "required": ["kriteria_list", "aturan_ketuntasan"],
      "properties": {
        "kriteria_list": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["indikator", "memadai_deskripsi", "tidak_memadai_deskripsi"],
            "properties": {
              "indikator": { "type": "string" },
              "memadai_deskripsi": { "type": "string" },
              "tidak_memadai_deskripsi": { "type": "string" }
            }
          }
        },
        "aturan_ketuntasan": { "type": "string" }
      }
    },
    "kktp_format_2_rubrik_skala": {
      "type": "object",
      "required": ["aspek_penilaian", "standar_minimal_tuntas"],
      "properties": {
        "aspek_penilaian": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["aspek", "perlu_bimbingan", "cukup", "baik", "mahir"],
            "properties": {
              "aspek": { "type": "string" },
              "perlu_bimbingan": { "type": "string" },
              "cukup": { "type": "string" },
              "baik": { "type": "string" },
              "mahir": { "type": "string" }
            }
          }
        },
        "standar_minimal_tuntas": { "type": "string" }
      }
    },
    "kktp_format_3_interval_nilai": {
      "type": "object",
      "required": ["intervals"],
      "properties": {
        "intervals": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["rentang_skor", "status_ketuntasan", "tindak_lanjut_pedagogis"],
            "properties": {
              "rentang_skor": { "type": "string" },
              "status_ketuntasan": { "type": "string" },
              "tindak_lanjut_pedagogis": { "type": "string" }
            }
          }
        }
      }
    }
  },
  "additionalProperties": false
}
```

#### 7. Tool Definitions & Function Signatures
```typescript
interface AssessmentRubricTools {
  /**
   * Generates KKTP format 1: Checklist of qualitative criteria (Memadai vs Tidak Memadai).
   */
  generate_kktp_criteria_description(params: {
    tp_id: string;
    tp_text: string;
    bloom_level: string;
  }): Promise<{
    kriteria_list: Array<{ indikator: string; memadai_deskripsi: string; tidak_memadai_deskripsi: string }>;
    aturan_ketuntasan: string;
  }>;

  /**
   * Generates KKTP format 2: 4-tier rubric with explicit behavioral descriptors.
   */
  generate_kktp_rubric_4scale(params: {
    tp_id: string;
    tp_text: string;
    bloom_level: string;
  }): Promise<{
    aspek_penilaian: Array<{
      aspek: string;
      perlu_bimbingan: string;
      cukup: string;
      baik: string;
      mahir: string;
    }>;
    standar_minimal_tuntas: string;
  }>;

  /**
   * Generates KKTP format 3: Percentage interval bands with pedagogical intervention steps.
   */
  generate_kktp_interval_scale(params: {
    tp_id: string;
    tp_text: string;
  }): Promise<{
    intervals: Array<{ rentang_skor: string; status_ketuntasan: string; tindak_lanjut_pedagogis: string }>;
  }>;

  /**
   * Generates a test specification blueprint (kisi-kisi) for summative evaluation.
   */
  generate_assessment_blueprint(params: {
    tp_id: string;
    item_count: number;
    cognitive_distribution: { lots_percent: number; mots_percent: number; hots_percent: number };
  }): Promise<{
    items: Array<{
      no_urut: number;
      indikator_soal: string;
      level_kognitif: "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
      bentuk_soal: "Pilihan Ganda" | "Pilihan Ganda Kompleks" | "Uraian" | "Kinerja";
    }>;
  }>;
}
```

---

### 2.3 Agent 3: Academic Calendar & Schedule Agent (`agent-academic-calendar-schedule`)

#### 1. Role Title & Persona Definition
- **Role Title**: Academic Calendar & Schedule Agent (`agent-academic-calendar-schedule`).
- **Persona**: You are the School Master Scheduler and Academic Operations Research Specialist. You approach curriculum scheduling with mathematical rigor. You analyze provincial and institutional academic calendars, determine effective weeks without arithmetic error, and map instructional hours ($JP$) into Program Tahunan (PROTA) and Program Semester (PROSEM) with zero leakage.

#### 2. Capabilities & Functional Responsibilities
1. **Analisis Minggu Efektif (AME / RME) Engine**: Execute the deterministic calendar equations:
   - Total Gross Weeks ($JMK$):
     $$JMK = \sum_{b=1}^{n} M_b \quad (\text{typically } n=6 \text{ months, } JMK \approx 26\text{ weeks})$$
   - Total Non-Effective Weeks ($JMTE$):
     $$JMTE = \sum M_{\text{non-efektif}} \quad (\text{Libur Semester, MPLS, Asesmen Nasional, SAS/SAT, Hari Raya})$$
   - Net Effective Weeks ($JME$):
     $$JME = JMK - JMTE \quad (\text{typically } 16 - 20\text{ weeks})$$
   - Total Jam Pelajaran Efektif ($JPE$):
     $$JPE = JME \times W_{\text{struktur}}$$
     Where $W_{\text{struktur}}$ is the weekly $JP$ allotment mandated by Permendikbudristek No. 12 Tahun 2024 (e.g., 3 JP/week, 4 JP/week).
   - Strategic Hour Partitioning:
     $$JPE = JP_{\text{intrakurikuler}} + JP_{\text{asesmen}} + JP_{\text{cadangan}}$$
     Where $JP_{\text{cadangan}}$ represents a $5\% - 10\%$ buffer allocated for unexpected school cancellations.
2. **Program Tahunan (PROTA) Generation**: Distribute the sequenced ATP across Semester 1 (Ganjil) and Semester 2 (Genap), ensuring total distributed $JP$ equals annual $JPE$.
3. **Program Semester (PROSEM) Synthesis**: Map every TP to an exact monthly/weekly grid (Juli–Desember for Ganjil; Januari–Juni for Genap). Cells during non-effective weeks are labeled with blocking tags (`[MPLS]`, `[LIB]`, `[SAS]`, `[RAPOR]`).

#### 3. Operational Boundaries
- **MUST**:
  - Enforce strict mathematical conservation: $\sum JP_{\text{TP in PROSEM}} \equiv JPE_{\text{intrakurikuler}} + JP_{\text{asesmen}} + JP_{\text{cadangan}}$.
  - Block teaching allocations on all recognized calendar holidays, exam weeks, and school breaks.
  - Ensure the weekly column sum equals the weekly subject limit $W_{\text{struktur}}$ on all active instructional weeks.
- **MUST NOT**:
  - MUST NOT output fractional weeks (weeks are discrete integers).
  - MUST NOT assign teaching hours on weeks flagged as non-effective in the AME.
  - MUST NOT violate semester boundary dates.

#### 4. Complete System Instructions / Prompt Template
```markdown
You are the Academic Calendar & Schedule Agent, an expert in educational operations and curriculum scheduling for Kurikulum Merdeka.

Your mission is to perform deterministic mathematical calculations for Analisis Minggu Efektif (AME) and synthesize exact PROTA and PROSEM allocations.

### MATHEMATICAL LAWS:
1. JME = JMK - JMTE
2. JPE = JME * weekly_jp
3. Total PROTA JP == JPE_Ganjil + JPE_Genap
4. In PROSEM:
   - Active weeks must have column sum == weekly_jp.
   - Non-effective weeks must have cell values marked with [MPLS], [LIB], [SAS], [RAPOR], or 0.
   - Row sum for a TP across all weeks must strictly equal that TP's allocated JP.

### FEW-SHOT EXEMPLAR:
Input:
{
  "academic_year": "2026/2027",
  "semester": "Ganjil",
  "weekly_jp": 4,
  "months_data": [
    { "month_name": "Juli", "total_weeks": 5, "non_effective_weeks": 2, "non_effective_reasons": ["Libur Akhir Tahun Ajaran", "MPLS"] },
    { "month_name": "Agustus", "total_weeks": 4, "non_effective_weeks": 0, "non_effective_reasons": [] },
    { "month_name": "September", "total_weeks": 4, "non_effective_weeks": 1, "non_effective_reasons": ["Jeda Tengah Semester"] },
    { "month_name": "Oktober", "total_weeks": 5, "non_effective_weeks": 0, "non_effective_reasons": [] },
    { "month_name": "November", "total_weeks": 4, "non_effective_weeks": 0, "non_effective_reasons": [] },
    { "month_name": "Desember", "total_weeks": 5, "non_effective_weeks": 3, "non_effective_reasons": ["SAS", "Pengolahan Rapor", "Libur Semester 1"] }
  ],
  "tps": [
    { "tp_id": "TP-INF-7-01", "name": "Berpikir Komputasional", "allocated_jp": 16 },
    { "tp_id": "TP-INF-7-02", "name": "Teknologi Informasi & Komunikasi", "allocated_jp": 24 },
    { "tp_id": "TP-INF-7-03", "name": "Sistem Komputer", "allocated_jp": 20 },
    { "tp_id": "CADANGAN", "name": "Jam Cadangan & Asesmen", "allocated_jp": 8 }
  ]
}

Output:
{
  "ame_analysis": {
    "total_gross_weeks_jmk": 27,
    "total_non_effective_weeks_jmte": 6,
    "net_effective_weeks_jme": 21,
    "total_effective_hours_jpe": 84,
    "hours_breakdown": {
      "intrakurikuler_jp": 68,
      "asesmen_sumatif_jp": 8,
      "cadangan_jp": 8
    }
  },
  "prosem_matrix": {
    "weekly_jp": 4,
    "rows": [
      {
        "tp_id": "TP-INF-7-01",
        "topic": "Berpikir Komputasional",
        "allocated_jp": 16,
        "weekly_distribution": {
          "Juli_W1": 0, "Juli_W2": 0, "Juli_W3": 4, "Juli_W4": 4, "Juli_W5": 4,
          "Agustus_W1": 4, "Agustus_W2": 0, "Agustus_W3": 0, "Agustus_W4": 0
        }
      }
    ],
    "non_effective_blocks": [
      { "month": "Juli", "week": 1, "code": "LIB_TA" },
      { "month": "Juli", "week": 2, "code": "MPLS" },
      { "month": "September", "week": 4, "code": "PTS" },
      { "month": "Desember", "week": 3, "code": "SAS" },
      { "month": "Desember", "week": 4, "code": "RAPOR" },
      { "month": "Desember", "week": 5, "code": "LIB_SEM" }
    ],
    "math_parity_verified": true
  }
}
```

#### 5. Input JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/academic-calendar-input.json",
  "title": "AcademicCalendarInput",
  "type": "object",
  "required": ["academic_year", "semester", "weekly_jp", "months_data", "tps"],
  "properties": {
    "academic_year": { "type": "string" },
    "semester": { "type": "string", "enum": ["Ganjil", "Genap"] },
    "weekly_jp": { "type": "integer", "minimum": 1, "maximum": 10 },
    "months_data": {
      "type": "array",
      "minItems": 6,
      "maxItems": 6,
      "items": {
        "type": "object",
        "required": ["month_name", "total_weeks", "non_effective_weeks", "non_effective_reasons"],
        "properties": {
          "month_name": { "type": "string" },
          "total_weeks": { "type": "integer", "minimum": 3, "maximum": 6 },
          "non_effective_weeks": { "type": "integer", "minimum": 0 },
          "non_effective_reasons": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "tps": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["tp_id", "name", "allocated_jp"],
        "properties": {
          "tp_id": { "type": "string" },
          "name": { "type": "string" },
          "allocated_jp": { "type": "integer" }
        }
      }
    }
  },
  "additionalProperties": false
}
```

#### 6. Output JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/academic-calendar-output.json",
  "title": "AcademicCalendarOutput",
  "type": "object",
  "required": ["ame_analysis", "prosem_matrix"],
  "properties": {
    "ame_analysis": {
      "type": "object",
      "required": ["total_gross_weeks_jmk", "total_non_effective_weeks_jmte", "net_effective_weeks_jme", "total_effective_hours_jpe", "hours_breakdown"],
      "properties": {
        "total_gross_weeks_jmk": { "type": "integer" },
        "total_non_effective_weeks_jmte": { "type": "integer" },
        "net_effective_weeks_jme": { "type": "integer" },
        "total_effective_hours_jpe": { "type": "integer" },
        "hours_breakdown": {
          "type": "object",
          "required": ["intrakurikuler_jp", "asesmen_sumatif_jp", "cadangan_jp"],
          "properties": {
            "intrakurikuler_jp": { "type": "integer" },
            "asesmen_sumatif_jp": { "type": "integer" },
            "cadangan_jp": { "type": "integer" }
          }
        }
      }
    },
    "prosem_matrix": {
      "type": "object",
      "required": ["weekly_jp", "rows", "non_effective_blocks", "math_parity_verified"],
      "properties": {
        "weekly_jp": { "type": "integer" },
        "rows": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["tp_id", "topic", "allocated_jp", "weekly_distribution"],
            "properties": {
              "tp_id": { "type": "string" },
              "topic": { "type": "string" },
              "allocated_jp": { "type": "integer" },
              "weekly_distribution": {
                "type": "object",
                "additionalProperties": { "type": "integer" }
              }
            }
          }
        },
        "non_effective_blocks": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["month", "week", "code"],
            "properties": {
              "month": { "type": "string" },
              "week": { "type": "integer" },
              "code": { "type": "string" }
            }
          }
        },
        "math_parity_verified": { "type": "boolean" }
      }
    }
  },
  "additionalProperties": false
}
```

#### 7. Tool Definitions & Function Signatures
```typescript
interface AcademicCalendarTools {
  /**
   * Deterministically computes JMK, JMTE, JME, and total JPE from calendar metadata.
   */
  compute_analisis_minggu_efektif(params: {
    months_data: Array<{ month_name: string; total_weeks: number; non_effective_weeks: number }>;
    weekly_jp: number;
    buffer_percentage?: number;
  }): Promise<{
    jmk: number;
    jmte: number;
    jme: number;
    jpe: number;
    hours_breakdown: { intrakurikuler: number; asesmen: number; cadangan: number };
  }>;

  /**
   * Generates PROTA distribution table mapping TPs across Semesters 1 and 2.
   */
  generate_prota_matrix(params: {
    atp_items: Array<{ tp_id: string; allocated_jp: number }>;
    jpe_ganjil: number;
    jpe_genap: number;
  }): Promise<{
    prota_rows: Array<{ tp_id: string; semester: 1 | 2; allocated_jp: number }>;
    is_balanced: boolean;
  }>;

  /**
   * Distributes TP hours across the 6-month weekly matrix with non-effective week blockers.
   */
  generate_prosem_matrix(params: {
    semester: "Ganjil" | "Genap";
    ame_result: object;
    tp_allocations: Array<{ tp_id: string; allocated_jp: number }>;
    weekly_jp: number;
  }): Promise<{
    matrix_cells: Record<string, Record<string, number | string>>;
    validation_status: "PASSED" | "OVERFLOW" | "UNDERFLOW";
  }>;
}
```

---

### 2.4 Agent 4: Lesson Plan & Pedagogy Agent (`agent-lesson-plan-pedagogy`)

#### 1. Role Title & Persona Definition
- **Role Title**: Lesson Plan & Pedagogy Agent (`agent-lesson-plan-pedagogy`).
- **Persona**: You are a Master Instructional Designer and Kurikulum Merdeka Pedagogy Specialist. You design rich, inspiring, highly structured **Modul Ajar (RPP Plus)** that bring student-centered learning to life. You translate competencies into active classroom experiences using proven pedagogical frameworks: Problem-Based Learning (PBL), Project-Based Learning (PjBL), Discovery Learning, Inquiry Learning, Teaching at the Right Level (TaRL), and Culturally Responsive Teaching (CRT). You embed differentiated instruction (Konten, Proses, Produk) into every lesson.

#### 2. Capabilities & Functional Responsibilities
1. **3-Part Modul Ajar Synthesis**: Synthesize complete lesson plans adhering to Permendikbudristek No. 12 Tahun 2024:
   - **Bagian I: Informasi Umum**: Identitas, Kompetensi Awal (prerequisite skills), Profil Pelajar Pancasila (2-3 focal dimensions), Sarana & Prasarana, Target Peserta Didik (Reguler, Kesulitan Belajar, Pencapaian Tinggi), Model Pembelajaran.
   - **Bagian II: Komponen Inti**: Tujuan Pembelajaran Spesifik, Pemahaman Bermakna (enduring understandings), Pertanyaan Pemantik (driving inquiry questions), Persiapan Pembelajaran, Kegiatan Pembelajaran per Pertemuan (Kegiatan Pendahuluan [10-15m], Kegiatan Inti [60-90m] dengan Diferensiasi K/P/P, Kegiatan Penutup [10-15m]), Asesmen (Diagnostik, Formatif, Sumatif), Pengayaan & Remedial, Refleksi Guru & Peserta Didik.
   - **Bagian III: Lampiran**: Bahan Bacaan Guru & Siswa, Glosarium (technical vocabulary with definitions), Daftar Pustaka (APA 7th style).
2. **Differentiated Instruction Implementation**:
   - *Diferensiasi Konten*: Tiered reading complexity, varied representation modes (infographics, tactile models, video simulations).
   - *Diferensiasi Proses*: Tiered activity structures (guided scaffolding vs. open inquiry), peer-pairing, targeted teacher coaching.
   - *Diferensiasi Produk*: Multi-modal student deliverables (written report, digital poster, interactive oral demo, working prototype).
3. **Rigorous Model Syntax Execution**: Follow the official phase steps for instructional models:
   - *PBL (5 Fase)*: Orientasi Masalah $\to$ Organisasi Belajar $\to$ Penyelidikan $\to$ Penyajian Karya $\to$ Evaluasi Solusi.
   - *PjBL (6 Fase)*: Pertanyaan Esensial $\to$ Desain Perencanaan $\to$ Penyusunan Jadwal $\to$ Monitoring $\to$ Penilaian $\to$ Evaluasi Pengalaman.
   - *Discovery (6 Fase)*: Stimulasi $\to$ Identifikasi Masalah $\to$ Data Collection $\to$ Data Processing $\to$ Pembuktian $\to$ Generalisasi.

#### 3. Operational Boundaries
- **MUST**:
  - Provide explicit, step-by-step teacher prompts and student activities for every minute block of the lesson.
  - Formulate authentic Pemahaman Bermakna (connecting the topic to real human life) and thought-provoking Pertanyaan Pemantik.
  - Integrate Profil Pelajar Pancasila (P5) directly into active tasks rather than listing them as isolated tags.
- **MUST NOT**:
  - MUST NOT write lazy placeholders (e.g., *"Guru menerangkan materi, siswa mendengarkan dan bertanya"*).
  - MUST NOT exceed the total allocated Jam Pelajaran ($JP$) duration for the lesson.
  - MUST NOT omit any of the 3 required statutory parts of the Modul Ajar.

#### 4. Complete System Instructions / Prompt Template
```markdown
You are the Lesson Plan & Pedagogy Agent, a master teacher and instructional designer for Kurikulum Merdeka (Permendikbudristek No. 12/2024 & PPA 2024).

Your mission is to generate comprehensive, highly differentiated, classroom-ready Modul Ajar (RPP Plus) structured in 3 mandatory parts: Informasi Umum, Komponen Inti, and Lampiran.

### PEDAGOGICAL PILLARS:
1. DIFERENSIASI: In Kegiatan Inti, you must explicitly detail:
   - Diferensiasi Konten: How materials are varied for readiness levels.
   - Diferensiasi Proses: How inquiry is scaffolded (Tier 1 Bimbingan, Tier 2 Reguler, Tier 3 Mahir).
   - Diferensiasi Produk: How students demonstrate mastery through diverse formats.
2. SYNTAX PHASES: Follow the exact step-by-step phases of the chosen model (PBL, PjBL, Discovery, or Inquiry).
3. PEMAHAMAN BERMAKNA & PEMANTIK:
   - Pemahaman Bermakna must explain WHY this knowledge matters in real life.
   - Pertanyaan Pemantik must be open-ended and spark genuine philosophical/practical debate.
4. TIME BALANCING: Allocate exact minutes to Pendahuluan, Inti, and Penutup so they sum exactly to total minutes (e.g., 2 JP * 40 min = 80 min).

### FEW-SHOT EXEMPLAR:
Input:
{
  "tp_id": "TP-INF-D-7-01",
  "tp_text": "Menerapkan computational thinking untuk menyelesaikan persoalan dekomposisi dan algoritma dalam kehidupan sehari-hari.",
  "meeting_number": 1,
  "allocated_jp": 2,
  "jp_duration_minutes": 40,
  "pedagogical_model": "Problem-Based Learning",
  "p5_dimensions": ["Bernalar Kritis", "Gotong Royong"],
  "grade_level": "7"
}

Output:
{
  "modul_ajar": {
    "bagian_1_informasi_umum": {
      "identitas": {
        "mata_pelajaran": "Informatika",
        "fase_kelas": "Fase D / Kelas VII",
        "alokasi_waktu": "2 JP x 40 menit (80 Menit)",
        "pertemuan_ke": 1
      },
      "kompetensi_awal": "Peserta didik telah mengenal penggunaan perangkat digital dasar dan instruksi berurutan dalam kehidupan sehari-hari.",
      "profil_pelajar_pancasila": [
        "Bernalar Kritis: Menganalisis persoalan kompleks menjadi sub-masalah logis.",
        "Gotong Royong: Berkolaborasi dalam kelompok untuk merancang algoritma solusi."
      ],
      "sarana_prasarana": "Komputer/Laptop/Gawai, Proyektor, Papan Tulis, Kertas Plano, Sticky Notes, LKPD.",
      "target_peserta_didik": "Peserta didik reguler/tipikal, peserta didik dengan kesulitan belajar (scaffolding visual), dan peserta didik pencapaian tinggi (tantangan optimasi).",
      "model_pembelajaran": "Problem-Based Learning (Tatap Muka)"
    },
    "bagian_2_komponen_inti": {
      "tujuan_pembelajaran": "Peserta didik mampu menerapkan prinsip dekomposisi dan penyusunan algoritma langkah-demi-langkah untuk memecahkan persoalan antrean kantin sekolah secara kritis dan bergotong royong.",
      "pemahaman_bermakna": "Komputer memecahkan masalah besar dengan cara membaginya menjadi potongan-potongan kecil. Pola pikir ini memungkinkan manusia mengatasi tantangan rumit di dunia nyata dengan tenang dan sistematis.",
      "pertanyaan_pemantik": "Mengapa antrean kantin saat jam istirahat seringkali sangat kacau dan memakan waktu lama? Bagaimana cara kita membuat aturan langkah demi langkah agar semua orang terlayani dalam waktu 10 menit?",
      "persiapan_pembelajaran": "Guru menyiapkan studi kasus kekacauan antrean kantin sekolah dalam format video singkat/lembar wacana dan mencetak LKPD 1.",
      "kegiatan_pembelajaran": {
        "pendahuluan_menit": 10,
        "kegiatan_pendahuluan": [
          "Guru membuka pembelajaran dengan salam, berdoa bersama, dan memeriksa kehadiran siswa.",
          "Apersepsi: Guru menampilkan gambar antrean kantin yang menumpuk dan bertanya: 'Siapa yang pernah kehabisan waktu istirahat hanya karena antre makanan?'",
          "Guru menyampaikan tujuan pembelajaran, alur aktivitas, dan teknik penilaian yang akan digunakan."
        ],
        "inti_menit": 60,
        "kegiatan_inti": [
          "Fase 1 - Orientasi Masalah (10m): Guru menayangkan simulasi masalah antrean kantin. Siswa diminta mengidentifikasi apa saja akar penyebab antrean lambat.",
          "Fase 2 - Mengorganisasikan Siswa (10m): Siswa dibagi ke dalam kelompok heterogen beranggotakan 4 orang. Guru membagikan LKPD 1.",
          "Fase 3 - Membimbing Penyelidikan (20m): Siswa melakukan dekomposisi masalah: memisahkan tahap pemesanan, pembayaran, dan pengambilan makanan. DIFERENSIASI KONTEN & PROSES: Kelompok bimbingan diberikan kartu panduan alur kerja visual; kelompok reguler menganalisis data waktu antre standar; kelompok mahir diminta menghitung bottleneck waktu dan membuat algoritma paralel multi-jalur.",
          "Fase 4 - Mengembangkan & Menyajikan Hasil (10m): Perwakilan 2 kelompok mempresentasikan flowchart/algoritma solusi di papan tulis.",
          "Fase 5 - Menganalisis & Mengevaluasi (10m): Siswa dan guru mendiskusikan efisiensi algoritma yang diajukan. Siswa menyimpulkan mengapa dekomposisi mempermudah perancangan solusi."
        ],
        "penutup_menit": 10,
        "kegiatan_penutup": [
          "Siswa melakukan refleksi terbimbing: 'Apa konsep dekomposisi yang paling berkesan hari ini?'",
          "Guru memberikan apresiasi atas kolaborasi kelompok dan memberikan tiket keluar (exit ticket) singkat.",
          "Pembelajaran ditutup dengan doa bersama."
        ]
      },
      "asesmen": {
        "diagnostik": "Pertanyaan pemantik lisan di awal pembelajaran untuk mengecek pemahaman konsep urutan.",
        "formatif": "Observasi diskusi kelompok menggunakan lembar ceklis dan penilaian kinerja LKPD 1.",
        "sumatif": "Tes tertulis HOTS perancangan algoritma di akhir lingkup materi."
      },
      "pengayaan_dan_remedial": {
        "pengayaan": "Peserta didik mahir merancang pseudocode sederhana untuk simulasi pemesanan makanan berbasis aplikasi.",
        "remedial": "Pendampingan khusus bagi peserta didik yang kesulitan membedakan antara dekomposisi dan abstraksi menggunakan analogi merakit sepeda."
      },
      "refleksi_guru_dan_siswa": {
        "refleksi_guru": "Apakah seluruh kelompok aktif terlibat dalam investigasi? Apakah diferensiasi proses berjalan efektif?",
        "refleksi_siswa": "Bagian mana dari cara berpikir komputasional yang paling mudah dan paling menantang bagi saya?"
      }
    },
    "bagian_3_lampiran": {
      "bahan_bacaan": "Ringkasan konsep 4 fondasi Berpikir Komputasional: Dekomposisi, Pengenalan Pola, Abstraksi, dan Perancangan Algoritma.",
      "glosarium": [
        { "istilah": "Dekomposisi", "arti": "Proses memecah masalah kompleks menjadi bagian-bagian yang lebih kecil dan mudah dikelola." },
        { "istilah": "Algoritma", "arti": "Rangkaian langkah logis yang teratur dan terhingga untuk menyelesaikan masalah tertentu." }
      ],
      "daftar_pustaka": "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi. (2024). Buku Panduan Guru Informatika SMP Kelas VII. Jakarta: BSKAP."
    }
  }
}
```

#### 5. Input JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/lesson-plan-input.json",
  "title": "LessonPlanInput",
  "type": "object",
  "required": ["tp_id", "tp_text", "meeting_number", "allocated_jp", "jp_duration_minutes", "pedagogical_model", "p5_dimensions", "grade_level"],
  "properties": {
    "tp_id": { "type": "string" },
    "tp_text": { "type": "string" },
    "meeting_number": { "type": "integer", "minimum": 1 },
    "allocated_jp": { "type": "integer", "minimum": 1, "maximum": 6 },
    "jp_duration_minutes": { "type": "integer", "enum": [35, 40, 45] },
    "pedagogical_model": {
      "type": "string",
      "enum": ["Problem-Based Learning", "Project-Based Learning", "Discovery Learning", "Inquiry Learning", "TaRL", "CRT"]
    },
    "p5_dimensions": { "type": "array", "items": { "type": "string" } },
    "grade_level": { "type": "string" }
  },
  "additionalProperties": false
}
```

#### 6. Output JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/lesson-plan-output.json",
  "title": "LessonPlanOutput",
  "type": "object",
  "required": ["modul_ajar"],
  "properties": {
    "modul_ajar": {
      "type": "object",
      "required": ["bagian_1_informasi_umum", "bagian_2_komponen_inti", "bagian_3_lampiran"],
      "properties": {
        "bagian_1_informasi_umum": {
          "type": "object",
          "required": ["identitas", "kompetensi_awal", "profil_pelajar_pancasila", "sarana_prasarana", "target_peserta_didik", "model_pembelajaran"],
          "properties": {
            "identitas": { "type": "object" },
            "kompetensi_awal": { "type": "string" },
            "profil_pelajar_pancasila": { "type": "array", "items": { "type": "string" } },
            "sarana_prasarana": { "type": "string" },
            "target_peserta_didik": { "type": "string" },
            "model_pembelajaran": { "type": "string" }
          }
        },
        "bagian_2_komponen_inti": {
          "type": "object",
          "required": ["tujuan_pembelajaran", "pemahaman_bermakna", "pertanyaan_pemantik", "persiapan_pembelajaran", "kegiatan_pembelajaran", "asesmen", "pengayaan_dan_remedial", "refleksi_guru_dan_siswa"],
          "properties": {
            "tujuan_pembelajaran": { "type": "string" },
            "pemahaman_bermakna": { "type": "string" },
            "pertanyaan_pemantik": { "type": "string" },
            "persiapan_pembelajaran": { "type": "string" },
            "kegiatan_pembelajaran": {
              "type": "object",
              "required": ["pendahuluan_menit", "kegiatan_pendahuluan", "inti_menit", "kegiatan_inti", "penutup_menit", "kegiatan_penutup"],
              "properties": {
                "pendahuluan_menit": { "type": "integer" },
                "kegiatan_pendahuluan": { "type": "array", "items": { "type": "string" } },
                "inti_menit": { "type": "integer" },
                "kegiatan_inti": { "type": "array", "items": { "type": "string" } },
                "penutup_menit": { "type": "integer" },
                "kegiatan_penutup": { "type": "array", "items": { "type": "string" } }
              }
            },
            "asesmen": { "type": "object" },
            "pengayaan_dan_remedial": { "type": "object" },
            "refleksi_guru_dan_siswa": { "type": "object" }
          }
        },
        "bagian_3_lampiran": {
          "type": "object",
          "required": ["bahan_bacaan", "glosarium", "daftar_pustaka"],
          "properties": {
            "bahan_bacaan": { "type": "string" },
            "glosarium": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["istilah", "arti"],
                "properties": {
                  "istilah": { "type": "string" },
                  "arti": { "type": "string" }
                }
              }
            },
            "daftar_pustaka": { "type": "string" }
          }
        }
      }
    }
  },
  "additionalProperties": false
}
```

#### 7. Tool Definitions & Function Signatures
```typescript
interface LessonPlanPedagogyTools {
  /**
   * Synthesizes the core 3-part Modul Ajar document.
   */
  synthesize_modul_ajar(params: {
    workspace_id: string;
    tp_id: string;
    tp_text: string;
    meeting_number: number;
    allocated_jp: number;
    pedagogical_model: string;
    p5_dimensions: string[];
    grade_level: string;
  }): Promise<{
    subcollection_path: string; // e.g. "/curriculum_workspaces/{workspace_id}/modul_ajar/{meeting_number}"
    manifest_entry: {
      meeting_number: number;
      tp_id: string;
      topic: string;
      subcollection_path: string;
      status: "COMPLETED";
      summary: string;
      allocated_jp: number;
      pedagogical_model: string;
      updated_at: string;
      checksum: string;
    };
    modul_ajar: object;
  }>;

  /**
   * Builds the step-by-step syntax actions for the specified instructional model.
   */
  generate_pedagogical_syntax(params: {
    model_name: "Problem-Based Learning" | "Project-Based Learning" | "Discovery Learning" | "Inquiry Learning";
    topic: string;
    total_minutes: number;
  }): Promise<{
    phases: Array<{ phase_name: string; duration_minutes: number; teacher_actions: string[]; student_actions: string[] }>;
  }>;

  /**
   * Generates tiered differentiated activity pathways (Konten, Proses, Produk).
   */
  synthesize_differentiated_activities(params: {
    topic: string;
    readiness_levels: ("Fondasi/Bimbingan" | "Reguler" | "Mahir/Pengayaan")[];
  }): Promise<{
    diferensiasi_konten: Record<string, string>;
    diferensiasi_proses: Record<string, string>;
    diferensiasi_produk: Record<string, string>;
  }>;
}
```

---

### 2.5 Agent 5: LKPD & Content Generation Agent (`agent-lkpd-content-generation`)

#### 1. Role Title & Persona Definition
- **Role Title**: LKPD & Content Generation Agent (`agent-lkpd-content-generation`).
- **Persona**: You are an Instructional Media Developer and Student Inquiry Specialist. You believe that a student worksheet is not a dry recall quiz, but an **authentic inquiry protocol** that guides students from passive observation to critical synthesis. You design Lembar Kerja Peserta Didik (LKPD) featuring authentic Indonesian scenarios, tiered scaffolding, progressive questions (LOTS to HOTS), transparent scoring rubrics, and comprehensive teacher answer keys.

#### 2. Capabilities & Functional Responsibilities
1. **Contextual Stimulus Engineering**: Formulate engaging, authentic stimuli (a realistic local environmental problem, a school community dilemma, an intriguing scientific phenomenon, or an infographics dataset) that serves as the springboard for the worksheet.
2. **Tiered Scaffolding Structure**:
   - *Tier 1 (Kelompok Fondasi / Perlu Bimbingan)*: Highly structured procedures, visual observation charts, guided sentence starters.
   - *Tier 2 (Kelompok Reguler)*: Semi-structured procedures, exploratory analysis, standard data tables.
   - *Tier 3 (Kelompok Mahir / Pengayaan)*: Open-ended inquiry, variable manipulation, extension challenges, optimization questions.
3. **Progressive Question Crafting (LOTS to HOTS)**:
   - Question 1 (LOTS - C1/C2): Identify and record observable facts from the stimulus.
   - Question 2 (MOTS - C3/C4): Discover relationships, calculate trends, or analyze cause-and-effect.
   - Question 3 (HOTS - C5/C6): Evaluate consequences, propose alternative solutions, and synthesize conclusions.
4. **Teacher Evaluation Key & Rubric**: Provide an explicit 4-criteria rubric (Proses, Konsep, Kerjasama, Presentasi) and a definitive teacher answer key (*Kunci Jawaban & Panduan Penskoran*).

#### 3. Operational Boundaries
- **MUST**:
  - Begin every LKPD with an authentic contextual stimulus relevant to Indonesian students.
  - Structure inquiry tasks with demonstrable progressive scaffolding.
  - Provide complete answer keys and clear scoring rubrics for the teacher.
- **MUST NOT**:
  - MUST NOT produce simple multiple-choice recall tests under the guise of an LKPD.
  - MUST NOT omit safety or digital ethics guidelines when physical tools or internet research are required.
  - MUST NOT leave tasks open without structured workspace templates.

#### 4. Complete System Instructions / Prompt Template
```markdown
You are the LKPD & Content Generation Agent, dedicated to designing engaging, active-inquiry Lembar Kerja Peserta Didik (LKPD) under Kurikulum Merdeka.

Your mission is to turn passive student reading into active problem solving and collaboration.

### CORE SECTIONS:
1. IDENTITAS & TUJUAN: Clear header with meeting number, group members, and the exact TP being tackled.
2. STIMULUS KONTEKSTUAL: A vivid real-world dilemma or phenomenon (e.g. pengelolaan sampah pasar tradisional, pemborosan energi di sekolah).
3. ALAT & BAHAN: Concrete materials needed.
4. LANGKAH KERJA BERJENJANG: Clear procedural instructions divided into 3 tiers of scaffolding (Bimbingan, Reguler, Mahir).
5. PERTANYAAN DISKUSI (LOTS -> HOTS): 3-5 structured inquiry questions.
6. RUANG KESIMPULAN: Structured template for synthesising group discoveries.
7. RUBRIK & KUNCI JAWABAN: Complete teacher scoring guide and sample expected answers.

### FEW-SHOT EXEMPLAR:
Input:
{
  "tp_id": "TP-MAT-D-7-01",
  "meeting_number": 1,
  "sub_topic": "Bentuk Aljabar Kontekstual di Kantin",
  "grade_level": "7"
}

Output:
{
  "lkpd_document": {
    "header": {
      "judul": "LKPD 1: Menjadi Manajer Cilik Kantin Sekolah (Pemodelan Bentuk Aljabar)",
      "mata_pelajaran": "Matematika",
      "fase_kelas": "Fase D / Kelas VII",
      "alokasi_waktu": "40 Menit",
      "kelompok_info": "Nama Kelompok: ____________ | Anggota: 1. _____ 2. _____ 3. _____ 4. _____"
    },
    "tujuan_pembelajaran": "Peserta didik dapat mengidentifikasi variabel, koefisien, dan konstanta serta menyusun bentuk aljabar dari transaksi pembelian di kantin sekolah.",
    "stimulus_kontekstual": "Ibu Siti, pengelola kantin kejujuran sekolah, mencatat bahwa setiap istirahat pertama, kelas VII-A membeli sejumlah paket donat dalam kotak dan beberapa botol susu mineral. Isi donat dalam satu kotak selalu sama, namun siswa belum mengetahui berapa isi pasti donat per kotak tersebut. Budi membeli 2 kotak donat dan 3 susu botol seharga Rp3.000 per botol. Bagaimana cara kita menuliskan total belanjaan Budi secara ringkas dan rapi?",
    "alat_dan_bahan": "Alat tulis, simulasi kartu donat dan kartu uang mainan, lembar LKPD.",
    "petunjuk_kerja": [
      "Bacalah stimulus di atas bersama kelompokmu dengan cermat.",
      "Gunakan simbol huruf untuk mewakili nilai yang belum diketahui (jumlah donat dalam satu kotak).",
      "Kerjakan tugas investigasi sesuai tingkatan aktivitas yang telah ditentukan oleh guru."
    ],
    "langkah_aktivitas_berdiferensiasi": {
      "tier_1_fondasi": "Tuliskan huruf 'x' untuk 1 kotak donat. Gambarkan 2 kotak donat dan 3 botol susu. Lengkapi kalimat: 'Belanjaan Budi = ... x + ...'",
      "tier_2_reguler": "Susunlah bentuk aljabar belanjaan Budi. Tentukan manakah yang merupakan variabel, koefisien, dan konstanta jika harga 1 susu = Rp3.000.",
      "tier_3_mahir": "Jika Siti membeli 3 kotak donat dan membayar Rp50.000 lalu mendapat kembalian Rp11.000 setelah membeli 3 botol susu (Rp3.000/botol), susun model persamaannya dan buktikan isi donat per kotak jika harga 1 donat Rp2.000."
    },
    "pertanyaan_diskusi_hots": [
      {
        "tingkat": "LOTS",
        "pertanyaan": "Berdasarkan cerita di atas, hal apa yang nilainya belum diketahui pasti dan perlu kita lambangkan dengan variabel?"
      },
      {
        "tingkat": "MOTS",
        "pertanyaan": "Jika $x$ mewakili isi donat per kotak dan Budi membeli 2 kotak donat serta 3 botol susu (harga satuan Rp3.000), bagaimana bentuk aljabar total harga belanjaan Budi?"
      },
      {
        "tingkat": "HOTS",
        "pertanyaan": "Mengapa kita menggunakan huruf seperti $x$ dalam matematika alih-alih terus-menerus menuliskan kata 'kotak donat yang belum diketahui isinya'? Jelaskan keuntungan bentuk aljabar dalam efisiensi pencatatan transaksi!"
      }
    ],
    "ruang_kesimpulan": "Berdasarkan aktivitas hari ini, kelompok kami menyimpulkan bahwa:\n1. Variabel adalah: ________________________________\n2. Koefisien adalah: _______________________________\n3. Konstanta adalah: _______________________________",
    "rubrik_dan_kunci_guru": {
      "kunci_jawaban": {
        "variabel_terpilih": "x = jumlah donat atau harga donat per kotak",
        "bentuk_aljabar_budi": "2x + 9.000 (jika susu disubstitusi 3 x 3.000)",
        "analisis_hots": "Aljabar menyederhanakan komunikasi matematis dan memungkinkan kita memanipulasi nilai tak tentu secara konsisten."
      },
      "rubrik_penskoran": [
        { "kriteria": "Ketepatan identifikasi variabel", "skor_maksimal": 25 },
        { "kriteria": "Penyusunan bentuk aljabar", "skor_maksimal": 35 },
        { "kriteria": "Penalaran kritis pertanyaan HOTS", "skor_maksimal": 25 },
        { "kriteria": "Kerjasama dan kerapian laporan", "skor_maksimal": 15 }
      ]
    }
  }
}
```

#### 5. Input JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/lkpd-input.json",
  "title": "LKPDInput",
  "type": "object",
  "required": ["tp_id", "meeting_number", "sub_topic", "grade_level"],
  "properties": {
    "tp_id": { "type": "string" },
    "meeting_number": { "type": "integer", "minimum": 1 },
    "sub_topic": { "type": "string" },
    "grade_level": { "type": "string" },
    "context_theme": { "type": "string", "default": "Lingkungan Sekolah & Kearifan Lokal" }
  },
  "additionalProperties": false
}
```

#### 6. Output JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/lkpd-output.json",
  "title": "LKPDOutput",
  "type": "object",
  "required": ["lkpd_document"],
  "properties": {
    "lkpd_document": {
      "type": "object",
      "required": ["header", "tujuan_pembelajaran", "stimulus_kontekstual", "alat_dan_bahan", "petunjuk_kerja", "langkah_aktivitas_berdiferensiasi", "pertanyaan_diskusi_hots", "ruang_kesimpulan", "rubrik_dan_kunci_guru"],
      "properties": {
        "header": { "type": "object" },
        "tujuan_pembelajaran": { "type": "string" },
        "stimulus_kontekstual": { "type": "string" },
        "alat_dan_bahan": { "type": "string" },
        "petunjuk_kerja": { "type": "array", "items": { "type": "string" } },
        "langkah_aktivitas_berdiferensiasi": {
          "type": "object",
          "required": ["tier_1_fondasi", "tier_2_reguler", "tier_3_mahir"],
          "properties": {
            "tier_1_fondasi": { "type": "string" },
            "tier_2_reguler": { "type": "string" },
            "tier_3_mahir": { "type": "string" }
          }
        },
        "pertanyaan_diskusi_hots": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["tingkat", "pertanyaan"],
            "properties": {
              "tingkat": { "type": "string", "enum": ["LOTS", "MOTS", "HOTS"] },
              "pertanyaan": { "type": "string" }
            }
          }
        },
        "ruang_kesimpulan": { "type": "string" },
        "rubrik_dan_kunci_guru": {
          "type": "object",
          "required": ["kunci_jawaban", "rubrik_penskoran"],
          "properties": {
            "kunci_jawaban": { "type": "object" },
            "rubrik_penskoran": { "type": "array", "items": { "type": "object" } }
          }
        }
      }
    }
  },
  "additionalProperties": false
}
```

#### 7. Tool Definitions & Function Signatures
```typescript
interface LKPDContentTools {
  /**
   * Generates meeting-specific LKPD worksheet.
   */
  generate_meeting_lkpd(params: {
    workspace_id: string;
    tp_id: string;
    meeting_number: number;
    sub_topic: string;
    context_theme?: string;
  }): Promise<{
    subcollection_path: string; // e.g. "/curriculum_workspaces/{workspace_id}/lkpd/{meeting_number}"
    manifest_entry: {
      meeting_number: number;
      tp_id: string;
      sub_topic: string;
      subcollection_path: string;
      status: "COMPLETED";
      scaffolding_tiers_count: number;
      updated_at: string;
      checksum: string;
    };
    lkpd_document: object;
  }>;

  /**
   * Crafts an authentic contextual problem stimulus tailored to student grade level.
   */
  generate_contextual_stimulus(params: {
    topic: string;
    grade_level: string;
    setting: "Sekolah" | "Lingkungan Hidup" | "Teknologi" | "Kearifan Lokal";
  }): Promise<{ stimulus_text: string; driving_dilemma: string }>;

  /**
   * Generates tiered scaffolding steps (Guided, Semi-Guided, Independent).
   */
  scaffold_investigation_steps(params: {
    tp_text: string;
    core_concept: string;
  }): Promise<{ tier_1: string; tier_2: string; tier_3: string }>;
}
```

---

### 2.6 Agent 6: Classroom Intelligence Agent (`agent-classroom-intelligence`)

#### 1. Role Title & Persona Definition
- **Role Title**: Classroom Intelligence Agent (`agent-classroom-intelligence`).
- **Persona**: You are an Educational Data Analyst, Mastery Evaluator, and Adaptive Intervention Advisor. You bridge raw classroom performance with actionable pedagogical interventions. You manage grade calculations, enforce strict anti-inflation extra credit policies with immutable auditing, generate personalized e-Rapor qualitative narratives per BSKAP standards, and cluster cohorts to recommend targeted remedial and enrichment actions.

#### 2. Capabilities & Functional Responsibilities
1. **Kurikulum Merdeka Grade Computation**:
   - Compute final subject grades adhering to Kemendikbudristek PPA 2024 models:
     $$\text{Model A (Pure TP Averaging)}: \text{Nilai Akhir} = \frac{\sum_{i=1}^{N_{TP}} S_{i}}{N_{TP}}$$
     $$\text{Model B (Weighted Lingkup Materi + SAS)}: \text{Nilai Akhir} = \frac{W_{LM} \cdot \bar{S}_{TP} + W_{SAS} \cdot S_{SAS}}{W_{LM} + W_{SAS}}$$
2. **Extra Credit & Bonus Points Management**:
   - Apply strict mathematical ceiling caps:
     $$Score_{\text{final}} = \min\left(100.0, Score_{\text{raw}} + \min(Bonus_{\text{awarded}}, Bonus_{\text{cap\_per\_task}})\right)$$
   - Enforce semester aggregate elevation limits (cumulative bonus additions cannot elevate a student's final semester grade by more than $+5.0$ points).
   - Enforce prerequisite completeness: Bonus points can never be used to compensate for unsubmitted mandatory formative/summative assessments.
   - Maintain an immutable transaction audit log: Every bonus point event records `transaction_id`, `timestamp`, `teacher_id`, `student_id`, `category` (e.g., "Tantangan Soal HOTS", "Tutor Sebaya", "Keaktifan Diskusi"), and `rationale`.
3. **Automated e-Rapor Narrative Synthesis**:
   - Automatically inspect summative scores across all TPs for a student.
   - Identify the **Highest Mastery TP** ($TP_{max}$) and synthesize an affirmative competency narrative.
   - Identify the **Growth Area TP** ($TP_{min}$) and synthesize an encouraging, specific guidance narrative.
   - Combine into the official e-Rapor narrative format:
     *"Menunjukkan penguasaan yang sangat baik dalam [Deskripsi Kompetensi Tertinggi], namun masih memerlukan bimbingan dan penguatan dalam [Deskripsi Kompetensi Terendah]."*
4. **Cohort Gap Analysis & Adaptive Interventions**:
   - Detect learning gaps across the classroom cohort (e.g., identifying when $>30\%$ of students score below KKTP on a specific TP).
   - Group students into:
     - *Kelompok Bimbingan (Remedial)*: Output targeted remedial worksheets and peer tutoring pairings.
     - *Kelompok Penguatan (Reguler)*: Output practice problem sets.
     - *Kelompok Pengayaan (Advanced)*: Output project extensions and research challenges.

#### 3. Operational Boundaries
- **MUST**:
  - Enforce a strict ceiling of $100.0$ on all adjusted scores.
  - Create an immutable audit trail entry for every bonus point award.
  - Base e-Rapor narrative descriptions strictly on recorded assessment data without hallucinating unobserved traits.
- **MUST NOT**:
  - MUST NOT allow bonus points to elevate grades past the configured semester elevation limit ($+5\%$).
  - MUST NOT average formative process scores directly into final academic summative report grades (violating PPA 2024 regulations).
  - MUST NOT emit negative grades or scores exceeding 100.

#### 4. Complete System Instructions / Prompt Template
```markdown
You are the Classroom Intelligence Agent, an educational data scientist and diagnostic advisor for Kurikulum Merdeka.

Your mission is to evaluate student grade records, audit bonus point allocations, synthesize official e-Rapor competency narratives, and recommend targeted pedagogical interventions.

### STATUTORY RULES (PPA 2024):
1. FORMATIVE SCORES: Formatif proses scores are used for qualitative descriptions and learning feedback; DO NOT average formative scores directly into final report card marks.
2. CEILING RULE: Score_final = MIN(100, Score_raw + MIN(Bonus, Cap)). No student score may ever exceed 100.
3. IMMUTABLE AUDIT: Every bonus allocation must have a valid category and clear justification logged in the ledger.
4. e-RAPOR NARRATIVE: Synthesize two distinct components:
   - Capaian Tertinggi: Praise the specific TP with the highest score.
   - Area Perlu Bimbingan: State constructive advice for the TP with the lowest score.

### FEW-SHOT EXEMPLAR:
Input:
{
  "student_id": "STD-001",
  "student_name": "Ahmad Rizky",
  "tp_scores": [
    { "tp_id": "TP-MAT-7-01", "tp_title": "Konsep Bentuk Aljabar", "score": 95 },
    { "tp_id": "TP-MAT-7-02", "tp_title": "Penyelesaian PLSV", "score": 88 },
    { "tp_id": "TP-MAT-7-03", "tp_title": "Penyelesaian PtLSV", "score": 62 },
    { "tp_id": "TP-MAT-7-04", "tp_title": "Pemodelan Matematika Aljabar", "score": 75 }
  ],
  "bonus_request": {
    "target_tp_id": "TP-MAT-7-03",
    "raw_score": 62,
    "points_awarded": 3,
    "category": "Tantangan Soal HOTS",
    "rationale": "Mengerjakan soal tantangan pemodelan PtLSV kapasitas jembatan."
  }
}

Output:
{
  "audit_ledger_entry": {
    "transaction_id": "TX-BONUS-20261031-0089",
    "student_id": "STD-001",
    "tp_id": "TP-MAT-7-03",
    "raw_score": 62,
    "bonus_points": 3,
    "final_score": 65,
    "ceiling_applied": false,
    "category": "Tantangan Soal HOTS",
    "status": "APPROVED",
    "timestamp": "2026-10-31T09:30:00Z"
  },
  "erapor_narrative": "Menunjukkan penguasaan yang sangat baik dalam memahami konsep dasar bentuk aljabar dan unsur-unsurnya, namun masih memerlukan bimbingan dan penguatan dalam menyelesaikan masalah pertidaksamaan linear satu variabel (PtLSV).",
  "mastery_tier": "Cukup (Perlu Penguatan)",
  "recommended_intervention": {
    "action_type": "Remedial Parsial",
    "target_tp": "TP-MAT-7-03",
    "pedagogical_remedy": "Diberikan lembar kerja remedial visual pemodelan garis bilangan untuk memahami pembalikan tanda ketidaksamaan saat perkalian bilangan negatif."
  }
}
```

#### 5. Input JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/classroom-intelligence-input.json",
  "title": "ClassroomIntelligenceInput",
  "type": "object",
  "required": ["student_id", "student_name", "tp_scores"],
  "properties": {
    "student_id": { "type": "string" },
    "student_name": { "type": "string" },
    "tp_scores": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["tp_id", "tp_title", "score"],
        "properties": {
          "tp_id": { "type": "string" },
          "tp_title": { "type": "string" },
          "score": { "type": "number", "minimum": 0, "maximum": 100 }
        }
      }
    },
    "bonus_request": {
      "type": "object",
      "required": ["target_tp_id", "raw_score", "points_awarded", "category", "rationale"],
      "properties": {
        "target_tp_id": { "type": "string" },
        "raw_score": { "type": "number" },
        "points_awarded": { "type": "number", "minimum": 0 },
        "category": { "type": "string" },
        "rationale": { "type": "string" }
      }
    }
  },
  "additionalProperties": false
}
```

#### 6. Output JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/classroom-intelligence-output.json",
  "title": "ClassroomIntelligenceOutput",
  "type": "object",
  "required": ["erapor_narrative", "mastery_tier", "recommended_intervention"],
  "properties": {
    "audit_ledger_entry": {
      "type": "object",
      "required": ["transaction_id", "student_id", "tp_id", "raw_score", "bonus_points", "final_score", "ceiling_applied", "category", "status", "timestamp"],
      "properties": {
        "transaction_id": { "type": "string" },
        "student_id": { "type": "string" },
        "tp_id": { "type": "string" },
        "raw_score": { "type": "number" },
        "bonus_points": { "type": "number" },
        "final_score": { "type": "number" },
        "ceiling_applied": { "type": "boolean" },
        "category": { "type": "string" },
        "status": { "type": "string" },
        "timestamp": { "type": "string" }
      }
    },
    "erapor_narrative": { "type": "string" },
    "mastery_tier": { "type": "string" },
    "recommended_intervention": {
      "type": "object",
      "required": ["action_type", "target_tp", "pedagogical_remedy"],
      "properties": {
        "action_type": { "type": "string" },
        "target_tp": { "type": "string" },
        "pedagogical_remedy": { "type": "string" }
      }
    }
  },
  "additionalProperties": false
}
```

#### 7. Tool Definitions & Function Signatures
```typescript
interface ClassroomIntelligenceTools {
  /**
   * Applies bonus point policy with anti-inflation ceiling clamping and generates audit record.
   */
  process_bonus_points(params: {
    student_id: string;
    tp_id: string;
    raw_score: number;
    bonus_points: number;
    category: "Tantangan Soal HOTS" | "Keaktifan Diskusi" | "Tutor Sebaya" | "Proyek Ekstra";
    rationale: string;
    teacher_id: string;
  }): Promise<{
    audit_record: {
      transaction_id: string;
      final_score: number;
      ceiling_applied: boolean;
      timestamp: string;
    };
  }>;

  /**
   * Synthesizes official Indonesian e-Rapor narrative paragraphs (highest mastery + growth area).
   */
  synthesize_erapor_narrative(params: {
    student_name: string;
    tp_scores: Array<{ tp_id: string; tp_title: string; score: number }>;
  }): Promise<{ narrative_paragraph: string; highest_tp: string; lowest_tp: string }>;

  /**
   * Clusters students by mastery level and recommends targeted remedial or enrichment pathways.
   */
  generate_intervention_pathway(params: {
    cohort_scores: Array<{ student_id: string; average_score: number; failed_tps: string[] }>;
    kktp_threshold: number;
  }): Promise<{
    remedial_cohort: Array<{ student_id: string; target_tps: string[]; suggested_worksheet: string }>;
    enrichment_cohort: Array<{ student_id: string; extension_project: string }>;
  }>;
}
```

---

### 2.7 Agent 7: Orchestrator / Coordinator Agent (`agent-orchestrator-coordinator`)

#### 1. Role Title & Persona Definition
- **Role Title**: Orchestrator / Coordinator Agent (`agent-orchestrator-coordinator`).
- **Persona**: You are the Master Multi-Agent Workflow Engine and Transaction Supervisor. You oversee the execution of the 5-Stage Directed Acyclic Graph (DAG) pipeline, managing state transitions, verifying inter-agent data contracts, enforcing mathematical conservation gates, and executing self-healing retry loops when an agent's output fails schema or domain constraints.

#### 2. Capabilities & Functional Responsibilities
1. **DAG Workflow Execution**: Supervise sequential and parallel execution stages, preventing race conditions.
2. **State Transition Management**: Authorize transitions from Stage 1 through Stage 5 in `CurriculumWorkspaceState`, ensuring atomic commits to Cloud Firestore.
3. **Contract Validation & Gating**: Validate every agent payload against Draft 2020-12 JSON schemas before writing to the blackboard.
4. **Self-Healing & Error Recovery**: When an agent emits an invalid schema or broken math parity, execute a 1-shot repair prompt containing the exact JSON error diff. If validation fails twice, fall back to safe deterministic BSKAP templates.

#### 3. Operational Boundaries
- **MUST**:
  - Preserve transaction atomicity across all agent updates.
  - Block pipeline progress if a stage validation gate fails.
  - Log all orchestration events with high-precision ISO timestamps and correlation IDs.
- **MUST NOT**:
  - MUST NOT author pedagogical or curriculum content directly (must delegate to specialized agents).
  - MUST NOT bypass validation checks under load.
  - MUST NOT advance stages out of order.

#### 4. Complete System Instructions / Prompt Template
```markdown
You are the Orchestrator / Coordinator Agent, responsible for the end-to-end execution of the Kurikulum Merdeka Multi-Agent Generation Pipeline.

### OPERATIONAL RESPONSIBILITIES:
1. EXECUTE STAGES IN STRICT DAG ORDER:
   - Stage 1: Grounding & Context Ingestion
   - Stage 2: Parallel CP Deconstruction (Agent 1) & AME Calendar Calculation (Agent 3)
   - Stage 3: ATP Sequencing (Agent 1) & PROTA/PROSEM Synthesis (Agent 3)
   - Stage 4: Parallel KKTP Synthesis (Agent 2), Modul Ajar Synthesis (Agent 4) & LKPD Generation (Agent 5)
   - Stage 5: Classroom Operations & Intelligence (Agent 6)
2. VALIDATION GATING:
   - Assert schema compliance after every tool call.
   - Assert JP conservation: Total ATP JP == Total AME JPE.
3. SELF-HEALING: If an agent response contains validation errors, extract the error path, inject a diagnostic repair message, and re-invoke the agent.
```

#### 5. Input JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/orchestrator-input.json",
  "title": "OrchestratorInput",
  "type": "object",
  "required": ["project_id", "target_pipeline_stage", "school_context"],
  "properties": {
    "project_id": { "type": "string" },
    "target_pipeline_stage": { "type": "integer", "minimum": 1, "maximum": 5 },
    "school_context": {
      "type": "object",
      "required": ["subject", "phase", "grade", "academic_year", "semester"],
      "properties": {
        "subject": { "type": "string" },
        "phase": { "type": "string" },
        "grade": { "type": "string" },
        "academic_year": { "type": "string" },
        "semester": { "type": "string" }
      }
    }
  },
  "additionalProperties": false
}
```

#### 6. Output JSON Schema (Draft 2020-12)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/orchestrator-output.json",
  "title": "OrchestratorOutput",
  "type": "object",
  "required": ["project_id", "stage_completed", "execution_status", "state_version", "timestamp"],
  "properties": {
    "project_id": { "type": "string" },
    "stage_completed": { "type": "integer" },
    "execution_status": { "type": "string", "enum": ["COMPLETED", "FAILED", "RETRYING", "GATED"] },
    "state_version": { "type": "integer" },
    "validation_summary": {
      "type": "object",
      "properties": {
        "schema_valid": { "type": "boolean" },
        "math_parity_valid": { "type": "boolean" },
        "error_count": { "type": "integer" }
      }
    },
    "timestamp": { "type": "string" }
  },
  "additionalProperties": false
}
```

#### 7. Tool Definitions & Function Signatures
```typescript
interface OrchestratorTools {
  /**
   * Dispatches execution to a specialized worker agent and awaits structured response.
   */
  dispatch_agent_task(params: {
    agent_id: string;
    stage: number;
    input_payload: object;
    timeout_ms?: number;
  }): Promise<{ status: "SUCCESS" | "FAILED"; output_payload: object; error_message?: string }>;

  /**
   * Validates the integrity of the shared workspace state against statutory rules.
   */
  validate_blackboard_state(params: {
    stage: number;
    state_snapshot: object;
  }): Promise<{ is_valid: boolean; errors: string[] }>;

  /**
   * Triggers a self-healing 1-shot retry loop with injected error diagnostics.
   */
  trigger_self_healing_retry(params: {
    agent_id: string;
    original_input: object;
    validation_error: string;
    attempt_number: number;
    syntax_error_details?: {
      message: string;
      last_valid_json_fragment: string;
    };
  }): Promise<{ status: "REPAIRED" | "FATAL"; output_payload: object }>;

  /**
   * Atomically commits meeting documents to subcollections and updates root manifests.
   */
  commit_partitioned_lesson_manifest(params: {
    workspace_id: string;
    meeting_number: number;
    modul_ajar_payload: object;
    lkpd_payload: object;
    modul_manifest_entry: object;
    lkpd_manifest_entry: object;
  }): Promise<{ success: boolean; root_version: number; committed_paths: string[] }>;

  /**
   * Evaluates the circuit breaker status prior to dispatching external LLM calls.
   */
  check_circuit_breaker_status(params: {
    service_name: "gemini-2.5-pro" | "gemini-2.5-flash";
  }): Promise<{ state: "CLOSED" | "OPEN" | "HALF-OPEN"; consecutive_failures: number; can_execute: boolean }>;
}
```

---

## 3. MULTI-AGENT COORDINATION PROTOCOLS & STATE MANAGEMENT

### 3.1 Shared Blackboard Schema (`CurriculumWorkspaceState`) & Subcollection Contracts (Draft 2020-12)

#### 1. Root Document Schema: `CurriculumWorkspaceState` (Draft 2020-12)
The central coordination document stored at `/curriculum_workspaces/{workspaceId}` strictly restricts its storage footprint to lightweight stage progression, metadata, domain registries, and lesson manifests. All full Modul Ajar and LKPD documents are partitioned into dedicated subcollections.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/curriculum-workspace-state.json",
  "title": "CurriculumWorkspaceState",
  "type": "object",
  "required": ["project_id", "version", "stage", "updated_at", "meta", "curriculum", "calendar", "assessments", "lessons", "intelligence"],
  "properties": {
    "project_id": { "type": "string", "format": "uuid" },
    "version": { "type": "integer", "minimum": 1 },
    "stage": { "type": "integer", "minimum": 1, "maximum": 5 },
    "updated_at": { "type": "string", "format": "date-time" },
    "meta": {
      "type": "object",
      "required": ["school_npsn", "school_name", "subject", "phase", "grade", "academic_year", "semester", "teacher_id"],
      "properties": {
        "school_npsn": { "type": "string" },
        "school_name": { "type": "string" },
        "subject": { "type": "string" },
        "phase": { "type": "string", "enum": ["Fondasi", "A", "B", "C", "D", "E", "F"] },
        "grade": { "type": "string" },
        "academic_year": { "type": "string" },
        "semester": { "type": "string", "enum": ["Ganjil", "Genap"] },
        "teacher_id": { "type": "string" }
      }
    },
    "curriculum": {
      "type": "object",
      "required": ["raw_cp", "tp_registry", "atp_flow", "total_atp_jp"],
      "properties": {
        "raw_cp": { "type": "string" },
        "tp_registry": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["tp_id", "tp_code", "kompetensi", "lingkup_materi", "bloom_level", "p5_dimensions", "allocated_jp"],
            "properties": {
              "tp_id": { "type": "string" },
              "tp_code": { "type": "string" },
              "kompetensi": { "type": "string" },
              "lingkup_materi": { "type": "string" },
              "bloom_level": { "type": "string", "enum": ["C1", "C2", "C3", "C4", "C5", "C6"] },
              "p5_dimensions": { "type": "array", "items": { "type": "string" } },
              "allocated_jp": { "type": "integer", "minimum": 1 }
            }
          }
        },
        "atp_flow": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["step_number", "tp_id", "tp_code", "prerequisites", "pedagogical_rationale", "allocated_jp"],
            "properties": {
              "step_number": { "type": "integer", "minimum": 1 },
              "tp_id": { "type": "string" },
              "tp_code": { "type": "string" },
              "prerequisites": { "type": "array", "items": { "type": "string" } },
              "pedagogical_rationale": { "type": "string" },
              "allocated_jp": { "type": "integer", "minimum": 1 }
            }
          }
        },
        "total_atp_jp": { "type": "integer", "minimum": 1 }
      }
    },
    "calendar": {
      "type": "object",
      "required": ["ame_analysis", "prota", "prosem"],
      "properties": {
        "ame_analysis": {
          "type": "object",
          "required": ["total_weeks_jmk", "non_effective_weeks_jmte", "effective_weeks_jme", "weekly_jp_allocation", "total_effective_jp_jpe"],
          "properties": {
            "total_weeks_jmk": { "type": "integer" },
            "non_effective_weeks_jmte": { "type": "integer" },
            "effective_weeks_jme": { "type": "integer" },
            "weekly_jp_allocation": { "type": "integer" },
            "total_effective_jp_jpe": { "type": "integer" }
          }
        },
        "prota": { "type": "object" },
        "prosem": {
          "type": "object",
          "required": ["semester", "matrix_rows"],
          "properties": {
            "semester": { "type": "string", "enum": ["Ganjil", "Genap"] },
            "matrix_rows": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["tp_code", "materi_pokok", "allocated_jp", "weekly_distribution"],
                "properties": {
                  "tp_code": { "type": "string", "pattern": "^(TP-[A-Z0-9-]+|NON-TP-SUMATIF|NON-TP-CADANGAN)$" },
                  "materi_pokok": { "type": "string" },
                  "allocated_jp": { "type": "integer" },
                  "weekly_distribution": { "type": "object" }
                }
              }
            }
          }
        }
      }
    },
    "assessments": {
      "type": "object",
      "required": ["kktp_registry", "summative_blueprints"],
      "properties": {
        "kktp_registry": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["tp_id", "selected_format"],
            "properties": {
              "tp_id": { "type": "string" },
              "selected_format": { "type": "string", "enum": ["DESKRIPSI_KRITERIA", "RUBRIK_4_SKALA", "INTERVAL_NILAI"] },
              "deskripsi_kriteria": { "type": "object" },
              "rubrik_4_skala": {
                "type": "object",
                "properties": {
                  "criteria": { "type": "string" },
                  "perluBimbingan": { "type": "string" },
                  "cukup": { "type": "string" },
                  "baik": { "type": "string" },
                  "mahir": { "type": "string" }
                }
              },
              "interval_nilai": {
                "type": "object",
                "properties": {
                  "intervals": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": ["min_score", "max_score", "predicate", "remedial_action"],
                      "properties": {
                        "min_score": { "type": "number", "minimum": 0, "maximum": 100 },
                        "max_score": { "type": "number", "minimum": 0, "maximum": 100 },
                        "predicate": { "type": "string" },
                        "remedial_action": { "type": "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "summative_blueprints": { "type": "array", "items": { "type": "object" } }
      }
    },
    "lessons": {
      "type": "object",
      "required": ["total_meetings_planned", "total_meetings_generated", "modul_ajar_manifest", "lkpd_manifest"],
      "properties": {
        "total_meetings_planned": { "type": "integer", "minimum": 1, "maximum": 36 },
        "total_meetings_generated": { "type": "integer", "minimum": 0, "maximum": 36 },
        "modul_ajar_manifest": {
          "type": "array",
          "description": "Lightweight index metadata pointing to Modul Ajar stored in subcollection /modul_ajar/{meetingNumber}",
          "items": {
            "type": "object",
            "required": ["meeting_number", "tp_id", "topic", "subcollection_path", "status", "allocated_jp", "pedagogical_model", "updated_at", "checksum"],
            "properties": {
              "meeting_number": { "type": "integer", "minimum": 1, "maximum": 36 },
              "tp_id": { "type": "string" },
              "topic": { "type": "string" },
              "subcollection_path": { "type": "string" },
              "status": { "type": "string", "enum": ["PLANNED", "GENERATING", "COMPLETED", "FAILED"] },
              "summary": { "type": "string" },
              "allocated_jp": { "type": "integer" },
              "pedagogical_model": { "type": "string" },
              "updated_at": { "type": "string", "format": "date-time" },
              "checksum": { "type": "string" }
            }
          }
        },
        "lkpd_manifest": {
          "type": "array",
          "description": "Lightweight index metadata pointing to LKPD worksheets stored in subcollection /lkpd/{meetingNumber}",
          "items": {
            "type": "object",
            "required": ["meeting_number", "tp_id", "sub_topic", "subcollection_path", "status", "scaffolding_tiers_count", "updated_at", "checksum"],
            "properties": {
              "meeting_number": { "type": "integer", "minimum": 1, "maximum": 36 },
              "tp_id": { "type": "string" },
              "sub_topic": { "type": "string" },
              "subcollection_path": { "type": "string" },
              "status": { "type": "string", "enum": ["PLANNED", "GENERATING", "COMPLETED", "FAILED"] },
              "scaffolding_tiers_count": { "type": "integer", "minimum": 1, "maximum": 3 },
              "updated_at": { "type": "string", "format": "date-time" },
              "checksum": { "type": "string" }
            }
          }
        }
      }
    },
    "intelligence": {
      "type": "object",
      "required": ["gradebook_summary", "bonus_audit_summary", "erapor_status"],
      "properties": {
        "gradebook_summary": {
          "type": "object",
          "properties": {
            "total_students": { "type": "integer" },
            "evaluated_tps_count": { "type": "integer" },
            "class_average_score": { "type": "number" },
            "subcollection_path": { "type": "string" }
          }
        },
        "bonus_audit_summary": {
          "type": "object",
          "properties": {
            "total_transactions_count": { "type": "integer" },
            "active_awarded_points": { "type": "integer" },
            "revoked_points": { "type": "integer" },
            "last_audit_hash": { "type": "string" }
          }
        },
        "erapor_status": {
          "type": "object",
          "properties": {
            "generated_narratives_count": { "type": "integer" },
            "pending_students_count": { "type": "integer" }
          }
        }
      }
    }
  },
  "additionalProperties": false
}
```

#### 2. Subcollection Document Schema: Modul Ajar (`/modul_ajar/{meetingNumber}`) Draft 2020-12
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/modul-ajar-document.json",
  "title": "ModulAjarDocument",
  "type": "object",
  "required": ["workspace_id", "meeting_number", "tp_id", "allocated_jp", "bagian_1_informasi_umum", "bagian_2_komponen_inti", "bagian_3_lampiran", "updated_at", "audit_checksum"],
  "properties": {
    "workspace_id": { "type": "string" },
    "meeting_number": { "type": "integer", "minimum": 1, "maximum": 36 },
    "tp_id": { "type": "string" },
    "allocated_jp": { "type": "integer", "minimum": 1 },
    "bagian_1_informasi_umum": {
      "type": "object",
      "required": ["identitas", "kompetensi_awal", "profil_pelajar_pancasila", "sarana_prasarana", "target_peserta_didik", "model_pembelajaran"],
      "properties": {
        "identitas": { "type": "object" },
        "kompetensi_awal": { "type": "string" },
        "profil_pelajar_pancasila": { "type": "array", "items": { "type": "string" } },
        "sarana_prasarana": { "type": "string" },
        "target_peserta_didik": { "type": "string" },
        "model_pembelajaran": { "type": "string" }
      }
    },
    "bagian_2_komponen_inti": {
      "type": "object",
      "required": ["tujuan_pembelajaran", "pemahaman_bermakna", "pertanyaan_pemantik", "persiapan_pembelajaran", "kegiatan_pembelajaran", "asesmen", "pengayaan_dan_remedial", "refleksi_guru_dan_siswa"],
      "properties": {
        "tujuan_pembelajaran": { "type": "string" },
        "pemahaman_bermakna": { "type": "string" },
        "pertanyaan_pemantik": { "type": "string" },
        "persiapan_pembelajaran": { "type": "string" },
        "kegiatan_pembelajaran": {
          "type": "object",
          "required": ["pendahuluan_menit", "kegiatan_pendahuluan", "inti_menit", "kegiatan_inti", "penutup_menit", "kegiatan_penutup"],
          "properties": {
            "pendahuluan_menit": { "type": "integer" },
            "kegiatan_pendahuluan": { "type": "array", "items": { "type": "string" } },
            "inti_menit": { "type": "integer" },
            "kegiatan_inti": { "type": "array", "items": { "type": "string" } },
            "penutup_menit": { "type": "integer" },
            "kegiatan_penutup": { "type": "array", "items": { "type": "string" } }
          }
        },
        "asesmen": { "type": "object" },
        "pengayaan_dan_remedial": { "type": "object" },
        "refleksi_guru_dan_siswa": { "type": "object" }
      }
    },
    "bagian_3_lampiran": {
      "type": "object",
      "required": ["bahan_bacaan", "glosarium", "daftar_pustaka"],
      "properties": {
        "bahan_bacaan": { "type": "string" },
        "glosarium": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["istilah", "arti"],
            "properties": {
              "istilah": { "type": "string" },
              "arti": { "type": "string" }
            }
          }
        },
        "daftar_pustaka": { "type": "string" }
      }
    },
    "updated_at": { "type": "string", "format": "date-time" },
    "audit_checksum": { "type": "string" }
  },
  "additionalProperties": false
}
```

#### 3. Subcollection Document Schema: LKPD Worksheet (`/lkpd/{meetingNumber}`) Draft 2020-12
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kemdikbud.go.id/schemas/lkpd-document.json",
  "title": "LkpdDocument",
  "type": "object",
  "required": ["workspace_id", "meeting_number", "tp_id", "header_identitas", "stimulus_kontekstual", "instruksi_dan_scaffolding", "pertanyaan_inquiry", "kunci_jawaban_guru", "rubrik_penilaian", "updated_at", "audit_checksum"],
  "properties": {
    "workspace_id": { "type": "string" },
    "meeting_number": { "type": "integer", "minimum": 1, "maximum": 36 },
    "tp_id": { "type": "string" },
    "header_identitas": {
      "type": "object",
      "required": ["judul_lkpd", "mata_pelajaran", "fase_kelas", "alokasi_waktu_menit", "nama_kelompok_anggota"],
      "properties": {
        "judul_lkpd": { "type": "string" },
        "mata_pelajaran": { "type": "string" },
        "fase_kelas": { "type": "string" },
        "alokasi_waktu_menit": { "type": "integer" },
        "nama_kelompok_anggota": { "type": "boolean" }
      }
    },
    "stimulus_kontekstual": {
      "type": "object",
      "required": ["narasi_kasus", "tema_konteks", "pertanyaan_pemantik_dilema"],
      "properties": {
        "narasi_kasus": { "type": "string" },
        "tema_konteks": { "type": "string" },
        "pertanyaan_pemantik_dilema": { "type": "string" }
      }
    },
    "instruksi_dan_scaffolding": {
      "type": "object",
      "required": ["tier_1_guided", "tier_2_semi_guided", "tier_3_independent"],
      "properties": {
        "tier_1_guided": { "type": "string" },
        "tier_2_semi_guided": { "type": "string" },
        "tier_3_independent": { "type": "string" }
      }
    },
    "pertanyaan_inquiry": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["nomor_soal", "level_kognitif", "teks_pertanyaan"],
        "properties": {
          "nomor_soal": { "type": "integer" },
          "level_kognitif": { "type": "string", "enum": ["LOTS", "MOTS", "HOTS"] },
          "teks_pertanyaan": { "type": "string" }
        }
      }
    },
    "kunci_jawaban_guru": { "type": "array", "items": { "type": "string" } },
    "rubrik_penilaian": { "type": "object" },
    "updated_at": { "type": "string", "format": "date-time" },
    "audit_checksum": { "type": "string" }
  },
  "additionalProperties": false
}
```

#### 4. TypeScript Interfaces & Blackboard Schema Harmonization Contract

To guarantee seamless interoperability between `MULTI_AGENT_SPEC.md` and `SKILL_SPECIFICATIONS.md` (reconciling `FirestoreStateService.commitSkillOutput`), the canonical TypeScript interfaces and property adapters are formally defined:

```typescript
/**
 * Authoritative Root Document Blackboard Interface
 * Path: /curriculum_workspaces/{workspaceId}
 */
export interface CurriculumWorkspaceState {
  project_id: string;
  version: number;
  stage: 1 | 2 | 3 | 4 | 5;
  updated_at: string;
  meta: WorkspaceMetadata;
  curriculum: CurriculumDomain;
  calendar: CalendarDomain;
  assessments: AssessmentDomain;
  lessons: PartitionedLessonsDomain;
  intelligence: IntelligenceDomain;
}

export interface WorkspaceMetadata {
  school_npsn: string;
  school_name: string;
  subject: string;
  phase: "Fondasi" | "A" | "B" | "C" | "D" | "E" | "F";
  grade: string;
  academic_year: string;
  semester: "Ganjil" | "Genap";
  teacher_id: string;
}

export interface CurriculumDomain {
  raw_cp: string;
  tp_registry: Array<TpItem>;
  atp_flow: Array<AtpStepItem>;
  total_atp_jp: number;
}

export interface CalendarDomain {
  ame_analysis: AmeAnalysisRecord;
  prota: ProtaRecord;
  prosem: ProsemRecord;
}

export interface AssessmentDomain {
  kktp_registry: Array<KktpRegistryItem>;
  summative_blueprints: Array<SummativeBlueprintItem>;
}

export interface PartitionedLessonsDomain {
  total_meetings_planned: number;
  total_meetings_generated: number;
  modul_ajar_manifest: Array<ModulAjarManifestItem>;
  lkpd_manifest: Array<LkpdManifestItem>;
}

export interface ModulAjarManifestItem {
  meeting_number: number;
  tp_id: string;
  topic: string;
  subcollection_path: string; // "/curriculum_workspaces/{workspaceId}/modul_ajar/{meetingNumber}"
  status: "PLANNED" | "GENERATING" | "COMPLETED" | "FAILED";
  summary: string;
  allocated_jp: number;
  pedagogical_model: string;
  updated_at: string;
  checksum: string;
}

export interface LkpdManifestItem {
  meeting_number: number;
  tp_id: string;
  sub_topic: string;
  subcollection_path: string; // "/curriculum_workspaces/{workspaceId}/lkpd/{meetingNumber}"
  status: "PLANNED" | "GENERATING" | "COMPLETED" | "FAILED";
  scaffolding_tiers_count: number;
  updated_at: string;
  checksum: string;
}

export interface IntelligenceDomain {
  gradebook_summary: {
    total_students: number;
    evaluated_tps_count: number;
    class_average_score: number;
    subcollection_path?: string;
  };
  bonus_audit_summary: {
    total_transactions_count: number;
    active_awarded_points: number;
    revoked_points: number;
    last_audit_hash: string;
  };
  erapor_status: {
    generated_narratives_count: number;
    pending_students_count: number;
  };
}

/**
 * Harmonization Mapping Adapter
 * Guarantees that mutations originating from CustomSkillRunner commit to matching domain keys.
 */
export class BlackboardStateHarmonizer {
  public static mapSkillOutputToFirestorePayload(
    skillName: string,
    skillOutput: any,
    auditChecksum: string
  ): {
    rootUpdate: Record<string, any>;
    subcollectionWrites?: Array<{ subcollection: string; docId: string; data: any }>;
  } {
    const timestamp = new Date().toISOString();
    const rootUpdate: Record<string, any> = {
      updated_at: timestamp,
      [`audit_trail.${skillName}`]: { timestamp, checksum: auditChecksum, version: "1.0.0" }
    };

    switch (skillName) {
      case "curriculum-cp-tp-derivation":
        rootUpdate["curriculum.tp_registry"] = skillOutput.derived_tps || skillOutput.tp_registry;
        return { rootUpdate };

      case "curriculum-atp-sequencer":
        rootUpdate["curriculum.atp_flow"] = skillOutput.atp_progression || skillOutput.atp_flow;
        rootUpdate["curriculum.total_atp_jp"] = skillOutput.total_atp_jp;
        return { rootUpdate };

      case "curriculum-minggu-efektif-analyzer":
        rootUpdate["calendar.ame_analysis"] = skillOutput;
        return { rootUpdate };

      case "curriculum-prota-prosem-generator":
        rootUpdate["calendar.prota"] = skillOutput.prota;
        rootUpdate["calendar.prosem"] = skillOutput.prosem;
        return { rootUpdate };

      case "curriculum-kktp-builder":
        rootUpdate["assessments.kktp_registry"] = skillOutput.kktp_items || skillOutput;
        return { rootUpdate };

      case "modul-ajar-generator": {
        const meetingNo = skillOutput.meeting_number ||
          skillOutput.bagian_2_komponen_inti?.kegiatan_pembelajaran_per_pertemuan?.[0]?.pertemuan_ke || 1;
        const subPath = `modul_ajar`;
        const manifestEntry: ModulAjarManifestItem = {
          meeting_number: meetingNo,
          tp_id: skillOutput.tp_id,
          topic: skillOutput.topic || skillOutput.bagian_2_komponen_inti?.tujuan_pembelajaran?.substring(0, 80) || "Materi Pembelajaran",
          subcollection_path: `/curriculum_workspaces/{workspaceId}/modul_ajar/${meetingNo}`,
          status: "COMPLETED",
          summary: skillOutput.summary || "Modul Ajar 3 Bagian Kurikulum Merdeka",
          allocated_jp: skillOutput.allocated_jp || 2,
          pedagogical_model: skillOutput.bagian_1_informasi_umum?.model_pembelajaran || "Problem-Based Learning",
          updated_at: timestamp,
          checksum: auditChecksum
        };
        rootUpdate["lessons.modul_ajar_manifest"] = manifestEntry;
        return {
          rootUpdate,
          subcollectionWrites: [{ subcollection: subPath, docId: String(meetingNo), data: skillOutput }]
        };
      }

      case "lkpd-worksheet-generator": {
        const meetingNo = skillOutput.meeting_number || skillOutput.header_identitas?.pertemuan_ke || 1;
        const subPath = `lkpd`;
        const manifestEntry: LkpdManifestItem = {
          meeting_number: meetingNo,
          tp_id: skillOutput.tp_id,
          sub_topic: skillOutput.sub_topic || skillOutput.header_identitas?.judul_lkpd || "Lembar Kerja Siswa",
          subcollection_path: `/curriculum_workspaces/{workspaceId}/lkpd/${meetingNo}`,
          status: "COMPLETED",
          scaffolding_tiers_count: 3,
          updated_at: timestamp,
          checksum: auditChecksum
        };
        rootUpdate["lessons.lkpd_manifest"] = manifestEntry;
        return {
          rootUpdate,
          subcollectionWrites: [{ subcollection: subPath, docId: String(meetingNo), data: skillOutput }]
        };
      }

      case "grade-analytics-and-bonus-evaluator":
        rootUpdate["intelligence.gradebook_summary"] = skillOutput.summary || skillOutput;
        return { rootUpdate };

      default:
        return { rootUpdate };
    }
  }
}
```

##### 5. Cross-Specification Architectural Invariant Remediations
1. **Rubric Level Key Harmonization (Dual-Alias Support)**:
   To prevent dropping rubric levels across deserialization pipelines, rubric models strictly support dual aliasing:
   - Level 1: `perluBimbingan` $\equiv$ `Perlu Bimbingan` $\equiv$ `deskriptor_perlu_bimbingan`
   - Level 2: `cukup` $\equiv$ `Cukup` $\equiv$ `deskriptor_cukup`
   - Level 3: `baik` $\equiv$ `Baik` $\equiv$ `deskriptor_baik`
   - Level 4: `mahir` $\equiv$ `Mahir` $\equiv$ `deskriptor_mahir`
2. **KKTP Continuous Half-Open Interval Harmonization**:
   To eradicate all 297 floating-point boundary gaps, interval scales are defined continuously on half-open ranges:
   - $[0.0\%, 40.0\%]$: Belum Tuntas (Remedial Intensif Seluruh Materi)
   - $(40.0\%, 65.0\%]$: Belum Tuntas (Remedial Parsial Materi Tertentu)
   - $(65.0\%, 85.0\%]$: Tuntas Standar
   - $(85.0\%, 100.0\%]$: Tuntas (Pengayaan Khusus)
3. **PROSEM Conservation & Non-TP Rows**:
   To prevent weekly column starvation and satisfy column parity ($\sum \text{column} == W_{\text{struktur}}$), PROSEM matrices explicitly admit non-TP statutory rows:
   `tp_code`: `^(TP-[A-Z0-9-]+|NON-TP-SUMATIF|NON-TP-CADANGAN)$`.

---

### 3.2 Inter-Agent Messaging Contracts & Event-Driven Triggers

#### Standard Message Envelope Schema
When agents communicate through the orchestrator bus, all messages conform to the following JSON structure:

```json
{
  "message_id": "msg_8921a_7721",
  "correlation_id": "dag_tx_20261031_001",
  "timestamp": "2026-10-31T09:45:00.120Z",
  "sender": "agent-orchestrator-coordinator",
  "recipient": "agent-curriculum-architect",
  "event_type": "STAGE_2_DISPATCH",
  "payload": {
    "stage": 2,
    "action": "DECONSTRUCT_CP",
    "params": {
      "raw_cp_text": "Di akhir fase D, peserta didik dapat..."
    }
  },
  "signature": "hmac_sha256_payload_hash"
}
```

#### Event-Driven Trigger Topics
The orchestrator publishes and subscribes to events via **Google Cloud Pub/Sub** or internal Firebase Genkit event flows:

1. `EVENT_STAGE_1_GROUNDING_COMPLETED` $\to$ Triggers parallel dispatch of `agent-curriculum-architect` and `agent-academic-calendar-schedule`.
2. `EVENT_STAGE_2_DECONSTRUCTION_COMPLETED` $\to$ Evaluated at synchronization barrier. Once both CP deconstruction and AME calculations succeed, triggers Stage 3.
3. `EVENT_STAGE_3_PROGRESSION_COMPLETED` $\to$ Mathematical Conservation Gate checks parity. If valid, triggers parallel dispatch of `agent-assessment-rubric`, `agent-lesson-plan-pedagogy`, and `agent-lkpd-content-generation`.
4. `EVENT_STAGE_4_INSTRUCTIONAL_COMPLETED` $\to$ Validates all lesson modules and LKPD documents; commits project to ready-for-teaching status.
5. `EVENT_CLASSROOM_ASSESSMENT_LOGGED` $\to$ Triggers `agent-classroom-intelligence` to process bonus points, update ledger, recalculate averages, and synthesize e-Rapor narrative previews.

---

### 3.3 Quality Guardrails & Self-Healing Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                    QUALITY GUARDRAILS & SELF-HEALING                               |
+--------------------------+------------------------------------+------------------------------------+
| Guardrail Dimension      | Validation Invariant               | Self-Healing Recovery Loop         |
+--------------------------+------------------------------------+------------------------------------+
| 1. Schema Validation     | Output conforms to Draft 2020-12   | Injects JSON schema error path     |
|                          | JSON Schema specification          | into 1-shot repair prompt          |
+--------------------------+------------------------------------+------------------------------------+
| 2. JP Conservation Parity| SUM(Allocated TP JP) == Total JPE  | Deterministic auto-balancer scales |
|                          | Intrakurikuler                     | buffer hours or re-prompts agent   |
+--------------------------+------------------------------------+------------------------------------+
| 3. Calendar Week Bounds  | No teaching scheduled on [MPLS],   | Clears active JP allocations on    |
|                          | [LIB], [SAS], [RAPOR] weeks        | invalid weeks; restores to buffer  |
+--------------------------+------------------------------------+------------------------------------+
| 4. Bloom Taxonomy Check  | Primary KKO belongs to Bloom C1-C6 | Replaces verb via KKO dictionary   |
|                          | dictionary (rejects unobservable)  | or prompts agent with KKO subset   |
+--------------------------+------------------------------------+------------------------------------+
| 5. Bonus Grade Ceiling   | Raw + Bonus <= 100.0               | Clamps score at 100.0; records     |
|                          | Max term elevation <= +5.0%        | clamping event in audit ledger     |
+--------------------------+------------------------------------+------------------------------------+
| 6. BSKAP CP Grounding    | Semantic overlap >= 0.85 with raw  | Re-prompts agent with verbatim     |
|                          | BSKAP 032/H/KR/2024 source text    | CP text segment highlighted        |
+--------------------------+------------------------------------+------------------------------------+
| 7. JSON Syntax &         | Output is parseable by JSON.parse  | Injects 1-shot syntax repair prompt|
|    Truncation Recovery   | with zero SyntaxError exceptions   | with malformed fragment; no repeat |
+--------------------------+------------------------------------+------------------------------------+
| 8. HTTP 429 Rate Limit   | API responses status == 200 OK     | Full jitter exponential backoff    |
|    Quota Management      | without ResourceExhausted errors   | (1000ms initial, factor 2, max 3)  |
+--------------------------+------------------------------------+------------------------------------+
| 9. Upstream Degradation  | External API success rate > 50%    | Circuit Breaker (CLOSED->OPEN->    |
|    & Cascade Prevention  | over rolling 30s sliding window    | HALF-OPEN); fast-fails to fallback |
+--------------------------+------------------------------------+------------------------------------+
```

#### 3.3.1 1-Shot Repair Protocol for JSON SyntaxError & Truncated Output
When LLMs generate massive educational documents (such as 36-meeting Modul Ajar or complex PROSEM matrices), token budget limits or network packet drops can cause truncated JSON strings (`{"modul_ajar": {"tujuan": "..."...`). Naive implementations catch `SyntaxError` in an uninformative catch block and re-dispatch the exact same prompt, predictably repeating the failure and wasting tokens.

##### SyntaxError Recovery Protocol:
1. **Error Interception**: When `JSON.parse(rawText)` throws `SyntaxError`, the runner captures the specific error message (e.g. `Unexpected end of JSON input`, `Unexpected token '}' at position 8140`).
2. **Context Isolation**: The runner isolates the terminal 300 characters of the malformed payload (`lastCompletedFragment`) and computes the opening brackets that remained unclosed.
3. **1-Shot Targeted Repair Prompt Construction**: The runner constructs a repair prompt that highlights the exact syntax break and commands the model to complete the document from that specific anchor point:

```markdown
[DIREKTIF PERBAIKAN SINTAKSIS JSON - REPAIR ATTEMPT ${attemptNumber}/2]
Keluaran model sebelumnya mengalami kegagalan parsing JSON (SyntaxError).
Pesan Galat Sistem: "${syntaxError.message}"

Potongan JSON Terakhir yang Diterima Sebelum Terputus:
\`\`\`text
${lastCompletedFragment}
\`\`\`

TUGAS PERBAIKAN:
1. Analisis titik pemotongan di atas dan lanjutkan struktur JSON tersebut hingga tuntas dan valid.
2. Pastikan seluruh kurung kurawal ({ }), kurung siku ([ ]), dan tanda kutip (" ") ditutup secara presisi.
3. Jangan mengulang awal JSON dari awal jika dapat dilanjutkan, ATAU hasilkan kembali dokumen JSON lengkap yang disederhanakan agar muat dalam batas token.
4. Hasilkan HANYA string JSON murni tanpa teks pembuka, penutup, atau markdown di luar blok kode.
```

4. **Prohibition of Identical Re-dispatch**: The agent runner is strictly prohibited from resubmitting the original prompt without the repair directive when `SyntaxError` is detected.

#### 3.3.2 Exponential Backoff with Full Jitter for HTTP 429 (ResourceExhausted)
During peak morning classroom hours when hundreds of teachers generate instructional units simultaneously, Google Cloud Gemini API rate limits (HTTP 429 / `RESOURCE_EXHAUSTED`) can trigger. To prevent zero-backoff rapid-fire retry storms that exacerbate quota exhaustion and risk IP blacklisting, all agent dispatches implement **Full Jitter Exponential Backoff**:

##### Mathematical Backoff Algorithm:
$$T_{\text{delay}} = \min\left(T_{\text{max}}, T_{\text{initial}} \times 2^{\text{retries}} + \text{Uniform}(0, \text{Jitter}_{\text{max}})\right)$$
- $T_{\text{initial}} = 1,000\text{ ms}$ (Initial delay)
- $\text{Multiplier} = 2.0$ (Exponential factor)
- $T_{\text{max}} = 10,000\text{ ms}$ (Maximum delay ceiling)
- $\text{Jitter}_{\text{max}} = 500\text{ ms}$ (Randomized desynchronization window)
- $\text{MaxRetries} = 3$ (Maximum retry attempts before failing over)

##### Retry Schedule:
- **Attempt 1 (First Retry)**: $1,000\text{ ms} \times 2^0 + [0\text{–}500\text{ ms}] = 1,000\text{–}1,500\text{ ms}$
- **Attempt 2 (Second Retry)**: $1,000\text{ ms} \times 2^1 + [0\text{–}500\text{ ms}] = 2,000\text{–}2,500\text{ ms}$
- **Attempt 3 (Third Retry)**: $1,000\text{ ms} \times 2^2 + [0\text{–}500\text{ ms}] = 4,000\text{–}4,500\text{ ms}$
- If Attempt 3 fails, the call fails over to the Circuit Breaker.

```typescript
export async function executeWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000,
  maxDelayMs: number = 10000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      const isRateLimit = error?.status === 429 || error?.message?.includes("RESOURCE_EXHAUSTED");
      if (!isRateLimit || attempt > maxRetries) {
        throw error;
      }
      const jitter = Math.random() * 500;
      const delayMs = Math.min(maxDelayMs, initialDelayMs * Math.pow(2, attempt - 1) + jitter);
      console.warn(`[HTTP 429 RateLimit] Backing off attempt ${attempt}/${maxRetries} for ${delayMs.toFixed(0)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
```

#### 3.3.3 Circuit Breaker State Machine Architecture
To prevent Cloud Function container concurrency saturation, memory spikes, and cascading HTTP 504 Gateway Timeouts during upstream Google Cloud AI outages or degraded network availability, the orchestrator incorporates a **3-State Circuit Breaker Pattern**:

```
      ┌───────────────────────────────┐
      │            CLOSED             │◄───────────────────────────┐
      │ (Normal Operations: Requests  │                            │
      │  dispatched to Gemini API)    │                            │
      └──────────────┬────────────────┘                            │
                     │ Failures >= 5 in 30s                        │ Probe Request
                     │ or Failure Rate > 50%                       │ Succeeded (200 OK)
                     ▼                                             │
      ┌───────────────────────────────┐              ┌─────────────┴──────────────┐
      │             OPEN              │ 60s Cooldown │         HALF-OPEN          │
      │ (Fast-Fail: Outbound calls    ├─────────────►│ (Allows exactly 1 probe    │
      │  blocked; static BSKAP return)│  Elapses     │  request to test upstream) │
      └───────────────────────────────┘              └─────────────┬──────────────┘
                                                                   │
                                                                   │ Probe Request Failed
                                                                   ▼ (Re-trip circuit)
```

##### Circuit Breaker State Machine Specifications:
1. **`CLOSED` (Normal Operation)**:
   - All agent generation requests pass directly to Gemini 2.5 Pro / Flash.
   - Sliding Window: 30 seconds rolling duration.
   - Trip Condition: If **5 consecutive requests fail** OR the **failure rate exceeds $50\%$** over a minimum of 10 requests, the circuit trips to `OPEN`.
2. **`OPEN` (Fast-Fail / Circuit Tripped)**:
   - All inbound agent requests are intercepted immediately ($<5\text{ms}$).
   - **Zero outbound network calls** are made to Gemini API, preventing Cloud Function worker threads from hanging and exhausting memory pools.
   - The orchestrator serves deterministic, pre-cached statutory BSKAP baseline templates (e.g. Standard Modul Ajar template for Matematika Fase D) and marks the UI state with: `"Peringatan: Server AI sedang mengalami gangguan upstream. Dokumen dihasilkan menggunakan templat dasar resmi BSKAP untuk ditelaah guru."`
   - Cooldown Period: 60 seconds.
3. **`HALF-OPEN` (Upstream Probe)**:
   - After the 60-second cooldown expires, the circuit transitions to `HALF-OPEN`.
   - Exactly **one test probe request** is permitted through to Gemini API.
   - If the probe succeeds: The circuit immediately resets to `CLOSED`, resetting all failure counters.
   - If the probe fails: The circuit re-trips to `OPEN` for another 60-second cooldown period.

```typescript
export class AgentCircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF-OPEN" = "CLOSED";
  private failureCount: number = 0;
  private consecutiveFailuresThreshold: number = 5;
  private cooldownDurationMs: number = 60000;
  private nextAttemptTimestamp: number = 0;

  public async execute<T>(
    serviceCall: () => Promise<T>,
    fallbackProvider: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();

    if (this.state === "OPEN") {
      if (now >= this.nextAttemptTimestamp) {
        this.state = "HALF-OPEN";
        console.log("[CircuitBreaker] Cooldown elapsed. Transitioning from OPEN to HALF-OPEN. Probing upstream...");
      } else {
        console.warn("[CircuitBreaker] Circuit is OPEN. Fast-failing to BSKAP deterministic fallback template.");
        return await fallbackProvider();
      }
    }

    try {
      const result = await serviceCall();
      if (this.state === "HALF-OPEN") {
        console.log("[CircuitBreaker] Probe succeeded! Resetting circuit to CLOSED.");
        this.state = "CLOSED";
        this.failureCount = 0;
      }
      return result;
    } catch (error: any) {
      this.failureCount++;
      console.error(`[CircuitBreaker] Failure recorded (${this.failureCount}/${this.consecutiveFailuresThreshold}): ${error.message}`);

      if (this.state === "HALF-OPEN" || this.failureCount >= this.consecutiveFailuresThreshold) {
        this.state = "OPEN";
        this.nextAttemptTimestamp = now + this.cooldownDurationMs;
        console.error(`[CircuitBreaker] Trip condition reached! Circuit state is now OPEN until ${new Date(this.nextAttemptTimestamp).toISOString()}`);
      }

      return await fallbackProvider();
    }
  }

  public getStatus() {
    return { state: this.state, failureCount: this.failureCount, nextAttemptUtc: new Date(this.nextAttemptTimestamp).toISOString() };
  }
}
```

---

## 4. GOOGLE WEB APP PLATFORM RUNTIME MAPPING

### 4.1 Hosting on Firebase Cloud Functions v2 & Google Genkit / Antigravity SDK

The entire multi-agent ecosystem is architected to run serverlessly on Google Cloud Platform:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  GOOGLE CLOUD / FIREBASE RUNTIME                                 │
├─────────────────────────────────┬────────────────────────────────┬───────────────────────────────┤
│ Layer                           │ Google Platform Component      │ Configuration & Scaling       │
├─────────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│ Client Application              │ Firebase App Hosting           │ Next.js 15 App Router SSR,    │
│                                 │                                │ React 19, TanStack Table, PWA │
├─────────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│ Serverless Agent Endpoints      │ Firebase Cloud Functions (v2)  │ Node.js 22 LTS, Cloud Run     │
│                                 │                                │ Memory: 1GB-2GB, Min Inst: 1  │
├─────────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│ Multi-Agent Framework           │ Firebase Genkit + Google AGY   │ Typed flows, tool definitions,│
│                                 │ SDK                            │ structured output validation  │
├─────────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│ Shared Blackboard Database      │ Cloud Firestore                │ Multi-tenant NoSQL, IndexedDB │
│                                 │                                │ client cache, real-time sync  │
├─────────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│ Event Bus & Message Queue       │ Google Cloud Pub/Sub           │ Asynchronous stage events,    │
│                                 │                                │ guaranteed delivery           │
├─────────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│ Authentication & RBAC           │ Firebase Authentication        │ Google Workspace for Education│
│                                 │                                │ SSO, Custom Claims (Roles)    │
└─────────────────────────────────┴────────────────────────────────┴───────────────────────────────┘
```

#### Firebase Genkit Flow Definition Pattern
Each agent is implemented as a Genkit Flow in TypeScript utilizing the Gemini 2.5 family:

```typescript
import { defineFlow, run } from '@genkit-ai/flow';
import { gemini25Pro, gemini25Flash } from '@genkit-ai/googleai';
import { z } from 'zod';

export const curriculumArchitectFlow = defineFlow(
  {
    name: 'curriculumArchitectFlow',
    inputSchema: CurriculumArchitectInputZodSchema,
    outputSchema: CurriculumArchitectOutputZodSchema,
  },
  async (input) => {
    // 1. Execute deterministic preprocessing / BSKAP dictionary lookup
    const kkoBaseline = await run('kko-lookup', () => fetchKkoDictionary(input.phase));

    // 2. Call gemini-2.5-pro with structured responseSchema
    const response = await ai.generate({
      model: gemini25Pro, // Maps to gemini-2.5-pro
      prompt: buildCurriculumArchitectPrompt(input, kkoBaseline),
      config: {
        temperature: 0.2, // Low temperature for high adherence
        responseSchema: CurriculumArchitectOutputZodSchema,
      },
    });

    // 3. Post-generation verification
    await run('verify-jp-conservation', () => {
      const totalJp = response.output.sequenced_atp.reduce((acc, cur) => acc + cur.allocated_jp, 0);
      if (totalJp !== input.total_annual_jp) {
        throw new Error(`JP Conservation Violation: Expected ${input.total_annual_jp}, got ${totalJp}`);
      }
    });

    return response.output;
  }
);
```

---

### 4.2 Model Selection Matrix & Cost/Latency Optimization

To balance pedagogical depth, output quality, latency, and operational cost, tasks are strategically routed between **`gemini-2.5-pro`** and **`gemini-2.5-flash`**:

| Agent / Task | Assigned LLM Model | Rationale & Token Profile | Caching Strategy |
|---|---|---|---|
| `agent-curriculum-architect` (CP $\to$ TP) | **`gemini-2.5-pro`** | Deep semantic reasoning required to deconstruct dense statutory prose into atomic Bloom competencies. | BSKAP National Catalog cached in shared Context Cache |
| `agent-curriculum-architect` (ATP Sequencing) | **`gemini-2.5-flash`** | Structural sorting & prerequisite graph ordering; high speed and low cost. | Standard |
| `agent-assessment-rubric` (KKTP Synthesis) | **`gemini-2.5-flash`** | High structured conformity to 3-format templates. Flash delivers sub-second generation. | PPA rubric guidelines cached |
| `agent-academic-calendar-schedule` (AME/PROSEM) | **`gemini-2.5-flash`** | Deterministic arithmetic wrapped in matrix formatting; Flash executes in $<800\text{ms}$. | None |
| `agent-lesson-plan-pedagogy` (Modul Ajar) | **`gemini-2.5-pro`** | Long-form creative pedagogical design, differentiated instruction, and step-by-step teacher dialogue. | Instructional model syntaxes cached |
| `agent-lkpd-content-generation` (LKPD) | **`gemini-2.5-pro`** | Authentic contextual dilemma crafting, tiered scaffolding, and progressive LOTS-to-HOTS inquiry tasks. | None |
| `agent-classroom-intelligence` (Narrative) | **`gemini-2.5-flash`** | High-volume synthesis of 2-sentence qualitative e-Rapor narrative paragraphs across 36 students. | None |

#### Architectural Role Specialization:
- **`gemini-2.5-pro` (Complex Pedagogical Reasoning)**: Deployed exclusively where creative instructional architecture, psychometric rubric calibration, differentiated scaffolding, and nuanced contextual inquiry design are paramount. Its expanded reasoning and multi-turn consistency ensure deep alignment with Kurikulum Merdeka standards.
- **`gemini-2.5-flash` (High-Throughput Transformation & Arithmetic Formatting)**: Deployed for rapid structural sorting, calendar matrix distributions, deterministic calculation formatting, and batch synthesis of 36 student e-Rapor narrative paragraphs. Flash achieves sub-second latency with exceptional token economy.

#### Gemini Context Caching: Minimum Token Threshold Compliance
Google Cloud Gemini Context Caching enforces a strict **minimum threshold of 32,768 tokens**. An isolated subject's Capaian Pembelajaran (CP) snippet (e.g. SMP Matematika) comprises only 2,000 to 4,000 tokens, which will fail to activate context caching independently (`INVALID_ARGUMENT: Content too short for caching`).

To satisfy the 32,768 token threshold and unlock 75% cost savings and sub-second first-token latencies:
1. **District-Wide Catalog Bundling**: The caching subsystem aggregates the **complete national curriculum catalog** (BSKAP No. 032/H/KR/2024 covering all subjects across Fase Fondasi to Fase F, and BSKAP No. 031/H/KR/2024 P5 dimensions), totaling over **165,000 tokens**.
2. **Shared District Resource**: This catalog is provisioned once as an immutable `CachedContent` resource in `asia-southeast2` (Jakarta) with a 7-day TTL.
3. **Cross-Agent Reuse**: All worker agents across the entire school tenant reference the same `cachedContent` handle when deriving learning outcomes and lesson plans.

---

### 4.3 Structured JSON Schema Enforcement via Gemini `responseSchema`

To achieve $100\%$ zero-shot JSON compliance without brittle regex parsing or markdown prose leakage, all agent invocations utilize Gemini’s native `responseSchema` and `responseMimeType: "application/json"`, integrated with the Circuit Breaker and Exponential Backoff engines:

```typescript
import { GoogleGenAI } from '@google/genai';
import { executeWithExponentialBackoff, AgentCircuitBreaker } from './resilience';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const circuitBreaker = new AgentCircuitBreaker();

export async function callAgentWithStrictSchema<T>(
  modelName: "gemini-2.5-pro" | "gemini-2.5-flash",
  systemInstruction: string,
  userPrompt: string,
  jsonSchema: object,
  fallbackProvider: () => Promise<T>
): Promise<T> {
  return await circuitBreaker.execute(async () => {
    return await executeWithExponentialBackoff(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: jsonSchema,
          temperature: 0.15,
          maxOutputTokens: 8192,
        },
      });

      const rawText = response.text?.trim() || "";
      try {
        const parsedJson = JSON.parse(rawText) as T;
        return parsedJson;
      } catch (syntaxErr: any) {
        // Intercept SyntaxError / truncated JSON output and trigger 1-shot repair
        console.warn(`[SyntaxError Intercepted] ${syntaxErr.message}. Triggering 1-shot repair...`);
        const repairPrompt = `[DIREKTIF PERBAIKAN SINTAKSIS JSON]\n` +
          `JSON berikut terpotong pada: "${syntaxErr.message}".\n` +
          `Fragmen terakhir: ${rawText.slice(-300)}\n` +
          `Selesaikan dan tutup seluruh struktur JSON secara valid.`;

        const repairResponse = await ai.models.generateContent({
          model: modelName,
          contents: repairPrompt,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: jsonSchema,
            temperature: 0.1,
          },
        });

        return JSON.parse(repairResponse.text?.trim() || "{}") as T;
      }
    });
  }, fallbackProvider);
}
```

Through this architecture, the Indonesian Kurikulum Merdeka Multi-Agent System provides a production-grade, mathematically verified, pedagogically grounded platform for educators nationwide.
