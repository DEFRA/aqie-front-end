import { configureRoutes, locations } from './index'

describe('configureRoutes', () => {
  it('should configure routes with injected dependencies', () => {
    const mockServer = { route: jest.fn() }
    const mockMiddleware = jest.fn()
    const mockController = { handler: jest.fn() }

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
    const mockServer = { route: jest.fn() }

    configureRoutes(mockServer)

    expect(mockServer.route).toHaveBeenCalled()
  })
})

describe('locations plugin', () => {
  it('should register routes with the server', async () => {
    const mockServer = { route: jest.fn() }
    const mockDependencies = {
      middleware: jest.fn(),
      controller: { handler: jest.fn() }
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
    const mockServer = { route: jest.fn() }

    await locations.plugin.register(mockServer, {})

    expect(mockServer.route).toHaveBeenCalled()
  })
})
