/* global vi */
import { welsh } from '../../data/cy/cy.js'
import { particulateMatter10Controller } from '../../particulate-matter-10/cy/controller.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const PM10_PATH_CY = PM10_PATH_CY
const VIEW_RENDERED = VIEW_RENDERED

describe('Particular matter10 Controller - Welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  const { particulateMatter10 } = welsh.pollutants
  beforeEach(() => {
    mockRequest = {
      query: {},
      path: PM10_PATH_CY
    }
    vi.mock('../../common/helpers/get-site-url.js', () => ({
      getAirQualitySiteUrl: vi.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
    mockH = {
      redirect: vi.fn(() => ({
        code: vi.fn().mockReturnValue('redirected')
      })),
      view: vi.fn().mockReturnValue(VIEW_RENDERED)
    }
  })

  it('should redirect to the English version if the language is "en"', () => {
    mockRequest.query.lang = LANG_EN
    const result = particulateMatter10Controller.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/pollutants/particulate-matter-10?lang=en'
    )
  })

  it('should render the particulateMatter10 cy page with the necessary data', () => {
    mockRequest.query.lang = LANG_CY
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/mater-gronynnol-10/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = particulateMatter10Controller.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith('particulate-matter-10/index', {
      pageTitle: mockContent.pollutants.particulateMatter10.pageTitle,
      description: mockContent.pollutants.particulateMatter10.description,
      metaSiteUrl: actualUrl,
      particulateMatter10,
      page: 'particulate matter 10',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang,
      currentPath: PM10_PATH_CY
    })
  })

  it('should render by default to particulateMatter10 cy page if lang is not cy or en', () => {
    mockRequest.query.lang = 'test'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/mater-gronynnol-10/cy?lang=test'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = particulateMatter10Controller.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith('particulate-matter-10/index', {
      pageTitle: mockContent.pollutants.particulateMatter10.pageTitle,
      description: mockContent.pollutants.particulateMatter10.description,
      metaSiteUrl: actualUrl,
      particulateMatter10,
      page: 'particulate matter 10',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: LANG_CY,
      currentPath: PM10_PATH_CY
    })
  })
})
