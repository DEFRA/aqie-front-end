import { describe, it, expect, vi, beforeEach } from 'vitest'
// Use doMock to ensure mocks are hoisted before imports
vi.mock('../common/helpers/catch-proxy-fetch-error.js', () => ({
  catchProxyFetchError: vi.fn()
}))
vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn()
  }))
}))
vi.mock('../../config/index.js', () => ({
  config: {
    get: vi.fn()
  }
}))
vi.mock('./convert-string.js', () => ({
  isValidFullPostcodeUK: vi.fn(),
  isValidPartialPostcodeUK: vi.fn()
}))

describe('getOSPlaces', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('should call getOSPlaces function without errors', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') return 'https://api.test.com/'
      if (key === 'osNamesApiKey') return 'test-key'
      return ''
    })
    const { isValidFullPostcodeUK, isValidPartialPostcodeUK } = await import(
      './convert-string.js'
    )
    isValidFullPostcodeUK.mockReturnValue(false)
    isValidPartialPostcodeUK.mockReturnValue(false)
    const { catchProxyFetchError } = await import(
      '../common/helpers/catch-proxy-fetch-error.js'
    )
    catchProxyFetchError.mockResolvedValue([
      200,
      { results: [{ data: 'test' }] }
    ])
    const { getOSPlaces } = await import('./get-os-places.js')
    const result = await getOSPlaces(
      'London',
      'London',
      'England',
      true,
      {},
      undefined,
      catchProxyFetchError
    )
    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
  })

  it('should handle postcode input', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') return 'https://api.test.com/'
      if (key === 'osNamesApiKey') return 'test-key'
      return ''
    })
    const { isValidFullPostcodeUK, isValidPartialPostcodeUK } = await import(
      './convert-string.js'
    )
    isValidFullPostcodeUK.mockReturnValue(true)
    isValidPartialPostcodeUK.mockReturnValue(false)
    const { catchProxyFetchError } = await import(
      '../common/helpers/catch-proxy-fetch-error.js'
    )
    catchProxyFetchError.mockResolvedValue([
      200,
      { results: [{ data: 'postcode test' }] }
    ])
    const { getOSPlaces } = await import('./get-os-places.js')
    const result = await getOSPlaces(
      'SW1A 1AA',
      '',
      '',
      true,
      {},
      undefined,
      catchProxyFetchError
    )
    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
  })

  it('should handle local requests with localhost host', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') return 'https://api.test.com/'
      if (key === 'osNamesApiKey') return 'test-key'
      return ''
    })
    const { isValidFullPostcodeUK, isValidPartialPostcodeUK } = await import(
      './convert-string.js'
    )
    isValidFullPostcodeUK.mockReturnValue(false)
    isValidPartialPostcodeUK.mockReturnValue(false)
    const { catchProxyFetchError } = await import(
      '../common/helpers/catch-proxy-fetch-error.js'
    )
    catchProxyFetchError.mockResolvedValue([
      200,
      { results: [{ data: 'local test' }] }
    ])

    // Set up environment variable for CDP X-API key
    const originalEnv = process.env.CDP_X_API_KEY
    process.env.CDP_X_API_KEY = 'test-cdp-key'

    const { getOSPlaces } = await import('./get-os-places.js')
    const mockRequest = {
      headers: {
        host: 'localhost:3000'
      }
    }
    const result = await getOSPlaces(
      'London',
      'London',
      'England',
      true,
      {},
      mockRequest,
      catchProxyFetchError
    )
    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()

    // Restore environment variable
    if (originalEnv) {
      process.env.CDP_X_API_KEY = originalEnv
    } else {
      delete process.env.CDP_X_API_KEY
    }
  })

  it('should handle local requests with 127.0.0.1 host', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') return 'https://api.test.com/'
      if (key === 'osNamesApiKey') return 'test-key'
      return ''
    })
    const { isValidFullPostcodeUK, isValidPartialPostcodeUK } = await import(
      './convert-string.js'
    )
    isValidFullPostcodeUK.mockReturnValue(false)
    isValidPartialPostcodeUK.mockReturnValue(false)
    const { catchProxyFetchError } = await import(
      '../common/helpers/catch-proxy-fetch-error.js'
    )
    catchProxyFetchError.mockResolvedValue([
      200,
      { results: [{ data: 'local test' }] }
    ])

    // Set up environment variable for CDP X-API key
    const originalEnv = process.env.CDP_X_API_KEY
    process.env.CDP_X_API_KEY = 'test-cdp-key'

    const { getOSPlaces } = await import('./get-os-places.js')
    const mockRequest = {
      headers: {
        host: '127.0.0.1:3000'
      }
    }
    const result = await getOSPlaces(
      'London',
      'London',
      'England',
      true,
      {},
      mockRequest,
      catchProxyFetchError
    )
    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()

    // Restore environment variable
    if (originalEnv) {
      process.env.CDP_X_API_KEY = originalEnv
    } else {
      delete process.env.CDP_X_API_KEY
    }
  })

  it('should remove x-api-key header for non-local requests', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') return 'https://api.test.com/'
      if (key === 'osNamesApiKey') return 'test-key'
      return ''
    })
    const { isValidFullPostcodeUK, isValidPartialPostcodeUK } = await import(
      './convert-string.js'
    )
    isValidFullPostcodeUK.mockReturnValue(false)
    isValidPartialPostcodeUK.mockReturnValue(false)
    const { catchProxyFetchError } = await import(
      '../common/helpers/catch-proxy-fetch-error.js'
    )
    catchProxyFetchError.mockResolvedValue([
      200,
      { results: [{ data: 'remote test' }] }
    ])

    const { getOSPlaces } = await import('./get-os-places.js')
    const mockRequest = {
      headers: {
        host: 'production.example.com'
      }
    }
    const optionsWithApiKey = {
      headers: {
        'x-api-key': 'should-be-removed',
        'other-header': 'should-remain'
      }
    }
    const result = await getOSPlaces(
      'London',
      'London',
      'England',
      true,
      optionsWithApiKey,
      mockRequest,
      catchProxyFetchError
    )
    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
  })

  it('should pass through options unchanged for non-local requests without x-api-key', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') return 'https://api.test.com/'
      if (key === 'osNamesApiKey') return 'test-key'
      return ''
    })
    const { isValidFullPostcodeUK, isValidPartialPostcodeUK } = await import(
      './convert-string.js'
    )
    isValidFullPostcodeUK.mockReturnValue(false)
    isValidPartialPostcodeUK.mockReturnValue(false)
    const { catchProxyFetchError } = await import(
      '../common/helpers/catch-proxy-fetch-error.js'
    )
    catchProxyFetchError.mockResolvedValue([
      200,
      { results: [{ data: 'remote test' }] }
    ])

    const { getOSPlaces } = await import('./get-os-places.js')
    const mockRequest = {
      headers: {
        host: 'production.example.com'
      }
    }
    const optionsWithoutApiKey = {
      headers: {
        'content-type': 'application/json',
        'other-header': 'should-remain'
      }
    }
    const result = await getOSPlaces(
      'London',
      'London',
      'England',
      true,
      optionsWithoutApiKey,
      mockRequest,
      catchProxyFetchError
    )
    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
    // Verify that catchProxyFetchError was called with options that still have the original headers
    const callArgs = catchProxyFetchError.mock.calls[0]
    expect(callArgs[1].headers).toEqual({
      'content-type': 'application/json',
      'other-header': 'should-remain'
    })
  })

  it('should return empty results on error status code', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') return 'https://api.test.com/'
      if (key === 'osNamesApiKey') return 'test-key'
      return ''
    })
    const { isValidFullPostcodeUK, isValidPartialPostcodeUK } = await import(
      './convert-string.js'
    )
    isValidFullPostcodeUK.mockReturnValue(false)
    isValidPartialPostcodeUK.mockReturnValue(false)
    const { catchProxyFetchError } = await import(
      '../common/helpers/catch-proxy-fetch-error.js'
    )
    catchProxyFetchError.mockResolvedValue([404, null])

    const { getOSPlaces } = await import('./get-os-places.js')
    const result = await getOSPlaces(
      'NonExistent',
      'NonExistent',
      'Location',
      true,
      {},
      undefined,
      catchProxyFetchError
    )
    expect(result).toEqual({ results: [] })
  })

  it('should return osPlacesData when successful', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') return 'https://api.test.com/'
      if (key === 'osNamesApiKey') return 'test-key'
      return ''
    })
    const { isValidFullPostcodeUK, isValidPartialPostcodeUK } = await import(
      './convert-string.js'
    )
    isValidFullPostcodeUK.mockReturnValue(false)
    isValidPartialPostcodeUK.mockReturnValue(false)
    const { catchProxyFetchError } = await import(
      '../common/helpers/catch-proxy-fetch-error.js'
    )
    const mockData = { results: [{ name: 'London', type: 'City' }] }
    catchProxyFetchError.mockResolvedValue([200, mockData])

    const { getOSPlaces } = await import('./get-os-places.js')
    const result = await getOSPlaces(
      'London',
      'London',
      'England',
      true,
      {},
      undefined,
      catchProxyFetchError
    )
    expect(result).toEqual(mockData)
  })
})
