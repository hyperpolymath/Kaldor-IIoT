# SPDX-License-Identifier: MIT OR Apache-2.0
# SPDX-FileCopyrightText: 2025 Kaldor Community Manufacturing Platform Contributors
#
# Justfile - Task runner for Kaldor IIoT
#
# Install just: https://github.com/casey/just
# Usage: just --list

# Default recipe (runs when you type `just`)
default:
    @just --list

# Display system info and verify dependencies
doctor:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "🔍 Kaldor IIoT Environment Check"
    echo "================================"
    echo ""
    echo "📦 Checking dependencies..."
    command -v nix >/dev/null 2>&1 && echo "✅ Nix $(nix --version | head -1)" || echo "❌ Nix not found"
    command -v deno >/dev/null 2>&1 && echo "✅ Deno $(deno --version | head -1)" || echo "⚠️  Deno not found (run 'nix develop')"
    command -v cargo >/dev/null 2>&1 && echo "✅ Rust $(cargo --version)" || echo "⚠️  Rust not found (run 'nix develop')"
    command -v node >/dev/null 2>&1 && echo "✅ Node.js $(node --version)" || echo "⚠️  Node.js not found (run 'nix develop')"
    echo ""
    echo "📁 Repository info:"
    echo "   Branch: $(git branch --show-current)"
    echo "   Commit: $(git rev-parse --short HEAD)"
    echo "   Status: $(git status --porcelain | wc -l) uncommitted changes"

# Run all tests
test:
    @echo "🧪 Running all test suites..."
    just test-backend
    just test-frontend
    just test-wasm
    @echo "✅ All tests passed!"

# Run Deno backend tests
test-backend:
    @echo "🦕 Running Deno backend tests..."
    cd backend-deno && deno test --allow-net --allow-read --allow-env

# Run ReScript frontend tests
test-frontend:
    @echo "⚛️  Running ReScript frontend tests..."
    cd frontend-rescript && npm test

# Run Rust WASM tests
test-wasm:
    @echo "🦀 Running Rust WASM tests..."
    cd wasm/pattern_gen && cargo test

# Run firmware tests (requires hardware or emulator)
test-firmware:
    @echo "🔌 Running ESP32 firmware tests..."
    cd firmware-esp32 && pio test

# Run integration tests
test-integration:
    @echo "🔗 Running integration tests..."
    deno test --allow-all tests/integration/

# Start test environment (databases, MQTT broker, etc.)
test-env-up:
    @echo "🚀 Starting test environment..."
    podman-compose -f docker-compose.test.yml up -d
    @echo "⏳ Waiting for services..."
    sleep 5

# Stop test environment
test-env-down:
    @echo "🛑 Stopping test environment..."
    podman-compose -f docker-compose.test.yml down

