@echo off
cd /d %~dp0
echo ==========================================
echo   BotPlatform - Start All Services
echo ==========================================
echo.
echo Starting 4 processes:
echo   - Django backend     (port 8000)
echo   - Celery worker
echo   - Celery beat
echo   - React frontend     (port 5173)
echo.
echo To stop all services run: stop.bat
echo ==========================================
echo.

:: Start Django backend
start "Django Backend" cmd /k "cd /d %~dp0 && call backend\venv\Scripts\activate.bat && cd backend && python manage.py runserver 0.0.0.0:8000"

:: Small delay so Django starts first
timeout /t 2 /nobreak >nul

:: Start Celery Worker
start "Celery Worker" cmd /k "cd /d %~dp0 && call backend\venv\Scripts\activate.bat && cd backend && celery -A config worker -l info --pool=solo"

:: Start Celery Beat
start "Celery Beat" cmd /k "cd /d %~dp0 && call backend\venv\Scripts\activate.bat && cd backend && celery -A config beat -l info"

:: Start React Frontend
start "React Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo All services started!
echo.
echo   Frontend:     http://localhost:5173
echo   Backend API:  http://localhost:8000/api/v1/
echo   Django Admin: http://localhost:8000/admin/
echo.
pause
