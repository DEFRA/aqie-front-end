import { cookiesController } from './controller'
import { welsh } from '~/src/server/data/cy/cy.js'

describe('Cookies Handler', () => {
  let mockRequest
  let mockH
  const mockContent = welsh

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

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = 'cy'
    const result = cookiesController.handler(mockRequest, mockH, mockContent)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/briwsion/cy?lang=cy')
  })

  it('should render the cookies page with the necessary data', () => {
    mockRequest.query.lang = 'en'
    const result = cookiesController.handler(mockRequest, mockH, mockContent)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('cookies/index', {
      pageTitle: mockContent.footer.cookies.pageTitle,
      description: mockContent.footer.cookies.description,
      title: mockContent.footer.cookies.title,
      heading: mockContent.footer.cookies.heading,
      headings: mockContent.footer.cookies.headings,
      table1: mockContent.footer.cookies.table1,
      table2: mockContent.footer.cookies.table2,
      paragraphs: mockContent.footer.cookies.paragraphs,
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      serviceName: mockContent.multipleLocations.serviceName,
      cookieBanner: mockContent.cookieBanner,
      lang: mockRequest.query.lang
    })
  })

  it('should default to English if language is not "cy" or "en" and path is "/cookies"', () => {
    mockRequest.query.lang = 'fr'
    mockRequest.path = '/cookies'
    const result = cookiesController.handler(mockRequest, mockH, mockContent)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('cookies/index', {
      pageTitle: mockContent.footer.cookies.pageTitle,
      description: mockContent.footer.cookies.description,
      title: mockContent.footer.cookies.title,
      heading: mockContent.footer.cookies.heading,
      headings: mockContent.footer.cookies.headings,
      table1: mockContent.footer.cookies.table1,
      table2: mockContent.footer.cookies.table2,
      paragraphs: mockContent.footer.cookies.paragraphs,
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      serviceName: mockContent.multipleLocations.serviceName,
      cookieBanner: mockContent.cookieBanner,
      lang: 'en'
    })
  })
})
