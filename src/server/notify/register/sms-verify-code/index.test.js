// Tests for SMS verify code plugin ''
import { describe, it, expect, vi } from 'vitest'
import { checkMessage } from './index.js'

describe('SMS Verify Code Plugin', () => {
  it('should export checkMessage plugin', () => {
    expect(checkMessage).toBeDefined()
    expect(checkMessage.plugin).toBeDefined()
    expect(checkMessage.plugin.name).toBe('notify-sms-verify-code')
  })

  it('should register routes when plugin is registered', async () => {
    // Arrange ''
    const mockServer = {
      route: vi.fn()
    }

    // Act ''
    await checkMessage.plugin.register(mockServer)

    // Assert ''
    expect(mockServer.route).toHaveBeenCalledTimes(1)
    expect(mockServer.route).toHaveBeenCalledWith(expect.any(Array))
  })
})
