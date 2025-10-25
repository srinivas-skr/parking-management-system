# Deployment Monitoring Script
# Monitors Render deployment progress in real-time

Write-Host "🚀 RENDER DEPLOYMENT MONITOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Monitoring: parking-management-system-hs2i.onrender.com" -ForegroundColor White
Write-Host "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host ""
Write-Host "Dashboard: https://dashboard.render.com/web/srv-cse14n5ds78s73dmtdl0" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://parking-management-system-hs2i.onrender.com"
$lastStatus = $null
$checkCount = 0
$startTime = Get-Date

while ($true) {
    $checkCount++
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)
    
    Write-Host "[Check #$checkCount - $elapsed min elapsed] $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
    
    # Check Backend Health
    try {
        $health = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method Get -TimeoutSec 10 -ErrorAction Stop
        $healthStatus = $health.status
        Write-Host "  ✅ Backend: $healthStatus" -ForegroundColor Green
        
        # Check Slots Count
        try {
            $slots = Invoke-RestMethod -Uri "$baseUrl/api/slots" -Method Get -TimeoutSec 10 -ErrorAction Stop
            $slotCount = $slots.Count
            
            if ($slotCount -eq 50) {
                Write-Host "  ✅ Slots: $slotCount (PERFECT! All Bangalore locations loaded)" -ForegroundColor Green
            } elseif ($slotCount -gt 0) {
                Write-Host "  ⚠️  Slots: $slotCount (Expected 50)" -ForegroundColor Yellow
            } else {
                Write-Host "  ❌ Slots: $slotCount (No data initialized yet)" -ForegroundColor Red
            }
        } catch {
            Write-Host "  ⏳ Slots API: Not responding yet" -ForegroundColor Yellow
        }
        
        # Check Frontend
        try {
            $frontend = Invoke-WebRequest -Uri "$baseUrl/" -Method Get -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
            if ($frontend.StatusCode -eq 200) {
                Write-Host "  ✅ Frontend: Loaded (Status: $($frontend.StatusCode))" -ForegroundColor Green
                
                # Check if it's the React app
                if ($frontend.Content -like "*<!doctype html>*" -and $frontend.Content -like "*Parking Management*") {
                    Write-Host "  ✅ React App: Detected" -ForegroundColor Green
                }
            }
        } catch {
            if ($_.Exception.Message -like "*500*") {
                Write-Host "  ❌ Frontend: 500 Error (Building or config issue)" -ForegroundColor Red
            } else {
                Write-Host "  ⏳ Frontend: Not ready yet" -ForegroundColor Yellow
            }
        }
        
        # Test Login Endpoint
        try {
            $loginBody = @{
                email = "admin@parking.com"
                password = "admin123"
            } | ConvertTo-Json
            
            $auth = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
                -Method Post `
                -Body $loginBody `
                -ContentType "application/json" `
                -TimeoutSec 10 `
                -ErrorAction Stop
            
            if ($auth.token) {
                Write-Host "  ✅ Login: Working (Token received)" -ForegroundColor Green
            }
        } catch {
            Write-Host "  ⏳ Login API: Not tested (backend must be fully ready first)" -ForegroundColor Gray
        }
        
        # SUCCESS CONDITION
        if ($slotCount -eq 50 -and $frontend.StatusCode -eq 200) {
            Write-Host ""
            Write-Host "🎉🎉🎉 DEPLOYMENT SUCCESSFUL! 🎉🎉🎉" -ForegroundColor Green
            Write-Host ""
            Write-Host "✅ Backend: UP" -ForegroundColor Green
            Write-Host "✅ Slots: 50 Bangalore locations" -ForegroundColor Green
            Write-Host "✅ Frontend: React app loaded" -ForegroundColor Green
            Write-Host "✅ All systems operational!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🌐 Visit: $baseUrl" -ForegroundColor Cyan
            Write-Host "📊 Dashboard: https://dashboard.render.com/web/srv-cse14n5ds78s73dmtdl0" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Total deployment time: $elapsed minutes" -ForegroundColor White
            Write-Host ""
            
            # Sample slot data
            Write-Host "Sample Bangalore Locations:" -ForegroundColor Yellow
            $slots | Select-Object -First 5 | ForEach-Object {
                Write-Host "  📍 $($_.name) - $($_.location) [$($_.latitude), $($_.longitude)]" -ForegroundColor White
            }
            
            break
        }
        
    } catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -like "*502*" -or $errorMsg -like "*503*" -or $errorMsg -like "*Application failed to respond*") {
            Write-Host "  ⏳ Backend: Building... (502/503 error - this is normal during deployment)" -ForegroundColor Yellow
        } elseif ($errorMsg -like "*Unable to connect*" -or $errorMsg -like "*The remote name could not be resolved*") {
            Write-Host "  ⏳ Backend: Starting up..." -ForegroundColor Yellow
        } else {
            Write-Host "  ❌ Error: $errorMsg" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    
    # Wait 30 seconds before next check
    Start-Sleep -Seconds 30
    
    # Safety timeout after 20 minutes
    if ($elapsed -gt 20) {
        Write-Host ""
        Write-Host "⚠️  Deployment taking longer than expected (>20 minutes)" -ForegroundColor Yellow
        Write-Host "Please check Render dashboard for build logs:" -ForegroundColor Yellow
        Write-Host "https://dashboard.render.com/web/srv-cse14n5ds78s73dmtdl0" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Common issues:" -ForegroundColor White
        Write-Host "  1. Build errors - check 'Events' tab" -ForegroundColor White
        Write-Host "  2. Memory issues on free tier" -ForegroundColor White
        Write-Host "  3. Dependency installation timeout" -ForegroundColor White
        break
    }
}

Write-Host ""
Write-Host "Monitoring stopped." -ForegroundColor Gray
