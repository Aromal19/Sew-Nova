# SewNova Docker Logs Script (PowerShell)
Write-Host "📋 SewNova Service Logs" -ForegroundColor Blue
Write-Host "=======================" -ForegroundColor Blue

# Show logs for all services
docker-compose logs -f
