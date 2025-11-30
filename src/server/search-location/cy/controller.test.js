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

describe('searchLocationController - welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  const REDIRECT_STATUS_CODE = 301

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '',
      yar: {
        set: vi.fn(),
        get: vi.fn()
      }
    }
    mockH = {
      redirect: vi.fn(() => ({
        code: vi.fn(() => 'redirected')
      })),
      view: vi.fn(() => VIEW_RENDERED)
    }
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
      footerTxt: mockContent.footerTxt,
      phaseBanner: mockContent.phaseBanner,
      backlink: mockContent.backlink,
      cookieBanner: mockContent.cookieBanner,
      lang: 'cy',
      currentPath: SEARCH_LOCATION_PATH_CY
    })
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
      footerTxt: mockContent.footerTxt,
      phaseBanner: mockContent.phaseBanner,
      backlink: mockContent.backlink,
      cookieBanner: mockContent.cookieBanner,
      lang: mockRequest.query.lang,
      currentPath: SEARCH_LOCATION_PATH_CY
    })
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
    mockRequest.yar.get = vi.fn((key) => {
      if (key === 'errors') {
        return mockErrors
      }
      if (key === 'errorMessage') {
        return mockErrorMessage
      }
      if (key === 'locationType') {
        return 'test-type'
      }
      return null
    })

    const result = searchLocationController.handler(mockRequest, mockH)

    expect(result).toBe(VIEW_RENDERED)
    expect(mockRequest.yar.set).toHaveBeenCalledWith('errors', null)
    expect(mockRequest.yar.set).toHaveBeenCalledWith('errorMessage', null)
    expect(mockH.view).toHaveBeenCalledWith(
      SEARCH_LOCATION_VIEW,
      expect.objectContaining({
        pageTitle: `Gwall: ${mockContent.searchLocation.pageTitle}`,
        errors: mockErrors.errors,
        errorMessage: mockErrorMessage.errorMessage,
        errorMessageRadio: mockErrorMessage.errorMessage,
        locationType: 'test-type'
      })
    )
  })
})
