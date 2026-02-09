import { describe, it, expect, vi, beforeEach } from 'vitest'
import { STATUS_OK } from '../../data/constants.js'

const defaultConfigValues = {
  enabledMock: 'false',
  osPlacesApiPostcodeNorthernIrelandUrl: 'https://api.example.com/ni/',
  mockOsPlacesApiPostcodeNorthernIrelandUrl: 'https://mock.example.com/ni/',
  niApiMaxRetries: 1,
  niApiRetryDelayMs: 1,
  niApiTimeoutMs: 10,
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
const { getNIPlaces } = await import('./get-ni-places.js')

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
})
