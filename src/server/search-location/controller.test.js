/* global vi */
import { english } from '../data/en/en.js'
import { searchLocationController } from './controller.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

vi.mock('../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn((request) => {
    return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
  })
}))

const VIEW_RENDERED = 'view rendered'
const REDIRECTED = 'redirected'
const SEARCH_LOCATION_PATH = '/search-location'
const SEARCH_LOCATION_INDEX = 'search-location/index'
const WELSH_SEARCH_PATH = '/chwilio-lleoliad/cy'
const LANG_EN = 'en'
const LANG_CY = 'cy'
const BASE_URL = 'https://check-air-quality.service.gov.uk'

const createMockRequestResponse = () => {
  const mockRequest = {
    query: {},
    path: '',
    yar: {
      set: vi.fn(),
      get: vi.fn(() => null)
    }
  }
  const mockH = {
    redirect: vi.fn().mockImplementation((_url) => {
      return {
        code: vi.fn().mockImplementation((_statusCode) => {
          return 'redirected'
        })
      }
    }),
    view: vi.fn().mockReturnValue(VIEW_RENDERED)
  }
  return { mockRequest, mockH }
}

const createRequestWithYar = (lang, path) => ({
  query: { lang },
  path,
  yar: {
    set: vi.fn(),
    get: vi.fn(() => null)
  }
})

const createErrorViewData = (
  mockContent,
  actualUrl,
  lang,
  errors,
  errorMessage
) => ({
  pageTitle: `Error: ${mockContent.searchLocation.pageTitle}`,
  description: mockContent.searchLocation.description,
  metaSiteUrl: actualUrl,
  heading: mockContent.searchLocation.heading,
  page: mockContent.searchLocation.page,
  serviceName: mockContent.searchLocation.serviceName,
  searchParams: {
    label: {
      text: mockContent.searchLocation.searchParams.label.text,
      classes: 'govuk-label--l govuk-!-margin-bottom-6',
      isPageHeading: true
    },
    hint: {
      text: mockContent.searchLocation.searchParams.hint.text1
    },
    id: 'location',
    name: 'location'
  },
  locations: mockContent.searchLocation.searchParams.locations,
  button: mockContent.searchLocation.button,
  locationType: null,
  errors: errors.errors,
  errorMessage: errorMessage.errorMessage,
  errorMessageRadio: errorMessage.errorMessage,
  footerTxt: mockContent.footerTxt,
  phaseBanner: mockContent.phaseBanner,
  backlink: mockContent.backlink,
  cookieBanner: mockContent.cookieBanner,
  lang,
  currentPath: SEARCH_LOCATION_PATH
})

const verifyRedirect = (result, mockH, expectedPath) => {
  expect(result).toBe(REDIRECTED)
  expect(mockH.redirect).toHaveBeenCalledWith(expectedPath)
}

const verifyView = (result, mockH, expectedViewData) => {
  expect(result).toBe(VIEW_RENDERED)
  expect(mockH.view).toHaveBeenCalledWith(
    SEARCH_LOCATION_INDEX,
    expectedViewData
  )
}

const verifyUrlMatch = (request, expectedUrl) => {
  const actualUrl = getAirQualitySiteUrl(request)
  expect(actualUrl).toBe(expectedUrl)
  return actualUrl
}

const createViewData = (mockContent, actualUrl, lang, currentPath) => ({
  pageTitle: mockContent.searchLocation.pageTitle,
  description: mockContent.searchLocation.description,
  metaSiteUrl: actualUrl,
  heading: mockContent.searchLocation.heading,
  page: mockContent.searchLocation.page,
  serviceName: mockContent.searchLocation.serviceName,
  searchParams: {
    label: {
      text: mockContent.searchLocation.searchParams.label.text,
      classes: 'govuk-label--l govuk-!-margin-bottom-6',
      isPageHeading: true
    },
    hint: {
      text: mockContent.searchLocation.searchParams.hint.text2
    },
    id: 'location',
    name: 'location'
  },
  locations: mockContent.searchLocation.searchParams.locations,
  button: mockContent.searchLocation.button,
  locationType: '',
  errors: null,
  errorMessage: null,
  errorMessageRadio: null,
  footerTxt: mockContent.footerTxt,
  phaseBanner: mockContent.phaseBanner,
  backlink: mockContent.backlink,
  cookieBanner: mockContent.cookieBanner,
  lang,
  currentPath
})

