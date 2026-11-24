from fastapi import APIRouter, HTTPException, Request

from ..models.student import Gender, StudentProfile
from ..services import explanation_service
from ..services.eligibility_engine import evaluate

router = APIRouter()


@router.get("/api/scholarships/{scholarship_id}")
def scholarship_detail(
    scholarship_id: str,
    request: Request,
    cgpa: float = None,
    department: str = None,
    financial_support_needed: bool = None,
    gender: Gender = Gender.UNSPECIFIED,
    lang: str = "en",
):
    dataset = request.app.state.dataset
    scholarship = next((s for s in dataset if s.id == scholarship_id), None)
    if scholarship is None:
        raise HTTPException(status_code=404, detail="Scholarship not found in the provided data.")

    payload = scholarship.public_dict()
    payload["dataset_note"] = (
        "Fields show 'Not provided in the scholarship data' when the "
        "organizer dataset does not contain them."
    )
    # Application checklist: the organizer CSV has no application-steps or
    # documents columns, so only a clearly labelled generic checklist is
    # offered -- never invented official instructions.
    if scholarship.application_steps or scholarship.required_documents:
        payload["application_checklist"] = {
            "type": "official",
            "steps": scholarship.application_steps,
            "documents": scholarship.required_documents,
        }
    else:
        payload["application_checklist"] = {
            "type": "generic",
            "label": ("General preparation checklist — the scholarship data "
                      "does not include official application steps or "
                      "required documents."),
            "steps": [
                "Prepare your latest academic transcript showing your CGPA.",
                "Prepare a student ID / enrollment proof from your university.",
                "If the scholarship is need-based, prepare income or financial-need supporting documents.",
                "Write a short statement explaining why you are applying.",
                "Verify the official application process and deadline with the provider before applying.",
            ],
            "documents": None,
        }

    if cgpa is not None and department is not None and financial_support_needed is not None:
        profile = StudentProfile(
            cgpa=cgpa, department=department,
            financial_support_needed=financial_support_needed,
            gender=gender, lang=lang if lang in ("en", "bn") else "en",
        )
        result = evaluate(profile, scholarship)
        payload["checks"] = [c.to_dict() for c in result.checks]
        payload["status"] = result.status
        payload["ai_explanation"] = explanation_service.explain(
            profile, scholarship, result.checks, result.status, [], profile.lang
        )
    return payload
