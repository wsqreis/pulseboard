from __future__ import annotations

import os
import sys
from pathlib import Path

API_ROOT = Path(__file__).resolve().parents[1]
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

DATABASE_PATH = API_ROOT / 'e2e.sqlite3'
if DATABASE_PATH.exists():
    DATABASE_PATH.unlink()

os.environ['PULSEBOARD_DATABASE_URL'] = f"sqlite+pysqlite:///{DATABASE_PATH.as_posix()}"
os.environ['PULSEBOARD_APP_BASE_URL'] = 'http://127.0.0.1:4173'

from seed_demo import seed_demo

seed_demo()

import uvicorn

uvicorn.run('app.main:app', host='127.0.0.1', port=8000, log_level='warning')
