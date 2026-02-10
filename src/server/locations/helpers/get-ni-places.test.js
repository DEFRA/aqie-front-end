import { describe, it, expect, vi, beforeEach } from 'vitest'
import { STATUS_OK } from '../../data/constants.js'

const defaultConfigValues = {
  enabledMock: 'false',
  osPlacesApiPostcodeNorthernIrelandUrl: 'https://api.example.com/ni/',
  mockOsPlacesApiPostcodeNorthernIrelandUrl: 'https://mock.example.com/ni/',
  niApiMaxRetries: 1,
  niApiRetryDelayMs: 1,
  niApiTimeoutMs: 10,
  niApiCircuitBreakerEnabled: true,
  niApiCircuitBreakerFailureThreshold: 2,
  niApiCircuitBreakerOpenMs: 60000,
  niApiCacheEnabled: true,
  niApiCacheTtlMs: 60000,
  log: '{ "enabled": true }'
}

// Mock config FIRST before any imports that use it
vi.mock('../../../config/index.js', () => {
  return {
    config: {
      get: vi.fn((key) => {
        const value = defaultConfigValues[key] ?? ''
        // Parse JSON strings back to objects for 'log'
        if (key === 'log' && typeof value === 'string') {
          try {
            return JSON.parse(value)
          } catch {
            return value
          }
        }
        // Convert string 'false'/'true' to boolean for enabledMock
        if (key === 'enabledMock') {
          return value === 'true'
        }
        return value
      })
    }
  }
})

// Mock the dependencies
vi.mock('../../common/helpers/catch-proxy-fetch-error.js', () => {
  const catchProxyFetchError = vi.fn()
  return { catchProxyFetchError }
})

vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }))
}))

vi.mock('./extracted/util-helpers.js', () => ({
  refreshOAuthToken: vi.fn(() => Promise.resolve({ accessToken: 'mock-token' }))
}))

// Now import after mocks are set up
const { getNIPlaces, resetNiPlacesState } = await import('./get-ni-places.js')

