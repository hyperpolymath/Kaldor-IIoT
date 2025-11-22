# Kaldor Community Manufacturing Platform - System Architecture v2.0

**Hyperlocal, Community-Owned Textile Manufacturing Ecosystem**

## Vision

Transform spare rooms into a distributed, community-governed manufacturing network for sustainable, local textile production (spinning, weaving, 3D printing) based on Kaldor's Law 2: "The rate of growth in productivity is positively related to the rate of growth of manufacturing output."

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     COMMUNITY GOVERNANCE LAYER                           │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐ │
│  │  CURP Consensus  │  │  Community Vote  │  │  Resource Allocation │ │
│  │  Protocol        │  │  Interface       │  │  & Scheduling        │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ WASM-accelerated Decision Engine
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                                 │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Deno Runtime Backend (Fresh Framework)                        │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────────────┐ │    │
│  │  │  REST API    │ │  WebSocket   │ │  WASM Compute Modules  │ │    │
│  │  │  (Oak)       │ │  (ws)        │ │  (Rust→WASM)           │ │    │
│  │  └──────────────┘ └──────────────┘ └────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  ReScript Frontend (Production Planner)                        │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────────────┐ │    │
│  │  │  Dashboard   │ │  Job Queue   │ │  Community Interface   │ │    │
│  │  │  (ReScriptRe │ │  Manager     │ │  (Voting/Governance)   │ │    │
│  │  │   act)       │ │              │ │                        │ │    │
│  │  └──────────────┘ └──────────────┘ └────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ Matter Protocol + MQTT
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    INDUSTRIAL INTEROPERABILITY                           │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   OPC UA     │  │   Modbus     │  │   Matter     │                 │
│  │   Gateway    │  │   TCP/RTU    │  │   Thread     │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  SCADA/DCS Integration Layer                                     │  │
│  │  - Ignition SCADA compatibility                                  │  │
│  │  - Wonderware System Platform                                    │  │
│  │  - Siemens WinCC                                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ Matter/Thread/Zigbee
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      EDGE DEVICES (RISC-V/ARM)                          │
│                                                                          │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────┐ │
│  │  Spinning Station  │  │  Weaving Loom      │  │  3D Print Unit   │ │
│  │  ────────────────  │  │  ─────────────     │  │  ──────────────  │ │
│  │  • ESP32-C6        │  │  • ESP32-C6        │  │  • ESP32-C6      │ │
│  │    (RISC-V)        │  │    (RISC-V)        │  │    (RISC-V)      │ │
│  │  • Matter/Thread   │  │  • Matter/Thread   │  │  • Matter/Thread │ │
│  │  • Servo Control   │  │  • Stepper Motors  │  │  • Klipper FW    │ │
│  │  • Tension Sensors │  │  • Warp/Weft BBW   │  │  • 3D Weaving    │ │
│  │  • WASM Runtime    │  │  • WASM Runtime    │  │  • WASM Runtime  │ │
│  └────────────────────┘  └────────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend Runtime
- **Deno 1.40+** - Secure TypeScript runtime
- **Fresh Framework** - Edge-first web framework
- **Oak** - Middleware framework for HTTP
- **DenoKV** - Built-in key-value store
- **Supabase Deno Client** - PostgreSQL with Deno

### Frontend
- **ReScript 11+** - Type-safe, functional language compiling to JavaScript
- **ReScript React** - Type-safe React bindings
- **RescriptRelay** - GraphQL client
- **TailwindCSS** - Utility-first CSS

### WASM Acceleration
- **Rust → WASM** - Performance-critical modules
  - Textile pattern generation
  - Production scheduling algorithms
  - Real-time machine learning for quality control
  - Consensus protocol implementation (CURP)
- **AssemblyScript** - TypeScript → WASM for web workers

### Database
- **TimescaleDB** - Time-series (unchanged, works with Deno)
- **PostgreSQL 15+** - Primary database
- **DenoKV** - Local caching and state
- **Supabase** - Database hosting + real-time subscriptions

### Edge Devices (RISC-V First)
- **ESP32-C6** - RISC-V + WiFi 6 + Thread/Zigbee
- **ESP32-C3** - RISC-V + WiFi 4 (budget option)
- **SiFive HiFive1** - RISC-V development board
- **Kendryte K210** - RISC-V with AI acceleration
- **WCH CH32V** - Low-cost RISC-V alternative

### Firmware
- **ESP-IDF** - Official Espressif framework (RISC-V support)
- **Zephyr RTOS** - Open-source RTOS with RISC-V support
- **WASM3** - WebAssembly runtime for embedded devices
- **Matter SDK** - Official Matter protocol implementation

### Industrial Protocols
- **OPC UA** - Unified Architecture for industrial automation
- **Modbus TCP/RTU** - Legacy SCADA integration
- **Matter** - Smart home/industrial IoT standard
- **Thread** - IPv6-based mesh networking
- **Zigbee** - Low-power mesh (via Matter bridge)

