import { accessibilityController } from './controller'

describe('Accessibility Handler', () => {
  const mockRequest = {
    query: {},
    path: ''
  }
  const mockH = {
    redirect: jest.fn().mockReturnValue('redirected'),
    view: jest.fn().mockReturnValue('view rendered')
  }
  const mockContent = {
    footer: {
      accessibility: {
        pageTitle: 'mock pageTitle',
        title: 'mock title',
        heading: 'mock heading',
        headings: 'mock headings',
        paragraphs: 'mock paragraphs'
      }
    },
    cookieBanner: 'mock cookieBanner',
    phaseBanner: 'mock phaseBanner',
    footerTxt: 'mock footerTxt',
    multipleLocations: { serviceName: 'mock serviceName' }
  }

  it('should redirect to the English version if the language is "en"', () => {
    mockRequest.query.lang = 'en'
    const result = accessibilityController.handler(
      mockRequest,
      mockH,
      mockContent
    )
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/accessibility?lang=en')
  })

  it('should render the accessibility page with the necessary data', () => {
    mockRequest.query.lang = 'cy'
    const result = accessibilityController.handler(
      mockRequest,
      mockH,
      mockContent
    )
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('accessibility/index', {
      pageTitle: 'mock pageTitle',
      title: 'mock title',
      heading: 'mock heading',
      headings: 'mock headings',
      paragraphs: 'mock paragraphs',
      displayBacklink: false,
      phaseBanner: 'mock phaseBanner',
      footerTxt: 'mock footerTxt',
      serviceName: 'mock serviceName',
      cookieBanner: 'mock cookieBanner',
      lang: mockRequest.query.lang
    })
  })

  it('should render the accessibility page by Default to Welsh if language is not cy and en', () => {
    mockRequest.query.lang = 'test'
    mockRequest.path = '/preifatrwydd/cy'
    const result = accessibilityController.handler(
      mockRequest,
      mockH,
      mockContent
    )
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('accessibility/index', {
      pageTitle: 'mock pageTitle',
      title: 'mock title',
      heading: 'mock heading',
      headings: 'mock headings',
      paragraphs: 'mock paragraphs',
      displayBacklink: false,
      phaseBanner: 'mock phaseBanner',
      footerTxt: 'mock footerTxt',
      serviceName: 'mock serviceName',
      cookieBanner: 'mock cookieBanner',
      lang: 'cy'
    })
  })
})
