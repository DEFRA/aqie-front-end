import { describe, it, expect, vi, beforeEach } from 'vitest' // '' Vitest API
import { Server } from '@hapi/hapi' // '' Hapi server
import { routes } from './routes.js' // '' Routes to test
import { healthEffectsController } from './controller.js' // '' Controller

vi.mock('./controller.js', () => ({
  healthEffectsController: {
    handler: vi.fn((req, h) => h.response('ok').code(200)) // '' Mock handler
  }
}))

describe("'' Health Effects Routes", () => {
  let server

  beforeEach(async () => {
    server = new Server({ port: 0 }) // '' Create Hapi server
    server.route(routes) // '' Register routes
  })

  it("'' should register the /health-effects route", async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/health-effects'
    })

    expect(res.statusCode).toBe(200) // '' Expect success
    expect(res.result).toBe('ok') // '' Expect response body
    expect(healthEffectsController.handler).toHaveBeenCalledTimes(1) // '' Ensure handler is called
  })
})