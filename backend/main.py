"""
Carpe Diem — Backend API Gateway (port 8000).

Proxies all /api/* calls to the ML microservice running on port 8001.
The React frontend talks exclusively to this gateway.
"""

import httpx
from fastapi import FastAPI, Request, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

ML_SERVICE_URL = "http://localhost:8001"

app = FastAPI(
    title="Carpe Diem API Gateway",
    description="Central gateway that proxies ML and report endpoints for the React frontend.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def _proxy(method: str, path: str, request: Request) -> JSONResponse:
    """Generic proxy to ML microservice."""
    url = f"{ML_SERVICE_URL}{path}"
    try:
        body = await request.body()
        headers = {
            k: v for k, v in request.headers.items()
            if k.lower() not in ("host", "content-length")
        }
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.request(
                method=method,
                url=url,
                content=body,
                headers=headers,
                params=dict(request.query_params),
            )
        try:
            data = resp.json()
        except Exception:
            data = {"raw": resp.text}
        return JSONResponse(content=data, status_code=resp.status_code)
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="ML microservice is not running. Start it with: py -3.10 models/air_pollution/run_server.py",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health(request: Request):
    return await _proxy("GET", "/api/health", request)


@app.get("/api/cities")
async def cities(request: Request):
    return await _proxy("GET", "/api/cities", request)


@app.get("/api/current")
async def current(request: Request):
    return await _proxy("GET", "/api/current", request)


@app.post("/api/forecast")
async def forecast(request: Request):
    return await _proxy("POST", "/api/forecast", request)


@app.post("/api/generate-report")
async def generate_report(request: Request):
    return await _proxy("POST", "/api/generate-report", request)


@app.get("/api/model-info")
async def model_info(request: Request):
    return await _proxy("GET", "/api/model-info", request)


@app.get("/api/cpcb-scale")
async def cpcb_scale(request: Request):
    return await _proxy("GET", "/api/cpcb-scale", request)


@app.post("/api/noise/cortn-predict")
async def noise_cortn_predict(request: Request):
    return await _proxy("POST", "/api/noise/cortn-predict", request)


@app.get("/api/noise/city-corridors")
async def noise_city_corridors(request: Request):
    return await _proxy("GET", "/api/noise/city-corridors", request)


@app.get("/api/noise/live-telemetry")
async def noise_live_telemetry(request: Request):
    return await _proxy("GET", "/api/noise/live-telemetry", request)


@app.get("/api/noise/sound-taxonomy")
async def noise_sound_taxonomy(request: Request):
    return await _proxy("GET", "/api/noise/sound-taxonomy", request)


@app.post("/api/noise/classify-sound")
async def noise_classify_sound(request: Request):
    """
    Streams a multipart spectrogram upload directly to the ML microservice.
    The raw body + headers (Content-Type with boundary) are forwarded as-is.
    """
    url = f"{ML_SERVICE_URL}/api/noise/classify-sound"
    try:
        body = await request.body()
        # Forward the content-type header so the ML service can parse the boundary
        headers = {
            k: v for k, v in request.headers.items()
            if k.lower() not in ("host", "content-length")
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, content=body, headers=headers)
        try:
            data = resp.json()
        except Exception:
            data = {"raw": resp.text}
        return JSONResponse(content=data, status_code=resp.status_code)
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="ML microservice is not running. Start it with: py -3.10 models/air_pollution/run_server.py",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {
        "service": "Carpe Diem API Gateway",
        "version": "1.0.0",
        "ml_microservice": ML_SERVICE_URL,
        "docs": "/docs",
    }
