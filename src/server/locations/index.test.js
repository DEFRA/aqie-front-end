import { configureRoutes, locations } from './index'

describe('configureRoutes', () => {
  it('should configure routes with injected dependencies', () => {
    const mockServer = { route: vi.fn() }
    const mockMiddleware = vi.fn()
    const mockController = { handler: vi.fn() }

    configureRoutes(mockServer, {
      middleware: mockMiddleware,
      controller: mockController
    })

    expect(mockServer.route).toHaveBeenCalledWith([
      {
        method: ['GET', 'POST'],
        path: '/location',
        options: {
          pre: [{ method: mockMiddleware, assign: 'location' }]
        },
        ...mockController
      }
    ])
  })

  it('should use default dependencies if none are provided', () => {
    const mockServer = { route: vi.fn() }

    configureRoutes(mockServer)

    expect(mockServer.route).toHaveBeenCalled()
  })
})

describe('locations plugin', () => {
  it('should register routes with the server', async () => {
    const mockServer = { route: vi.fn() }
    const mockDependencies = {
      middleware: vi.fn(),
      controller: { handler: vi.fn() }
    }

    await locations.plugin.register(mockServer, {
      dependencies: mockDependencies
    })

    expect(mockServer.route).toHaveBeenCalledWith([
      {
        method: ['GET', 'POST'],
        path: '/location',
        options: {
          pre: [{ method: mockDependencies.middleware, assign: 'location' }]
        },
        ...mockDependencies.controller
      }
    ])
  })

  it('should use default dependencies if none are provided', async () => {
    const mockServer = { route: vi.fn() }

    await locations.plugin.register(mockServer, {})

    expect(mockServer.route).toHaveBeenCalled()
  })
})
