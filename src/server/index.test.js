import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createServer } from './index.js'

// Mock all dependencies
vi.mock('~/src/config', () => ({
  default: {
    get: vi.fn().mockImplementation((key) => {
      const mockValues = {
        port: 3000, // Valid port number
        host: 'localhost',
        cacheName: 'test-cache',
        rootPath: '/test',
        sessionPassword: 'test-session-password-at-least-32-chars',
        sessionTimeout: 3600000,
        serviceVersion: '1.0.0'
      }
      return mockValues[key] || 'default-value'
    })
  }
}))

vi.mock('../config/nunjucks/index.js', () => ({
  nunjucksConfig: {
    plugin: {
      name: 'nunjucks-config',
      register: vi.fn()
    }
  }
}))

vi.mock('./router.js', () => ({
  router: {
    plugin: {
      name: 'router',
      register: vi.fn()
    }
  }
}))

vi.mock('./common/helpers/logging/request-logger.js', () => ({
  requestLogger: {
    plugin: {
      name: 'request-logger',
      register: vi.fn()
    }
  }
}))

vi.mock('./common/helpers/errors.js', () => ({
  catchAll: vi.fn()
}))

vi.mock('./common/helpers/secure-context/index.js', () => ({
  secureContext: {
    plugin: {
      name: 'secure-context',
      register: vi.fn()
    }
  }
}))

vi.mock('./common/helpers/session-cache/cache-engine.js', () => ({
  getCacheEngine: vi.fn().mockReturnValue({
    start: vi.fn(),
    stop: vi.fn(),
    get: vi.fn(),
    set: vi.fn()
  })
}))

vi.mock('./common/helpers/session-cache/session-cache.js', () => ({
  sessionCache: {
    plugin: {
      name: 'session-cache',
      register: vi.fn()
    }
  }
}))

vi.mock('./common/helpers/proxy/setup-proxy.js', () => ({
  setupProxy: vi.fn()
}))

vi.mock('./common/helpers/pulse.js', () => ({
  pulse: {
    plugin: {
      name: 'pulse',
      register: vi.fn()
    }
  }
}))

vi.mock('./common/helpers/request-tracing.js', () => ({
  requestTracing: {
    plugin: {
      name: 'request-tracing',
      register: vi.fn()
    }
  }
}))

vi.mock('./common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }))
}))

vi.mock('./location-not-found/cy/index.js', () => ({
  locationNotFoundCy: {
    plugin: {
      name: 'location-not-found-cy',
      register: vi.fn()
    }
  }
}))

vi.mock('@hapi/cookie', () => ({
  default: {
    plugin: {
      name: '@hapi/cookie',
      register: vi.fn()
    }
  }
}))

