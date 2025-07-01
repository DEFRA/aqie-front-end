import { cookiesController, cookiesHandler } from './controller.js'
import { welsh } from '../../data/cy/cy.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { createMockH } from '../../locations/helpers/error-input-and-redirect-helpers.test.js'

describe('Cookies Handler', () => {
  let mockRequest
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
  })

  it('should redirect to the English version if the language is "en"', () => {
    const mockH = createMockH()

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
    expect(result.takeover()).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/cookies?lang=en')
  })

  it('should render the cookies page with the necessary data', () => {
    const mockH = createMockH()

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
    const mockH = createMockH()

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
