import { nitrogenDioxideController } from '~/src/server/nitrogen-dioxide/cy/controller'
import { welsh } from '~/src/server/data/cy/cy.js'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'

describe('Nitrogen Dioxide Controller - Welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  const { nitrogenDioxide } = welsh.pollutants
  beforeEach(() => {
    mockRequest = {
      query: {},
      path: ''
    }
    mockH = {
      redirect: jest.fn().mockReturnValue('redirected'),
      view: jest.fn().mockReturnValue('view rendered')
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
    const result = nitrogenDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('nitrogen-dioxide/index', {
      pageTitle: mockContent.pollutants.nitrogenDioxide.pageTitle,
      description: mockContent.pollutants.nitrogenDioxide.description,
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

  it('should redirect to the welsh version if the language is not equal to "en" and "cy"', () => {
    mockRequest.query.lang = 'test'
    mockRequest.path = '/llygryddion/oson/cy'
    const result = nitrogenDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('nitrogen-dioxide/index', {
      pageTitle: mockContent.pollutants.nitrogenDioxide.pageTitle,
      description: mockContent.pollutants.nitrogenDioxide.description,
      nitrogenDioxide,
      page: 'Nitrogen dioxide (NO₂)',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: 'cy'
    })
  })
})
