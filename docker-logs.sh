#!/bin/bash

# SewNova Docker Logs Script
echo "📋 SewNova Service Logs"
echo "======================="

# Show logs for all services
docker-compose logs -f
