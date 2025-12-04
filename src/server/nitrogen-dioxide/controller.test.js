/* global vi */
import { nitrogenDioxideController } from './controller.js'
import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

describe('Nitrogen Dioxide Controller - English', () => {
  let mockRequest
  let mockH
  const mockContent = english
  const { nitrogenDioxide } = english.pollutants
  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/pollutants/nitrogen-dioxide'
    }
    vi.mock('../../common/helpers/get-site-url.js', () => ({
      getAirQualitySiteUrl: vi.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
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
    mockRequest.path = '/llygryddion/nitrogen-deuocsid/cy'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/nitrogen-deuocsid/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = nitrogenDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/llygryddion/nitrogen-deuocsid/cy?lang=cy'
    )
  })

  it('should render the nitrogen-dioxide page with the necessary data', () => {
    mockRequest.query.lang = LANG_EN
    mockRequest.query.locationId = '123'
    mockRequest.query.locationName = 'Test Location'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/pollutants/nitrogen-dioxide?lang=en&locationId=123&locationName=Test+Location'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = nitrogenDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('nitrogen-dioxide/index', {
      pageTitle: mockContent.pollutants.nitrogenDioxide.pageTitle,
      description: mockContent.pollutants.nitrogenDioxide.description,
      metaSiteUrl: actualUrl,
      nitrogenDioxide,
      page: 'Nitrogen dioxide (NO₂)',
      displayBacklink: true,
      backLinkText: 'Air pollution in Test Location',
      backLinkUrl: '/location/123?lang=en',
      customBackLink: true,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang,
      currentPath: '/pollutants/nitrogen-dioxide'
    })
  })
})
