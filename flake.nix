{
  description = "Kaldor Community Manufacturing Platform - Hyperlocal textile production";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, rust-overlay }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };

        rust = pkgs.rust-bin.stable.latest.default.override {
          extensions = [ "rust-src" "rust-analyzer" ];
          targets = [ "wasm32-unknown-unknown" "riscv32imc-unknown-none-elf" ];
        };

      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Deno runtime
            deno

            # Rust toolchain
            rust
            cargo-watch
            cargo-edit
            wasm-pack
            wasm-bindgen-cli

            # ReScript / Node.js
            nodejs_20
            nodePackages.npm

            # ESP-IDF for RISC-V firmware
            esp-idf
            gcc-riscv64-embedded

            # Database
            postgresql_15
            timescaledb
            redis

            # MQTT
            mosquitto

            # Build tools
            just
            git
            gnumake
            cmake
            pkg-config

            # Security tools
            gnupg
            age
            sops

            # Testing
            playwright

            # Documentation
            mdbook
            graphviz

            # OPC UA / SCADA tools
            open62541

            # Nix flake utilities
            nil
            nixpkgs-fmt

            # Performance profiling
            valgrind
            heaptrack

            # Container tools
            docker-compose
            podman
          ];

          shellHook = ''
            echo "╔═══════════════════════════════════════════════════════════╗"
            echo "║  Kaldor Community Manufacturing Platform                 ║"
            echo "║  Development Environment v2.0                             ║"
            echo "╚═══════════════════════════════════════════════════════════╝"
            echo ""
            echo "Available tools:"
            echo "  ✓ Deno $(deno --version | head -1)"
            echo "  ✓ Rust $(rustc --version)"
            echo "  ✓ Node.js $(node --version)"
            echo "  ✓ PostgreSQL $(postgres --version | cut -d' ' -f3)"
            echo "  ✓ Redis $(redis-server --version)"
            echo ""
            echo "Quick commands:"
            echo "  deno task dev         - Start Deno backend"
            echo "  npm start             - Start ReScript frontend"
            echo "  cargo build --release - Build WASM modules"
            echo "  idf.py build          - Build RISC-V firmware"
            echo "  just validate         - Run RSR compliance checks"
            echo ""
            echo "Documentation:"
            echo "  • README.md           - Getting started"
            echo "  • ARCHITECTURE-v2.md  - System design"
            echo "  • CONTRIBUTING.md     - How to contribute"
            echo "  • RSR_COMPLIANCE.md   - RSR status"
            echo ""

            # Set up environment variables
            export DENO_DIR="$PWD/.deno"
            export CARGO_HOME="$PWD/.cargo"
            export NODE_ENV="development"
            export RUST_BACKTRACE=1

            # Create necessary directories
            mkdir -p logs data/postgres data/redis

            # Check for .env file
            if [ ! -f .env ]; then
              echo "⚠️  No .env file found. Creating from template..."
              cp .env.example .env
              echo "✓ Created .env - please review and configure"
            fi

            # Initialize git hooks
            if [ -d .git ] && [ ! -f .git/hooks/pre-commit ]; then
              echo "⚠️  Setting up git hooks..."
              just install-hooks
            fi

            echo "Ready to develop! 🚀"
          '';

          # Environment variables
          POSTGRES_HOST = "localhost";
          POSTGRES_PORT = "5432";
          POSTGRES_DB = "kaldor_dev";
          REDIS_HOST = "localhost";
          REDIS_PORT = "6379";
          MQTT_BROKER = "localhost:1883";

          # RISC-V toolchain
          IDF_PATH = "${pkgs.esp-idf}";

          # Rust WASM target
          CARGO_BUILD_TARGET = "wasm32-unknown-unknown";
        };

        # Reproducible build packages
        packages = {
          # Deno backend
          backend = pkgs.stdenv.mkDerivation {
            pname = "kaldor-backend";
            version = "2.0.0";
            src = ./backend-deno;

            buildInputs = [ pkgs.deno ];

            buildPhase = ''
              deno cache main.ts
            '';

            installPhase = ''
              mkdir -p $out/bin
              cp -r . $out/
              echo '#!/bin/sh' > $out/bin/kaldor-backend
              echo "cd $out && ${pkgs.deno}/bin/deno run --allow-all main.ts" >> $out/bin/kaldor-backend
              chmod +x $out/bin/kaldor-backend
            '';
          };

          # ReScript frontend
          frontend = pkgs.buildNpmPackage {
            pname = "kaldor-frontend";
            version = "2.0.0";
            src = ./frontend-rescript;

            npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="; # Update after first build

            buildPhase = ''
              npm run build
            '';

            installPhase = ''
              mkdir -p $out
              cp -r dist/* $out/
            '';
          };

          # WASM modules
          wasm-modules = pkgs.rustPlatform.buildRustPackage {
            pname = "kaldor-wasm";
            version = "2.0.0";
            src = ./wasm-modules;

            cargoLock = {
              lockFile = ./wasm-modules/Cargo.lock;
            };

            nativeBuildInputs = [ pkgs.wasm-pack ];

            buildPhase = ''
              cargo build --release --target wasm32-unknown-unknown
              wasm-pack build --target web
            '';

            installPhase = ''
              mkdir -p $out
              cp -r pkg/* $out/
            '';
          };

          # Complete system (Docker image)
          docker = pkgs.dockerTools.buildLayeredImage {
            name = "kaldor-platform";
            tag = "2.0.0";

            contents = with pkgs; [
              self.packages.${system}.backend
              self.packages.${system}.frontend
              postgresql_15
              redis
              mosquitto
              timescaledb
            ];

            config = {
              Cmd = [ "${self.packages.${system}.backend}/bin/kaldor-backend" ];
              ExposedPorts = {
                "8000/tcp" = {};
                "5432/tcp" = {};
                "6379/tcp" = {};
                "1883/tcp" = {};
              };
              Env = [
                "NODE_ENV=production"
                "PORT=8000"
              ];
            };
          };
        };

        # CI/CD checks
        checks = {
          # Deno tests
          backend-tests = pkgs.runCommand "backend-tests" {
            buildInputs = [ pkgs.deno ];
          } ''
            cd ${./backend-deno}
            deno test --allow-all
            touch $out
          '';

          # Rust tests
          wasm-tests = pkgs.rustPlatform.buildRustPackage {
            pname = "kaldor-wasm-tests";
            version = "2.0.0";
            src = ./wasm-modules;

            cargoLock = {
              lockFile = ./wasm-modules/Cargo.lock;
            };

            checkPhase = ''
              cargo test --all-features
            '';
          };

          # RSR compliance
          rsr-compliance = pkgs.runCommand "rsr-compliance" {
            buildInputs = [ pkgs.just ];
          } ''
            cd ${./.}
            just validate-rsr
            touch $out
          '';

          # License compliance
          license-check = pkgs.runCommand "license-check" {
            buildInputs = [ pkgs.reuse ];
          } ''
            cd ${./.}
            reuse lint
            touch $out
          '';
        };

        # Formatter
        formatter = pkgs.nixpkgs-fmt;

        # Apps (runnable)
        apps = {
          backend = flake-utils.lib.mkApp {
            drv = self.packages.${system}.backend;
          };
        };
      }
    );
}
