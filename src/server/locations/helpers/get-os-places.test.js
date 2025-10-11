import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOSPlaces } from './get-os-places.js'

// Mock the dependencies
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
  const mockCatchProxyFetchError = vi.fn()
  const mockConfig = { get: vi.fn() }
  const mockIsValidFullPostcodeUK = vi.fn()
  const mockIsValidPartialPostcodeUK = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks
    mockConfig.get.mockImplementation((key) => {
      if (key === 'osNamesApiUrl') return 'https://api.test.com/'
      if (key === 'osNamesApiKey') return 'test-key'
      return ''
    })

    mockIsValidFullPostcodeUK.mockReturnValue(false)
    mockIsValidPartialPostcodeUK.mockReturnValue(false)
    mockCatchProxyFetchError.mockResolvedValue([
      200,
      { results: [{ data: 'test' }] }
    ])
  })

  it('should call getOSPlaces function without errors', async () => {
    const { catchProxyFetchError } = await import(
      '../common/helpers/catch-proxy-fetch-error.js'
    )

    catchProxyFetchError.mockResolvedValue([
      200,
      { results: [{ data: 'test' }] }
    ])

    const result = await getOSPlaces('London', 'London', 'England', true, {})

    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
  })

  it('should handle postcode input', async () => {
    const { catchProxyFetchError } = await import(
      '../common/helpers/catch-proxy-fetch-error.js'
    )
    const { isValidFullPostcodeUK } = await import('./convert-string.js')

    isValidFullPostcodeUK.mockReturnValue(true)
    catchProxyFetchError.mockResolvedValue([
      200,
      { results: [{ data: 'postcode test' }] }
    ])

    const result = await getOSPlaces('SW1A 1AA', '', '', true, {})

    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
  })
})
