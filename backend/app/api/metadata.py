from fastapi import APIRouter, Request

from ..core.config import CGPA_SCALE, DATA_FILE

router = APIRouter()


@router.get("/api/meta")
def meta(request: Request):
    dataset = request.app.state.dataset
    departments = sorted({
        d for s in dataset for d in (s.eligible_departments or [])
        if d.casefold() != "all"
    })
    return {
        "departments": departments,
        "cgpa_scale": CGPA_SCALE,
        "cgpa_guidance": (
            f"Enter your CGPA on the {CGPA_SCALE:.2f} scale used by the "
            "scholarship dataset."
        ),
        "genders": ["female", "male", "unspecified"],
        "dataset": {
            "filename": DATA_FILE.name,
            "records": len(dataset),
            "status": "loaded",
        },
    }
