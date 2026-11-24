import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

import pytest  # noqa: E402

from app.core.config import DATA_FILE  # noqa: E402
from app.data.csv_loader import load_scholarships  # noqa: E402


@pytest.fixture(scope="session")
def dataset():
    return load_scholarships(DATA_FILE)


@pytest.fixture(scope="session")
def by_name(dataset):
    return {s.name: s for s in dataset}
