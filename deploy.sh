#!/bin/bash

# PromptHub Deployment Script for EC2
# This script pulls the latest images and starts the services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOCKERHUB_USERNAME=${DOCKERHUB_USERNAME:-"your-dockerhub-username"}
COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${GREEN}🚀 Starting PromptHub Deployment${NC}"

# Check if DOCKERHUB_USERNAME is set
if [ "$DOCKERHUB_USERNAME" = "your-dockerhub-username" ]; then
    echo -e "${RED}❌ Error: DOCKERHUB_USERNAME environment variable not set${NC}"
    echo "Please set it with: export DOCKERHUB_USERNAME=your-actual-username"
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Error: $COMPOSE_FILE not found${NC}"
    echo "Please run this script from the Prompthub directory"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p nginx/{conf.d,ssl,logs}
mkdir -p backend frontend

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f $COMPOSE_FILE down || true

# Login to Docker Hub (if token is provided)
if [ ! -z "$DOCKERHUB_TOKEN" ]; then
    echo -e "${YELLOW}🔐 Logging into Docker Hub...${NC}"
    echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
fi

# Pull latest images
echo -e "${YELLOW}📥 Pulling latest images...${NC}"
docker pull $DOCKERHUB_USERNAME/prompthub-backend:latest
docker pull $DOCKERHUB_USERNAME/prompthub-frontend:latest

# Create .env files if they don't exist
echo -e "${YELLOW}📝 Setting up environment files...${NC}"
touch backend/.env.production
touch frontend/.env.production

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
DOCKERHUB_USERNAME=$DOCKERHUB_USERNAME docker-compose -f $COMPOSE_FILE up -d


# Clean up unused images, containers, volumes, networks
echo -e "${YELLOW}🧹 Cleaning up unused Docker resources...${NC}"
docker system prune -af --volumes

# Truncate Docker logs to avoid filling disk
echo -e "${YELLOW}🗑️ Clearing old Docker logs...${NC}"
find /var/lib/docker/containers/ -name "*-json.log" -exec truncate -s 0 {} \; || true


# Show running containers
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${YELLOW}📊 Running containers:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "${GREEN}🎉 PromptHub is now running!${NC}"
echo -e "${YELLOW}Frontend: http://your-ec2-ip:3000${NC}"
echo -e "${YELLOW}Backend: http://your-ec2-ip:4000${NC}"
echo -e "${YELLOW}GraphQL: http://your-ec2-ip:4000/graphql${NC}"
