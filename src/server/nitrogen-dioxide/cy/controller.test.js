import { nitrogenDioxideController } from '~/src/server/nitrogen-dioxide/cy/controller'
import { welsh } from '../../data/cy/cy.js'

describe('Nitrogen Dioxide Controller - Welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  const { nitrogenDioxide } = welsh.pollutants
  beforeEach(() => {
    mockRequest = {
      query: {}
    }
    mockH = {
      redirect: jest.fn().mockReturnValue('redirected'),
      view: jest.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the English version if the language is "en"', () => {
    mockRequest.query.lang = 'en'
    const result = nitrogenDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/pollutants/nitrogen-dioxide?lang=en'
    )
  })

  it('should render the nitrogen-dioxide page with the necessary data', () => {
    mockRequest.query.lang = 'cy'
    const result = nitrogenDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('nitrogen-dioxide/index', {
      pageTitle: mockContent.pollutants.nitrogenDioxide.pageTitle,
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
