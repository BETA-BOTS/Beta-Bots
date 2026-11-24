"""Deterministic eligibility engine (blueprint section 5).

Eligibility is decided ONLY by this code -- never by an LLM.
Statuses: ELIGIBLE / NOT_ELIGIBLE / NEEDS_REVIEW (near matches are
derived from NOT_ELIGIBLE results by services.near_match).
"""
from ..models.match_result import CriterionCheck, MatchResult
from ..models.student import Gender, StudentProfile


def _norm(text: str) -> str:
    return " ".join((text or "").split()).casefold()


def check_cgpa(profile: StudentProfile, scholarship) -> CriterionCheck:
    student_value = f"{profile.cgpa:.2f}"
    if scholarship.minimum_cgpa is None:
        return CriterionCheck(
            "cgpa", "UNKNOWN", True, student_value, "Not specified",
            "The scholarship data does not state a minimum CGPA, so this "
            "criterion cannot be evaluated.",
        )
    required = f"{scholarship.minimum_cgpa:.2f}"
    if profile.cgpa >= scholarship.minimum_cgpa:  # equal passes
        return CriterionCheck(
            "cgpa", "PASS", True, student_value, required,
            f"Your CGPA {student_value} meets the minimum {required}.",
        )
    gap = scholarship.minimum_cgpa - profile.cgpa
    return CriterionCheck(
        "cgpa", "FAIL", True, student_value, required,
        f"Your CGPA {student_value} is {gap:.2f} below the minimum {required}.",
    )


def check_department(profile: StudentProfile, scholarship) -> CriterionCheck:
    student_value = profile.department
    departments = scholarship.eligible_departments
    if departments is None:
        return CriterionCheck(
            "department", "UNKNOWN", True, student_value, "Not specified",
            "The scholarship data does not state eligible departments, so "
            "this criterion cannot be evaluated.",
        )
    required = ", ".join(departments)
    if scholarship.all_departments:
        return CriterionCheck(
            "department", "PASS", True, student_value, required,
            "This scholarship is open to all departments.",
        )
    if _norm(profile.department) in {_norm(d) for d in departments}:
        return CriterionCheck(
            "department", "PASS", True, student_value, required,
            f"Your department ({student_value}) is listed as eligible.",
        )
    return CriterionCheck(
        "department", "FAIL", True, student_value, required,
        f"Your department ({student_value}) is not in the eligible list: {required}.",
    )


def check_financial_need(profile: StudentProfile, scholarship) -> CriterionCheck:
    student_value = "Yes" if profile.financial_support_needed else "No"
    rule = scholarship.financial_need_rule
    if rule == "required":
        if profile.financial_support_needed:
            return CriterionCheck(
                "financial_need", "PASS", True, student_value, "Required (need-based)",
                "This is a need-based scholarship and you indicated that "
                "you need financial support.",
            )
        return CriterionCheck(
            "financial_need", "FAIL", True, student_value, "Required (need-based)",
            "This scholarship is need-based, but you indicated that you do "
            "not need financial support.",
        )
    if rule == "not_required":
        return CriterionCheck(
            "financial_need", "PASS", True, student_value, "Not required",
            "Financial need is not a requirement for this scholarship.",
        )
    return CriterionCheck(
        "financial_need", "UNKNOWN", True, student_value, "Not specified",
        "The scholarship data does not state a financial-need rule, so "
        "this criterion cannot be evaluated.",
    )


def check_gender(profile: StudentProfile, scholarship) -> CriterionCheck:
    student_value = {
        Gender.FEMALE: "Female", Gender.MALE: "Male",
        Gender.UNSPECIFIED: "Prefer not to say",
    }[profile.gender]
    rule = scholarship.gender_rule
    if rule is None:
        return CriterionCheck(
            "gender", "PASS", True, student_value, "All",
            "This scholarship is open to all genders.",
        )
    if profile.gender == Gender.UNSPECIFIED:
        return CriterionCheck(
            "gender", "UNKNOWN", True, student_value, rule,
            f"This scholarship is restricted to {rule} students, and you "
            "chose not to specify your gender, so this criterion cannot "
            "be evaluated.",
        )
    if _norm(student_value) == _norm(rule):
        return CriterionCheck(
            "gender", "PASS", True, student_value, rule,
            f"This scholarship is for {rule} students, which matches your profile.",
        )
    return CriterionCheck(
        "gender", "FAIL", True, student_value, rule,
        f"This scholarship is restricted to {rule} students.",
    )


def evaluate(profile: StudentProfile, scholarship) -> MatchResult:
    checks = [
        check_cgpa(profile, scholarship),
        check_department(profile, scholarship),
        check_financial_need(profile, scholarship),
        check_gender(profile, scholarship),
    ]
    if any(c.status == "FAIL" and c.is_mandatory for c in checks):
        status = "NOT_ELIGIBLE"
    elif any(c.status == "UNKNOWN" and c.is_mandatory for c in checks):
        status = "NEEDS_REVIEW"
    else:
        status = "ELIGIBLE"
    return MatchResult(scholarship=scholarship, status=status, checks=checks)
