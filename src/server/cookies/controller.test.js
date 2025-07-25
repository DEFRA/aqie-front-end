import { cookiesController, cookiesHandler } from './controller.js'
import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { vi } from 'vitest'

describe('Cookies Handler', () => {
  let mockRequest
  let mockH
  const mockContent = english

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/cookies'
    }
    vi.mock('../../common/helpers/get-site-url.js', () => ({
      getAirQualitySiteUrl: vi.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
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
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/cookies?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = cookiesController.handler(mockRequest, mockH, mockContent)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/briwsion/cy?lang=cy')
  })

  it('should render the cookies page with the necessary data', () => {
    mockRequest.query.lang = LANG_EN
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/cookies?lang=en'
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
      lang: mockRequest.query.lang
    })
  })

  it('should default to English if language is not "cy" or "en" and path is "/cookies"', () => {
    mockRequest.query.lang = 'fr'
    mockRequest.path = '/cookies'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/cookies?lang=fr'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = cookiesHandler(mockRequest, mockH, mockContent)
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
      lang: LANG_EN
    })
  })
})
