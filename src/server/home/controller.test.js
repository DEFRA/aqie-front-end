import { homeController, handleHomeRequest } from '~/src/server/home/controller'
import { english } from '~/src/server/data/en/en.js'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'

describe('Home Controller', () => {
  let mockRequest
  let mockH
  const mockContent = english

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/'
    }
    jest.mock('~/src/server/common/helpers/get-site-url', () => ({
      getAirQualitySiteUrl: jest.fn((request) => {
        return `https://check-air-quality.service.gov.uk/${request.path}?lang=${request.query.lang}`
      })
    }))
    mockH = {
      redirect: jest.fn().mockReturnValue('redirected'),
      view: jest.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = 'cy'
    const expectedUrl = 'https://check-air-quality.service.gov.uk/?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = homeController.handler(mockRequest, mockH, mockContent)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('cy')
  })

  it('should render the home page with the necessary data', () => {
    mockRequest.query.lang = 'en'
    const expectedUrl = 'https://check-air-quality.service.gov.uk/?lang=en'
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
      lang: 'en'
    })
  })
})
