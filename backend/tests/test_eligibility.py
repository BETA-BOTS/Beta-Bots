from app.models.student import Gender, StudentProfile
from app.services.eligibility_engine import evaluate


def profile(**kw):
    base = dict(cgpa=3.68, department="CSE",
                financial_support_needed=True, gender=Gender.FEMALE)
    base.update(kw)
    return StudentProfile(**base)


def test_valid_profile_qualifying_record_is_eligible(by_name):
    result = evaluate(profile(), by_name["Coders of Tomorrow Grant"])
    assert result.status == "ELIGIBLE"


def test_cgpa_exactly_equal_to_minimum_passes(by_name):
    s = by_name["Merit Excellence Award"]  # min 3.8, All depts, not need-based
    result = evaluate(profile(cgpa=3.8, department="BBA",
                              financial_support_needed=False, gender=Gender.MALE), s)
    cgpa_check = next(c for c in result.checks if c.criterion == "cgpa")
    assert cgpa_check.status == "PASS"
    assert result.status == "ELIGIBLE"


def test_cgpa_below_minimum_is_not_eligible(by_name):
    result = evaluate(profile(cgpa=3.4), by_name["Future Engineer Scholarship"])  # min 3.5
    assert result.status == "NOT_ELIGIBLE"
    cgpa_check = next(c for c in result.checks if c.criterion == "cgpa")
    assert cgpa_check.status == "FAIL"
    assert "0.10" in cgpa_check.detail


def test_wrong_department_is_not_eligible(by_name):
    result = evaluate(profile(department="English"), by_name["Coders of Tomorrow Grant"])
    assert result.status == "NOT_ELIGIBLE"
    dept_check = next(c for c in result.checks if c.criterion == "department")
    assert dept_check.status == "FAIL"


def test_department_matching_ignores_case_and_spaces(by_name):
    result = evaluate(profile(department=" cse "), by_name["Coders of Tomorrow Grant"])
    dept_check = next(c for c in result.checks if c.criterion == "department")
    assert dept_check.status == "PASS"


def test_all_departments_passes_any_department(by_name):
    result = evaluate(profile(department="English", cgpa=3.9),
                      by_name["Merit Excellence Award"])
    dept_check = next(c for c in result.checks if c.criterion == "department")
    assert dept_check.status == "PASS"


def test_need_based_requires_financial_need(by_name):
    s = by_name["Need-Based Tuition Support"]  # need_based = yes, min 2.5, All
    denied = evaluate(profile(cgpa=3.0, financial_support_needed=False), s)
    assert denied.status == "NOT_ELIGIBLE"
    need_check = next(c for c in denied.checks if c.criterion == "financial_need")
    assert need_check.status == "FAIL"
    granted = evaluate(profile(cgpa=3.0, financial_support_needed=True), s)
    assert granted.status == "ELIGIBLE"


def test_gender_restricted_female_student_passes(by_name):
    s = by_name["Women in Tech Scholarship"]  # Female, CSE;EEE, min 3.0
    result = evaluate(profile(cgpa=3.2, gender=Gender.FEMALE), s)
    assert result.status == "ELIGIBLE"


def test_gender_restricted_male_student_fails(by_name):
    s = by_name["Women in Tech Scholarship"]
    result = evaluate(profile(cgpa=3.2, gender=Gender.MALE), s)
    assert result.status == "NOT_ELIGIBLE"
    gender_check = next(c for c in result.checks if c.criterion == "gender")
    assert gender_check.status == "FAIL"


def test_gender_restricted_unspecified_needs_review(by_name):
    s = by_name["Women in Tech Scholarship"]
    result = evaluate(profile(cgpa=3.2, gender=Gender.UNSPECIFIED), s)
    assert result.status == "NEEDS_REVIEW"  # never silently eligible
    gender_check = next(c for c in result.checks if c.criterion == "gender")
    assert gender_check.status == "UNKNOWN"
