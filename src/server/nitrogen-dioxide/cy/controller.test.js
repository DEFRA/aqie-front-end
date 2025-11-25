import { nitrogenDioxideController } from './controller.js'
import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

describe('Nitrogen Dioxide Controller - Welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  const { nitrogenDioxide } = welsh.pollutants
  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/llygryddion/nitrogen-deuocsid/cy'
    }
    vi.mock('../../common/helpers/get-site-url.js', () => ({
      getAirQualitySiteUrl: vi.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
    mockH = {
      redirect: vi.fn(() => ({
        code: vi.fn().mockReturnValue('redirected')
      })),
      view: vi.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the English version if the language is "en"', () => {
    mockRequest.query.lang = LANG_EN
    const result = nitrogenDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/pollutants/nitrogen-dioxide?lang=en'
    )
  })

  it('should render the nitrogen-dioxide page with the necessary data', () => {
    mockRequest.query.lang = LANG_CY
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/nitrogen-deuocsid/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    const result = nitrogenDioxideController.handler(mockRequest, mockH)
    expect(actualUrl).toBe(expectedUrl)
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
      lang: mockRequest.query.lang,
      currentPath: '/llygryddion/nitrogen-deuocsid/cy'
    })
  })

  it('should redirect to the welsh version if the language is not equal to "en" and "cy"', () => {
    mockRequest.query.lang = 'test'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/nitrogen-deuocsid/cy?lang=test'
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
      lang: LANG_CY,
      currentPath: '/llygryddion/nitrogen-deuocsid/cy'
    })
  })
})
