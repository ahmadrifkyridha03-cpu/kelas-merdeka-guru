/**
 * test_dapodik_robustness.js
 * Empirical Verification of Dapodik Ingestion & Validation Pipeline
 * Based on PRD.md Section 4.5 (lines 420-435) & SYSTEM_ARCHITECTURE.md Section 4.4
 */

console.log("================================================================================");
console.log("TEST SUITE 4: EMPIRICAL DAPODIK IMPORT/EXPORT ROBUSTNESS STRESS TEST");
console.log("================================================================================\n");

const results = [];

// Naive/Standard implementation following PRD.md Section 4.5 specs:
// - Encoding check (UTF-8)
// - Validation guardrails:
//     * NISN: Exactly 10 digits, numeric check
//     * NIK: Exactly 16 digits
//     * Gender: Strict enum ['L', 'P']
//     * Date: YYYY-MM-DD or DD/MM/YYYY auto-parse
// - Batch Upsert Transaction into Firestore
function parseAndValidateDapodikCsv(csvContent, options = {}) {
  // Check BOM
  let content = csvContent;
  let hasBom = false;
  if (content.charCodeAt(0) === 0xFEFF) {
    hasBom = true;
    if (options.stripBom) {
      content = content.slice(1);
    }
  }

  const delimiter = options.delimiter || ",";
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return { success: false, error: "Empty CSV" };

  const headers = lines[0].split(delimiter).map(h => h.trim());
  const rows = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const rawTokens = lines[i].split(delimiter);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = rawTokens[idx] !== undefined ? rawTokens[idx].trim() : "";
    });

    // Validation Guardrails from PRD.md Section 4.5:
    // 1. NISN: Exactly 10 digits, numeric check
    const rawNisn = options.coerceNumber ? (row["NISN"] ? String(Number(row["NISN"])) : "") : row["NISN"];
    const nisnValid = /^[0-9]{10}$/.test(rawNisn);
    if (!nisnValid) {
      errors.push({ row: i, field: "NISN", value: rawNisn, reason: "NISN must be exactly 10 digits numeric" });
    }

    // 2. NIK: Exactly 16 digits
    const nikValid = /^[0-9]{16}$/.test(row["NIK"]);
    if (!nikValid) {
      errors.push({ row: i, field: "NIK", value: row["NIK"], reason: "NIK must be exactly 16 digits numeric" });
    }

    // 3. Gender: Strict enum ['L', 'P']
    const genderValid = row["JK"] === "L" || row["JK"] === "P";
    if (!genderValid) {
      errors.push({ row: i, field: "JK", value: row["JK"], reason: "Gender must be L or P" });
    }

    rows.push({
      studentId: `std_${row["NISN"]}`,
      nisn: rawNisn,
      nik: row["NIK"],
      name: row["Nama"],
      gender: row["JK"]
    });
  }

  return { success: errors.length === 0, rows, errors, headers, hasBom };
}

// ------------------------------------------------------------------------------
// TEST 4.1: Semicolon Delimited CSV (Indonesian Regional Settings Standard)
// ------------------------------------------------------------------------------
function testSemicolonDelimiterHandling() {
  console.log("--- TEST 4.1: Indonesian Regional Semicolon Delimited CSV ---");
  
  // Real Indonesian Dapodik CSV export format (uses ';' delimiter)
  const dapodikCsv = 
`No;NISN;NIK;Nama;JK;Tanggal_Lahir
1;0081234567;3204123456780001;Ahmad Syafi'i;L;2008-05-12
2;0081234568;3204123456780002;Siti Nurhaliza;P;2008-08-20`;

  // Standard parser expecting comma delimiter ','
  const resultDefault = parseAndValidateDapodikCsv(dapodikCsv, { delimiter: "," });
  console.log(`Parsed with default comma delimiter: success=${resultDefault.success}, rows=${resultDefault.rows.length}`);
  console.log(`Headers detected: ${JSON.stringify(resultDefault.headers)}`);

  if (!resultDefault.success && resultDefault.headers.length === 1) {
    console.log("🚨 BUG CONFIRMED: Parsing Failure on Semicolon CSV!");
    console.log("   Standard Indonesian Windows/Excel exports use ';' as list separator. Without auto-detecting delimiter, the entire row is treated as a single token.");
    results.push({
      test: "Indonesian Semicolon Delimiter Failure",
      status: "FAIL",
      bug: "Parser assumes comma delimiter ',', failing to parse official Indonesian Dapodik/Excel exports that use semicolon ';' due to localized decimal separator conventions."
    });
  } else {
    results.push({ test: "Indonesian Semicolon Delimiter Failure", status: "PASS" });
  }
}

