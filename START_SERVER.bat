@echo off
echo.
echo ========================================
echo   PARKING MANAGEMENT SYSTEM
echo   Starting Server...
echo ========================================
echo.

cd /d "%~dp0"
java -jar target\parking-management-system-1.0.0.jar

pause
