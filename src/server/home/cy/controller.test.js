import { homeController, handleHomeRequest } from './controller.js'
import { welsh } from '../../data/cy/cy.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { createMockH } from '../../locations/helpers/error-input-and-redirect-helpers.test.js'

describe('Home Controller', () => {
  let mockRequest
  const mockContent = welsh

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/',
      headers: {
        host: ''
      }
    }
    vi.mock('../../common/helpers/get-site-url.js', () => ({
      getAirQualitySiteUrl: vi.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
  })

  it('should redirect to the English version if the language is "en"', () => {
    const mockH = createMockH()

    mockRequest.query.lang = 'en'
    const expectedUrl = 'https://check-air-quality.service.gov.uk/?lang=en'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = homeController.handler(mockRequest, mockH, mockContent)
    expect(result.takeover()).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/?lang=en')
  })

  it('should render the home page with the necessary data', () => {
    const mockH = createMockH()

    mockRequest.query.lang = 'cy'
    const expectedUrl = 'https://check-air-quality.service.gov.uk/?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = handleHomeRequest(mockRequest, mockH, mockContent)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('home/index', {
      pageTitle: mockContent.home.pageTitle,
      description: mockContent.home.description,
      metaSiteUrl: actualUrl,
      heading: mockContent.home.heading,
      page: mockContent.home.page,
      paragraphs: mockContent.home.paragraphs,
      label: mockContent.home.button,
      footerTxt: mockContent.footerTxt,
      phaseBanner: mockContent.phaseBanner,
      backlink: mockContent.backlink,
      cookieBanner: mockContent.cookieBanner,
      serviceName: '',
      lang: 'cy'
    })
  })
})