// ------------------------------------------------------------------------------
// TEST 4.2: UTF-8 with BOM (\xef\xbb\xbf) Header Corruption
// ------------------------------------------------------------------------------
function testUtf8BomHeaderCorruption() {
  console.log("\n--- TEST 4.2: UTF-8 BOM Header Name Corruption ---");

  // Excel saves UTF-8 with Byte Order Mark
  const bomPrefix = "\uFEFF";
  const dapodikCsvWithBom = bomPrefix + 
`NISN,NIK,Nama,JK
0081234567,3204123456780001,Ahmad Syafi'i,L`;

  // Parser without BOM stripping
  const result = parseAndValidateDapodikCsv(dapodikCsvWithBom, { delimiter: ",", stripBom: false });
  console.log(`First header token: '${result.headers[0]}' (length: ${result.headers[0].length})`);
  console.log(`Does headers[0] === 'NISN'? ${result.headers[0] === "NISN"}`);
  console.log(`Character code at pos 0: 0x${result.headers[0].charCodeAt(0).toString(16)}`);

  if (result.headers[0] !== "NISN") {
    console.log("🚨 BUG CONFIRMED: BOM Header Corruption!");
    console.log("   The first header becomes '\\uFEFFNISN'. Looking up row['NISN'] returns undefined, causing total validation failure.");
    results.push({
      test: "UTF-8 BOM Header Corruption",
      status: "FAIL",
      bug: "Lack of BOM stripping causes the primary identifier header to be read as '\\uFEFFNISN', resulting in undefined column mapping."
    });
  } else {
    results.push({ test: "UTF-8 BOM Header Corruption", status: "PASS" });
  }
}

// ------------------------------------------------------------------------------
// TEST 4.3: Leading Zero Truncation in 10-Digit NISN (Born >= 2000)
// ------------------------------------------------------------------------------
function testLeadingZeroTruncationInNisn() {
  console.log("\n--- TEST 4.3: Leading Zero NISN Truncation Under Numeric Coercion ---");

  // Indonesian students born in 2008 have NISN starting with "008"
  const rawNisn = "0081234567";
  const dapodikCsv = 
`NISN,NIK,Nama,JK
${rawNisn},3204123456780001,Ahmad Fauzi,L`;

  // When libraries (or developers) parse column as number or Excel exports general format:
  const result = parseAndValidateDapodikCsv(dapodikCsv, { delimiter: ",", coerceNumber: true });
  console.log(`Original NISN: ${rawNisn}`);
  console.log(`Coerced NISN:  ${result.errors[0] ? result.errors[0].value : 'none'}`);
  console.log(`Validation result: ${result.success}`);

  if (!result.success) {
    console.log("🚨 BUG CONFIRMED: Numeric parsing strips leading zeros, turning 10-digit NISN into 8-digit invalid number!");
    results.push({
      test: "Leading Zero NISN Truncation",
      status: "FAIL",
      bug: "Numeric coercion or unpadded string parsing strips leading zeros ('0081234567' -> '81234567'), failing the 10-digit regex check."
    });
  } else {
    results.push({ test: "Leading Zero NISN Truncation", status: "PASS" });
  }
}

// ------------------------------------------------------------------------------
// TEST 4.4: Missing NISN for Newly Enrolled / Matriculating Students
// ------------------------------------------------------------------------------
function testMissingNisnForNewStudents() {
  console.log("\n--- TEST 4.4: Missing NISN for Newly Enrolled Students ---");

  // In Indonesian schools, Grade 1 (SD) and Grade 7 (SMP) students frequently do not have an NISN yet
  const dapodikCsv = 
`NISN,NIK,Nama,JK
,3204123456780001,Budi Santoso,L
-,3204123456780002,Dewi Lestari,P`;

  const result = parseAndValidateDapodikCsv(dapodikCsv, { delimiter: "," });
  console.log(`Validation with missing/pending NISN: success=${result.success}`);
  console.log(`Errors logged: ${JSON.stringify(result.errors)}`);

  if (!result.success) {
    console.log("🚨 REGULATORY REALITY BUG CONFIRMED: Strict 10-digit NISN check blocks new student enrollment!");
    console.log("   Dapodik officially allows empty/pending NISN for incoming cohorts. Requiring 10 digits renders roster import unusable for Grade 1/7 or transfer students.");
    results.push({
      test: "Missing NISN Block on New Cohorts",
      status: "FAIL",
      bug: "PRD Section 4.5 enforces strict 10-digit NISN requirement, which rejects legitimate incoming students whose NISN has not yet been issued by Kemendikbudristek/Pusdatin."
    });
  } else {
    results.push({ test: "Missing NISN Block on New Cohorts", status: "PASS" });
  }
}

