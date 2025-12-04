import { cookiesController, cookiesHandler } from './controller.js'
import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { vi } from 'vitest'

const VIEW_RENDERED = 'view rendered'
const REDIRECTED = 'redirected'
const COOKIES_PATH = '/cookies'
const COOKIES_INDEX = 'cookies/index'

const createMockRequest = () => ({
  query: {},
  path: COOKIES_PATH
})

const createMockH = () => ({
  redirect: vi.fn().mockImplementation((_url) => ({
    code: vi.fn().mockImplementation((_statusCode) => REDIRECTED)
  })),
  view: vi.fn().mockReturnValue(VIEW_RENDERED)
})

const createCookiesViewData = (mockContent, actualUrl, lang) => ({
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
  lang,
  currentPath: COOKIES_PATH
})

describe('Cookies Handler', () => {
  let mockRequest
  let mockH
  const mockContent = english

  beforeEach(() => {
    mockRequest = createMockRequest()
    vi.mock('../../common/helpers/get-site-url.js', () => ({
      getAirQualitySiteUrl: vi.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
    mockH = createMockH()
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = LANG_CY
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/cookies?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = cookiesController.handler(mockRequest, mockH, mockContent)
    expect(result).toBe(REDIRECTED)
    expect(mockH.redirect).toHaveBeenCalledWith('/briwsion/cy?lang=cy')
  })

  it('should render the cookies page with the necessary data', () => {
    mockRequest.query.lang = LANG_EN
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/cookies?lang=en'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = cookiesController.handler(mockRequest, mockH, mockContent)
    expect(result).toBe(VIEW_RENDERED)
    const expectedViewData = createCookiesViewData(
      mockContent,
      actualUrl,
      mockRequest.query.lang
    )
    expect(mockH.view).toHaveBeenCalledWith(COOKIES_INDEX, expectedViewData)
  })

  it('should default to English if language is not "cy" or "en" and path is "/cookies"', () => {
    mockRequest.query.lang = 'fr'
    mockRequest.path = COOKIES_PATH
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/cookies?lang=fr'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = cookiesHandler(mockRequest, mockH, mockContent)
    expect(result).toBe(VIEW_RENDERED)
    const expectedViewData = createCookiesViewData(
      mockContent,
      actualUrl,
      LANG_EN
    )
    expect(mockH.view).toHaveBeenCalledWith(COOKIES_INDEX, expectedViewData)
  })
})
