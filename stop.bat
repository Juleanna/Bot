@echo off
echo ==========================================
echo   BotPlatform - Stop All Services
echo ==========================================
echo.

echo Stopping Django...
taskkill /FI "WINDOWTITLE eq Django Backend*" /F >nul 2>&1

echo Stopping Celery Worker...
taskkill /FI "WINDOWTITLE eq Celery Worker*" /F >nul 2>&1

echo Stopping Celery Beat...
taskkill /FI "WINDOWTITLE eq Celery Beat*" /F >nul 2>&1

echo Stopping React Frontend...
taskkill /FI "WINDOWTITLE eq React Frontend*" /F >nul 2>&1

echo.
echo All services stopped!
echo.
pause
