import { describe, it, expect, vi, beforeEach } from 'vitest'
import { refreshOAuthToken, buildNIOptionsOAuth } from './util-helpers.js'

// ''  Test constants
const TEST_OAUTH_TOKEN = 'Bearer test-oauth-token-123'

describe('util-helpers - refreshOAuthToken', () => {
  let mockLogger
  let mockRequest

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }
    mockRequest = {
      yar: {
        get: vi.fn(),
        set: vi.fn(),
        clear: vi.fn()
      }
    }
  })

  it('should return mock token in test mode', async () => {
    const di = {
      logger: mockLogger,
      isTestMode: () => true
    }

    const result = await refreshOAuthToken(mockRequest, di)

    expect(result).toEqual({ accessToken: 'mock-token' })
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Test mode: refreshOAuthToken returning mock token'
    )
  })

  it('should fetch OAuth token when not in test mode', async () => {
    const mockAccessToken = 'real-access-token'
    const di = {
      logger: mockLogger,
      fetchOAuthToken: vi.fn().mockResolvedValue(mockAccessToken),
      isTestMode: () => false
    }

    const result = await refreshOAuthToken(mockRequest, di)

    expect(result).toBe(mockAccessToken)
    expect(mockRequest.yar.clear).toHaveBeenCalledWith('savedAccessToken')
    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'savedAccessToken',
      mockAccessToken
    )
  })

  it('should return error if fetchOAuthToken fails', async () => {
    const mockError = { error: 'Failed to fetch token' }
    const di = {
      logger: mockLogger,
      fetchOAuthToken: vi.fn().mockResolvedValue(mockError),
      isTestMode: () => false
    }

    const result = await refreshOAuthToken(mockRequest, di)

    expect(result).toEqual(mockError)
    expect(mockRequest.yar.clear).not.toHaveBeenCalled()
  })

  it('should handle missing logger gracefully', async () => {
    const di = {
      isTestMode: () => true
    }

    const result = await refreshOAuthToken(mockRequest, di)

    expect(result).toEqual({ accessToken: 'mock-token' })
  })
})

describe('util-helpers - buildNIOptionsOAuth', () => {
  let mockRequest

  beforeEach(() => {
    mockRequest = {
      yar: {
        get: vi.fn(),
        set: vi.fn(),
        clear: vi.fn()
      }
    }
  })
  it('should return options with OAuth token when mock is disabled', async () => {
    mockRequest.yar.get.mockReturnValue(null)
    const mockRefreshOAuthToken = vi.fn().mockResolvedValue('oauth-token-123')

    const result = await buildNIOptionsOAuth({
      request: mockRequest,
      isMockEnabled: false,
      refreshOAuthTokenFn: mockRefreshOAuthToken
    })

    expect(result.optionsOAuth).toEqual({
      method: 'GET',
      headers: {
        Authorization: 'Bearer oauth-token-123',
        'Content-Type': 'application/json'
      }
    })
    expect(result.accessToken).toBe('oauth-token-123')
  })

  it('should use saved access token if available', async () => {
    mockRequest.yar.get.mockReturnValue('saved-token-456')
    const mockRefreshOAuthToken = vi.fn()

    const result = await buildNIOptionsOAuth({
      request: mockRequest,
      isMockEnabled: false,
      refreshOAuthTokenFn: mockRefreshOAuthToken
    })

    expect(result.accessToken).toBe('saved-token-456')
    expect(mockRefreshOAuthToken).not.toHaveBeenCalled()
  })

  it('should return empty options when mock is enabled', async () => {
    const result = await buildNIOptionsOAuth({
      request: mockRequest,
      isMockEnabled: true,
      refreshOAuthTokenFn: vi.fn()
    })

    expect(result.optionsOAuth).toEqual({})
    expect(result.accessToken).toBeUndefined()
  })

  it('should handle isMockEnabled as function', async () => {
    const result = await buildNIOptionsOAuth({
      request: mockRequest,
      isMockEnabled: () => true,
      refreshOAuthTokenFn: vi.fn()
    })

    expect(result.optionsOAuth).toEqual({})
  })
})
