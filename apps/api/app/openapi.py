from __future__ import annotations

import json
from pathlib import Path

from app.main import create_app


def export_openapi_schema(output_path: Path) -> None:
    app = create_app()
    schema = app.openapi()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(schema, indent=2), encoding="utf-8")
