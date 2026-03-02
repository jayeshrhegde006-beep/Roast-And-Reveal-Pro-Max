@echo off
title Roast & Reveal Launcher
echo [1/3] Synchronizing Artistic Data...
python export_data.py
if %ERRORLEVEL% NEQ 0 (
    echo Python not found as "python", trying "py"...
    py export_data.py
)
echo [2/3] Launching Premium Web Server...
start http://localhost:8080
echo [3/3] Dashboard is LIVE at http://localhost:8080
echo Press Ctrl+C to stop the server when finished.
python -m http.server 8080
if %ERRORLEVEL% NEQ 0 (
    py -m http.server 8080
)
pause
