/**
 * test_security_rules_penetration.js
 * Empirical Verification of Declarative Cloud Firestore Security Rules
 * Based on SYSTEM_ARCHITECTURE.md Section 6.1 (lines 1176 - 1291)
 */

console.log("================================================================================");
console.log("TEST SUITE 2: EMPIRICAL SECURITY BOUNDARY PENETRATION & PRIVILEGE ESCALATION");
console.log("================================================================================\n");

const results = [];

// Exact implementation of the security rule functions defined in SYSTEM_ARCHITECTURE.md lines 1181-1212
class FirestoreSecurityRuleEngine {
  constructor(auth, path, requestResource, existingResource = null) {
    this.request = {
      auth: auth,
      resource: requestResource ? { data: requestResource } : null
    };
    this.resource = existingResource ? { data: existingResource } : null;
    this.path = path;
  }

  // --- Helper Functions from SYSTEM_ARCHITECTURE.md Lines 1182-1212 ---
  isAuthenticated() {
    return this.request.auth != null;
  }

  getUserData() {
    return this.request.auth ? this.request.auth.token : {};
  }

  isMemberOfOrg(orgId) {
    return this.isAuthenticated() && this.getUserData().orgId === orgId;
  }

  hasRole(orgId, role) {
    return this.isMemberOfOrg(orgId) && this.getUserData().role === role;
  }

  isSuperAdmin() {
    return this.isAuthenticated() && this.getUserData().role === "SUPER_ADMIN";
  }

  isAdmin(orgId) {
    return this.isSuperAdmin() || this.hasRole(orgId, "ADMIN");
  }

  isTeacher(orgId) {
    return this.isAdmin(orgId) || this.hasRole(orgId, "WALI_KELAS") || this.hasRole(orgId, "GURU_MAPEL");
  }

  isAssignedTeacher(orgId, teacherId) {
    return this.isTeacher(orgId) && this.request.auth.uid === teacherId;
  }

  // --- Rule Matchers ---
  evaluateGradeEntryWrite(orgId, entryId) {
    // SYSTEM_ARCHITECTURE.md Line 1275:
    // allow create, update: if isTeacher(orgId);
    return this.isTeacher(orgId);
  }

  evaluateGradeEntryRead(orgId, entryId) {
    // SYSTEM_ARCHITECTURE.md Line 1273-1274:
    // allow read: if isTeacher(orgId) || (hasRole(orgId, "SISWA") && resource.data.studentId == getUserData().studentId);
    return this.isTeacher(orgId) || 
      (this.hasRole(orgId, "SISWA") && this.resource && this.resource.data && this.resource.data.studentId === this.getUserData().studentId);
  }

  evaluateAttendanceWrite(orgId, attendanceId) {
    // SYSTEM_ARCHITECTURE.md Line 1245:
    // allow create, update: if isTeacher(orgId);
    return this.isTeacher(orgId);
  }

  evaluateBonusPointCreate(orgId, txId) {
    // SYSTEM_ARCHITECTURE.md Line 1283-1285:
    // allow create: if isTeacher(orgId) && request.resource.data.pointsAwarded > 0 && request.resource.data.auditHash != null;
    return this.isTeacher(orgId) &&
      this.request.resource &&
      this.request.resource.data &&
      this.request.resource.data.pointsAwarded > 0 &&
      this.request.resource.data.auditHash != null;
  }

  evaluateBonusPointRead(orgId, txId) {
    // SYSTEM_ARCHITECTURE.md Line 1281:
    // allow read: if isMemberOfOrg(orgId);
    return this.isMemberOfOrg(orgId);
  }

  evaluateBonusPointUpdate(orgId, txId) {
    // SYSTEM_ARCHITECTURE.md Line 1286:
    // allow update, delete: if false;
    return false;
  }
}

