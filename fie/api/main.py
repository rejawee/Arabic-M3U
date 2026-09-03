"""Minimal FastAPI surface for FIE prediction cards."""

from __future__ import annotations

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException

ROOT = Path(__file__).resolve().parents[1]
SAMPLE = ROOT / "data" / "samples" / "prediction.example.json"

app = FastAPI(title="FIE — Football Intelligence Engine", version="0.1.0")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "fie"}


@app.get("/v1/predictions/sample")
def sample_prediction() -> dict:
    if not SAMPLE.exists():
        raise HTTPException(status_code=404, detail="sample prediction missing")
    return json.loads(SAMPLE.read_text(encoding="utf-8"))


@app.get("/v1/predictions/{match_id}")
def get_prediction(match_id: str) -> dict:
    # MVP stub: return sample when ids match; otherwise 404 until ingest is wired.
    payload = json.loads(SAMPLE.read_text(encoding="utf-8"))
    if match_id != payload.get("match_id"):
        raise HTTPException(
            status_code=404,
            detail="Prediction not generated yet. Wire ingest + models for live fixtures.",
        )
    return payload
