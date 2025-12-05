import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock config FIRST before any imports that use it
vi.mock('../../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'enabledMock') {
        return false
      }
      if (key === 'osPlacesApiPostcodeNorthernIrelandUrl') {
        return 'https://api.example.com/ni/'
      }
      if (key === 'mockOsPlacesApiPostcodeNorthernIrelandUrl') {
        return 'https://mock.example.com/ni/'
      }
      // Logger config
      if (key === 'log') {
        return { enabled: true }
      }
      return null
    })
  }
}))

// Mock the dependencies
vi.mock('../../common/helpers/catch-proxy-fetch-error.js', () => {
  const catchProxyFetchError = vi.fn()
  return { catchProxyFetchError }
})

vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn()
  }))
}))

vi.mock('./convert-string.js', () => ({
  formatNorthernIrelandPostcode: vi.fn((pc) => pc.replace(/\s/g, ''))
}))

vi.mock('./extracted/util-helpers.js', () => ({
  refreshOAuthToken: vi.fn(() => Promise.resolve('mock-token'))
}))

// Now import after mocks are set up
const { getNIPlaces } = await import('./get-ni-places.js')

describe('getNIPlaces', () => {
  let catchProxyFetchError
  let config

  beforeEach(async () => {
    ;({ catchProxyFetchError } = await import(
      '../../common/helpers/catch-proxy-fetch-error.js'
    ))
    ;({ config } = await import('../../../config/index.js'))
    catchProxyFetchError.mockResolvedValue([200, { results: [{ id: 'test' }] }])
  })

  it('should call getNIPlaces function without errors', async () => {
    const result = await getNIPlaces('BT1 1AA')
    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
  })

  it('should handle mock mode', async () => {
    // Override config to enable mock mode
    config.get.mockImplementation((key) => {
      if (key === 'enabledMock') {
        return true
      }
      if (key === 'mockOsPlacesApiPostcodeNorthernIrelandUrl') {
        return 'https://mock.example.com/ni/'
      }
      if (key === 'log') {
        return { enabled: true }
      }
      return null
    })

    catchProxyFetchError.mockResolvedValue([200, [{ id: 'mock test' }]])
    const result = await getNIPlaces('BT1 1AA')
    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
    expect(result.results).toBeInstanceOf(Array)
  })

  it('should call catchProxyFetchError and return defined result', async () => {
    catchProxyFetchError.mockResolvedValue([200, { results: [{ id: 'test' }] }])
    const result = await getNIPlaces('BT1 1AA')
    expect(catchProxyFetchError).toHaveBeenCalled()
    expect(result).toBeDefined()
    expect(result.results).toBeInstanceOf(Array)
  })
})