describe('searchLocationController - language handling', function () {
  let mockRequest
  let mockH
  const mockContent = english

  beforeEach(() => {
    const mocks = createMockRequestResponse()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
    vi.clearAllMocks()
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest = createRequestWithYar(LANG_CY, WELSH_SEARCH_PATH)
    verifyUrlMatch(
      mockRequest,
      `${BASE_URL}${WELSH_SEARCH_PATH}?lang=${LANG_CY}`
    )
    const result = searchLocationController.handler(mockRequest, mockH)
    verifyRedirect(result, mockH, `${WELSH_SEARCH_PATH}?lang=${LANG_CY}`)
  })

  it('should render the search location index page for English', () => {
    mockRequest = createRequestWithYar(LANG_EN, SEARCH_LOCATION_PATH)
    const actualUrl = verifyUrlMatch(
      mockRequest,
      `${BASE_URL}${SEARCH_LOCATION_PATH}?lang=${LANG_EN}`
    )
    const result = searchLocationController.handler(mockRequest, mockH)
    const expectedViewData = createViewData(
      mockContent,
      actualUrl,
      LANG_EN,
      SEARCH_LOCATION_PATH
    )
    verifyView(result, mockH, expectedViewData)
  })

  it('should default to English if lang is not "cy" or "en"', () => {
    mockRequest = createRequestWithYar('fr', SEARCH_LOCATION_PATH)
    const actualUrl = verifyUrlMatch(
      mockRequest,
      `${BASE_URL}${SEARCH_LOCATION_PATH}?lang=fr`
    )
    const result = searchLocationController.handler(mockRequest, mockH)
    const expectedViewData = createViewData(
      mockContent,
      actualUrl,
      LANG_EN,
      SEARCH_LOCATION_PATH
    )
    verifyView(result, mockH, expectedViewData)
  })

  it('should handle Welsh language redirect correctly', () => {
    mockRequest.query.lang = LANG_CY
    mockRequest.path = SEARCH_LOCATION_PATH
    const result = searchLocationController.handler(mockRequest, mockH)
    verifyRedirect(result, mockH, `${WELSH_SEARCH_PATH}?lang=${LANG_CY}`)
  })
})

describe('searchLocationController - error handling', function () {
  let mockRequest
  let mockH
  const mockContent = english

  beforeEach(() => {
    const mocks = createMockRequestResponse()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
    vi.clearAllMocks()
  })

  it('should render the search location index page with errors', () => {
    const errors = { errors: { titleText: 'There is a problem' } }
    const errorMessage = {
      errorMessage: { text: 'Select where you want to check' }
    }
    const mrequest = {
      query: { lang: LANG_EN },
      path: SEARCH_LOCATION_PATH,
      yar: {
        get: vi.fn((key) => {
          if (key === 'errors') {
            return errors
          }
          if (key === 'errorMessage') {
            return errorMessage
          }
          return null
        }),
        set: vi.fn()
      }
    }
    const actualUrl = verifyUrlMatch(
      mrequest,
      `${BASE_URL}${SEARCH_LOCATION_PATH}?lang=${LANG_EN}`
    )
    const result = searchLocationController.handler(mrequest, mockH)
    const expectedViewData = createErrorViewData(
      mockContent,
      actualUrl,
      LANG_EN,
      errors,
      errorMessage
    )
    verifyView(result, mockH, expectedViewData)
  })

  it('should display normal view when no errors exist', () => {
    mockRequest.query.lang = LANG_EN
    mockRequest.path = SEARCH_LOCATION_PATH
    mockRequest.yar.get = vi.fn(() => null)

    const result = searchLocationController.handler(mockRequest, mockH)

    expect(result).toBe(VIEW_RENDERED)
    expect(mockRequest.yar.set).toHaveBeenCalledWith('locationType', '')
    expect(mockH.view).toHaveBeenCalledWith(
      SEARCH_LOCATION_INDEX,
      expect.objectContaining({
        pageTitle: mockContent.searchLocation.pageTitle,
        errors: null,
        errorMessage: null,
        locationType: ''
      })
    )
  })
})
