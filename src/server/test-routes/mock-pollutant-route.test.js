import routes from './mock-pollutant-route.js'
import { describe, it, expect, vi } from 'vitest'

// Mock dependencies ''
vi.mock('../common/helpers/mock-pollutant-level.js', () => ({
  mockPollutantBand: vi.fn((band, _opts) => ({
    NO2: { value: 10, band, daqi: 2 },
    PM25: { value: 20, band, daqi: 3 }
  })),
  mockPollutantLevel: vi.fn((bands, _opts) => ({
    NO2: { value: 10, band: bands.NO2 || 'moderate', daqi: 2 },
    PM25: { value: 20, band: bands.PM25 || 'high', daqi: 3 }
  })),
  getAvailableBands: vi.fn(() => [
    { key: 'low', label: 'Low' },
    { key: 'moderate', label: 'Moderate' },
    { key: 'high', label: 'High' },
    { key: 'very-high', label: 'Very High' }
  ])
}))

const mockH = {
  response: (payload) => ({
    payload,
    type: (t) => ({
      payload,
      type: t,
      code: (c) => ({ payload, type: t, code: c })
    }),
    code: (c) => ({ payload, code: c })
  }),
  redirect: (url) => ({
    redirect: url,
    code: (c) => ({ redirect: url, code: c })
  }) // ''
}

describe('mock-pollutant-route', () => {
  const TEST_POLLUTANTS_PATH = '/test-pollutants'
  const TEST_POLLUTANTS_CUSTOM_PATH = '/test-pollutants-custom'
  const HTTP_OK = 200
  const HTTP_BAD_REQUEST = 400
  const HTTP_REDIRECT = 302

  describe('GET /test-pollutants', () => {
    it('returns HTML for valid band', async () => {
      const route = routes.find((r) => r.path === TEST_POLLUTANTS_PATH)
      const request = { query: { band: 'high' } }
      const result = await route.handler(request, mockH)
      expect(result.type).toBe('text/html')
      expect(result.code).toBe(HTTP_OK)
      expect(result.payload).toContain('Mock Pollutant Band Test') // ''
    })

    it('returns error for invalid band', async () => {
      const route = routes.find((r) => r.path === TEST_POLLUTANTS_PATH)
      const request = { query: { band: 'invalid' } }
      const result = await route.handler(request, mockH)
      expect(result.payload.error).toBe('Invalid band') // ''
      expect(result.code).toBe(HTTP_BAD_REQUEST)
    })

    it('returns JSON if format=json', async () => {
      const route = routes.find((r) => r.path === TEST_POLLUTANTS_PATH)
      const request = { query: { band: 'low', format: 'json' } }
      const result = await route.handler(request, mockH)
      expect(result.payload.band).toBe('low')
      expect(result.code).toBe(HTTP_OK)
      expect(result.payload.mockPollutants).toBeDefined() // ''
    })
  })

  describe('GET /test-pollutants-custom', () => {
    it('returns HTML', async () => {
      const route = routes.find((r) => r.path === TEST_POLLUTANTS_CUSTOM_PATH)
      const request = { query: {}, url: { href: '/test-pollutants-custom' } } // ''
      const result = await route.handler(request, mockH)
      expect(result.type).toBe('text/html')
      expect(result.code).toBe(HTTP_OK)
      expect(result.payload).toContain('Custom Mock Pollutant Levels') // ''
    })

    it('returns JSON if format=json', async () => {
      const route = routes.find((r) => r.path === TEST_POLLUTANTS_CUSTOM_PATH)
      const request = {
        query: { format: 'json', NO2: 'high' },
        url: { href: '/test-pollutants-custom?format=json&NO2=high' }
      } // ''
      const result = await route.handler(request, mockH)
      expect(result.code).toBe(HTTP_OK)
      expect(result.payload.pollutantBands.NO2).toBe('high')
      expect(result.payload.mockPollutants).toBeDefined() // ''
    })
  })

  describe('GET /test-pollutants-all', () => {
    it('returns HTML', async () => {
      const route = routes.find((r) => r.path === '/test-pollutants-all')
      const request = { query: {} }
      const result = await route.handler(request, mockH)
      expect(result.type).toBe('text/html')
      expect(result.code).toBe(HTTP_OK)
      expect(result.payload).toContain('All Pollutant Bands Comparison') // ''
    })

    it('returns JSON if format=json', async () => {
      const route = routes.find((r) => r.path === '/test-pollutants-all')
      const request = { query: { format: 'json' } }
      const result = await route.handler(request, mockH)
      expect(result.code).toBe(HTTP_OK)
      expect(result.payload.bands).toBeDefined() // ''
    })
  })

  describe('GET /test/mock-pollutant/direct/{locationId}', () => {
    it('redirects', async () => {
      const route = routes.find(
        (r) => r.path === '/test/mock-pollutant/direct/{locationId}'
      )
      const request = {
        params: { locationId: '123' },
        query: { mockPollutantBand: 'high' },
        yar: { set: vi.fn() }
      }
      const result = await route.handler(request, mockH)
      expect(result.redirect).toContain('/location/123?mockPollutantBand=high') // ''
      expect(result.code).toBe(HTTP_REDIRECT)
      expect(request.yar.set).toHaveBeenCalledWith('searchTermsSaved', true) // ''
    })
  })
})
