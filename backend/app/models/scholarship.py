"""Normalized scholarship record (internal schema, blueprint section 4.2).

Only fields that exist in the organizer CSV are populated; anything the
dataset does not provide stays None and is displayed to the user as
"Not provided in the scholarship data" -- never guessed.
"""
from dataclasses import dataclass, field
from datetime import date
from typing import Optional


@dataclass
class Scholarship:
    id: str
    name: str
    provider: Optional[str]
    minimum_cgpa: Optional[float]
    cgpa_scale: Optional[float]
    eligible_departments: Optional[list]  # None = not specified in data
    all_departments: bool                 # True when data explicitly says "All"
    financial_need_rule: str              # required | not_required | unknown
    gender_rule: Optional[str]            # None = open to all; else e.g. "Female"
    amount_bdt: Optional[int]
    amount_display: Optional[str]         # e.g. "BDT 30,000"
    deadline: Optional[date]
    deadline_raw: Optional[str]
    description: Optional[str]
    application_steps: Optional[list] = None   # not present in organizer CSV
    required_documents: Optional[list] = None  # not present in organizer CSV
    source_row: int = 0
    raw: dict = field(default_factory=dict)

    def public_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "provider": self.provider,
            "minimum_cgpa": self.minimum_cgpa,
            "cgpa_scale": self.cgpa_scale,
            "eligible_departments": self.eligible_departments,
            "all_departments": self.all_departments,
            "financial_need_rule": self.financial_need_rule,
            "gender_rule": self.gender_rule,
            "amount_bdt": self.amount_bdt,
            "amount_display": self.amount_display,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "deadline_raw": self.deadline_raw,
            "description": self.description,
            "application_steps": self.application_steps,
            "required_documents": self.required_documents,
            "source_row": self.source_row,
        }
