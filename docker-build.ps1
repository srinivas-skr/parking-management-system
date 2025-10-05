# PowerShell script for Windows - Build Docker Image

Write-Host "🚀 Building Parking Management System Docker Image..." -ForegroundColor Green
Write-Host ""

# Build the Docker image
docker build -t parking-system:1.0.0 -t parking-system:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Docker image built successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Image Details:" -ForegroundColor Cyan
    docker images | Select-String "parking-system"
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "To run the application:" -ForegroundColor Yellow
    Write-Host "  docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor White
    Write-Host ""
    Write-Host "To view logs:" -ForegroundColor Yellow
    Write-Host "  docker-compose -f docker-compose.prod.yml logs -f parking-app" -ForegroundColor White
    Write-Host ""
    Write-Host "To stop:" -ForegroundColor Yellow
    Write-Host "  docker-compose -f docker-compose.prod.yml down" -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Red
    exit 1
}
