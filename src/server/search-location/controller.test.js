/* global vi */
/* eslint-disable */
import { english } from '../data/en/en.js'
import { searchLocationController } from './controller.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

vi.mock('../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn((request) => {
    return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
  })
}))

describe('searchLocationController - english', () => {
  let mockRequest
  let mockH
  const mockContent = english
  // ''

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
      redirect: vi.fn().mockImplementation((url) => {
        return {
          code: vi.fn().mockImplementation((statusCode) => {
            return 'redirected'
          })
        }
      }),
      view: vi.fn().mockReturnValue('view rendered')
    }
    vi.clearAllMocks()
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest = {
      query: {
        lang: 'cy'
      },
      path: '/chwilio-lleoliad/cy',
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
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/chwilio-lleoliad/cy?lang=cy')
    // ''
  })

  it('should render the search location index page for English', () => {
    mockRequest = {
      query: {
        lang: 'en'
      },
      path: '/search-location',
      yar: {
        set: vi.fn(),
        get: vi.fn()
      }
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/search-location?lang=en'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = searchLocationController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('search-location/index', {
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
      errors: undefined,
      errorMessage: undefined,
      errorMessageRadio: undefined,
      footerTxt: mockContent.footerTxt,
      phaseBanner: mockContent.phaseBanner,
      backlink: mockContent.backlink,
      cookieBanner: mockContent.cookieBanner,
      lang: mockRequest.query.lang
    })
    // ''
  })

  it('should default to English if lang is not "cy" or "en"', () => {
    mockRequest = {
      query: {
        lang: 'fr'
      },
      path: '/search-location',
      yar: {
        set: vi.fn(),
        get: vi.fn()
      }
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/search-location?lang=fr'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = searchLocationController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('search-location/index', {
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
      errors: undefined,
      errorMessage: undefined,
      errorMessageRadio: undefined,
      footerTxt: mockContent.footerTxt,
      phaseBanner: mockContent.phaseBanner,
      backlink: mockContent.backlink,
      cookieBanner: mockContent.cookieBanner,
      lang: 'en'
    })
    // ''
  })

  it('should render the search location index page with errors', () => {
    mockRequest.query.lang = 'en'
    const errors = { errors: { titleText: 'There is a problem' } }
    const errorMessage = {
      errorMessage: { text: 'Select where you want to check' }
    }
    const mrequest = {
      query: { lang: 'en' },
      path: '/search-location',
      yar: {
        get: vi.fn((key) => {
          if (key === 'errors') {
            return errors
          } else if (key === 'errorMessage') {
            return errorMessage
          } else if (key === 'locationType') {
            return null
          } else {
            return null
          }
        }),
        set: vi.fn()
      }
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/search-location?lang=en'
    const actualUrl = getAirQualitySiteUrl(mrequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = searchLocationController.handler(mrequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('search-location/index', {
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
      lang: mockRequest.query.lang
    })
    // ''
  })
})
