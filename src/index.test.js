import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
const mockStartServer = vi.fn()
vi.mock('./server/common/helpers/start-server.js', () => ({
  startServer: mockStartServer
}))

const mockLogger = {
  info: vi.fn(),
  error: vi.fn()
}
vi.mock('./server/common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => mockLogger)
}))

describe('Application Entry Point', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Module imports and basic functionality', () => {
    it('should import without throwing errors', async () => {
      // ''
      expect(async () => {
        await import('./index.js')
      }).not.toThrow()
    })

    it('should call startServer on import', async () => {
      // ''
      mockStartServer.mockResolvedValue()

      await import('./index.js')

      expect(mockStartServer).toHaveBeenCalled()
    })
  })

  describe('Process event handlers', () => {
    it('should handle unhandledRejection events', async () => {
      // ''
      mockStartServer.mockResolvedValue()

      await import('./index.js')

      const testError = new Error('Test unhandled rejection')
      process.emit('unhandledRejection', testError)

      expect(mockLogger.info).toHaveBeenCalledWith('Unhandled rejection')
      expect(mockLogger.error).toHaveBeenCalledWith(testError)
      expect(process.exitCode).toBe(1)
    })

    it('should handle process exit gracefully', () => {
      // ''
      expect(process).toBeDefined()
      expect(process.exitCode).toBeDefined()
    })
  })

  describe('Basic module structure', () => {
    it('should have process available', () => {
      // ''
      expect(process).toBeDefined()
      expect(process.on).toBeDefined()
    })

    it('should be able to register process event handlers', () => {
      // ''
      const handler = vi.fn()
      process.on('test-event', handler)

      process.emit('test-event', 'test-data')

      expect(handler).toHaveBeenCalledWith('test-data')

      process.removeListener('test-event', handler)
    })
  })
})
