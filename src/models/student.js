"use strict";
/* Student profile validation (API input, validated server-side).
 * Mirrors backend/app/models/student.py (Pydantic) and FastAPI's
 * behaviour of answering invalid input with HTTP 422.
 */

const GENDERS = ["female", "male", "unspecified"]; // unspecified = "Prefer not to say"

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 422;
  }
}

function coerceBool(value) {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === 0) return value === 1;
  if (typeof value === "string") {
    const t = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(t)) return true;
    if (["false", "0", "no", "off"].includes(t)) return false;
  }
  return undefined;
}

function coerceFloat(value) {
  if (typeof value === "boolean" || value == null) return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/* Validate a match-request body. Returns the normalized profile:
 * { cgpa, department, financial_support_needed, gender, lang } */
function validateProfile(body) {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be a JSON object.");
  }
  const cgpa = coerceFloat(body.cgpa);
  if (cgpa === undefined) {
    throw new ValidationError("cgpa: Input should be a valid number.");
  }
  if (cgpa < 0.0 || cgpa > 4.0) {
    throw new ValidationError(
      cgpa < 0.0
        ? "cgpa: Input should be greater than or equal to 0"
        : "cgpa: Input should be less than or equal to 4"
    );
  }
  if (typeof body.department !== "string" || body.department.length < 1) {
    throw new ValidationError("department: String should have at least 1 character.");
  }
  const need = coerceBool(body.financial_support_needed);
  if (need === undefined) {
    throw new ValidationError("financial_support_needed: Input should be a valid boolean.");
  }
  const gender = body.gender === undefined ? "unspecified" : body.gender;
  if (!GENDERS.includes(gender)) {
    throw new ValidationError("gender: Input should be 'female', 'male' or 'unspecified'.");
  }
  const lang = body.lang === undefined ? "en" : body.lang;
  if (lang !== "en" && lang !== "bn") {
    throw new ValidationError("lang: String should match pattern '^(en|bn)$'.");
  }
  return {
    cgpa,
    department: body.department,
    financial_support_needed: need,
    gender,
    lang,
  };
}

function validateSortBy(body) {
  const sortBy = body && body.sort_by !== undefined ? body.sort_by : "deadline";
  if (!["deadline", "amount", "name"].includes(sortBy)) {
    throw new ValidationError("sort_by: String should match pattern '^(deadline|amount|name)$'.");
  }
  return sortBy;
}

module.exports = { validateProfile, validateSortBy, ValidationError, GENDERS, coerceBool, coerceFloat };
