"""Near-match detection (blueprint sections 3.5 and 5.2).

A NOT_ELIGIBLE record is a near match only when every failed criterion
is a measurable one (CGPA gap and/or financial need), the department
and gender criteria did not fail, and nothing is unknown. The exact
missing requirement is reported.
"""
from .eligibility_engine import evaluate  # noqa: F401  (re-exported for tests)

MEASURABLE = {"cgpa", "financial_need"}


def missing_reasons(result) -> list:
    """Exact, measurable gaps for a failed result."""
    reasons = []
    for check in result.checks:
        if check.status != "FAIL":
            continue
        if check.criterion == "cgpa":
            reasons.append(check.detail)  # already states the numeric gap
        elif check.criterion == "financial_need":
            reasons.append(
                "Requires financial need (need-based), but you indicated "
                "you do not need financial support."
            )
    return reasons


def as_near_match(result):
    """Return a NEAR_MATCH copy of result, or None if it does not qualify."""
    if result.status != "NOT_ELIGIBLE":
        return None
    if any(c.status == "UNKNOWN" for c in result.checks):
        return None  # a mandatory criterion cannot be evaluated
    failed = [c for c in result.checks if c.status == "FAIL"]
    if not failed:
        return None
    if any(c.criterion not in MEASURABLE for c in failed):
        return None  # department or gender failed -> not a near match
    from ..models.match_result import MatchResult
    return MatchResult(
        scholarship=result.scholarship,
        status="NEAR_MATCH",
        checks=result.checks,
        missing=missing_reasons(result),
    )
