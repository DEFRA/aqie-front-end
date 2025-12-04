/* global vi */
import { english } from '../data/en/en.js'
import { particulateMatter10Controller } from './controller.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

describe('Particular matter10 Controller - English', () => {
  let mockRequest
  let mockH
  const mockContent = english
  const { particulateMatter10 } = english.pollutants
  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/pollutants/particulate-matter-10'
    }
    vi.mock('../common/helpers/get-site-url.js', () => ({
      getAirQualitySiteUrl: vi.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
    mockH = {
      redirect: vi.fn().mockImplementation((_url) => {
        return {
          code: vi.fn().mockImplementation((_statusCode) => {
            return 'redirected'
          })
        }
      }),
      view: vi.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = LANG_CY
    const result = particulateMatter10Controller.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/llygryddion/mater-gronynnol-10/cy?lang=cy'
    )
  })

  it('should render the particulateMatter10 page with the necessary data', () => {
    mockRequest.query.lang = LANG_EN
    mockRequest.query.locationId = '123'
    mockRequest.query.locationName = 'Test Location'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/pollutants/particulate-matter-10?lang=en'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = particulateMatter10Controller.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('particulate-matter-10/index', {
      pageTitle: mockContent.pollutants.particulateMatter10.pageTitle,
      description: mockContent.pollutants.particulateMatter10.description,
      metaSiteUrl: actualUrl,
      particulateMatter10,
      page: 'particulate matter 10',
      displayBacklink: true,
      backLinkText: 'Air pollution in Test Location',
      backLinkUrl: '/location/123?lang=en',
      customBackLink: true,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang,
      currentPath: '/pollutants/particulate-matter-10'
    })
  })
})
