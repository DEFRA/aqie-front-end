import { welsh } from '../../data/cy/cy.js'
import { sulphurDioxideController } from './controller.js'

describe('sulphurDioxide Controller - Welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  const { sulphurDioxide } = welsh.pollutants
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

  it('should redirect to the English version if the language is "cy"', () => {
    mockRequest.query.lang = 'en'
    const result = sulphurDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/pollutants/sulphur-dioxide?lang=en'
    )
  })

  it('should render the sulphurDioxide page with the necessary data', () => {
    mockRequest.query.lang = 'cy'
    const result = sulphurDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('sulphur-dioxide/index', {
      pageTitle: mockContent.pollutants.sulphurDioxide.pageTitle,
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

  it('should render by default to sulphurDioxide welsh page if lang is not cy or en', () => {
    mockRequest.query.lang = 'test'
    mockRequest.path = '/llygryddion/sylffwr-deuocsid/cy'
    const result = sulphurDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('sulphur-dioxide/index', {
      pageTitle: mockContent.pollutants.sulphurDioxide.pageTitle,
      sulphurDioxide,
      page: 'Sulphur dioxide (SO₂)',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: 'cy'
    })
  })
})
