@echo off
cd /d %~dp0
echo ==========================================
echo   BotPlatform - Install Dependencies
echo ==========================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Install Python 3.13+ from https://python.org
    pause
    exit /b 1
)

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install Node.js 22+ from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Creating Python virtual environment...
if not exist "backend\venv" (
    python -m venv backend\venv
)

echo [2/4] Installing Python dependencies...
call backend\venv\Scripts\activate.bat
pip install -r backend\requirements\dev.txt

echo [3/4] Installing Node.js dependencies...
cd /d %~dp0\frontend
call npm install
cd /d %~dp0

echo [4/4] Copying .env file...
if not exist ".env" (
    copy .env.example .env
    echo [NOTE] Created .env from .env.example. Edit it with your settings!
) else (
    echo .env already exists, skipping.
)

echo.
echo ==========================================
echo   Installation complete!
echo ==========================================
echo.
echo Before starting, make sure:
echo   1. PostgreSQL is running (port 5432)
echo   2. Redis is running (port 6379)
echo   3. Settings in .env are correct
echo.
echo Next run: setup-db.bat
echo.
pause
