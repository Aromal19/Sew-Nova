#!/bin/bash

# SewNova Docker Startup Script
echo "🚀 Starting SewNova with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.docker.example .env
    echo "📝 Please update .env file with your actual values before running again."
    exit 1
fi

# Build and start all services
echo "🔨 Building and starting all services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

echo "✅ SewNova is now running!"
echo "🌐 Frontend: http://localhost"
echo "🔧 API Gateway: http://localhost/api"
echo "📊 MongoDB: localhost:27017"
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
