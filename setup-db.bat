@echo off
cd /d %~dp0
echo ==========================================
echo   BotPlatform - Database Setup
echo ==========================================
echo.

call backend\venv\Scripts\activate.bat

echo [1/4] Creating database if not exists...
python scripts\create-db.py
if %errorlevel% neq 0 (
    pause
    exit /b 1
)

echo.
echo [2/4] Creating and applying migrations...
cd /d %~dp0\backend
python manage.py makemigrations accounts bots flows messaging subscriptions webhooks dashboard
if %errorlevel% neq 0 (
    echo [ERROR] makemigrations failed.
    pause
    exit /b 1
)
python manage.py migrate
if %errorlevel% neq 0 (
    echo [ERROR] migrate failed.
    pause
    exit /b 1
)

echo.
echo [3/4] Creating superuser...
echo Enter admin credentials:
python manage.py createsuperuser

echo.
echo [4/4] Seeding subscription plans...
python manage.py shell < %~dp0scripts\seed-plans.py

cd /d %~dp0

echo.
echo ==========================================
echo   Database setup complete!
echo ==========================================
echo.
echo Now run: start.bat
echo.
pause
