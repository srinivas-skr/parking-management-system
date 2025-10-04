@echo off
echo =============================================
echo   PARKING MANAGEMENT SYSTEM - QUICK START
echo =============================================
echo.

echo Checking if Maven is installed...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Maven is not installed!
    echo.
    echo Please install Maven first:
    echo   Option 1: Run QUICK_SETUP.ps1 in PowerShell
    echo   Option 2: Visit https://maven.apache.org/download.cgi
    echo.
    pause
    exit /b 1
)
echo [OK] Maven is installed

echo.
echo Checking if Docker is installed...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Docker is not installed!
    echo You'll need to install MySQL manually.
    echo.
    set DOCKER_INSTALLED=0
) else (
    echo [OK] Docker is installed
    set DOCKER_INSTALLED=1
)

echo.
echo =============================================
echo   Starting Setup...
echo =============================================
echo.

if %DOCKER_INSTALLED% == 1 (
    echo Starting MySQL container...
    docker-compose up -d mysql
    echo Waiting for MySQL to initialize (30 seconds)...
    timeout /t 30 /nobreak >nul
    echo [OK] MySQL is running
) else (
    echo [SKIP] MySQL setup (Docker not installed)
    echo Make sure you have MySQL installed manually!
)

echo.
echo Building project (this may take 5-10 minutes)...
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo =============================================
echo   BUILD SUCCESSFUL!
echo =============================================
echo.
echo To start the application, run:
echo   mvn spring-boot:run
echo.
echo Or simply run: RUN.bat
echo.
echo Then open:
echo   - Frontend: frontend.html
echo   - Swagger: http://localhost:8080/swagger-ui.html
echo.
echo Default credentials:
echo   Username: admin
echo   Password: admin123
echo.
pause
