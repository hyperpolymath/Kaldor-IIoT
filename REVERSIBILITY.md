# REVERSIBILITY.md

<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2025 Kaldor Community Manufacturing Platform Contributors -->

**Version**: 1.0.0
**Last Updated**: 2025-11-28

## Purpose

Kaldor IIoT is committed to **reversible decisions** and **low-stakes experimentation**. Every operation can be undone, every decision can be revisited with new evidence, and no contributor should fear permanent mistakes.

This document provides procedures for undoing changes, reverting decisions, and safely experimenting.

## Principles

1. **No Permanent Mistakes**: All changes are reversible via version control, backups, or governance votes
2. **Safe Experimentation**: Perimeter 3 (sandbox) encourages learning without consequences
3. **Clear Undo Paths**: Every operation documents its reversal procedure
4. **Blameless Culture**: Mistakes are learning opportunities, not grounds for punishment
5. **Right to Disconnect**: Contributors can step back without penalty

## Code Reversibility

### Git Operations

#### Undo Last Commit (Not Pushed)

```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes entirely
git reset --hard HEAD~1
```

#### Revert Pushed Commit

```bash
# Create new commit that undoes changes
git revert <commit-hash>
git push origin main
```

#### Restore Deleted File

```bash
# Find when file was deleted
git log --all --full-history -- path/to/file

# Restore from specific commit
git checkout <commit-hash>^ -- path/to/file
```

#### Undo Merge

```bash
# Find merge commit
git log --oneline --graph

# Revert merge (use -m 1 for parent branch)
git revert -m 1 <merge-commit-hash>
```

### Sandbox Cleanup

Perimeter 3 (sandbox/) has automated cleanup via RVC (Robot Vacuum Cleaner):

```bash
# Remove abandoned experiments (>90 days inactive)
just sandbox-clean

# Restore accidentally deleted sandbox
git reflog
git checkout <reflog-entry>
```

## Data Reversibility

### Database Operations

#### Rollback Migration

```bash
# List migrations
just db-migrations

# Rollback last migration
just db-rollback

# Rollback to specific version
just db-rollback --to 20250101120000
```

#### Point-in-Time Recovery (Production)

```bash
# TimescaleDB continuous backups
# Restore to 2 hours ago
just db-restore --timestamp "2025-11-28 14:00:00"
```

#### CRDT Conflict Resolution

CRDTs automatically resolve conflicts, but you can inspect history:

```bash
# View Automerge change history
deno run scripts/crdt/history.ts --doc <doc-id>

# Restore to previous state (creates new state, preserves history)
deno run scripts/crdt/restore.ts --doc <doc-id> --timestamp "2025-11-28T14:00:00Z"
```

### Configuration Reversibility

#### Environment Variables

```bash
# Backup current .env
cp .env .env.backup.$(date +%Y%m%d)

# Restore previous .env
cp .env.backup.20251128 .env
```

#### Nix Configuration

```bash
# Rollback to previous Nix generation
nix-env --rollback

# List all generations
nix-env --list-generations

# Switch to specific generation
nix-env --switch-generation 42
```

## Governance Reversibility

### Revisiting Decisions

Any governance decision can be revisited if:

1. **New Evidence**: Material facts change since original decision
2. **Unintended Consequences**: Decision had unforeseen negative impacts
3. **Community Consensus**: 66% vote to reconsider

**Procedure**:

```bash
# Propose reconsideration
deno run scripts/governance/reconsider.ts \
  --decision-id GD-2025-001 \
  --rationale "New RISC-V chip available, revisit architecture"

# Vote (same threshold as original decision)
# If approved, original decision is marked "superseded"
```

### Maintainer Decisions

Perimeter 1 maintainers can self-correct:

```bash
# Revert approved PR (creates new PR)
gh pr create --title "Revert #123: Reason for revert" \
  --body "Discovered issue XYZ after merge"

# No approval needed for immediate bug fixes
# Post-hoc review within 7 days
```

## Deployment Reversibility

### Rollback Release

```bash
# Rollback to previous version
just deploy-rollback

# Deploy specific version
just deploy --version v1.2.3
```

### Blue-Green Deployment

```bash
# Production runs v2.0.0 (blue)
# Deploy v2.1.0 to green environment
just deploy-green --version v2.1.0

# Test green environment
just test-green

# Switch traffic to green (instant rollback available)
just switch-to-green

# If issues, instant rollback to blue
just switch-to-blue
```

### Canary Rollback

```bash
# 10% traffic on v2.1.0 canary
just deploy-canary --version v2.1.0 --traffic 10%

# Errors detected, rollback immediately
just canary-rollback
```

## Hardware Reversibility

### Firmware Updates

ESP32-C6 firmware supports rollback:

