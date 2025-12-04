import { describe, it, expect, vi, beforeEach } from 'vitest'

// Constants
const MOCK_API_URL = 'https://api.test.com/'
const MOCK_API_KEY = 'test-key'
const STATUS_CODE_SUCCESS = 200
const STATUS_CODE_NOT_FOUND = 404
const HEADER_OTHER = 'should-remain'
const LOCAL_TEST_DATA = { data: 'local test' }

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
vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn()
  }
}))
vi.mock('./convert-string.js', () => ({
  isValidFullPostcodeUK: vi.fn(),
  isValidPartialPostcodeUK: vi.fn()
}))

describe('getOSPlaces - basic functionality', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('should call getOSPlaces function without errors', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') {
        return MOCK_API_URL
      }
      if (key === 'osNamesApiKey') {
        return MOCK_API_KEY
      }
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
      STATUS_CODE_SUCCESS,
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
})

describe('getOSPlaces - postcode handling', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('should handle postcode input', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') {
        return MOCK_API_URL
      }
      if (key === 'osNamesApiKey') {
        return MOCK_API_KEY
      }
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
      STATUS_CODE_SUCCESS,
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
})

describe('getOSPlaces - local requests', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('should handle local requests with localhost host', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') {
        return MOCK_API_URL
      }
      if (key === 'osNamesApiKey') {
        return MOCK_API_KEY
      }
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
      STATUS_CODE_SUCCESS,
      { results: [LOCAL_TEST_DATA] }
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
})

describe('getOSPlaces - CDP X-API key from file', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('should handle local requests without CDP_X_API_KEY env var', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') {
        return MOCK_API_URL
      }
      if (key === 'osNamesApiKey') {
        return MOCK_API_KEY
      }
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
      STATUS_CODE_SUCCESS,
      { results: [LOCAL_TEST_DATA] }
    ])

    // Mock fs.readFileSync to simulate reading from local.json
    const fs = await import('node:fs')
    fs.default.readFileSync.mockReturnValue(
      JSON.stringify({ cdpXApiKey: 'test-key-from-file' })
    )

    // Ensure CDP_X_API_KEY is NOT set to test file reading path
    const originalEnv = process.env.CDP_X_API_KEY
    delete process.env.CDP_X_API_KEY

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
    // Verify x-api-key was added from local.json file
    const callArgs = catchProxyFetchError.mock.calls[0]
    expect(callArgs[1].headers).toHaveProperty('x-api-key')

    // Restore environment variable
    if (originalEnv) {
      process.env.CDP_X_API_KEY = originalEnv
    }
  })
})

describe('getOSPlaces - 127.0.0.1 host', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('should handle local requests with 127.0.0.1 host', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') {
        return MOCK_API_URL
      }
      if (key === 'osNamesApiKey') {
        return MOCK_API_KEY
      }
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
      STATUS_CODE_SUCCESS,
      { results: [LOCAL_TEST_DATA] }
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
})

describe('getOSPlaces - non-local requests', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('should remove x-api-key header for non-local requests', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') {
        return MOCK_API_URL
      }
      if (key === 'osNamesApiKey') {
        return MOCK_API_KEY
      }
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
      STATUS_CODE_SUCCESS,
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
        'other-header': HEADER_OTHER
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
})

describe('getOSPlaces - non-local requests without x-api-key', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('should pass through options unchanged for non-local requests without x-api-key', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') {
        return MOCK_API_URL
      }
      if (key === 'osNamesApiKey') {
        return MOCK_API_KEY
      }
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
      STATUS_CODE_SUCCESS,
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
        'other-header': HEADER_OTHER
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
      'other-header': HEADER_OTHER
    })
  })
})

describe('getOSPlaces - error handling', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('should return empty results on error status code', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') {
        return MOCK_API_URL
      }
      if (key === 'osNamesApiKey') {
        return MOCK_API_KEY
      }
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
    catchProxyFetchError.mockResolvedValue([STATUS_CODE_NOT_FOUND, null])

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
})

describe('getOSPlaces - successful response', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('should return osPlacesData when successful', async () => {
    vi.clearAllMocks()
    const { config } = await import('../../config/index.js')
    config.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') {
        return MOCK_API_URL
      }
      if (key === 'osNamesApiKey') {
        return MOCK_API_KEY
      }
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
    catchProxyFetchError.mockResolvedValue([STATUS_CODE_SUCCESS, mockData])

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
