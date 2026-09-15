import csv
import io
from pathlib import Path

FIELDS = ["id", "drug", "rating", "effectiveness", "side_effects", "condition", "benefits", "side_effects_review", "comments"]

def read_tsv(path: str):
    text = Path(path).read_text(encoding="utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text), delimiter="\t")
    rows = []
    for row in reader:
        rows.append({
            "id": (row.get("") or "").strip(),
            "drug": (row.get("urlDrugName") or "").strip(),
            "rating": int(float(row.get("rating") or 0)),
            "effectiveness": (row.get("effectiveness") or "").strip(),
            "side_effects": (row.get("sideEffects") or "").strip(),
            "condition": (row.get("condition") or "").strip(),
            "benefits": (row.get("benefitsReview") or "").strip(),
            "side_effects_review": (row.get("sideEffectsReview") or "").strip(),
            "comments": (row.get("commentsReview") or "").strip(),
        })
    return rows

def row_to_document(row: dict) -> str:
    return (
        f"Drug: {row['drug']}\n"
        f"Condition: {row['condition']}\n"
        f"Rating: {row['rating']}/10\n"
        f"Effectiveness: {row['effectiveness']}\n"
        f"Side effects: {row['side_effects']}\n"
        f"Benefits review: {row['benefits']}\n"
        f"Side effects review: {row['side_effects_review']}\n"
        f"Comments: {row['comments']}"
    )
