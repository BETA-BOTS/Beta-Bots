"use strict";
/* Deterministic eligibility engine (blueprint section 5).
 *
 * Eligibility is decided ONLY by this code -- never by an LLM.
 * Statuses: ELIGIBLE / NOT_ELIGIBLE / NEEDS_REVIEW (near matches are
 * derived from NOT_ELIGIBLE results by services/nearMatch).
 * (Port of backend/app/services/eligibility_engine.py.)
 */

function norm(text) {
  const t = (text || "").trim();
  if (!t) return "";
  return t.split(/\s+/).join(" ").toLowerCase();
}

function fmt2(n) {
  return n.toFixed(2); // Python f"{n:.2f}"
}

function checkCgpa(profile, scholarship) {
  const studentValue = fmt2(profile.cgpa);
  if (scholarship.minimum_cgpa === null) {
    return {
      criterion: "cgpa", status: "UNKNOWN", is_mandatory: true,
      student_value: studentValue, required_value: "Not specified",
      detail:
        "The scholarship data does not state a minimum CGPA, so this " +
        "criterion cannot be evaluated.",
    };
  }
  const required = fmt2(scholarship.minimum_cgpa);
  if (profile.cgpa >= scholarship.minimum_cgpa) {
    // equal passes
    return {
      criterion: "cgpa", status: "PASS", is_mandatory: true,
      student_value: studentValue, required_value: required,
      detail: `Your CGPA ${studentValue} meets the minimum ${required}.`,
    };
  }
  const gap = scholarship.minimum_cgpa - profile.cgpa;
  return {
    criterion: "cgpa", status: "FAIL", is_mandatory: true,
    student_value: studentValue, required_value: required,
    detail: `Your CGPA ${studentValue} is ${fmt2(gap)} below the minimum ${required}.`,
  };
}

function checkDepartment(profile, scholarship) {
  const studentValue = profile.department;
  const departments = scholarship.eligible_departments;
  if (departments === null) {
    return {
      criterion: "department", status: "UNKNOWN", is_mandatory: true,
      student_value: studentValue, required_value: "Not specified",
      detail:
        "The scholarship data does not state eligible departments, so " +
        "this criterion cannot be evaluated.",
    };
  }
  const required = departments.join(", ");
  if (scholarship.all_departments) {
    return {
      criterion: "department", status: "PASS", is_mandatory: true,
      student_value: studentValue, required_value: required,
      detail: "This scholarship is open to all departments.",
    };
  }
  const eligible = new Set(departments.map((d) => norm(d)));
  if (eligible.has(norm(profile.department))) {
    return {
      criterion: "department", status: "PASS", is_mandatory: true,
      student_value: studentValue, required_value: required,
      detail: `Your department (${studentValue}) is listed as eligible.`,
    };
  }
  return {
    criterion: "department", status: "FAIL", is_mandatory: true,
    student_value: studentValue, required_value: required,
    detail: `Your department (${studentValue}) is not in the eligible list: ${required}.`,
  };
}

function checkFinancialNeed(profile, scholarship) {
  const studentValue = profile.financial_support_needed ? "Yes" : "No";
  const rule = scholarship.financial_need_rule;
  if (rule === "required") {
    if (profile.financial_support_needed) {
      return {
        criterion: "financial_need", status: "PASS", is_mandatory: true,
        student_value: studentValue, required_value: "Required (need-based)",
        detail:
          "This is a need-based scholarship and you indicated that " +
          "you need financial support.",
      };
    }
    return {
      criterion: "financial_need", status: "FAIL", is_mandatory: true,
      student_value: studentValue, required_value: "Required (need-based)",
      detail:
        "This scholarship is need-based, but you indicated that you do " +
        "not need financial support.",
    };
  }
  if (rule === "not_required") {
    return {
      criterion: "financial_need", status: "PASS", is_mandatory: true,
      student_value: studentValue, required_value: "Not required",
      detail: "Financial need is not a requirement for this scholarship.",
    };
  }
  return {
    criterion: "financial_need", status: "UNKNOWN", is_mandatory: true,
    student_value: studentValue, required_value: "Not specified",
    detail:
      "The scholarship data does not state a financial-need rule, so " +
      "this criterion cannot be evaluated.",
  };
}

const GENDER_LABELS = {
  female: "Female",
  male: "Male",
  unspecified: "Prefer not to say",
};

function checkGender(profile, scholarship) {
  const studentValue = GENDER_LABELS[profile.gender];
  const rule = scholarship.gender_rule;
  if (rule === null) {
    return {
      criterion: "gender", status: "PASS", is_mandatory: true,
      student_value: studentValue, required_value: "All",
      detail: "This scholarship is open to all genders.",
    };
  }
  if (profile.gender === "unspecified") {
    return {
      criterion: "gender", status: "UNKNOWN", is_mandatory: true,
      student_value: studentValue, required_value: rule,
      detail:
        `This scholarship is restricted to ${rule} students, and you ` +
        "chose not to specify your gender, so this criterion cannot " +
        "be evaluated.",
    };
  }
  if (norm(studentValue) === norm(rule)) {
    return {
      criterion: "gender", status: "PASS", is_mandatory: true,
      student_value: studentValue, required_value: rule,
      detail: `This scholarship is for ${rule} students, which matches your profile.`,
    };
  }
  return {
    criterion: "gender", status: "FAIL", is_mandatory: true,
    student_value: studentValue, required_value: rule,
    detail: `This scholarship is restricted to ${rule} students.`,
  };
}

function evaluate(profile, scholarship) {
  const checks = [
    checkCgpa(profile, scholarship),
    checkDepartment(profile, scholarship),
    checkFinancialNeed(profile, scholarship),
    checkGender(profile, scholarship),
  ];
  let status;
  if (checks.some((c) => c.status === "FAIL" && c.is_mandatory)) {
    status = "NOT_ELIGIBLE";
  } else if (checks.some((c) => c.status === "UNKNOWN" && c.is_mandatory)) {
    status = "NEEDS_REVIEW";
  } else {
    status = "ELIGIBLE";
  }
  return { scholarship, status, checks, missing: [], explanation: null };
}

module.exports = {
  evaluate,
  checkCgpa,
  checkDepartment,
  checkFinancialNeed,
  checkGender,
  norm,
};
