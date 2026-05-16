# SewNova Docker Rebuild Script (PowerShell)
Write-Host "🔄 Rebuilding SewNova services..." -ForegroundColor Blue

# Stop all services
Write-Host "🛑 Stopping services..." -ForegroundColor Yellow
docker-compose down

# Remove old images
Write-Host "🗑️  Removing old images..." -ForegroundColor Yellow
docker-compose down --rmi all

# Rebuild and start
Write-Host "🔨 Rebuilding and starting services..." -ForegroundColor Blue
docker-compose up --build -d

# Wait for services
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check status
Write-Host "🏥 Checking service status..." -ForegroundColor Blue
docker-compose ps

Write-Host "✅ Rebuild complete!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "🔧 API Gateway: http://localhost/api" -ForegroundColor Cyan
