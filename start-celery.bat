@echo off
cd /d %~dp0
echo ==========================================
echo   BotPlatform - Celery Worker + Beat
echo ==========================================
echo.

:: Start Celery Worker
start "Celery Worker" cmd /k "cd /d %~dp0 && call backend\venv\Scripts\activate.bat && cd backend && celery -A config worker -l info --pool=solo"

:: Start Celery Beat
start "Celery Beat" cmd /k "cd /d %~dp0 && call backend\venv\Scripts\activate.bat && cd backend && celery -A config beat -l info"

echo Celery Worker and Beat started!
echo.
pause
