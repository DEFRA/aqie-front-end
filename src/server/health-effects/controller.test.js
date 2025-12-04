// '' Unit tests for unified healthEffectsHandler (EN & CY)
import { describe, it, expect, vi, beforeEach } from 'vitest' // ''
import { healthEffectsHandler } from './controller.js' // ''
import { english } from '../data/en/en.js' // ''
import { welsh } from '../data/cy/cy.js'
import {
  getReadableLocationName,
  buildHealthEffectsViewModel,
  buildBackLinkModel
} from './helpers/index.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js' // ''
import {
  STATUS_NOT_FOUND,
  STATUS_INTERNAL_SERVER_ERROR
} from '../data/constants.js'

const MOCK_SITE_URL = 'https://example.test'
// '' Define constant for duplicated string literal
const HEALTH_EFFECTS_PAGE_TITLE =
  'How you can reduce your exposure to air pollution'
const MOCK_LOCATION = 'Mock Location'
const LANG_EN = 'en'
const LANG_CY = 'cy'
const ABERTAWE = 'Abertawe'
const ABERTAWE_LOWER = 'abertawe'
const LEEDS = 'Leeds'
const LEEDS_LOWER = 'leeds'
const YORK = 'York'
const AIR_POLLUTION_IN_LEEDS = 'Air pollution in Leeds'
const WELSH_HEALTH_EFFECTS_TITLE = 'Effaith llygredd aer ar iechyd'
const CUSTOM_TITLE = 'Custom Title'
const HEALTH_EFFECTS_CY_INDEX = 'health-effects/cy/index'
const HEALTH_EFFECTS_INDEX = 'health-effects/index'
const LOCATION_LEEDS_LANG_EN = '/location/leeds?lang=en'
const PAGE_NOT_FOUND = 'Page Not Found'
const INTERNAL_SERVER_ERROR = 'Internal Server Error'
const HISTORY_BACK_URL = '#'

// '' Mock dependencies
vi.mock('../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => MOCK_SITE_URL) // ''
}))
vi.mock('./helpers/index.js', () => ({
  getReadableLocationName: vi.fn(() => MOCK_LOCATION), // ''
  buildHealthEffectsViewModel: vi.fn((opts = {}) => ({
    pageTitle:
      opts?.content?.healthEffects?.pageTitle || HEALTH_EFFECTS_PAGE_TITLE,
    locationName: opts.readableName || MOCK_LOCATION,
    lang: opts.lang || LANG_EN
  })),
  buildBackLinkModel: vi.fn((opts = {}) => ({
    text: opts.backLinkText || '',
    href: opts.backLinkUrl || ''
  }))
}))

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

// '' Helper to verify common expectations
const verifyCommonCalls = (request) => {
  expect(getAirQualitySiteUrl).toHaveBeenCalled()
  expect(getReadableLocationName).toHaveBeenCalledWith(
    request.query,
    request.params,
    expect.any(Object)
  )
}

// '' Helper to create mock request
const createRequest = (query, params, path) => ({ query, params, path })

// '' Helper to verify view model call
const verifyViewModelCall = (content, readableName, lang, locationId) => {
  expect(buildHealthEffectsViewModel).toHaveBeenCalledWith(
    expect.objectContaining({
      content,
      metaSiteUrl: MOCK_SITE_URL,
      readableName,
      lang,
      locationId
    })
  )
}

// '' Helper to verify view call
const verifyViewCall = (h, template, expectedContext) => {
  expect(h.view).toHaveBeenCalledWith(
    template,
    expect.objectContaining(expectedContext)
  )
}

// '' Helper to setup Welsh mocks
const setupWelshMocks = (locationName, pageTitle) => {
  getReadableLocationName.mockReturnValueOnce(locationName)
  buildHealthEffectsViewModel.mockReturnValueOnce({
    backLinkUrl: HISTORY_BACK_URL,
    pageTitle,
    locationName,
    lang: 'cy'
  })
}

// '' Helper to setup English mocks
const setupEnglishMocks = (locationName, backLinkText) => {
  getReadableLocationName.mockReturnValueOnce(locationName)
  buildHealthEffectsViewModel.mockReturnValueOnce({
    backLinkUrl: `/location/${locationName.toLowerCase()}?lang=en`,
    pageTitle: HEALTH_EFFECTS_PAGE_TITLE,
    locationName,
    lang: 'en',
    locationId: locationName.toLowerCase()
  })
  buildBackLinkModel.mockReturnValueOnce({
    text: backLinkText,
    href: `/location/${locationName.toLowerCase()}?lang=en`
  })
}

