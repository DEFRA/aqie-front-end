/* global vi */
import { welsh } from '../../data/cy/cy.js'
import { sulphurDioxideController } from './controller.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

describe('sulphurDioxide Controller - Welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh
  const { sulphurDioxide } = welsh.pollutants

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/llygryddion/sylffwr-deuocsid/cy'
    }
    mockH = {
      redirect: vi.fn(() => ({ code: vi.fn() })),
      view: vi.fn().mockReturnValue('view rendered')
    }
  })

  it('should redirect to the English version if the language is "cy"', () => {
    const codeSpy = vi.fn()
    mockH.redirect = vi.fn(() => ({
      code: codeSpy
    }))

    mockRequest.query.lang = LANG_EN
    sulphurDioxideController.handler(mockRequest, mockH)
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/pollutants/sulphur-dioxide?lang=en'
    )
    expect(mockH.redirect().code).toHaveBeenCalledWith(301)

    mockRequest = {
      query: {
        lang: LANG_CY
      },
      path: '/llygryddion/sylffwr-deuocsid/cy'
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/sylffwr-deuocsid/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = sulphurDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('sulphur-dioxide/index', {
      pageTitle: mockContent.pollutants.sulphurDioxide.pageTitle,
      description: mockContent.pollutants.sulphurDioxide.description,
      metaSiteUrl: actualUrl,
      sulphurDioxide,
      page: 'Sulphur dioxide (SO₂)',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang
    })
  })

  it('should render by default to sulphurDioxide welsh page if lang is not cy or en', () => {
    mockRequest.query.lang = 'fr'
    mockRequest.path = '/llygryddion/sylffwr-deuocsid/cy'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/sylffwr-deuocsid/cy?lang=fr'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = sulphurDioxideController.handler(mockRequest, mockH)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('sulphur-dioxide/index', {
      pageTitle: mockContent.pollutants.sulphurDioxide.pageTitle,
      description: mockContent.pollutants.sulphurDioxide.description,
      metaSiteUrl: actualUrl,
      sulphurDioxide,
      page: 'Sulphur dioxide (SO₂)',
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: LANG_CY
    })
  })
})
