/* global vi */
import { english } from '../data/en/en.js'
import { particulateMatter10Controller } from './controller.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

const TEST_LOCATION = 'Test Location'

// '' Shared mock setup
function createMockRequestResponse() {
  const mockRequest = { query: {}, path: '/pollutants/particulate-matter-10' }
  const mockH = {
    redirect: vi.fn().mockImplementation((_url) => ({
      code: vi.fn().mockImplementation((_statusCode) => 'redirected')
    })),
    view: vi.fn().mockReturnValue('view rendered')
  }
  return { mockRequest, mockH }
}

// '' Setup mock for getAirQualitySiteUrl
function setupMockGetAirQualitySiteUrl() {
  vi.mock('../common/helpers/get-site-url.js', () => ({
    getAirQualitySiteUrl: vi.fn((request) => {
      const queryParams = new URLSearchParams({
        lang: request.query.lang || 'en'
      })
      if (request.query.locationId) {
        queryParams.append('locationId', request.query.locationId)
      }
      if (request.query.locationName) {
        queryParams.append('locationName', request.query.locationName)
      }
      if (request.query.searchTerms) {
        queryParams.append('searchTerms', request.query.searchTerms)
      }
      return `https://check-air-quality.service.gov.uk${request.path}?${queryParams.toString()}`
    })
  }))
}

describe('Particular matter10 Controller - English', () => {
  beforeEach(() => {
    setupMockGetAirQualitySiteUrl()
  })

  describe('redirects', () => {
    it('should redirect to the Welsh version if the language is "cy"', () => {
      const { mockRequest, mockH } = createMockRequestResponse()
      mockRequest.query.lang = LANG_CY
      mockRequest.query.locationId = '123'
      mockRequest.query.locationName = TEST_LOCATION
      const result = particulateMatter10Controller.handler(mockRequest, mockH)
      expect(result).toBe('redirected')
      expect(mockH.redirect).toHaveBeenCalledWith(
        '/llygryddion/mater-gronynnol-10/cy?lang=cy&locationId=123&locationName=Test+Location'
      )
    })
  })

  describe('rendering', () => {
    it('should render the particulateMatter10 page with the necessary data', () => {
      const { mockRequest, mockH } = createMockRequestResponse()
      const mockContent = english
      const { particulateMatter10 } = english.pollutants

      mockRequest.query.lang = LANG_EN
      mockRequest.query.locationId = '123'
      mockRequest.query.locationName = TEST_LOCATION
      const expectedUrl =
        'https://check-air-quality.service.gov.uk/pollutants/particulate-matter-10?lang=en&locationId=123&locationName=Test+Location'
      const actualUrl = getAirQualitySiteUrl(mockRequest)
      expect(actualUrl).toBe(expectedUrl)
      const result = particulateMatter10Controller.handler(mockRequest, mockH)
      expect(result).toBe('view rendered')
      expect(mockH.view).toHaveBeenCalledWith('particulate-matter-10/index', {
        pageTitle: mockContent.pollutants.particulateMatter10.pageTitle,
        description: mockContent.pollutants.particulateMatter10.description,
        metaSiteUrl: actualUrl,
        particulateMatter10,
        page: 'particulate matter 10',
        displayBacklink: true,
        backLinkText: 'Air pollution in Test Location',
        backLinkUrl: '/location/123?lang=en',
        customBackLink: true,
        phaseBanner: mockContent.phaseBanner,
        footerTxt: mockContent.footerTxt,
        cookieBanner: mockContent.cookieBanner,
        serviceName: mockContent.multipleLocations.serviceName,
        lang: mockRequest.query.lang,
        currentPath: '/pollutants/particulate-matter-10',
        queryParams: mockRequest.query,
        locationId: '123',
        locationName: TEST_LOCATION,
        searchTerms: null
      })
    })
  })
})
