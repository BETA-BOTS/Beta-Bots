from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

from ..services.export_service import build_csv

router = APIRouter()


class ExportPayload(BaseModel):
    results: list


@router.post("/api/export")
def export_results(payload: ExportPayload):
    content = build_csv(payload.results)
    return Response(
        content=content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=scholarsync-results.csv"},
    )
