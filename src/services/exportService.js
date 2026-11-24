"use strict";
/* Builds a downloadable CSV of the results the user is viewing.
 * (Port of backend/app/services/export_service.py; replicates the
 * Python csv module's output: CRLF line endings, minimal quoting,
 * UTF-8 BOM via the utf-8-sig encoding.)
 */

const COLUMNS = [
  "name", "provider", "status", "amount_bdt", "deadline",
  "minimum_cgpa", "missing",
];

function csvField(value) {
  const text = value == null ? "" : String(value);
  if (/[",\r\n]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

function buildCsv(results) {
  const lines = [COLUMNS.map(csvField).join(",")];
  for (const r of results) {
    const row = {
      name: r.name ?? "",
      provider: r.provider || "",
      status: r.status ?? "",
      amount_bdt: r.amount_bdt != null ? r.amount_bdt : "",
      deadline: r.deadline || r.deadline_raw || "",
      minimum_cgpa: r.minimum_cgpa != null ? r.minimum_cgpa : "",
      missing: (r.missing || []).join("; "),
    };
    lines.push(COLUMNS.map((c) => csvField(row[c])).join(","));
  }
  // Python: io.StringIO + csv default lineterminator "\r\n", encoded utf-8-sig
  return Buffer.concat([
    Buffer.from([0xef, 0xbb, 0xbf]),
    Buffer.from(lines.join("\r\n") + "\r\n", "utf-8"),
  ]);
}

module.exports = { buildCsv, COLUMNS };
