import { nitrogenDioxideController } from '~/src/server/nitrogen-dioxide/controller'
import { english } from '~/src/server/data/en/en.js'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'

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
    jest.mock('~/src/server/common/helpers/get-site-url', () => ({
      getAirQualitySiteUrl: jest.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
    mockH = {
      redirect: jest.fn().mockReturnValue('redirected'),
      view: jest.fn().mockReturnValue('view rendered')
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
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/pollutants/nitrogen-dioxide?lang=en'
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
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang
    })
  })
})
