"""Minimal logging setup (stdlib only)."""
import logging as _logging

_logging.basicConfig(
    level=_logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


def get_logger(name: str) -> _logging.Logger:
    return _logging.getLogger(name)
