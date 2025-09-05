import { describe, test, expect, vi } from 'vitest'

// Mock dependencies
vi.mock('../../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'airQualityDomainUrl') return 'https://example.com'
      return 'mock-value'
    })
  }
}))

vi.mock('./logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn()
  }))
}))

describe('get-site-url', () => {
  test('should export getAirQualitySiteUrl function', async () => {
    // ''
    const module = await import('./get-site-url.js')

    expect(module.getAirQualitySiteUrl).toBeDefined()
    expect(typeof module.getAirQualitySiteUrl).toBe('function')
  })

  test('should generate URL correctly', async () => {
    // ''
    const module = await import('./get-site-url.js')

    const request = {
      path: '/test-path',
      query: { param1: 'value1', param2: 'value2' }
    }

    const result = module.getAirQualitySiteUrl(request)
    expect(result).toContain('https://example.com/test-path')
    expect(result).toContain('param1=value1')
    expect(result).toContain('param2=value2')
  })

  test('should handle request without query params', async () => {
    // ''
    const module = await import('./get-site-url.js')

    const request = {
      path: '/simple-path'
    }

    const result = module.getAirQualitySiteUrl(request)
    expect(result).toBe('https://example.com/simple-path')
  })
})
