import { vi } from 'vitest'
import { welsh } from '../../data/cy/cy.js'
import { privacyController } from './controller.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'

const PRIVACY_PATH_CY = '/preifatrwydd/cy'
const VIEW_RENDERED = 'view rendered'
const VIEW_NAME = 'privacy/index'

// Mock at top level to avoid duplication
vi.mock('../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn((request) => {
    return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
  })
}))

// Helper to create expected view data
function createExpectedViewData(mockContent, actualUrl, lang, currentPath) {
  return {
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
    lang,
    currentPath
  }
}

describe('privacy controller - Welsh', () => {
  let mockRequest
  let mockH

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
      view: vi.fn(() => VIEW_RENDERED)
    }
  })

  describe('Language redirects', () => {
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
  })
})

describe('privacy controller Welsh - Page rendering', () => {
  let mockRequest
  let mockH
  const mockContent = welsh

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: ''
    }
    mockH = {
      redirect: vi.fn(() => ({
        code: vi.fn(() => 'redirected')
      })),
      view: vi.fn(() => VIEW_RENDERED)
    }
  })

  describe('Page rendering', () => {
    it('should render the privacy page with the necessary data', () => {
      mockRequest.query.lang = LANG_CY
      mockRequest.path = PRIVACY_PATH_CY
      const expectedUrl =
        'https://check-air-quality.service.gov.uk/preifatrwydd/cy?lang=cy'
      const actualUrl = getAirQualitySiteUrl(mockRequest)
      expect(actualUrl).toBe(expectedUrl)
      const result = privacyController.handler(mockRequest, mockH)
      expect(result).toBe(VIEW_RENDERED)
      const expectedData = createExpectedViewData(
        mockContent,
        actualUrl,
        mockRequest.query.lang,
        PRIVACY_PATH_CY
      )
      expect(mockH.view).toHaveBeenCalledWith(VIEW_NAME, expectedData)
    })
  })
})

describe('privacy controller Welsh - Non-standard language handling', () => {
  let mockRequest
  let mockH
  const mockContent = welsh

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: ''
    }
    mockH = {
      redirect: vi.fn(() => ({
        code: vi.fn(() => 'redirected')
      })),
      view: vi.fn(() => VIEW_RENDERED)
    }
  })

  describe('Non-standard language', () => {
    it('should render the privacy page by default when lang is not cy/en and the path is there', () => {
      mockRequest.query.lang = 'fr'
      mockRequest.path = PRIVACY_PATH_CY
      const expectedUrl =
        'https://check-air-quality.service.gov.uk/preifatrwydd/cy?lang=fr'
      const actualUrl = getAirQualitySiteUrl(mockRequest)
      expect(actualUrl).toBe(expectedUrl)
      const result = privacyController.handler(mockRequest, mockH)
      expect(result).toBe(VIEW_RENDERED)
      const expectedData = createExpectedViewData(
        mockContent,
        actualUrl,
        LANG_CY,
        PRIVACY_PATH_CY
      )
      expect(mockH.view).toHaveBeenCalledWith(VIEW_NAME, expectedData)
    })
  })

  describe('Default language handling', () => {
    it('should default to CY when no lang query parameter is provided on Welsh path', () => {
      mockRequest.query = {}
      mockRequest.path = PRIVACY_PATH_CY
      const expectedUrl =
        'https://check-air-quality.service.gov.uk/preifatrwydd/cy?lang=undefined'
      const actualUrl = getAirQualitySiteUrl(mockRequest)
      expect(actualUrl).toBe(expectedUrl)
      const result = privacyController.handler(mockRequest, mockH)
      expect(result).toBe(VIEW_RENDERED)
      const expectedData = createExpectedViewData(
        mockContent,
        actualUrl,
        LANG_CY,
        PRIVACY_PATH_CY
      )
      expect(mockH.view).toHaveBeenCalledWith(VIEW_NAME, expectedData)
    })
  })
})
