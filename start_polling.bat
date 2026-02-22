@echo off
cd /d %~dp0backend
venv\Scripts\python manage.py run_polling
pause
