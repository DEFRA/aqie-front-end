import { LANG_CY } from '~/src/server/data/constants'
import { accessibilityHandler } from './controller'

describe('Accessibility Handler', () => {
  const mockRequest = {
    query: {}
  }
  const mockH = {
    redirect: jest.fn().mockReturnValue('redirected'),
    view: jest.fn().mockReturnValue('view rendered')
  }
  const mockContent = {
    footer: {
      accessibility: {
        paragraphs: 'mock paragraphs',
        pageTitle: 'mock pageTitle',
        title: 'mock title',
        headings: 'mock headings',
        heading: 'mock heading'
      }
    },
    cookieBanner: 'mock cookieBanner',
    phaseBanner: 'mock phaseBanner',
    footerTxt: 'mock footerTxt',
    multipleLocations: { serviceName: 'mock serviceName' }
  }

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = LANG_CY
    const result = accessibilityHandler(mockRequest, mockH, mockContent)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/hygyrchedd/cy?lang=cy')
  })

  it('should render the accessibility page with the necessary data', () => {
    mockRequest.query.lang = 'en'
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
      cookieBanner: 'mock cookieBanner'
    })
  })
})