```bash
# OTA update with automatic rollback on boot failure
pio run --target upload-ota --environment esp32c6

# If new firmware fails to boot (3 attempts), ESP32 auto-rolls back
# Manual rollback:
pio run --target upload-ota --environment esp32c6 --upload-port <IP> --project-option "firmware_version=v1.0.0"
```

### Factory Reset

```bash
# Reset ESP32 to factory defaults (preserves backup partition)
deno run scripts/firmware/factory-reset.ts --device loom-001

# Restore from backup
deno run scripts/firmware/restore.ts --device loom-001 --backup 20251128
```

## Community Reversibility

### Stepping Down

Contributors can step back anytime:

```bash
# Announce in governance forum (optional but appreciated)
# No minimum notice for Perimeter 2/3
# 4 weeks notice appreciated for Perimeter 1 (see GOVERNANCE.adoc)

# Transfer responsibilities
just handoff --to alice@example.com
```

### Rejoining

Former contributors can return anytime:

- **Perimeter 3**: Immediate (no approval needed)
- **Perimeter 2**: Re-nomination if inactive >12 months
- **Perimeter 1**: Re-election if inactive >6 months

## Emotional Safety Mechanisms

### Low-Stakes Contribution

**Perimeter 3 (Sandbox)**: Experiments auto-merge if CI passes. No human review = no rejection anxiety.

```bash
# Create sandbox experiment
git checkout -b sandbox/my-idea
mkdir -p sandbox/my-idea
echo "# Trying something new" > sandbox/my-idea/README.md
git commit -m "feat(sandbox): trying new approach"
git push

# Auto-merges if tests pass
# Can delete anytime, no questions asked
```

### Reversible Commits

Commit early, commit often. Commits are cheap, reversible, and aid learning:

```bash
# Experimental commit with clear reversibility
git commit -m "experiment: trying alternative algorithm [REVERSIBLE]"

# Tag helps identify safe-to-revert commits
```

### Blameless Postmortems

When production incidents occur:

1. **Focus on Systems**: What processes failed, not who made mistake
2. **Document Learnings**: Update runbooks, add monitoring
3. **No Punishment**: Mistakes are learning opportunities
4. **Appreciation**: Thank responders for quick resolution

Template: `docs/postmortems/YYYY-MM-DD-incident-title.md`

## Conflict Resolution Reversibility

Code of Conduct enforcement decisions can be appealed:

1. **Internal Appeal**: Ombudsperson reviews (14 days)
2. **Governance Review**: Community vote (66% to overturn)
3. **External Mediation**: Third-party mediator (rare)

See [CODE_OF_CONDUCT.md#appeals](CODE_OF_CONDUCT.md#appeals) for details.

## Non-Reversible Actions (Rare)

Some actions are difficult or impossible to reverse:

### Security Disclosures

- Published CVEs cannot be unpublished (only corrected)
- Coordinate carefully before disclosure (see [SECURITY.md](SECURITY.md))

### Public Communications

- Press releases, blog posts persist via web archives
- Draft carefully, review with 2+ maintainers before publishing

### Legal Agreements

- Contracts, license changes may be legally binding
- Require governance vote + legal review

### Data Deletion (GDPR)

- Right to be forgotten requests are permanent
- Automated backups purged after 90 days

## Undo Checklist

When reverting any change:

- [ ] Document reason for revert (commit message or ADR)
- [ ] Notify affected contributors (GitHub mentions)
- [ ] Update CHANGELOG.md
- [ ] Run full test suite after revert
- [ ] Check for dependent changes that also need reverting
- [ ] Post-mortem if production issue (not for experiments)

## Emergency Undo Procedures

### Production Outage

```bash
# Immediate rollback authority (no approval needed)
# Security WG + 2 P1 maintainers

just deploy-rollback

# Post-hoc governance review within 7 days
```

### Security Incident

```bash
# Revert compromised code immediately
git revert <malicious-commit>
git push origin main --force-with-lease

# Force-push permitted ONLY for security incidents
# Document in incident report
```

### Compromised Credentials

```bash
# Rotate all secrets immediately
just secrets-rotate

# Audit access logs
just audit-access --since 24h

# Notify users if data exposed (see SECURITY.md)
```

## Reversibility Testing

Regularly test undo procedures:

```bash
# Quarterly disaster recovery drill
just dr-drill

# Includes:
# - Database restore from backup
# - Firmware rollback
# - Deployment rollback
# - CRDT conflict resolution
```

## Questions & Feedback

- **Stuck undoing something?**: Open issue with `reversibility` label
- **Propose new undo mechanism**: Start discussion in governance forum
- **Emergency undo assistance**: governance@kaldor.community

---

**Remember**: If you can break it, you can fix it. If you can deploy it, you can rollback it. If you can join, you can leave. **Reversibility enables fearless innovation.**

**Last Updated**: 2025-11-28
**Document Version**: 1.0.0
**License**: MIT OR Apache-2.0
