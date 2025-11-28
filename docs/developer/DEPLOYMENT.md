# Kaldor IIoT - Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [IONOS Deploy Now](#ionos-deploy-now)
5. [Docker Deployment](#docker-deployment)
6. [Kubernetes Deployment](#kubernetes-deployment)
7. [Security Hardening](#security-hardening)
8. [Monitoring Setup](#monitoring-setup)
9. [Backup and Recovery](#backup-and-recovery)

## Prerequisites

### Required Software

- Docker 20.10+
- Docker Compose 2.0+
- Git 2.30+
- Node.js 18+ (for development)
- Python 3.9+ (for analytics)

### Required Accounts

- IONOS account (for Deploy Now)
- SMTP server (for email alerts)
- Twilio account (optional, for SMS)
- Domain name with SSL certificate

### Hardware Requirements

**Minimum (Development)**
- 4 CPU cores
- 8 GB RAM
- 50 GB storage
- 100 Mbps network

**Recommended (Production)**
- 8 CPU cores
- 16 GB RAM
- 200 GB SSD storage
- 1 Gbps network
- UPS backup power

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/your-org/kaldor-iiot.git
cd kaldor-iiot
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
nano .env
```

### 3. Start Development Environment

```bash
docker-compose up -d
```

### 4. Initialize Database

```bash
docker-compose exec timescaledb psql -U kaldor -d kaldor_iiot -f /docker-entrypoint-initdb.d/001_initial_schema.sql
```

### 5. Access Services

- Frontend: http://localhost
- API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs
- Grafana: http://localhost:3001

## Production Deployment

### Automated Deployment

Use the deployment script:

```bash
./scripts/deployment/deploy.sh
```

### Manual Deployment

#### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Configure Firewall

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow MQTT (if external devices connect)
sudo ufw allow 1883/tcp
sudo ufw allow 8883/tcp

# Enable firewall
sudo ufw enable
```

#### 3. Setup SSL Certificates

```bash
# Using Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

#### 4. Configure Environment

```bash
# Production environment variables
nano .env
```

Required production settings:
```env
NODE_ENV=production
DB_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-password>
JWT_SECRET=<min-32-characters>
```

#### 5. Deploy Application

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## IONOS Deploy Now

### Setup

1. Fork the repository on GitHub
2. Go to IONOS Deploy Now
3. Connect your GitHub account
4. Select the Kaldor-IIoT repository
5. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`

### GitHub Secrets

Add these secrets to your repository:

```
IONOS_API_KEY=<your-api-key>
IONOS_PROJECT_ID=<your-project-id>
DB_PASSWORD=<database-password>
JWT_SECRET=<jwt-secret>
```

### Deploy

Push to main branch:

```bash
git push origin main
```

Deployment happens automatically via GitHub Actions.

## Docker Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  timescaledb:
    image: timescale/timescaledb:latest-pg15
    restart: always
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - /var/lib/kaldor/db:/var/lib/postgresql/data
    networks:
      - kaldor-network

  # ... other services
```

### Best Practices

1. **Use specific image tags** (not `latest`)
2. **Set restart policies** (`restart: unless-stopped`)
3. **Use Docker volumes** for persistent data
4. **Enable health checks** for all services
5. **Resource limits** to prevent resource exhaustion

Example resource limits:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Helm 3+

### Deploy with Helm

```bash
# Add Kaldor IIoT Helm repo
helm repo add kaldor https://charts.kaldor-iiot.example.com

# Install
helm install kaldor-iiot kaldor/kaldor-iiot \
  --namespace kaldor-iiot \
  --create-namespace \
  --set database.password=<db-password> \
  --set jwt.secret=<jwt-secret>
```

### Manual Deployment

```bash
# Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmaps.yaml
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yaml
```

## Security Hardening

### 1. Change Default Credentials

```sql
-- Change admin password
UPDATE users
SET password_hash = crypt('NewSecurePassword', gen_salt('bf'))
WHERE username = 'admin';
```

### 2. Configure SSL/TLS

Update `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... rest of config
}
```

### 3. Enable MQTT Authentication

Update `mosquitto.conf`:

```conf
allow_anonymous false
password_file /mosquitto/config/password.txt
```

Create password file:

```bash
mosquitto_passwd -c password.txt device_user
```

### 4. Database Security

```sql
-- Create read-only user for analytics
CREATE USER analytics_ro WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_ro;

-- Revoke unnecessary permissions
REVOKE ALL ON SCHEMA public FROM PUBLIC;
```

### 5. Rate Limiting

Already configured in `server.js`:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

## Monitoring Setup

### Prometheus Configuration

File: `infrastructure/monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['api:3000']

  - job_name: 'timescaledb'
    static_configs:
      - targets: ['timescaledb:9187']
```

### Grafana Dashboards

Import dashboards:

1. Login to Grafana (http://localhost:3001)
2. Go to Dashboards → Import
3. Import from `infrastructure/monitoring/grafana/dashboards/`

### Alerting Rules

Configure in Prometheus:

```yaml
groups:
  - name: kaldor_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 10m
        annotations:
          summary: "High error rate detected"
```

## Backup and Recovery

### Database Backup

#### Automated Daily Backup

```bash
# Add to crontab
0 2 * * * /usr/local/bin/backup-kaldor-db.sh
```

Backup script:

```bash
#!/bin/bash
BACKUP_DIR=/var/backups/kaldor
DATE=$(date +%Y%m%d_%H%M%S)

docker-compose exec -T timescaledb pg_dump -U kaldor kaldor_iiot | \
  gzip > $BACKUP_DIR/kaldor_iiot_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

#### Restore from Backup

```bash
gunzip < backup.sql.gz | \
  docker-compose exec -T timescaledb psql -U kaldor -d kaldor_iiot
```

### Configuration Backup

```bash
# Backup all configurations
tar -czf config-backup.tar.gz \
  .env \
  infrastructure/ \
  database/schemas/
```

### Disaster Recovery

1. **Stop all services**:
   ```bash
   docker-compose down
   ```

2. **Restore database**:
   ```bash
   gunzip < latest-backup.sql.gz | \
     docker-compose exec -T timescaledb psql -U kaldor -d kaldor_iiot
   ```

3. **Restore configurations**:
   ```bash
   tar -xzf config-backup.tar.gz
   ```

4. **Restart services**:
   ```bash
   docker-compose up -d
   ```

## Health Checks

### Automated Health Monitoring

```bash
#!/bin/bash
# health-check.sh

# Check API
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
  echo "API is down!" | mail -s "Kaldor IIoT Alert" admin@example.com
fi

# Check database
if ! docker-compose exec timescaledb pg_isready -U kaldor > /dev/null 2>&1; then
  echo "Database is down!" | mail -s "Kaldor IIoT Alert" admin@example.com
fi
```

Add to crontab:

```bash
*/5 * * * * /usr/local/bin/health-check.sh
```

## Performance Optimization

### Database Optimization

```sql
-- Create indexes
CREATE INDEX CONCURRENTLY idx_measurements_loom_time
  ON bbw_measurements (loom_id, time DESC);

-- Analyze tables
ANALYZE bbw_measurements;

-- Vacuum
VACUUM ANALYZE;
```

### Redis Configuration

```redis
# memory optimization
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Nginx Caching

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$request_uri";
}
```

## Troubleshooting Deployments

### Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Check resource usage
docker stats

# Inspect container
docker inspect <container-id>
```

### Database Connection Issues

```bash
# Test connection
docker-compose exec api node -e "const { Pool } = require('pg'); const pool = new Pool({ host: 'timescaledb' }); pool.query('SELECT NOW()').then(console.log).catch(console.error);"
```

### SSL Certificate Issues

```bash
# Verify certificate
openssl x509 -in cert.pem -text -noout

# Test SSL connection
openssl s_client -connect your-domain.com:443
```

## Rollback Procedure

### Docker Compose Rollback

```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout <previous-tag>

# Rebuild and start
docker-compose build
docker-compose up -d
```

### Database Rollback

```bash
# Restore previous backup
gunzip < previous-backup.sql.gz | \
  docker-compose exec -T timescaledb psql -U kaldor -d kaldor_iiot
```

## Support

For deployment issues:
- Email: devops@kaldor-iiot.example.com
- Documentation: https://docs.kaldor-iiot.example.com
- GitHub Issues: Technical problems

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
