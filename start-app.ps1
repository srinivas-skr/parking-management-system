# Parking Management System - Startup Script
# This script starts the application with proper PATH configuration

Write-Host "🚗 Starting Parking Management System..." -ForegroundColor Green
Write-Host ""

# Refresh PATH to include Maven
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Start the application
Write-Host "⚙️ Starting Spring Boot application on port 8080..." -ForegroundColor Yellow
Write-Host "⚠️  IMPORTANT: Do NOT press Ctrl+C until you're done testing!" -ForegroundColor Red
Write-Host ""
Write-Host "📝 Login Credentials:" -ForegroundColor Cyan
Write-Host "   Admin: username=admin, password=admin123"
Write-Host "   User: username=user, password=user123"
Write-Host "   Operator: username=operator, password=operator123"
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "   Swagger UI: http://localhost:8080/swagger-ui.html"
Write-Host "   H2 Console: http://localhost:8080/h2-console"
Write-Host "   API Docs: http://localhost:8080/api-docs"
Write-Host ""
Write-Host "Press Ctrl+C to stop the application when done testing." -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Run the JAR
java -jar target\parking-management-system-1.0.0.jar
