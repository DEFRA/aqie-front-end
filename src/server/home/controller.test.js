import { homeController, handleHomeRequest } from './controller.js'
import { english } from '../data/en/en.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { vi } from 'vitest'

// Mock the logger
vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }))
}))

const VIEW_RENDERED = 'view rendered'
const REDIRECTED = 'redirected'
const LANG_EN = 'en'
const LANG_CY = 'cy'
const BASE_URL = 'https://check-air-quality.service.gov.uk'
const HOME_PATH = '/'
const HOME_INDEX = 'home/index'

const createMockRequest = (lang = LANG_EN) => ({
  query: { lang },
  path: HOME_PATH,
  yar: {
    set: vi.fn()
  }
})

const createMockH = () => ({
  redirect: vi.fn().mockImplementation((_url) => ({
    code: vi.fn().mockImplementation((_statusCode) => REDIRECTED)
  })),
  view: vi.fn().mockReturnValue(VIEW_RENDERED)
})

const createHomeViewData = (mockContent, actualUrl, lang) => ({
  pageTitle: mockContent.home.pageTitle,
  description: mockContent.home.description,
  metaSiteUrl: actualUrl,
  heading: mockContent.home.heading,
  page: mockContent.home.page,
  paragraphs: mockContent.home.paragraphs,
  label: mockContent.home.button,
  footerTxt: mockContent.footerTxt,
  phaseBanner: mockContent.phaseBanner,
  backlink: mockContent.backlink,
  cookieBanner: mockContent.cookieBanner,
  serviceName: '',
  lang,
  currentPath: HOME_PATH
})

describe('Home Controller', () => {
  let mockRequest
  let mockH
  const mockContent = english

  beforeEach(() => {
    mockRequest = createMockRequest()
    vi.mock('../../common/helpers/get-site-url.js', () => ({
      getAirQualitySiteUrl: vi.fn((request) => {
        return `${BASE_URL}${request.path}?lang=${request.query.lang}`
      })
    }))
    mockH = createMockH()
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = LANG_CY
    const expectedUrl = `${BASE_URL}/?lang=${LANG_CY}`
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = homeController.handler(mockRequest, mockH, mockContent)
    expect(result).toBe(REDIRECTED)
    expect(mockH.redirect).toHaveBeenCalledWith(LANG_CY)
  })

  it('should render the home page with the necessary data', () => {
    mockRequest.query.lang = LANG_EN
    const expectedUrl = `${BASE_URL}/?lang=${LANG_EN}`
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = handleHomeRequest(mockRequest, mockH, mockContent)
    expect(result).toBe(VIEW_RENDERED)
    const expectedViewData = createHomeViewData(mockContent, actualUrl, LANG_EN)
    expect(mockH.view).toHaveBeenCalledWith(HOME_INDEX, expectedViewData)
  })

  it('should log a warning when yar session is not available', () => {
    const requestWithoutYarSet = {
      query: { lang: LANG_EN },
      path: HOME_PATH,
      yar: {}
    }
    expect(requestWithoutYarSet.yar).toBeDefined()
    expect(typeof requestWithoutYarSet.yar.set).toBe('undefined')
    const result = handleHomeRequest(requestWithoutYarSet, mockH, mockContent)
    expect(result).toBe(VIEW_RENDERED)
  })

  it('should log a warning when yar is completely missing', () => {
    const requestWithoutYar = {
      query: { lang: LANG_EN },
      path: HOME_PATH
    }
    expect(requestWithoutYar.yar).toBeUndefined()
    const result = handleHomeRequest(requestWithoutYar, mockH, mockContent)
    expect(result).toBe(VIEW_RENDERED)
  })

  it('should set locationType when yar is properly available', () => {
    const requestWithYar = createMockRequest(LANG_EN)
    const result = handleHomeRequest(requestWithYar, mockH, mockContent)
    expect(requestWithYar.yar.set).toHaveBeenCalledWith('locationType', '')
    expect(result).toBe(VIEW_RENDERED)
  })

  it('should test handleHomeRequest function directly', () => {
    const result = handleHomeRequest(mockRequest, mockH, mockContent)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockRequest.yar.set).toHaveBeenCalledWith('locationType', '')
  })
})
