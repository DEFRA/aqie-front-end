import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  refreshOAuthToken,
  handleNILocationData,
  handleUKLocationData,
  buildNIOptionsOAuth,
  handleUnsupportedLocationType,
  catchProxyFetchError,
  buildNIPostcodeUrl,
  buildUKApiUrl,
  buildUKLocationFilters,
  formatNorthernIrelandPostcode,
  formatUKApiResponse,
  combineUKSearchTerms
} from './util-helpers.js'

describe('util-helpers', () => {
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

  describe('refreshOAuthToken', () => {
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

  describe('handleNILocationData', () => {
    it('should accept all required parameters', async () => {
      const di = {
        injectedLogger: mockLogger,
        injectedIsTestMode: vi.fn().mockReturnValue(true)
      }

      const result = await handleNILocationData(
        'Belfast',
        null,
        null,
        true,
        {},
        {},
        mockRequest,
        di
      )

      // Just verify function executes without error
      expect(result).toBeDefined()
    })
  })

  describe('handleUKLocationData', () => {
    it('should accept all required parameters', async () => {
      const di = {
        injectedLogger: mockLogger,
        injectedIsTestMode: vi.fn().mockReturnValue(true)
      }

      const result = await handleUKLocationData('London', null, null, di)

      // Just verify function executes without error
      expect(result).toBeDefined()
    })
  })

  describe('buildNIOptionsOAuth', () => {
    it('should return options with OAuth token when mock is disabled', async () => {
      mockRequest.yar.get.mockReturnValue(null)
      const mockRefreshOAuthToken = vi.fn().mockResolvedValue('oauth-token-123')

      const result = await buildNIOptionsOAuth({
        request: mockRequest,
        injectedIsMockEnabled: false,
        injectedRefreshOAuthToken: mockRefreshOAuthToken
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
        injectedIsMockEnabled: false,
        injectedRefreshOAuthToken: mockRefreshOAuthToken
      })

      expect(result.accessToken).toBe('saved-token-456')
      expect(mockRefreshOAuthToken).not.toHaveBeenCalled()
    })

    it('should return empty options when mock is enabled', async () => {
      const result = await buildNIOptionsOAuth({
        request: mockRequest,
        injectedIsMockEnabled: true,
        injectedRefreshOAuthToken: vi.fn()
      })

      expect(result.optionsOAuth).toEqual({})
      expect(result.accessToken).toBeUndefined()
    })

    it('should handle isMockEnabled as function', async () => {
      const result = await buildNIOptionsOAuth({
        request: mockRequest,
        injectedIsMockEnabled: () => true,
        injectedRefreshOAuthToken: vi.fn()
      })

      expect(result.optionsOAuth).toEqual({})
    })
  })

  describe('handleUnsupportedLocationType', () => {
    it('should return error response for unsupported location type', () => {
      const mockErrorResponse = vi
        .fn()
        .mockReturnValue({ error: 'Bad request' })
      const handler = handleUnsupportedLocationType()
      const result = handler(mockLogger, mockErrorResponse, 'InvalidType')

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unsupported location type provided:',
        'InvalidType'
      )
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Unsupported location type provided',
        400
      )
      expect(result).toEqual({ error: 'Bad request' })
    })
  })

  describe('catchProxyFetchError', () => {
    it('should call catchFetchError with provided arguments', async () => {
      // Since catchProxyFetchError uses the real catchFetchError,
      // we just verify it can be called
      const result = await catchProxyFetchError('http://test.com', {})

      expect(result).toBeDefined()
    })
  })

  describe('buildNIPostcodeUrl', () => {
    it('should return empty string for null postcode', () => {
      const result = buildNIPostcodeUrl(null)
      expect(result).toBe('')
    })

    it('should build URL with default base URL', () => {
      const result = buildNIPostcodeUrl('BT1 1AA')
      expect(result).toContain('BT1%201AA')
      expect(result).toContain('https://api.ni.example.com/postcode')
    })

    it('should build URL with custom base URL', () => {
      const config = { niApiBaseUrl: 'https://custom.api.com/postcode' }
      const result = buildNIPostcodeUrl('BT1 1AA', config)
      expect(result).toBe('https://custom.api.com/postcode/BT1%201AA')
    })

    it('should encode postcode properly', () => {
      const result = buildNIPostcodeUrl('BT1 1AA')
      expect(result).toContain('BT1%201AA')
    })
  })

  describe('formatUKApiResponse', () => {
    it('should return response as-is', () => {
      const response = { data: 'test', results: [] }
      const result = formatUKApiResponse(response)
      expect(result).toEqual(response)
    })

    it('should handle null response', () => {
      const result = formatUKApiResponse(null)
      expect(result).toBeNull()
    })
  })

  describe('formatNorthernIrelandPostcode', () => {
    it('should return empty string for null postcode', () => {
      const result = formatNorthernIrelandPostcode(null)
      expect(result).toBe('')
    })

    it('should trim and uppercase postcode', () => {
      const result = formatNorthernIrelandPostcode('  bt1 1aa  ')
      expect(result).toBe('BT11AA')
    })

    it('should remove spaces from postcode', () => {
      const result = formatNorthernIrelandPostcode('BT1 1AA')
      expect(result).toBe('BT11AA')
    })

    it('should handle multiple spaces', () => {
      const result = formatNorthernIrelandPostcode('BT1    1AA')
      expect(result).toBe('BT11AA')
    })

    it('should handle already formatted postcode', () => {
      const result = formatNorthernIrelandPostcode('BT11AA')
      expect(result).toBe('BT11AA')
    })
  })

  describe('combineUKSearchTerms', () => {
    it('should return empty string when both terms are null', () => {
      const result = combineUKSearchTerms(null, null)
      expect(result).toBe('')
    })

    it('should return term2 when term1 is null', () => {
      const result = combineUKSearchTerms(null, 'London')
      expect(result).toBe('London')
    })

    it('should return term1 when term2 is null', () => {
      const result = combineUKSearchTerms('London', null)
      expect(result).toBe('London')
    })

    it('should combine both terms with space', () => {
      const result = combineUKSearchTerms('London', 'SW1A 1AA')
      expect(result).toBe('London SW1A 1AA')
    })

    it('should handle empty strings', () => {
      const result = combineUKSearchTerms('', '')
      expect(result).toBe('')
    })
  })

  describe('buildUKLocationFilters', () => {
    it('should return empty object for null location', () => {
      const result = buildUKLocationFilters(null)
      expect(result).toEqual({})
    })

    it('should build filter with location', () => {
      const result = buildUKLocationFilters('London')
      expect(result).toEqual({ filter: 'location=London' })
    })

    it('should encode location properly', () => {
      const result = buildUKLocationFilters('London SW1A 1AA')
      expect(result.filter).toContain('London%20SW1A%201AA')
    })

    it('should handle config parameter', () => {
      const config = { someOption: true }
      const result = buildUKLocationFilters('London', config)
      expect(result).toEqual({ filter: 'location=London' })
    })
  })

  describe('buildUKApiUrl', () => {
    it('should return empty string for null location', () => {
      const result = buildUKApiUrl(null)
      expect(result).toBe('')
    })

    it('should build URL with default base URL', () => {
      const result = buildUKApiUrl('London')
      expect(result).toBe('https://api.uk.example.com/location/London')
    })

    it('should build URL with custom base URL', () => {
      const config = { ukApiBaseUrl: 'https://custom.api.com/location' }
      const result = buildUKApiUrl('London', config)
      expect(result).toBe('https://custom.api.com/location/London')
    })

    it('should encode location properly', () => {
      const result = buildUKApiUrl('London SW1A 1AA')
      expect(result).toContain('London%20SW1A%201AA')
    })
  })
})
