import { describe, it, expect, vi, beforeEach } from 'vitest'
import { refreshOAuthToken, buildNIOptionsOAuth } from './util-helpers.js'

const REAL_ACCESS_TOKEN = 'real-access-token'

const createMockLogger = () => ({
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
})

const createMockRequest = () => ({
  yar: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn()
  }
})

describe('refreshOAuthToken - test mode', () => {
  let mockLogger
  let mockRequest

  beforeEach(() => {
    mockLogger = createMockLogger()
    mockRequest = createMockRequest()
  })

  describe('test mode behavior', () => {
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

    it('should handle missing logger gracefully', async () => {
      const di = {
        isTestMode: () => true
      }

      const result = await refreshOAuthToken(mockRequest, di)

      expect(result).toEqual({ accessToken: 'mock-token' })
    })
  })

  describe('production mode behavior', () => {
    it('should fetch OAuth token when not in test mode', async () => {
      const di = {
        logger: mockLogger,
        fetchOAuthToken: vi.fn().mockResolvedValue(REAL_ACCESS_TOKEN),
        isTestMode: () => false
      }

      const result = await refreshOAuthToken(mockRequest, di)

      expect(result).toEqual({ accessToken: REAL_ACCESS_TOKEN })
      expect(mockRequest.yar.clear).toHaveBeenCalledWith('savedAccessToken')
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'savedAccessToken',
        REAL_ACCESS_TOKEN
      )
    })

    it('should return error if fetchOAuthToken fails and no saved token', async () => {
      const mockError = { error: 'Failed to fetch token' }
      const di = {
        logger: mockLogger,
        fetchOAuthToken: vi.fn().mockResolvedValue(mockError),
        isTestMode: () => false
      }

      mockRequest.yar.get.mockReturnValue(undefined)
      const result = await refreshOAuthToken(mockRequest, di)

      expect(result).toEqual(mockError)
      expect(mockRequest.yar.clear).not.toHaveBeenCalled()
    })

    it('should fall back to saved token if fetchOAuthToken fails', async () => {
      const mockError = { error: 'Failed to fetch token' }
      const di = {
        logger: mockLogger,
        fetchOAuthToken: vi.fn().mockResolvedValue(mockError),
        isTestMode: () => false
      }

      mockRequest.yar.get.mockReturnValue('saved-token')
      const result = await refreshOAuthToken(mockRequest, di)

      expect(result).toEqual({ accessToken: 'saved-token', isFallback: true })
    })
  })

  describe('error handling', () => {
    it('should handle missing request object gracefully', async () => {
      const di = {
        logger: mockLogger,
        fetchOAuthToken: vi.fn().mockResolvedValue(REAL_ACCESS_TOKEN),
        isTestMode: () => false
      }

      const result = await refreshOAuthToken(undefined, di)

      expect(result).toEqual({ accessToken: REAL_ACCESS_TOKEN })
    })

    it('should handle request without yar property gracefully', async () => {
      const di = {
        logger: mockLogger,
        fetchOAuthToken: vi.fn().mockResolvedValue(REAL_ACCESS_TOKEN),
        isTestMode: () => false
      }

      const requestWithoutYar = {}
      const result = await refreshOAuthToken(requestWithoutYar, di)

      expect(result).toEqual({ accessToken: REAL_ACCESS_TOKEN })
    })
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
    const testToken = 'oauth-token-123' // '' Test token - not a real credential
    const mockRefreshOAuthToken = vi.fn().mockResolvedValue(testToken)

    const result = await buildNIOptionsOAuth({
      request: mockRequest,
      isMockEnabled: false,
      refreshOAuthTokenFn: mockRefreshOAuthToken
    })

    expect(result.optionsOAuth).toEqual({
      method: 'GET',
      headers: {
        Authorization: `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    })
    expect(result.accessToken).toBe(testToken)
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
