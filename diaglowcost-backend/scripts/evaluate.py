import argparse
from app.rag.corpus import read_tsv
from app.rag.retriever import Retriever

parser = argparse.ArgumentParser()
parser.add_argument('--limit', type=int, default=100)
parser.add_argument('--top-k', type=int, default=5)
args = parser.parse_args()

r = Retriever()
rows = read_tsv(r.settings.test_data)[:args.limit]
if not rows:
    raise SystemExit('No test rows found')

hits = 0
for row in rows:
    query = f"{row['drug']} {row['condition']} {row['benefits']} {row['side_effects_review']}"
    results = r.search(query, args.top_k)
    if any(x['drug'].lower() == row['drug'].lower() for x in results):
        hits += 1
print({"evaluated": len(rows), "top_k": args.top_k, "drug_hit_rate": round(hits / len(rows), 4)})
