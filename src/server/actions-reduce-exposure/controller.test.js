/* global vi */

import { actionsReduceExposureController } from './controller.js'
import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

describe('actions reduce exposure controller - English', () => {
  let mockRequest
  let mockH
  const mockContent = english
  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/actions-reduce-exposure'
    }
    vi.mock('../common/helpers/get-site-url.js', () => ({
      getAirQualitySiteUrl: vi.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
    mockH = {
      redirect: vi.fn().mockImplementation((url) => {
        return {
          code: vi.fn().mockImplementation((statusCode) => {
            return 'redirected'
          })
        }
      }),
      view: vi.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = LANG_CY
    mockRequest.path = '/camau-lleihau-amlygiad/cy'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/camau-lleihau-amlygiad/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = actionsReduceExposureController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/camau-lleihau-amlygiad/cy?lang=cy'
    )
  })

  it('should render the actions reduce exposure page with the necessary data', () => {
    mockRequest = {
      query: {
        lang: LANG_EN
      },
      path: '/actions-reduce-exposure'
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/actions-reduce-exposure?lang=en'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = actionsReduceExposureController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('actions-reduce-exposure/index', {
      pageTitle: mockContent.actionsReduceExposure.pageTitle,
      description: mockContent.actionsReduceExposure.description,
      metaSiteUrl: actualUrl,
      actionsReduceExposure: mockContent.actionsReduceExposure,
      page: 'Actions to reduce exposure',
      displayBacklink: false,
      customBackLink: false,
      backLinkText: mockContent.backlink.text,
      backLinkUrl: '/search-location?lang=en',
      locationName: '',
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      backlink: mockContent.backlink,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang
    })
  })

  it('should handle location name parameter and enable back link', () => {
    mockRequest = {
      query: {
        lang: LANG_EN,
        locationName: 'Manchester'
      },
      path: '/actions-reduce-exposure'
    }
    const result = actionsReduceExposureController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith(
      'actions-reduce-exposure/index',
      expect.objectContaining({
        displayBacklink: true,
        customBackLink: true,
        backLinkText: 'Air pollution in Manchester',
        backLinkUrl: '/location/manchester?lang=en',
        locationName: 'Manchester'
      })
    )
  })
})
