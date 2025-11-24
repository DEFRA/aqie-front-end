// '' Tests for English healthEffectsHandler using Vitest (unit level)
import { describe, it, expect, vi, beforeEach } from 'vitest' // '' Vitest API

// '' Mock dependencies (must match specifiers used in controller.js)
vi.mock('../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example.test') // '' Stub site URL
}))

vi.mock('./helpers/index.js', () => ({
  getReadableLocationName: vi.fn(() => 'Mock Location'), // '' Default stub
  buildHealthEffectsViewModel: vi.fn((opts = {}) => {
    const customTitle =
      opts?.content?.healthEffects?.pageTitle || 'Health effects of air pollution' // '' Use content override if present
    return {
      backLinkUrl: 'javascript:history.back()',
      pageTitle: customTitle,
      locationName: opts.readableName || 'Mock Location',
      lang: opts.lang || 'en'
    }
  })
}))

// '' Import after mocks
import { healthEffectsHandler } from './controller.js'
import {
  getReadableLocationName,
  buildHealthEffectsViewModel
} from './helpers/index.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

// '' Fake hapi response toolkit
const createH = () => {
  const view = vi.fn((template, context) => ({ template, context })) // '' Simulate h.view
  const redirect = vi.fn((url) => ({
    code: (statusCode) => ({ redirectedTo: url, statusCode })
  })) // '' Simulate h.redirect
  const response = vi.fn((payload) => ({
    payload,
    code: (statusCode) => ({ payload, statusCode })
  })) // '' Simulate h.response
  return { view, redirect, response }
}

describe("'' healthEffectsHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks() // '' Reset mocks
  })

  it("'' redirects to Welsh page when lang=cy", () => {
    getReadableLocationName.mockReturnValueOnce('Bristol City') // '' Override name
    const request = {
      query: { lang: 'cy' },
      params: { id: 'bristol_city' },
      path: '/location/bristol_city/health-effects'
    }
    const h = createH()
    const result = healthEffectsHandler(request, h)
    expect(h.redirect).toHaveBeenCalledTimes(1)
    const redirectUrl = h.redirect.mock.calls[0][0]
    expect(redirectUrl).toMatch(/^\/effeithiau-iechyd\/cy\?lang=cy&locationName=Bristol%20City$/)
    expect(result.statusCode).toBe(302)
  })

  it("'' redirects to Welsh page (case-insensitive lang)", () => {
    getReadableLocationName.mockReturnValueOnce('Leeds City')
    const request = {
      query: { lang: 'CY' },
      params: { id: 'leeds_city' },
      path: '/location/leeds_city/health-effects'
    }
    const h = createH()
    const result = healthEffectsHandler(request, h)
    expect(h.redirect).toHaveBeenCalledTimes(1)
    const url = h.redirect.mock.calls[0][0]
    expect(url).toContain('lang=cy')
    expect(url).toContain('locationName=Leeds%20City')
    expect(result.statusCode).toBe(302)
  })

  it("'' redirects to Welsh without locationName when helper returns empty", () => {
    getReadableLocationName.mockReturnValueOnce('')
    const request = {
      query: { lang: 'cy' },
      params: { id: 'unknown' },
      path: '/location/unknown/health-effects'
    }
    const h = createH()
    const result = healthEffectsHandler(request, h)
    const url = h.redirect.mock.calls[0][0]
    expect(url).toBe('/effeithiau-iechyd/cy?lang=cy')
    expect(result.statusCode).toBe(302)
  })

  it("'' renders view model for standard English request", () => {
    getReadableLocationName.mockReturnValueOnce('Leeds')
    buildHealthEffectsViewModel.mockReturnValueOnce({
      backLinkUrl: 'javascript:history.back()',
      pageTitle: 'Health effects of air pollution',
      locationName: 'Leeds',
      lang: 'en'
    })
    const request = {
      query: {},
      params: { id: 'leeds' },
      path: '/location/leeds/health-effects'
    }
    const h = createH()
    const result = healthEffectsHandler(request, h)
    expect(getAirQualitySiteUrl).toHaveBeenCalled()
    expect(getReadableLocationName).toHaveBeenCalledWith(
      request.query,
      request.params,
      expect.any(Object)
    )
    expect(buildHealthEffectsViewModel).toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'health-effects/index',
      expect.objectContaining({
        locationName: 'Leeds',
        backLinkUrl: 'javascript:history.back()',
        lang: 'en'
      })
    )
    expect(result.template).toBe('health-effects/index')
  })

  it("'' uses provided content object when passed", () => {
    const customContent = { healthEffects: { pageTitle: 'Custom Title' } } // '' Custom content
    getReadableLocationName.mockReturnValueOnce('York')
    const request = {
      query: { lang: 'en' },
      params: { id: 'york' },
      path: '/location/york/health-effects'
    }
    const h = createH()
    healthEffectsHandler(request, h, customContent)
    const ctx = h.view.mock.calls[0][1]
    expect(ctx.pageTitle).toBe('Custom Title')
  })

  it("'' returns 500 when view model build throws", () => {
    buildHealthEffectsViewModel.mockImplementationOnce(() => {
      throw new Error('Boom') // '' Simulated failure
    })
    const request = {
      query: {},
      params: { id: 'anything' },
      path: '/location/anything/health-effects'
    }
    const h = createH()
    const result = healthEffectsHandler(request, h)
    expect(result.statusCode).toBe(500)
    expect(result.payload).toBe('Internal Server Error')
  })
})