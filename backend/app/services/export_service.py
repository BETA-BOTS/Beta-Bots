"""Builds a downloadable CSV of the results the user is viewing."""
import csv
import io

COLUMNS = ["name", "provider", "status", "amount_bdt", "deadline",
           "minimum_cgpa", "missing"]


def build_csv(results: list) -> bytes:
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=COLUMNS)
    writer.writeheader()
    for r in results:
        writer.writerow({
            "name": r.get("name", ""),
            "provider": r.get("provider") or "",
            "status": r.get("status", ""),
            "amount_bdt": r.get("amount_bdt") if r.get("amount_bdt") is not None else "",
            "deadline": r.get("deadline") or r.get("deadline_raw") or "",
            "minimum_cgpa": r.get("minimum_cgpa") if r.get("minimum_cgpa") is not None else "",
            "missing": "; ".join(r.get("missing") or []),
        })
    return buffer.getvalue().encode("utf-8-sig")
