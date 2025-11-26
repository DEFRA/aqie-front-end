// '' Tests for Welsh healthEffectsHandlerCy
import { describe, it, expect, vi, beforeEach } from 'vitest'

// '' Import after mocks
import { healthEffectsHandlerCy } from './controller.js'
import {
  getReadableLocationName,
  buildHealthEffectsViewModel
} from '../helpers/index.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js' // '' Vitest API

// '' Mock site URL helper
vi.mock('../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example.test') // '' Stub URL
}))

// '' Mock logger
vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    error: vi.fn()
  })
}))

// '' Mock pure helpers
vi.mock('../helpers/index.js', () => ({
  getReadableLocationName: vi.fn(() => 'Caerdydd'), // '' Default Welsh location name
  buildHealthEffectsViewModel: vi.fn(
    ({ readableName = 'Caerdydd', lang = 'cy' } = {}) => ({
      pageTitle: 'How you can reduce your exposure to air pollution',
      backLinkUrl: 'javascript:history.back()',
      backLinkText: `Air pollution in ${readableName}`,
      locationName: readableName,
      lang
    })
  )
}))

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

describe("'' healthEffectsHandlerCy", () => {
  beforeEach(() => {
    vi.clearAllMocks() // '' Reset mocks
  })

  it("'' redirects to English when lang=en (lowercase)", () => {
    getReadableLocationName.mockReturnValueOnce('Caerdydd')
    const request = {
      query: { lang: 'en' },
      params: { id: 'caerdydd' },
      path: '/effeithiau-iechyd/cy'
    }
    const h = createH()
    const result = healthEffectsHandlerCy(request, h)
    expect(getReadableLocationName).toHaveBeenCalled()
    expect(h.redirect).toHaveBeenCalledTimes(1)
    const url = h.redirect.mock.calls[0][0]
    expect(url).toBe('/health-effects?lang=en&locationName=Caerdydd')
    expect(result.statusCode).toBe(302)
  })

  it("'' redirects to English when lang=EN (case-insensitive)", () => {
    getReadableLocationName.mockReturnValueOnce('Abertawe')
    const request = {
      query: { lang: 'EN' },
      params: { id: 'abertawe' },
      path: '/effeithiau-iechyd/cy'
    }
    const h = createH()
    const result = healthEffectsHandlerCy(request, h)
    const url = h.redirect.mock.calls[0][0]
    expect(url).toBe('/health-effects?lang=en&locationName=Abertawe')
    expect(result.statusCode).toBe(302)
  })

  it("'' redirects to English without locationName when helper empty", () => {
    getReadableLocationName.mockReturnValueOnce('')
    const request = {
      query: { lang: 'en' },
      params: { id: '' },
      path: '/effeithiau-iechyd/cy'
    }
    const h = createH()
    const result = healthEffectsHandlerCy(request, h)
    const url = h.redirect.mock.calls[0][0]
    expect(url).toBe('/health-effects?lang=en')
    expect(result.statusCode).toBe(302)
  })

  it("'' renders Welsh view model normally", () => {
    getReadableLocationName.mockReturnValueOnce('Caerdydd')
    const request = {
      query: { lang: 'cy' },
      params: { id: 'caerdydd' },
      path: '/effeithiau-iechyd/cy'
    }
    const h = createH()
    const result = healthEffectsHandlerCy(request, h)
    expect(getAirQualitySiteUrl).toHaveBeenCalled()
    expect(buildHealthEffectsViewModel).toHaveBeenCalledWith(
      expect.objectContaining({
        readableName: 'Caerdydd',
        lang: 'cy'
      })
    )
    expect(h.view).toHaveBeenCalledTimes(1)
    const [template, ctx] = h.view.mock.calls[0]
    expect(template).toBe('health-effects/cy/index')
    expect(ctx.locationName).toBe('Caerdydd')
    expect(ctx.page).toBe('Effaith llygredd aer ar iechyd')
    expect(ctx.pageTitle).toBe('Effaith llygredd aer ar iechyd')
    expect(ctx.backLinkText).toBe('Llygredd aer yn Caerdydd')
    expect(result.template).toBe('health-effects/cy/index')
  })

  it("'' applies custom content overrides", () => {
    getReadableLocationName.mockReturnValueOnce('Casnewydd')
    buildHealthEffectsViewModel.mockImplementationOnce(({ readableName }) => ({
      pageTitle: 'Custom EN Title', // '' Will be overridden to Welsh
      backLinkUrl: 'javascript:history.back()',
      backLinkText: `Air pollution in ${readableName}`,
      locationName: readableName,
      lang: 'cy'
    }))
    const customContent = {
      healthEffects: { pageTitle: 'Ignored EN Title' }
    }
    const request = {
      query: { lang: 'cy' },
      params: { id: 'casnewydd' },
      path: '/effeithiau-iechyd/cy'
    }
    const h = createH()
    healthEffectsHandlerCy(request, h, customContent)
    const ctx = h.view.mock.calls[0][1]
    expect(ctx.pageTitle).toBe('Effaith llygredd aer ar iechyd')
    expect(ctx.locationName).toBe('Casnewydd')
  })

  it("'' returns 500 when helper throws", () => {
    buildHealthEffectsViewModel.mockImplementationOnce(() => {
      throw new Error('Boom') // '' Force failure
    })
    const request = {
      query: { lang: 'cy' },
      params: { id: 'caerdydd' },
      path: '/effeithiau-iechyd/cy'
    }
    const h = createH()
    const result = healthEffectsHandlerCy(request, h)
    expect(result.statusCode).toBe(500)
    expect(result.payload).toBe('Internal Server Error')
  })
})
