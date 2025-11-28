# ROADMAP.md

<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2025 Kaldor Community Manufacturing Platform Contributors -->

**Version**: 2.0.0
**Status**: Active Development
**Last Updated**: 2025-11-28

## Vision

**By 2027**: Kaldor IIoT powers 500 hyperlocal manufacturing nodes across 8 economic sectors, decentralizing textile production and proving community-scale manufacturing can replace factory economies of scale through network effects (Kaldor's Law 2).

## Development Phases

### Phase 1: Foundation (Q4 2025 - Q1 2026) ✅ In Progress

**Goal**: Establish core architecture and RSR Gold compliance

#### Milestones

- [x] **Architecture v2.0**: Deno + ReScript + WASM + Matter ([ARCHITECTURE-v2.md](ARCHITECTURE-v2.md))
- [x] **RSR Gold Compliance**: 100% pass on all 11 categories
- [x] **Governance Framework**: CURP consensus, quadratic voting ([GOVERNANCE.adoc](GOVERNANCE.adoc))
- [x] **Security Foundation**: RFC 9116 compliant, `.well-known/` directory
- [x] **White Paper**: Business case, economics, Kaldor's Law 2 validation
- [ ] **Nix Reproducible Builds**: `nix flake check` passes
- [ ] **CRDT Implementation**: Automerge for offline-first
- [ ] **Deno Backend v1.0**: HTTP server, MQTT broker, TimescaleDB integration

**Deliverables**:
- Reproducible development environment (`nix develop`)
- Backend API with WASM pattern generation
- CURP governance scripts (offline voting)
- Comprehensive documentation suite

**Success Criteria**:
- `just validate` passes all RSR checks
- 3 active Perimeter 1 maintainers
- 10+ Perimeter 3 contributors

---

### Phase 2: Pilot Deployment (Q2 2026 - Q3 2026)

**Goal**: 12-household pilot in single geographic cluster

#### Milestones

- [ ] **ReScript Frontend v1.0**: Dashboard, job queue, device monitoring
- [ ] **ESP32-C6 Firmware v1.0**: Matter certified, RISC-V optimized
- [ ] **3D Weave System**: Specification + prototype implementation
- [ ] **SCADA Integration**: OPC UA + Modbus TCP for industrial loom integration
- [ ] **Community Governance Interface**: Web UI for quadratic voting
- [ ] **Pilot Program**: 12 households, 3-node system (spin → weave → finish)

**Deliverables**:
- Production-ready firmware (OTA updates, automatic rollback)
- Mobile-responsive dashboard (PWA with offline support)
- Instructables-style documentation (assembly, operation, troubleshooting)
- Pilot case study report (economics, productivity, community impact)

**Success Criteria**:
- 90% uptime over 3 months
- Verdoorn coefficient b ≥ 0.5 (validates Kaldor's Law 2)
- 80% pilot participant satisfaction
- Zero critical security incidents

**Budget**: £65,000
- Equipment: £35,000 (12 households × 3 nodes × £1,000 avg)
- Development: £20,000 (stipends for 4 core contributors)
- Infrastructure: £5,000 (hosting, CI/CD, hardware testing)
- Community: £5,000 (training, documentation, events)

---

### Phase 3: Scale-Up (Q4 2026 - Q2 2027)

**Goal**: 100 households across 3 geographic clusters

#### Milestones

- [ ] **Platform Cooperative Launch**: Multi-stakeholder governance
- [ ] **8-Sector Economic Models**: Detailed financial templates for each sector
- [ ] **3D Weaving v1.0**: Production-ready additive manufacturing integration
- [ ] **Matter 1.3 Support**: Latest CSA specification
- [ ] **Multi-Language Support**: i18n for 5 languages (EN, ES, FR, ZH, AR)
- [ ] **Kickstarter Campaign**: £250,000 target for 500-household expansion

**Deliverables**:
- Platform cooperative legal structure
- Financial model spreadsheets (ROI calculators for each sector)
- 3D weaving hardware specification (open-source CAD files)
- Kickstarter campaign page + video
- Wiki with 50+ instructables-style guides

**Success Criteria**:
- 100 active nodes (300 devices total)
- £850k-1.2M annual economic activity
- 50-80 jobs created (mix of FTE and part-time)
- 3 case studies published (household, social enterprise, worker coop)

**Budget**: £280,000
- Equipment: £150,000 (100 households)
- Development: £80,000 (8 core contributors × 6 months)
- Marketing: £30,000 (Kickstarter, community outreach)
- Legal: £20,000 (cooperative formation, trademark, compliance)

---

### Phase 4: Network Effects (Q3 2027 - Q4 2027)

**Goal**: 500 households, cross-cluster collaboration

#### Milestones

- [ ] **Cross-Cluster Coordination**: Shared job queue, resource pooling
- [ ] **Supply Chain Integration**: Local fiber sourcing, dye production
- [ ] **Academic Partnership**: University research on productivity growth
- [ ] **Policy Advocacy**: Local government procurement from hyperlocal networks
- [ ] **Environmental Certification**: B Corp or equivalent sustainability standard

**Deliverables**:
- Distributed job scheduling (CURP-based)
- Supply chain traceability (blockchain provenance)
- Academic paper validating Kaldor's Law 2 at community scale
- Policy brief for local governments
- Environmental impact report (LCA, carbon footprint)

**Success Criteria**:
- 500 active nodes (1,500 devices)
- 85% carbon reduction vs. fast fashion (validated)
- 200+ jobs created
- 5 local government partnerships

**Budget**: £850,000 (Kickstarter + grants + cooperative revenue)

---

## Feature Roadmap

### Backend (Deno)

| Feature | Phase | Status |
|---------|-------|--------|
| HTTP server (Oak) | 1 | ✅ In Progress |
| MQTT broker integration | 1 | ⏳ Pending |
| TimescaleDB time-series | 1 | ⏳ Pending |
| WASM pattern generation | 1 | ✅ Architecture |
| Automerge CRDTs | 1-2 | ⏳ Pending |
| OPC UA client | 2 | ⏳ Pending |
| Modbus TCP gateway | 2 | ⏳ Pending |
| CURP consensus engine | 2 | ⏳ Pending |
| Job scheduling (distributed) | 4 | ⏳ Pending |

### Frontend (ReScript)

| Feature | Phase | Status |
|---------|-------|--------|
| Dashboard UI | 2 | ⏳ Pending |
| Device monitoring | 2 | ⏳ Pending |
| Job queue interface | 2 | ⏳ Pending |
| Governance voting UI | 2 | ⏳ Pending |
| Offline PWA support | 2 | ⏳ Pending |
| i18n (5 languages) | 3 | ⏳ Pending |
| Accessibility (WCAG 2.1 AA) | 2-3 | ⏳ Pending |

### Firmware (ESP32-C6)

| Feature | Phase | Status |
|---------|-------|--------|
| Matter 1.2 support | 2 | ⏳ Pending |
| RISC-V optimization | 2 | ⏳ Pending |
| OTA updates | 2 | ⏳ Pending |
| Automatic rollback | 2 | ⏳ Pending |
| Thread mesh networking | 2 | ⏳ Pending |
| Low-power modes | 2-3 | ⏳ Pending |
| Matter 1.3 support | 3 | ⏳ Pending |

### WASM Modules (Rust)

| Feature | Phase | Status |
|---------|-------|--------|
| Pattern generation | 1 | ✅ Architecture |
| 3D weave algorithms | 2 | ⏳ Pending |
| Scheduler optimizer | 3 | ⏳ Pending |
| CURP consensus | 2 | ⏳ Pending |
| Cryptographic signing | 3 | ⏳ Pending |

### Documentation

| Feature | Phase | Status |
|---------|-------|--------|
| RSR Gold compliance | 1 | ✅ In Progress |
| White paper | 1 | ✅ Complete |
| 3D weave specification | 2 | ⏳ Pending |
| Instructables (50+ guides) | 2-3 | ⏳ Pending |
| API documentation (100%) | 2 | ⏳ Pending |
| Video tutorials | 3 | ⏳ Pending |
| Kickstarter campaign | 3 | ⏳ Pending |

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation | Phase |
|------|--------|------------|-------|
| Matter certification delays | High | Parallel WiFi fallback | 2 |
| CRDT performance at scale | Medium | Benchmarking + optimization | 2-3 |
| WASM browser compatibility | Low | Polyfills + feature detection | 1 |
| ESP32-C6 supply chain | Medium | Multi-vendor sourcing | 2 |

### Community Risks

| Risk | Impact | Mitigation | Phase |
|------|--------|------------|-------|
| Maintainer burnout | High | Stipends + sabbaticals | 1-4 |
| Low contributor diversity | Medium | Outreach + mentorship | 1-2 |
| Governance conflicts | Medium | Ombudsperson + clear processes | 1-2 |
| Code of Conduct violations | Low | Training + enforcement | 1-4 |

### Economic Risks

| Risk | Impact | Mitigation | Phase |
|------|--------|------------|-------|
| Kickstarter fails to fund | High | Pre-seed grants + cooperative revenue | 3 |
| Equipment costs rise | Medium | Bulk purchasing + local sourcing | 2-3 |
| Low adoption (< 100 nodes) | Medium | Case studies + policy advocacy | 3 |
| Regulatory barriers | Low | Legal review + local partnerships | 2-3 |

---

## Success Metrics

### Technical Metrics

- **Uptime**: ≥99% for production nodes
- **Response Time**: <200ms API latency (p95)
- **Test Coverage**: ≥90% line coverage (critical paths)
- **Security**: Zero critical vulnerabilities unpatched >7 days
- **RSR Compliance**: Gold (100%) maintained

### Community Metrics

- **Contributors**: 50+ total (10 P1, 20 P2, 20+ P3)
- **Geographic Diversity**: ≥3 countries represented in P1
- **Organizational Diversity**: ≥3 organizations in P1
- **Response Time**: <48 hours for PR review
- **Retention**: ≥75% of P2 contributors active after 6 months

### Economic Metrics

- **Nodes Deployed**: 500 by end of Phase 4
- **Jobs Created**: 200+ (mix of FTE and part-time)
- **Economic Activity**: £3-5M annually (500 nodes × £6-10k avg)
- **Environmental Impact**: 85% carbon reduction vs. fast fashion
- **Community Revenue**: £500k annually (cooperative membership fees)

### Impact Metrics

- **Kaldor's Law 2 Validation**: Verdoorn coefficient b ≥ 0.5
- **Productivity Growth**: >150% over 2 years
- **Local Ownership**: 100% community-owned (no VC/corporate control)
- **Policy Influence**: ≥5 local governments adopt hyperlocal procurement
- **Academic Recognition**: ≥3 peer-reviewed papers citing Kaldor IIoT

---

## End-of-Life Planning

### Project Archival Triggers

Project enters "sunset" phase if:

1. **No Active Maintainers**: Zero P1 maintainers for >12 months
2. **Security Unsustainable**: Critical vulnerabilities remain unpatched >90 days
3. **Community Vote**: 90% vote to archive (see [GOVERNANCE.adoc](GOVERNANCE.adoc))

### Sunset Procedure

1. **Announcement** (T-0): Public notice of archival (6 months advance notice)
2. **Succession Search** (T+1 month): Call for new maintainers/forks
3. **Read-Only Mode** (T+3 months): Repository archived, no new PRs accepted
4. **Data Export** (T+6 months): Full data dumps for forks/continuations
5. **Archival** (T+6 months): Repository marked "archived" on GitHub

### Fork & Continuation Rights

Any contributor can fork under [LICENSE.txt](LICENSE.txt):

- **Code**: MIT OR Apache-2.0 (your choice)
- **Documentation**: CC-BY-SA-4.0 (must preserve attribution)
- **Hardware**: CERN-OHL-S-2.0 (strongly reciprocal)
- **Trademark**: "Kaldor IIoT" name requires permission, but concept is free

**Community Recognition**: If fork becomes de facto standard, community can vote (90%) to recognize fork as canonical continuation.

### Data Retention

- **Code**: Permanent (GitHub archive)
- **Documentation**: Permanent (Wayback Machine, IPFS)
- **User Data**: Deleted after 90 days (GDPR compliance)
- **Backups**: Retained 90 days, then purged

### Successor Projects

Expected forks/derivatives:

- **Sector-Specific**: Dedicated versions for food, electronics, etc.
- **Geographic**: Regional adaptations (e.g., "Kaldor India" with local supply chains)
- **Proprietary**: Commercial derivatives (permitted under MIT/Apache-2.0, must preserve attribution)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-22 | Initial architecture, RSR Bronze |
| 2.0.0 | 2025-11-28 | Complete rewrite: Deno + ReScript + WASM, RSR Gold |
| 2.1.0 | TBD | ReScript frontend v1.0, ESP32 firmware v1.0 |
| 3.0.0 | TBD | Platform cooperative launch, 100 nodes |
| 4.0.0 | TBD | 500 nodes, cross-cluster coordination |

---

## How to Contribute to This Roadmap

- **Propose New Milestone**: Open issue with `roadmap` label
- **Adjust Timeline**: Comment on [ROADMAP.md PR](https://github.com/Hyperpolymath/Kaldor-IIoT/pulls)
- **Volunteer for Feature**: Tag yourself in issue tracker
- **Governance Vote**: Roadmap changes require 66% approval (see [GOVERNANCE.adoc](GOVERNANCE.adoc))

---

**Next Review**: 2026-02-28 (quarterly updates)
**Maintained By**: Governance working group
**Contact**: governance@kaldor.community

_"The future of manufacturing is hyperlocal, community-owned, and open-source."_
