#!/bin/bash
# Kaldor IIoT - Production Deployment Script

set -e

echo "╔═══════════════════════════════════════════╗"
echo "║   Kaldor IIoT - Production Deployment     ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create one from .env.example"
    exit 1
fi

# Load environment variables
source .env

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Build and start services
echo "🐳 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T timescaledb psql -U kaldor -d kaldor_iiot -f /docker-entrypoint-initdb.d/001_initial_schema.sql

# Health check
echo "🏥 Performing health checks..."
sleep 5

API_HEALTH=$(curl -s http://localhost:3000/health | grep -o '"status":"healthy"' || echo "failed")
if [ "$API_HEALTH" == "failed" ]; then
    echo "❌ API health check failed"
    docker-compose logs api
    exit 1
fi

ANALYTICS_HEALTH=$(curl -s http://localhost:5000/health | grep -o '"status":"healthy"' || echo "failed")
if [ "$ANALYTICS_HEALTH" == "failed" ]; then
    echo "❌ Analytics health check failed"
    docker-compose logs analytics
    exit 1
fi

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "Services:"
echo "  - Frontend: http://localhost"
echo "  - API: http://localhost:3000"
echo "  - API Docs: http://localhost:3000/api-docs"
echo "  - Analytics: http://localhost:5000"
echo "  - Grafana: http://localhost:3001"
echo "  - Prometheus: http://localhost:9090"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"
echo ""
