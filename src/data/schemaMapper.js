"use strict";
/* Maps raw organizer CSV rows to the normalized Scholarship schema.
 *
 * Real organizer columns (verified by inspection):
 *   id, name, provider, min_cgpa, department (';'-separated, 'All' = all),
 *   need_based (yes/no), gender (All/Female/...), amount_bdt,
 *   deadline (ISO date), description
 * (Port of backend/app/data/schema_mapper.py.)
 */
const { CGPA_SCALE } = require("../config");

const NOT_PROVIDED = "Not provided in the scholarship data";

function clean(value) {
  return (value == null ? "" : String(value)).trim();
}

function parseFloatOrNull(value) {
  const text = clean(value);
  if (!text) return null;
  const n = Number(text);
  return Number.isNaN(n) ? null : n;
}

function parseIntOrNull(value) {
  const text = clean(value).replace(/,/g, "");
  if (!text) return null;
  const n = parseFloat(text);
  if (Number.isNaN(n)) return null;
  return Math.trunc(n); // Python: int(float(text)) truncates toward zero
}

/* Parse an ISO calendar date (YYYY-MM-DD) to its ISO string; ambiguous
 * or invalid dates stay raw-only, never guessed (Python date.fromisoformat). */
function parseDate(value) {
  const text = clean(value);
  if (!text) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const d = new Date(Date.UTC(year, month - 1, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null; // e.g. 2027-02-30 is not a real date
  }
  return text;
}

function mapRow(raw, sourceRow) {
  const deptText = clean(raw.department);
  let departments = null; // not specified -- NOT the same as "all departments"
  if (deptText) {
    departments = deptText
      .split(";")
      .map((d) => d.trim())
      .filter((d) => d);
  }
  const allDepartments = Boolean(
    departments && departments.some((d) => d.toLowerCase() === "all")
  );

  const needText = clean(raw.need_based).toLowerCase();
  let needRule;
  if (needText === "yes") needRule = "required";
  else if (needText === "no") needRule = "not_required";
  else needRule = "unknown";

  const genderText = clean(raw.gender);
  const genderRule =
    !genderText || genderText.toLowerCase() === "all" ? null : genderText;

  const amount = parseIntOrNull(raw.amount_bdt);
  const amountDisplay =
    amount !== null ? `BDT ${amount.toLocaleString("en-US")}` : null;

  const deadlineRaw = clean(raw.deadline) || null;

  const cleanedRaw = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k == null) continue;
    cleanedRaw[k] = clean(v);
  }

  return {
    id: clean(raw.id) || `row-${sourceRow}`,
    name: clean(raw.name),
    provider: clean(raw.provider) || null,
    minimum_cgpa: parseFloatOrNull(raw.min_cgpa),
    cgpa_scale: CGPA_SCALE,
    eligible_departments: departments,
    all_departments: allDepartments,
    financial_need_rule: needRule,
    gender_rule: genderRule,
    amount_bdt: amount,
    amount_display: amountDisplay,
    deadline: parseDate(raw.deadline),
    deadline_raw: deadlineRaw,
    description: clean(raw.description) || null,
    application_steps: null, // not a column in the organizer CSV
    required_documents: null, // not a column in the organizer CSV
    source_row: sourceRow,
    raw: cleanedRaw,
  };
}

module.exports = { mapRow, NOT_PROVIDED };
