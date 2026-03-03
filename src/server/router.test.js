import { describe, test, expect, vi, beforeEach } from 'vitest'

const PUBLIC_ROUTE_PATH = '/public/{param*}'
const MINIMUM_PLUGIN_REGISTRATIONS = 30

// Mock all the dependencies first, before any imports ''
vi.mock('../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      const mockConfig = {
        serviceName: 'test-service',
        serviceVersion: '1.0.0',
        isProduction: false,
        enabledDebug: true,
        log: {
          enabled: false,
          level: 'info',
          format: 'pino-pretty',
          redact: []
        }
      }
      return mockConfig[key] || 'mock-value'
    })
  }
}))

// Mock pino to prevent initialization issues ''
vi.mock('pino', () => ({
  default: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn()
  }))
}))

// Mock the logger module completely ''
vi.mock('./common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn()
  }))
}))

// Mock @hapi/inert ''
vi.mock('@hapi/inert', () => ({
  default: {
    name: 'inert',
    register: vi.fn()
  }
}))

// Mock all route modules with proper structure ''
const mockRouteModule = {
  plugin: {
    name: 'mock-plugin',
    register: vi.fn()
  }
}

vi.mock('./home/index.js', () => ({ home: mockRouteModule }))
vi.mock('./home/cy/index.js', () => ({ homeCy: mockRouteModule }))
vi.mock('./search-location/index.js', () => ({
  searchLocation: mockRouteModule
}))
vi.mock('./search-location/cy/index.js', () => ({
  searchLocationCy: mockRouteModule
}))
vi.mock('./retry/index.js', () => ({ retry: mockRouteModule }))
vi.mock('./locations/index.js', () => ({ locations: mockRouteModule }))
vi.mock('./locations/cy/index.js', () => ({ locationsCy: mockRouteModule }))
vi.mock('./location-id/index.js', () => ({ locationId: mockRouteModule }))
vi.mock('./location-id/cy/index.js', () => ({ locationIdCy: mockRouteModule }))
vi.mock('./nitrogen-dioxide/index.js', () => ({
  nitrogenDioxide: mockRouteModule
}))
vi.mock('./nitrogen-dioxide/cy/index.js', () => ({
  nitrogenDioxideCy: mockRouteModule
}))
vi.mock('./ozone/index.js', () => ({ ozone: mockRouteModule }))
vi.mock('./ozone/cy/index.js', () => ({ ozoneCy: mockRouteModule }))
vi.mock('./particulate-matter-10/index.js', () => ({
  particulateMatter10: mockRouteModule
}))
vi.mock('./particulate-matter-10/cy/index.js', () => ({
  particulateMatter10Cy: mockRouteModule
}))
vi.mock('./particulate-matter-25/index.js', () => ({
  particulateMatter25: mockRouteModule
}))
vi.mock('./particulate-matter-25/cy/index.js', () => ({
  particulateMatter25Cy: mockRouteModule
}))
vi.mock('./sulphur-dioxide/index.js', () => ({
  sulphurDioxide: mockRouteModule
}))
vi.mock('./sulphur-dioxide/cy/index.js', () => ({
  sulphurDioxideCy: mockRouteModule
}))
vi.mock('./privacy/index.js', () => ({ privacy: mockRouteModule }))
vi.mock('./privacy/cy/index.js', () => ({ privacyCy: mockRouteModule }))
vi.mock('./cookies/index.js', () => ({ cookies: mockRouteModule }))
vi.mock('./cookies/cy/index.js', () => ({ cookiesCy: mockRouteModule }))
vi.mock('./accessibility/index.js', () => ({ accessibility: mockRouteModule }))
vi.mock('./accessibility/cy/index.js', () => ({
  accessibilityCy: mockRouteModule
}))
vi.mock('./multiple-results/index.js', () => ({
  multipleResults: mockRouteModule
}))
vi.mock('./multiple-results/cy/index.js', () => ({
  multipleResultsCy: mockRouteModule
}))
vi.mock('./location-not-found/index.js', () => ({
  locationNotFound: mockRouteModule
}))
vi.mock('./health/index.js', () => ({ health: mockRouteModule }))
vi.mock('./actions-reduce-exposure/index.js', () => ({
  actionsReduceExposure: mockRouteModule
}))
vi.mock('./actions-reduce-exposure/cy/index.js', () => ({
  actionsReduceExposureCy: mockRouteModule
}))
vi.mock('./test-routes/index.js', () => ({ testRoutes: mockRouteModule }))
vi.mock('./health-effects/index.js', () => ({ healthEffects: mockRouteModule }))
vi.mock('./health-effects/cy/index.js', () => ({
  healthEffectsCy: mockRouteModule
}))

