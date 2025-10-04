# ==============================================================================
# PARKING MANAGEMENT SYSTEM - AUTOMATED SETUP SCRIPT
# ==============================================================================
# This script will help you install Maven and Docker, then run the project
# ==============================================================================

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  PARKING MANAGEMENT SYSTEM SETUP" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check Java
Write-Host "[1/5] Checking Java..." -ForegroundColor Green
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "  ✓ Java is installed: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Java is NOT installed!" -ForegroundColor Red
    Write-Host "  Please install Java 17 or 21 from: https://www.oracle.com/java/technologies/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check Maven
Write-Host "[2/5] Checking Maven..." -ForegroundColor Green
try {
    $mavenVersion = mvn -version 2>&1 | Select-String "Apache Maven"
    Write-Host "  ✓ Maven is installed: $mavenVersion" -ForegroundColor Green
    $mavenInstalled = $true
} catch {
    Write-Host "  ✗ Maven is NOT installed!" -ForegroundColor Red
    $mavenInstalled = $false
    
    Write-Host ""
    Write-Host "  MAVEN INSTALLATION OPTIONS:" -ForegroundColor Yellow
    Write-Host "  ────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "  Option 1 (Recommended): Install using Scoop" -ForegroundColor Cyan
    Write-Host "    Run these commands in PowerShell:" -ForegroundColor White
    Write-Host "    iwr -useb get.scoop.sh | iex" -ForegroundColor Gray
    Write-Host "    scoop install maven" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Option 2: Manual Installation" -ForegroundColor Cyan
    Write-Host "    1. Download: https://maven.apache.org/download.cgi" -ForegroundColor White
    Write-Host "    2. Extract to: C:\Program Files\Apache\maven" -ForegroundColor White
    Write-Host "    3. Add to PATH: C:\Program Files\Apache\maven\apache-maven-3.9.9\bin" -ForegroundColor White
    Write-Host "    4. Restart PowerShell and re-run this script" -ForegroundColor White
    Write-Host ""
    
    $installScoop = Read-Host "  Would you like to install Scoop package manager now? (y/n)"
    
    if ($installScoop -eq "y" -or $installScoop -eq "Y") {
        Write-Host "  Installing Scoop..." -ForegroundColor Yellow
        try {
            iex "& {$(irm get.scoop.sh)} -RunAsAdmin"
            Write-Host "  ✓ Scoop installed successfully!" -ForegroundColor Green
            Write-Host "  Now installing Maven..." -ForegroundColor Yellow
            scoop install maven
            Write-Host "  ✓ Maven installed successfully!" -ForegroundColor Green
            $mavenInstalled = $true
        } catch {
            Write-Host "  ✗ Installation failed. Please install manually." -ForegroundColor Red
            Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  Please install Maven manually and re-run this script." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Check Docker
Write-Host "[3/5] Checking Docker..." -ForegroundColor Green
try {
    $dockerVersion = docker --version
    Write-Host "  ✓ Docker is installed: $dockerVersion" -ForegroundColor Green
    $dockerInstalled = $true
} catch {
    Write-Host "  ✗ Docker is NOT installed!" -ForegroundColor Red
    $dockerInstalled = $false
    
    Write-Host ""
    Write-Host "  DOCKER INSTALLATION:" -ForegroundColor Yellow
    Write-Host "  ────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "  1. Download Docker Desktop:" -ForegroundColor White
    Write-Host "     https://www.docker.com/products/docker-desktop/" -ForegroundColor Gray
    Write-Host "  2. Install and restart your computer" -ForegroundColor White
    Write-Host "  3. Start Docker Desktop" -ForegroundColor White
    Write-Host "  4. Re-run this script" -ForegroundColor White
    Write-Host ""
    
    $response = Read-Host "  Press Enter to open Docker download page, or type 'skip' to continue without Docker"
    
    if ($response -ne "skip") {
        Start-Process "https://www.docker.com/products/docker-desktop/"
        Write-Host "  Please install Docker and re-run this script." -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "  ⚠ Continuing without Docker. You'll need to install MySQL manually." -ForegroundColor Yellow
    }
}

Write-Host ""

# Start MySQL with Docker
if ($dockerInstalled) {
    Write-Host "[4/5] Starting MySQL Database..." -ForegroundColor Green
    
    $projectPath = "c:\Users\vikas\Documents\Java_fresher\parking-management-system"
    Set-Location $projectPath
    
    try {
        Write-Host "  Starting MySQL container..." -ForegroundColor Yellow
        docker-compose up -d mysql
        
        Write-Host "  Waiting for MySQL to initialize (30 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        Write-Host "  ✓ MySQL is running!" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed to start MySQL" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "[4/5] Skipping MySQL setup (Docker not installed)" -ForegroundColor Yellow
    Write-Host "  You'll need to install MySQL manually:" -ForegroundColor White
    Write-Host "  1. Install MySQL 8.0 from: https://dev.mysql.com/downloads/installer/" -ForegroundColor Gray
    Write-Host "  2. Create database: parking_management" -ForegroundColor Gray
    Write-Host "  3. Update application.properties with your credentials" -ForegroundColor Gray
}

Write-Host ""

# Build and Run
if ($mavenInstalled) {
    Write-Host "[5/5] Building Project..." -ForegroundColor Green
    
    $projectPath = "c:\Users\vikas\Documents\Java_fresher\parking-management-system"
    Set-Location $projectPath
    
    Write-Host "  Running: mvn clean install..." -ForegroundColor Yellow
    Write-Host "  This may take 5-10 minutes for first build..." -ForegroundColor Gray
    Write-Host ""
    
    try {
        mvn clean install -DskipTests
        
        Write-Host ""
        Write-Host "  ✓ Build successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "=============================================" -ForegroundColor Cyan
        Write-Host "  🎉 SETUP COMPLETE!" -ForegroundColor Yellow
        Write-Host "=============================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "To run the application:" -ForegroundColor White
        Write-Host "  mvn spring-boot:run" -ForegroundColor Green
        Write-Host ""
        Write-Host "Then open:" -ForegroundColor White
        Write-Host "  → Frontend: frontend.html" -ForegroundColor Cyan
        Write-Host "  → Swagger: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Default login:" -ForegroundColor White
        Write-Host "  Username: admin" -ForegroundColor Gray
        Write-Host "  Password: admin123" -ForegroundColor Gray
        Write-Host ""
        
        $runNow = Read-Host "Would you like to start the application now? (y/n)"
        
        if ($runNow -eq "y" -or $runNow -eq "Y") {
            Write-Host ""
            Write-Host "Starting application..." -ForegroundColor Green
            Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
            Write-Host ""
            mvn spring-boot:run
        }
        
    } catch {
        Write-Host ""
        Write-Host "  ✗ Build failed!" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "  Try running manually:" -ForegroundColor Yellow
        Write-Host "  cd $projectPath" -ForegroundColor Gray
        Write-Host "  mvn clean install" -ForegroundColor Gray
    }
} else {
    Write-Host "[5/5] Skipping build (Maven not installed)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "For help, see: COMPLETION_SUMMARY.md" -ForegroundColor White
Write-Host "=============================================" -ForegroundColor Cyan
