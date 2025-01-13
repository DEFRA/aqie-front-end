import { welsh } from '../../data/cy/cy.js'
import { particulateMatter10Controller } from '../cy/controller.js'

describe('Particular matter10 Controller - Welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  const { particulateMatter10 } = welsh.pollutants
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
    mockRequest.query.lang = 'en'
    const result = particulateMatter10Controller.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/pollutants/particulate-matter-10?lang=en'
    )
  })

  it('should render the particulateMatter10 cy page with the necessary data', () => {
    mockRequest.query.lang = 'cy'
    const result = particulateMatter10Controller.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('particulate-matter-10/index', {
      pageTitle: mockContent.pollutants.particulateMatter10.pageTitle,
      particulateMatter10,
      page: 'particulate matter 10',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang
    })
  })

  it('should render by default to particulateMatter10 cy page if lang is not cy or en', () => {
    mockRequest.query.lang = 'test'
    mockRequest.path = '/llygryddion/mater-gronynnol-10/cy'
    const result = particulateMatter10Controller.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('particulate-matter-10/index', {
      pageTitle: mockContent.pollutants.particulateMatter10.pageTitle,
      particulateMatter10,
      page: 'particulate matter 10',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: 'cy'
    })
  })
})
