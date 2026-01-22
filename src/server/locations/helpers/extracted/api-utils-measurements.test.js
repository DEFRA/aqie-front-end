import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  selectMeasurementsUrlAndOptions,
  callAndHandleMeasurementsResponse
} from './api-utils.js'
import {
  STATUS_OK,
  STATUS_INTERNAL_SERVER_ERROR
} from '../../../data/constants.js'

// Test constants
const TEST_URL = 'http://test.com'
const TEST_HOST = 'example.com'
const LOCALHOST_HOST = 'localhost:3000'
const RICARDO_API_URL = 'https://ricardo.api.com'
const OLD_MEASUREMENTS_API_URL = 'https://old.measurements.api.com'
const DEV_API_URL = 'https://dev.api.com'

// Test coordinates
const TEST_LATITUDE = 51.5074
const TEST_LONGITUDE = -0.1278
const PRECISE_LATITUDE = 51.50741234567
const PRECISE_LONGITUDE = -0.12781234567

describe('api-utils - selectMeasurementsUrlAndOptions basic URL building', () => {
  let mockLogger
  let mockConfig

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }
    mockConfig = {
      get: vi.fn()
    }
  })

  it('should build new Ricardo measurements URL when feature enabled', () => {
    mockConfig.get.mockReturnValue(RICARDO_API_URL)
    const mockOptionsEphemeralProtected = { headers: {} }
    const mockOptions = { headers: {} }
    const mockRequest = { headers: { host: TEST_HOST } }

    const result = selectMeasurementsUrlAndOptions(
      TEST_LATITUDE,
      TEST_LONGITUDE,
      {
        config: mockConfig,
        logger: mockLogger,
        optionsEphemeralProtected: mockOptionsEphemeralProtected,
        options: mockOptions,
        request: mockRequest
      }
    )

    expect(result.url).toContain('ricardo.api.com')
    expect(result.url).toContain('latitude=51.507400')
    expect(result.url).toContain('longitude=-0.127800')
    expect(result.url).toContain('page=1')
    expect(result.url).toContain('latest-measurement=true')
    expect(mockLogger.info).toHaveBeenCalled()
  })

  it('should use old measurements API when feature disabled', () => {
    mockConfig.get.mockReturnValue(OLD_MEASUREMENTS_API_URL)
    const mockOptions = { headers: {} }
    const mockRequest = { headers: { host: TEST_HOST } }

    const result = selectMeasurementsUrlAndOptions(
      TEST_LATITUDE,
      TEST_LONGITUDE,
      {
        config: mockConfig,
        logger: mockLogger,
        optionsEphemeralProtected: {},
        options: mockOptions,
        request: mockRequest
      }
    )

    // Function now always uses Ricardo API, so URL should contain Ricardo base
    expect(result.url).toContain('old.measurements.api.com')
    expect(mockLogger.info).toHaveBeenCalled()
  })
})

describe('api-utils - selectMeasurementsUrlAndOptions coordinate formatting', () => {
  let mockLogger
  let mockConfig

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }
    mockConfig = {
      get: vi.fn()
    }
  })

  it('should format coordinates to 6 decimal places', () => {
    mockConfig.get.mockReturnValue(RICARDO_API_URL)
    const mockOptions = { headers: {} }
    const mockRequest = { headers: { host: TEST_HOST } }

    const result = selectMeasurementsUrlAndOptions(
      PRECISE_LATITUDE,
      PRECISE_LONGITUDE,
      {
        config: mockConfig,
        logger: mockLogger,
        optionsEphemeralProtected: {},
        options: mockOptions,
        request: mockRequest
      }
    )

    expect(result.url).toContain('latitude=51.507412')
    expect(result.url).toContain('longitude=-0.127812')
  })
})

describe('api-utils - selectMeasurementsUrlAndOptions localhost handling', () => {
  let mockLogger
  let mockConfig

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }
    mockConfig = {
      get: vi.fn()
    }
  })

  it('should use ephemeral protected URL for localhost with new Ricardo', () => {
    mockConfig.get.mockImplementation((key) => {
      if (key === 'ricardoMeasurementsApiUrl') return RICARDO_API_URL
      if (key === 'ephemeralProtectedDevApiUrl') return DEV_API_URL
      return null
    })
    const mockOptionsEphemeralProtected = { headers: {} }
    const mockRequest = { headers: { host: LOCALHOST_HOST } }

    const result = selectMeasurementsUrlAndOptions(
      TEST_LATITUDE,
      TEST_LONGITUDE,
      {
        config: mockConfig,
        logger: mockLogger,
        optionsEphemeralProtected: mockOptionsEphemeralProtected,
        options: {},
        request: mockRequest
      }
    )

    expect(result.url).toContain(DEV_API_URL)
    expect(result.opts).toEqual(
      expect.objectContaining({
        headers: expect.any(Object)
      })
    )
  })
})

describe('api-utils - selectMeasurementsUrlAndOptions error handling', () => {
  let mockLogger
  let mockConfig

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }
    mockConfig = {
      get: vi.fn()
    }
  })

  it('should throw error when URLSearchParams not available', () => {
    const originalURLSearchParams = globalThis.URLSearchParams
    globalThis.URLSearchParams = null

    expect(() =>
      selectMeasurementsUrlAndOptions(TEST_LATITUDE, TEST_LONGITUDE, {
        config: mockConfig,
        logger: mockLogger,
        optionsEphemeralProtected: {},
        options: {},
        request: {}
      })
    ).toThrow('URLSearchParams is not available in this environment')

    globalThis.URLSearchParams = originalURLSearchParams
  })

  it('should throw error when ephemeralProtectedDevApiUrl missing for local new Ricardo', () => {
    mockConfig.get
      .mockReturnValueOnce(RICARDO_API_URL)
      .mockReturnValueOnce(null)
    const mockRequest = { headers: { host: LOCALHOST_HOST } }

    expect(() =>
      selectMeasurementsUrlAndOptions(TEST_LATITUDE, TEST_LONGITUDE, {
        config: mockConfig,
        logger: mockLogger,
        optionsEphemeralProtected: {},
        options: {},
        request: mockRequest
      })
    ).toThrow(
      'ephemeralProtectedDevApiUrl must be provided in config for local requests'
    )
  })
})

describe('api-utils - callAndHandleMeasurementsResponse', () => {
  let mockLogger

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }
  })

  it('should return data on successful fetch', async () => {
    const mockData = [{ site: 'test' }]
    const mockCatchFetchError = vi.fn().mockResolvedValue([STATUS_OK, mockData])

    const result = await callAndHandleMeasurementsResponse(
      TEST_URL,
      {},
      mockCatchFetchError,
      mockLogger
    )

    expect(result).toEqual(mockData)
    expect(mockLogger.info).toHaveBeenCalledWith('Data fetched successfully.')
  })

  it('should return empty array on error', async () => {
    const mockCatchFetchError = vi
      .fn()
      .mockResolvedValue([
        STATUS_INTERNAL_SERVER_ERROR,
        { message: 'Server error' }
      ])

    const result = await callAndHandleMeasurementsResponse(
      TEST_URL,
      {},
      mockCatchFetchError,
      mockLogger
    )

    expect(result).toEqual([])
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error fetching data: Server error'
    )
  })

  it('should handle null data response', async () => {
    const mockCatchFetchError = vi.fn().mockResolvedValue([STATUS_OK, null])

    const result = await callAndHandleMeasurementsResponse(
      TEST_URL,
      {},
      mockCatchFetchError,
      mockLogger
    )

    expect(result).toEqual([])
  })
})
