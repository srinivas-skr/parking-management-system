# Simple Render Health Check
$url = "https://parking-management-system-hs2i.onrender.com"

Write-Host ""
Write-Host "Checking Render Deployment..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health endpoint
Write-Host "1. Testing /health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$url/health" -TimeoutSec 30
    Write-Host "   SUCCESS - Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Root URL
Write-Host ""
Write-Host "2. Testing root URL..." -ForegroundColor Yellow
try {
    $root = Invoke-WebRequest -Uri "$url/" -TimeoutSec 30
    Write-Host "   SUCCESS - Frontend loaded ($($root.Content.Length) bytes)" -ForegroundColor Green
} catch {
    Write-Host "   FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: API endpoint
Write-Host ""
Write-Host "3. Testing /api/slots..." -ForegroundColor Yellow
try {
    $slots = Invoke-RestMethod -Uri "$url/api/slots" -TimeoutSec 30
    Write-Host "   SUCCESS - Found $($slots.Count) slots" -ForegroundColor Green
} catch {
    Write-Host "   FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Live URL: $url" -ForegroundColor Blue
Write-Host ""
