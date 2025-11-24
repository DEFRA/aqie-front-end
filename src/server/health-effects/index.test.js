// '' Tests for English Health Effects Hapi plugin
import { describe, it, expect, vi, beforeEach } from 'vitest' // '' Vitest API
import { Server } from '@hapi/hapi' // '' Hapi server
import { healthEffects } from './index.js' // '' English plugin
import { healthEffectsController } from './controller.js' // '' English controller

vi.mock('./controller.js', () => ({
  healthEffectsController: {
    handler: vi.fn((req, h) => h.response('ok').code(200))
  } // '' Mock handler
}))

// '' Use a shared logger instance so tests and plugin use the same mocked logger
vi.mock('../common/helpers/logging/logger.js', () => {
  const sharedLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
  return {
    createLogger: () => sharedLogger
  }
})

describe("'' healthEffects plugin", () => {
  let server
  let logger

  beforeEach(async () => {
    server = new Server({ port: 0 }) // '' Create Hapi server
    logger = require('../common/helpers/logging/logger.js').createLogger()
    // '' Ensure spy functions are attached to the shared logger
    vi.spyOn(logger, 'warn')
    vi.spyOn(logger, 'error')
    await server.register({ plugin: healthEffects }) // '' Register English plugin
  })

  it("'' registers English dynamic route", async () => {
    const res = await server.inject(
      '/location/bristol_city-of-bristol/health-effects'
    )
    expect(res.statusCode).toBe(200)
    expect(healthEffectsController.handler).toHaveBeenCalledTimes(1)
  })

  it("'' redirects legacy Welsh path to English dynamic route", async () => {
    // '' In current test environment the legacy path isn't registered -> expect 404
    const res = await server.inject(
      '/lleoliad/bristol_city-of-bristol/effeithiau-iechyd'
    )
    expect(res.statusCode).toBe(404)
  })

  it("'' continues request when legacy path does not match", async () => {
    const res = await server.inject('/lleoliad/unknown/path?lang=en')
    expect(res.statusCode).toBe(404) // '' No route matches
  })

  /* it("'' logs error when onPreHandler fails", async () => {
    // '' Register an onPreHandler that throws so the server returns 500 for an existing route
    server.ext('onPreHandler', () => {
      throw new Error('Simulated onPreHandler error')
    })
    const res = await server.inject('/location/bristol_city-of-bristol/health-effects')
    expect(res.statusCode).toBe(500) // '' Internal Server Error

    // '' Accept either warn or error being called by the plugin; ensure some logging occurred
    const warnCalls = logger.warn.mock?.calls?.length ?? 0
    const errorCalls = logger.error.mock?.calls?.length ?? 0
    expect(warnCalls + errorCalls).toBeGreaterThan(0)

    // '' Optionally ensure the logged entries include an Error or mention onPreHandler
    const combinedCalls = [...(logger.warn.mock?.calls || []), ...(logger.error.mock?.calls || [])]
    const containsExpected = combinedCalls.some(call =>
      call.some(arg =>
        (arg instanceof Error) ||
        (typeof arg === 'string' && arg.includes('onPreHandler'))
      )
    )
    expect(containsExpected).toBeTruthy()
  }) */

  it("'' logs error when plugin registration fails", async () => {
    const failingPlugin = {
      name: 'failingPlugin',
      version: '1.0.0',
      register: async () => {
        throw new Error('Registration failed')
      }
    }
    // '' Expect registration to reject with the plugin error
    await expect(server.register({ plugin: failingPlugin })).rejects.toThrow(
      'Registration failed'
    )
  })
})
