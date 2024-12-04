import { cookiesHandler } from './controller'

describe('Cookies Handler', () => {
  const mockRequest = {
    query: {}
  }
  const mockH = {
    redirect: jest.fn().mockReturnValue('redirected'),
    view: jest.fn().mockReturnValue('view rendered')
  }
  const mockContent = {
    footer: {
      cookies: {
        pageTitle: 'mock pageTitle',
        title: 'mock title',
        heading: 'mock heading',
        headings: 'mock headings',
        table1: 'mock table1',
        table2: 'mock table2',
        paragraphs: 'mock paragraphs'
      }
    },
    cookieBanner: 'mock cookieBanner',
    phaseBanner: 'mock phaseBanner',
    footerTxt: 'mock footerTxt',
    multipleLocations: { serviceName: 'mock serviceName' }
  }

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = 'cy'
    const result = cookiesHandler(mockRequest, mockH, mockContent)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/briwsion/cy?lang=cy')
  })

  it('should render the cookies page with the necessary data', () => {
    mockRequest.query.lang = 'en'
    const result = cookiesHandler(mockRequest, mockH, mockContent)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('cookies/index', {
      pageTitle: 'mock pageTitle',
      title: 'mock title',
      heading: 'mock heading',
      headings: 'mock headings',
      table1: 'mock table1',
      table2: 'mock table2',
      paragraphs: 'mock paragraphs',
      displayBacklink: false,
      phaseBanner: 'mock phaseBanner',
      footerTxt: 'mock footerTxt',
      serviceName: 'mock serviceName',
      cookieBanner: 'mock cookieBanner'
    })
  })
})
