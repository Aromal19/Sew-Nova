#!/bin/bash

# SewNova Docker Stop Script
echo "🛑 Stopping SewNova services..."

# Stop all services
docker-compose down

echo "✅ All services stopped."
echo "🗑️  To remove all data: docker-compose down -v"
echo "🧹 To clean up images: docker system prune -a"
