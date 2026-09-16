import os
import json
import urllib.request
import urllib.parse
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Response, Header, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from job_manager import job_manager, JobState
import auto_clip_engine
from security import (
    validate_safe_path,
    mask_secret,
    LocalSessionManager,
    is_allowed_origin
)
from ai_pipeline import run_discovery_pipeline

# Initialize session manager
session_mgr = LocalSessionManager()

# Background Processing Function
def process_video_job(job_id: str, manager):
    """
    Bridge between JobManager and AI discovery pipeline.
    Runs in background worker thread.
    """
    job = manager.get_job(job_id)
    if not job:
        return
    if manager.is_cancelled(job_id):
        manager.update_job(job_id, status=JobState.CANCELLED, message="Job was cancelled")
        return

    # Offload to the pipeline
    run_discovery_pipeline(job_id, job.video_path, manager)

# Register processor with JobManager
job_manager.set_processor(process_video_job)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: recover any active jobs interrupted by prior crash/restart
    recovered = job_manager.recover_interrupted_jobs()
    if recovered > 0:
        print(f"[Startup] Recovered {recovered} interrupted jobs into FAILED_RETRYABLE state.", flush=True)
    job_manager.start_worker()
    yield
    # Shutdown
    job_manager.stop_worker()

app = FastAPI(
    title="Khmer Auto-Clip Engine API (v2.0)",
    description="Secure, production-ready backend for Khmer Video Clipper Pro",
    lifespan=lifespan
)

# CORS Configuration
ALLOWED_CORS_ORIGINS = [
    "http://127.0.0.1:5000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:8080",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(127\.0\.0\.1|localhost)(:\d+)?$|^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler to Prevent Leaking Stack Traces or Secrets
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    sanitized_msg = mask_secret(str(exc))
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error", "detail": sanitized_msg}
    )

# Request Models
class GeminiKeyRequest(BaseModel):
    api_key: str

class GeminiPoolRequest(BaseModel):
    keys: List[str]

class TranscribeRequest(BaseModel):
    video_path: Optional[str] = None
    video: Optional[str] = None
    engine: str = "gemini"
    api_key: str = ""

class BatchQueueRequest(BaseModel):
    videos: List[str]
    parallel: bool = True

class OmniRouteRequest(BaseModel):
    url: str = 'http://localhost:20128/v1/chat/completions'
    headers: dict = Field(default_factory=lambda: {'Content-Type': 'application/json'})
    body: dict = Field(default_factory=dict)

class ConsensusCouncilRequest(BaseModel):
    video: str
    min_duration: Optional[int] = 120

class ClipsFromTranscriptRequest(BaseModel):
    transcript_json: List[Any]
    video_duration: float
    topic: Optional[str] = ""

class ClipFeedbackRequest(BaseModel):
    clip_id: str
    job_id: Optional[str] = ""
    video_path: Optional[str] = ""
    start_sec: float = 0.0
    end_sec: float = 0.0
    duration: float = 0.0
    title: str = ""
    hook_text: str = ""
    score: float = 0.0
    action: str = "ACCEPTED"
    reason: Optional[str] = ""
    adjusted_start: Optional[float] = None
    adjusted_end: Optional[float] = None

# --- Authentication & Origin Middleware / Dependency ---
def verify_session_or_local(
    request: Request,
    x_session_token: Optional[str] = Header(None)
):
    """
    Validates that request comes from local loopback or contains valid session token.
    """
    origin = request.headers.get("origin") or request.headers.get("referer")
    if origin and not is_allowed_origin(origin):
        raise HTTPException(status_code=403, detail="Forbidden origin")

    client_host = request.client.host if request.client else ""
    is_local = client_host in ("127.0.0.1", "::1", "localhost", "testclient")

    if not is_local:
        if not session_mgr.verify_token(x_session_token):
            raise HTTPException(status_code=401, detail="Invalid or missing session token")

# --- API Endpoints ---

@app.get("/api/auth/token")
def get_session_token(request: Request):
    """Allows local clients to retrieve session token."""
    client_host = request.client.host if request.client else ""
    if client_host not in ("127.0.0.1", "::1", "localhost", "testclient"):
        raise HTTPException(status_code=403, detail="Session token can only be obtained locally")
    return {"session_token": session_mgr.session_token}

@app.get("/api/status")
@app.get("/api/health")
def get_status():
    key = auto_clip_engine.get_saved_gemini_key()
    return {
        "status": "online",
        "service": "Khmer Auto-Clip Engine (FastAPI + Job Manager)",
        "gemini_native_audio": True,
        "whisper_on_cpu": False,
        "claude_auditor": True,
        "has_gemini_key": bool(key),
        "ffmpeg_available": bool(auto_clip_engine.get_ffmpeg_cmd())
    }

