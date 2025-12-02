import { describe, it, expect, vi, beforeEach } from 'vitest'
import { actionsReduceExposureCyController } from './controller.js'
import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'

// '' Test constants
const WELSH_PATH = '/lleoliad/n87ge/camau-lleihau-amlygiad/cy'
const VIEW_RENDERED = 'view rendered'
const VIEW_TEMPLATE = 'actions-reduce-exposure/index'

// Mock get-site-url before using it
vi.mock('../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn((request) => {
    return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
  })
}))

// eslint-disable-next-line import-x/first -- vi.mock() must be before imports for Vitest hoisting
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

// '' Helper function to create mock objects
function createMockObjects() {
  const mockRequest = {
    query: {},
    params: { locationId: 'n87ge' },
    path: WELSH_PATH
  }
  const mockH = {
    redirect: vi.fn().mockImplementation(() => {
      return {
        code: vi.fn().mockImplementation(() => {
          return 'redirected'
        })
      }
    }),
    view: vi.fn().mockReturnValue(VIEW_RENDERED)
  }
  return { mockRequest, mockH }
}

describe('Actions Reduce Exposure - Welsh - English Redirect', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    const mocks = createMockObjects()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
  })

  describe('English language redirect', () => {
    it('should redirect to the English version if the language is "en"', () => {
      // ''
      mockRequest.query.lang = LANG_EN
      mockRequest.path = '/location/n87ge/actions-reduce-exposure'
      const expectedUrl =
        'https://check-air-quality.service.gov.uk/location/n87ge/actions-reduce-exposure?lang=en'
      const actualUrl = getAirQualitySiteUrl(mockRequest)
      expect(actualUrl).toBe(expectedUrl)
      const result = actionsReduceExposureCyController.handler(
        mockRequest,
        mockH
      )
      expect(result).toBe('redirected')
      expect(mockH.redirect).toHaveBeenCalledWith(
        '/location/n87ge/actions-reduce-exposure?lang=en'
      )
    })
  })
})

describe('Actions Reduce Exposure - Welsh - Page Rendering', () => {
  let mockRequest
  let mockH
  const mockContent = welsh

  beforeEach(() => {
    const mocks = createMockObjects()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
  })

  describe('Welsh page rendering', () => {
    it('should render the Welsh actions reduce exposure page with the necessary data', () => {
      // ''
      mockRequest = {
        query: {
          lang: LANG_CY
        },
        params: { locationId: 'n87ge' },
        path: WELSH_PATH
      }
      const expectedUrl =
        'https://check-air-quality.service.gov.uk/lleoliad/n87ge/camau-lleihau-amlygiad/cy?lang=cy'
      const actualUrl = getAirQualitySiteUrl(mockRequest)
      expect(actualUrl).toBe(expectedUrl)
      const result = actionsReduceExposureCyController.handler(
        mockRequest,
        mockH
      )
      expect(result).toBe(VIEW_RENDERED)
      expect(mockH.view).toHaveBeenCalledWith(VIEW_TEMPLATE, {
        pageTitle: mockContent.actionsReduceExposure.pageTitle,
        description: mockContent.actionsReduceExposure.description,
        metaSiteUrl: actualUrl,
        actionsReduceExposure: expect.objectContaining({
          pageTitle: mockContent.actionsReduceExposure.pageTitle,
          description: mockContent.actionsReduceExposure.description,
          healthConditionsLink: '/lleoliad/n87ge/effeithiau-iechyd'
        }),
        page: 'Camau i leihau amlygiad',
        displayBacklink: true,
        customBackLink: true,
        backLinkText: mockContent.backlink.text,
        backLinkUrl: '/lleoliad/n87ge?lang=cy',
        locationName: '',
        locationId: 'n87ge',
        phaseBanner: mockContent.phaseBanner,
        footerTxt: mockContent.footerTxt,
        cookieBanner: mockContent.cookieBanner,
        backlink: mockContent.backlink,
        serviceName: mockContent.multipleLocations.serviceName,
        lang: mockRequest.query.lang
      })
    })
  })
})

describe('Actions Reduce Exposure - Welsh - Location Name in Back Link', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    const mocks = createMockObjects()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
  })

  describe('Location name parameter', () => {
    it('should handle location name parameter and enable back link', () => {
      // ''
      mockRequest = {
        query: {
          lang: LANG_CY,
          locationName: 'Abertawe'
        },
        params: { locationId: 'xyz789' },
        path: '/lleoliad/xyz789/camau-lleihau-amlygiad/cy'
      }
      const result = actionsReduceExposureCyController.handler(
        mockRequest,
        mockH
      )
      expect(result).toBe(VIEW_RENDERED)
      expect(mockH.view).toHaveBeenCalledWith(
        VIEW_TEMPLATE,
        expect.objectContaining({
          displayBacklink: true,
          customBackLink: true,
          backLinkText: 'Llygredd aer yn Abertawe',
          backLinkUrl: '/lleoliad/xyz789?lang=cy&locationName=Abertawe',
          locationName: 'Abertawe',
          locationId: 'xyz789'
        })
      )
    })
  })
})

describe('Actions Reduce Exposure - Welsh - Postcode Formatting', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    const mocks = createMockObjects()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
  })

  describe('Postcode formatting in back links', () => {
    it('should format postcode and include location name in back link text', () => {
      // ''
      mockRequest = {
        query: {
          lang: LANG_CY,
          searchTerms: 'n8 7ge',
          locationName: 'Hornsey'
        },
        params: { locationId: 'n87ge' },
        path: WELSH_PATH
      }
      const result = actionsReduceExposureCyController.handler(
        mockRequest,
        mockH
      )
      expect(result).toBe(VIEW_RENDERED)
      expect(mockH.view).toHaveBeenCalledWith(
        VIEW_TEMPLATE,
        expect.objectContaining({
          displayBacklink: true,
          customBackLink: true,
          backLinkText: 'Llygredd aer yn N8 7GE, Hornsey',
          backLinkUrl: '/lleoliad/n87ge?lang=cy&locationName=Hornsey',
          locationName: 'Hornsey',
          locationId: 'n87ge'
        })
      )
    })

    it('should format postcode without location name in back link text', () => {
      // ''
      mockRequest = {
        query: {
          lang: LANG_CY,
          searchTerms: 'n87ge'
        },
        params: { locationId: 'n87ge' },
        path: WELSH_PATH
      }
      const result = actionsReduceExposureCyController.handler(
        mockRequest,
        mockH
      )
      expect(result).toBe(VIEW_RENDERED)
      expect(mockH.view).toHaveBeenCalledWith(
        VIEW_TEMPLATE,
        expect.objectContaining({
          displayBacklink: true,
          customBackLink: true,
          backLinkText: 'Llygredd aer yn N8 7GE',
          backLinkUrl: '/lleoliad/n87ge?lang=cy',
          locationName: '',
          locationId: 'n87ge'
        })
      )
    })
  })
})
