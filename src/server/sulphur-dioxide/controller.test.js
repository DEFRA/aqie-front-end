/* global vi */
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { english } from '../data/en/en.js'
import { sulphurDioxideController } from './controller.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

const TEST_LOCATION = 'Test Location'

describe('sulphurDioxide Controller - English', () => {
  let mockRequest
  let mockH
  const mockContent = english
  const { sulphurDioxide } = english.pollutants
  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/sulphur-dioxide'
    }
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
    mockH = {
      redirect: vi.fn().mockImplementation((_url) => {
        return {
          code: vi.fn().mockImplementation((_statusCode) => {
            return 'redirected'
          })
        }
      }),
      view: vi.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = LANG_CY
    mockRequest.query.locationId = '123'
    mockRequest.query.locationName = TEST_LOCATION
    const result = sulphurDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/llygryddion/sylffwr-deuocsid/cy?lang=cy&locationId=123&locationName=Test+Location'
    )
  })

  it('should render the sulphurDioxide page with the necessary data', () => {
    mockRequest = {
      query: {
        lang: LANG_EN
      },
      path: '/sulphur-dioxide'
    }
    mockRequest.query.locationId = '123'
    mockRequest.query.locationName = TEST_LOCATION
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/sulphur-dioxide?lang=en&locationId=123&locationName=Test+Location'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = sulphurDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('sulphur-dioxide/index', {
      pageTitle: mockContent.pollutants.sulphurDioxide.pageTitle,
      description: mockContent.pollutants.sulphurDioxide.description,
      metaSiteUrl: actualUrl,
      sulphurDioxide,
      page: 'sulphur dioxide',
      displayBacklink: true,
      backLinkText: 'Air pollution in Test Location',
      backLinkUrl: '/location/123?lang=en',
      customBackLink: true,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang,
      currentPath: '/pollutants/sulphur-dioxide',
      queryParams: mockRequest.query,
      locationId: '123',
      locationName: TEST_LOCATION,
      searchTerms: undefined
    })
  })
})
