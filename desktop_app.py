"""
Khmer Video Clipper Pro - Standalone Desktop Application
---------------------------------------------------------
Native Windows Desktop Application powered by PyWebView,
OpenAI Whisper, Google Gemini API, and FFmpeg.
"""

import os
import sys
import time
import threading
import webview
from auto_clip_engine import run_server

def start_backend_server(port=5000):
    """Runs local auto_clip_engine server in a background thread."""
    try:
        run_server(port)
    except Exception as e:
        print(f"Backend server notice: {e}")

def wait_for_server(port=5000, timeout=15):
    """Waits until local HTTP server is listening and ready to accept connections."""
    import socket
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection(('127.0.0.1', port), timeout=0.5):
                return True
        except (OSError, ConnectionRefusedError):
            time.sleep(0.2)
    return False

def get_entry_url():
    """Returns local HTTP server entry URL."""
    return "http://127.0.0.1:5000"

def main():
    # Start backend HTTP API server on port 5000 in daemon thread
    server_thread = threading.Thread(target=start_backend_server, args=(5000,), daemon=True)
    server_thread.start()
    
    print("[INIT] Waiting for backend server to start...", flush=True)
    ready = wait_for_server(5000, timeout=15)
    if ready:
        print("[INIT] Backend server is online and ready!", flush=True)
    else:
        print("[WARN] Backend server took longer than expected to start, launching window anyway...", flush=True)

    entry_url = get_entry_url()
    print(f"🚀 Launching Desktop App: {entry_url}")

    # Create native Windows Desktop App window
    window = webview.create_window(
        title="Khmer Video Clipper Pro - AI Smart Video Clipper",
        url=entry_url,
        width=1340,
        height=860,
        resizable=True,
        min_size=(1024, 700),
        background_color="#0f172a"
    )

    webview.start(debug=False)

if __name__ == "__main__":
    main()
