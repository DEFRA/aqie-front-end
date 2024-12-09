import { cookiesHandler } from '~/src/server/cookies/controller'
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

  it('should redirect to the English version if the language is "en"', () => {
    mockRequest.query.lang = 'cy'
    const result = cookiesHandler(mockRequest, mockH, mockContent)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/briwsion/cy?lang=cy')
  })

  it('should render the cookies page with the necessary data', () => {
    const result = cookiesHandler(mockRequest, mockH, mockContent)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('cookies/index', {
      pageTitle: mockContent.footer.cookies.pageTitle,
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
      cookieBanner: mockContent.cookieBanner
    })
  })

  it('should default to Welsh if language is not "cy" or "en" and path is "/preifatrwydd/cy"', () => {
    mockRequest.query.lang = 'fr'
    mockRequest.path = '/preifatrwydd/cy'
    const result = cookiesHandler(mockRequest, mockH, mockContent)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('cookies/index', {
      pageTitle: mockContent.footer.cookies.pageTitle,
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
      lang: 'fr'
    })
  })
})