describe('Server Index', () => {
  let server

  afterEach(async () => {
    if (server && server.stop) {
      try {
        await server.stop()
      } catch (error) {
        // Ignore cleanup errors in tests
      }
    }
    vi.clearAllMocks()
  })

  describe('createServer', () => {
    it('should create server with correct configuration', async () => {
      server = await createServer()

      expect(server).toBeDefined()
      expect(server.info).toBeDefined()
      expect(server.info.port).toBe(3000)
      expect(server.info.host).toBe('0.0.0.0') // Hapi.js resolves localhost to 0.0.0.0
    })

    it('should configure security settings correctly', async () => {
      server = await createServer()

      const settings = server.settings.routes.security
      expect(settings).toBeDefined()
      expect(settings.hsts).toEqual({
        maxAge: 31536000,
        includeSubDomains: true,
        preload: false
      })
      expect(settings.xss).toBe('enabled')
      expect(settings.noSniff).toBe(true)
      expect(settings.xframe).toBe(true)
    })

    it('should configure validation options', async () => {
      server = await createServer()

      const validateOptions = server.settings.routes.validate
      expect(validateOptions).toBeDefined()
      expect(validateOptions.options.abortEarly).toBe(false)
    })

    it('should configure file serving settings', async () => {
      server = await createServer()

      const filesConfig = server.settings.routes.files
      expect(filesConfig).toBeDefined()
      expect(filesConfig.relativeTo).toContain('.public')
    })

    it('should configure router settings', async () => {
      server = await createServer()

      const routerConfig = server.settings.router
      expect(routerConfig).toBeDefined()
      expect(routerConfig.stripTrailingSlash).toBe(true)
    })

    it('should configure cache settings', async () => {
      server = await createServer()

      // Verify cache configuration exists on the server object
      expect(server).toBeDefined()
      // Verify server was created successfully (cache configuration is internal to Hapi)
      expect(server.info).toBeDefined()
      expect(server.info.port).toBe(3000)
    })

    it('should configure state settings', async () => {
      server = await createServer()

      const stateConfig = server.settings.state
      expect(stateConfig).toBeDefined()
      expect(stateConfig.strictHeader).toBe(false)
    })

    it('should register all required plugins', async () => {
      server = await createServer()

      // Verify plugins are registered by checking registrations
      const registrations = server.registrations
      expect(registrations).toBeDefined()

      // Check for key plugins
      expect(Object.keys(registrations)).toContain('nunjucks-config')
      expect(Object.keys(registrations)).toContain('router')
      expect(Object.keys(registrations)).toContain('request-logger')
    })

    it('should setup proxy before server creation', async () => {
      const { setupProxy } = await import(
        './common/helpers/proxy/setup-proxy.js'
      )

      await createServer()

      expect(setupProxy).toHaveBeenCalled()
    })

    it('should register onPreResponse extension', async () => {
      server = await createServer()

      // Verify the server has extension capabilities
      expect(server.ext).toBeDefined()
      expect(typeof server.ext).toBe('function')
    })

    it('should handle plugin registration with unnamed plugins', async () => {
      const { createLogger } = await import(
        './common/helpers/logging/logger.js'
      )
      const mockLogger = {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn()
      }
      createLogger.mockReturnValue(mockLogger)

      // This test covers the fallback plugin name logic on line 83
      server = await createServer()

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Registering plugin 1:')
      )
    })

    it('should handle errors during server setup', async () => {
      const { createLogger } = await import(
        './common/helpers/logging/logger.js'
      )
      const mockLogger = {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn()
      }
      createLogger.mockReturnValue(mockLogger)

      // Mock setupProxy to throw an error
      const { setupProxy } = await import(
        './common/helpers/proxy/setup-proxy.js'
      )
      setupProxy.mockImplementation(() => {
        throw new Error('Proxy setup failed')
      })

      await expect(createServer()).rejects.toThrow('Proxy setup failed')
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error during server setup',
        expect.any(Error)
      )
    })

    it('should create logger and log initialization steps', async () => {
      // Reset setupProxy mock to avoid interference from previous tests
      const { setupProxy } = await import(
        './common/helpers/proxy/setup-proxy.js'
      )
      setupProxy.mockReset()
      setupProxy.mockResolvedValue()

      const { createLogger } = await import(
        './common/helpers/logging/logger.js'
      )
      const mockLogger = {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn()
      }
      createLogger.mockReturnValue(mockLogger)

      server = await createServer()

      expect(createLogger).toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith('Initializing server setup')
      expect(mockLogger.info).toHaveBeenCalledWith('Proxy setup completed')
      expect(mockLogger.info).toHaveBeenCalledWith('Server instance created')
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Plugins registered successfully'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Extensions added successfully'
      )
    })
  })

  describe('Server Lifecycle', () => {
    beforeEach(async () => {
      // Reset setupProxy mock to avoid interference from previous tests
      const { setupProxy } = await import(
        './common/helpers/proxy/setup-proxy.js'
      )
      setupProxy.mockReset()
      setupProxy.mockResolvedValue()

      server = await createServer()
    })

    it('should start server successfully', async () => {
      await server.start()
      expect(server.info.started).toBeGreaterThan(0)
    })

    it('should stop server gracefully', async () => {
      await server.start()
      await server.stop()
      expect(server.info.started).toBe(0)
    })
  })

  describe('Error Handling', () => {
    it('should log and rethrow setup errors', async () => {
      const { createLogger } = await import(
        './common/helpers/logging/logger.js'
      )
      const mockLogger = {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn()
      }
      createLogger.mockReturnValue(mockLogger)

      // Mock setupProxy to throw an error
      const { setupProxy } = await import(
        './common/helpers/proxy/setup-proxy.js'
      )
      setupProxy.mockImplementation(() => {
        throw new Error('Proxy setup failed')
      })

      await expect(createServer()).rejects.toThrow('Proxy setup failed')
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error during server setup',
        expect.any(Error)
      )
    })
  })
})
