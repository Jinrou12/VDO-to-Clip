@echo off
title Install Khmer Video Clipper Pro Desktop Application
color 0A
echo ========================================================
echo   Khmer Video Clipper Pro - Desktop Installer Setup
echo ========================================================
echo.
echo [1/2] Creating Desktop Shortcut...
set TARGET_EXE=%~dp0dist\Khmer_Video_Clipper_Pro\Khmer_Video_Clipper_Pro.exe
set SCRIPT_DIR=%~dp0

powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%USERPROFILE%\Desktop\Khmer Video Clipper Pro.lnk'); $s.TargetPath='%TARGET_EXE%'; $s.WorkingDirectory='%SCRIPT_DIR%'; $s.Save()"

echo [2/2] Launching Khmer Video Clipper Pro...
echo.
echo SUCCESS! Application shortcut created on your Desktop.
echo Starting application now...
start "" "%TARGET_EXE%"
pause
