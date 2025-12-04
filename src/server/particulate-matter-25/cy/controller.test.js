/* global vi */
import { welsh } from '../../data/cy/cy.js'
import { particulateMatter25Controller } from './controller.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const PM25_PATH_CY = '/llygryddion/mater-gronynnol-25/cy'
const VIEW_RENDERED = 'view rendered'

describe('Particular matter25 Controller - Welsh Redirects', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: PM25_PATH_CY
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

  describe('Welsh redirects', () => {
    it('should redirect to the English version if the language is "en"', () => {
      mockRequest.query.lang = LANG_EN
      const result = particulateMatter25Controller.handler(mockRequest, mockH)
      expect(result).toBe('redirected')
      expect(mockH.redirect).toHaveBeenCalledWith(
        '/pollutants/particulate-matter-25?lang=en'
      )
    })
  })
})

describe('Particular matter25 Controller - Welsh Content', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  const { particulateMatter25 } = welsh.pollutants

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: PM25_PATH_CY
    }
    mockH = {
      view: vi.fn(() => VIEW_RENDERED)
    }
  })

  describe('Welsh content rendering', () => {
    it('should render the particulateMatter25 page with the necessary data', () => {
      mockRequest.query.lang = LANG_CY
      mockRequest.query.locationId = '123'
      mockRequest.query.locationName = 'Test Location'
      const expectedUrl =
        'https://check-air-quality.service.gov.uk/llygryddion/mater-gronynnol-25/cy?lang=cy'
      const actualUrl = getAirQualitySiteUrl(mockRequest)
      expect(actualUrl).toBe(expectedUrl)
      const result = particulateMatter25Controller.handler(mockRequest, mockH)
      expect(result).toBe(VIEW_RENDERED)
      expect(mockH.view).toHaveBeenCalledWith('particulate-matter-25/index', {
        pageTitle: mockContent.pollutants.particulateMatter25.pageTitle,
        description: mockContent.pollutants.particulateMatter25.description,
        metaSiteUrl: actualUrl,
        particulateMatter25,
        page: 'particulate matter 25',
        displayBacklink: true,
        backLinkText: 'Llygredd aer yn Test Location',
        backLinkUrl: '/lleoliad/123?lang=cy',
        customBackLink: true,
        phaseBanner: mockContent.phaseBanner,
        footerTxt: mockContent.footerTxt,
        cookieBanner: mockContent.cookieBanner,
        serviceName: mockContent.multipleLocations.serviceName,
        lang: mockRequest.query.lang,
        currentPath: PM25_PATH_CY
      })
    })

    it('should render by default to particulateMatter25 page if lang is not cy or en', () => {
      mockRequest.query.lang = 'test'
      mockRequest.query.locationId = '123'
      mockRequest.query.locationName = 'Test Location'
      mockRequest.path = PM25_PATH_CY
      const expectedUrl =
        'https://check-air-quality.service.gov.uk/llygryddion/mater-gronynnol-25/cy?lang=test'
      const actualUrl = getAirQualitySiteUrl(mockRequest)
      expect(actualUrl).toBe(expectedUrl)
      const result = particulateMatter25Controller.handler(mockRequest, mockH)
      expect(result).toBe(VIEW_RENDERED)
      expect(mockH.view).toHaveBeenCalledWith('particulate-matter-25/index', {
        pageTitle: mockContent.pollutants.particulateMatter25.pageTitle,
        description: mockContent.pollutants.particulateMatter25.description,
        metaSiteUrl: actualUrl,
        particulateMatter25,
        page: 'particulate matter 25',
        displayBacklink: true,
        backLinkText: 'Llygredd aer yn Test Location',
        backLinkUrl: '/lleoliad/123?lang=cy',
        customBackLink: true,
        phaseBanner: mockContent.phaseBanner,
        footerTxt: mockContent.footerTxt,
        cookieBanner: mockContent.cookieBanner,
        serviceName: mockContent.multipleLocations.serviceName,
        lang: LANG_CY,
        currentPath: PM25_PATH_CY
      })
    })
  })
})