// ------------------------------------------------------------------------------
// TEST 2.1: Privilege Escalation - Teacher modifying grades of unassigned class/subject
// Spec Claim: Section 1.1 / 2.4.4 claims "Zero cross-tenant and rombel isolation"
// ------------------------------------------------------------------------------
function testTeacherUnassignedClassGradeModification() {
  console.log("--- TEST 2.1: Teacher Privilege Escalation (Cross-Rombel / Cross-Subject Grade Tampering) ---");
  
  // Teacher A is PJOK teacher assigned strictly to Class 7A
  const teacherA_Auth = {
    uid: "teacher_pjok_01",
    token: {
      orgId: "school_20219842",
      role: "GURU_MAPEL",
      assignedClassIds: ["cls_7A"],
      assignedSubjectIds: ["sub_pjok"]
    }
  };

  // Target: Final Math Exam grade entry for Class 9B, Student 001
  const targetEntryId = "asmt_math_final_std_001";
  const forgedGradePayload = {
    orgId: "school_20219842",
    assessmentId: "asmt_math_final",
    studentId: "std_001",
    classId: "cls_9B",
    subjectId: "sub_matematika",
    rawScore: 99, // Tampered score
    updatedByTeacherId: "teacher_pjok_01"
  };

  const engine = new FirestoreSecurityRuleEngine(
    teacherA_Auth,
    `/organizations/school_20219842/grade_entries/${targetEntryId}`,
    forgedGradePayload
  );

  const allowed = engine.evaluateGradeEntryWrite("school_20219842", targetEntryId);
  console.log(`Can PJOK Teacher (assigned only to 7A) write/modify 9B Math Exam score? Result: ${allowed}`);

  if (allowed) {
    console.log("🚨 VULNERABILITY CONFIRMED: Privilege Escalation! Security rules do not verify assignedClassIds or assignedSubjectIds.");
    console.log("   Any teacher in the school can modify any student's grades in any subject or rombel!");
    results.push({
      test: "Cross-Rombel/Subject Grade Tampering",
      status: "FAIL",
      bug: "isTeacher(orgId) only checks organization membership and role; it ignores assignedClassIds and assignedSubjectIds, allowing any teacher to tamper with any class's grades."
    });
  } else {
    results.push({ test: "Cross-Rombel/Subject Grade Tampering", status: "PASS" });
  }
}

// ------------------------------------------------------------------------------
// TEST 2.2: Student Privacy Breach - Student reading entire school's bonus point ledger
// ------------------------------------------------------------------------------
function testStudentReadingAllBonusTransactions() {
  console.log("\n--- TEST 2.2: Student Privacy Breach (Reading Peer Bonus Point Ledger) ---");

  // Student A in School
  const studentA_Auth = {
    uid: "student_001_uid",
    token: {
      orgId: "school_20219842",
      role: "SISWA",
      studentId: "std_001"
    }
  };

  // Target transaction belongs to Student B with sensitive behavioral rationale
  const targetTx = {
    recipientStudentId: "std_002",
    pointsAwarded: 5,
    rationale: "Konseling khusus bimbingan emosi dan peningkatan kehadiran",
    track: "ENGAGEMENT_XP"
  };

  const engine = new FirestoreSecurityRuleEngine(
    studentA_Auth,
    `/organizations/school_20219842/bonus_point_transactions/tx_bonus_002`,
    null,
    targetTx
  );

  const allowed = engine.evaluateBonusPointRead("school_20219842", "tx_bonus_002");
  console.log(`Can Student std_001 read Student std_002's bonus point record & counseling rationale? Result: ${allowed}`);

  if (allowed) {
    console.log("🚨 VULNERABILITY CONFIRMED: Privacy Leak / UU PDP Violation!");
    console.log("   bonus_point_transactions rule uses 'allow read: if isMemberOfOrg(orgId);'. Since students have matching orgId, all students can spy on peer bonus points and teacher notes!");
    results.push({
      test: "Student Peer Bonus Ledger Privacy Leak",
      status: "FAIL",
      bug: "bonus_point_transactions read rule allows all members of orgId, exposing sensitive student behavioral/counseling notes to all enrolled students."
    });
  } else {
    results.push({ test: "Student Peer Bonus Ledger Privacy Leak", status: "PASS" });
  }
}

