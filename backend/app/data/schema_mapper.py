"""Maps raw organizer CSV rows to the normalized Scholarship schema.

Real organizer columns (verified by inspection):
  id, name, provider, min_cgpa, department (';'-separated, 'All' = all),
  need_based (yes/no), gender (All/Female/...), amount_bdt,
  deadline (ISO date), description
"""
from datetime import date
from typing import Optional

from ..core.config import CGPA_SCALE
from ..models.scholarship import Scholarship

NOT_PROVIDED = "Not provided in the scholarship data"


def _clean(value) -> str:
    return (value or "").strip()


def _parse_float(value) -> Optional[float]:
    text = _clean(value)
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def _parse_int(value) -> Optional[int]:
    text = _clean(value).replace(",", "")
    if not text:
        return None
    try:
        return int(float(text))
    except ValueError:
        return None


def _parse_date(value) -> Optional[date]:
    text = _clean(value)
    if not text:
        return None
    try:
        return date.fromisoformat(text)
    except ValueError:
        return None  # ambiguous dates stay raw-only, never guessed


def map_row(raw: dict, source_row: int) -> Scholarship:
    dept_text = _clean(raw.get("department"))
    if dept_text:
        departments = [d.strip() for d in dept_text.split(";") if d.strip()]
    else:
        departments = None  # not specified -- NOT the same as "all departments"
    all_departments = bool(departments) and any(
        d.casefold() == "all" for d in departments
    )

    need_text = _clean(raw.get("need_based")).casefold()
    if need_text == "yes":
        need_rule = "required"
    elif need_text == "no":
        need_rule = "not_required"
    else:
        need_rule = "unknown"

    gender_text = _clean(raw.get("gender"))
    gender_rule = None if (not gender_text or gender_text.casefold() == "all") else gender_text

    amount = _parse_int(raw.get("amount_bdt"))
    amount_display = f"BDT {amount:,}" if amount is not None else None

    deadline_raw = _clean(raw.get("deadline")) or None

    return Scholarship(
        id=_clean(raw.get("id")) or f"row-{source_row}",
        name=_clean(raw.get("name")),
        provider=_clean(raw.get("provider")) or None,
        minimum_cgpa=_parse_float(raw.get("min_cgpa")),
        cgpa_scale=CGPA_SCALE,
        eligible_departments=departments,
        all_departments=all_departments,
        financial_need_rule=need_rule,
        gender_rule=gender_rule,
        amount_bdt=amount,
        amount_display=amount_display,
        deadline=_parse_date(raw.get("deadline")),
        deadline_raw=deadline_raw,
        description=_clean(raw.get("description")) or None,
        application_steps=None,     # not a column in the organizer CSV
        required_documents=None,    # not a column in the organizer CSV
        source_row=source_row,
        raw={k: _clean(v) for k, v in raw.items()},
    )
