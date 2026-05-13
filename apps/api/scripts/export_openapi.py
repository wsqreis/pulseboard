from pathlib import Path

from app.openapi import export_openapi_schema

if __name__ == "__main__":
    export_openapi_schema(
        Path(__file__).resolve().parents[3] / "packages" / "contracts" / "openapi.json"
    )