describe('getNIPlaces', () => {
  let catchProxyFetchError
  let config
  let refreshOAuthToken

  beforeEach(async () => {
    ;({ catchProxyFetchError } = await import(
      '../../common/helpers/catch-proxy-fetch-error.js'
    ))
    ;({ config } = await import('../../../config/index.js'))
    ;({ refreshOAuthToken } = await import('./extracted/util-helpers.js'))
    catchProxyFetchError.mockReset()
    config.get.mockImplementation((key) => {
      const value = defaultConfigValues[key] ?? ''
      if (key === 'log' && typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      }
      if (key === 'enabledMock') {
        return value === 'true'
      }
      return value
    })
    catchProxyFetchError.mockResolvedValue([
      STATUS_OK,
      { results: [{ id: 'test' }] }
    ])
    resetNiPlacesState()
  })

  it('should call getNIPlaces function without errors', async () => {
    const result = await getNIPlaces('BT1 1AA')
    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
  })

  it('should call NI API with no-space postcode', async () => {
    catchProxyFetchError.mockResolvedValue([
      STATUS_OK,
      { results: [{ id: 'test' }] }
    ])
    await getNIPlaces('BT1 1AA')
    expect(catchProxyFetchError).toHaveBeenCalledWith(
      'https://api.example.com/ni/BT11AA&maxresults=1',
      expect.any(Object),
      true
    )
  })

  it('should handle mock mode', async () => {
    // Override config to enable mock mode
    const mockConfigValues = {
      enabledMock: 'true',
      mockOsPlacesApiPostcodeNorthernIrelandUrl: 'https://mock.example.com/ni/',
      log: '{ "enabled": true }'
    }

    config.get.mockImplementation((key) => {
      const value = mockConfigValues[key] ?? ''
      // Parse JSON strings back to objects for 'log'
      if (key === 'log' && typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      }
      // Convert string to boolean for enabledMock
      if (key === 'enabledMock') {
        return value === 'true'
      }
      return value
    })

    catchProxyFetchError.mockResolvedValue([STATUS_OK, [{ id: 'mock test' }]])
    const result = await getNIPlaces('BT1 1AA')
    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
    expect(result.results).toBeInstanceOf(Array)
  })

  it('should call catchProxyFetchError and return defined result', async () => {
    catchProxyFetchError.mockResolvedValue([
      STATUS_OK,
      { results: [{ id: 'test' }] }
    ])
    const result = await getNIPlaces('BT1 1AA')
    expect(catchProxyFetchError).toHaveBeenCalled()
    expect(result).toBeDefined()
    expect(result.results).toBeInstanceOf(Array)
  })

  it('should handle SMS journey scenario with undefined request', async () => {
    // '' Test the fix for SMS journey where request might be undefined
    const mockData = { results: [{ postcode: 'BT1 1AA', town: 'Belfast' }] }
    catchProxyFetchError.mockResolvedValue([STATUS_OK, mockData])
    const result = await getNIPlaces('BT1 1AA', undefined)
    expect(result).toBeDefined()
    expect(result.results).toBeInstanceOf(Array)
    expect(result.results.length).toBeGreaterThan(0)
  })

  it('should return service-unavailable error when NI API fails', async () => {
    // '' Simulate upstream failure from catchProxyFetchError
    catchProxyFetchError.mockResolvedValue([
      null,
      { error: 'service-unavailable' }
    ])

    const result = await getNIPlaces('BT1 1AA')

    expect(result).toEqual({ results: [], error: 'service-unavailable' })
  })

  it('should refresh token and retry once on 401', async () => {
    refreshOAuthToken.mockResolvedValue({ accessToken: 'refreshed-token' })
    catchProxyFetchError
      .mockResolvedValueOnce([401, { error: 'unauthorized' }])
      .mockResolvedValueOnce([STATUS_OK, { results: [{ id: 'retry' }] }])

    const result = await getNIPlaces('BT1 1AA')

    expect(catchProxyFetchError).toHaveBeenCalledTimes(2)
    expect(result.results).toEqual([{ id: 'retry' }])
  })

  it('should return cached result when NI API fails', async () => {
    const cachedData = { results: [{ id: 'cached' }] }
    catchProxyFetchError.mockReset()
    catchProxyFetchError
      .mockResolvedValueOnce([STATUS_OK, cachedData])
      .mockResolvedValueOnce([null, { error: 'service-unavailable' }])

    const firstResult = await getNIPlaces('BT1 1AA')
    expect(firstResult.results).toEqual([{ id: 'cached' }])

    const cachedResult = await getNIPlaces('BT1 1AA')
    expect(cachedResult.results).toEqual([{ id: 'cached' }])
  })

  it('should short-circuit when circuit breaker is open', async () => {
    config.get.mockImplementation((key) => {
      const overrideValues = {
        ...defaultConfigValues,
        niApiMaxRetries: 0,
        niApiCacheEnabled: false,
        niApiCircuitBreakerFailureThreshold: 1,
        niApiCircuitBreakerOpenMs: 60000
      }
      const value = overrideValues[key] ?? ''
      if (key === 'log' && typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      }
      if (key === 'enabledMock') {
        return value === 'true'
      }
      return value
    })

    catchProxyFetchError.mockReset()
    catchProxyFetchError.mockResolvedValueOnce([
      null,
      { error: 'service-unavailable' }
    ])

    const firstResult = await getNIPlaces('BT1 1AA')
    expect(firstResult).toEqual({ results: [], error: 'service-unavailable' })

    const secondResult = await getNIPlaces('BT1 1AA')
    expect(secondResult).toEqual({ results: [], error: 'service-unavailable' })
    expect(catchProxyFetchError).toHaveBeenCalledTimes(1)
  })
})
