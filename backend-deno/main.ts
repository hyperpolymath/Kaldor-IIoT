// SPDX-License-Identifier: MIT OR Apache-2.0
// SPDX-FileCopyrightText: 2025 Kaldor Community Manufacturing Platform Contributors

/**
 * Kaldor Community Manufacturing Platform
 * Deno Backend Server
 *
 * A hyperlocal, community-governed textile manufacturing system
 * Supporting Kaldor's Law 2: Productivity growth through manufacturing scale
 *
 * @version 2.0.0
 * @license MIT OR Apache-2.0 (Palimpsest v0.8)
 */

import { Application, Router } from 'oak'
import { oakCors } from 'https://deno.land/x/cors@v1.2.2/mod.ts'
import { load as loadEnv } from 'std/dotenv/mod.ts'
import { PostgresClient } from './services/database.ts'
import { RedisClient } from './services/redis.ts'
import { MQTTService } from './services/mqtt.ts'
import { MatterBridge } from './services/matter.ts'
import { OPCUAServer } from './services/opcua.ts'
import { logger } from './services/logger.ts'
import { authMiddleware } from './middleware/auth.ts'
import { errorHandler } from './middleware/error.ts'
import { rateLimit } from './middleware/rateLimit.ts'

// Import routes
import authRoutes from './routes/auth.ts'
import machineRoutes from './routes/machines.ts'
import jobRoutes from './routes/jobs.ts'
import communityRoutes from './routes/community.ts'
import governanceRoutes from './routes/governance.ts'
import patternRoutes from './routes/patterns.ts'

// Load environment variables
const env = await loadEnv()

// Initialize application
const app = new Application()
const router = new Router()

// WASM module initialization
logger.info('Loading WASM acceleration modules...')
const patternGenWasm = await WebAssembly.instantiateStreaming(
  fetch(new URL('./wasm/pattern_gen.wasm', import.meta.url))
)
const schedulerWasm = await WebAssembly.instantiateStreaming(
  fetch(new URL('./wasm/scheduler.wasm', import.meta.url))
)
logger.info('✓ WASM modules loaded')

// Initialize services
logger.info('Initializing services...')
const db = new PostgresClient(env.DATABASE_URL || 'postgres://kaldor:password@localhost:5432/kaldor')
const redis = new RedisClient(env.REDIS_URL || 'redis://localhost:6379')
const mqtt = new MQTTService(env.MQTT_URL || 'mqtt://localhost:1883')
const matter = new MatterBridge(env.MATTER_PORT || '5540')
const opcua = new OPCUAServer(env.OPCUA_PORT || '4840')

await db.connect()
await redis.connect()
await mqtt.connect()
await matter.start()
await opcua.start()

logger.info('✓ All services connected')

// Global middleware
app.use(oakCors({
  origin: env.CORS_ORIGIN || '*',
  credentials: true,
}))

app.use(errorHandler)
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

// Health check endpoint
router.get('/health', (ctx) => {
  ctx.response.body = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: db.isConnected(),
      redis: redis.isConnected(),
      mqtt: mqtt.isConnected(),
      matter: matter.isRunning(),
      opcua: opcua.isRunning(),
    },
    kaldor_law: 2, // Verdoorn's Law
    version: '2.0.0',
  }
})

// API routes (protected by auth middleware)
router.use('/api/v2/auth', authRoutes.routes())
router.use('/api/v2/machines', authMiddleware, machineRoutes.routes())
router.use('/api/v2/jobs', authMiddleware, jobRoutes.routes())
router.use('/api/v2/community', authMiddleware, communityRoutes.routes())
router.use('/api/v2/governance', authMiddleware, governanceRoutes.routes())
router.use('/api/v2/patterns', authMiddleware, patternRoutes.routes())

// WASM endpoints for compute-intensive operations
router.post('/api/v2/wasm/pattern-gen', authMiddleware, async (ctx) => {
  const { warp, weft, pattern_type } = await ctx.request.body({ type: 'json' }).value

  // Call WASM module for fast pattern generation
  const result = patternGenWasm.instance.exports.generate_pattern(warp, weft, pattern_type)

  ctx.response.body = {
    pattern: result,
    computed_by: 'wasm',
    performance: 'optimized',
  }
})

router.post('/api/v2/wasm/schedule', authMiddleware, async (ctx) => {
  const jobs = await ctx.request.body({ type: 'json' }).value

  // Use WASM scheduler for optimal job allocation
  const schedule = schedulerWasm.instance.exports.optimize_schedule(jobs)

  ctx.response.body = {
    schedule,
    algorithm: 'wasm-genetic-algorithm',
    optimized_for: 'kaldors-law-productivity',
  }
})

// Matter device endpoints
router.get('/api/v2/matter/devices', authMiddleware, (ctx) => {
  ctx.response.body = matter.getDevices()
})

router.post('/api/v2/matter/commission', authMiddleware, async (ctx) => {
  const { deviceCode } = await ctx.request.body({ type: 'json' }).value
  const result = await matter.commissionDevice(deviceCode)
  ctx.response.body = result
})

// OPC UA endpoint information
router.get('/api/v2/opcua/info', (ctx) => {
  ctx.response.body = {
    endpoint: `opc.tcp://${Deno.hostname()}:${env.OPCUA_PORT || 4840}`,
    namespace: 'http://kaldor.community/manufacturing/',
    security_mode: 'SignAndEncrypt',
    authentication: 'UserNamePassword',
  }
})

// Apply routes
app.use(router.routes())
app.use(router.allowedMethods())

// WebSocket for real-time updates
app.addEventListener('listen', ({ hostname, port, secure }) => {
  const protocol = secure ? 'https' : 'http'
  logger.info(`
╔═══════════════════════════════════════════════════════════╗
║  Kaldor Community Manufacturing Platform v2.0             ║
║                                                           ║
║  Backend: Deno ${Deno.version.deno}                      ║
║  Runtime: WASM-accelerated, RISC-V ready                 ║
║  License: MIT OR Apache-2.0 (Palimpsest v0.8)            ║
╚═══════════════════════════════════════════════════════════╝

Server running at: ${protocol}://${hostname}:${port}

Services:
  ✓ PostgreSQL + TimescaleDB
  ✓ Redis cache
  ✓ MQTT broker
  ✓ Matter protocol bridge
  ✓ OPC UA server (port ${env.OPCUA_PORT || 4840})

API Documentation: ${protocol}://${hostname}:${port}/api-docs

Kaldor's Law 2: "The rate of growth in productivity is positively
related to the rate of growth of manufacturing output."

Press Ctrl+C to stop
  `)
})

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...')

  await mqtt.disconnect()
  await matter.stop()
  await opcua.stop()
  await redis.disconnect()
  await db.disconnect()

  logger.info('All services stopped')
  Deno.exit(0)
}

Deno.addSignalListener('SIGINT', shutdown)
Deno.addSignalListener('SIGTERM', shutdown)

// Start server
const port = parseInt(env.PORT || '8000')
await app.listen({ port })
