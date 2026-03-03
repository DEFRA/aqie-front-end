import { welsh } from '../../data/cy/cy.js'
import { searchLocationController } from './controller.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { vi } from 'vitest'

vi.mock('../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn((request) => {
    return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
  })
}))

const SEARCH_LOCATION_PATH_CY = '/chwilio-lleoliad/cy'
const VIEW_RENDERED = 'view rendered'
const SEARCH_LOCATION_VIEW = 'search-location/index'
const REDIRECT_STATUS_CODE = 301
const MOCK_CONTENT = welsh

function createMockRequest() {
  return {
    query: {},
    path: '',
    yar: {
      set: vi.fn(),
      get: vi.fn()
    }
  }
}

function createMockH() {
  return {
    redirect: vi.fn(() => ({
      code: vi.fn(() => 'redirected')
    })),
    view: vi.fn(() => VIEW_RENDERED)
  }
}

describe('searchLocationController - Welsh Redirects', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
  })

  it('should redirect to the Welsh version if the language is "en"', () => {
    const codeSpy = vi.fn(() => 'redirected')
    mockH.redirect = vi.fn(() => ({
      code: codeSpy
    }))

    mockRequest.query.lang = 'en'
    const result = searchLocationController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/search-location?lang=en')
    expect(codeSpy).toHaveBeenCalledWith(REDIRECT_STATUS_CODE)
  })
})

describe('searchLocationController - Welsh Content', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
  })

  it('should redirect by default to search location index page with welsh version if lang is not cy/en', () => {
    mockRequest = {
      query: {
        lang: 'fr'
      },
      path: SEARCH_LOCATION_PATH_CY,
      yar: {
        set: vi.fn(),
        get: vi.fn()
      }
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/chwilio-lleoliad/cy?lang=fr'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = searchLocationController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(SEARCH_LOCATION_VIEW, {
      pageTitle: MOCK_CONTENT.searchLocation.pageTitle,
      description: MOCK_CONTENT.searchLocation.description,
      metaSiteUrl: actualUrl,
      heading: MOCK_CONTENT.searchLocation.heading,
      page: MOCK_CONTENT.searchLocation.page,
      serviceName: MOCK_CONTENT.searchLocation.serviceName,
      searchParams: {
        label: {
          text: MOCK_CONTENT.searchLocation.searchParams.label.text,
          classes: 'govuk-label--l govuk-!-margin-bottom-6',
          isPageHeading: true
        },
        hint: {
          text: MOCK_CONTENT.searchLocation.searchParams.hint.text2
        },
        id: 'location',
        name: 'location'
      },
      locations: MOCK_CONTENT.searchLocation.searchParams.locations,
      button: MOCK_CONTENT.searchLocation.button,
      footerTxt: MOCK_CONTENT.footerTxt,
      phaseBanner: MOCK_CONTENT.phaseBanner,
      backlink: MOCK_CONTENT.backlink,
      cookieBanner: MOCK_CONTENT.cookieBanner,
      lang: 'cy',
      currentPath: SEARCH_LOCATION_PATH_CY,
      fromSmsFlow: false,
      fromEmailFlow: false
    })
  })
})

describe('searchLocationController - Welsh Language Handling', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
  })

  it('should redirect to search location index page', () => {
    mockRequest = {
      query: {
        lang: 'cy'
      },
      path: SEARCH_LOCATION_PATH_CY,
      yar: {
        set: vi.fn(),
        get: vi.fn()
      }
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/chwilio-lleoliad/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = searchLocationController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(SEARCH_LOCATION_VIEW, {
      pageTitle: MOCK_CONTENT.searchLocation.pageTitle,
      description: MOCK_CONTENT.searchLocation.description,
      metaSiteUrl: actualUrl,
      heading: MOCK_CONTENT.searchLocation.heading,
      page: MOCK_CONTENT.searchLocation.page,
      serviceName: MOCK_CONTENT.searchLocation.serviceName,
      searchParams: {
        label: {
          text: MOCK_CONTENT.searchLocation.searchParams.label.text,
          classes: 'govuk-label--l govuk-!-margin-bottom-6',
          isPageHeading: true
        },
        hint: {
          text: MOCK_CONTENT.searchLocation.searchParams.hint.text2
        },
        id: 'location',
        name: 'location'
      },
      locations: MOCK_CONTENT.searchLocation.searchParams.locations,
      button: MOCK_CONTENT.searchLocation.button,
      footerTxt: MOCK_CONTENT.footerTxt,
      phaseBanner: MOCK_CONTENT.phaseBanner,
      backlink: MOCK_CONTENT.backlink,
      cookieBanner: MOCK_CONTENT.cookieBanner,
      lang: mockRequest.query.lang,
      currentPath: SEARCH_LOCATION_PATH_CY,
      fromSmsFlow: false,
      fromEmailFlow: false
    })
  })

  it('should set notificationFlow when SMS flow flag is present', () => {
    // '' Ensure SMS flow is captured
    mockRequest = {
      query: {
        lang: 'cy',
        fromSmsFlow: 'true'
      },
      path: SEARCH_LOCATION_PATH_CY,
      yar: {
        set: vi.fn(),
        get: vi.fn()
      }
    }

    const result = searchLocationController.handler(mockRequest, mockH)

    expect(result).toBe(VIEW_RENDERED)
    expect(mockRequest.yar.set).toHaveBeenCalledWith('notificationFlow', 'sms')
  })
})

describe('searchLocationController - Welsh Error Handling', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
  })

  it('should display error view when errors exist', () => {
    // ''
    const mockErrors = {
      errors: [{ field: 'location', message: 'Error message' }]
    }
    const mockErrorMessage = {
      errorMessage: 'There was an error'
    }

    mockRequest.query.lang = 'cy'
    mockRequest.path = SEARCH_LOCATION_PATH_CY
    const mockYarGet = vi.fn()
    mockYarGet.mockImplementation((key) => {
      const values = {
        errors: mockErrors,
        errorMessage: mockErrorMessage,
        locationType: 'test-type'
      }
      return values[key] || null
    })
    mockRequest.yar.get = mockYarGet

    const result = searchLocationController.handler(mockRequest, mockH)

    expect(result).toBe(VIEW_RENDERED)
    expect(mockRequest.yar.set).toHaveBeenCalledWith('errors', null)
    expect(mockRequest.yar.set).toHaveBeenCalledWith('errorMessage', null)
    expect(mockH.view).toHaveBeenCalledWith(
      SEARCH_LOCATION_VIEW,
      expect.objectContaining({
        pageTitle: `Gwall: ${MOCK_CONTENT.searchLocation.pageTitle}`,
        errors: mockErrors.errors,
        errorMessage: mockErrorMessage.errorMessage,
        errorMessageRadio: mockErrorMessage.errorMessage,
        locationType: 'test-type'
      })
    )
  })
})
