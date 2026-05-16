# SewNova Services Startup Script for PowerShell
# Run this script to start all services

Write-Host "Starting SewNova Services..." -ForegroundColor Green

# Start Customer Service
Write-Host "`nStarting Customer Service on port 3003..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\SewNova\backend\customer-service'; node server.js"

# Wait a moment for customer service to start
Start-Sleep -Seconds 3

# Start Payment Service  
Write-Host "Starting Payment Service on port 3010..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\SewNova\backend\payment-service'; node server.js"

# Wait a moment for payment service to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\SewNova\frontend'; npm run dev"

Write-Host "`nAll services are starting..." -ForegroundColor Green
Write-Host "Customer Service: http://localhost:3003" -ForegroundColor Cyan
Write-Host "Payment Service: http://localhost:3010" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan

Write-Host "`nPress any key to continue..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
