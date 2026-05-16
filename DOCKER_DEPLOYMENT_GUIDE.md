# SewNova Docker Deployment Guide

This guide will help you deploy your SewNova application using Docker for both local development and production deployment.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- Git repository with your SewNova code
- Environment variables configured

## Quick Start

### 1. Setup Environment Variables

```bash
# Copy the environment template
cp env.docker.example .env

# Edit the .env file with your actual values
# Update JWT secrets, API keys, database URLs, etc.
```

### 2. Start the Application

**Windows (PowerShell):**
```powershell
.\docker-start.ps1
```

**Linux/Mac:**
```bash
./docker-start.sh
```

### 3. Access the Application

- **Frontend**: http://localhost
- **API Gateway**: http://localhost/api
- **MongoDB**: localhost:27017

## Docker Architecture

Your SewNova application is containerized with the following services:

### Backend Services
- **Auth Service** (Port 3001) - Authentication and user management
- **Customer Service** (Port 3002) - Customer operations
- **Admin Service** (Port 3003) - Admin dashboard and management
- **Design Service** (Port 3004) - Design management and Cloudinary integration
- **Tailor Service** (Port 3005) - Tailor operations
- **Vendor Service** (Port 3006) - Vendor management
- **Payment Service** (Port 3007) - Razorpay payment integration
- **Measurement Service** (Port 8001) - AI measurement service (Python)

### Infrastructure Services
- **MongoDB** (Port 27017) - Database
- **Nginx** (Port 80) - Reverse proxy and load balancer
- **Frontend** (Port 3000) - React application

## Docker Commands

### Basic Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up --build -d
```

### Service Management

```bash
# Start specific service
docker-compose up -d auth-service

# Stop specific service
docker-compose stop auth-service

# View logs for specific service
docker-compose logs -f auth-service

# Restart specific service
docker-compose restart auth-service
```

### Database Operations

```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh

# Backup database
docker-compose exec mongodb mongodump --out /backup

# Restore database
docker-compose exec mongodb mongorestore /backup
```

## Environment Variables

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# JWT Secrets
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Razorpay Payment
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Service
EMAIL_SERVICE_API_KEY=your-email-service-api-key
EMAIL_FROM=noreply@sewnova.com

# Frontend Environment Variables
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## Production Deployment

### Option 1: Docker Swarm (Recommended for Production)

```bash
# Initialize Docker Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml sewnova

# Check services
docker service ls

# Scale services
docker service scale sewnova_auth-service=3
```

### Option 2: Docker Compose with Production Override

```bash
# Create production override file
cp docker-compose.yml docker-compose.prod.yml

# Edit docker-compose.prod.yml for production settings
# - Remove development volumes
# - Add production environment variables
# - Configure resource limits
# - Set up logging

# Deploy with production override
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Option 3: Cloud Deployment

#### AWS ECS
1. Push images to Amazon ECR
2. Create ECS cluster
3. Create task definitions
4. Deploy services

#### Google Cloud Run
1. Build and push images to Google Container Registry
2. Deploy services to Cloud Run
3. Configure load balancing

#### Azure Container Instances
1. Push images to Azure Container Registry
2. Deploy container groups
3. Configure networking

## Monitoring and Logging

### Health Checks

All services include health checks. Monitor them with:

```bash
# Check service health
docker-compose ps

# View health check logs
docker-compose logs nginx
```

### Logging

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f auth-service

# View logs with timestamps
docker-compose logs -f -t
```

### Monitoring

```bash
# Monitor resource usage
docker stats

# Check container health
docker inspect sewnova-auth

# View service events
docker service events sewnova_auth-service
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   netstat -tulpn | grep :3001
   
   # Stop conflicting services
   sudo systemctl stop apache2  # Example
   ```

2. **Memory Issues**
   ```bash
   # Check Docker memory usage
   docker system df
   
   # Clean up unused resources
   docker system prune -a
   ```

3. **Database Connection Issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Test database connection
   docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   ```

4. **Service Not Starting**
   ```bash
   # Check service logs
   docker-compose logs auth-service
   
   # Check service status
   docker-compose ps
   
   # Restart service
   docker-compose restart auth-service
   ```

### Debugging Commands

```bash
# Access service container
docker-compose exec auth-service sh

# Check service environment
docker-compose exec auth-service env

# View service configuration
docker-compose config

# Check network connectivity
docker-compose exec auth-service ping customer-service
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong, unique secrets
- Rotate secrets regularly

### 2. Network Security
- Services communicate through Docker network
- External access only through Nginx proxy
- Configure firewall rules

### 3. Container Security
- Run containers as non-root users
- Use minimal base images (Alpine)
- Regular security updates

### 4. Database Security
- Use strong database passwords
- Enable authentication
- Configure network access

## Scaling

### Horizontal Scaling

```bash
# Scale specific services
docker-compose up -d --scale auth-service=3

# Scale with Docker Swarm
docker service scale sewnova_auth-service=5
```

### Vertical Scaling

```yaml
# In docker-compose.yml
services:
  auth-service:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker-compose exec mongodb mongodump --out /backup/$(date +%Y%m%d)

# Copy backup from container
docker cp sewnova-mongodb:/backup ./backup
```

### Database Restore

```bash
# Copy backup to container
docker cp ./backup sewnova-mongodb:/restore

# Restore database
docker-compose exec mongodb mongorestore /restore
```

## Performance Optimization

### 1. Resource Limits
```yaml
services:
  auth-service:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### 2. Caching
```yaml
services:
  nginx:
    volumes:
      - ./nginx-cache:/var/cache/nginx
```

### 3. Database Optimization
```yaml
services:
  mongodb:
    command: mongod --wiredTigerCacheSizeGB 1
```

## Maintenance

### Regular Tasks

1. **Update Images**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

2. **Clean Up**
   ```bash
   docker system prune -a
   docker volume prune
   ```

3. **Monitor Logs**
   ```bash
   docker-compose logs --tail=100 -f
   ```

4. **Backup Database**
   ```bash
   ./backup-database.sh
   ```

## Support

For issues and support:
1. Check service logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Test service connectivity: `docker-compose exec auth-service ping customer-service`
4. Check resource usage: `docker stats`
