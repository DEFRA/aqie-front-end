/* global vi */
import { welsh } from '../../data/cy/cy.js'
import { privacyController } from './controller.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'

describe('privacy controller - Welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  beforeEach(() => {
    mockRequest = {
      query: {},
      path: ''
    }
    vi.mock('../../common/helpers/get-site-url.js', () => ({
      getAirQualitySiteUrl: vi.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
    mockH = {
      redirect: vi.fn(() => ({
        code: vi.fn(() => 'redirected')
      })),
      view: vi.fn(() => 'view rendered')
    }
  })

  it('should redirect to the english version if the language is "en"', () => {
    mockRequest = {
      query: {
        lang: LANG_EN
      },
      path: '/privacy'
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/privacy?lang=en'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = privacyController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/privacy?lang=en')
  })

  it('should render the privacy page with the necessary data', () => {
    mockRequest.query.lang = LANG_CY
    mockRequest.path = '/preifatrwydd/cy'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/preifatrwydd/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = privacyController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('privacy/index', {
      pageTitle: mockContent.footer.privacy.pageTitle,
      description: mockContent.footer.privacy.description,
      metaSiteUrl: actualUrl,
      title: mockContent.footer.privacy.title,
      heading: mockContent.footer.privacy.heading,
      headings: mockContent.footer.privacy.headings,
      paragraphs: mockContent.footer.privacy.paragraphs,
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      page: 'privacy',
      lang: mockRequest.query.lang,
      currentPath: '/preifatrwydd/cy'
    })
  })

  it('should render the privacy page by default when lang is not cy/en and the path is there', () => {
    mockRequest.query.lang = 'fr'
    mockRequest.path = '/preifatrwydd/cy'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/preifatrwydd/cy?lang=fr'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = privacyController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('privacy/index', {
      pageTitle: mockContent.footer.privacy.pageTitle,
      description: mockContent.footer.privacy.description,
      metaSiteUrl: actualUrl,
      title: mockContent.footer.privacy.title,
      heading: mockContent.footer.privacy.heading,
      headings: mockContent.footer.privacy.headings,
      paragraphs: mockContent.footer.privacy.paragraphs,
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      page: 'privacy',
      lang: LANG_CY,
      currentPath: '/preifatrwydd/cy'
    })
  })
})
