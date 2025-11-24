import routes from './mock-pollutant-route.js'
import { describe, it, expect, vi } from 'vitest'

// Mock dependencies ''
vi.mock('../common/helpers/mock-pollutant-level.js', () => ({
  mockPollutantBand: vi.fn((band, opts) => ({
    NO2: { value: 10, band, daqi: 2 },
    PM25: { value: 20, band, daqi: 3 }
  })),
  mockPollutantLevel: vi.fn((bands, opts) => ({
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
  it('GET /test-pollutants returns HTML for valid band', async () => {
    const route = routes.find((r) => r.path === '/test-pollutants')
    const request = { query: { band: 'high' } }
    const result = await route.handler(request, mockH)
    expect(result.type).toBe('text/html')
    expect(result.code).toBe(200)
    expect(result.payload).toContain('Mock Pollutant Band Test') // ''
  })

  it('GET /test-pollutants returns error for invalid band', async () => {
    const route = routes.find((r) => r.path === '/test-pollutants')
    const request = { query: { band: 'invalid' } }
    const result = await route.handler(request, mockH)
    expect(result.payload.error).toBe('Invalid band') // ''
    expect(result.code).toBe(400)
  })

  it('GET /test-pollutants returns JSON if format=json', async () => {
    const route = routes.find((r) => r.path === '/test-pollutants')
    const request = { query: { band: 'low', format: 'json' } }
    const result = await route.handler(request, mockH)
    expect(result.payload.band).toBe('low')
    expect(result.code).toBe(200)
    expect(result.payload.mockPollutants).toBeDefined() // ''
  })

  it('GET /test-pollutants-custom returns HTML', async () => {
    const route = routes.find((r) => r.path === '/test-pollutants-custom')
    const request = { query: {}, url: { href: '/test-pollutants-custom' } } // ''
    const result = await route.handler(request, mockH)
    expect(result.type).toBe('text/html')
    expect(result.code).toBe(200)
    expect(result.payload).toContain('Custom Mock Pollutant Levels') // ''
  })

  it('GET /test-pollutants-custom returns JSON if format=json', async () => {
    const route = routes.find((r) => r.path === '/test-pollutants-custom')
    const request = {
      query: { format: 'json', NO2: 'high' },
      url: { href: '/test-pollutants-custom?format=json&NO2=high' }
    } // ''
    const result = await route.handler(request, mockH)
    expect(result.code).toBe(200)
    expect(result.payload.pollutantBands.NO2).toBe('high')
    expect(result.payload.mockPollutants).toBeDefined() // ''
  })

  it('GET /test-pollutants-all returns HTML', async () => {
    const route = routes.find((r) => r.path === '/test-pollutants-all')
    const request = { query: {} }
    const result = await route.handler(request, mockH)
    expect(result.type).toBe('text/html')
    expect(result.code).toBe(200)
    expect(result.payload).toContain('All Pollutant Bands Comparison') // ''
  })

  it('GET /test-pollutants-all returns JSON if format=json', async () => {
    const route = routes.find((r) => r.path === '/test-pollutants-all')
    const request = { query: { format: 'json' } }
    const result = await route.handler(request, mockH)
    expect(result.code).toBe(200)
    expect(result.payload.bands).toBeDefined() // ''
  })

  it('GET /test/mock-pollutant/direct/{locationId} redirects', async () => {
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
    expect(result.code).toBe(302)
    expect(request.yar.set).toHaveBeenCalledWith('searchTermsSaved', true) // ''
  })
})
