// Jest test for index.js
import { startServer } from './index'

describe('Application Entry Point', () => {
  it('should initialize the server correctly', async () => {
    const mockCreateServer = jest.fn().mockResolvedValue({
      start: jest.fn(() => {
        mockLogger.info('Server started successfully')
      })
    })
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    }
    const mockConfig = {
      get: jest.fn().mockReturnValue(3000)
    }

    await expect(
      startServer(mockCreateServer, mockLogger, mockConfig)
    ).resolves.toBeUndefined()
    expect(mockCreateServer).toHaveBeenCalled()
    expect(mockLogger.info).toHaveBeenCalledWith('Server started successfully')
  })
})