// ------------------------------------------------------------------------------
// TEST 4.5: Firestore Batch Write Crash on Duplicate Student in Same Import Batch
// ------------------------------------------------------------------------------
function testFirestoreBatchDuplicateKeyCrash() {
  console.log("\n--- TEST 4.5: Firestore Batch Upsert Duplicate Document ID Collision ---");

  // In Dapodik, student duplicates within CSV are common (e.g., student registered twice in roster)
  const dapodikCsv = 
`NISN,NIK,Nama,JK
0081234567,3204123456780001,Ahmad Fauzi,L
0081234567,3204123456780001,Ahmad Fauzi,L`;

  const parseResult = parseAndValidateDapodikCsv(dapodikCsv, { delimiter: "," });

  // Simulating Firestore WriteBatch behavior:
  // Firestore throws an error if set/update is called on the same document reference multiple times in the same batch
  class MockFirestoreBatch {
    constructor() {
      this.operations = new Map();
    }
    set(docPath, data) {
      if (this.operations.has(docPath)) {
        throw new Error(`FirebaseFirestoreError: Cannot modify document '${docPath}' multiple times in a single batch.`);
      }
      this.operations.set(docPath, data);
    }
    commit() {
      return Promise.resolve(this.operations.size);
    }
  }

  let batchFailed = false;
  let batchErrorMsg = "";
  try {
    const batch = new MockFirestoreBatch();
    parseResult.rows.forEach(r => {
      const docPath = `/organizations/school_1/students/${r.studentId}`;
      batch.set(docPath, r);
    });
  } catch (err) {
    batchFailed = true;
    batchErrorMsg = err.message;
  }

  console.log(`Did Firestore Batch commit crash on duplicate student row? ${batchFailed}`);
  console.log(`Error: ${batchErrorMsg}`);

  if (batchFailed) {
    console.log("🚨 TRANSACTION INTEGRITY BUG CONFIRMED: Duplicate rows in CSV crash the entire batch upsert!");
    console.log("   PRD Section 4.5 specifies '[Batch Upsert Transaction into Firestore]' but omits in-memory pre-deduplication, crashing the entire import.");
    results.push({
      test: "Firestore Batch Duplicate Key Crash",
      status: "FAIL",
      bug: "Without in-memory deduplication prior to building the Firestore WriteBatch, duplicate rows in Dapodik CSV cause a fatal Firestore batch conflict."
    });
  } else {
    results.push({ test: "Firestore Batch Duplicate Key Crash", status: "PASS" });
  }
}

// ------------------------------------------------------------------------------
// TEST 4.6: Unquoted Commas in Indonesian Names / Titles Splitting Columns
// ------------------------------------------------------------------------------
function testUnquotedCommasInIndonesianNames() {
  console.log("\n--- TEST 4.6: Commas in Indonesian Names / Academic Titles (e.g. 'Drs. H. M. Syukri, M.Pd.') ---");

  // In Indonesian school files, teachers or student guardians frequently have titles like ', S.Pd.' or ', M.M.'
  // In comma-delimited CSV without strict RFC 4180 quoting, the comma splits the column!
  const csvWithCommaInName = 
`NISN,NIK,Nama,JK
0081234567,3204123456780001,Drs. H. Muhammad Syukri, M.Pd.,L`;

  const result = parseAndValidateDapodikCsv(csvWithCommaInName, { delimiter: "," });
  console.log(`Parsed row: ${JSON.stringify(result.rows[0])}`);
  console.log(`Gender detected: '${result.rows[0].gender}'`);

  // Because of unquoted comma, "M.Pd." ended up in the JK (Gender) column!
  if (result.rows[0].gender !== "L") {
    console.log("🚨 BUG CONFIRMED: Column Shift! Unquoted comma in academic title shifts remaining columns into Gender field!");
    results.push({
      test: "Column Shift on Unquoted Comma in Names",
      status: "FAIL",
      bug: "Naive CSV splitting on comma shifts columns when names contain academic/honorific titles with commas (e.g., 'Syukri, M.Pd.'), causing data corruption."
    });
  } else {
    results.push({ test: "Column Shift on Unquoted Comma in Names", status: "PASS" });
  }
}

testSemicolonDelimiterHandling();
testUtf8BomHeaderCorruption();
testLeadingZeroTruncationInNisn();
testMissingNisnForNewStudents();
testFirestoreBatchDuplicateKeyCrash();
testUnquotedCommasInIndonesianNames();

console.log("\n================================================================================");
console.log("TEST SUITE 4 SUMMARY:");
console.table(results);

