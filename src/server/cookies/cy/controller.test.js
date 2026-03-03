import { cookiesController, cookiesHandler } from './controller.js'
import { welsh } from '../../data/cy/cy.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { createMockH } from '../../locations/helpers/error-input-and-redirect-helpers.test.js'
import { vi } from 'vitest'

const COOKIES_PATH_CY = '/briwsion/cy'
const VIEW_RENDERED = 'view rendered'
const VIEW_NAME = 'cookies/index'

// Mock at top level
vi.mock('../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn((request) => {
    return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
  })
}))

describe('Cookies Handler - Redirects', () => {
  let mockRequest
  const mockContent = welsh

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: ''
    }
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
})

describe('Cookies Handler - Welsh Rendering', () => {
  let mockRequest
  const mockContent = welsh

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: ''
    }
  })

  it('should render the cookies page with the necessary data', () => {
    const mockH = createMockH()

    mockRequest = {
      query: {
        lang: 'cy'
      },
      path: COOKIES_PATH_CY
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/briwsion/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = cookiesHandler(mockRequest, mockH, mockContent)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(VIEW_NAME, {
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
      lang: mockRequest.query.lang,
      currentPath: COOKIES_PATH_CY
    })
  })
})

describe('Cookies Handler - Default Language', () => {
  let mockRequest
  const mockContent = welsh

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: ''
    }
  })

  it('should default to Welsh if language is not "cy" or "en" and path is "/preifatrwydd/cy"', () => {
    const mockH = createMockH()

    mockRequest = {
      query: {
        lang: 'fr'
      },
      path: COOKIES_PATH_CY
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/briwsion/cy?lang=fr'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = cookiesController.handler(mockRequest, mockH, mockContent)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(VIEW_NAME, {
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
      lang: 'cy',
      currentPath: COOKIES_PATH_CY
    })
  })

  it('should default to Welsh when no lang query parameter is provided', () => {
    const mockH = createMockH()

    mockRequest = {
      query: {},
      path: COOKIES_PATH_CY
    }
    const result = cookiesHandler(mockRequest, mockH, mockContent)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(
      VIEW_NAME,
      expect.objectContaining({
        lang: 'cy'
      })
    )
  })
})