### Consensus & Governance
- **CURP** - Consistent Unordered Replication Protocol
- **Raft** - Consensus algorithm (fallback)
- **Quadratic Voting** - Community decision weighting
- **Time-locked contracts** - Scheduled governance actions

## Hyperlocal Manufacturing Topology

### Space Requirements Per Node

**Micro Node (1 spare room ~3m x 3m)**
- 1x Spinning station (1.5m²)
- 1x Small loom OR 1x 3D printer (1.5m²)
- Storage: 2m²
- Operator space: 3m²
- Total: ~8m² (one spare bedroom)

**Small Node (2 spare rooms)**
- Full spin + weave + print capability
- Distributed across 2 rooms or 1 larger space
- Can operate independently

**Community Hub (3+ spare rooms or small commercial)**
- Multiple machines of each type
- Training center
- Material storage
- Finishing/distribution center

### Network Topology

```
┌─────────────────────────────────────────────────┐
│         Community Manufacturing Network          │
│                                                  │
│  House A          House B          House C       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Spinning │───▶│ Weaving  │───▶│ Printing │  │
│  └──────────┘    └──────────┘    └──────────┘  │
│       │               │               │          │
│       └───────────────┴───────────────┘          │
│                      │                           │
│                      ▼                           │
│            ┌──────────────────┐                 │
│            │  Community Hub   │                 │
│            │  (Finishing &    │                 │
│            │   Distribution)  │                 │
│            └──────────────────┘                 │
└─────────────────────────────────────────────────┘
```

## File Type Schema for Instructables

### Production Files (.kaldor format family)

```
.ksp  - Kaldor Spin Pattern
.kwp  - Kaldor Weave Pattern
.k3p  - Kaldor 3D Print Pattern
.kjob - Kaldor Job Specification (multi-stage)
.kmat - Kaldor Material Specification
```

Each file is a JSON/TOML hybrid with embedded metadata:

```toml
# Example: sample-shirt.kjob
[metadata]
name = "Community Linen Shirt"
version = "1.0.0"
author = "Local Design Collective"
license = "CC-BY-SA-4.0"
kaldor_law = 2  # References Kaldor's Second Law

[materials]
fiber = "organic-flax"
weight = 250  # grams
source = "local-farm-coop"

[stages]
  [stages.spin]
  file = "flax-yarn-medium.ksp"
  machine_type = "electric-spinner-v2"
  time_estimate = 120  # minutes
  skill_level = "intermediate"

  [stages.weave]
  file = "plain-weave-linen.kwp"
  machine_type = "table-loom-4shaft"
  time_estimate = 480  # minutes
  skill_level = "intermediate"

  [stages.cut]
  pattern = "shirt-size-M.svg"
  method = "laser-cutter"  # or "manual-scissors"

  [stages.sew]
  instructions = "assembly-guide.md"
  skill_level = "beginner"

[economics]
material_cost = 12.50  # GBP
labor_hours = 10
suggested_price = 65.00
community_share = 0.15  # 15% to commons fund
```

### Interoperability Standards

All `.kaldor` files are:
1. **Human-readable** (TOML/JSON)
2. **Version controlled** (Git-friendly)
3. **Forkable** (Creative Commons licensed)
4. **Composable** (stages can be mixed/matched)
5. **Economically transparent** (costs/pricing included)

## Matter Protocol Integration

### Why Matter?

1. **Open Standard** - Industry-backed, royalty-free
2. **Secure** - Built-in encryption, authentication
3. **IPv6 Native** - Modern networking
4. **Multi-admin** - Community governance friendly
5. **Thread/WiFi Bridge** - Flexible topology
6. **RISC-V Support** - ESP32-C6 has native Matter support

### Matter Device Types for Manufacturing

```
Matter Cluster          Kaldor Application
─────────────────       ──────────────────
On/Off                  Machine power control
Level Control           Motor speed, tension
Temperature             Ambient monitoring
Flow Measurement        Material throughput
Occupancy Sensing       Operator presence
Power Source            Battery/mains status
```

### Custom Matter Clusters

We'll define custom clusters for:
- **Textile Production** (cluster ID: 0xKALD0001)
- **Community Governance** (cluster ID: 0xKALD0002)
- **Job Scheduling** (cluster ID: 0xKALD0003)

## SCADA/DCS Interoperability

### OPC UA Integration

Kaldor nodes expose OPC UA server:

