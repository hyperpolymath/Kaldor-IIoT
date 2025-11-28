# Kaldor IIoT System Architecture

## Overview

The Kaldor IIoT system provides real-time monitoring and analytics for loom Back Beam Width (BBW) measurements, enabling predictive maintenance and quality control.

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        OPERATOR INTERFACE                        │
│                                                                  │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Web Dashboard │  │ Mobile App   │  │  Alert System    │   │
│  │  (React)       │  │ (Progressive)│  │  (Email/SMS)     │   │
│  └────────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│                                                                  │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  REST API      │  │ WebSocket    │  │  Analytics       │   │
│  │  (Express.js)  │  │ Server       │  │  Engine (Python) │   │
│  └────────────────┘  └──────────────┘  └──────────────────┘   │
│                                                                  │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Auth Service  │  │ Alert Engine │  │  Data Processor  │   │
│  │  (JWT)         │  │              │  │                  │   │
│  └────────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Internal Network
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MESSAGE BROKER                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   MQTT Broker (Mosquitto)                   │ │
│  │                                                             │ │
│  │  Topics:                                                    │ │
│  │    - kaldor/loom/{loom_id}/bbw/raw                         │ │
│  │    - kaldor/loom/{loom_id}/bbw/processed                   │ │
│  │    - kaldor/loom/{loom_id}/status                          │ │
│  │    - kaldor/loom/{loom_id}/alerts                          │ │
│  │    - kaldor/loom/{loom_id}/config                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MQTT
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│                                                                  │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  TimescaleDB   │  │  Redis       │  │  PostgreSQL      │   │
│  │  (Time Series) │  │  (Cache)     │  │  (Config/Users)  │   │
│  └────────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MQTT
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         EDGE DEVICES                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              BBW Sensor Board (ESP32)                      │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐   │ │
│  │  │ Ultrasonic  │  │ Temperature  │  │  Vibration     │   │ │
│  │  │ Sensor      │  │ Sensor       │  │  Sensor        │   │ │
│  │  └─────────────┘  └──────────────┘  └────────────────┘   │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐   │ │
│  │  │ WiFi/       │  │ Local        │  │  Watchdog      │   │ │
│  │  │ Ethernet    │  │ Processing   │  │  Timer         │   │ │
│  │  └─────────────┘  └──────────────┘  └────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

```

## Technology Stack

### Edge Layer (Firmware)
- **Platform**: ESP32 (dual-core, WiFi/Bluetooth)
- **Framework**: Arduino/ESP-IDF
- **Protocol**: MQTT over TLS
- **Sampling Rate**: 100Hz for sensors, 1Hz for telemetry
- **Storage**: Local buffering on flash (failover)

### Backend Services
- **API Server**: Node.js (Express.js)
- **Real-time**: WebSocket (Socket.io)
- **Analytics**: Python (NumPy, SciPy, Pandas)
- **Message Broker**: Eclipse Mosquitto (MQTT)
- **Task Queue**: Bull (Redis-based)

### Data Storage
- **Time-Series**: TimescaleDB (PostgreSQL extension)
- **Relational**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Retention**:
  - Raw data: 7 days
  - Aggregated 1-min: 90 days
  - Aggregated 1-hour: 2 years

### Frontend
- **Framework**: React 18 + TypeScript
- **State Management**: Redux Toolkit
- **Real-time**: Socket.io-client
- **Visualization**: Recharts, D3.js
- **UI Components**: Material-UI

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Let's Encrypt (Certbot)
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

## Data Flow

### 1. Data Acquisition
```
Sensors → ESP32 ADC → Signal Processing → MQTT Publish
```

### 2. Data Ingestion
```
MQTT → Message Broker → Data Processor → TimescaleDB
                      → Alert Engine → Notification Service
                      → WebSocket → Dashboard (Real-time)
```

### 3. Data Analytics
```
TimescaleDB → Analytics Engine → Statistical Analysis
                               → Anomaly Detection
                               → Predictive Maintenance
```

### 4. User Access
```
User → Web Dashboard → REST API → Database
                     → WebSocket → Live Updates
