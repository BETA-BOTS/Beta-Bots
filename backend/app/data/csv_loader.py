"""Loads and validates the organizer-provided scholarship CSV.

Handles UTF-8 / UTF-8-SIG, blank rows, quoted commas and missing cells.
Preserves each row's source row number for traceability. If a required
column (name) is missing, loading fails loudly with a data error --
the app never fabricates results from a broken dataset.
"""
import csv
from pathlib import Path

from ..core.logging import get_logger
from .schema_mapper import map_row

logger = get_logger(__name__)

REQUIRED_COLUMNS = {"name"}
KNOWN_COLUMNS = {
    "id", "name", "provider", "min_cgpa", "department", "need_based",
    "gender", "amount_bdt", "deadline", "description",
}


class DatasetError(Exception):
    """Raised when the scholarship CSV cannot be trusted."""


def load_scholarships(path) -> list:
    path = Path(path)
    if not path.exists():
        raise DatasetError(f"Scholarship data file not found: {path}")
    records = []
    with path.open("r", encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        if reader.fieldnames is None:
            raise DatasetError("Scholarship CSV has no header row.")
        headers = {(h or "").strip() for h in reader.fieldnames}
        missing = REQUIRED_COLUMNS - headers
        if missing:
            raise DatasetError(
                f"Scholarship CSV is missing required column(s): {sorted(missing)}"
            )
        unknown = headers - KNOWN_COLUMNS
        if unknown:
            logger.warning("Unknown CSV columns ignored: %s", sorted(unknown))
        for index, raw in enumerate(reader):
            # source_row: header is file line 1, first data row is line 2
            source_row = index + 2
            if raw is None or all(not (v or "").strip() for v in raw.values()):
                continue  # skip blank rows
            record = map_row(raw, source_row)
            if not record.name:
                raise DatasetError(
                    f"Scholarship CSV row {source_row} has no name; "
                    "refusing to guess a title."
                )
            records.append(record)
    logger.info("Loaded %d scholarship records from %s", len(records), path.name)
    return records
