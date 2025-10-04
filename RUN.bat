@echo off
echo =============================================
echo   PARKING MANAGEMENT SYSTEM
echo =============================================
echo.
echo Starting application on http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.
echo =============================================
echo.

mvn spring-boot:run

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start application!
    echo.
    echo Make sure you have:
    echo   1. Built the project first (run BUILD.bat)
    echo   2. MySQL is running (docker-compose up -d mysql)
    echo.
    pause
)
