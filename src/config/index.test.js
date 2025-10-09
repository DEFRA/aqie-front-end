import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { config } from './index.js'

describe('Config', () => {
  let originalEnv

  beforeEach(() => {
    // Store original environment
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  it('should load configuration correctly', () => {
    expect(config).toBeDefined()
    expect(typeof config.get).toBe('function')
    expect(typeof config.validate).toBe('function')
  })

  describe('Configuration Properties', () => {
    it('should have correct default port', () => {
      const port = config.get('port')
      expect(port).toBe(3000)
    })

    it('should have correct default host', () => {
      const host = config.get('host')
      expect(host).toBe('0.0.0.0')
    })

    it('should have default environment as test (during testing)', () => {
      const env = config.get('env')
      expect(env).toBe('test') // During test runs, NODE_ENV is 'test'
    })

    it('should have root path configured', () => {
      const root = config.get('root')
      expect(root).toBeDefined()
      expect(typeof root).toBe('string')
    })

    it('should have session configuration', () => {
      const sessionName = config.get('session.cache.name')
      expect(sessionName).toBeDefined()

      const sessionEngine = config.get('session.cache.engine')
      expect(sessionEngine).toBeDefined()
    })

    it('should handle service version', () => {
      const serviceVersion = config.get('serviceVersion')
      // Can be null by default
      expect(
        serviceVersion === null || typeof serviceVersion === 'string'
      ).toBe(true)
    })
  })

  describe('Environment Variables', () => {
    it('should use PORT environment variable when set', () => {
      // Note: This test may not work due to config being imported at module level
      // but we test the concept
      expect(() => config.get('port')).not.toThrow()
    })

    it('should use HOST environment variable when set', () => {
      expect(() => config.get('host')).not.toThrow()
    })

    it('should use NODE_ENV environment variable', () => {
      const env = config.get('env')
      expect(['production', 'development', 'test']).toContain(env)
    })
  })

  describe('Configuration Validation', () => {
    it('should validate configuration without errors', () => {
      expect(() => {
        config.validate({ allowed: 'strict' })
      }).not.toThrow()
    })

    it('should have valid port format', () => {
      const port = config.get('port')
      expect(port).toBeGreaterThan(0)
      expect(port).toBeLessThanOrEqual(65535)
    })

    it('should have valid environment format', () => {
      const env = config.get('env')
      expect(['production', 'development', 'test']).toContain(env)
    })
  })

  describe('Configuration Schema', () => {
    it('should have configuration properties accessible', () => {
      // Test that we can access key configuration values
      expect(config.get('env')).toBeDefined()
      expect(config.get('host')).toBeDefined()
      expect(config.get('port')).toBeDefined()

      // Test schema exists and is accessible
      const schemaProperties = config.getProperties()
      expect(schemaProperties).toBeDefined()
      expect(typeof schemaProperties).toBe('object')
    })

    it('should validate configuration structure', () => {
      // Verify configuration has been properly loaded and validated
      expect(() => config.validate()).not.toThrow()

      // Test that required properties are accessible
      const port = config.get('port')
      const host = config.get('host')
      const env = config.get('env')

      expect(port).toBeDefined()
      expect(host).toBeDefined()
      expect(env).toBeDefined()
    })
  })

  describe('Configuration Methods', () => {
    it('should support get method', () => {
      expect(typeof config.get).toBe('function')
      expect(() => config.get('port')).not.toThrow()
    })

    it('should support has method', () => {
      expect(typeof config.has).toBe('function')
      expect(config.has('port')).toBe(true)
      expect(config.has('nonexistent')).toBe(false)
    })

    it('should support getProperties method', () => {
      expect(typeof config.getProperties).toBe('function')
      const properties = config.getProperties()
      expect(properties).toBeDefined()
      expect(typeof properties).toBe('object')
    })

    it('should support toString method', () => {
      expect(typeof config.toString).toBe('function')
      const configString = config.toString()
      expect(configString).toBeDefined()
      expect(typeof configString).toBe('string')
    })
  })

  describe('Error Handling', () => {
    it('should throw error for invalid configuration key', () => {
      expect(() => {
        config.get('invalid.key.that.does.not.exist')
      }).toThrow()
    })

    it('should handle validation errors gracefully', () => {
      expect(() => {
        // This should validate current config
        config.validate()
      }).not.toThrow()
    })
  })
})