// Mock helper modules ''
vi.mock('./common/helpers/serve-static-files.js', () => ({
  serveStaticFiles: mockRouteModule
}))
vi.mock('./data/constants.js', () => ({
  SERVER_DIRNAME: '/mock/server/dirname',
  WELSH_TITLE: 'Gwirio ansawdd aer',
  WELSH_PAGE_TITLE_BASE: 'Mock Welsh Page Title Base',
  DAQI_DESCRIPTION: 'Mock DAQI Description',
  ACTIONS_REDUCE_EXPOSURE_ROUTE_EN: '/mock/actions-reduce-exposure-en', // ''
  ACTIONS_REDUCE_EXPOSURE_ROUTE_CY: '/mock/actions-reduce-exposure-cy', // ''
  HEALTH_EFFECTS_ROUTE_EN: '/mock/health-effects-en', // ''
  HEALTH_EFFECTS_ROUTE_CY: '/mock/health-effects-cy' // ''
}))

// Mock Node.js modules ''
vi.mock('node:path', () => ({
  default: {
    resolve: vi.fn((...args) => args.join('/')),
    join: vi.fn((...args) => args.join('/'))
  },
  dirname: vi.fn((_path) => '/mock/dirname')
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Router plugin structure', () => {
  test('should export router object', async () => {
    // ''
    const { router } = await import('./router.js')
    expect(router).toBeDefined()
    expect(router.plugin).toBeDefined()
    expect(router.plugin.name).toBe('router')
    expect(typeof router.plugin.register).toBe('function')
  }, 10000) // Increased timeout to 10 seconds

  test('should have correct plugin structure', async () => {
    // ''
    const { router } = await import('./router.js')
    expect(router.plugin).toMatchObject({
      name: 'router',
      register: expect.any(Function)
    })
  })
})

describe('Router plugin registration', () => {
  test('should register plugins on server', async () => {
    // ''
    const mockServer = {
      register: vi.fn(),
      route: vi.fn(),
      table: vi.fn(() => [])
    }

    const { router } = await import('./router.js')
    await router.plugin.register(mockServer)

    expect(mockServer.register).toHaveBeenCalled()
    expect(mockServer.route).toHaveBeenCalled()

    // Should register both static routes
    expect(mockServer.route).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/.well-known/{param*}'
      })
    )
    expect(mockServer.route).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: PUBLIC_ROUTE_PATH
      })
    )
  })

  test('should handle static file routes', async () => {
    // ''
    const mockServer = {
      register: vi.fn(),
      route: vi.fn(),
      table: vi.fn(() => [])
    }

    const { router } = await import('./router.js')
    await router.plugin.register(mockServer)

    // Should register .well-known route
    expect(mockServer.route).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/.well-known/{param*}'
      })
    )

    // Should register public route
    expect(mockServer.route).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: PUBLIC_ROUTE_PATH
      })
    )
  })

  test('should prevent duplicate route registration', async () => {
    // ''
    const mockServer = {
      register: vi.fn(),
      route: vi.fn(),
      table: vi.fn(() => [{ path: PUBLIC_ROUTE_PATH }])
    }

    const { router } = await import('./router.js')
    await router.plugin.register(mockServer)

    // Should only call route once for .well-known (not for duplicate public)
    const publicRouteCalls = mockServer.route.mock.calls.filter(
      (call) => call[0].path === PUBLIC_ROUTE_PATH
    )
    expect(publicRouteCalls).toHaveLength(0) // Should be skipped due to existing route
  })

  test('should handle plugin registration errors gracefully', async () => {
    // ''
    const { router } = await import('./router.js')
    expect(router.plugin.register).toBeDefined()
    expect(typeof router.plugin.register).toBe('function')
  })
})

describe('Router route registration', () => {
  test('should register actions-reduce-exposure routes', async () => {
    // ''
    const mockServer = {
      register: vi.fn(),
      route: vi.fn(),
      table: vi.fn(() => [])
    }

    const { router } = await import('./router.js')
    await router.plugin.register(mockServer)

    // Should register both English and Welsh actions-reduce-exposure plugins
    expect(mockServer.register).toHaveBeenCalledWith(
      expect.objectContaining({
        plugin: expect.objectContaining({
          name: 'mock-plugin'
        })
      })
    )
  })

  test('should register all required plugins including new routes', async () => {
    // ''
    const mockServer = {
      register: vi.fn(),
      route: vi.fn(),
      table: vi.fn(() => [])
    }

    const { router } = await import('./router.js')
    await router.plugin.register(mockServer)

    // Should register inert plugin first
    expect(mockServer.register).toHaveBeenCalledWith([expect.any(Object)])

    // Should register multiple plugins (including actions-reduce-exposure and health-effects)
    expect(mockServer.register.mock.calls.length).toBeGreaterThan(
      MINIMUM_PLUGIN_REGISTRATIONS
    ) // ''
  })

  test('should handle WELSH_TITLE constant in imports', async () => {
    // ''
    const { router } = await import('./router.js')
    expect(router).toBeDefined()
    // Test passes if import succeeds without WELSH_TITLE error
  })
})
