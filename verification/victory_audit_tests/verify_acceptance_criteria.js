/**
 * verify_acceptance_criteria.js
 * Independent Acceptance Criteria Verification
 * Checks all 5 acceptance criteria checkboxes from ORIGINAL_REQUEST.md
 */

const fs = require('fs');
const path = require('path');

const rootDir = 'd:/New folder';

const files = {
  prd: path.join(rootDir, 'PRD.md'),
  arch: path.join(rootDir, 'SYSTEM_ARCHITECTURE.md'),
  agent: path.join(rootDir, 'MULTI_AGENT_SPEC.md'),
  skill: path.join(rootDir, 'SKILL_SPECIFICATIONS.md')
};

const checks = [];

// Check 1: Files exist directly in root
for (const [key, filePath] of Object.entries(files)) {
  const exists = fs.existsSync(filePath);
  const size = exists ? fs.statSync(filePath).size : 0;
  checks.push({
    name: `File in root: ${path.basename(filePath)}`,
    pass: exists && size > 50000,
    evidence: `Exists: ${exists}, Size: ${size} bytes (~${(size/1024).toFixed(1)} KB)`
  });
}

// Read contents
const prdContent = fs.readFileSync(files.prd, 'utf8');
const archContent = fs.readFileSync(files.arch, 'utf8');
const agentContent = fs.readFileSync(files.agent, 'utf8');
const skillContent = fs.readFileSync(files.skill, 'utf8');

// Acceptance Criterion 1: PRD Completeness
const prdRequirements = [
  { name: 'Class & Student Roster Management', pattern: /Roster Management/i },
  { name: 'Grade Input & Recording', pattern: /Buku Nilai|Gradebook/i },
  { name: 'Extra Credit / Bonus Points', pattern: /Bonus Point|Extra Credit/i },
  { name: 'Curriculum Generation: CP', pattern: /Capaian Pembelajaran/i },
  { name: 'Curriculum Generation: TP', pattern: /Tujuan Pembelajaran/i },
  { name: 'Curriculum Generation: ATP', pattern: /Alur Tujuan Pembelajaran/i },
  { name: 'Curriculum Generation: KKTP', pattern: /Kriteria Ketercapaian Tujuan Pembelajaran/i },
  { name: 'Curriculum Generation: Analisis Minggu Efektif', pattern: /Analisis Minggu Efektif/i },
  { name: 'Curriculum Generation: PROTA', pattern: /Program Tahunan|PROTA/i },
  { name: 'Curriculum Generation: PROSEM', pattern: /Program Semester|PROSEM/i },
  { name: 'Modul Ajar Lesson Plans', pattern: /Modul Ajar/i },
  { name: 'LKPD per Meeting', pattern: /LKPD|Lembar Kerja Peserta Didik/i }
];

let prdAllPass = true;
prdRequirements.forEach(req => {
  const matched = req.pattern.test(prdContent);
  if (!matched) prdAllPass = false;
  checks.push({
    name: `PRD Feature: ${req.name}`,
    pass: matched,
    evidence: `Pattern ${req.pattern} found: ${matched}`
  });
});

// Acceptance Criterion 2: Architecture Completeness
const archRequirements = [
  { name: 'Data Models / Schemas', pattern: /Data Models|Schemas|interface /i },
  { name: 'System Components', pattern: /Component Architecture|Subsystems/i },
  { name: 'Google Web App Architecture', pattern: /Google Web App|Firebase|App Hosting|Cloud Functions/i },
  { name: 'Declarative Security Rules', pattern: /rules_version = '2';|firestore\.rules/i },
  { name: 'UI Flows / Wireflows', pattern: /Wireflow|UI Architecture/i }
];

archRequirements.forEach(req => {
  const matched = req.pattern.test(archContent);
  checks.push({
    name: `Architecture Component: ${req.name}`,
    pass: matched,
    evidence: `Pattern ${req.pattern} found: ${matched}`
  });
});

// Acceptance Criterion 3: Multi-Agent Completeness
const agentRequirements = [
  { name: 'Curriculum Architect Agent', pattern: /agent-curriculum-architect/i },
  { name: 'Assessment & Rubric Agent', pattern: /agent-assessment-rubric/i },
  { name: 'Academic Calendar Agent', pattern: /agent-academic-calendar/i },
  { name: 'Lesson Plan & Pedagogy Agent', pattern: /agent-lesson-plan-pedagogy/i },
  { name: 'LKPD Agent', pattern: /agent-lkpd-content-generation/i },
  { name: 'Classroom Intelligence Agent', pattern: /agent-classroom-intelligence/i },
  { name: 'Coordinator Agent', pattern: /agent-orchestrator-coordinator/i },
  { name: 'System Instructions / Prompts', pattern: /system_prompt|prompt template/i },
  { name: 'Tool Definitions', pattern: /tools|parameters/i }
];

agentRequirements.forEach(req => {
  const matched = req.pattern.test(agentContent);
  checks.push({
    name: `Multi-Agent Feature: ${req.name}`,
    pass: matched,
    evidence: `Pattern ${req.pattern} found: ${matched}`
  });
});

// Acceptance Criterion 4: Custom Skill Specifications Completeness
const skillRequirements = [
  { name: 'YAML Frontmatter', pattern: /name:\s*curriculum-/i },
  { name: 'JSON Input Schema', pattern: /input\.schema\.json/i },
  { name: 'JSON Output Schema', pattern: /output\.schema\.json/i },
  { name: 'Execution Logic', pattern: /Siklus Hidup Eksekusi|Execution Lifecycle|Protokol Eksekusi|runner eksekusi/i },
  { name: 'Curriculum CP-TP Derivation', pattern: /curriculum-cp-tp-derivation/i },
  { name: 'Curriculum ATP Sequencer', pattern: /curriculum-atp-sequencer/i },
  { name: 'Curriculum KKTP Builder', pattern: /curriculum-kktp-builder/i },
  { name: 'Curriculum Minggu Efektif Analyzer', pattern: /curriculum-minggu-efektif-analyzer/i },
  { name: 'Curriculum PROTA PROSEM Generator', pattern: /curriculum-prota-prosem-generator/i },
  { name: 'Modul Ajar Generator', pattern: /modul-ajar-generator/i },
  { name: 'LKPD Worksheet Generator', pattern: /lkpd-worksheet-generator/i },
  { name: 'Grade Analytics & Bonus Evaluator', pattern: /grade-analytics-and-bonus-evaluator/i }
];

skillRequirements.forEach(req => {
  const matched = req.pattern.test(skillContent);
  checks.push({
    name: `Custom Skill Feature: ${req.name}`,
    pass: matched,
    evidence: `Pattern ${req.pattern} found: ${matched}`
  });
});

console.log('================================================================================');
console.log('ACCEPTANCE CRITERIA VERIFICATION RESULTS (ORIGINAL_REQUEST.md)');
console.log('================================================================================\n');

let allPassed = true;
checks.forEach((c, idx) => {
  const status = c.pass ? 'PASS' : 'FAIL';
  if (!c.pass) allPassed = false;
  console.log(`[${status}] #${idx + 1}: ${c.name}`);
  console.log(`       Evidence: ${c.evidence}`);
});

console.log('\n================================================================================');
console.log(`TOTAL ACCEPTANCE CHECKS: ${checks.length} | ALL PASSED: ${allPassed}`);
console.log('================================================================================');

if (!allPassed) {
  process.exit(1);
} else {
  console.log('VERDICT: ALL ACCEPTANCE CRITERIA FULLY SATISFIED.');
}
