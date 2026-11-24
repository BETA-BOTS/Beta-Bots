"""ScholarSync AI -- FastAPI application.

Loads the organizer scholarship CSV at startup, exposes the matching
API, and serves the static single-page frontend.
"""
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .api import export, health, matching, metadata, scholarships
from .core.config import APP_NAME, DATA_FILE
from .core.logging import get_logger
from .data.csv_loader import load_scholarships

logger = get_logger(__name__)

app = FastAPI(title=APP_NAME)

app.state.dataset = load_scholarships(DATA_FILE)

app.include_router(health.router)
app.include_router(metadata.router)
app.include_router(matching.router)
app.include_router(scholarships.router)
app.include_router(export.router)

STATIC_DIR = Path(__file__).resolve().parent / "static"
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