@app.get("/api/gemini/key")
def get_gemini_key():
    key = auto_clip_engine.get_saved_gemini_key()
    return {
        "has_key": bool(key),
        "key_preview": (key[:6] + "..." + key[-4:]) if (key and len(key) > 10) else ""
    }

@app.post("/api/gemini/key")
def set_gemini_key(req: GeminiKeyRequest, _auth=Depends(verify_session_or_local)):
    key_clean = req.api_key.strip()
    auto_clip_engine.save_gemini_key(key_clean)
    return {"success": True, "saved": bool(key_clean)}

@app.get("/api/gemini/pool")
def get_gemini_pool():
    summary = auto_clip_engine.KEY_POOL.get_status_summary()
    return {
        "count": len(auto_clip_engine.KEY_POOL.pool),
        "keys": summary
    }

@app.post("/api/gemini/pool")
def set_gemini_pool(req: GeminiPoolRequest, _auth=Depends(verify_session_or_local)):
    clean_keys = [k.strip() for k in req.keys if k and k.strip()]
    auto_clip_engine.KEY_POOL.set_keys(clean_keys)
    return {
        "success": True,
        "count": len(auto_clip_engine.KEY_POOL.pool),
        "keys": auto_clip_engine.KEY_POOL.get_status_summary()
    }

# --- Job Management Endpoints ---

@app.post("/api/batch/queue")
def queue_batch(req: BatchQueueRequest, _auth=Depends(verify_session_or_local)):
    if not req.videos:
        raise HTTPException(status_code=400, detail="Video list cannot be empty")
    if len(req.videos) > 50:
        raise HTTPException(status_code=400, detail="Batch size exceeds maximum limit of 50 videos")

    queued_jobs = []
    invalid_videos = []

    for video in req.videos:
        try:
            # Enforce path safety: prevent traversal, system files, invalid extensions
            safe_path = validate_safe_path(video, must_exist=True)
            job = job_manager.create_job(video_path=safe_path)
            queued_jobs.append(job.id)
        except Exception as e:
            invalid_videos.append({"video": mask_secret(video), "error": str(e)})

    if not queued_jobs and invalid_videos:
        raise HTTPException(status_code=400, detail=f"Failed to queue videos: {invalid_videos[0]['error']}")

    return {
        "success": True,
        "queued_jobs": queued_jobs,
        "invalid_videos": invalid_videos
    }

@app.get("/api/batch/status")
def get_batch_status():
    jobs = job_manager.get_all_jobs()
    total = len(jobs)
    completed = len([j for j in jobs if j.status == JobState.COMPLETED])
    failed = len([j for j in jobs if j.status in (JobState.FAILED, JobState.FAILED_RETRYABLE, JobState.FAILED_PERMANENT)])
    is_running = any(
        j.status not in (JobState.COMPLETED, JobState.FAILED, JobState.FAILED_RETRYABLE, JobState.FAILED_PERMANENT, JobState.CANCELLED)
        for j in jobs
    )

    return {
        "is_running": is_running,
        "total_videos": total,
        "processed_videos": completed + failed,
        "jobs": [j.model_dump() for j in jobs]
    }

@app.post("/api/batch/start")
def start_batch(_auth=Depends(verify_session_or_local)):
    """Triggers the worker loop to start processing queued jobs."""
    job_manager.start_worker()
    return {"success": True, "message": "Batch processing started"}

@app.post("/api/batch/clear")
def clear_batch(_auth=Depends(verify_session_or_local)):
    """Clears completed or failed jobs."""
    deleted_count = job_manager.clear_finished_jobs()
    return {"success": True, "cleared_count": deleted_count}

@app.get("/api/batch/results")
def get_batch_results():
    """Returns consolidated results of all completed jobs."""
    jobs = job_manager.get_all_jobs()
    completed_jobs = [j for j in jobs if j.status == JobState.COMPLETED]
    all_clips = []
    for j in completed_jobs:
        try:
            data = json.loads(j.result_data)
            clips = data.get("clips", [])
            all_clips.extend(clips)
        except Exception:
            pass

    return {
        "success": True,
        "total_clips": len(all_clips),
        "all_clips": all_clips,
        "videos": [j.video_path for j in completed_jobs]
    }

