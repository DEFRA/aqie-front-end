import { vi } from 'vitest'
import { locationNotFoundCy } from './index.js'

// Replace the controller import with the mock
vi.mock('./controller.js', () => ({
  locationNotFoundController: {
    handler: vi.fn()
  }
}))

describe('location-not-found index plugin - cy', () => {
  let server

  beforeEach(() => {
    server = {
      route: vi.fn()
    }
  })

  it('should register location-not-found route', async () => {
    await locationNotFoundCy.plugin.register(server)

    const expectedRoute = [
      {
        method: 'GET',
        path: '/lleoliad-heb-ei-ganfod/cy',
        handler: expect.any(Function)
      }
    ]

    expect(server.route).toHaveBeenCalledWith(expectedRoute)
  })
})
