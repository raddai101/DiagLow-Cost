#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-/opt/diaglowcost-backend}
cd "$(dirname "$0")/.."

sudo apt update
sudo apt install -y python3 python3-venv python3-pip postgresql postgresql-contrib

sudo mkdir -p "$APP_DIR"
sudo cp -r . "$APP_DIR/"
sudo chown -R "$USER:$USER" "$APP_DIR"

cd "$APP_DIR"
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

cp -n .env.example .env || true
python scripts/init_db.py
python scripts/build_index.py

echo "Backend installed in $APP_DIR"
echo "Start with: source $APP_DIR/.venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000"
