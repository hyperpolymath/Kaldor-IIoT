# Kaldor-IIoT - Nix Development Tasks
set shell := ["bash", "-uc"]
set dotenv-load := true

project := "Kaldor-IIoT"

# Show all recipes
default:
    @just --list --unsorted

# Build with nix
build:
    nix build

# Build and show output path
build-show:
    nix build --print-out-paths

# Enter dev shell
develop:
    nix develop

# Check flake
check:
    nix flake check

# Update flake inputs
update:
    nix flake update

# Show flake info
info:
    nix flake info

# Format nix files
fmt:
    nixfmt *.nix || nix fmt

# Run nix linter
lint:
    statix check . || true

# Clean
clean:
    rm -rf result

# Show derivation
show-drv:
    nix derivation show

# All checks before commit
pre-commit: check
    @echo "All checks passed!"
