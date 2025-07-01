/* global vi */
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { english } from '../data/en/en.js'
import { sulphurDioxideController } from './controller.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

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
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
    mockH = {
      redirect: vi.fn().mockReturnValue('redirected'),
      view: vi.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = LANG_CY
    const result = sulphurDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/llygryddion/sylffwr-deuocsid/cy?lang=cy'
    )
  })

  it('should render the sulphurDioxide page with the necessary data', () => {
    mockRequest = {
      query: {
        lang: LANG_EN
      },
      path: '/sulphur-dioxide'
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/sulphur-dioxide?lang=en'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = sulphurDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('sulphur-dioxide/index', {
      pageTitle: mockContent.pollutants.sulphurDioxide.pageTitle,
      description: mockContent.pollutants.sulphurDioxide.description,
      metaSiteUrl: actualUrl,
      sulphurDioxide,
      page: 'Sulphur dioxide (SO₂)',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang
    })
  })
})
