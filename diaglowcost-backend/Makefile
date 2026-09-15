install:
	python3 -m venv .venv
	. .venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt
init-db:
	. .venv/bin/activate && python scripts/init_db.py
index:
	. .venv/bin/activate && python scripts/build_index.py
run:
	. .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000
