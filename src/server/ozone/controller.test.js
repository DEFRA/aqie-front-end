/* global vi */
import { ozoneController } from './controller.js'
import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

const TEST_LOCATION = 'Test Location'

// '' Shared mock setup
function createMockRequestResponse() {
  const mockRequest = { query: {}, path: '/pollutants/ozone' }
  const mockH = {
    redirect: vi.fn().mockImplementation(() => ({
      code: vi.fn().mockImplementation(() => 'redirected')
    })),
    view: vi.fn().mockReturnValue('view rendered')
  }
  return { mockRequest, mockH }
}

// '' Setup mock for getAirQualitySiteUrl
function setupMockGetAirQualitySiteUrl() {
  vi.mock('../../common/helpers/get-site-url.js', () => ({
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

describe('Ozone Controller - English', () => {
  beforeEach(() => {
    setupMockGetAirQualitySiteUrl()
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    const { mockRequest, mockH } = createMockRequestResponse()
    mockRequest.query.lang = LANG_CY
    mockRequest.query.locationId = '123'
    mockRequest.query.locationName = TEST_LOCATION
    const result = ozoneController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/llygryddion/oson/cy?lang=cy&locationId=123&locationName=Test+Location'
    )
  })

  it('should render the ozone page with the necessary data', () => {
    const { mockRequest, mockH } = createMockRequestResponse()
    const mockContent = english
    const { ozone } = english.pollutants

    mockRequest.query.lang = LANG_EN
    mockRequest.query.locationId = '123'
    mockRequest.query.locationName = TEST_LOCATION
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/pollutants/ozone?lang=en&locationId=123&locationName=Test+Location'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = ozoneController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('ozone/index', {
      pageTitle: mockContent.pollutants.ozone.pageTitle,
      description: mockContent.pollutants.ozone.description,
      metaSiteUrl: actualUrl,
      ozone,
      page: 'ozone',
      displayBacklink: true,
      backLinkText: `Air pollution in ${TEST_LOCATION}`,
      backLinkUrl: '/location/123?lang=en',
      customBackLink: true,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang,
      currentPath: '/pollutants/ozone',
      queryParams: mockRequest.query,
      locationId: '123',
      locationName: TEST_LOCATION,
      searchTerms: null
    })
  })
})