// '' Helper to setup custom content mocks
const setupCustomContentMocks = (locationName, customTitle) => {
  getReadableLocationName.mockReturnValueOnce(locationName)
  buildHealthEffectsViewModel.mockReturnValueOnce({
    backLinkUrl: `/location/${locationName.toLowerCase()}?lang=en`,
    pageTitle: customTitle,
    locationName,
    lang: 'en',
    locationId: locationName.toLowerCase()
  })
  buildBackLinkModel.mockReturnValueOnce({
    text: `Air pollution in ${locationName}`,
    href: `/location/${locationName.toLowerCase()}?lang=en`
  })
}

describe("'' healthEffectsHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks() // ''
  })

  it("'' renders Welsh view model for Welsh route", () => {
    setupWelshMocks(ABERTAWE, WELSH_HEALTH_EFFECTS_TITLE)
    const request = createRequest(
      { lang: LANG_CY },
      { id: ABERTAWE_LOWER },
      '/lleoliad/abertawe/effeithiau-iechyd'
    )
    const h = createH()
    const result = healthEffectsHandler(request, h)
    verifyCommonCalls(request)
    verifyViewModelCall(welsh, ABERTAWE, LANG_CY, ABERTAWE_LOWER)
    verifyViewCall(h, HEALTH_EFFECTS_CY_INDEX, {
      locationName: ABERTAWE,
      pageTitle: WELSH_HEALTH_EFFECTS_TITLE,
      lang: LANG_CY
    })
    expect(result.template).toBe(HEALTH_EFFECTS_CY_INDEX)
  })

  it("'' renders English view model for English route", () => {
    setupEnglishMocks(LEEDS, AIR_POLLUTION_IN_LEEDS)
    const request = createRequest(
      {},
      { id: LEEDS_LOWER },
      '/location/leeds/health-effects'
    )
    const h = createH()
    const result = healthEffectsHandler(request, h)
    verifyCommonCalls(request)
    verifyViewModelCall(english, LEEDS, LANG_EN, LEEDS_LOWER)
    expect(buildBackLinkModel).toHaveBeenCalledWith({
      backLinkText: AIR_POLLUTION_IN_LEEDS,
      backLinkUrl: LOCATION_LEEDS_LANG_EN
    })
    verifyViewCall(h, HEALTH_EFFECTS_INDEX, {
      locationName: LEEDS,
      pageTitle: HEALTH_EFFECTS_PAGE_TITLE,
      lang: LANG_EN,
      backLinkText: AIR_POLLUTION_IN_LEEDS,
      backlink: { text: AIR_POLLUTION_IN_LEEDS, href: LOCATION_LEEDS_LANG_EN }
    })
    expect(result.template).toBe(HEALTH_EFFECTS_INDEX)
  })

  it("'' uses provided customContent when passed", () => {
    const customContent = { healthEffects: { pageTitle: CUSTOM_TITLE } }
    setupCustomContentMocks(YORK, CUSTOM_TITLE)
    const request = createRequest(
      { lang: LANG_EN },
      { id: 'york' },
      '/location/york/health-effects'
    )
    const h = createH()
    healthEffectsHandler(request, h, customContent)
    expect(h.view.mock.calls[0][1].pageTitle).toBe(CUSTOM_TITLE)
    expect(buildHealthEffectsViewModel).toHaveBeenCalledWith(
      expect.objectContaining({ content: customContent })
    )
  })

  it("'' returns 404 for unknown route", () => {
    const request = createRequest({}, {}, '/unknown-route')
    const h = createH()
    const result = healthEffectsHandler(request, h)
    expect(h.response).toHaveBeenCalledWith(PAGE_NOT_FOUND)
    expect(result.statusCode).toBe(STATUS_NOT_FOUND)
  })

  it("'' returns 500 when view model build throws", () => {
    buildHealthEffectsViewModel.mockImplementationOnce(() => {
      throw new Error('Boom') // ''
    })
    const request = createRequest(
      {},
      { id: 'anything' },
      '/location/anything/health-effects'
    )
    const h = createH()
    const result = healthEffectsHandler(request, h)
    expect(h.response).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR)
    expect(result.statusCode).toBe(STATUS_INTERNAL_SERVER_ERROR)
  })
})
