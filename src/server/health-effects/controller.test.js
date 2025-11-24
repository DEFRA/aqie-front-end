// '' Unit tests for unified healthEffectsHandler (EN & CY)
import { describe, it, expect, vi, beforeEach } from 'vitest' // ''
import { healthEffectsHandler } from './controller.js' // ''
import { english } from '../data/en/en.js' // ''
import { welsh } from '../data/cy/cy.js' // ''

// '' Mock dependencies
vi.mock('../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example.test') // ''
}))
vi.mock('./helpers/index.js', () => ({
  getReadableLocationName: vi.fn(() => 'Mock Location'), // ''
  buildHealthEffectsViewModel: vi.fn((opts = {}) => ({
    backLinkUrl: 'javascript:history.back()',
    pageTitle: opts?.content?.healthEffects?.pageTitle || 'Health effects of air pollution',
    locationName: opts.readableName || 'Mock Location',
    lang: opts.lang || 'en'
  }))
}))
import { getReadableLocationName, buildHealthEffectsViewModel } from './helpers/index.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

// '' Fake hapi response toolkit
const createH = () => {
  const view = vi.fn((template, context) => ({ template, context })) // ''
  const redirect = vi.fn((url) => ({
    code: (statusCode) => ({ redirectedTo: url, statusCode })
  })) // ''
  const response = vi.fn((payload) => ({
    payload,
    code: (statusCode) => ({ payload, statusCode })
  })) // ''
  return { view, redirect, response }
}

describe("'' healthEffectsHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks() // ''
  })

  it("'' renders Welsh view model for Welsh route", () => {
    getReadableLocationName.mockReturnValueOnce('Abertawe')
    buildHealthEffectsViewModel.mockReturnValueOnce({
      backLinkUrl: 'javascript:history.back()',
      pageTitle: 'Effaith llygredd aer ar iechyd',
      locationName: 'Abertawe',
      lang: 'cy'
    })
    const request = {
      query: { lang: 'cy' },
      params: { id: 'abertawe' },
      path: '/lleoliad/abertawe/effeithiau-iechyd'
    }
    const h = createH()
    const result = healthEffectsHandler(request, h)
    expect(getAirQualitySiteUrl).toHaveBeenCalled()
    expect(getReadableLocationName).toHaveBeenCalledWith(
      request.query,
      request.params,
      expect.any(Object)
    )
    expect(buildHealthEffectsViewModel).toHaveBeenCalledWith(
      expect.objectContaining({
        content: welsh,
        metaSiteUrl: 'https://example.test',
        readableName: 'Abertawe',
        lang: 'cy',
        locationId: 'abertawe'
      })
    )
    expect(h.view).toHaveBeenCalledWith(
      'health-effects/cy/index',
      expect.objectContaining({
        locationName: 'Abertawe',
        pageTitle: 'Effaith llygredd aer ar iechyd',
        lang: 'cy'
      })
    )
    expect(result.template).toBe('health-effects/cy/index')
  })

  it("'' renders English view model for English route", () => {
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
    expect(buildHealthEffectsViewModel).toHaveBeenCalledWith(
      expect.objectContaining({
        content: english,
        metaSiteUrl: 'https://example.test',
        readableName: 'Leeds',
        lang: 'en',
        locationId: 'leeds'
      })
    )
    expect(h.view).toHaveBeenCalledWith(
      'health-effects/index',
      expect.objectContaining({
        locationName: 'Leeds',
        pageTitle: 'Health effects of air pollution',
        lang: 'en'
      })
    )
    expect(result.template).toBe('health-effects/index')
  })

  it("'' uses provided customContent when passed", () => {
    const customContent = { healthEffects: { pageTitle: 'Custom Title' } }
    getReadableLocationName.mockReturnValueOnce('York')
    buildHealthEffectsViewModel.mockReturnValueOnce({
      backLinkUrl: 'javascript:history.back()',
      pageTitle: 'Custom Title',
      locationName: 'York',
      lang: 'en'
    })
    const request = {
      query: { lang: 'en' },
      params: { id: 'york' },
      path: '/location/york/health-effects'
    }
    const h = createH()
    healthEffectsHandler(request, h, customContent)
    const ctx = h.view.mock.calls[0][1]
    expect(ctx.pageTitle).toBe('Custom Title')
    expect(buildHealthEffectsViewModel).toHaveBeenCalledWith(
      expect.objectContaining({
        content: customContent
      })
    )
  })

  it("'' returns 404 for unknown route", () => {
    const request = {
      query: {},
      params: {},
      path: '/unknown-route'
    }
    const h = createH()
    const result = healthEffectsHandler(request, h)
    expect(h.response).toHaveBeenCalledWith('Page Not Found')
    expect(result.statusCode).toBe(404)
  })

  it("'' returns 500 when view model build throws", () => {
    buildHealthEffectsViewModel.mockImplementationOnce(() => {
      throw new Error('Boom') // ''
    })
    const request = {
      query: {},
      params: { id: 'anything' },
      path: '/location/anything/health-effects'
    }
    const h = createH()
    const result = healthEffectsHandler(request, h)
    expect(h.response).toHaveBeenCalledWith('Internal Server Error')
    expect(result.statusCode).toBe(500)
  })
})