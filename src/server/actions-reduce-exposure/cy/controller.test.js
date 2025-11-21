/* global vi */

import { actionsReduceExposureCyController } from './controller.js'
import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

describe('actions reduce exposure controller - Welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/camau-lleihau-amlygiad/cy'
    }
    vi.mock('../../common/helpers/get-site-url.js', () => ({
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

  it('should redirect to the English version if the language is "en"', () => {
    mockRequest.query.lang = LANG_EN
    mockRequest.path = '/actions-reduce-exposure'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/actions-reduce-exposure?lang=en'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = actionsReduceExposureCyController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/actions-reduce-exposure?lang=en'
    )
  })

  it('should render the Welsh actions reduce exposure page with the necessary data', () => {
    mockRequest = {
      query: {
        lang: LANG_CY
      },
      path: '/camau-lleihau-amlygiad/cy'
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/camau-lleihau-amlygiad/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = actionsReduceExposureCyController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('actions-reduce-exposure/index', {
      pageTitle: mockContent.actionsReduceExposure.pageTitle,
      description: mockContent.actionsReduceExposure.description,
      metaSiteUrl: actualUrl,
      actionsReduceExposure: mockContent.actionsReduceExposure,
      page: 'Camau i leihau amlygiad',
      displayBacklink: false,
      backLinkText: mockContent.backlink.text,
      backLinkUrl: '/chwilio-lleoliad/cy?lang=cy',
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
        lang: LANG_CY,
        locationName: 'Abertawe'
      },
      path: '/camau-lleihau-amlygiad/cy'
    }
    const result = actionsReduceExposureCyController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith(
      'actions-reduce-exposure/index',
      expect.objectContaining({
        displayBacklink: true,
        backLinkText: '< Llygredd aer yn Abertawe',
        backLinkUrl: '/chwilio-lleoliad/cy?lang=cy&searchTerms=Abertawe'
      })
    )
  })
})
