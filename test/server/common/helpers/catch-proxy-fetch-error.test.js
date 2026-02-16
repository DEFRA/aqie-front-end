import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WRONG_POSTCODE } from '../../../../src/server/data/constants.js'

const mockLogger = {
  info: vi.fn(),
  error: vi.fn()
}

vi.mock('../../../../src/server/common/helpers/proxy.js', () => ({
  proxyFetch: vi.fn()
}))

vi.mock('../../../../src/server/common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => mockLogger)
}))

const TEST_URL = 'https://api.example.com/data'
const TEST_OPTIONS = { method: 'GET' }
const STATUS_OK = 200
const STATUS_ERROR = 500

describe('catchProxyFetchError - basic behavior', () => {
  let proxyFetch

  beforeEach(async () => {
    vi.clearAllMocks()
    const proxyModule = await import(
      '../../../../src/server/common/helpers/proxy.js'
    )
    proxyFetch = proxyModule.proxyFetch
  })

  it('should return WRONG_POSTCODE when shouldCallApi is false', async () => {
    // ''
    const { catchProxyFetchError } = await import(
      '../../../../src/server/common/helpers/catch-proxy-fetch-error.js'
    )
    const result = await catchProxyFetchError(TEST_URL, TEST_OPTIONS, false)

    expect(result).toEqual([STATUS_OK, WRONG_POSTCODE])
    expect(proxyFetch).not.toHaveBeenCalled()
  })

  it('should successfully fetch and return data when API call succeeds', async () => {
    // ''
    const mockData = { location: 'London' }
    const mockResponse = {
      ok: true,
      status: STATUS_OK,
      json: vi.fn().mockResolvedValue(mockData),
      headers: {
        get: vi.fn().mockReturnValue('10')
      }
    }
    proxyFetch.mockResolvedValue(mockResponse)

    const { catchProxyFetchError } = await import(
      '../../../../src/server/common/helpers/catch-proxy-fetch-error.js'
    )
    const result = await catchProxyFetchError(TEST_URL, TEST_OPTIONS, true)

    expect(result).toEqual([STATUS_OK, mockData])
    expect(proxyFetch).toHaveBeenCalledWith(TEST_URL, TEST_OPTIONS)
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining(`API response.status: ${STATUS_OK}`)
    )
  })

  it('should log API call duration', async () => {
    // ''
    const mockData = { location: 'Manchester' }
    const mockResponse = {
      ok: true,
      status: STATUS_OK,
      json: vi.fn().mockResolvedValue(mockData),
      headers: {
        get: vi.fn().mockReturnValue('10')
      }
    }
    proxyFetch.mockResolvedValue(mockResponse)

    const { catchProxyFetchError } = await import(
      '../../../../src/server/common/helpers/catch-proxy-fetch-error.js'
    )
    await catchProxyFetchError(TEST_URL, TEST_OPTIONS, true)

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringMatching(/API response\.status.*milliseconds/)
    )
  })
})

describe('catchProxyFetchError - error handling', () => {
  let proxyFetch

  beforeEach(async () => {
    vi.clearAllMocks()
    const proxyModule = await import(
      '../../../../src/server/common/helpers/proxy.js'
    )
    proxyFetch = proxyModule.proxyFetch
  })

  it('should handle non-ok response status', async () => {
    // ''
    const mockResponse = {
      ok: false,
      status: STATUS_ERROR,
      json: vi.fn()
    }
    proxyFetch.mockResolvedValue(mockResponse)

    const { catchProxyFetchError } = await import(
      '../../../../src/server/common/helpers/catch-proxy-fetch-error.js'
    )
    const result = await catchProxyFetchError(TEST_URL, TEST_OPTIONS, true)

    expect(result).toEqual([STATUS_ERROR, { error: 'service-unavailable' }])
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining(`Failed to fetch data from ${TEST_URL}`)
    )
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining(`Failed to proxyFetch data from ${TEST_URL}`)
    )
  })

  it('should handle fetch errors', async () => {
    // ''
    const mockError = new Error('Network error')
    proxyFetch.mockRejectedValue(mockError)

    const { catchProxyFetchError } = await import(
      '../../../../src/server/common/helpers/catch-proxy-fetch-error.js'
    )
    const result = await catchProxyFetchError(TEST_URL, TEST_OPTIONS, true)

    expect(result).toEqual([null, { error: 'service-unavailable' }])
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to proxyFetch data')
    )
  })
})
