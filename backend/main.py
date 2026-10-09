"""SafeRouteAI FastAPI backend.
Run from backend/: python -m uvicorn main:app --host 127.0.0.1 --port 8000
"""

import logging
import uuid
from collections import OrderedDict
from typing import Any, Dict, Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services import geospatial_service as geo
from services import routing_service as routing
from services.prediction_service import (
    ModelNotReady,
    get_model,
    risk_level,
)
from services import shap_service


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("saferoute")

app = FastAPI(title="SafeRouteAI API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

DISCLAIMER = (
    "Risk predictions are generated from historical accident data and are "
    "intended for research and demonstration purposes. Predictions indicate "
    "estimated historical accident risk and should not be interpreted as "
    "guaranteed accident probability or a substitute for safe driving. "
    "Routing times are estimates and are not based on live traffic."
)

# analysis_id -> route data; retain the latest 20 analyses in memory.
CACHE: "OrderedDict[str, dict]" = OrderedDict()


class RouteRequest(BaseModel):
    start: str = Field(..., min_length=2, max_length=200)
    end: str = Field(..., min_length=2, max_length=200)
    hour: Optional[int] = Field(None, ge=0, le=23)
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    month: Optional[int] = Field(None, ge=1, le=12)


class PredictRequest(BaseModel):
    features: Dict[str, Any] = Field(
        default_factory=dict,
        description="Subset of model features; others use defaults",
    )


class ExplainRequest(BaseModel):
    analysis_id: str
    route_index: int = 0
    segment_id: Optional[str] = None


def _model():
    """Return the loaded model or raise a useful HTTP error."""
    try:
        return get_model()
    except ModelNotReady as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


def _geocode_pair(req: RouteRequest):
    """Geocode the requested start and destination."""
    try:
        return routing.geocode(req.start), routing.geocode(req.end)
    except routing.RoutingError as exc:
        raise HTTPException(
            status_code=exc.status,
            detail=str(exc),
        ) from exc


@app.get("/api/health")
def health():
    ready = True

    try:
        get_model()
    except ModelNotReady:
        ready = False

    return {
        "status": "ok",
        "model_loaded": ready,
    }


@app.get("/api/model-info")
def model_info():
    model = _model()
    meta = model.meta

    return {
        "algorithm": meta["algorithm"],
        "classes": meta["classes"],
        "features": meta["features"],
        "risk_score_formula": meta["risk_score_formula"],
        "metrics": meta["metrics"],
        "data_report": meta["data_report"],
        "disclaimer": DISCLAIMER,
    }


@app.post("/api/route")
def route(req: RouteRequest):
    start, end = _geocode_pair(req)

    try:
        routes = routing.get_routes(start, end)
    except routing.RoutingError as exc:
        raise HTTPException(
            status_code=exc.status,
            detail=str(exc),
        ) from exc

    return {
        "start": start,
        "end": end,
        "routes": [
            {
                "distance_m": item["distance_m"],
                "duration_s": item["duration_s"],
                "path": item["path"],
            }
            for item in routes
        ],
    }


@app.post("/api/predict")
def predict(req: PredictRequest):
    model = _model()

    unknown = [
        key for key in req.features
        if key not in model.features
    ]

    if unknown:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown features {unknown}. Valid: {model.features}",
        )

    probabilities, scores = model.predict(
        pd.DataFrame([req.features])
    )

    return {
        "risk_score": round(float(scores[0]), 1),
        "risk_level": risk_level(scores[0]),
        "class_probabilities": {
            f"Severity {class_label}": round(float(probability), 4)
            for class_label, probability in zip(
                model.classes,
                probabilities[0],
            )
        },
        "note": "Estimated historical accident risk, not a guarantee.",
    }


