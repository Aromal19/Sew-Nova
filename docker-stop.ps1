# SewNova Docker Stop Script (PowerShell)
Write-Host "🛑 Stopping SewNova services..." -ForegroundColor Yellow

# Stop all services
docker-compose down

Write-Host "✅ All services stopped." -ForegroundColor Green
Write-Host "🗑️  To remove all data: docker-compose down -v" -ForegroundColor White
Write-Host "🧹 To clean up images: docker system prune -a" -ForegroundColor White
