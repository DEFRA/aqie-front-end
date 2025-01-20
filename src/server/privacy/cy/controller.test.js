import { welsh } from '../../data/cy/cy.js'
import { privacyController } from './controller.js'

describe('privacy controller - Welsh', () => {
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

  it('should redirect to the english version if the language is "en"', () => {
    mockRequest.query.lang = 'en'
    const result = privacyController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/privacy?lang=en')
  })

  it('should render the privacy page with the necessary data', () => {
    mockRequest.query.lang = 'cy'
    const result = privacyController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('privacy/index', {
      pageTitle: mockContent.footer.privacy.pageTitle,
      description: mockContent.footer.privacy.description,
      title: mockContent.footer.privacy.title,
      heading: mockContent.footer.privacy.heading,
      headings: mockContent.footer.privacy.headings,
      paragraphs: mockContent.footer.privacy.paragraphs,
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      page: 'privacy',
      lang: mockRequest.query.lang
    })
  })

  it('should render the privacy page by default when lang is not cy/en and the path is there', () => {
    mockRequest.query.lang = 'su'
    mockRequest.path = '/preifatrwydd/cy'
    const result = privacyController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('privacy/index', {
      pageTitle: mockContent.footer.privacy.pageTitle,
      description: mockContent.footer.privacy.description,
      title: mockContent.footer.privacy.title,
      heading: mockContent.footer.privacy.heading,
      headings: mockContent.footer.privacy.headings,
      paragraphs: mockContent.footer.privacy.paragraphs,
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      page: 'privacy',
      lang: 'cy'
    })
  })
})