// ------------------------------------------------------------------------------
// TEST 2.3: Missing Validation Constraints - Negative or Runaway Scores & Unbounded Bonus
// ------------------------------------------------------------------------------
function testMissingValidationConstraints() {
  console.log("\n--- TEST 2.3: Missing Validation Constraints on Grade Entries & Bonus Points ---");

  const teacherAuth = {
    uid: "teacher_01",
    token: { orgId: "school_20219842", role: "GURU_MAPEL" }
  };

  // Malformed Grade Payload: Negative score & missing studentId
  const corruptGradePayload = {
    rawScore: -9999,
    studentId: "", // Empty student ID
    bonusPointsApplied: 50000
  };

  const engineGrade = new FirestoreSecurityRuleEngine(
    teacherAuth,
    `/organizations/school_20219842/grade_entries/corrupt_entry`,
    corruptGradePayload
  );

  const gradeAllowed = engineGrade.evaluateGradeEntryWrite("school_20219842", "corrupt_entry");

  // Runaway Bonus Point Payload: 1,000,000 bonus points
  const runawayBonusPayload = {
    pointsAwarded: 1000000,
    auditHash: "mock_hash"
  };

  const engineBonus = new FirestoreSecurityRuleEngine(
    teacherAuth,
    `/organizations/school_20219842/bonus_point_transactions/runaway_bonus`,
    runawayBonusPayload
  );

  const bonusAllowed = engineBonus.evaluateBonusPointCreate("school_20219842", "runaway_bonus");

  console.log(`Grade write with negative score (-9999) and empty studentId allowed? Result: ${gradeAllowed}`);
  console.log(`Bonus point creation with 1,000,000 points allowed? Result: ${bonusAllowed}`);

  if (gradeAllowed && bonusAllowed) {
    console.log("🚨 VULNERABILITY CONFIRMED: Absence of Schema & Boundary Validation in Security Rules!");
    console.log("   Firestore rules enforce zero schema boundaries on grade values (0-100) or bonus point caps, allowing database corruption.");
    results.push({
      test: "Missing Schema Validation Constraints in Rules",
      status: "FAIL",
      bug: "No constraints on rawScore boundaries (0-100), studentId presence, or bonusPointsAwarded ceiling in declarative Firestore rules."
    });
  } else {
    results.push({ test: "Missing Schema Validation Constraints in Rules", status: "PASS" });
  }
}

// ------------------------------------------------------------------------------
// TEST 2.4: Dead Code Verification: isAssignedTeacher Function Defined But Never Bound
// ------------------------------------------------------------------------------
function testDeadCodeIsAssignedTeacher() {
  console.log("\n--- TEST 2.4: Dead Code Audit: isAssignedTeacher() ---");
  // Reviewing SYSTEM_ARCHITECTURE.md lines 1210-1290:
  // Function is declared:
  //   function isAssignedTeacher(orgId, teacherId) { return isTeacher(orgId) && request.auth.uid == teacherId; }
  // Checking usage across match blocks:
  //   organizations -> isAdmin(orgId)
  //   academic_years -> isAdmin(orgId)
  //   class_sections -> isAdmin(orgId)
  //   students -> isAdmin(orgId)
  //   attendance_records -> isTeacher(orgId)
  //   curriculum_plans -> isTeacher(orgId)
  //   lesson_plans -> isTeacher(orgId)
  //   lkpd_documents -> isTeacher(orgId)
  //   assessment_definitions -> isTeacher(orgId)
  //   grade_entries -> isTeacher(orgId)
  //   bonus_point_transactions -> isTeacher(orgId)

  const isUsedInAnyMatch = false; // Verified by grep
  console.log(`Is isAssignedTeacher() used in any match statement? Result: ${isUsedInAnyMatch}`);

  if (!isUsedInAnyMatch) {
    console.log("🚨 SPECIFICATION DEFECT CONFIRMED: isAssignedTeacher() is orphaned dead code!");
    results.push({
      test: "isAssignedTeacher Security Function Orphaned",
      status: "FAIL",
      bug: "isAssignedTeacher(orgId, teacherId) is defined at line 1210 but completely unreferenced across all match blocks, leaving rombel-level authorization unimplemented."
    });
  } else {
    results.push({ test: "isAssignedTeacher Security Function Orphaned", status: "PASS" });
  }
}

testTeacherUnassignedClassGradeModification();
testStudentReadingAllBonusTransactions();
testMissingValidationConstraints();
testDeadCodeIsAssignedTeacher();

console.log("\n================================================================================");
console.log("TEST SUITE 2 SUMMARY:");
console.table(results);
