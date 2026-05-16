# SewNova Docker Startup Script (PowerShell)
Write-Host "🚀 Starting SewNova with Docker..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item "env.docker.example" ".env"
    Write-Host "📝 Please update .env file with your actual values before running again." -ForegroundColor Yellow
    exit 1
}

# Build and start all services
Write-Host "🔨 Building and starting all services..." -ForegroundColor Blue
docker-compose up --build -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "🏥 Checking service health..." -ForegroundColor Blue
docker-compose ps

Write-Host "✅ SewNova is now running!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "🔧 API Gateway: http://localhost/api" -ForegroundColor Cyan
Write-Host "📊 MongoDB: localhost:27017" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 To view logs: docker-compose logs -f" -ForegroundColor White
Write-Host "🛑 To stop: docker-compose down" -ForegroundColor White
