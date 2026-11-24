"""Grounded explanation service (blueprint section 6).

The eligibility engine has already decided the status before this
service runs. The AI (Gemini, when GEMINI_API_KEY is configured) only
rephrases the verified facts it is given; it must not invent facts or
change the status. Any failure -- no key, timeout, bad response --
falls back to a deterministic template built from the criterion
checks, so the product works fully without the AI API.
"""
import hashlib
import json

import httpx

from ..core.config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_TIMEOUT_SECONDS
from ..core.logging import get_logger

logger = get_logger(__name__)

DISCLAIMER_EN = "Based on the supplied scholarship data. Please verify official details with the provider."
DISCLAIMER_BN = "সরবরাহকৃত স্কলারশিপ ডেটার উপর ভিত্তি করে তৈরি। অনুগ্রহ করে প্রদানকারীর কাছ থেকে অফিসিয়াল বিবরণ যাচাই করুন।"

_cache: dict = {}


def _profile_key(profile, scholarship, status, lang) -> str:
    payload = json.dumps({
        "cgpa": profile.cgpa, "department": profile.department,
        "need": profile.financial_support_needed, "gender": profile.gender.value,
        "scholarship": scholarship.id, "status": status, "lang": lang,
    }, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()


# ------------------------- template fallback -------------------------

def template_explanation(profile, scholarship, checks, status, missing, lang="en") -> dict:
    passed = [c.detail for c in checks if c.status == "PASS"]
    failed = [c.detail for c in checks if c.status == "FAIL"]
    unknown = [c.detail for c in checks if c.status == "UNKNOWN"]
    if lang == "bn":
        if status == "ELIGIBLE":
            summary = (f"আপনি '{scholarship.name}'-এর জন্য ঘোষিত মানদণ্ড পূরণ করেছেন: "
                       f"আপনার সিজিপিএ {profile.cgpa:.2f} এবং বিভাগ {profile.department}।")
        elif status == "NEAR_MATCH":
            summary = (f"আপনি '{scholarship.name}'-এর প্রায় যোগ্য। যা ঘাটতি আছে: "
                       + " ".join(missing))
        elif status == "NEEDS_REVIEW":
            summary = (f"'{scholarship.name}'-এর একটি মানদণ্ড সরবরাহকৃত ডেটা দিয়ে "
                       "যাচাই করা যায়নি, তাই এটি আলাদাভাবে পর্যালোচনার জন্য রাখা হয়েছে।")
        else:
            summary = f"আপনি '{scholarship.name}'-এর সব ঘোষিত মানদণ্ড পূরণ করেননি।"
        return {
            "summary": summary,
            "passed_reasons": passed,
            "missing_or_failed": failed + unknown,
            "disclaimer": DISCLAIMER_BN,
            "source": "template",
        }
    if status == "ELIGIBLE":
        summary = (f"You meet the stated criteria for '{scholarship.name}': "
                   f"your CGPA is {profile.cgpa:.2f} and your department is "
                   f"{profile.department}.")
    elif status == "NEAR_MATCH":
        summary = (f"You almost qualify for '{scholarship.name}'. "
                   f"What is missing: " + " ".join(missing))
    elif status == "NEEDS_REVIEW":
        summary = (f"One or more criteria for '{scholarship.name}' cannot be "
                   "verified from the supplied scholarship data, so it is "
                   "listed separately for review.")
    else:
        summary = f"You do not meet all stated criteria for '{scholarship.name}'."
    return {
        "summary": summary,
        "passed_reasons": passed,
        "missing_or_failed": failed + unknown,
        "disclaimer": DISCLAIMER_EN,
        "source": "template",
    }


# ----------------------------- Gemini --------------------------------

SYSTEM_PROMPT = """You are a scholarship information assistant.
Use only the supplied student profile, scholarship record, and verified eligibility checks.
Do not invent facts. Do not change the eligibility status.
If a field is absent, say "Not provided in the scholarship data".
Keep the explanation concise and understandable.
Return structured JSON only with keys: summary (1-3 sentences), passed_reasons (list of short strings), missing_or_failed (list of short strings), disclaimer (one sentence)."""


def _gemini_explanation(profile, scholarship, checks, status, lang) -> dict:
    checks_payload = [
        {"criterion": c.criterion, "status": c.status, "detail": c.detail}
        for c in checks
    ]
    user_payload = {
        "student_profile": {
            "cgpa": profile.cgpa, "department": profile.department,
            "financial_support_needed": profile.financial_support_needed,
            "gender": profile.gender.value,
        },
        "scholarship_record": scholarship.public_dict(),
        "verified_checks": checks_payload,
        "eligibility_status_decided_by_code": status,
        "language": "Bangla (bn)" if lang == "bn" else "English (en)",
        "task": ("Write a 1-3 sentence explanation of why the student matches, "
                 "or what is missing for a near match; list passed criteria and "
                 "failed/unknown criteria."),
    }
    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"parts": [{"text": json.dumps(user_payload)}]}],
        "generationConfig": {"responseMimeType": "application/json",
                             "temperature": 0.2, "maxOutputTokens": 512},
    }
    url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
           f"{GEMINI_MODEL}:generateContent")
    with httpx.Client(timeout=GEMINI_TIMEOUT_SECONDS) as client:
        response = client.post(url, json=body,
                               headers={"x-goog-api-key": GEMINI_API_KEY})
        response.raise_for_status()
    data = response.json()
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    parsed = json.loads(text)
    return {
        "summary": str(parsed["summary"]),
        "passed_reasons": [str(x) for x in parsed.get("passed_reasons", [])],
        "missing_or_failed": [str(x) for x in parsed.get("missing_or_failed", [])],
        "disclaimer": str(parsed.get("disclaimer") or
                          (DISCLAIMER_BN if lang == "bn" else DISCLAIMER_EN)),
        "source": "gemini",
    }


def explain(profile, scholarship, checks, status, missing=None, lang="en") -> dict:
    """Return a grounded explanation dict; never raises."""
    missing = missing or []
    key = _profile_key(profile, scholarship, status, lang)
    if key in _cache:
        return _cache[key]
    result = None
    if GEMINI_API_KEY:
        try:
            result = _gemini_explanation(profile, scholarship, checks, status, lang)
        except Exception as exc:  # timeout, HTTP error, malformed JSON...
            logger.warning("Gemini explanation failed, using template: %s", exc)
    if result is None:
        result = template_explanation(profile, scholarship, checks, status, missing, lang)
    _cache[key] = result
    return result
