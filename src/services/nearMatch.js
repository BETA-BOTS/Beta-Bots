"use strict";
/* Near-match detection (blueprint sections 3.5 and 5.2).
 *
 * A NOT_ELIGIBLE record is a near match only when every failed
 * criterion is a measurable one (CGPA gap and/or financial need), the
 * department and gender criteria did not fail, and nothing is unknown.
 * The exact missing requirement is reported.
 * (Port of backend/app/services/near_match.py.)
 */

const MEASURABLE = new Set(["cgpa", "financial_need"]);

function missingReasons(result) {
  /* Exact, measurable gaps for a failed result. */
  const reasons = [];
  for (const check of result.checks) {
    if (check.status !== "FAIL") continue;
    if (check.criterion === "cgpa") {
      reasons.push(check.detail); // already states the numeric gap
    } else if (check.criterion === "financial_need") {
      reasons.push(
        "Requires financial need (need-based), but you indicated " +
          "you do not need financial support."
      );
    }
  }
  return reasons;
}

function asNearMatch(result) {
  /* Return a NEAR_MATCH copy of result, or null if it does not qualify. */
  if (result.status !== "NOT_ELIGIBLE") return null;
  if (result.checks.some((c) => c.status === "UNKNOWN")) {
    return null; // a mandatory criterion cannot be evaluated
  }
  const failed = result.checks.filter((c) => c.status === "FAIL");
  if (failed.length === 0) return null;
  if (failed.some((c) => !MEASURABLE.has(c.criterion))) {
    return null; // department or gender failed -> not a near match
  }
  return {
    scholarship: result.scholarship,
    status: "NEAR_MATCH",
    checks: result.checks,
    missing: missingReasons(result),
    explanation: null,
  };
}

module.exports = { missingReasons, asNearMatch, MEASURABLE };
