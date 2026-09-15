$ErrorActionPreference = 'Stop'
if (!(Test-Path '.venv')) { py -m venv .venv }
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
if (!(Test-Path '.env')) { Copy-Item .env.example .env }
& .\.venv\Scripts\python.exe scripts\init_db.py
& .\.venv\Scripts\python.exe scripts\build_index.py
& .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
