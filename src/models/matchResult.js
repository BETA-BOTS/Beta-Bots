"use strict";
/* Match result helpers: criterion checks and per-scholarship results.
 * (Port of backend/app/models/match_result.py.)
 *
 * A CriterionCheck is a plain object:
 *   { criterion, status, is_mandatory, student_value, required_value, detail }
 * A MatchResult is a plain object:
 *   { scholarship, status, checks, missing, explanation }
 */

function checkToDict(c) {
  return {
    criterion: c.criterion,
    status: c.status,
    is_mandatory: c.is_mandatory,
    student_value: c.student_value,
    required_value: c.required_value,
    detail: c.detail,
  };
}

function resultToDict(result) {
  const s = result.scholarship;
  return {
    scholarship_id: s.id,
    name: s.name,
    provider: s.provider,
    status: result.status,
    amount_bdt: s.amount_bdt,
    amount_display: s.amount_display,
    deadline: s.deadline,
    deadline_raw: s.deadline_raw,
    minimum_cgpa: s.minimum_cgpa,
    description: s.description,
    checks: result.checks.map(checkToDict),
    missing: result.missing,
    ai_explanation: result.explanation,
  };
}

module.exports = { checkToDict, resultToDict };
