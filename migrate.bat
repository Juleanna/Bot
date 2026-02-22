@echo off
cd /d %~dp0
echo ==========================================
echo   BotPlatform - Database Migrations
echo ==========================================
echo.

call backend\venv\Scripts\activate.bat
cd backend

echo Creating migrations...
python manage.py makemigrations

echo.
echo Applying migrations...
python manage.py migrate

echo.
echo Done!
pause
