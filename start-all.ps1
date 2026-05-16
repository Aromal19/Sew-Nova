# SewNova Local Development Launcher
# Starts the direct-connection architecture

Write-Host "Initializing SewNova Local Environment..." -ForegroundColor Cyan

# 1. Kill any dangling node or python processes to prevent EADDRINUSE errors
Write-Host "Cleaning up orphaned background processes..." -ForegroundColor Yellow
$ErrorActionPreference = "SilentlyContinue"
Stop-Process -Name "node" -Force
Stop-Process -Name "python" -Force
$ErrorActionPreference = "Continue"

Start-Sleep -Seconds 2

# 2. Launch Backend Services
Write-Host "Spawning Backend Services (Ports 3001-3008, 8001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node start-all-services.js"

Start-Sleep -Seconds 5

# 3. Launch Frontend Server
Write-Host "Spawning Frontend Vite Server (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "All systems launched. Check the separated terminal windows for logs!" -ForegroundColor White
