import { english } from '../../../src/server/data/en/en.js'
import { particulateMatter25Controller } from '../particulate-matter-25/controller.js'

describe('Particular matter25 Controller - English', () => {
  let mockRequest
  let mockH
  const mockContent = english
  const { particulateMatter25 } = english.pollutants
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
    const result = particulateMatter25Controller.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/llygryddion/mater-gronynnol-25/cy?lang=cy'
    )
  })

  it('should render the particulateMatter25 page with the necessary data', () => {
    mockRequest.query.lang = 'en'
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
})
