import { ozoneController } from '~/src/server/ozone/controller'
import { english } from '~/src/server/data/en/en.js'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'

describe('Ozone Controller - English', () => {
  let mockRequest
  let mockH
  const mockContent = english
  const { ozone } = english.pollutants
  beforeEach(() => {
    mockRequest = {
      query: {}
    }
    mockH = {
      redirect: jest.fn().mockReturnValue('redirected'),
      view: jest.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = LANG_CY
    const result = ozoneController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/llygryddion/oson/cy?lang=cy')
  })

  it('should render the ozone page with the necessary data', () => {
    mockRequest.query.lang = LANG_EN
    const result = ozoneController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('ozone/index', {
      pageTitle: mockContent.pollutants.ozone.pageTitle,
      description: mockContent.pollutants.ozone.description,
      ozone,
      page: 'ozone',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang
    })
  })
})
