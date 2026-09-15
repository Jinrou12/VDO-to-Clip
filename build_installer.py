"""
Build Script for Khmer Video Clipper Pro Desktop Application (.exe)
---------------------------------------------------------------------
Compiles HTML/CSS/JS assets, Python backend, Whisper, and FFmpeg
into a standalone Windows Desktop Executable (.exe).
"""

import os
import sys
import subprocess

# Fix Windows console encoding
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def build_exe():
    print("📦 [Step 1/3] Compiling TypeScript source files (npm run build)...")
    try:
        subprocess.run(["npm", "run", "build"], shell=True, check=True)
        print("✅ TypeScript compiled successfully into app.js and firebase_service.js!")
    except Exception as e:
        print(f"⚠️ Warning: TypeScript compilation failed or npm not found: {e}")

    print("🔨 [Step 2/3] Building Khmer_Video_Clipper_Pro.exe with PyInstaller...")

    # Options for PyInstaller using sys.executable module call
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--onedir",
        "--windowed",
        "--name", "Khmer_Video_Clipper_Pro",
        "--add-data", "index.html;.",
        "--add-data", "app.js;.",
        "--add-data", "firebase_service.js;.",
        "--add-data", "styles.css;.",
        "--add-data", "poster_demo.css;.",
        "--add-data", "poster_demo.js;.",
        "--add-data", "poster_demo.html;.",
        "desktop_app.py"
    ]

    result = subprocess.run(cmd)
    if result.returncode == 0:
        print("✅ [Step 2/3] Executable built successfully in 'dist/Khmer_Video_Clipper_Pro/Khmer_Video_Clipper_Pro.exe'!")
    else:
        print("❌ Error building executable.")
        sys.exit(1)

def create_installer_bat():
    print("🔨 [Step 2/2] Creating One-Click Launcher and Desktop Installer...")
    
    launcher_content = """@echo off
title Khmer Video Clipper Pro
echo Starting Khmer Video Clipper Pro...
python desktop_app.py
"""
    with open("Run_Khmer_Video_Clipper_Pro.bat", "w", encoding="utf-8") as f:
        f.write(launcher_content)
    
    print("✅ Created 'Run_Khmer_Video_Clipper_Pro.bat' Desktop Launcher!")

if __name__ == "__main__":
    build_exe()
    create_installer_bat()