@app.post("/api/route-risk")
def route_risk(req: RouteRequest):
    _model()
    start, end = _geocode_pair(req)

    try:
        raw_routes = routing.get_routes(start, end)
    except routing.RoutingError as exc:
        raise HTTPException(
            status_code=exc.status,
            detail=str(exc),
        ) from exc

    context = geo.now_context()

    context.update({
        key: value
        for key, value in (
            ("hour", req.hour),
            ("day_of_week", req.day_of_week),
            ("month", req.month),
        )
        if value is not None
    })

    analysis_id = uuid.uuid4().hex[:10]
    routes = []
    stored_routes = []

    try:
        for index, raw_route in enumerate(raw_routes):
            summary, segments, features, lengths = geo.analyze_route(
                raw_route,
                context,
                f"{analysis_id}-R{index}",
            )

            routes.append({
                "index": index,
                "summary": summary,
                "segments": segments,
                "path": raw_route["path"],
            })

            stored_routes.append({
                "segments": {
                    segment["id"]: j
                    for j, segment in enumerate(segments)
                },
                "X": features,
                "L": lengths,
                "seg_list": segments,
            })

    except FileNotFoundError as exc:
        logger.exception("Required route-analysis file was not found")
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        logger.exception("Invalid data during route analysis")
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        logger.exception("Unexpected error during route analysis")
        raise HTTPException(
            status_code=500,
            detail=f"Route analysis failed: {type(exc).__name__}: {exc}",
        ) from exc

    if not routes:
        raise HTTPException(
            status_code=422,
            detail="No routes were returned for this journey.",
        )

    scores = np.array([
        item["summary"]["risk_score"]
        for item in routes
    ])

    times = np.array([
        item["summary"]["estimated_time_min"]
        for item in routes
    ])

    safest = int(np.argmin(scores))
    fastest = int(np.argmin(times))

    balanced = None
    remaining = [
        i for i in range(len(routes))
        if i not in (safest, fastest)
    ]

    if remaining:
        def normalize(values):
            if values.max() > values.min():
                return (
                    (values - values.min())
                    / (values.max() - values.min())
                )
            return np.zeros_like(values)

        combined = normalize(scores) + normalize(times)
        balanced = int(
            min(remaining, key=lambda i: combined[i])
        )

    CACHE[analysis_id] = {
        "routes": stored_routes,
    }

    while len(CACHE) > 20:
        CACHE.popitem(last=False)

    return {
        "analysis_id": analysis_id,
        "start": start,
        "end": end,
        "context": context,
        "routes": routes,
        "comparison": {
            "safest": safest,
            "balanced": balanced,
            "fastest": fastest,
        },
        "notes": [
            "Estimated Time comes from OSRM routing, not live traffic.",
            "Weather inputs use typical historical San Diego values "
            "(no live weather).",
            "Segment features come from historical accidents within "
            "100-600 m; segments with none are flagged.",
        ],
        "disclaimer": DISCLAIMER,
    }


def _entry(analysis_id: str, route_index: int):
    """Retrieve a cached route from a previous analysis."""
    if analysis_id not in CACHE:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found or expired. Generate routes again.",
        )

    routes = CACHE[analysis_id]["routes"]

    if route_index < 0 or route_index >= len(routes):
        raise HTTPException(
            status_code=404,
            detail="Route not found for this analysis.",
        )

    return routes[route_index]


@app.get("/api/segment/{segment_id}")
def segment(segment_id: str):
    try:
        analysis_id, route_key, _ = segment_id.split("-")
        route_index = int(route_key[1:])

    except (ValueError, IndexError):
        raise HTTPException(
            status_code=400,
            detail="Malformed segment id.",
        )

    entry = _entry(analysis_id, route_index)
    segment_index = entry["segments"].get(segment_id)

    if segment_index is None:
        raise HTTPException(
            status_code=404,
            detail="Segment not found.",
        )

    return entry["seg_list"][segment_index]


@app.post("/api/explain")
def explain(req: ExplainRequest):
    """Explain route or segment risk with SHAP.

    Unexpected errors are logged with a traceback and returned as a
    descriptive HTTP 500 response to help diagnose explanation failures.
    """
    try:
        _model()

        entry = _entry(
            req.analysis_id,
            req.route_index,
        )

        if req.segment_id:
            segment_index = entry["segments"].get(
                req.segment_id
            )

            if segment_index is None:
                raise HTTPException(
                    status_code=404,
                    detail="Segment not found.",
                )

            factors = shap_service.top_factors(
                entry["X"].iloc[[segment_index]]
            )
            scope = "segment"

        else:
            factors = shap_service.top_factors(
                entry["X"],
                weights=entry["L"],
            )
            scope = (
                "route (length-weighted mean of segment SHAP values)"
            )

        return {
            "scope": scope,
            "factors": factors,
            "units": (
                "SHAP values in severity-weighted log-odds space; "
                "positive = increases predicted risk"
            ),
        }

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception(
            "SHAP explanation failed: analysis_id=%s, route_index=%s",
            req.analysis_id,
            req.route_index,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Explanation failed: {type(exc).__name__}: {exc}"
            ),
        ) from exc