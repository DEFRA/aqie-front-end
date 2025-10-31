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
})
