import { cookiesController, cookiesHandler } from './controller'
import { welsh } from '~/src/server/data/cy/cy.js'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'

describe('Cookies Handler', () => {
  let mockRequest
  let mockH
  const mockContent = welsh

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: ''
    }
    jest.mock('~/src/server/common/helpers/get-site-url', () => ({
      getAirQualitySiteUrl: jest.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
    mockH = {
      redirect: jest.fn().mockReturnValue('redirected'),
      view: jest.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the English version if the language is "en"', () => {
    mockRequest = {
      query: {
        lang: 'en'
      },
      path: '/cookies'
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/cookies?lang=en'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = cookiesController.handler(mockRequest, mockH, mockContent)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/cookies?lang=en')
  })

  it('should render the cookies page with the necessary data', () => {
    mockRequest = {
      query: {
        lang: 'cy'
      },
      path: '/briwsion/cy'
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/briwsion/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = cookiesHandler(mockRequest, mockH, mockContent)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('cookies/index', {
      pageTitle: mockContent.footer.cookies.pageTitle,
      description: mockContent.footer.cookies.description,
      title: mockContent.footer.cookies.title,
      metaSiteUrl: actualUrl,
      heading: mockContent.footer.cookies.heading,
      headings: mockContent.footer.cookies.headings,
      table1: mockContent.footer.cookies.table1,
      table2: mockContent.footer.cookies.table2,
      paragraphs: mockContent.footer.cookies.paragraphs,
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      serviceName: mockContent.multipleLocations.serviceName,
      cookieBanner: mockContent.cookieBanner,
      lang: mockRequest.query.lang
    })
  })

  it('should default to Welsh if language is not "cy" or "en" and path is "/preifatrwydd/cy"', () => {
    mockRequest = {
      query: {
        lang: 'fr'
      },
      path: '/briwsion/cy'
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/briwsion/cy?lang=fr'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = cookiesController.handler(mockRequest, mockH, mockContent)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('cookies/index', {
      pageTitle: mockContent.footer.cookies.pageTitle,
      description: mockContent.footer.cookies.description,
      metaSiteUrl: actualUrl,
      title: mockContent.footer.cookies.title,
      heading: mockContent.footer.cookies.heading,
      headings: mockContent.footer.cookies.headings,
      table1: mockContent.footer.cookies.table1,
      table2: mockContent.footer.cookies.table2,
      paragraphs: mockContent.footer.cookies.paragraphs,
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      serviceName: mockContent.multipleLocations.serviceName,
      cookieBanner: mockContent.cookieBanner,
      lang: 'cy'
    })
  })
})
