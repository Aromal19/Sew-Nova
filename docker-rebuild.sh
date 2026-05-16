#!/bin/bash

# SewNova Docker Rebuild Script
echo "🔄 Rebuilding SewNova services..."

# Stop all services
echo "🛑 Stopping services..."
docker-compose down

# Remove old images
echo "🗑️  Removing old images..."
docker-compose down --rmi all

# Rebuild and start
echo "🔨 Rebuilding and starting services..."
docker-compose up --build -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check status
echo "🏥 Checking service status..."
docker-compose ps

echo "✅ Rebuild complete!"
echo "🌐 Frontend: http://localhost"
echo "🔧 API Gateway: http://localhost/api"
