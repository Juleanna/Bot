@echo off
cd /d %~dp0
echo ==========================================
echo   BotPlatform - Backend Only
echo ==========================================
echo.

call backend\venv\Scripts\activate.bat
cd backend
python manage.py runserver 0.0.0.0:8000
