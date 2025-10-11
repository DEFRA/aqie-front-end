/* global vi */
import { accessibilityController, accessibilityHandler } from './controller.js'
import { english } from '../data/en/en.js'
import { welsh } from '../data/cy/cy.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

describe('Accessibility Handler', () => {
  let mockRequest = {
    query: {},
    path: '/accessibility'
  }
  const mockContent = english
  const mockContentCy = welsh
  vi.mock('../../common/helpers/get-site-url.js', () => ({
    getAirQualitySiteUrl: vi.fn((request) => {
      return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
    })
  }))
  let mockH = {
    redirect: vi.fn().mockReturnValue('redirected'),
    view: vi.fn().mockReturnValue('view rendered')
  }

  beforeEach(() => {
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
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = LANG_CY
    mockRequest.path = '/hygyrchedd/cy'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/hygyrchedd/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = accessibilityController.handler(
      mockRequest,
      mockH,
      mockContent
    )
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/hygyrchedd/cy?lang=cy')
  })

  it('should render the accessibility page with the necessary data', () => {
    mockRequest = {
      query: {
        lang: LANG_EN
      },
      path: '/accessibility'
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/accessibility?lang=en'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)

    const result = accessibilityController.handler(
      mockRequest,
      mockH,
      mockContent
    )
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('accessibility/index', {
      pageTitle: mockContent.footer.accessibility.pageTitle,
      title: mockContent.footer.accessibility.title,
      description: mockContent.footer.accessibility.description,
      metaSiteUrl: actualUrl,
      heading: mockContent.footer.accessibility.heading,
      headings: mockContent.footer.accessibility.headings,
      paragraphs: mockContent.footer.accessibility.paragraphs,
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      serviceName: mockContent.multipleLocations.serviceName,
      cookieBanner: mockContent.cookieBanner,
      lang: mockRequest.query.lang
    })
  })

  it('should render the accessibility page when the lang is not en nor cy and path is /accessibility', () => {
    mockRequest = {
      query: {
        lang: 'fr'
      },
      path: '/accessibility'
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/accessibility?lang=fr'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)

    const result = accessibilityController.handler(
      mockRequest,
      mockH,
      mockContent
    )
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('accessibility/index', {
      pageTitle: mockContent.footer.accessibility.pageTitle,
      title: mockContent.footer.accessibility.title,
      description: mockContent.footer.accessibility.description,
      metaSiteUrl: actualUrl,
      heading: mockContent.footer.accessibility.heading,
      headings: mockContent.footer.accessibility.headings,
      paragraphs: mockContent.footer.accessibility.paragraphs,
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      serviceName: mockContent.multipleLocations.serviceName,
      cookieBanner: mockContent.cookieBanner,
      lang: LANG_EN
    })
  })

  it('should use Welsh content when lang is neither en nor cy', () => {
    mockRequest = {
      query: {
        lang: 'fr' // This will be 'fr' after slice, not 'en' or 'cy'
      },
      path: '/some-other-path' // Not '/accessibility'
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/some-other-path?lang=fr'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)

    const result = accessibilityController.handler(
      mockRequest,
      mockH,
      mockContent // Pass English content to test that it gets replaced with Welsh
    )
    expect(result).toBe('view rendered')
    // When lang is not 'en' (lines 27-28), the controller uses Welsh content
    expect(mockH.view).toHaveBeenCalledWith('accessibility/index', {
      pageTitle: mockContentCy.footer.accessibility.pageTitle,
      title: mockContentCy.footer.accessibility.title,
      description: mockContentCy.footer.accessibility.description,
      metaSiteUrl: actualUrl,
      heading: mockContentCy.footer.accessibility.heading,
      headings: mockContentCy.footer.accessibility.headings,
      paragraphs: mockContentCy.footer.accessibility.paragraphs,
      displayBacklink: false,
      phaseBanner: mockContentCy.phaseBanner,
      footerTxt: mockContentCy.footerTxt,
      serviceName: mockContentCy.multipleLocations.serviceName,
      cookieBanner: mockContentCy.cookieBanner,
      lang: 'fr'
    })
  })

  it('should test accessibilityHandler function directly', () => {
    // ''
    const result = accessibilityHandler(mockRequest, mockH, mockContent)
    expect(result).toBe('view rendered')
  })
})
