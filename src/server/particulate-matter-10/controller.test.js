import { english } from '../../../src/server/data/en/en.js'
import { particulateMatter10Controller } from '../particulate-matter-10/controller.js'

describe('Particular matter10 Controller - English', () => {
  let mockRequest
  let mockH
  const mockContent = english
  const { particulateMatter10 } = english.pollutants
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
    mockRequest.query.lang = 'cy'
    const result = particulateMatter10Controller.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/llygryddion/mater-gronynnol-10/cy?lang=cy'
    )
  })

  it('should render the particulateMatter10 page with the necessary data', () => {
    mockRequest.query.lang = 'en'
    const result = particulateMatter10Controller.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('particulate-matter-10/index', {
      pageTitle: mockContent.pollutants.particulateMatter10.pageTitle,
      description: mockContent.pollutants.particulateMatter10.description,
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
})
