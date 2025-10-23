# ========================================
# AUTOMATED BUILD AND DEPLOY SCRIPT
# ========================================

Write-Host "Starting automated build and deploy process..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Frontend
Write-Host "STEP 1: Building React Frontend..." -ForegroundColor Yellow
Set-Location frontend
if (Test-Path "node_modules") {
    Write-Host "node_modules exists, skipping npm install" -ForegroundColor Green
} else {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
}

Write-Host "Building frontend for production..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Frontend built successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Copy frontend to backend static folder
Write-Host "STEP 2: Copying frontend to backend static resources..." -ForegroundColor Yellow
$sourceDir = "dist"
$targetDir = "..\src\main\resources\static"

if (Test-Path $targetDir) {
    Write-Host "Removing old static files..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force $targetDir
}

Write-Host "Copying new build..." -ForegroundColor Cyan
Copy-Item -Recurse $sourceDir $targetDir
Write-Host "Frontend copied to backend!" -ForegroundColor Green
Write-Host ""

# Step 3: Build backend
Set-Location ..
Write-Host "STEP 3: Building Spring Boot backend..." -ForegroundColor Yellow
.\mvnw clean package -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Backend built successfully!" -ForegroundColor Green
Write-Host ""

# Step 4: Commit and push
Write-Host "STEP 4: Committing and pushing to GitHub..." -ForegroundColor Yellow
git add .
git status

$commitMsg = "build: Add compiled frontend to backend static resources"
Write-Host "Commit message: $commitMsg" -ForegroundColor Cyan
git commit -m $commitMsg

if ($LASTEXITCODE -eq 0) {
    Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
    } else {
        Write-Host "Push failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "No changes to commit (already up to date)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Wait 5-10 minutes for Render to rebuild" -ForegroundColor White
Write-Host "2. Check: https://parking-management-system-hs2i.onrender.com" -ForegroundColor White
Write-Host "3. Test the interactive map features!" -ForegroundColor White
Write-Host ""
Write-Host "Render Dashboard: https://dashboard.render.com" -ForegroundColor Cyan
Write-Host ""
