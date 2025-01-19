/* eslint-disable */
import { english } from '../data/en/en.js'
import { searchLocationController } from './controller.js'

describe('searchLocationController - english', () => {
  let mockRequest
  let mockH
  const mockContent = english

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '',
      yar: {
        set: jest.fn(),
        get: jest.fn()
      }
    }
    mockH = {
      redirect: jest.fn().mockReturnValue('redirected'),
      view: jest.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = 'cy'
    const result = searchLocationController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/chwilio-lleoliad/cy?lang=cy')
  })

  it('should redirect to search location index page', () => {
    mockRequest.query.lang = 'en'
    const result = searchLocationController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('search-location/index', {
      pageTitle: mockContent.searchLocation.pageTitle,
      description: mockContent.searchLocation.description,
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
      lang: mockRequest.query.lang
    })
  })

  it('should redirect by default to search location index page with english version if lang is not cy/en', () => {
    mockRequest.query.lang = 'fr'
    mockRequest.path = '/search-location'
    const result = searchLocationController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('search-location/index', {
      pageTitle: mockContent.searchLocation.pageTitle,
      description: mockContent.searchLocation.description,
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
      lang: 'en'
    })
  })

  it('should redirect to search location index page with error', () => {
    mockRequest.query.lang = 'en'
    const errors = { titleText: 'There is a problem' }
    const errorMessage = { text: 'Select where you want to check' }
    const mrequest = {
      yar: {
        get: jest.fn((key) => {
          if (key === 'errors') {
            return { errors: { titleText: 'There is a problem' } }
          } else if (key === 'errorMessage') {
            return { errorMessage: { text: 'Select where you want to check' } }
          } else {
            return null
          }
        }),
        set: jest.fn()
      },
      query: { lang: 'en' }
    }
    const result = searchLocationController.handler(mrequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('search-location/index', {
      pageTitle: `Error: ${mockContent.searchLocation.pageTitle}`,
      description: mockContent.searchLocation.description,
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
      errors: errors,
      errorMessage: errorMessage,
      errorMessageRadio: errorMessage,
      footerTxt: mockContent.footerTxt,
      phaseBanner: mockContent.phaseBanner,
      backlink: mockContent.backlink,
      cookieBanner: mockContent.cookieBanner,
      lang: mockRequest.query.lang
    })
  })
})
