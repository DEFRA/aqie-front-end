import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
const mockServer = {
  start: vi.fn(),
  stop: vi.fn(),
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}

const mockCreateServer = vi.fn(() => Promise.resolve(mockServer))
vi.mock('../../index.js', () => ({
  createServer: mockCreateServer
}))

const mockConfig = {
  get: vi.fn((key) => {
    const values = {
      port: 3000,
      host: 'localhost'
    }
    return values[key] || 'mock-value'
  })
}
vi.mock('../../../config/index.js', () => ({
  config: mockConfig
}))

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn()
}
vi.mock('./logging/logger.js', () => ({
  createLogger: vi.fn(() => mockLogger)
}))

describe('startServer', () => {
  let originalProcessListeners
  let startServer

  beforeEach(async () => {
    vi.clearAllMocks()
    originalProcessListeners = {
      SIGTERM: process.listeners('SIGTERM'),
      SIGINT: process.listeners('SIGINT')
    }

    // Remove existing listeners
    process.removeAllListeners('SIGTERM')
    process.removeAllListeners('SIGINT')

    const module = await import('./start-server.js')
    startServer = module.startServer
  })

  afterEach(() => {
    // Restore original listeners
    Object.keys(originalProcessListeners).forEach((signal) => {
      process.removeAllListeners(signal)
      originalProcessListeners[signal].forEach((listener) => {
        process.on(signal, listener)
      })
    })
  })

  describe('Server Startup', () => {
    it('should create and start server successfully', async () => {
      // ''
      mockServer.start.mockResolvedValue()

      await startServer()

      expect(mockCreateServer).toHaveBeenCalledOnce()
      expect(mockServer.start).toHaveBeenCalledOnce()
    })

    it('should log server start success message', async () => {
      // ''
      mockServer.start.mockResolvedValue()

      await startServer()

      expect(mockServer.logger.info).toHaveBeenCalledWith(
        'Server started successfully'
      )
    })

    it('should log server access URL', async () => {
      // ''
      mockServer.start.mockResolvedValue()
      mockConfig.get.mockReturnValue(3000)

      await startServer()

      expect(mockServer.logger.info).toHaveBeenCalledWith(
        'Access your frontend on http://localhost:3000'
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle server creation errors', async () => {
      // ''
      const error = new Error('Server creation failed')
      mockCreateServer.mockRejectedValue(error)

      await expect(startServer()).rejects.toThrow('Server creation failed')
    })

    it('should handle server start errors', async () => {
      // ''
      const error = new Error('Server start failed')
      mockServer.start.mockRejectedValue(error)

      await expect(startServer()).rejects.toThrow('Server start failed')
    })
  })

  describe('Signal Handling', () => {
    it('should register SIGTERM handler', async () => {
      // ''
      mockServer.start.mockResolvedValue()

      const beforeCount = process.listenerCount('SIGTERM')
      await startServer()
      const afterCount = process.listenerCount('SIGTERM')

      expect(afterCount).toBeGreaterThan(beforeCount)
    })

    it('should register SIGINT handler', async () => {
      // ''
      mockServer.start.mockResolvedValue()

      const beforeCount = process.listenerCount('SIGINT')
      await startServer()
      const afterCount = process.listenerCount('SIGINT')

      expect(afterCount).toBeGreaterThan(beforeCount)
    })
  })
})