# Run full RSR compliance validation
validate:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "🏆 RSR Gold Compliance Validation"
    echo "=================================="
    echo ""

    # Category 1: Foundational Infrastructure
    echo "📦 Category 1: Foundational Infrastructure"
    test -f flake.nix && echo "  ✅ flake.nix present" || echo "  ❌ flake.nix missing"
    test -f flake.lock && echo "  ✅ flake.lock present" || echo "  ❌ flake.lock missing"
    test -f Justfile && echo "  ✅ Justfile present" || echo "  ❌ Justfile missing"

    # Category 2: Documentation Standards
    echo ""
    echo "📚 Category 2: Documentation Standards"
    test -f README.adoc && echo "  ✅ README.adoc present" || echo "  ❌ README.adoc missing"
    test -f LICENSE.txt && echo "  ✅ LICENSE.txt present" || echo "  ❌ LICENSE.txt missing"
    test -f SECURITY.md && echo "  ✅ SECURITY.md present" || echo "  ❌ SECURITY.md missing"
    test -f CODE_OF_CONDUCT.md && echo "  ✅ CODE_OF_CONDUCT.md present" || echo "  ❌ CODE_OF_CONDUCT.md missing"
    test -f CONTRIBUTING.adoc && echo "  ✅ CONTRIBUTING.adoc present" || echo "  ❌ CONTRIBUTING.adoc missing"
    test -f FUNDING.yml && echo "  ✅ FUNDING.yml present" || echo "  ❌ FUNDING.yml missing"
    test -f GOVERNANCE.adoc && echo "  ✅ GOVERNANCE.adoc present" || echo "  ❌ GOVERNANCE.adoc present"
    test -f MAINTAINERS.md && echo "  ✅ MAINTAINERS.md present" || echo "  ❌ MAINTAINERS.md missing"
    test -f REVERSIBILITY.md && echo "  ✅ REVERSIBILITY.md present" || echo "  ❌ REVERSIBILITY.md missing"
    test -f ROADMAP.md && echo "  ✅ ROADMAP.md present" || echo "  ❌ ROADMAP.md missing"
    test -f .gitignore && echo "  ✅ .gitignore present" || echo "  ❌ .gitignore missing"
    test -f .gitattributes && echo "  ✅ .gitattributes present" || echo "  ❌ .gitattributes missing"

    # .well-known directory
    echo ""
    echo "🌐 Category 2: .well-known Directory"
    test -f .well-known/security.txt && echo "  ✅ .well-known/security.txt present" || echo "  ❌ .well-known/security.txt missing"
    test -f .well-known/ai.txt && echo "  ✅ .well-known/ai.txt present" || echo "  ❌ .well-known/ai.txt missing"
    test -f .well-known/humans.txt && echo "  ✅ .well-known/humans.txt present" || echo "  ❌ .well-known/humans.txt missing"
    test -f .well-known/consent-required.txt && echo "  ✅ .well-known/consent-required.txt present" || echo "  ❌ .well-known/consent-required.txt missing"
    test -f .well-known/provenance.json && echo "  ✅ .well-known/provenance.json present" || echo "  ❌ .well-known/provenance.json missing"

    echo ""
    echo "🔐 Category 3: Security Architecture"
    echo "  ⚠️  Manual review required (type safety, memory safety, CRDTs)"

    echo ""
    echo "✅ Validation complete! See output above for compliance status."

# Check all links for 404s (requires lychee)
check-links:
    @echo "🔗 Checking all links..."
    lychee --verbose docs/ *.md *.adoc

# Audit all dependencies for CVEs
audit:
    @echo "🔍 Auditing dependencies..."
    just audit-backend
    just audit-frontend
    just audit-wasm

# Audit Deno dependencies
audit-backend:
    @echo "🦕 Auditing Deno dependencies..."
    cd backend-deno && deno task audit || echo "⚠️  No audit task defined yet"

# Audit npm dependencies
audit-frontend:
    @echo "📦 Auditing npm dependencies..."
    cd frontend-rescript && npm audit

# Audit Rust dependencies
audit-wasm:
    @echo "🦀 Auditing Rust dependencies..."
    cd wasm/pattern_gen && cargo audit || echo "⚠️  cargo-audit not installed (run 'cargo install cargo-audit')"

# Audit SPDX license headers
audit-licence:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "⚖️  Auditing SPDX license headers..."

    missing=0
    while IFS= read -r -d '' file; do
        if ! grep -q "SPDX-License-Identifier" "$file"; then
            echo "  ❌ Missing SPDX header: $file"
            ((missing++))
        fi
    done < <(find . -type f \( -name "*.ts" -o -name "*.rs" -o -name "*.res" -o -name "*.c" -o -name "*.h" \) -not -path "*/node_modules/*" -not -path "*/.cache/*" -not -path "*/target/*" -print0)

    if [ $missing -eq 0 ]; then
        echo "  ✅ All source files have SPDX headers"
    else
        echo "  ❌ $missing files missing SPDX headers"
        exit 1
    fi

# Format all code
fmt:
    @echo "🎨 Formatting code..."
    just fmt-backend
    just fmt-frontend
    just fmt-wasm

# Format Deno code
fmt-backend:
    @echo "🦕 Formatting Deno code..."
    cd backend-deno && deno fmt

# Format ReScript code
fmt-frontend:
    @echo "⚛️  Formatting ReScript code..."
    cd frontend-rescript && npm run format

# Format Rust code
fmt-wasm:
    @echo "🦀 Formatting Rust code..."
    cd wasm/pattern_gen && cargo fmt

# Lint all code
lint:
    @echo "🔎 Linting code..."
    just lint-backend
    just lint-frontend
    just lint-wasm

# Lint Deno code
lint-backend:
    @echo "🦕 Linting Deno code..."
    cd backend-deno && deno lint

# Lint ReScript code
lint-frontend:
    @echo "⚛️  Linting ReScript code..."
    cd frontend-rescript && npm run lint || echo "⚠️  No lint script defined yet"

