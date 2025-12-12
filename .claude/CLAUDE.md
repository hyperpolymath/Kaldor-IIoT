# Project Instructions

## ⚠️ CONVERSION REQUIRED: TypeScript/JavaScript → ReScript

This repository needs FULL conversion from TS/JS to ReScript.

### Policy (RSR)
- **REQUIRED**: ReScript for all code
- **FORBIDDEN**: TypeScript (.ts, .tsx)
- **FORBIDDEN**: JavaScript (.js, .jsx) except generated .res.js
- **EXCEPTION**: WASM for performance-critical computation

### When modifying this codebase:
1. DO NOT add new TS/JS files
2. When touching existing TS/JS, convert to ReScript
3. Create `.res` file with equivalent logic
4. Delete the original TS/JS file
5. Run `rescript build` to generate JS

### DO NOT:
- Add new TypeScript files
- Write raw JavaScript
- Use tsc or TypeScript compiler

See TS_CONVERSION_NEEDED.md for full migration guide.

## Container Policy (RSR)

### Primary Stack
- **Runtime**: nerdctl (not docker)
- **Base Image**: wolfi (cgr.dev/chainguard/wolfi-base)
- **Distroless**: Use distroless variants where possible

### Fallback Stack
- **Runtime**: podman (if nerdctl unavailable)
- **Base Image**: alpine (if wolfi unavailable)

### DO NOT:
- Use `docker` command (use `nerdctl` or `podman`)
- Use Dockerfile (use Containerfile)
- Use debian/ubuntu base images (use wolfi/alpine)

## Language & Security Policy (RSR)

### Allowed Languages (Primary → Fallback)
- **Systems/ML**: Rust
- **Web/Scripts**: ReScript → TypeScript (legacy only)
- **TUI**: Ada/SPARK
- **WordPress**: PHP (with security CI)
- **LSP**: Java (exception for IDE compatibility)

### Banned Languages
- Python (except SaltStack)
- Ruby (use Rust/Ada/Crystal)
- Perl (use Rust)
- New Java/Kotlin (except LSP)

### Package Management
- **Primary**: Guix (guix.scm)
- **Fallback**: Nix (flake.nix)

### Security Requirements
- No MD5/SHA1 for security (use SHA256+)
- HTTPS only (no HTTP URLs)
- No hardcoded secrets
