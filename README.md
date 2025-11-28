# Kaldor IIoT

**Industrial IoT system for Kaldor loom Back Beam Width (BBW) monitoring**

A comprehensive, production-ready IIoT platform for real-time monitoring, analytics, and predictive maintenance of industrial looms.

## Features

- **Real-time Monitoring**: Sub-second latency from sensor to dashboard
- **Multi-Sensor Support**: Ultrasonic distance, temperature, vibration sensors
- **Time-Series Analytics**: Powered by TimescaleDB for efficient data storage and querying
- **Real-Time Alerts**: Configurable thresholds with email/SMS notifications
- **Web Dashboard**: Modern React-based interface with live updates
- **MQTT Communication**: Industry-standard protocol with TLS support
- **Edge Computing**: On-device processing and offline resilience
- **Scalable Architecture**: Docker-based microservices
- **Production Ready**: Complete with monitoring, logging, and deployment automation

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for development)
- Python 3.9+ (for analytics)
- PlatformIO (for firmware)

### Installation

1. Clone the repository
2. Copy environment variables: `cp .env.example .env`
3. Start all services: `docker-compose up -d`
4. Access dashboard: `http://localhost`

Default credentials: `admin` / `admin123`

## Documentation

- [Architecture](ARCHITECTURE.md) - System architecture and design
- [Claude Integration](CLAUDE.md) - Working with Claude Code
- [API Documentation](http://localhost:3000/api-docs) - Interactive API docs
- [Hardware Setup](docs/hardware/SETUP.md) - Hardware assembly guide
- [Deployment Guide](docs/developer/DEPLOYMENT.md) - Production deployment

## Project Structure

See [ARCHITECTURE.md](ARCHITECTURE.md) for complete system architecture.

## Support

- GitHub Issues: Create an issue for bug reports
- Email: support@kaldor-iiot.example.com
- Documentation: See `/docs` directory

## License

Proprietary - Kaldor IIoT Team

---

**Version**: 1.0.0
**Status**: Production Ready
**Last Updated**: 2025-11-22