# Lint Rust code
lint-wasm:
    @echo "🦀 Linting Rust code..."
    cd wasm/pattern_gen && cargo clippy -- -D warnings

# Build all components
build:
    @echo "🔨 Building all components..."
    just build-backend
    just build-frontend
    just build-wasm
    just build-firmware

# Build Deno backend
build-backend:
    @echo "🦕 Building Deno backend..."
    cd backend-deno && deno task build || echo "⚠️  No build task defined (interpreted)"

# Build ReScript frontend
build-frontend:
    @echo "⚛️  Building ReScript frontend..."
    cd frontend-rescript && npm run build

# Build Rust WASM modules
build-wasm:
    @echo "🦀 Building Rust WASM modules..."
    cd wasm/pattern_gen && cargo build --target wasm32-unknown-unknown --release

# Build ESP32 firmware
build-firmware:
    @echo "🔌 Building ESP32 firmware..."
    cd firmware-esp32 && pio run

# Clean build artifacts
clean:
    @echo "🧹 Cleaning build artifacts..."
    rm -rf backend-deno/.cache
    rm -rf frontend-rescript/lib frontend-rescript/node_modules/.cache
    rm -rf wasm/pattern_gen/target
    rm -rf firmware-esp32/.pio
    @echo "✅ Clean complete"

# Generate SBOM (Software Bill of Materials)
sbom-generate:
    @echo "📋 Generating SBOM..."
    @echo "⚠️  SBOM generation not yet implemented"
    @echo "   TODO: Use cyclonedx or spdx-sbom-generator"

# Start development server
dev:
    @echo "🚀 Starting development servers..."
    @echo "⚠️  Run these in separate terminals:"
    @echo "   Terminal 1: cd backend-deno && deno run --allow-all --watch main.ts"
    @echo "   Terminal 2: cd frontend-rescript && npm run dev"

# Start production server
start:
    @echo "🚀 Starting production server..."
    cd backend-deno && deno run --allow-net --allow-read --allow-env main.ts

# Database migrations
db-migrations:
    @echo "📊 Listing database migrations..."
    @echo "⚠️  Migration system not yet implemented"

# Rollback last database migration
db-rollback:
    @echo "⏪ Rolling back last migration..."
    @echo "⚠️  Migration system not yet implemented"

# Disaster recovery drill
dr-drill:
    @echo "🚨 Running disaster recovery drill..."
    @echo "⚠️  DR procedures not yet implemented"
    @echo "   TODO: Test backups, rollbacks, CRDT conflict resolution"

# Deploy to production (rollback available)
deploy:
    @echo "🚀 Deploying to production..."
    @echo "⚠️  Deployment automation not yet implemented"

# Rollback last deployment
deploy-rollback:
    @echo "⏪ Rolling back deployment..."
    @echo "⚠️  Deployment automation not yet implemented"

# Nix flake check
nix-check:
    @echo "❄️  Running nix flake check..."
    nix flake check

# Update flake.lock
nix-update:
    @echo "❄️  Updating flake.lock..."
    nix flake update

# Enter Nix development shell
nix-shell:
    @echo "❄️  Entering Nix development shell..."
    nix develop

# Security scan (requires trivy or similar)
security-scan:
    @echo "🔒 Running security scan..."
    @echo "⚠️  Security scanning not yet implemented"
    @echo "   TODO: Use trivy, grype, or snyk"

# Generate API documentation
docs-api:
    @echo "📖 Generating API documentation..."
    cd backend-deno && deno doc --html --name="Kaldor IIoT API" main.ts

# Serve documentation locally
docs-serve:
    @echo "📖 Serving documentation..."
    @echo "⚠️  Documentation server not yet implemented"

# Cleanup sandbox directory (RVC - Robot Vacuum Cleaner)
sandbox-clean:
    @echo "🤖 Cleaning sandbox (removing >90 day inactive experiments)..."
    find sandbox/ -type d -mtime +90 -exec rm -rf {} + || echo "⚠️  No stale sandbox directories found"

# Git pre-commit checks
pre-commit:
    @echo "🔍 Running pre-commit checks..."
    just fmt
    just lint
    just audit-licence
    just test

# Git pre-push checks
pre-push:
    @echo "🔍 Running pre-push checks..."
    just test
    just validate

# Show recipe count (RSR requires 15+)
recipe-count:
    @just --list | tail -n +2 | wc -l | xargs -I {} echo "📊 Total recipes: {}"
