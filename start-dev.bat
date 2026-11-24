@echo off
cd /d "%~dp0"
if not exist node_modules call npm install
start "" /min cmd /c "timeout /t 10 >nul & start http://localhost:5173"
call npm run dev
pause
