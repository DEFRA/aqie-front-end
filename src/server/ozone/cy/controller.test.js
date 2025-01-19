import { welsh } from '~/src/server/data/cy/cy.js'
import { ozoneController } from '~/src/server/ozone/cy/controller.js'
import { LANG_CY } from '~/src/server/data/constants'

describe('Ozone Controller - Welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  const { ozone } = welsh.pollutants
  beforeEach(() => {
    mockRequest = {
      query: {},
      path: {}
    }
    mockH = {
      redirect: jest.fn().mockReturnValue('redirected'),
      view: jest.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the English version if the language is "en"', () => {
    mockRequest.query.lang = 'en'
    const result = ozoneController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/pollutants/ozone?lang=en')
  })

  it('should render the ozone cy page with the necessary data', () => {
    mockRequest.query.lang = LANG_CY
    const result = ozoneController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('ozone/index', {
      pageTitle: mockContent.pollutants.ozone.pageTitle,
      description: mockContent.pollutants.ozone.description,
      ozone,
      page: 'ozone-cy',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang
    })
  })

  it('should render the ozone cy page with the necessary data if lang is not cy | en', () => {
    mockRequest.query.lang = 'test'
    mockRequest.path = '/chwilio-lleoliad/cy'
    const result = ozoneController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('ozone/index', {
      pageTitle: mockContent.pollutants.ozone.pageTitle,
      description: mockContent.pollutants.ozone.description,
      ozone,
      page: 'ozone-cy',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: 'cy'
    })
  })
})
