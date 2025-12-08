import { describe, it, expect, vi, beforeEach } from 'vitest'
import { callAndHandleUKApiResponse } from './api-utils.js'
import {
  STATUS_OK,
  STATUS_UNAUTHORIZED,
  STATUS_INTERNAL_SERVER_ERROR
} from '../../../data/constants.js'

// Test constants
const OSNAMES_API_URL = 'https://osnames.api.com'

describe('api-utils - callAndHandleUKApiResponse successful data fetch', () => {
  let mockLogger

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }
  })

  it('should return formatted data on successful UK API call', async () => {
    const mockFormattedData = { results: [] }
    const mockCatchProxyFetchError = vi
      .fn()
      .mockResolvedValue([STATUS_OK, { data: 'raw' }])
    const mockFormatUKApiResponse = vi.fn().mockReturnValue(mockFormattedData)
    const mockOptions = { headers: {} }

    const result = await callAndHandleUKApiResponse({
      osNamesApiUrlFull: OSNAMES_API_URL,
      options: mockOptions,
      optionsEphemeralProtected: {},
      shouldCallApi: true,
      catchProxyFetchError: mockCatchProxyFetchError,
      httpStatusOk: STATUS_OK,
      logger: mockLogger,
      formatUKApiResponse: mockFormatUKApiResponse
    })

    expect(result).toEqual(mockFormattedData)
    expect(mockLogger.info).toHaveBeenCalledWith('getOSPlaces data fetched:')
    expect(mockFormatUKApiResponse).toHaveBeenCalledWith({ data: 'raw' })
  })
})

describe('api-utils - callAndHandleUKApiResponse options selection', () => {
  let mockLogger

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }
  })

  it('should use ephemeral protected options for localhost URLs', async () => {
    const mockCatchProxyFetchError = vi
      .fn()
      .mockResolvedValue([STATUS_OK, { data: 'raw' }])
    const mockFormatUKApiResponse = vi.fn().mockReturnValue({})
    const mockOptionsEphemeralProtected = {
      headers: { 'x-api-key': 'dev-key' }
    }
    const mockOptions = { headers: {} }

    await callAndHandleUKApiResponse({
      osNamesApiUrlFull: 'http://localhost:3000/api',
      options: mockOptions,
      optionsEphemeralProtected: mockOptionsEphemeralProtected,
      shouldCallApi: true,
      catchProxyFetchError: mockCatchProxyFetchError,
      httpStatusOk: STATUS_OK,
      logger: mockLogger,
      formatUKApiResponse: mockFormatUKApiResponse
    })

    expect(mockCatchProxyFetchError).toHaveBeenCalledWith(
      'http://localhost:3000/api',
      mockOptionsEphemeralProtected,
      true
    )
  })

  it('should use regular options for remote URLs', async () => {
    const mockCatchProxyFetchError = vi
      .fn()
      .mockResolvedValue([STATUS_OK, { data: 'raw' }])
    const mockFormatUKApiResponse = vi.fn().mockReturnValue({})
    const mockOptions = { headers: { auth: 'token' } }
    const mockOptionsEphemeralProtected = {
      headers: { 'x-api-key': 'dev-key' }
    }

    await callAndHandleUKApiResponse({
      osNamesApiUrlFull: OSNAMES_API_URL,
      options: mockOptions,
      optionsEphemeralProtected: mockOptionsEphemeralProtected,
      shouldCallApi: true,
      catchProxyFetchError: mockCatchProxyFetchError,
      httpStatusOk: STATUS_OK,
      logger: mockLogger,
      formatUKApiResponse: mockFormatUKApiResponse
    })

    expect(mockCatchProxyFetchError).toHaveBeenCalledWith(
      OSNAMES_API_URL,
      mockOptions,
      true
    )
  })
})

describe('api-utils - callAndHandleUKApiResponse error cases', () => {
  let mockLogger

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }
  })

  it('should handle 401 unauthorized error', async () => {
    const mockCatchProxyFetchError = vi
      .fn()
      .mockResolvedValue([STATUS_UNAUTHORIZED, null])
    const mockFormatUKApiResponse = vi.fn()

    const result = await callAndHandleUKApiResponse({
      osNamesApiUrlFull: OSNAMES_API_URL,
      options: {},
      optionsEphemeralProtected: {},
      shouldCallApi: true,
      catchProxyFetchError: mockCatchProxyFetchError,
      httpStatusOk: STATUS_OK,
      logger: mockLogger,
      formatUKApiResponse: mockFormatUKApiResponse
    })

    expect(result).toBeNull()
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('OS Names API returned 401')
    )
  })

  it('should handle other error status codes', async () => {
    const mockCatchProxyFetchError = vi
      .fn()
      .mockResolvedValue([STATUS_INTERNAL_SERVER_ERROR, null])
    const mockFormatUKApiResponse = vi.fn()

    const result = await callAndHandleUKApiResponse({
      osNamesApiUrlFull: OSNAMES_API_URL,
      options: {},
      optionsEphemeralProtected: {},
      shouldCallApi: true,
      catchProxyFetchError: mockCatchProxyFetchError,
      httpStatusOk: STATUS_OK,
      logger: mockLogger,
      formatUKApiResponse: mockFormatUKApiResponse
    })

    expect(result).toBeNull()
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error fetching statusCodeOSPlace data:',
      STATUS_INTERNAL_SERVER_ERROR
    )
  })
})
