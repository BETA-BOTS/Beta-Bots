"use strict";
/* Loads and validates the organizer-provided scholarship CSV.
 *
 * Handles UTF-8 / UTF-8-SIG (BOM), blank rows, quoted commas and
 * missing cells. Preserves each row's source row number for
 * traceability. If a required column (name) is missing, loading fails
 * loudly with a data error -- the app never fabricates results from a
 * broken dataset. (Port of backend/app/data/csv_loader.py.)
 */
const fs = require("fs");
const { parse } = require("csv-parse/sync");
const { mapRow } = require("./schemaMapper");

const REQUIRED_COLUMNS = new Set(["name"]);
const KNOWN_COLUMNS = new Set([
  "id", "name", "provider", "min_cgpa", "department", "need_based",
  "gender", "amount_bdt", "deadline", "description",
]);

class DatasetError extends Error {}

function loadScholarships(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new DatasetError(`Scholarship data file not found: ${filePath}`);
  }
  const text = fs.readFileSync(filePath, "utf-8");
  // csv-parse with bom:true strips a UTF-8 BOM like Python's utf-8-sig.
  // skip_empty_lines mirrors csv.DictReader, which skips blank lines.
  const rows = parse(text, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: false,
  });
  const headers = new Set(
    rows.length > 0
      ? Object.keys(rows[0]).map((h) => (h || "").trim())
      : headerNames(text)
  );
  if (rows.length === 0 && headerNames(text).length === 0) {
    throw new DatasetError("Scholarship CSV has no header row.");
  }
  const missing = [...REQUIRED_COLUMNS].filter((c) => !headers.has(c));
  if (missing.length > 0) {
    throw new DatasetError(
      `Scholarship CSV is missing required column(s): ${JSON.stringify(missing).replace(/"/g, "'")}`
    );
  }
  const unknown = [...headers].filter((h) => !KNOWN_COLUMNS.has(h));
  if (unknown.length > 0) {
    console.warn(`Unknown CSV columns ignored: ${unknown.sort().join(", ")}`);
  }
  const records = [];
  rows.forEach((raw, index) => {
    // source_row: header is file line 1, first data row is line 2
    const sourceRow = index + 2;
    if (
      raw == null ||
      Object.values(raw).every((v) => !(v == null ? "" : String(v)).trim())
    ) {
      return; // skip blank rows
    }
    const record = mapRow(raw, sourceRow);
    if (!record.name) {
      throw new DatasetError(
        `Scholarship CSV row ${sourceRow} has no name; refusing to guess a title.`
      );
    }
    records.push(record);
  });
  console.info(
    `Loaded ${records.length} scholarship records from ${filePath.split(/[\\/]/).pop()}`
  );
  return records;
}

/* Header names when the file has a header but zero data rows. */
function headerNames(text) {
  const firstLine = text.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] || "";
  if (!firstLine.trim()) return [];
  const parsed = parse(firstLine + "\n", { bom: true });
  return (parsed[0] || []).map((h) => (h || "").trim());
}

module.exports = { loadScholarships, DatasetError, REQUIRED_COLUMNS, KNOWN_COLUMNS };
