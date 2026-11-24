from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/api/health")
def health(request: Request):
    dataset = request.app.state.dataset
    return {
        "status": "ok",
        "service": "ScholarSync AI",
        "records_loaded": len(dataset),
    }
