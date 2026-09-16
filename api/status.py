import json
import os
from http.server import BaseHTTPRequestHandler

def _cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Token, Authorization",
        "Content-Type": "application/json",
    }

class handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.end_headers()

    def do_GET(self):
        key = (os.environ.get("GEMINI_API_KEY") or os.environ.get("VITE_GEMINI_API_KEY") or "").strip()
        data = {
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
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
