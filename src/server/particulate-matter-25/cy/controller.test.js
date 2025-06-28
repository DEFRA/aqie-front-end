import { welsh } from '../../data/cy/cy.js'
import { particulateMatter25Controller } from '../cy/controller.js'
import { LANG_EN, LANG_CY } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

describe('Particular matter25 Controller - English', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  const { particulateMatter25 } = welsh.pollutants
  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/llygryddion/mater-gronynnol-25/cy'
    }
    vi.mock('../../common/helpers/get-site-url.js', () => ({
      getAirQualitySiteUrl: vi.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
    mockH = {
      redirect: vi.fn().mockReturnValue('redirected'),
      view: vi.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the English version if the language is "cy"', () => {
    mockRequest.query.lang = LANG_EN
    const result = particulateMatter25Controller.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/pollutants/particulate-matter-25?lang=en'
    )
  })

  it('should render the particulateMatter25 page with the necessary data', () => {
    mockRequest.query.lang = LANG_CY
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/mater-gronynnol-25/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = particulateMatter25Controller.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('particulate-matter-25/index', {
      pageTitle: mockContent.pollutants.particulateMatter25.pageTitle,
      description: mockContent.pollutants.particulateMatter25.description,
      metaSiteUrl: actualUrl,
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

  it('should render by default to particulateMatter25 page if lang is not cy or en', () => {
    mockRequest.query.lang = 'test'
    mockRequest.path = '/llygryddion/mater-gronynnol-25/cy'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/mater-gronynnol-25/cy?lang=test'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = particulateMatter25Controller.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('particulate-matter-25/index', {
      pageTitle: mockContent.pollutants.particulateMatter25.pageTitle,
      description: mockContent.pollutants.particulateMatter25.description,
      metaSiteUrl: actualUrl,
      particulateMatter25,
      page: 'particulate matter 25',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: LANG_CY
    })
  })
})
