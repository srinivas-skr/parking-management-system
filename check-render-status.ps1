#!/usr/bin/env pwsh
# Render Deployment Status Checker

$url = "https://parking-management-system-hs2i.onrender.com"

Write-Host "`n🚀 CHECKING RENDER DEPLOYMENT STATUS...`n" -ForegroundColor Cyan

# Check health endpoint
Write-Host "1️⃣  Testing /health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$url/health" -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Health check PASSED!" -ForegroundColor Green
        $json = $response.Content | ConvertFrom-Json
        Write-Host "   Status: $($json.status)" -ForegroundColor Gray
        Write-Host "   Message: $($json.message)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Health check FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Check root URL
Write-Host "`n2️⃣  Testing root URL (/)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$url/" -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend loading!" -ForegroundColor Green
        Write-Host "   Content-Length: $($response.RawContentLength) bytes" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Frontend FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Check API health
Write-Host "`n3️⃣  Testing /api/health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$url/api/health" -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ API health check PASSED!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ API health FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Check slots endpoint
Write-Host "`n4️⃣  Testing /api/slots endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$url/api/slots" -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Slots API working!" -ForegroundColor Green
        $json = $response.Content | ConvertFrom-Json
        Write-Host "   Total slots: $($json.Count)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Slots API FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 DEPLOYMENT CHECK COMPLETE!" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Live URL: $url" -ForegroundColor Blue
Write-Host "📝 Render Dashboard: https://dashboard.render.com/web/srv-d3h2g6ogjchc73a5gf60/events" -ForegroundColor Blue
Write-Host ""
