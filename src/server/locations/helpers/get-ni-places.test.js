import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getNIPlaces } from './get-ni-places.js'

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
  formatNorthernIrelandPostcode: vi.fn()
}))

describe('getNIPlaces', () => {
  const mockCatchProxyFetchError = vi.fn()
  const mockConfig = { get: vi.fn() }
  const mockFormatPostcode = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks
    mockConfig.get.mockImplementation((key) => {
      if (key === 'osPlacesApiPostcodeNorthernIrelandUrl') {
        return 'https://api.test.com/'
      }
      if (key === 'mockOsPlacesApiPostcodeNorthernIrelandUrl') {
        return 'https://mock.test.com/'
      }
      return ''
    })

    mockFormatPostcode.mockReturnValue('BT1 1AA')
    mockCatchProxyFetchError.mockResolvedValue([
      200,
      { results: [{ data: 'test' }] }
    ])
  })

  it('should call getNIPlaces function without errors', async () => {
    const { catchProxyFetchError } = await import(
      '../common/helpers/catch-proxy-fetch-error.js'
    )
    // Removed unused variables 'config' and 'formatNorthernIrelandPostcode'

    catchProxyFetchError.mockResolvedValue([
      200,
      { results: [{ data: 'test' }] }
    ])

    const result = await getNIPlaces('BT1 1AA', false, {})

    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
  })

  it('should handle mock mode', async () => {
    const { catchProxyFetchError } = await import(
      '../common/helpers/catch-proxy-fetch-error.js'
    )

    catchProxyFetchError.mockResolvedValue([200, [{ data: 'mock test' }]])

    const result = await getNIPlaces('BT1 1AA', true, {})

    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
  })
})
