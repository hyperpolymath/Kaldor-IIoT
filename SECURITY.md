# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          | End of Life |
| ------- | ------------------ | ----------- |
| 2.0.x   | :white_check_mark: | TBD         |
| 1.0.x   | :x:                | 2025-11-22  |

## Reporting a Vulnerability

**DO NOT** report security vulnerabilities through public GitHub issues.

### Responsible Disclosure

We follow a 90-day coordinated disclosure policy. Please report security vulnerabilities to:

**Primary Contact**: security@kaldor.community
**PGP Key**: See `.well-known/security.txt`
**Response Time**: Within 48 hours

### What to Include

Please include the following information:

1. **Type of vulnerability** (e.g., RCE, XSS, authentication bypass)
2. **Affected component** (firmware, backend, frontend, etc.)
3. **Impact assessment** (CVSS score if available)
4. **Reproduction steps** (detailed, step-by-step)
5. **Proof of concept** (code, screenshots, video)
6. **Suggested fix** (optional but appreciated)

### Disclosure Timeline

- **Day 0**: Vulnerability report received
- **Day 1-2**: Acknowledgment sent to reporter
- **Day 3-14**: Vulnerability verified and severity assessed
- **Day 15-60**: Fix developed and tested
- **Day 61-75**: Security advisory drafted
- **Day 76-90**: Coordinated public disclosure
  - CVE assigned (if applicable)
  - Security advisory published
  - Credit given to reporter (unless anonymity requested)

### Scope

**In Scope**:
- Authentication bypass
- Authorization issues
- Remote code execution (RCE)
- SQL injection, XSS, CSRF
- Firmware vulnerabilities
- MQTT/Matter protocol attacks
- OPC UA security issues
- CRDT convergence failures
- Memory safety violations
- Cryptographic vulnerabilities

**Out of Scope**:
- Social engineering attacks
- Physical attacks on hardware
- Denial of Service (DoS) - unless amplification factor >100x
- Issues in third-party dependencies (report to upstream)
- Issues requiring physical access to devices
- Theoretical vulnerabilities without proof of concept

## Security Architecture

### Defense in Depth

The Kaldor platform implements multiple security layers:

1. **Network Layer**
   - TLS 1.3 for all connections
   - Matter protocol encryption
   - Thread mesh network security
   - mTLS for MQTT

2. **Application Layer**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Input validation (Zod schemas)
   - Rate limiting
   - CSRF protection

3. **Data Layer**
   - Encryption at rest (AES-256-GCM)
   - PostgreSQL row-level security
   - Encrypted backups
   - CRDT signed operations

4. **Firmware Layer**
   - Secure boot (ESP32-C6)
   - OTA signature verification
   - WASM sandboxing
   - Memory protection (RISC-V PMP)

### Threat Model

See `docs/security/THREAT_MODEL.md` for detailed threat analysis.

**Key Threats Addressed**:
- Unauthorized machine control
- Production data tampering
- Community governance manipulation
- Supply chain attacks
- Insider threats (TPCF perimeters)

## Security Hardening Checklist

### Production Deployment

- [ ] Change all default passwords
- [ ] Generate unique JWT secret (min 32 bytes)
- [ ] Enable HTTPS with valid certificates
- [ ] Configure firewall rules (allow-list only)
- [ ] Enable audit logging
- [ ] Set up intrusion detection (fail2ban)
- [ ] Implement backup encryption
- [ ] Configure RBAC policies
- [ ] Enable signed commits requirement
- [ ] Run dependency scanner (weekly)
- [ ] Perform security audit (annually)

### Device Security

- [ ] Flash firmware with secure boot enabled
- [ ] Set unique device certificates
- [ ] Disable debug interfaces in production
- [ ] Enable Matter commissioner authentication
- [ ] Configure OTA signature verification
- [ ] Set up device attestation
- [ ] Implement certificate rotation (90 days)

## Security Tools

We use the following tools for security assurance:

- **SAST**: Deno's built-in linter, Rust Clippy
- **Dependency Scanning**: Dependabot, `deno outdated`
- **Secrets Detection**: GitGuardian, gitleaks
- **Container Scanning**: Trivy, Docker Scout
- **Fuzzing**: AFL++ for C/C++ firmware
- **Penetration Testing**: Annual third-party audit

## Known Vulnerabilities

Current known vulnerabilities are tracked at:
https://github.com/Hyperpolymath/Kaldor-IIoT/security/advisories

## Security Contact

- **Email**: security@kaldor.community
- **PGP Key Fingerprint**: See `.well-known/security.txt`
- **Security Advisory Feed**: RSS available at `/security/advisories.rss`

## Bounty Program

We do not currently offer a bug bounty program, but we:

1. Publicly acknowledge security researchers (with permission)
2. Prioritize security fixes above all other work
3. Provide CVE credit where applicable
4. Are exploring community-funded bounty options

## Compliance

This security policy aligns with:

- **OWASP Top 10** (2021)
- **CWE Top 25** (2024)
- **NIST Cybersecurity Framework**
- **IEC 62443** (Industrial cybersecurity)
- **RFC 9116** (security.txt)

## Updates

This policy was last updated: 2025-11-22

Subscribe to security notifications:
https://github.com/Hyperpolymath/Kaldor-IIoT/security/advisories

---

*Thank you for helping keep Kaldor and our community safe!*