```

## Security Architecture

### Network Security
- TLS 1.3 for all communications
- VPN access for remote monitoring
- Network segmentation (IoT VLAN)
- Firewall rules (allow-list only)

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- API key authentication for devices
- Session management with Redis

### Data Security
- Encryption at rest (AES-256)
- Encryption in transit (TLS)
- Secure credential storage (HashiCorp Vault)
- Audit logging for all access

## Scalability

### Horizontal Scaling
- Stateless API servers (load balanced)
- MQTT broker clustering
- Database read replicas
- Redis cluster for caching

### Performance Targets
- API Response: < 100ms (p95)
- Real-time Latency: < 500ms (sensor to dashboard)
- Concurrent Users: 100+
- Devices Supported: 1000+ looms
- Data Points: 100M+ per day

## High Availability

### Redundancy
- Multi-zone deployment
- Database replication (primary + 2 replicas)
- MQTT broker cluster (3+ nodes)
- Load balancer with health checks

### Disaster Recovery
- Automated backups (hourly incremental, daily full)
- Point-in-time recovery (PITR)
- Backup retention: 30 days
- RTO: 1 hour, RPO: 15 minutes

## Monitoring & Observability

### Metrics
- System metrics (CPU, memory, disk, network)
- Application metrics (request rate, latency, errors)
- Business metrics (active devices, data quality, alerts)
- Custom dashboards in Grafana

### Alerting
- Infrastructure alerts (Prometheus Alertmanager)
- Application alerts (custom rules)
- Business alerts (SLA violations)
- Multi-channel notifications (email, SMS, Slack)

### Logging
- Structured logging (JSON format)
- Centralized log aggregation (ELK)
- Log retention: 90 days
- Full-text search capability

## Development & Deployment

### CI/CD Pipeline
```
Git Push → GitHub Actions → Build → Test → Deploy
                          ↓
                     Docker Registry
                          ↓
                     Staging Environment → Manual Approval → Production
```

### Environments
- **Development**: Local Docker Compose
- **Staging**: Cloud-based (IONOS)
- **Production**: Cloud-based (IONOS) with HA

### Deployment Strategy
- Blue-green deployment
- Rolling updates for zero downtime
- Automated rollback on failure
- Feature flags for gradual rollout

## Edge Computing Capabilities

### On-Device Processing
- Real-time signal filtering
- Edge analytics (moving averages, thresholds)
- Local alerting (critical conditions)
- Data compression before transmission

### Offline Operation
- Local buffering (up to 24 hours)
- Automatic sync when connection restored
- Local web interface for diagnostics
- Fallback to default operating parameters

## Data Model

### Measurement Schema
```sql
-- Time-series table (TimescaleDB hypertable)
CREATE TABLE bbw_measurements (
    time TIMESTAMPTZ NOT NULL,
    loom_id VARCHAR(50) NOT NULL,
    sensor_id VARCHAR(50) NOT NULL,
    bbw_value FLOAT NOT NULL,
    temperature FLOAT,
    vibration FLOAT,
    quality_flag INT,
    metadata JSONB
);

-- Create hypertable
SELECT create_hypertable('bbw_measurements', 'time');

-- Create indexes
CREATE INDEX ON bbw_measurements (loom_id, time DESC);
CREATE INDEX ON bbw_measurements (sensor_id, time DESC);
```

## API Design

### RESTful Endpoints
```
GET    /api/v1/looms                    # List all looms
GET    /api/v1/looms/{id}               # Get loom details
GET    /api/v1/looms/{id}/measurements  # Get measurements
POST   /api/v1/looms/{id}/config        # Update configuration
GET    /api/v1/alerts                   # List alerts
POST   /api/v1/alerts/{id}/acknowledge  # Acknowledge alert
GET    /api/v1/analytics/summary        # Get analytics summary
```

### WebSocket Events
```
connect                          # Client connection
subscribe:loom:{id}              # Subscribe to loom updates
unsubscribe:loom:{id}            # Unsubscribe
measurement:update               # Real-time measurement
alert:new                        # New alert
status:change                    # Device status change
```

## Compliance & Standards

- **Industrial**: IEC 61131-3 (PLC programming)
- **IoT**: MQTT 5.0, OPC UA
- **Security**: IEC 62443 (industrial cybersecurity)
- **Data**: GDPR compliance (if applicable)
- **Quality**: ISO 9001 alignment

## Future Enhancements

1. **Machine Learning**: Predictive maintenance models
2. **Digital Twin**: Virtual loom simulation
3. **Edge AI**: On-device anomaly detection
4. **AR Interface**: Augmented reality diagnostics
5. **Integration**: ERP/MES system connectivity
6. **Multi-tenancy**: Support for multiple facilities

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Status**: Production Ready