```
Server: opc.tcp://node-001.local:4840
Namespace: http://kaldor.community/manufacturing/

Objects/
├── Machines/
│   ├── Spinner-001/
│   │   ├── Status (Boolean)
│   │   ├── Speed (UInt16, RPM)
│   │   ├── Tension (Float, Newtons)
│   │   └── Output (Float, meters/hour)
│   ├── Loom-001/
│   │   ├── Status
│   │   ├── WarpTension
│   │   ├── WeftDensity
│   │   └── FabricLength
│   └── Printer-001/
│       ├── Status
│       ├── PrintProgress (%)
│       ├── Temperature
│       └── MaterialRemaining
├── Jobs/
│   ├── QueueLength
│   ├── ActiveJobs
│   └── CompletedToday
└── Community/
    ├── ActiveMembers
    ├── PendingVotes
    └── CommonsFund
```

### Modbus RTU/TCP Support

For legacy equipment integration:

```
Holding Registers (Function Code 03)
─────────────────────────────────────
Address    Description           Units
───────    ───────────────────  ─────
0-9        Reserved
10         Machine Status        Enum
11         Motor Speed           RPM
12         Tension Sensor        0-1023
13-14      Production Counter    meters (32-bit)
15         Error Code            Enum
20-29      Community metrics
30-39      Job queue status
```

## RISC-V Architecture Support

### Why RISC-V?

1. **Open Source** - No licensing fees, fully auditable
2. **Customizable** - Add custom instructions for textile operations
3. **Security** - PMP (Physical Memory Protection), formal verification
4. **Emerging Ecosystem** - ESP32-C6, StarFive, SiFive
5. **Educational** - Universities can teach on actual hardware
6. **Future-proof** - Not controlled by single vendor

### Supported RISC-V Boards

| Board | ISA | Clock | RAM | WiFi | Matter | Cost |
|-------|-----|-------|-----|------|--------|------|
| ESP32-C6 | RV32IMAC | 160MHz | 512KB | WiFi 6 | ✅ | £5 |
| ESP32-C3 | RV32IMC | 160MHz | 400KB | WiFi 4 | ⚠️ | £3 |
| SiFive HiFive1 | RV32IMAC | 320MHz | 16KB | ❌ | ❌ | £60 |
| Kendryte K210 | RV64GC (dual) | 400MHz | 8MB | ❌ | ❌ | £15 |

**Recommended**: ESP32-C6 (best balance of features, cost, Matter support)

### WASM on RISC-V

We use **WASM3** interpreter:
- ~65KB code size
- Runs on 64KB+ RAM
- Near-native performance for compute
- Portable across RISC-V variants

Example: Pattern generation in Rust→WASM running on ESP32-C6:

```rust
// Compiled to WASM, runs on RISC-V
#[no_mangle]
pub extern "C" fn generate_weave_pattern(
    warp: u16,
    weft: u16,
    pattern_type: u8
) -> *const u8 {
    // Complex pattern generation
    // Runs 10x faster than interpreted Python
    // ...
}
```

## Kaldor's Law Integration

### Kaldor's Second Law (Verdoorn's Law)

> "The rate of growth in productivity is positively related to the rate of growth of manufacturing output."

**Application to Hyperlocal Manufacturing:**

1. **Increasing Returns to Scale**
   - As community adds more nodes, overhead decreases
   - Shared knowledge base improves productivity
   - Specialized nodes emerge (expert spinners, weavers)

2. **Learning-by-Doing**
   - Platform tracks productivity metrics
   - Identifies bottlenecks automatically
   - Suggests process improvements via ML

3. **Measurement Integration**
   ```sql
   -- Kaldor's Law Dashboard Query
   SELECT
     time_bucket('1 month', produced_at) as month,
     SUM(output_units) as total_output,
     SUM(output_units) / SUM(labor_hours) as productivity,
     LAG(SUM(output_units) / SUM(labor_hours)) OVER (ORDER BY time_bucket('1 month', produced_at)) as prev_productivity,
     ((SUM(output_units) / SUM(labor_hours)) - LAG(SUM(output_units) / SUM(labor_hours)) OVER (ORDER BY time_bucket('1 month', produced_at))) /
       LAG(SUM(output_units) / SUM(labor_hours)) OVER (ORDER BY time_bucket('1 month', produced_at)) as productivity_growth
   FROM production_records
   GROUP BY month
   ```

4. **Feedback Loop**
   - Increased output → More data → Better ML models → Higher productivity → Increased output

## Next Steps

See implementation in:
- `backend-deno/` - Deno backend rewrite
- `frontend-rescript/` - ReScript frontend
- `wasm-modules/` - Rust WASM acceleration
- `firmware-riscv/` - RISC-V firmware for ESP32-C6
- `docs/white-paper/` - Business case and economic analysis
- `docs/wiki/` - Comprehensive community documentation
- `docs/3d-weave-spec/` - 3D weaving technology specification

---

**Version**: 2.0.0
**License**: AGPL-3.0 (software) + CC-BY-SA-4.0 (documentation)
**Last Updated**: 2025-11-22
