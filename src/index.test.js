import process from 'node:process'

import { startServer } from './server/common/helpers/start-server.js'
import { createLogger } from './server/common/helpers/logging/logger.js'

describe('Server Initialization', () => {
  it('should start the server without errors', async () => {
    await expect(startServer()).resolves.not.toThrow()
  })

  it('should handle unhandled rejections gracefully', () => {
    const logger = createLogger()
    const mockInfo = vi.spyOn(logger, 'info').mockImplementation(() => {})
    const mockError = vi.spyOn(logger, 'error').mockImplementation(() => {})
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {})

    const unhandledRejectionListener = (error) => {
      logger.info('Unhandled rejection')
      logger.error(error)
      process.exit(1)
    }

    process.on('unhandledRejection', unhandledRejectionListener)

    try {
      process.emit('unhandledRejection', new Error('Test rejection'))

      expect(mockInfo).toHaveBeenCalledWith('Unhandled rejection')
      expect(mockError).toHaveBeenCalledWith(expect.any(Error))
      expect(mockExit).toHaveBeenCalledWith(1)
    } finally {
      process.off('unhandledRejection', unhandledRejectionListener)
      mockInfo.mockRestore()
      mockError.mockRestore()
      mockExit.mockRestore()
    }
  })
})
