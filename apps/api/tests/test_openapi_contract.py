from __future__ import annotations

import json
from pathlib import Path

from app.openapi import export_openapi_schema


def test_export_openapi_schema(tmp_path: Path) -> None:
    output_path = tmp_path / "openapi.json"
    export_openapi_schema(output_path)

    exported = json.loads(output_path.read_text(encoding="utf-8"))
    assert exported["info"]["title"] == "Pulseboard API"
    assert "/api/v1/auth/register" in exported["paths"]
    assert "/api/v1/communities" in exported["paths"]
    assert "/api/v1/posts/{post_id}" in exported["paths"]
