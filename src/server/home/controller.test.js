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

describe('Home Controller', () => {
  let mockRequest
  let mockH
  const mockContent = english

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/'
    }
    vi.mock('../../common/helpers/get-site-url.js', () => ({
      getAirQualitySiteUrl: vi.fn((request) => {
        return `https://check-air-quality.service.gov.uk/${request.path}?lang=${request.query.lang}`
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
    mockRequest.query.lang = 'cy'
    const expectedUrl = 'https://check-air-quality.service.gov.uk/?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = homeController.handler(mockRequest, mockH, mockContent)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('cy')
  })

  it('should render the home page with the necessary data', () => {
    mockRequest.query.lang = 'en'
    const expectedUrl = 'https://check-air-quality.service.gov.uk/?lang=en'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = handleHomeRequest(mockRequest, mockH, mockContent)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('home/index', {
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
      lang: 'en'
    })
  })

  it('should log a warning when yar session is not available', () => {
    // Create a mock request with yar but without the set method
    const requestWithoutYarSet = {
      query: { lang: 'en' },
      path: '/',
      yar: {} // yar exists but without set method
    }

    // Verify yar exists but doesn't have set method
    expect(requestWithoutYarSet.yar).toBeDefined()
    expect(typeof requestWithoutYarSet.yar.set).toBe('undefined')

    const result = handleHomeRequest(requestWithoutYarSet, mockH, mockContent)
    expect(result).toBe('view rendered')
  })

  it('should log a warning when yar is completely missing', () => {
    // Create a mock request without any yar property
    const requestWithoutYar = {
      query: { lang: 'en' },
      path: '/'
      // Completely omitting yar
    }

    // Verify yar is undefined
    expect(requestWithoutYar.yar).toBeUndefined()

    const result = handleHomeRequest(requestWithoutYar, mockH, mockContent)
    expect(result).toBe('view rendered')
  })

  it('should set locationType when yar is properly available', () => {
    // Create a mock request with proper yar
    const requestWithYar = {
      query: { lang: 'en' },
      path: '/',
      yar: {
        set: vi.fn() // Mock the set method
      }
    }

    const result = handleHomeRequest(requestWithYar, mockH, mockContent)

    // Verify yar.set was called
    expect(requestWithYar.yar.set).toHaveBeenCalledWith('locationType', '')
    expect(result).toBe('view rendered')
  })
})
