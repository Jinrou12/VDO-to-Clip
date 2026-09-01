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

def get_entry_url():
    """Gets absolute path to index.html or local server URL."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(base_dir, "index.html")
    if os.path.exists(index_path):
        return f"file:///{index_path.replace('\\', '/')}"
    return "http://localhost:5000"

def main():
    # Start backend HTTP API server on port 5000 in daemon thread
    server_thread = threading.Thread(target=start_backend_server, args=(5000,), daemon=True)
    server_thread.start()
    
    time.sleep(0.5)

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
