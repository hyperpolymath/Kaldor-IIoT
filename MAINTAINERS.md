# Maintainers

This document lists the maintainers of the Kaldor Community Manufacturing Platform and describes the Tri-Perimeter Contribution Framework (TPCF).

## Current Maintainers

### Perimeter 1: Core Maintainers (Security-Critical)

Core maintainers have consensus-based voting rights on security, governance, and architecture decisions.

| Name | GitHub | Role | Focus Areas | Joined |
|------|--------|------|-------------|--------|
| Hyperpolymath | @Hyperpolymath | Project Lead | Vision, Architecture, Community | 2025-11-22 |
| *[Open for nomination]* | - | Security Lead | Firmware, Cryptography | - |
| *[Open for nomination]* | - | Backend Lead | Deno, WASM, OPC UA | - |
| *[Open for nomination]* | - | Frontend Lead | ReScript, Accessibility | - |

**Advancement to P1**: Requires 75% community vote (quadratic voting), 6+ months contribution, 20+ merged PRs, background check for security roles.

### Perimeter 2: Professional Contributors (Vetted)

Professional contributors have merge rights for feature development after review.

| Name | GitHub | Specialization | Contributions | Joined |
|------|--------|----------------|---------------|--------|
| *[Open for applications]* | - | CRDT/Offline-First | - | - |
| *[Open for applications]* | - | RISC-V Firmware | - | - |
| *[Open for applications]* | - | Matter Protocol | - | - |
| *[Open for applications]* | - | Data Visualization | - | - |

**Advancement to P2**: Requires 3+ merged PRs in P3, demonstrated expertise, maintainer endorsement.

### Perimeter 3: Community Sandbox (Open)

All contributors start here. No approval needed for documentation, examples, bug reports.

**Current Contributors**: See [CONTRIBUTORS.md](CONTRIBUTORS.md)

## Tri-Perimeter Contribution Framework (TPCF)

### Perimeter 3: Community Sandbox

**Access**: Anyone, immediate
**Scope**: Low-risk contributions
**Examples**: Documentation, tutorials, bug reports, design mockups
**Paths**:
- `docs/**/*`
- `examples/**/*`
- `tutorials/**/*`
- GitHub Issues/Discussions
- Wiki pages

**Merge Process**: Self-service PR → Automated checks → Maintainer merge (24-48h)

### Perimeter 2: Professional Contributors

**Access**: Earned through contribution
**Scope**: Feature development, refactoring
**Examples**: New features, performance improvements, architecture changes
**Paths**:
- `backend-deno/**/*` (excluding security-critical)
- `frontend-rescript/**/*`
- `wasm-modules/**/*`
- `tests/**/*`

**Merge Process**: Discussion → PR → 2 maintainer reviews → Tests pass → Merge

**Requirements**:
- All tests pass (>80% coverage)
- Follows coding standards
- Includes documentation
- No security regressions

### Perimeter 1: Core Maintainers

**Access**: Consensus vote only
**Scope**: Security, cryptography, governance
**Examples**: Firmware updates, consensus algorithms, release management
**Paths**:
- `firmware-riscv/**/*`
- `backend-deno/services/consensus.ts`
- `backend-deno/middleware/auth.ts`
- Cryptographic implementations
- Release tags

**Merge Process**: Consensus among P1 → Security audit → Signed commits → Two-person rule → Canary deployment (24h) → Full deployment

**Requirements**:
- 100% test coverage for security-critical code
- External security review for cryptography
- Signed commits (GPG)
- No solo merges (pair programming)

## Governance Model

### Decision-Making

| Decision Type | Authority | Process |
|---------------|-----------|---------|
| P3 contribution | Individual maintainer | Review + merge |
| P2 feature | 2 maintainers | Code review + approval |
| P1 security fix | All P1 consensus | Security review + vote |
| Architecture change | Community vote | RFC → Discussion → Vote |
| Breaking change | Community vote | RFC → Deprecation → Vote |
| Perimeter advancement | Quadratic vote | Nomination → Community vote |
| Project direction | Quadratic vote | Annual roadmap vote |

### Voting System

We use **Quadratic Voting** for major decisions:

- Each community member gets voice credits (based on contribution)
- Votes cost credits squared (1 vote = 1 credit, 2 votes = 4 credits, etc.)
- Prevents majority tyranny while respecting expertise
- Calculated via CURP consensus protocol

### Community Roles

Beyond TPCF perimeters:

| Role | Responsibility | Selection |
|------|----------------|-----------|
| **Community Steward** | Facilitates discussions, mediates conflicts | Community election (annual) |
| **Documentation Lead** | Maintains wikis, tutorials, API docs | Volunteer + P2 approval |
| **Security Coordinator** | Triages security reports, coordinates disclosure | P1 appointment |
| **Release Manager** | Manages release process, changelogs | P1 rotation (quarterly) |
| **Event Organizer** | Community calls, workshops, conferences | Volunteer |

## Code Ownership

### CODEOWNERS File

The `.github/CODEOWNERS` file specifies mandatory reviewers:

```
# Global (all files require at least 1 P1 review)
* @Hyperpolymath

# Security-critical (require all P1 consensus)
/firmware-riscv/ @Hyperpolymath
/backend-deno/services/consensus.ts @Hyperpolymath
/backend-deno/middleware/auth.ts @Hyperpolymath
/.github/workflows/ @Hyperpolymath

# Documentation (any P2+ can merge)
/docs/ @Hyperpolymath
/wiki/ @Hyperpolymath
/examples/ @Hyperpolymath
```

## Conflict Resolution

### Process

1. **Discussion**: Attempt to reach consensus through discussion
2. **Mediation**: Community Steward facilitates neutral mediation
3. **Vote**: If no consensus after 2 weeks, initiate quadratic vote
4. **Escalation**: For serious disputes, external arbitration (Software Freedom Conservancy)

### Code of Conduct Enforcement

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for full policy.

**Enforcement Team**: Rotating panel of 3 members (1 from each perimeter)
**Contact**: conduct@kaldor.community
**Appeals**: External review board

## Succession Planning

To ensure project continuity:

1. **Bus Factor**: Maintain minimum 3 maintainers per perimeter
2. **Knowledge Transfer**: Pair programming, documentation, shadowing
3. **Backup Maintainers**: Each P1 role has designated backup
4. **Emergency Protocol**: If maintainer unreachable for 30 days, backup assumes role
5. **Graceful Exit**: Maintainers stepping down train replacement (3-month overlap)

## Contact

- **Public**: GitHub Issues/Discussions
- **Maintainers**: maintainers@kaldor.community
- **Security**: security@kaldor.community
- **Governance**: governance@kaldor.community
- **Matrix**: `#kaldor-maintainers:matrix.org` (P1+ only)

## Acknowledgments

This governance model draws inspiration from:

- **Rust RFC Process**: Structured decision-making
- **Node.js TSC**: Technical Steering Committee model
- **Apache Software Foundation**: Meritocratic advancement
- **Debian Project**: Democratic governance at scale
- **Wikipedia**: Graduated editor privileges
- **Platform Cooperatives**: Distributed ownership

---

**Last Updated**: 2025-11-22
**Version**: 1.0.0
**TPCF Framework**: v1.0 (Rhodium Standard Repository)
