import { english } from '~/src/server/data/en/en.js'
import { privacyController } from '~/src/server/privacy/controller.js'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'

describe('privacy controller - English', () => {
  let mockRequest
  let mockH
  const mockContent = english
  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/privacy'
    }
    jest.mock('~/src/server/common/helpers/get-site-url', () => ({
      getAirQualitySiteUrl: jest.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
    mockH = {
      redirect: jest.fn().mockReturnValue('redirected'),
      view: jest.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = LANG_CY
    mockRequest.path = '/preifatrwydd/cy'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/preifatrwydd/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = privacyController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/preifatrwydd/cy?lang=cy')
  })

  it('should render the privacy page with the necessary data', () => {
    mockRequest = {
      query: {
        lang: LANG_EN
      },
      path: '/privacy'
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/privacy?lang=en'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = privacyController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('privacy/index', {
      pageTitle: mockContent.footer.privacy.pageTitle,
      description: mockContent.footer.privacy.description,
      metaSiteUrl: actualUrl,
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
})
