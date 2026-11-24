"""Match result models: criterion checks and per-scholarship results."""
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class CriterionCheck:
    criterion: str        # cgpa | department | financial_need | gender
    status: str           # PASS | FAIL | UNKNOWN
    is_mandatory: bool
    student_value: str
    required_value: str
    detail: str

    def to_dict(self) -> dict:
        return {
            "criterion": self.criterion,
            "status": self.status,
            "is_mandatory": self.is_mandatory,
            "student_value": self.student_value,
            "required_value": self.required_value,
            "detail": self.detail,
        }


@dataclass
class MatchResult:
    scholarship: object  # models.scholarship.Scholarship
    status: str          # ELIGIBLE | NOT_ELIGIBLE | NEEDS_REVIEW | NEAR_MATCH
    checks: list = field(default_factory=list)
    missing: list = field(default_factory=list)  # exact gaps for near matches
    explanation: Optional[dict] = None

    def to_dict(self) -> dict:
        s = self.scholarship
        return {
            "scholarship_id": s.id,
            "name": s.name,
            "provider": s.provider,
            "status": self.status,
            "amount_bdt": s.amount_bdt,
            "amount_display": s.amount_display,
            "deadline": s.deadline.isoformat() if s.deadline else None,
            "deadline_raw": s.deadline_raw,
            "minimum_cgpa": s.minimum_cgpa,
            "description": s.description,
            "checks": [c.to_dict() for c in self.checks],
            "missing": self.missing,
            "ai_explanation": self.explanation,
        }
