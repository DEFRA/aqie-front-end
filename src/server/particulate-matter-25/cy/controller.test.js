import { welsh } from '~/src/server/data/cy/cy.js'
import { particulateMatter25Controller } from '../cy/controller.js'
import { LANG_EN, LANG_CY } from '~/src/server/data/constants.js'

describe('Particular matter25 Controller - English', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  const { particulateMatter25 } = welsh.pollutants
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
    mockRequest.query.lang = LANG_EN
    const result = particulateMatter25Controller.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/pollutants/particulate-matter-25?lang=en'
    )
  })

  it('should render the particulateMatter25 page with the necessary data', () => {
    mockRequest.query.lang = LANG_CY
    const result = particulateMatter25Controller.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('particulate-matter-25/index', {
      pageTitle: mockContent.pollutants.particulateMatter25.pageTitle,
      description: mockContent.pollutants.particulateMatter25.description,
      particulateMatter25,
      page: 'particulate matter 25',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang
    })
  })

  it('should render by default to particulateMatter25 page if lang is not cy or en', () => {
    mockRequest.query.lang = 'test'
    mockRequest.path = '/chwilio-lleoliad/cy'
    const result = particulateMatter25Controller.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('particulate-matter-25/index', {
      pageTitle: mockContent.pollutants.particulateMatter25.pageTitle,
      description: mockContent.pollutants.particulateMatter25.description,
      particulateMatter25,
      page: 'particulate matter 25',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: 'cy'
    })
  })
})
