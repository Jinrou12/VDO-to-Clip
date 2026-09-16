"""
Vercel Serverless API handler for Khmer Video Clipper Pro.
Handles all /api/* routes as a single Python serverless function.
Heavy processing (FFmpeg, batch jobs) requires the local backend.
"""
import json
import os
import re
import hmac
import secrets
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# ── helpers ────────────────────────────────────────────────────────────────────

def _mask_key(key: str) -> str:
    if key and len(key) > 10:
        return key[:6] + "..." + key[-4:]
    return ""

def _get_env_key() -> str:
    return (
        os.environ.get("GEMINI_API_KEY", "") or
        os.environ.get("VITE_GEMINI_API_KEY", "")
    ).strip()

def _cors_headers() -> dict:
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Token, Authorization",
        "Content-Type": "application/json",
    }

# ── route handlers ──────────────────────────────────────────────────────────────

def handle_health(_method, _body, _qs):
    key = _get_env_key()
    return 200, {
        "status": "online",
        "service": "Khmer Auto-Clip Engine (Vercel Serverless)",
        "version": "2.0-serverless",
        "gemini_native_audio": True,
        "whisper_on_cpu": False,
        "claude_auditor": True,
        "has_gemini_key": bool(key),
        "ffmpeg_available": False,
        "note": "Video processing (FFmpeg/batch) requires the local Python backend on port 5000"
    }

def handle_gemini_key_get(_body, _qs):
    key = _get_env_key()
    return 200, {
        "has_key": bool(key),
        "key_preview": _mask_key(key),
        "source": "environment"
    }

def handle_gemini_key_post(body, _qs):
    try:
        data = json.loads(body or "{}")
        key = data.get("api_key", "").strip()
    except Exception:
        return 400, {"success": False, "error": "Invalid JSON body"}
    # On Vercel we can't persist to disk — instruct client to store in localStorage
    return 200, {
        "success": True,
        "saved": bool(key),
        "note": "On Vercel, the API key is stored in your browser's localStorage — set GEMINI_API_KEY env var on Vercel for persistence."
    }

def handle_gemini_pool_get(_body, _qs):
    key = _get_env_key()
    count = 1 if key else 0
    return 200, {
        "count": count,
        "keys": [{"preview": _mask_key(key), "status": "active"}] if key else []
    }

def handle_batch_status(_body, _qs):
    return 200, {
        "is_running": False,
        "total_videos": 0,
        "processed_videos": 0,
        "jobs": [],
        "note": "Batch processing requires the local backend. Start it with: python api.py"
    }

def handle_batch_results(_body, _qs):
    return 200, {
        "success": True,
        "total_clips": 0,
        "all_clips": [],
        "videos": [],
        "note": "Batch results require the local backend."
    }

def handle_transcript(_body, _qs):
    return 503, {
        "success": False,
        "error": "Transcript not available on Vercel serverless. Start the local backend on port 5000."
    }

def handle_consensus_council_get(_body, _qs):
    return 503, {
        "success": False,
        "error": "Consensus council requires the local backend with FFmpeg support."
    }

def handle_jobs_not_available(_body, _qs):
    return 503, {
        "success": False,
        "error": "Job management requires the local backend. Run: python api.py"
    }

def handle_not_found(path):
    return 404, {
        "success": False,
        "error": f"Route not found: {path}",
        "available_routes": [
            "GET  /api/health",
            "GET  /api/status",
            "GET  /api/gemini/key",
            "POST /api/gemini/key",
            "GET  /api/gemini/pool",
            "GET  /api/batch/status",
            "GET  /api/batch/results",
        ]
    }

# ── main router ─────────────────────────────────────────────────────────────────

def route(method: str, path: str, body: str, qs: dict):
    # Strip query string from path for matching
    path = path.split("?")[0].rstrip("/") or "/"

    # Health / status
    if path in ("/api/health", "/api/status") and method == "GET":
        return handle_health(method, body, qs)

    # Gemini key
    if path == "/api/gemini/key":
        if method == "GET":
            return handle_gemini_key_get(body, qs)
        if method == "POST":
            return handle_gemini_key_post(body, qs)

    # Gemini pool
    if path == "/api/gemini/pool" and method == "GET":
        return handle_gemini_pool_get(body, qs)

    # Batch
    if path == "/api/batch/status" and method == "GET":
        return handle_batch_status(body, qs)
    if path == "/api/batch/results" and method == "GET":
        return handle_batch_results(body, qs)

    # Transcript
    if path == "/api/transcript" and method == "GET":
        return handle_transcript(body, qs)

    # Consensus council
    if path == "/api/clips/consensus-council" and method == "GET":
        return handle_consensus_council_get(body, qs)

    # Any remaining job/batch mutation endpoints
    if path.startswith("/api/batch/") or path.startswith("/api/jobs/"):
        return handle_jobs_not_available(body, qs)

    return handle_not_found(path)


# ── Vercel WSGI/Handler class ────────────────────────────────────────────────────

class handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress default access log noise

    def _send(self, status: int, data: dict):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.end_headers()

    def _read_body(self) -> str:
        length = int(self.headers.get("Content-Length", 0) or 0)
        if length > 0:
            return self.rfile.read(length).decode("utf-8", errors="replace")
        return ""

    def do_GET(self):
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)
        # Check if original path is stored in headers by Vercel rewrite
        raw_path = self.headers.get("x-matched-path") or self.headers.get("x-invoke-path") or parsed.path
        if raw_path in ("/", "/api", "/api/index", "/api/index.py") and "path" in qs:
            raw_path = "/api/" + qs["path"][0].lstrip("/")
        status, data = route("GET", raw_path, "", qs)
        self._send(status, data)

    def do_POST(self):
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)
        raw_path = self.headers.get("x-matched-path") or self.headers.get("x-invoke-path") or parsed.path
        if raw_path in ("/", "/api", "/api/index", "/api/index.py") and "path" in qs:
            raw_path = "/api/" + qs["path"][0].lstrip("/")
        body = self._read_body()
        status, data = route("POST", raw_path, body, qs)
        self._send(status, data)
