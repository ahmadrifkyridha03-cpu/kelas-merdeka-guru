# SYSTEM ARCHITECTURE SPECIFICATION
## Teacher Classroom Management & Kurikulum Merdeka Automation Platform
### Unified Hybrid Architecture: Firebase Full-Stack Core + Gemini GenAI Engine + Google Workspace Sync

**Document Version**: 1.0.0  
**Status**: Production Architectural Baseline  
**Target Platform**: Google Web App Builder Ecosystem (Firebase App Hosting, Cloud Functions v2, Cloud Firestore, Google AI Studio / Gemini API, Google Workspace)  
**Regulatory Baseline**: Kemendikbudristek Permendikbudristek No. 12/2024, Keputusan Kepala BSKAP No. 032/H/KR/2024, Panduan Pembelajaran dan Asesmen (PPA) 2024, UU Perlindungan Data Pribadi No. 27/2022  

---

## TABLE OF CONTENTS
1. [Executive Architectural Overview & Design Principles](#1-executive-architectural-overview--design-principles)
   - 1.1 Context, Scope & Mission
   - 1.2 Core Architectural Principles & Quantitative Engineering Goals
   - 1.3 High-Level System Topology Diagram
   - 1.4 Unified Hybrid Architectural Paradigm
2. [Google Web App Builder Ecosystem Evaluation & Deployment Architecture](#2-google-web-app-builder-ecosystem-evaluation--deployment-architecture)
   - 2.1 Deep Candidate Platform Evaluation & Teardown
   - 2.2 Comprehensive Comparative Evaluation Matrix
   - 2.3 Rationale for Rejecting Standalone AppSheet & Standalone AI Studio
   - 2.4 Production Deployment Topology & Infrastructure Specification
     * 2.4.1 Hosting & CDN Layer (Firebase App Hosting + Next.js PWA)
     * 2.4.2 Application Backend & Serverless Compute (Cloud Functions v2 + Genkit + @google/genai)
     * 2.4.3 Database Layer (Cloud Firestore Native Mode + Native Persistent Local Cache)
     * 2.4.4 Identity & Access Management (Firebase Auth + Google Workspace SSO)
     * 2.4.5 Google Workspace Integration Pipeline (Sheets v4, Drive v3, Docs v1)
3. [System Component Architecture & Subsystems](#3-system-component-architecture--subsystems)
   - 3.1 Client-Side Subsystems & Component Topology
     * 3.1.1 TanStack Table Virtualized Matrix Gradebook Engine
     * 3.1.2 Interactive Seating Chart Canvas
     * 3.1.3 PWA Offline Sync Manager
     * 3.1.4 Kurikulum Merdeka Curriculum Tools Generation Wizard
     * 3.1.5 Modul Ajar & LKPD Studio
   - 3.2 Server-Side Subsystems & Services
     * 3.2.1 Curriculum Generation Pipeline Runner (DAG Coordinator)
     * 3.2.2 Assessment Aggregation & Rounding Engine
     * 3.2.3 e-Rapor Narrative Synthesis Service
     * 3.2.4 Audit Ledger Service
     * 3.2.5 Google Workspace Export Worker
4. [Comprehensive Data Models & Schemas](#4-comprehensive-data-models--schemas)
   - 4.1 Organizations & Schools (`organizations`)
   - 4.2 Academic Years & Semesters (`academic_years` / `semesters`)
   - 4.3 Class Sections / Rombongan Belajar (`class_sections`)
   - 4.4 Students & Demographics (`students`)
   - 4.5 Attendance Records (`attendance_records`)
   - 4.6 Curriculum Plans (`curriculum_plans`)
   - 4.7 Lesson Plans / Modul Ajar (`lesson_plans`)
   - 4.8 LKPD Documents (`lkpd_documents`)
   - 4.9 Assessment Categories & Definitions (`assessment_definitions`)
   - 4.10 Grade Entries (`grade_entries`)
   - 4.11 Bonus Point Transactions (`bonus_point_transactions`)
5. [User Interface Architecture & UX Wireflow Diagrams](#5-user-interface-architecture--ux-wireflow-diagrams)
   - 5.1 Master Teacher Dashboard UI
   - 5.2 Class Roster & Seating Chart UI
   - 5.3 Virtualized Matrix Gradebook UI
   - 5.4 Curriculum Tools Generation Wizard Stepper
   - 5.5 Modul Ajar & LKPD Studio Split-Screen Workspace
6. [Security, Compliance & Governance](#6-security-compliance--governance)
   - 6.1 Declarative Cloud Firestore Security Rules Specification
   - 6.2 Indonesian UU Perlindungan Data Pribadi (UU PDP No. 27/2022) Compliance
   - 6.3 Generative AI Governance & Student PII Pseudonymization Pipeline
7. [Resilience, Offline-First Sync & Scalability](#7-resilience-offline-first-sync--scalability)
   - 7.1 Unified Offline Synchronization Lifecycle
   - 7.2 Conflict Resolution Matrix & Telemetry
   - 7.3 Cloud Firestore Caching, Bundle Serving & Query Optimization

---

## 1. EXECUTIVE ARCHITECTURAL OVERVIEW & DESIGN PRINCIPLES

### 1.1 Context, Scope & Mission
Indonesia's national educational landscape is undergoing a systemic structural transformation under **Kurikulum Merdeka**, codified under **Permendikbudristek No. 12 Tahun 2024**, with learning competencies specified by **Keputusan Kepala BSKAP No. 032/H/KR/2024** and instructional guidelines governed by the **Panduan Pembelajaran dan Asesmen (PPA) Edisi Revisi 2024**. 

While Kurikulum Merdeka provides pedagogical autonomy across six developmental phases (**Fase A** through **Fase F**), it drastically escalates teacher administrative overhead:
1. Teachers must deconstruct prose-heavy **Capaian Pembelajaran (CP)** into measurable **Tujuan Pembelajaran (TP)**, sequence them logically into **Alur Tujuan Pembelajaran (ATP)**, and establish nuanced **Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)** using intervals or rubrics rather than fixed numeric cutoffs.
2. Teachers must calculate academic calendars via **Analisis Minggu Efektif (AME/RME)** and distribute competencies across **Program Tahunan (PROTA)** and **Program Semester (PROSEM)**.
3. Teachers must author multi-meeting **Modul Ajar** (comprising General Information, Core Instructional Components, and Appendices) accompanied by contextual, differentiated **Lembar Kerja Peserta Didik (LKPD)** for every classroom meeting.
4. Daily classroom management requires managing large student rosters (28–36 students per rombel), recording attendance across a 6-status taxonomy, entering grades into dynamic 2D assessment matrices, and writing personalized, qualitative competency narratives for official **e-Rapor** report cards.

The mission of this system architecture is to provide an enterprise-grade, high-performance, resilient, and offline-capable web application designed specifically for Indonesian teachers, running seamlessly within the Google Cloud and Google Workspace ecosystem.

### 1.2 Core Architectural Principles & Quantitative Engineering Goals
To ensure operational viability across diverse Indonesian educational environments—from metropolitan schools in Jakarta to rural and semi-urban schools across Sumatra, Kalimantan, Sulawesi, NTT, and Papua—the system adheres to five non-negotiable architectural principles:

```
+---------------------------------------------------------------------------------------------------+
|                                  CORE ARCHITECTURAL PRINCIPLES                                    |
+--------------------------+------------------------------------------------------------------------+
| Principle                | Quantitative Engineering Target                                        |
+--------------------------+------------------------------------------------------------------------+
| 1. Offline-First         | 100% core write operations (attendance, grade entry, bonus points,     |
|    Resilience            | seating modifications) functional with zero active network connection. |
|                          | Zero data loss during abrupt network disconnections.                   |
+--------------------------+------------------------------------------------------------------------+
| 2. Zero-Latency Entry &  | < 16ms local UI response (instant 60fps keyboard tab/enter in grid).   |
|    Sub-Second Sync       | < 100ms optimistic local persistence to client IndexedDB.              |
|                          | < 800ms remote convergence over 3G/4G cellular connections.           |
+--------------------------+------------------------------------------------------------------------+
| 3. Multi-Tenant School   | Absolute database-level isolation between organizations (NPSN) via     |
|    Isolation & RBAC      | declarative Firestore Security Rules and cryptographically verified    |
|                          | Firebase Auth Custom Claims. Zero cross-tenant data leakage.           |
+--------------------------+------------------------------------------------------------------------+
| 4. Ultra-Low Operating   | Total Cost of Ownership (TCO) < $15.00 USD / month for an average     |
|    TCO (< $15/mo/school) | school of 50 teachers and 800 students. Serverless consumption-based   |
|                          | scaling eliminating per-seat enterprise software licensing.            |
+--------------------------+------------------------------------------------------------------------+
| 5. Deterministic AI &    | 100% schema compliance on LLM-generated curriculum artifacts via       |
|    Academic Integrity    | Gemini structured JSON schemas; immutable audit ledgers for bonus      |
|                          | points; mathematical separation of formative diagnostics from marks.   |
+--------------------------+------------------------------------------------------------------------+
```

### 1.3 High-Level System Topology Diagram
The system follows a tiered, cloud-native architecture leveraging Google Cloud Platform, Firebase infrastructure, Google Gemini models, and Google Workspace APIs.

```
+===================================================================================================+
|                                    HIGH-LEVEL SYSTEM TOPOLOGY                                     |
+===================================================================================================+

       [ CLIENT DEVICES: LAPTOPS, TABLETS, MOBILE (PWA) ]
       - Responsive UI: Next.js 15 App Router, React 19, Tailwind CSS, TanStack Virtual Grid
       - Local Storage: IndexedDB Persistent Cache, Service Worker Cache API
       - Sync Engine: Firebase JS SDK v11 (Persistent Multi-Tab Cache)
                                      |
                                      | HTTPS / WebSocket (TLS 1.3)
                                      v
       +--------------------------------------------------------------+
       |             FIREBASE APP HOSTING & GLOBAL CDN EDGE           |
       |  - Server-Side Rendering (SSR) via Cloud Run                 |
       |  - Static Asset Edge Caching (HTML/JS/CSS/WebP)              |
       |  - HTTP/3 & Brotli Compression                               |
       +--------------------------------------------------------------+
             |                                           |
             v                                           v
+-------------------------------+           +-------------------------------+
|    FIREBASE AUTHENTICATION    |           |    CLOUD FIRESTORE (DATABASE) |
| - Google Workspace SSO        |           | - Multi-Region Jakarta        |
|   (@guru.belajar.id & domains)|           |   (asia-southeast2)           |
| - Custom Claims Engine        |           | - Document-level security     |
| - Session Token Verification  |           | - Sub-second live listeners   |
+-------------------------------+           +-------------------------------+
                                                             |
                                      +----------------------+----------------------+
                                      |                                             |
                                      v                                             v
       +--------------------------------------------------------------+  +--------------------+
       |         FIREBASE CLOUD FUNCTIONS v2 (NODE.JS 22 LTS)         |  | FIRESTORE MUTATION |
       |  - Serverless Microservices deployed on Google Cloud Run     |  | PIPELINE           |
       |  - Auto-scaling (0 to N instances, zero idle cost)           |  | - Optimistic write |
       |  - Memory-optimized: 1GB - 4GB per GenAI task                |  | - Background queue |
       +--------------------------------------------------------------+  +--------------------+
             |                                           |
             v                                           v
+-------------------------------+           +-------------------------------+
|    GEMINI GENAI ORCHESTRATION |           |   GOOGLE WORKSPACE APIS       |
|    (Firebase Genkit & GenAI)  |           |   (OAuth2 & Service Account)  |
| - Gemini 2.5 Pro (Pedagogy)   |           | - Google Sheets API v4        |
| - Gemini 2.5 Flash (Narrative)|           |   (Bi-directional grade sync) |
| - Structured JSON Schemas     |           | - Google Drive API v3         |
| - Temperature & Safety Filters|           |   (Modul Ajar PDF/Docs export)|
| - Multi-Stage DAG Pipeline    |           | - Google Docs API             |
+-------------------------------+           +-------------------------------+
```

### 1.4 Unified Hybrid Architectural Paradigm
Rather than forcing an unnatural compromise between pure low-code builders or fully custom backends, this platform formalizes the **Unified Hybrid Architecture: Firebase Full-Stack Core + Gemini GenAI Engine + Google Workspace Sync**.

1. **The Firebase Full-Stack Core** provides the real-time, offline-first operational nervous system. It handles user authentication, data authorization, real-time reactive data propagation across co-teachers, and client-side database caching via IndexedDB.
2. **The Gemini GenAI Engine** acts as the high-intelligence pedagogical co-pilot. Integrated through serverless Cloud Functions using Firebase Genkit and `@google/genai`, it processes multi-step curriculum generation pipelines (CP -> TP -> ATP -> KKTP -> AME -> PROTA/PROSEM -> Modul Ajar -> LKPD) and generates e-Rapor qualitative narratives without client-side API key exposure.
3. **The Google Workspace Sync Layer** serves as the interoperability bridge. Because Indonesian educators routinely rely on Google Sheets for grade tabulation and Google Drive for administrative archiving, the platform treats Google Sheets and Google Drive as first-class asynchronous sync targets rather than isolated silos.

---

## 2. GOOGLE WEB APP BUILDER ECOSYSTEM EVALUATION & DEPLOYMENT ARCHITECTURE

### 2.1 Deep Candidate Platform Evaluation & Teardown
Three candidate platforms within the Google web development ecosystem were evaluated for building the Teacher Classroom Management platform:

#### Platform 1: Google AI Studio Build (Client-Side Gemini Sandbox)
*   **Architectural Profile**: Google AI Studio provides a web-based developer IDE for rapid prototyping with Google's Gemini models (`gemini-2.5-flash`, `gemini-2.5-pro`). AI Studio Build allows compiling web prototypes (React/Vite/HTML5) executed entirely within the browser context.
*   **Strengths**:
    *   Direct, native integration with the newest Gemini API features, including multi-modal analysis, native audio/vision reasoning, adjustable `thinking` parameter budgets, and `responseSchema` structured JSON generation.
    *   Zero backend setup required for immediate UI prototyping of standalone AI prompt generators.
*   **Critical Weaknesses**:
    *   *No Managed Multi-Tenant Database*: AI Studio Build lacks any persistence tier. Data is either lost upon session refresh or confined to browser `localStorage`.
    *   *Lack of Secure Identity & Access Management*: Cannot enforce school-wide RBAC, separate teacher vs. student roles, or authenticate official school domains.
    *   *API Key Security Hazard*: Deploying a production application directly from AI Studio exposes Gemini API keys within the client JavaScript bundle.
*   **Verdict**: **Rejected as a standalone application platform**. Retained exclusively as an internal development sandbox for authoring and stress-testing system prompt templates.

#### Platform 2: Firebase Web App Platform (App Hosting, Auth, Firestore, Cloud Functions v2)
*   **Architectural Profile**: Google's production cloud application platform, combining Firebase App Hosting (managed Next.js/Angular runtime on Cloud Run), Firebase Authentication, Cloud Firestore (distributed NoSQL document database), and Cloud Functions v2 (event-driven serverless compute).
*   **Strengths**:
    *   *Full Custom UI/UX Freedom*: Unrestricted React 19 / Next.js 15 capabilities enabling virtualized 2D matrix data grids (TanStack Table), interactive 2D drag-and-drop seating canvases, and responsive mobile viewports.
    *   *Enterprise-Grade Security & Multi-Tenancy*: Firebase Auth seamlessly handles Google Workspace SSO (`@guru.belajar.id`). Declarative Cloud Firestore Security Rules enforce tenant and rombel isolation directly at the database layer.
    *   *Native Offline-First Architecture*: Cloud Firestore's Web SDK provides built-in multi-tab offline persistence using browser IndexedDB. Mutations performed offline are automatically queued, merged, and synchronized when connectivity resumes.
    *   *Secure Serverless AI Orchestration*: Cloud Functions v2 natively host Firebase Genkit and `@google/genai`, securely protecting API keys and executing complex, long-running curriculum DAG pipelines.
    *   *Micro-Cost Scalability*: Free tier covers substantial daily usage; Blaze pay-as-you-go pricing charges only for consumed compute and storage, yielding an estimated operating cost of < $15/month per school.
*   **Critical Weaknesses**:
    *   Requires standard software engineering lifecycle (Git CI/CD, TypeScript compilation, testing) compared to no-code builders.
*   **Verdict**: **Selected as the Core System Architecture**.

#### Platform 3: AppSheet (Google Workspace No-Code Builder)
*   **Architectural Profile**: Google's enterprise no-code application platform that automatically generates forms, master-detail views, and workflow bots directly on top of Google Sheets, Google Drive, or Cloud SQL.
*   **Strengths**:
    *   Direct, native binding to Google Sheets spreadsheets familiar to school staff.
    *   Rapid generation of basic CRUD forms and simple list views.
    *   Built-in workflow automation bots for generating automated email alerts and basic PDF documents.
*   **Critical Weaknesses**:
    *   *Inability to Render Dynamic 2D Matrix Gradebooks*: AppSheet's UI engine is strictly restricted to pre-defined view templates (Deck, Table, Gallery, Detail, Map). It is mathematically and architecturally **impossible** in AppSheet to render a dynamic 2D spreadsheet matrix where students form rows, and an arbitrary, dynamic number of summative assessments (TP 1, TP 2, ... TP N) form columns with live keyboard navigation and real-time formula recalculation.
    *   *Catastrophic Licensing Costs*: AppSheet enforces a per-user monthly subscription ($5 to $10/user/month for Core/Enterprise). A typical Indonesian school with 50 teachers and 800 students would face licensing fees of **$4,250 to $8,500 USD per month ($51,000 to $102,000 USD annually)**—completely infeasible for Indonesian public schools (BOS budget constraints).
    *   *Severe Performance Bottlenecks*: Backing a 50-teacher, 800-student school with Google Sheets as the database results in severe throttling, row locking, and sync timeouts when tens of thousands of attendance and assessment records are updated concurrently.
    *   *Clunky AI Integration*: Chaining multi-agent prompts and streaming large curriculum documents requires circuitous webhook roundtrips to external endpoints.
*   **Verdict**: **Rejected as the primary application platform**. Relegated strictly to an optional auxiliary data ingestion tool via Google Sheets.

### 2.2 Comprehensive Comparative Evaluation Matrix

```
+=======================================================================================================================+
|                                    PLATFORM EVALUATION & ARCHITECTURAL TRADE-OFFS                                     |
+------------------------------------+-----------------------------+---------------------------+------------------------+
| Architectural Dimension            | Google AI Studio Build      | Firebase Web App Platform | AppSheet (No-Code)     |
+------------------------------------+-----------------------------+---------------------------+------------------------+
| 1. UI/UX Customizability &         | Poor (Prototype sandbox;    | EXCEPTIONAL (Full React   | POOR (Rigid templates; |
|    Dynamic 2D Matrix Gradebook     | unmanaged external state)   | Next.js, TanStack Virtual)| no dynamic matrix view)|
+------------------------------------+-----------------------------+---------------------------+------------------------+
| 2. Offline-First Resilience        | Non-existent (Ephemeral     | EXCELLENT (IndexedDB SDK  | Good (AppSheet offline |
|    (Rural / 3T School Support)     | browser memory)             | persistent write queue)   | cache, slow sync)      |
+------------------------------------+-----------------------------+---------------------------+------------------------+
| 3. Multi-Tenant Security, RBAC &   | Non-existent (No user auth  | EXCELLENT (Firebase Auth, | Moderate (Workspace    |
|    Dapodik Compliance              | or security rule engine)    | Custom Claims, Rules)     | coarse domain ACLs)    |
+------------------------------------+-----------------------------+---------------------------+------------------------+
| 4. Multi-Agent AI Orchestration    | Native Playground (Great for| EXCELLENT (Cloud Functions| Very Poor (Complex     |
|    (DAG Pipelines, Genkit, Schema) | one-off prompt testing)     | v2, Genkit, @google/genai)| webhook gymnastics)    |
+------------------------------------+-----------------------------+---------------------------+------------------------+
| 5. Real-Time Multi-User Sync       | None                        | SUB-SECOND (Firestore     | High Latency (Delayed  |
|    (Co-Teachers & Wali Kelas)      |                             | onSnapshot listeners)     | spreadsheet polling)   |
+------------------------------------+-----------------------------+---------------------------+------------------------+
| 6. Google Workspace Interop        | Manual Export               | HIGH (Direct Sheets API   | NATIVE (Sheets is the  |
|    (Sheets, Drive, Docs)           |                             | v4 & Drive API v3 worker) | backend storage engine)|
+------------------------------------+-----------------------------+---------------------------+------------------------+
| 7. Operating Cost per School       | Free tier / Token usage     | MICRO-COST (< $15.00/mo   | PROHIBITIVE ($4,000 -  |
|    (50 Teachers, 800 Students)     | (Micro-cents per call)      | across all services)      | $8,500/mo per school)  |
+------------------------------------+-----------------------------+---------------------------+------------------------+
| 8. Development & Maintenance       | Extremely fast for mocks;   | Standard Web Engineering  | Fast for basic forms;  |
|    Velocity                        | unusable in production      | (TypeScript, React, CI/CD)| impossible for matrix  |
+------------------------------------+-----------------------------+---------------------------+------------------------+
```

### 2.3 Rationale for Rejecting Standalone AppSheet & Standalone AI Studio
The architectural evaluation unambiguously proves that neither AppSheet nor Google AI Studio can function as a standalone platform for this mission:
1. **AppSheet Failure Points**:
   - *Financial Infeasibility*: Indonesian state schools operate on standardized School Operational Assistance funds (*Bantuan Operasional Sekolah / BOS*). Demanding $4k–$8k/month in per-user SaaS licenses represents a budgetary violation.
   - *Interface Limitations*: The primary daily surface for an Indonesian educator is the **Buku Nilai (Gradebook)**—a wide, high-density matrix of students vs. competencies. AppSheet cannot render dynamic, virtualized matrix columns with keyboard shortcuts (Tab to next student, Enter to next assessment).
2. **AI Studio Failure Points**:
   - AI Studio is a model exploration environment, not an application host. It has no user directory, no encryption-at-rest database, no session manager, and no way to isolate student privacy under Indonesian law.
3. **The Hybrid Solution**:
   - By anchoring the application on **Firebase App Hosting and Cloud Firestore**, the platform gains enterprise multi-tenancy, custom high-density UI, and offline durability.
   - By integrating **Cloud Functions v2 with `@google/genai`**, the platform harnesses the full power of Gemini 2.5 Pro and Flash with structured JSON schemas.
   - By integrating **Google Workspace APIs**, the platform grants teachers all the benefits of Google Sheets exports and Google Drive backups without suffering AppSheet's licensing or UI penalties.

---

### 2.4 Production Deployment Topology & Infrastructure Specification

```
+===================================================================================================+
|                                PRODUCTION DEPLOYMENT INFRASTRUCTURE                               |
+===================================================================================================+

  [ User Browser / Installed PWA ]
               |
               v
  [ Cloudflare / Google Cloud Armor Edge ] (DDoS protection, WAF, SSL Termination)
               |
               v
  +-------------------------------------------------------------------------------------------------+
  | FIREBASE APP HOSTING (GCP Project: `guru-merdeka-prod`, Region: `asia-southeast2` - Jakarta)    |
  | - Runtime: Next.js 15 (Node.js 22 LTS container on Cloud Run)                                   |
  | - Scaling: Min instances: 1 (warm start), Max instances: 20                                     |
  | - Memory: 1 GiB per instance | vCPU: 1 vCPU                                                     |
  | - Global CDN: Cache-Control: s-maxage=31536000 for immutable assets                              |
  +-------------------------------------------------------------------------------------------------+
               |
               +----------------------------------+
               | (Internal VPC Connector)         | (HTTPS / WebSocket)
               v                                  v
  +-------------------------------+  +--------------------------------------------------------------+
  | CLOUD FUNCTIONS v2 (Cloud Run)|  | CLOUD FIRESTORE NATIVE MODE (Multi-Region / Dual-Region)     |
  | - Location: `asia-southeast2` |  | - Location: `asia-southeast2` (Primary Jakarta DC)           |
  | - Min: 0, Max: 50             |  | - Replication: Multi-region failover                         |
  | - Service Account:            |  | - Consistency: Strong consistency for reads/writes           |
  |   `sa-backend@...iam...`      |  | - Offline: Client-side IndexedDB caching enabled             |
  +-------------------------------+  +--------------------------------------------------------------+
               |                                  |
               +----------------+-----------------+
                                |
                                v
  +-------------------------------------------------------------------------------------------------+
  | EXTERNAL API GATEWAYS & INTEGRATIONS                                                            |
  | 1. Google Gemini API (`gemini-2.5-pro`, `gemini-2.5-flash`) via `@google/genai` SDK             |
  | 2. Google Workspace APIs (Sheets API v4, Drive API v3, Docs API) via OAuth2 User Delegated Token|
  | 3. Kemendikbud Dapodik REST / Sync Gateway (Batch XML/JSON Sync)                                |
  +-------------------------------------------------------------------------------------------------+
```

#### 2.4.1 Hosting & CDN Layer (Firebase App Hosting + Next.js PWA)
- **Framework & Runtime**: Next.js 15 with App Router, React 19, TypeScript 5.5, Tailwind CSS 3.4.
- **Hosting Environment**: Firebase App Hosting connected directly to the production GitHub repository. App Hosting automatically provisions and manages Cloud Run containers, handling server-side rendering (SSR), API routes, and edge caching.
- **Progressive Web App (PWA) Configuration**:
  - `manifest.json`: Configured with `display: "standalone"`, `theme_color: "#1E3A8A"`, and high-resolution icons for home-screen installation on Android tablets, Chromebooks, and Windows laptops.
  - **Service Worker Engine**: Built using Workbox via `@ducanh2912/next-pwa`.
  - **Caching Strategies**:
    - *Stale-While-Revalidate*: All core static application assets (`_next/static/*`, CSS bundles, JS bundles, WebP icons).
    - *Network-First with Cache Fallback*: User profile metadata and class configuration rosters.
    - *Cache-Only*: Static curriculum reference tables (BSKAP 032/H/KR/2024 CP catalog).

#### 2.4.2 Application Backend & Serverless Compute (Cloud Functions v2 + Genkit + @google/genai)
- **Runtime Environment**: Firebase Cloud Functions v2 built on Google Cloud Run, running Node.js 22 LTS with TypeScript.
- **Concurrency & Scaling**:
  - Standard API functions: Concurrency set to 80 requests per instance, memory 512MB, timeout 30s.
  - GenAI orchestration functions: Concurrency set to 10 requests per instance, memory 2048MB, timeout 300s (permitting deep pedagogical synthesis across long-context Modul Ajar generation).
- **GenAI Orchestration SDKs**:
  - `@google/genai` official SDK for direct, low-latency streaming and schema validation.
  - `firebase-admin` (v12) for privileged server-side Firestore operations, user claim minting, and batch writes.
  - `@genkit-ai/core` and `@genkit-ai/google-genai` for structured tool definitions and prompt telemetry.

#### 2.4.3 Database Layer (Cloud Firestore Native Mode + Native Persistent Local Cache)
- **Deployment Mode**: Cloud Firestore in Native Mode.
- **Geographic Placement**: `asia-southeast2` (Jakarta, Indonesia) to ensure minimum network latency (< 20ms roundtrip time across Indonesian ISPs) and strict compliance with Indonesian data sovereignty mandates.
- **Client-Side Cache Configuration**:
  ```typescript
  import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
  import { app } from "./firebaseConfig";

  export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
  ```
  This configuration natively handles multi-tab offline synchronization backed by browser IndexedDB. Teachers can work offline simultaneously across multiple browser tabs with automatic tab coordination, zero cache locking, optimistic local updates for TanStack Table, and seamless server convergence upon reconnection across all modern browsers (including desktop Chrome/Edge, Android tablets, and iOS Safari).

#### 2.4.4 Identity & Access Management (Firebase Auth + Google Workspace SSO)
- **Federated Authentication**: Firebase Authentication configured with Google Workspace for Education Identity Provider.
- **Authorized Domains**:
  - National Teacher Portal: `@guru.belajar.id`, `@*.belajar.id`.
  - Custom Verified School Domains: e.g., `@sman1bandung.sch.id`.
- **JWT Custom Claims Hard Limit Optimization (1,000-Byte Constraint)**:
  - *Platform Constraint*: Google Firebase Authentication enforces a strict, non-negotiable payload limit of **1,000 bytes** on `admin.auth().setCustomUserClaims()`.
  - *Failure Mode in Secondary Schools*: In Indonesian public junior and senior high schools (SMP/SMA/SMK), subject teachers (e.g. Guru Matematika or Guru PJOK) routinely teach between 10 and 18 class sections (*rombongan belajar* / rombel). Encoding arrays of 18 class IDs (`cls_2025_10_E1` ... `cls_2025_10_E18`) alongside subject IDs, homeroom IDs, and standard JWT claims (`iss`, `aud`, `sub`, `exp`, `iat`) easily exceeds 1,100 bytes, causing `setCustomUserClaims` to throw `auth/claims-too-large` and blocking teacher authentication.
  - *Architectural Solution*: JWT Custom Claims are kept strictly minimal, storing only static identity and coarse authorization flags (~150 bytes total). Multi-item dynamic assignment arrays are stored in the teacher's Firestore profile document at `/organizations/{orgId}/teachers/{teacherId}`.
- **Minimal JWT Custom Claims Payload**:
  ```typescript
  export interface CustomJwtClaims {
    orgId: string;                     // NPSN (e.g., "20219842")
    role: "SUPER_ADMIN" | "ADMIN" | "WALI_KELAS" | "GURU_MAPEL" | "SISWA" | "ORANG_TUA";
    subRole?: "KURIKULUM" | "KESISWAAN" | "SARPRAS" | "BK";
    studentId?: string;                // "std_00192" (if role === "SISWA")
    homeroomClassId?: string;          // "cls_10_E1" (compact, populated only if WALI_KELAS)
  }
  ```
- **Teacher Assignment Profile Document (`/organizations/{orgId}/teachers/{teacherId}`)**:
  ```typescript
  export interface TeacherProfile {
    id: string;                         // Matches Firebase Auth UID
    orgId: string;                      // NPSN identifier
    nip?: string;                       // Nomor Induk Pegawai (18 digits)
    nuptk?: string;                     // Nomor Unik Pendidik dan Tenaga Kependidikan
    fullName: string;
    email: string;
    assignedClassIds: string[];         // ["cls_10_E1", "cls_10_E2", ..., "cls_10_E18"] (unconstrained size)
    assignedSubjectIds: string[];       // ["sub_matematika_fase_e", "sub_matematika_tingkat_lanjut"]
    homeroomClassId?: string;           // Populated if assigned as Wali Kelas
    status: "ACTIVE" | "INACTIVE";
    updatedAt: string;
  }
  ```
- **Authorization Evaluation Flow**:
  - *Client Side*: The teacher profile document is fetched once upon login, cached locally in the Firestore persistent cache, and refreshed reactively via snapshot listener.
  - *Serverless Functions*: Backend functions read the teacher profile via `admin.firestore()` to verify class and subject access.
  - *Firestore Security Rules*: Declarative security rules verify assignments using lightweight document lookups (`get(/databases/$(database)/documents/organizations/$(orgId)/teachers/$(request.auth.uid)).data.assignedClassIds`), leveraging Firestore's built-in rule caching (up to 10 document reads per evaluation).

#### 2.4.5 Google Workspace Integration Pipeline (Sheets v4, Drive v3, Docs v1)
- **Integration Mechanism**: Hybrid Service Account & OAuth2 User Delegation:
  - *School-Wide Automated Backups*: Executed via a Google Cloud Service Account with domain-wide delegation, backing up daily gradebook snapshots into the school's administrative Google Drive.
  - *Teacher-Specific Exports*: Executed using OAuth2 access tokens obtained during teacher login via Google Workspace SSO (scopes: `https://www.googleapis.com/auth/spreadsheets`, `https://www.googleapis.com/auth/drive.file`, `https://www.googleapis.com/auth/documents`).
- **Google Sheets API Rate-Limiting & Quota Management**:
  - *Platform Quota Limits*: Google Sheets API v4 enforces strict rate limits of **300 requests per minute per project** and **60 requests per minute per user per project**.
  - *End-of-Term Peak Contention Hazard*: During final grading and e-Rapor export periods (e.g. late November and late May), 50 to 80 teachers across a school finalize grade matrices simultaneously. Naive row-by-row or cell-by-cell API writes will immediately trigger HTTP 429 `RESOURCE_EXHAUSTED` errors, corrupting exports.
  - *Batching Architecture (`spreadsheets.values.batchUpdate`)*:
    * Naive single-cell or single-row updates are strictly prohibited in the export worker.
    * The export worker compiles the entire class roster, all TP formative/summative marks, calculated averages, and KKTP intervals into a single multi-range `spreadsheets.values.batchUpdate` payload.
    * Spreadsheet formatting (frozen header rows, conditional formatting rules for remedial scores, column widths) is dispatched in a single `spreadsheets.batchUpdate` call.
    * This reduces API consumption from ~1,200 calls per classroom down to exactly **2 API calls per export**.
  - *Asynchronous Cloud Tasks Queue (`google-workspace-export-queue`)*:
    * Mass report card exports and gradebook syncs are decoupled from synchronous HTTP request/response lifecycles.
    * When a teacher initiates an export, a task message is published to Google Cloud Tasks.
    * The queue enforces dispatch rate limits:
      - `maxDispatchesPerSecond`: 4 (ensuring at most 240 requests/minute, well within the 300 req/min per-project ceiling).
      - `maxConcurrentDispatches`: 8.
      - `retryConfig`: Exponential backoff with jitter (`maxAttempts: 5`, `minBackoffSeconds: 2`, `maxBackoffSeconds: 60`, `maxDoublings: 4`).
    * Real-time export progress and the resulting Google Drive file URL are streamed to the client UI via Firestore `onSnapshot` on `/export_jobs/{jobId}`.

---

## 3. SYSTEM COMPONENT ARCHITECTURE & SUBSYSTEMS

```
+===================================================================================================+
|                                    SYSTEM COMPONENT ARCHITECTURE                                  |
+===================================================================================================+

  +-----------------------------------------------------------------------------------------------+
  |                                     CLIENT-SIDE SUBSYSTEMS                                    |
  +-----------------------------------------------------------------------------------------------+
  |  +---------------------------+  +---------------------------+  +---------------------------+  |
  |  |  TanStack Virtual Matrix  |  |  Interactive 2D Seating   |  |  PWA Offline Sync Manager |  |
  |  |  Gradebook Engine         |  |  Chart Canvas             |  |  (IndexedDB Queue & Merge)|  |
  |  +---------------------------+  +---------------------------+  +---------------------------+  |
  |  +---------------------------+  +---------------------------+  +---------------------------+  |
  |  |  Kurikulum Merdeka        |  |  Modul Ajar & LKPD Studio |  |  Attendance Quick-Check   |  |
  |  |  Curriculum Wizard Stepper|  |  (Split-Screen Markdown)  |  |  Matrix & Scanner Engine  |  |
  |  +---------------------------+  +---------------------------+  +---------------------------+  |
  +-----------------------------------------------------------------------------------------------+
                                                 |
                                                 | Internal Event Bus / Firestore Data Layer
                                                 v
  +-----------------------------------------------------------------------------------------------+
  |                                     SERVER-SIDE SUBSYSTEMS                                    |
  +-----------------------------------------------------------------------------------------------+
  |  +---------------------------+  +---------------------------+  +---------------------------+  |
  |  |  Curriculum Generation    |  |  Assessment Aggregation & |  |  e-Rapor Narrative       |  |
  |  |  Pipeline Runner (DAG)    |  |  Rounding Service         |  |  Synthesis Service (LLM)  |  |
  |  +---------------------------+  +---------------------------+  +---------------------------+  |
  |  +---------------------------+  +---------------------------+  +---------------------------+  |
  |  |  Immutable Audit Ledger   |  |  Google Workspace Export  |  |  Dapodik Synchronization |  |
  |  |  Service (Bonus Points)   |  |  Worker (Sheets/Drive)    |  |  & Ingestion Engine       |  |
  |  +---------------------------+  +---------------------------+  +---------------------------+  |
  +-----------------------------------------------------------------------------------------------+
```

### 3.1 Client-Side Subsystems & Component Topology

#### 3.1.1 TanStack Table Virtualized Matrix Gradebook Engine
- **Purpose**: High-performance, zero-latency 2D spreadsheet matrix for viewing and inputting student assessment marks.
- **Component Anatomy**:
  - Built on `@tanstack/react-table` (v8) coupled with `@tanstack/react-virtual` for row and column DOM virtualization.
  - Only visible cells (plus a 5-row/2-column overscan buffer) are rendered into the DOM, maintaining 60 FPS scrolling across rosters of 50 students and 40 assessment columns.
- **Keyboard Navigation State Machine**:
  - Full keyboard trap intercepting `Tab`, `Shift+Tab`, `Enter`, `Shift+Enter`, and Arrow keys (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`).
  - Pressing `Enter` automatically commits the current cell edit and moves focus to the same assessment for the student in the next row.
  - Pressing `Tab` commits the edit and moves focus to the next assessment column for the same student.
- **Inline Validation & Real-Time Calculation**:
  - Enforces numeric boundaries ($0.0 \le \text{Score} \le 100.0$).
  - Immediately updates row-level calculated totals (weighted average, KKTP status pill, rounded e-Rapor projection) in client memory using Web Workers without waiting for a server roundtrip.

#### 3.1.2 Interactive Seating Chart Canvas
- **Purpose**: Visual classroom layout manager reflecting physical desk arrangements, allowing teachers to record attendance and award extra credit intuitively.
- **Component Anatomy**:
  - Implemented using HTML5 Canvas or SVG with CSS Transform matrices and `react-draggable` / `@dnd-kit`.
  - Grid snap mechanism aligning student desk pods (single rows, pairs, or circular group clusters).
- **Interactive Layers**:
  - *Base Layer*: Desk layout with student avatars, names, and NISN.
  - *Attendance Overlay*: One-touch status toggling (Hadir -> Sakit -> Izin -> Alfa) with instant color-coded visual feedback (Green, Yellow, Blue, Red).
  - *Gamification Overlay*: Quick-action buttons to award academic bonus points (+1, +2, +5) or citizenship XP directly from the desk interface.

#### 3.1.3 PWA Offline Sync Manager
- **Purpose**: Guarantees seamless offline operation, instant optimistic UI updates (< 16ms), and conflict-free data synchronization during network dropouts in rural and semi-urban Indonesian school environments.
- **Unified Architectural Mechanism**:
  - *Native Firestore Persistent Local Cache*: Structured document mutations (daily/session attendance, virtualized matrix grade entries, bonus point ledger records, seating chart coordinate updates) are committed directly through the standard Firebase Web SDK (`setDoc`, `updateDoc`). With `persistentLocalCache({ tabManager: persistentMultipleTabManager() })` active, the SDK immediately writes to browser IndexedDB, emits instant local snapshot events to TanStack Table and UI listeners, and manages multi-tab transaction coordination.
  - *Elimination of Dual Replay Hazard*: The system strictly avoids running a parallel custom mutation replay queue for Firestore documents, eliminating double-write hazards and server race conditions. Furthermore, this ensures 100% cross-platform compatibility on Apple iOS/iPadOS Safari, where the W3C Service Worker `SyncManager` (Background Sync) is unsupported.
  - *Dedicated Binary Upload Queue (`pending_binary_uploads`)*: An isolated client IndexedDB queue is dedicated exclusively to large binary files (e.g., student medical certificate photos, scanned paper LKPD worksheets) that exceed Firestore document constraints. A lightweight Service Worker listener / window online event triggers chunked, resumable uploads to Google Cloud Storage (`/organizations/{orgId}/evidence/`) once network connectivity is confirmed.

#### 3.1.4 Kurikulum Merdeka Curriculum Tools Generation Wizard
- **Purpose**: Guided multi-step wizard orchestrating the 6-stage curriculum planning process required by Kemendikbudristek.
- **Step Flow**:
  1. *Step 1: CP Selection & Element Mapping*: Select subject, grade level, and fase; loads authoritative CP text from BSKAP 032/H/KR/2024.
  2. *Step 2: TP Derivation*: Derives Tujuan Pembelajaran using Bloom KKO and Lingkup Materi deconstruction.
  3. *Step 3: ATP Sequencing*: Sequences TPs logically across 6 pedagogical rules and estimates Jam Pelajaran (JP).
  4. *Step 4: KKTP Definition*: Configures assessment criteria (Intervals, 4-scale rubrics, or competency checklists).
  5. *Step 5: Analisis Minggu Efektif (AME)*: Calculates effective teaching weeks from the academic calendar.
  6. *Step 6: PROTA & PROSEM Allocation*: Distributes TPs and JPs across the annual calendar and semester weekly matrix.

#### 3.1.5 Modul Ajar & LKPD Studio
- **Purpose**: Split-screen authoring and refinement environment for lesson plans and student worksheets.
- **Left Pane (Prompt & Differentiation Tuning)**:
  - Sliders for pedagogical scaffolding depth, differentiated learning toggles (Visual, Auditory, Kinesthetic / Basic, Intermediate, Advanced), model selection (Problem-Based Learning, Project-Based Learning, Inquiry).
- **Right Pane (Live Preview & Markdown/Rich-Text Editor)**:
  - Real-time rendered markdown preview of the 3-part Modul Ajar and printable student LKPD with embedded diagrams.
  - Action bar providing one-click export to Google Docs, Google Drive, or print-ready PDF.

---

### 3.2 Server-Side Subsystems & Services

#### 3.2.1 Curriculum Generation Pipeline Runner (DAG Coordinator)
- **Purpose**: Executes multi-stage AI generation workflows using Gemini 2.5 Pro without single-prompt context degradation.
- **Workflow Architecture**:
  - Implements a Directed Acyclic Graph (DAG) state machine running inside a Cloud Functions v2 instance.
  - Stages execute sequentially, reading from and writing to a shared `CurriculumWorkspaceState` blackboard stored in Firestore:

```
[Stage 1: CP Analysis & TP Derivation]
          |
          v
[Stage 2: ATP Sequencing & JP Estimation]
          |
          v
[Stage 3: AME Effective Weeks & PROTA/PROSEM Allocation]
          |
          v
[Stage 4: KKTP Rubric & Interval Synthesis]
          |
          v
[Stage 5: Multi-Meeting Modul Ajar & LKPD Generation]
```

- **Validation & Fallback**:
  - Each stage validates its output against strict Zod / JSON Schemas.
  - If schema validation fails, a lightweight repair prompt is dispatched to `gemini-2.5-flash` with the raw output and error trace to coerce valid formatting before proceeding to the next DAG node.

#### 3.2.2 Assessment Aggregation & Rounding Engine
- **Purpose**: High-precision mathematical computation service calculating student averages, applying remedial caps, and generating final e-Rapor grades.
- **Floating-Point Precision Mandate**:
  - All intermediate calculations—including TP formative averages, summative category aggregates, and blended remedial scoring—**MUST preserve 64-bit IEEE 754 floating-point values with 2-decimal precision (e.g. 70.50)**.
  - Premature integer rounding at the individual assessment or remedial stage is strictly prohibited to eliminate rounding drift across multi-step gradebook aggregations.
  - Single-integer rounding (`Math.round` / half-up, $0 \le \text{NAS} \le 100$) is executed **strictly and exclusively** during the final projection of Nilai Akhir Semester (NAS) on official e-Rapor transcripts and printouts.
- **Computation Modes Supported**:
  1. *Model A (Pure TP Averaging - Official PPA Standard)*:
     $$\text{Nilai Akhir} = \text{round}\left(\frac{\sum_{i=1}^{N_{TP}} S_i}{N_{TP}}\right)$$
  2. *Model B (Weighted Lingkup Materi + Sumatif Akhir Semester)*:
     $$\text{Nilai Akhir} = \text{round}\left(\frac{W_{LM} \cdot \bar{S}_{LM} + W_{SAS} \cdot S_{SAS}}{W_{LM} + W_{SAS}}\right)$$
- **Remedial Policy Enforcement**:
  - *KKTP Capping*: $\text{Score}_{final} = \min(\text{Score}_{remedial}, \text{KKTP})$.
  - *Actual Retest*: $\text{Score}_{final} = \text{Score}_{remedial}$.
  - *Blended Score*:
    $$\text{Score}_{blended} = \frac{\text{Score}_{initial} + \text{Score}_{remedial}}{2} \quad (\text{stored with 2-decimal precision, e.g. } 70.50)$$

#### 3.2.3 e-Rapor Narrative Synthesis Service
- **Purpose**: Serverless AI service that examines a student's summative scores across all TPs and automatically synthesizes personalized, natural-language competency descriptors compliant with Kemendikbudristek e-Rapor reporting rules.
- **Pipeline Logic**:
  1. Identifies the student's highest achieved TP competency:
     $$\text{TP}_{max} = \arg\max_{i} (S_i)$$
  2. Identifies the student's lowest achieved TP competency:
     $$\text{TP}_{min} = \arg\min_{i} (S_i)$$
  3. Dispatches a structured synthesis prompt to `gemini-2.5-flash`:
     - Highlights highest mastery using positive pedagogical reinforcement.
     - Formulates constructive guidance for the lowest score without pejorative phrasing.
  4. Returns a certified qualitative paragraph ready for report card printing.

#### 3.2.4 Audit Ledger Service
- **Purpose**: Enforces cryptographic transparency and immutability for all extra credit, bonus points, and score overrides.
- **Architecture**:
  - Manages the append-only collection `/organizations/{orgId}/bonus_point_transactions`.
  - For every transaction, computes a SHA-256 audit hash:
    $$\text{auditHash} = \text{SHA256}(\text{txId} + \text{studentId} + \text{teacherId} + \text{points} + \text{timestamp} + \text{salt})$$
  - Enforces hard ceiling constraints: ensures that awarding points cannot elevate a score above 100, nor breach the configured term bonus cap (+5 points).

#### 3.2.5 Google Workspace Export Worker
- **Purpose**: Asynchronous background worker handling high-volume file conversions, multi-range batch spreadsheets creation, and cloud storage synchronization.
- **Quota & Rate-Limiting Guardrails**:
  - Integrates with Google Cloud Tasks (`google-workspace-export-queue`) to enforce project-level rate limits (max 4 dispatches/second = 240 requests/minute, safely below the 300 req/min Google Sheets quota ceiling).
  - Uses `spreadsheets.values.batchUpdate` and `spreadsheets.batchUpdate` to compile entire gradebooks, formulas, and formatting rules into exactly two HTTP requests per classroom, preventing quota exhaustion during end-of-term mass exports.
  - Implements full exponential backoff with jitter on HTTP 429/503 responses (`retryConfig: { maxAttempts: 5, minBackoffSeconds: 2, maxBackoffSeconds: 60 }`).
- **Capabilities**:
  - Compiles grade matrices into multi-tab Google Sheets with automated formulas, frozen header rows, and conditional formatting.
  - Converts generated Modul Ajar and LKPD markdown trees into styled Google Docs files using the Google Docs BatchUpdate API.
  - Renders print-ready, high-resolution PDF report cards with school headers and signature lines.

---

## 4. COMPREHENSIVE DATA MODELS & SCHEMAS

All data models are authored in production-grade TypeScript interfaces and map directly to Cloud Firestore document collections.

### 4.1 Organizations & Schools (`organizations`)
- **Collection Path**: `/organizations/{orgId}`
- **Document ID**: NPSN (Nomor Pokok Sekolah Nasional), e.g., `"20219842"`.

```typescript
export interface Organization {
  orgId: string;                      // NPSN identifier (e.g., "20219842")
  name: string;                       // e.g., "SMA Negeri 1 Bandung"
  stage: "SD" | "SMP" | "SMA" | "SMK"; // Educational tier
  accreditation: "A" | "B" | "C" | "Belum Terakreditasi";
  address: {
    street: string;
    villageOrKelurahan: string;
    subdistrictOrKecamatan: string;
    cityOrRegency: string;
    province: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  headmaster: {
    name: string;
    nip: string;
    signatureUrl?: string;
  };
  settings: {
    defaultKktpThreshold: number;     // e.g., 75
    remedialPolicy: "KKTP_CAP" | "ACTUAL_SCORE" | "BLENDED_AVERAGE";
    bonusPointSemesterCap: number;    // e.g., 5
    allowPublicLeaderboard: boolean;  // Ethics control
    googleWorkspaceDomain?: string;   // e.g., "sman1bandung.sch.id"
  };
  createdAt: string;                  // ISO 8601 UTC
  updatedAt: string;
}
```

### 4.2 Academic Years & Semesters (`academic_years` / `semesters`)
- **Collection Path**: `/organizations/{orgId}/academic_years/{yearId}`
- **Subcollection Path**: `/organizations/{orgId}/academic_years/{yearId}/semesters/{semesterId}`

```typescript
export interface AcademicYear {
  id: string;                         // e.g., "ay_2025_2026"
  orgId: string;
  name: string;                       // "Tahun Ajaran 2025/2026"
  startDate: string;                  // "2025-07-14"
  endDate: string;                    // "2026-06-26"
  status: "ACTIVE" | "ARCHIVED" | "UPCOMING";
  createdAt: string;
  updatedAt: string;
}

export interface Semester {
  id: string;                         // e.g., "sem_2025_ganjil"
  academicYearId: string;             // "ay_2025_2026"
  orgId: string;
  type: "GANJIL" | "GENAP";
  name: string;                       // "Semester Ganjil 2025/2026"
  startDate: string;                  // "2025-07-14"
  endDate: string;                    // "2025-12-19"
  midTermAssessmentWindow?: {
    startDate: string;
    endDate: string;
  };
  finalAssessmentWindow?: {
    startDate: string;
    endDate: string;
  };
  reportCardDistributionDate: string; // "2025-12-20"
  isCurrent: boolean;
}
```

### 4.3 Class Sections / Rombongan Belajar (`class_sections`)
- **Collection Path**: `/organizations/{orgId}/class_sections/{classId}`

```typescript
export interface ClassSection {
  id: string;                         // e.g., "cls_2025_X_E1"
  orgId: string;
  academicYearId: string;
  semesterId: string;
  name: string;                       // "X-E1"
  gradeLevel: number;                 // 10
  fase: "A" | "B" | "C" | "D" | "E" | "F";
  homeroomTeacherId: string;          // User ID of Wali Kelas
  homeroomTeacherName: string;
  roomNumber: string;                 // "Ruang 204"
  capacity: number;                   // Standard: 36
  enrolledCount: number;
  scheduleSlots: Array<{
    day: "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu";
    periodStart: number;              // Jam Ke- (e.g., 1)
    periodEnd: number;                // Jam Ke- (e.g., 3)
    timeStart: string;                // "07:15"
    timeEnd: string;                  // "09:30"
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
  }>;
  status: "ACTIVE" | "ARCHIVED";
}
```

### 4.4 Students & Demographics (`students`)
- **Collection Path**: `/organizations/{orgId}/students/{studentId}`

```typescript
export interface ParentalConsent {
  status: "CONSENTED" | "REFUSED" | "PENDING";
  consentingGuardianNik: string;      // 16-digit NIK of parent/guardian (UU PDP Art. 25)
  consentingGuardianName: string;
  relationship: "Ayah" | "Ibu" | "Wali";
  consentDate: string;               // ISO 8601 UTC
  guardianId?: string;               // Firebase Auth UID if guardian has portal account
  scope: Array<"ACADEMIC_PROCESSING" | "HEALTH_RECORDS" | "ATTENDANCE_ALERTS" | "AI_ASSESSMENT">;
  revocableFlag: boolean;            // Article 25 UU PDP revocability guarantee
  revokedAt?: string;
  consentDocumentUrl?: string;       // Signed digital consent PDF URL in Cloud Storage
}

export interface Student {
  id: string;                         // e.g., "std_2025_00192"
  orgId: string;
  currentClassId: string;             // "cls_2025_X_E1"
  identifiers: {
    nis: string;                      // Nomor Induk Siswa (e.g., "212210045")
    nisn: string;                     // Nomor Induk Siswa Nasional (10 digits; zero-padded string)
    nik: string;                      // Nomor Induk Kependudukan (16 digits; sensitive PII)
  };
  personal: {
    fullName: string;
    preferredName: string;
    gender: "L" | "P";                // Laki-laki / Perempuan
    birthPlace: string;
    birthDate: string;                // "YYYY-MM-DD"
    religion: "Islam" | "Kristen" | "Katolik" | "Hindu" | "Buddha" | "Konghucu";
    avatarUrl?: string;
    address: {
      street: string;
      rtRw: string;
      village: string;
      subdistrict: string;
      city: string;
      province: string;
      postalCode: string;
    };
  };
  guardians: Array<{
    relationship: "Ayah" | "Ibu" | "Wali";
    name: string;
    nik?: string;
    phone: string;
    whatsappNumber: string;
    email?: string;
    occupation?: string;
  }>;
  academicAccommodations?: {
    specialNeedsNotes?: string;       // e.g., "Perlu duduk di baris depan (rabun jauh)"
    differentiatedTier: "FONDASI" | "REGULER" | "MAHIR";
  };
  parentalConsent: ParentalConsent;   // Mandatory child data processing consent (UU PDP No. 27/2022)
  status: "ACTIVE" | "TRANSFERRED" | "GRADUATED" | "DROPPED_OUT";
  createdAt: string;
  updatedAt: string;
}
```

### 4.5 Attendance Records (`attendance_records`)
- **Collection Path**: `/organizations/{orgId}/attendance_records/{attendanceId}`
- **Collision-Resistant Document ID Pattern**:
  * *Subject Session Attendance*: `{classId}_{subjectId}_{date}_{meetingNumber}` (e.g., `"cls_10_E1_sub_mat_20261031_m12"`). Incorporating `subjectId` and `meetingNumber` guarantees absolute uniqueness when multiple subject teachers teach the same class section on the same calendar day, preventing accidental record overwrites.
  * *Daily Homeroom Attendance*: `{classId}_homeroom_{date}_daily` (e.g., `"cls_10_E1_homeroom_20261031_daily"`).

```typescript
export type AttendanceStatusCode = "H" | "S" | "I" | "A" | "T" | "D";
// H: Hadir, S: Sakit, I: Izin, A: Alfa, T: Terlambat, D: Dispensasi

export interface AttendanceRecordEntry {
  studentId: string;
  studentName: string;
  status: AttendanceStatusCode;
  minutesLate?: number;               // Populated if status === "T"
  excuseNote?: string;                // Doctor's note or parent letter
  evidenceAttachmentUrl?: string;
}

export interface AttendanceRecord {
  id: string;                         // Document ID following collision-resistant pattern
  orgId: string;
  classId: string;
  academicYearId: string;
  semesterId: string;
  subjectId?: string;                 // Populated for SUBJECT_SESSION; omitted for DAILY_HOMEROOM
  recorderTeacherId: string;
  recorderTeacherName: string;
  date: string;                       // "2026-10-31"
  meetingNumber?: number;             // Pertemuan Ke- (for subject attendance, e.g., 12)
  type: "DAILY_HOMEROOM" | "SUBJECT_SESSION";
  records: AttendanceRecordEntry[];
  summary: {
    present: number;
    sick: number;
    excused: number;
    unexcused: number;
    tardy: number;
    dispensation: number;
    totalEnrolled: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

### 4.6 Curriculum Plans (`curriculum_plans`)
- **Collection Path**: `/organizations/{orgId}/curriculum_plans/{planId}`
- **Purpose**: Stores the comprehensive synthesized curriculum architecture for a subject/fase.

```typescript
export interface TujuanPembelajaranItem {
  tpId: string;                       // e.g., "TP-10.1"
  elementName: string;                // e.g., "Bilangan"
  competencyWord: string;             // Kata Kerja Operasional (e.g., "Menganalisis")
  bloomLevel: "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
  contentScope: string;               // Lingkup Materi (e.g., "Eksponen dan Logaritma")
  statement: string;                  // Full TP statement
  targetP3Dimensions: Array<"Beriman" | "Berkebinekaan_Global" | "Gotong_Royong" | "Mandiri" | "Bernalar_Kritis" | "Kreatif">;
  estimatedJp: number;                // e.g., 6 JP
}

export interface AtpSequenceItem {
  sequenceOrder: number;              // 1, 2, 3...
  tpId: string;
  pedagogicalRationale: string;       // Reason for sequencing order
  allocatedJp: number;
  semesterTarget: "GANJIL" | "GENAP";
}

export interface KktpRubricLevel {
  criterion: string;
  perluBimbingan: string;             // Standard Kurikulum Merdeka Level 1 (alias: baruBerkembang)
  cukup: string;                      // Standard Kurikulum Merdeka Level 2 (alias: layak)
  baik: string;                       // Standard Kurikulum Merdeka Level 3 (alias: cakap)
  mahir: string;                      // Standard Kurikulum Merdeka Level 4
  // Backward-compatibility aliases for transitional schemas:
  baruBerkembang?: string;
  layak?: string;
  cakap?: string;
}

export interface KktpSpecification {
  tpId: string;
  method: "INTERVAL" | "RUBRIK_4_SKALA" | "DESKRIPSI_KRITERIA";
  // Continuous half-open intervals resolving floating-point gaps [0, 40], (40, 65], (65, 85], (85, 100]
  intervals?: Array<{
    minScore: number;                 // e.g., 0.0, 40.0, 65.0, 85.0
    maxScore: number;                 // e.g., 40.0, 65.0, 85.0, 100.0
    isMinInclusive: boolean;          // true for 0.0; false for subsequent continuous tiers
    isMaxInclusive: boolean;          // true across all tiers
    interpretation: string;
    interventionAction: string;
  }>;
  rubricLevels?: KktpRubricLevel[];   // Harmonized 4-tier rubric levels
  criteriaChecklist?: Array<{
    indicator: string;
    isRequiredForMastery: boolean;
  }>;
}

export interface CurriculumPlan {
  id: string;                         // e.g., "cp_plan_matematika_fase_e_2025"
  orgId: string;
  subjectId: string;
  subjectName: string;
  fase: "A" | "B" | "C" | "D" | "E" | "F";
  gradeLevel: number;
  academicYearId: string;
  authorTeacherId: string;
  authorTeacherName: string;
  rawCapaianPembelajaran: {
    sourceDecree: string;             // "BSKAP No. 032/H/KR/2024"
    generalRationale: string;
    elementSummaries: Record<string, string>;
  };
  tujuanPembelajaranList: TujuanPembelajaranItem[];
  alurTujuanPembelajaran: AtpSequenceItem[];
  kktpSpecifications: KktpSpecification[];
  analisisMingguEfektif: {
    semesterGanjil: {
      totalCalendarWeeks: number;
      nonEffectiveWeeks: number;
      effectiveWeeks: number;
      jpPerWeek: number;
      totalEffectiveJp: number;
    };
    semesterGenap: {
      totalCalendarWeeks: number;
      nonEffectiveWeeks: number;
      effectiveWeeks: number;
      jpPerWeek: number;
      totalEffectiveJp: number;
    };
  };
  programTahunan: Array<{
    semester: "GANJIL" | "GENAP";
    tpId: string;
    topic: string;
    allocatedJp: number;
  }>;
  programSemester: Array<{
    semester: "GANJIL" | "GENAP";
    tpId: string;
    monthlyWeeklyDistribution: Record<string, number>; // e.g., {"Jul_W3": 2, "Jul_W4": 2}
  }>;
  status: "DRAFT" | "SUBMITTED" | "APPROVED_BY_KURIKULUM";
  createdAt: string;
  updatedAt: string;
}
```

### 4.7 Lesson Plans / Modul Ajar (`lesson_plans`)
- **Collection Path**: `/organizations/{orgId}/lesson_plans/{planId}`
- **Purpose**: Authoritative 3-part Modul Ajar structure per Permendikbudristek 16/2022 and PPA 2024.

```typescript
export interface ModulAjarDocument {
  id: string;                         // e.g., "ma_mat_10_tp1_pertemuan1"
  orgId: string;
  curriculumPlanId: string;
  subjectName: string;
  fase: "A" | "B" | "C" | "D" | "E" | "F";
  gradeLevel: number;
  meetingNumber: number;              // Pertemuan Ke-1
  allocatedTimeMinutes: number;       // e.g., 90 (2 JP x 45 min)
  targetTpIds: string[];              // ["TP-10.1"]
  
  // BAGIAN I: INFORMASI UMUM
  generalInfo: {
    authorName: string;
    institution: string;
    academicYear: string;
    initialCompetency: string[];      // Pengetahuan/Keterampilan Prasyarat
    p3ProfileDimensions: string[];    // Profil Pelajar Pancasila
    facilitiesAndInfrastructure: string[]; // Sarana dan Prasarana
    targetStudents: "REGULER" | "KESULITAN_BELAJAR" | "PENCAPAIAN_TINGGI";
    learningModel: "PROBLEM_BASED_LEARNING" | "PROJECT_BASED_LEARNING" | "INQUIRY" | "DISCOVERY";
  };

  // BAGIAN II: KOMPONEN INTI
  coreComponents: {
    learningObjectives: string[];
    meaningfulUnderstanding: string;  // Pemahaman Bermakna
    triggerQuestions: string[];       // Pertanyaan Pemantik
    instructionalActivities: {
      openingActivities: Array<{ step: string; durationMinutes: number }>;
      coreActivities: Array<{
        syntaxPhase: string;
        teacherActivity: string;
        studentActivity: string;
        differentiatedAspect?: "KONTEN" | "PROSES" | "PRODUK";
        durationMinutes: number;
      }>;
      closingActivities: Array<{ step: string; durationMinutes: number }>;
    };
    assessments: {
      diagnostic: { technique: string; instrumentDescription: string };
      formative: { technique: string; instrumentDescription: string };
      summative: { technique: string; instrumentDescription: string };
    };
    remedialAndEnrichment: {
      enrichmentActivity: string;
      remedialActivity: string;
    };
    teacherAndStudentReflection: {
      studentQuestions: string[];
      teacherQuestions: string[];
    };
  };

  // BAGIAN III: LAMPIRAN
  appendices: {
    associatedLkpdId?: string;
    readingMaterials: Array<{ title: string; content: string }>;
    glossary: Array<{ term: string; definition: string }>;
    bibliography: string[];
  };

  createdAt: string;
  updatedAt: string;
}
```

### 4.8 LKPD Documents (`lkpd_documents`)
- **Collection Path**: `/organizations/{orgId}/lkpd_documents/{lkpdId}`

```typescript
export interface LkpdDocument {
  id: string;                         // e.g., "lkpd_mat_10_meet1"
  orgId: string;
  modulAjarId: string;
  meetingNumber: number;
  title: string;                      // "LKPD 1: Menemukan Pola Eksponen"
  targetTp: string;
  allocatedTimeMinutes: number;
  groupType: "INDIVIDUAL" | "PAIRS" | "GROUPS_OF_4";
  toolsAndMaterials: string[];
  backgroundContext: string;          // Stimulus naratif/kontekstual
  guidedInstructions: string[];
  
  // Differentiated Inquiry Activities
  activitySections: Array<{
    sectionNumber: number;
    title: string;
    instruction: string;
    scaffoldingLevel: "DASAR" | "MENENGAH" | "MAHIR";
    questionType: "LOTS" | "HOTS";
    promptText: string;
    spaceForAnswer: "SHORT_TEXT" | "TABLE_INPUT" | "DRAWING_CANVAS" | "LONG_ESSAY";
  }>;

  scoringRubric: Array<{
    aspect: string;
    maxScore: number;
    criteria: string;
  }>;
  teacherAnswerKeyAndNotes: string;   // Confidential guide for grading
  createdAt: string;
  updatedAt: string;
}
```

### 4.9 Assessment Categories & Definitions (`assessment_definitions`)
- **Collection Path**: `/organizations/{orgId}/assessment_definitions/{assessmentId}`

```typescript
export interface AssessmentDefinition {
  id: string;                         // e.g., "asm_mat_10_sumatif_tp1"
  orgId: string;
  academicYearId: string;
  semesterId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  title: string;                      // "Sumatif 1: Eksponen dan Logaritma"
  type: "FORMATIF_PROSES" | "SUMATIF_TP" | "SUMATIF_AKHIR_SEMESTER";
  mappedTpId: string;                 // "TP-10.1"
  technique: "TES_TERTULIS" | "KINERJA" | "PROYEK" | "PORTOFOLIO";
  kktpModel: "INTERVAL" | "RUBRIK" | "DESKRIPSI";
  kktpPassingThreshold: number;       // e.g., 75
  maxRawScore: number;                // Standard: 100
  weight: number;                     // Standard: 1.0
  dateAdministered: string;           // "2026-10-15"
  status: "OPEN" | "FINALIZED" | "ARCHIVED";
  createdAt: string;
}
```

### 4.10 Grade Entries (`grade_entries`)
- **Collection Path**: `/organizations/{orgId}/grade_entries/{entryId}`
- **Document ID Pattern**: `{assessmentId}_{studentId}` (e.g., `"asm_mat_10_sumatif_tp1_std_2025_00192"`)

```typescript
export interface GradeEntry {
  id: string;                         // "{assessmentId}_{studentId}"
  orgId: string;
  assessmentId: string;
  studentId: string;
  classId: string;
  subjectId: string;
  rawScore: number;                   // Bounded: 0.0 <= rawScore <= 100.0 (preserved to 2 decimal places)
  bonusPointsApplied: number;         // e.g., +3.0 (from Bonus Point Ledger; capped at term max +5.0)
  finalScore: number;                 // min(rawScore + bonusPointsApplied, 100.0)
  isRemedial: boolean;
  remedialScore?: number;             // Bounded: 0.0 <= remedialScore <= 100.0
  remedialHistory?: Array<{
    attemptNumber: number;
    rawRemedialScore: number;
    effectiveScoreCalculated: number; // Preserves 2 decimal places (e.g., 70.50)
    date: string;
    teacherNotes?: string;
  }>;
  masteryStatus: "BELUM_MENCAPAI" | "SUDAH_MENCAPAI" | "MAHIR";
  teacherFeedbackNote?: string;
  updatedByTeacherId: string;
  // Concurrency & Conflict Resolution Metadata (OCC / Hybrid Logical Clock)
  clientMutationTimestamp: string;    // ISO 8601 with millisecond precision (e.g., "2026-10-31T08:00:15.123Z")
  baseVersion: number;                // Incremental version sequence known to client during mutation
  mutationVersion: number;            // baseVersion + 1
  updatedAt: string;
}
```

### 4.11 Bonus Point Transactions (`bonus_point_transactions`)
- **Collection Path**: `/organizations/{orgId}/bonus_point_transactions/{transactionId}`
- **Collision-Resistant Document ID Pattern**: `tx_bonus_{uuid}` (e.g., `"tx_bonus_7f3b89c2-e14a-4d76-88a2-fb918a36d29e"`). Client generates a cryptographically secure UUID (`crypto.randomUUID()`), completely eliminating ID collisions across concurrent offline devices or multiple awards on the same day.
- **Audited Append & Controlled Revocation Guarantee**:
  * New transactions are append-only.
  * Point values, recipient IDs, and issuer hashes are immutable once created.
  * Teachers cannot delete transactions or alter `pointsAwarded`.
  * To rectify errors, authorized teachers or admins execute a **controlled revocation** by transitioning `status` from `"ACTIVE"` to `"REVOKED"` with mandatory audit metadata (`revokedAt`, `revokedByTeacherId`, `reason`). This maintains a transparent, tamper-evident forensic trail.

```typescript
export interface BonusPointTransaction {
  id: string;                         // "tx_bonus_{uuid}"
  orgId: string;
  timestamp: string;                  // ISO 8601 UTC
  issuerTeacherId: string;
  issuerTeacherName: string;
  recipientStudentId: string;
  recipientStudentName: string;
  subjectId: string;
  classId: string;
  track: "ACADEMIC_BONUS" | "ENGAGEMENT_XP";
  pointsAwarded: number;              // Positive integer (1 <= pointsAwarded <= 10)
  targetAssessmentId?: string;        // Populated if tied to specific exam
  rationale: string;                  // e.g., "Menemukan solusi alternatif pembuktian rumus"
  auditHash: string;                  // SHA-256(id + studentId + points + timestamp + secret)
  status: "ACTIVE" | "REVOKED";
  revocation?: {
    revokedAt: string;                // ISO 8601 UTC
    revokedByTeacherId: string;       // Must match issuer or organization admin
    reason: string;                   // Mandatory rationale for forensic audit
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 5. USER INTERFACE ARCHITECTURE & UX WIREFLOW DIAGRAMS

### 5.1 UI Design System & Component Hierarchy
The presentation tier is constructed using a modern, utility-first design system optimized for high visual density and clarity:
- **Foundational Styling**: Tailwind CSS with custom educational themes (Kemendikbud Navy `#0A2540`, Merdeka Blue `#1E40AF`, Emerald `#059669`, Amber `#D97706`, Coral `#DC2626`).
- **Headless UI Primitives**: Radix UI primitives (`@radix-ui/react-*`) wrapped in Shadcn UI components for accessible dialogs, popovers, dropdowns, and tooltips.
- **Iconography**: Lucide React icons.

### 5.2 Master Teacher Dashboard UI
The Master Teacher Dashboard serves as the central command cockpit.

```
+===================================================================================================+
| [LOGO] GuruMerdeka Pro      Dashboard   Kelas & Siswa   Buku Nilai   Perangkat Kurikulum  [Profile|Foto] |
+===================================================================================================+
| Selamat Datang, Dra. Sri Wahyuni, M.Pd. | SMAN 1 Bandung | Semester Ganjil 2025/2026             |
+---------------------------------------------------------------------------------------------------+
| [ KPI METRICS ROW ]                                                                               |
| +-------------------+  +-------------------+  +-------------------+  +--------------------------+ |
| | TOTAL ROMBEL      |  | TOTAL SISWA DIAJAR|  | KEHADIRAN HARI INI|  | PENDING e-RAPOR DESKRIPSI| |
| | 4 Kelas (Fase E)  |  | 142 Siswa         |  | 98.2% (139 Hadir) |  | 8 Siswa Perlu Review     | |
| +-------------------+  +-------------------+  +-------------------+  +--------------------------+ |
+---------------------------------------------------------------------------------------------------+
| [ JADWAL MENGAJAR HARI INI (SENIN) ]                                                              |
| 1. 07:15 - 09:30 | Matematika (X-E1) | Ruang 204 | Pertemuan Ke-12 | [Buka Denah & Presensi]     |
| 2. 10:00 - 12:15 | Matematika (X-E3) | Ruang 206 | Pertemuan Ke-12 | [Buka Denah & Presensi]     |
+---------------------------------------------------------------------------------------------------+
| [ QUICK ACTION LAUNCHERS ]                                                                        |
| [ + Buat Modul Ajar Baru ]  [ Buka Buku Nilai X-E1 ]  [ Ekspor Data ke Google Sheets ]            |
+---------------------------------------------------------------------------------------------------+
| [ TUGAS ADMINISTRASI & PERINGATAN DINI ]                                                          |
| - Peringatan Kehadiran: Raden Fajar (X-E1) tidak hadir 3 hari berturut-turut. [Kirim Notif WA Wali]|
| - Remedial Sumatif 2: 5 siswa di bawah KKTP (75) pada materi Logaritma. [Jadwalkan Remedial]      |
+===================================================================================================+
```

### 5.3 Class Roster & Seating Chart UI
The Seating Chart provides visual, spatial management of physical classroom pods.

```
+===================================================================================================+
| < Kembali ke Kelas | Denah Tempat Duduk: Kelas X-E1 | Mode: [ Presensi Harian v ]  [Simpan Layout] |
+===================================================================================================+
| [ PAPAN TULIS & MEJA GURU (DEPAN KELAS) ]                                                         |
| ------------------------------------------------------------------------------------------------- |
|                                                                                                   |
|  BARIS 1:                                                                                         |
|  +------------------------+  +------------------------+  +------------------------+               |
|  | [H] Fajar Santoso      |  | [H] Siti Nurhaliza     |  | [S] Ahmad Dahlan       |               |
|  | NISN: 0081234567       |  | NISN: 0081234568       |  | (Surat Dokter Ada)     |               |
|  | Status: [ Hadir    v ] |  | Status: [ Hadir    v ] |  | Status: [ Sakit    v ] |               |
|  | [+ Poin] [- Poin] [XP] |  | [+ Poin] [- Poin] [XP] |  | [+ Poin] [- Poin] [XP] |               |
|  +------------------------+  +------------------------+  +------------------------+               |
|                                                                                                   |
|  BARIS 2:                                                                                         |
|  +------------------------+  +------------------------+  +------------------------+               |
|  | [H] Budi Pratama       |  | [A] Rizky Ramadhan     |  | [H] Dewi Lestari       |               |
|  | NISN: 0081234569       |  | (Tanpa Keterangan)     |  | NISN: 0081234571       |               |
|  | Status: [ Hadir    v ] |  | Status: [ Alfa     v ] |  | Status: [ Hadir    v ] |               |
|  | [+ Poin] [- Poin] [XP] |  | [+ Poin] [- Poin] [XP] |  | [+ Poin] [- Poin] [XP] |               |
|  +------------------------+  +------------------------+  +------------------------+               |
+===================================================================================================+
```

### 5.4 Virtualized Matrix Gradebook UI
The Matrix Gradebook replicates high-density spreadsheet capability directly in the browser with live calculations.

```
+===================================================================================================+
| Buku Nilai: Matematika Fase E | Kelas: X-E1 | KKTP Sekolah: 75 | [Simpan Otomatis (Tersinkron)]   |
| [Filter: Semua Asesmen v] [Cari Siswa: _______] [ Ekspor ke Google Sheets ] [ Cetak e-Rapor ]     |
+===================================================================================================+
| No | NISN       | Nama Siswa        | Formatif 1 | Sumatif 1 | Sumatif 2 | SAS   | Rapor | Status |
|    |            |                   | (Diagnostik| (TP 10.1) | (TP 10.2) | (Akhir| Akhir | KKTP   |
|    |            |                   | Non-Nilai) | Bobot: 1  | Bobot: 1  | Bobot2| (Auto)|        |
+----+------------+-------------------+------------+-----------+-----------+-------+-------+--------+
| 1  | 0081234567 | Raden M. Fajar    | [Siap    ] | [  88   ] | [  92   ] | [ 90] |  90.5 | TUNTAS |
| 2  | 0081234568 | Siti Nurhaliza    | [Perlu Bmg] | [  74*  ] | [  85   ] | [ 80] |  81.0 | TUNTAS |
| 3  | 0081234569 | Ahmad Dahlan      | [Siap    ] | [  95   ] | [  98   ] | [ 96] |  96.5 | TUNTAS |
| 4  | 0081234570 | Rizky Ramadhan    | [Perlu Bmg] | [  62*  ] | [  68*  ] | [ 70] |  67.5 | REMED  |
+----+------------+-------------------+------------+-----------+-----------+-------+-------+--------+
| * = Di bawah KKTP (75). Tekan [ENTER] ke baris bawah, [TAB] ke kolom kanan. Navigasi Keyboard Aktif.|
+===================================================================================================+
```

### 5.5 Curriculum Tools Generation Wizard Stepper
The multi-step stepper guides teachers through standard-compliant planning.

```
+===================================================================================================+
| GENERATOR PERANGKAT KURIKULUM MERDEKA (Permendikbudristek 12/2024 & BSKAP 032/H/KR/2024)          |
+---------------------------------------------------------------------------------------------------+
|  (1) Analisis CP ---> (2) Rumusan TP ---> (3) Alur ATP ---> (4) KKTP ---> (5) AME ---> (6) PROTA |
|      [SELESAI]            [SELESAI]           [AKTIF]         [MENUNGGU]    [MENUNGGU]   [MENUNGGU] |
+---------------------------------------------------------------------------------------------------+
| LANGKAH 3: ALUR TUJUAN PEMBELAJARAN (ATP) & ALOKASI JAM PELAJARAN (JP)                            |
| Target Fase: E (Kelas 10 SMA) | Mata Pelajaran: Matematika | Total JP Fase: 108 JP / Tahun         |
+---------------------------------------------------------------------------------------------------+
| Urutan | Kode TP | Rumusan Tujuan Pembelajaran             | Rasional Pedagogis   | Alokasi JP    |
+--------+---------+-----------------------------------------+----------------------+---------------+
| 1      | TP-10.1 | Menerapkan konsep eksponen dan logaritma| Fondasi aljabar dasar| [ 12 JP     ] |
| 2      | TP-10.2 | Memodelkan fenomena eksponensial nyata  | Kontekstualisasi     | [  8 JP     ] |
| 3      | TP-10.3 | Menyelesaikan SPLTV dengan eliminasi    | Prosedural aljabar   | [ 14 JP     ] |
+---------------------------------------------------------------------------------------------------+
| [ AI Action: Validasi Keseimbangan JP dengan Gemini ]   [ < Kembali ]   [ Lanjut ke KKTP > ]      |
+===================================================================================================+
```

### 5.6 Modul Ajar & LKPD Studio Split-Screen Workspace
The studio interface combines interactive parameter tuning with real-time preview.

```
+===================================================================================================+
| STUDIO MODUL AJAR & LKPD | Pertemuan Ke-1: Eksponen Dasar | [Ekspor Docs] [Ekspor PDF] [Simpan]    |
+===================================================================================================+
| PANE KIRI: PARAMETER & DIFERENSIASI (35%) | PANE KANAN: LIVE MARKDOWN & LKPD PREVIEW (65%)        |
+-------------------------------------------+-------------------------------------------------------+
| Model Pembelajaran:                       | # MODUL AJAR: MATEMATIKA FASE E                       |
| (•) Problem-Based Learning                | **Pertemuan 1: Eksponen dan Sifat-sifatnya (2 JP)**   |
| ( ) Project-Based Learning                |                                                       |
| ( ) Discovery Learning                    | ## I. INFORMASI UMUM                                  |
|                                           | - **Sekolah**: SMAN 1 Bandung                         |
| Pendekatan Diferensiasi:                  | - **Profil Pelajar Pancasila**: Bernalar Kritis,      |
| [X] Diferensiasi Konten (Visual/Auditori) |   Kreatif, Mandiri.                                   |
| [X] Diferensiasi Proses (Tingkat Bantuan) |                                                       |
| [ ] Diferensiasi Produk (Variasi Output)  | ## II. KOMPONEN INTI                                  |
|                                           | ### Pertanyaan Pemantik:                              |
| Tingkat Kesulitan LKPD:                   | 1. Bagaimana bakteri membelah diri dari 1 menjadi jutaan|
| [ Basic ]  [ Intermediate ]  [ Advanced ] |    dalam hitungan jam?                                |
|                                           |                                                       |
| [ Re-Generate Bagian Komponen Inti ]      | ### Aktivitas Inti (Sintaks PBL):                     |
| [ Tune Pertanyaan Diskusi HOTS ]          | - Fase 1: Orientasi masalah kontekstual               |
|                                           | - Fase 2: Pengorganisasian kelompok belajar           |
+===================================================================================================+
```

---

## 6. SECURITY, COMPLIANCE & GOVERNANCE

### 6.1 Declarative Cloud Firestore Security Rules Specification
The system enforces security, multi-tenant isolation, role-based access control (RBAC), and mathematical data invariants directly at the database layer using declarative Cloud Firestore Security Rules (`firestore.rules`).

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // =========================================================================
    // AUTHENTICATION & RBAC HELPER FUNCTIONS
    // =========================================================================
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserData() {
      return request.auth.token;
    }

    function isMemberOfOrg(orgId) {
      return isAuthenticated() && getUserData().orgId == orgId;
    }

    function hasRole(orgId, role) {
      return isMemberOfOrg(orgId) && getUserData().role == role;
    }

    function isSuperAdmin() {
      return isAuthenticated() && getUserData().role == "SUPER_ADMIN";
    }

    function isAdmin(orgId) {
      return isSuperAdmin() || hasRole(orgId, "ADMIN");
    }

    function isTeacher(orgId) {
      return isAdmin(orgId) || hasRole(orgId, "WALI_KELAS") || hasRole(orgId, "GURU_MAPEL");
    }

    // Fetches the teacher assignment profile from Firestore (cached across evaluation rules)
    function getTeacherProfile(orgId) {
      return get(/databases/$(database)/documents/organizations/$(orgId)/teachers/$(request.auth.uid)).data;
    }

    // Verifies whether the authenticated teacher is assigned to the specified class section
    function isAssignedToClass(orgId, classId) {
      return isTeacher(orgId) && (isAdmin(orgId) || (classId in getTeacherProfile(orgId).assignedClassIds));
    }

    // Verifies whether the teacher is assigned to both the class section and subject
    function isAssignedToSubjectAndClass(orgId, classId, subjectId) {
      return isTeacher(orgId) && (isAdmin(orgId) || (
        classId in getTeacherProfile(orgId).assignedClassIds &&
        subjectId in getTeacherProfile(orgId).assignedSubjectIds
      ));
    }

    function isAssignedTeacher(orgId, teacherId) {
      return isTeacher(orgId) && (isAdmin(orgId) || request.auth.uid == teacherId);
    }

    // =========================================================================
    // MULTI-TENANT ORGANIZATIONAL DOMAINS
    // =========================================================================
    match /organizations/{orgId} {
      allow read: if isMemberOfOrg(orgId);
      allow write: if isAdmin(orgId);

      // Academic Years & Semesters
      match /academic_years/{yearId} {
        allow read: if isMemberOfOrg(orgId);
        allow write: if isAdmin(orgId);

        match /semesters/{semesterId} {
          allow read: if isMemberOfOrg(orgId);
          allow write: if isAdmin(orgId);
        }
      }

      // Teacher Assignment Profiles
      match /teachers/{teacherId} {
        allow read: if isMemberOfOrg(orgId);
        allow write: if isAdmin(orgId);
      }

      // Class Sections / Rombel
      match /class_sections/{classId} {
        allow read: if isMemberOfOrg(orgId);
        allow write: if isAdmin(orgId);
      }

      // Students Directory (Privacy Protected under UU PDP No. 27/2022)
      match /students/{studentId} {
        // Teachers & Admins can read full roster; students can ONLY read their own profile,
        // blocking peer surveillance of NIK, home address, medical notes, and guardian contacts.
        allow read: if isTeacher(orgId) || 
          (isAuthenticated() && isMemberOfOrg(orgId) && getUserData().studentId == studentId);
        allow write: if isAdmin(orgId);

        // Highly sensitive personal data subcollection (Article 4(2) UU PDP)
        match /sensitive/{docId} {
          allow read, write: if isAdmin(orgId);
        }
      }

      // Attendance Records (Collision-Resistant & Assignment-Enforced)
      match /attendance_records/{attendanceId} {
        allow read: if isMemberOfOrg(orgId);
        // Teachers can ONLY write attendance for classes & subjects they are assigned to
        allow create, update: if isTeacher(orgId) && (
          isAdmin(orgId) || (
            request.auth.uid == request.resource.data.recorderTeacherId &&
            isAssignedToClass(orgId, request.resource.data.classId) &&
            (request.resource.data.type == "DAILY_HOMEROOM" || 
             (request.resource.data.type == "SUBJECT_SESSION" && 
              request.resource.data.subjectId in getTeacherProfile(orgId).assignedSubjectIds))
          )
        );
        allow delete: if isAdmin(orgId);
      }

      // Curriculum Plans, Lesson Plans & LKPD Documents
      match /curriculum_plans/{planId} {
        allow read: if isMemberOfOrg(orgId);
        allow write: if isTeacher(orgId);
      }

      match /lesson_plans/{planId} {
        allow read: if isMemberOfOrg(orgId);
        allow write: if isTeacher(orgId);
      }

      match /lkpd_documents/{lkpdId} {
        allow read: if isMemberOfOrg(orgId);
        allow write: if isTeacher(orgId);
      }

      // Assessment Definitions
      match /assessment_definitions/{assessmentId} {
        allow read: if isMemberOfOrg(orgId);
        allow write: if isTeacher(orgId) && (
          isAdmin(orgId) || isAssignedToSubjectAndClass(orgId, request.resource.data.classId, request.resource.data.subjectId)
        );
      }

      // Grade Entries (Mathematical Boundaries & Rombel Isolation)
      match /grade_entries/{entryId} {
        // Teachers can view class grades; students can ONLY view their own grade entries
        allow read: if isTeacher(orgId) || 
          (hasRole(orgId, "SISWA") && resource.data.studentId == getUserData().studentId);
        
        // Writes strictly enforce:
        // 1. Mandatory assignment verification (teacher assigned to class and subject)
        // 2. Strict mathematical bounds (0 <= rawScore <= 100, 0 <= finalScore <= 100)
        // 3. Remedial score boundaries (0 <= remedialScore <= 100)
        allow create, update: if isTeacher(orgId) &&
          request.resource.data.rawScore >= 0 &&
          request.resource.data.rawScore <= 100 &&
          request.resource.data.finalScore >= 0 &&
          request.resource.data.finalScore <= 100 &&
          (request.resource.data.remedialScore == null || (
            request.resource.data.remedialScore >= 0 && request.resource.data.remedialScore <= 100
          )) &&
          (isAdmin(orgId) || (
            request.auth.uid == request.resource.data.updatedByTeacherId &&
            isAssignedToSubjectAndClass(orgId, request.resource.data.classId, request.resource.data.subjectId)
          ));
        allow delete: if isAdmin(orgId);

        // Historical conflict audit subcollection
        match /conflict_history/{conflictId} {
          allow read: if isTeacher(orgId);
          allow write: if isTeacher(orgId);
        }
      }

      // Bonus Point Ledger (Audited Append & Controlled Revocation)
      match /bonus_point_transactions/{txId} {
        // Students can ONLY read their own bonus transactions (protects peer privacy and teacher counseling notes)
        allow read: if isTeacher(orgId) || 
          (hasRole(orgId, "SISWA") && resource.data.recipientStudentId == getUserData().studentId);
        
        // Append active bonus points (1 <= points <= 10, positive integer, audit hash present)
        allow create: if isTeacher(orgId) &&
                         request.resource.data.pointsAwarded > 0 &&
                         request.resource.data.pointsAwarded <= 10 &&
                         request.resource.data.status == "ACTIVE" &&
                         (isAdmin(orgId) || request.auth.uid == request.resource.data.issuerTeacherId) &&
                         request.resource.data.auditHash != null;
        
        // Controlled Revocation: Allows updating status from ACTIVE to REVOKED with mandatory audit metadata.
        // Points awarded, recipient student, and audit hash CANNOT be modified.
        allow update: if isTeacher(orgId) &&
                         resource.data.status == "ACTIVE" &&
                         request.resource.data.status == "REVOKED" &&
                         request.resource.data.pointsAwarded == resource.data.pointsAwarded &&
                         request.resource.data.recipientStudentId == resource.data.recipientStudentId &&
                         request.resource.data.auditHash == resource.data.auditHash &&
                         (isAdmin(orgId) || 
                          request.auth.uid == resource.data.issuerTeacherId || 
                          request.auth.uid == request.resource.data.revocation.revokedByTeacherId) &&
                         request.resource.data.revocation.revokedAt != null &&
                         request.resource.data.revocation.reason is string &&
                         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'revocation', 'updatedAt']);
        
        // Deletion is strictly prohibited to preserve an unalterable accounting trail
        allow delete: if false; 
      }
    }
  }
}
```

### 6.2 Indonesian UU Perlindungan Data Pribadi (UU PDP No. 27/2022) Compliance
Indonesian Law No. 27 of 2022 on Personal Data Protection establishes strict legal mandates regarding the collection, processing, transfer, and archival of personal data in educational institutions:

1. **Student Personal Data Classification**:
   - *Data Pribadi Umum (General Personal Data)*: Student full name, gender, school enrollment status, grade level.
   - *Data Pribadi Spesifik / Sensitif (Specific / Sensitive Personal Data - Article 4(2))*: Student 16-digit NIK (Nomor Induk Kependudukan), medical/disability accommodation notes, religious affiliation, parent/guardian NIK, and personal mobile/WhatsApp numbers.
2. **Statutory Parental Consent for Minors (Article 25 UU PDP)**:
   - Because K-12 students are minors under 18 years of age, Article 25 mandates that personal data processing must be explicitly authorized by parents or legal guardians.
   - The platform models explicit digital consent via the `ParentalConsent` entity in each student profile:
     * Records consenting guardian NIK, name, relationship, and consent timestamp.
     * Enforces granular consent scopes (`ACADEMIC_PROCESSING`, `HEALTH_RECORDS`, `ATTENDANCE_ALERTS`, `AI_ASSESSMENT`).
     * Supports immediate revocation (`revocableFlag: true`), automatically freezing non-essential processing if consent is withdrawn.
3. **Cryptographic Protection & Sovereign Hosting**:
   - All data in transit is encrypted using TLS 1.3 with HSTS headers.
   - Database storage is provisioned strictly within `asia-southeast2` (Jakarta, Indonesia) to comply with data residency and sovereignty requirements under PP No. 71/2019 and UU PDP.
   - Sensitive identifier fields (NIK) are additionally protected at rest via AES-256-GCM encryption.
4. **Data Retention & Right to Erasure**:
   - Official academic transcripts and e-Rapor marks are preserved for the statutory 30-year archival window.
   - Temporary communication logs, medical sick note image attachments, and chat transcripts are automatically deleted 12 months after student graduation.

### 6.3 Generative AI Governance & Student PII Pseudonymization Pipeline
To prevent data leaks, comply with international data transfer regulations (Articles 56 & 57 UU PDP), and ensure safe pedagogical AI generation:

#### 6.3.1 Student PII Pseudonymization Pipeline Architecture
External LLM endpoints (Google Gemini API) are deployed globally. Transmitting the legal names, NIK, or demographic identities of minor Indonesian students across international borders triggers severe statutory liabilities under UU PDP. Therefore, the system enforces a mandatory **Application-Level PII Pseudonymization Pipeline** prior to every GenAI API invocation:

```
+---------------------------------------------------------------------------------------------------+
|                            STUDENT PII PSEUDONYMIZATION PIPELINE                                  |
+---------------------------------------------------------------------------------------------------+

   [ Raw Student Master Data ] (NIK, Legal Name, Class, Formative/Summative Marks)
                |
                v
   +---------------------------------------------------------------------------------------------+
   | STAGE 1: PII SANITIZATION & EPHEMERAL TOKENIZATION (Runs inside asia-southeast2 Backend)   |
   | - Strips NIK, NISN, home address, medical notes, guardian contacts                          |
   | - Replaces Legal Name with Ephemeral Token (e.g., `[PESERTA_DIDIK_A]`)                      |
   | - Retains only purely pedagogical assessment metadata (TP achievement levels, raw scores)   |
   +---------------------------------------------------------------------------------------------+
                |
                v (Sanitized, De-identified Prompt Payload)
   +---------------------------------------------------------------------------------------------+
   | STAGE 2: EXTERNAL GENAI SYNTHESIS (Google Gemini 2.5 Flash / Pro)                           |
   | - Synthesizes standardized, third-person competency narrative                               |
   | - Strictly uses gender-neutral pedagogical descriptors ("Peserta didik menunjukkan...")     |
   | - Prohibited from requesting or hallucinating personal demographic identifiers             |
   +---------------------------------------------------------------------------------------------+
                |
                v (Qualitative Competency Narrative without PII)
   +---------------------------------------------------------------------------------------------+
   | STAGE 3: SOVEREIGN RE-IDENTIFICATION & REPORT CARD MERGE (Client / Sovereign Database)      |
   | - Receives clean pedagogical narrative back in Jakarta region (`asia-southeast2`)           |
   | - Re-attaches student legal name strictly in the local client UI or official e-Rapor PDF     |
   | - ZERO student PII is ever transmitted to or logged in external LLM infrastructure          |
   +---------------------------------------------------------------------------------------------+
```

#### 6.3.2 Server-Side Token Bucket Rate Limiting & Safety Settings
1. **Rate Limiting Counter**:
   - Implemented via Cloud Firestore and Redis counters:
     - Standard Teachers: 60 requests / minute, max 100,000 tokens / day.
     - Curriculum Leads: 120 requests / minute, max 500,000 tokens / day.
2. **Gemini Content Safety Settings**:
   - All API calls through `@google/genai` enforce strict thresholds across all safety categories:
     ```typescript
     import { HarmCategory, HarmBlockThreshold } from "@google/genai";

     export const standardSafetySettings = [
       { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
       { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
       { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
       { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
     ];
     ```
3. **Structured Schema Coercion**:
   - Every curriculum tool generator utilizes `responseSchema` enforcing unambiguous JSON conforming to JSON Schema Draft 2020-12. Free-form, unvalidated markdown generation is prohibited in core data pipelines.

---

## 7. RESILIENCE, OFFLINE-FIRST SYNC & SCALABILITY

### 7.1 Unified Offline Synchronization Lifecycle
Due to intermittent cellular coverage and power fluctuations in rural/semi-urban Indonesian schools, offline resilience is engineered as a core foundation rather than an afterthought:

```
+---------------------------------------------------------------------------------------------------+
|                       UNIFIED NATIVE FIRESTORE OFFLINE SYNCHRONIZATION FLOW                       |
+---------------------------------------------------------------------------------------------------+

   [ Teacher inputs grade / presensi / bonus point in UI ]
                           |
                           v
   [ Local Cache Store (IndexedDB via persistentLocalCache) ] <------ (Instant UI Update < 16ms)
                           |
                           | (Multi-tab coordination managed by persistentMultipleTabManager)
                           v
            [ Network Status: Online vs Offline ]
                   /                       \
             (ONLINE)                   (OFFLINE)
                 |                          |
                 v                          v
      [ Direct Stream to Cloud ]    [ Buffered locally in IndexedDB ]
                                            |
                                            | (Teacher continues normal grading offline)
                                            |
                                            v (Network Reconnected)
                                    [ Firestore SDK Native Auto-Replay ]
                                            |
                                            v
                               [ Cloud Firestore asia-southeast2 ]

   -----------------------------------------------------------------------------------------------
   AUXILIARY BINARY UPLOAD PIPELINE (Isolated from document writes):
   [ Medical Certificate Photo / Scanned LKPD ] ---> [ Local IndexedDB `pending_binary_uploads` ]
                                                                   | (Online Event)
                                                                   v
                                                     [ Resumable Cloud Storage Task ]
```

### 7.2 Conflict Resolution Matrix & Telemetry
In scenarios where co-teachers, remedial tutors, or administrators modify records concurrently during offline periods, the system applies a deterministic, mathematically sound conflict resolution strategy:

```
+===================================================================================================+
|                                    CONFLICT RESOLUTION MATRIX                                     |
+-----------------------------+-------------------------------+-------------------------------------+
| Data Entity                 | Conflict Scenario             | Resolution Policy                   |
+-----------------------------+-------------------------------+-------------------------------------+
| Attendance Record           | Homeroom vs Subject Teacher   | Separate Document IDs: Homeroom     |
|                             | mark attendance on same date  | `{classId}_homeroom_{date}_daily`   |
|                             |                               | and Subject Session `{classId}_     |
|                             |                               | {subjectId}_{date}_{meetingNo}`     |
|                             |                               | prevent collisions completely.      |
+-----------------------------+-------------------------------+-------------------------------------+
| Grade Entry                 | Concurrent offline score      | Hybrid Logical Clock (HLC) &        |
| (Raw Score & Remedials)     | modifications by two teachers | Hierarchical Score Precedence:      |
|                             | on different devices          | 1. Remedial Priority: Logged        |
|                             |                               |    remedial score takes precedence  |
|                             |                               | 2. Concurrent Raw Entries:          |
|                             |                               |    max(Score_A, Score_B) to protect |
|                             |                               |    student achievement rights       |
|                             |                               | 3. Client mutation timestamp logged |
|                             |                               | 4. Conflict archived in history sub-|
|                             |                               |    collection with teacher alert.   |
+-----------------------------+-------------------------------+-------------------------------------+
| Bonus Point Ledger          | Multiple offline bonus point  | Additive Merging with UUID IDs:     |
|                             | awards by different teachers  | Client generates `tx_bonus_{uuid}`; |
|                             |                               | all awards accepted; ceiling capping|
|                             |                               | (Score <= 100, max term bonus <= +5)|
|                             |                               | enforced at read / projection time. |
+-----------------------------+-------------------------------+-------------------------------------+
| Seating Chart Layout        | Desk coordinates modified on  | Last-Write-Wins based on client     |
|                             | two separate teacher tablets  | commit timestamp with UI visual     |
|                             |                               | layout refresh.                     |
+-----------------------------+-------------------------------+-------------------------------------+
```

### 7.3 Cloud Firestore Caching, Bundle Serving & Query Optimization
To minimize Firestore document read costs and stay well within the < $15/month budget:
1. **Firestore Data Bundles**:
   - Authoritative national curriculum standards (the entire BSKAP 032/H/KR/2024 Capaian Pembelajaran catalog across all subjects and fases) are compiled into static **Firestore Data Bundles** hosted on Google Cloud Storage / Firebase CDN.
   - When a teacher initializes the Curriculum Wizard, the bundle is downloaded once (HTTP 304 cached) and loaded directly into client IndexedDB memory with **zero Firestore document read charges**.
2. **Aggregated Summary Projections**:
   - Rather than executing expensive collection group queries across thousands of individual grade entries to compute class averages, Cloud Functions update a lightweight aggregated projection document (`/class_sections/{classId}/gradebook_summary`) whenever an assessment is finalized.
3. **Composite Indexing Strategy**:
   - Composite indexes are defined in `firestore.indexes.json` targeting queries such as:
     - `orgId` (ASC) + `classId` (ASC) + `date` (DESC)
     - `orgId` (ASC) + `academicYearId` (ASC) + `semesterId` (ASC) + `subjectId` (ASC)
   - Eliminates client-side memory filtering and ensures sub-second query execution across hundreds of thousands of historical records.

---

## 8. SUMMARY OF ARCHITECTURAL ATTESTATION
This System Architecture Document satisfies all requirements set forth in the system charter. By establishing the **Unified Hybrid Architecture**, the platform provides:
- Uncompromised, virtualized spreadsheet performance and interactive seating charts.
- Resilient offline persistence tailored to Indonesian school connectivity realities.
- Deep, regulatory-compliant Kurikulum Merdeka AI automation using Google's Gemini models.
- Seamless bi-directional Google Workspace interoperability.
- Rock-solid multi-tenant security under Indonesian personal data protection laws.
- A negligible operating cost (< $15.00/month per school) eliminating prohibitive SaaS licensing.
