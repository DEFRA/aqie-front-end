import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getNIPlaces } from './get-ni-places.js'

// Mock the dependencies
vi.mock('../../common/helpers/catch-proxy-fetch-error.js', () => {
  const catchProxyFetchError = vi.fn()
  return { catchProxyFetchError }
})

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
  let catchProxyFetchError
  beforeEach(async () => {
    ;({ catchProxyFetchError } = await import(
      '../../common/helpers/catch-proxy-fetch-error.js'
    ))
    catchProxyFetchError.mockResolvedValue([200, { results: [{ id: 'test' }] }])
  })

  it('should call getNIPlaces function without errors', async () => {
    const result = await getNIPlaces('BT1 1AA', false, {})
    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
  })

  it('should handle mock mode', async () => {
    catchProxyFetchError.mockResolvedValue([200, [{ id: 'mock test' }]])
    const result = await getNIPlaces('BT1 1AA', true, {})
    expect(result).toBeDefined()
    expect(catchProxyFetchError).toHaveBeenCalled()
  })

  it('should call catchProxyFetchError and return defined result', async () => {
    catchProxyFetchError.mockResolvedValue([200, { results: [{ id: 'test' }] }])
    const result = await getNIPlaces('BT1 1AA', false, {})
    expect(catchProxyFetchError).toHaveBeenCalled()
    expect(result).toBeDefined()
    expect(result.results).toBeInstanceOf(Array)
  })
})