@app.get("/api/jobs/{job_id}")
def get_job_status(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job.model_dump()

@app.post("/api/jobs/{job_id}/cancel")
def cancel_job(job_id: str, _auth=Depends(verify_session_or_local)):
    cancelled = job_manager.cancel_job(job_id)
    if not cancelled:
        raise HTTPException(status_code=400, detail="Cannot cancel job: job not found or already finished")
    return {"success": True, "job_id": job_id, "status": JobState.CANCELLED}

@app.post("/api/jobs/{job_id}/retry")
def retry_job(job_id: str, _auth=Depends(verify_session_or_local)):
    retried = job_manager.retry_job(job_id)
    if not retried:
        raise HTTPException(status_code=400, detail="Cannot retry job: job not found or not in failed state")
    return {"success": True, "job_id": job_id, "status": JobState.QUEUED}

# --- Compatibility Endpoints for Frontend (Consensus Council, Transcribe, Proxy) ---

@app.post("/api/clips/consensus-council")
def consensus_council(req: ConsensusCouncilRequest, _auth=Depends(verify_session_or_local)):
    safe_path = validate_safe_path(req.video, must_exist=True)
    # Check if existing cached clips exist
    if os.path.exists("consensus_council_clips.json"):
        try:
            with open("consensus_council_clips.json", "r", encoding="utf-8") as f:
                clips = json.load(f)
            return {"success": True, "cached": True, "clips": clips}
        except Exception:
            pass

    # Create a job for this video
    job = job_manager.create_job(video_path=safe_path)
    return {"success": True, "cached": False, "job_id": job.id, "message": "Queued for consensus council"}

@app.get("/api/clips/consensus-council")
def get_consensus_council():
    if os.path.exists("consensus_council_clips.json"):
        with open("consensus_council_clips.json", "r", encoding="utf-8") as f:
            clips = json.load(f)
        return {"success": True, "clips": clips}
    raise HTTPException(status_code=404, detail="No consensus council clips available yet")

@app.get("/api/transcript")
def get_transcript():
    if os.path.exists("transcript.json"):
        with open("transcript.json", "r", encoding="utf-8") as f:
            segments = json.load(f)
        return {"success": True, "segments": segments}
    raise HTTPException(status_code=404, detail="No transcript available yet")

@app.post("/api/clips/feedback")
def record_feedback(req: ClipFeedbackRequest, _auth=Depends(verify_session_or_local)):
    """Records editor feedback (accept/reject/edit) into SQLite to train few-shot prompts."""
    res = job_manager.record_clip_feedback(
        clip_id=req.clip_id,
        job_id=req.job_id or "",
        video_path=req.video_path or "",
        start_sec=req.start_sec,
        end_sec=req.end_sec,
        duration=req.duration,
        title=req.title,
        hook_text=req.hook_text,
        score=req.score,
        action=req.action,
        reason=req.reason or "",
        adjusted_start=req.adjusted_start,
        adjusted_end=req.adjusted_end
    )
    return res

@app.get("/api/clips/feedback/summary")
def get_feedback_summary():
    """Returns count of accepted, rejected, and edited clips."""
    return job_manager.get_feedback_summary()

@app.get("/api/clips/feedback/few-shots")
def get_feedback_few_shots(limit: int = Query(5, ge=1, le=20)):
    """Returns top approved and rejected examples for in-context few-shot prompting."""
    return job_manager.get_feedback_few_shots(limit=limit)

@app.get("/api/clips/feedback/export")
def export_feedback():
    """Exports all learned feedback and rules as a portable JSON knowledge pack."""
    return job_manager.export_feedback_data()

@app.post("/api/clips/feedback/import")
def import_feedback(payload: Dict[str, Any], _auth=Depends(verify_session_or_local)):
    """Imports an AI Knowledge Pack from another PC or cloud backup."""
    imported_count = job_manager.import_feedback_data(payload)
    return {"success": True, "imported_count": imported_count}

@app.post("/api/proxy-omniroute")
def proxy_omniroute(req: OmniRouteRequest, _auth=Depends(verify_session_or_local)):
    """
    Safely proxies chat completion requests to local OmniRoute / Ollama LLM.
    Blocks requests to non-loopback external endpoints to prevent SSRF.
    """
    parsed = urllib.parse.urlparse(req.url)
    hostname = parsed.hostname or ""
    if hostname not in ("localhost", "127.0.0.1", "::1"):
        raise HTTPException(status_code=400, detail="OmniRoute proxy only permits localhost endpoints")

    try:
        data = json.dumps(req.body).encode("utf-8")
        headers = dict(req.headers)
        headers["Content-Type"] = "application/json"
        out_req = urllib.request.Request(req.url, data=data, headers=headers)
        with urllib.request.urlopen(out_req, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Proxy error: {mask_secret(str(e))}")

if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI Server on 127.0.0.1:5000...")
    uvicorn.run("api:app", host="127.0.0.1", port=5000, reload=True)
