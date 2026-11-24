from fastapi.testclient import TestClient

from app.main import app
from app.models.student import Gender, StudentProfile
from app.services.eligibility_engine import evaluate
from app.services.explanation_service import explain
from app.services.export_service import build_csv
from app.services.near_match import as_near_match

client = TestClient(app)


def profile(**kw):
    base = dict(cgpa=3.3, department="CSE",
                financial_support_needed=False, gender=Gender.FEMALE)
    base.update(kw)
    return StudentProfile(**base)


def test_cgpa_gap_is_a_near_match_with_exact_gap(by_name):
    result = evaluate(profile(), by_name["Future Engineer Scholarship"])  # min 3.5
    near = as_near_match(result)
    assert near is not None
    assert near.status == "NEAR_MATCH"
    assert any("0.20 below the minimum 3.50" in m for m in near.missing)


def test_department_failure_is_never_a_near_match(by_name):
    result = evaluate(profile(department="English"), by_name["Coders of Tomorrow Grant"])
    assert as_near_match(result) is None


def test_gender_failure_is_never_a_near_match(by_name):
    result = evaluate(profile(cgpa=3.2, gender=Gender.MALE),
                      by_name["Women in Tech Scholarship"])
    assert as_near_match(result) is None


def test_unknown_criterion_blocks_near_match(by_name):
    result = evaluate(profile(cgpa=3.2, gender=Gender.UNSPECIFIED),
                      by_name["Women in Tech Scholarship"])
    assert result.status == "NEEDS_REVIEW"
    assert as_near_match(result) is None


def test_ai_unavailable_fallback_explanation(by_name, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "")
    import app.services.explanation_service as svc
    monkeypatch.setattr(svc, "GEMINI_API_KEY", "")
    s = by_name["Coders of Tomorrow Grant"]
    p = profile(cgpa=3.68, financial_support_needed=True)
    result = evaluate(p, s)
    ex = explain(p, s, result.checks, result.status, [])
    assert ex["source"] == "template"
    assert "Coders of Tomorrow Grant" in ex["summary"]
    assert ex["passed_reasons"]


def test_export_contains_displayed_records(by_name):
    s = by_name["Coders of Tomorrow Grant"]
    content = build_csv([{
        "name": s.name, "provider": s.provider, "status": "ELIGIBLE",
        "amount_bdt": s.amount_bdt, "deadline": "2027-02-28",
        "minimum_cgpa": s.minimum_cgpa, "missing": [],
    }]).decode("utf-8-sig")
    assert "Coders of Tomorrow Grant" in content
    assert "ELIGIBLE" in content


def test_match_api_end_to_end():
    res = client.post("/api/match", json={
        "cgpa": 3.68, "department": "CSE",
        "financial_support_needed": True, "gender": "female",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["summary"]["records_checked"] == 136
    total = (data["summary"]["eligible_count"] + data["summary"]["near_match_count"]
             + data["summary"]["needs_review_count"])
    assert total <= 136
    assert data["summary"]["eligible_count"] > 0
    for item in data["eligible"]:
        assert item["status"] == "ELIGIBLE"
        assert item["ai_explanation"]["summary"]


def test_match_api_low_profile_has_no_eligible():
    res = client.post("/api/match", json={
        "cgpa": 1.5, "department": "English",
        "financial_support_needed": False, "gender": "male",
    })
    assert res.status_code == 200
    assert res.json()["summary"]["eligible_count"] == 0


def test_sort_by_deadline_missing_last():
    res = client.post("/api/match", json={
        "cgpa": 3.9, "department": "CSE",
        "financial_support_needed": True, "gender": "female",
        "sort_by": "deadline",
    })
    deadlines = [i["deadline"] for i in res.json()["eligible"]]
    present = [d for d in deadlines if d]
    assert present == sorted(present)
    assert deadlines[len(present):] == [None] * (len(deadlines) - len(present))


def test_health_and_meta():
    assert client.get("/api/health").json()["records_loaded"] == 136
    meta = client.get("/api/meta").json()
    assert meta["cgpa_scale"] == 4.0
    assert "CSE" in meta["departments"]
    assert "All" not in meta["departments"]
