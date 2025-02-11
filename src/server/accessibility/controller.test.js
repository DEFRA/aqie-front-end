import { accessibilityController } from '~/src/server/accessibility/controller'
import { english } from '~/src/server/data/en/en.js'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'

describe('Accessibility Handler', () => {
  let mockRequest = {
    query: {},
    path: '/accessibility'
  }
  const mockContent = english
  jest.mock('~/src/server/common/helpers/get-site-url', () => ({
    getAirQualitySiteUrl: jest.fn((request) => {
      return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
    })
  }))
  const mockH = {
    redirect: jest.fn().mockReturnValue('redirected'),
    view: jest.fn().mockReturnValue('view rendered')
  }

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
})
