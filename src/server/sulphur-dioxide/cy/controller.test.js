/* global vi */
import { welsh } from '../../data/cy/cy.js'
import { sulphurDioxideController } from './controller.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const SO2_PATH_CY = '/llygryddion/sylffwr-deuocsid/cy'
const VIEW_RENDERED = 'view rendered'

// Helper to create expected view data
function createExpectedViewData(content, actualUrl, lang, currentPath, query) {
  return {
    pageTitle: content.pollutants.sulphurDioxide.pageTitle,
    description: content.pollutants.sulphurDioxide.description,
    metaSiteUrl: actualUrl,
    sulphurDioxide: content.pollutants.sulphurDioxide,
    page: 'sulphur dioxide',
    displayBacklink: true,
    backLinkText: 'Llygredd aer yn Test Location',
    backLinkUrl: '/lleoliad/123?lang=cy',
    customBackLink: true,
    phaseBanner: content.phaseBanner,
    footerTxt: content.footerTxt,
    cookieBanner: content.cookieBanner,
    serviceName: content.multipleLocations.serviceName,
    lang,
    currentPath,
    queryParams: query,
    locationId: query?.locationId,
    locationName: query?.locationName,
    searchTerms: query?.searchTerms || null
  }
}

describe('sulphurDioxide Controller - Welsh', () => {
  let mockRequest
  let mockH
  const mockContent = welsh

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: SO2_PATH_CY
    }
    mockH = {
      redirect: vi.fn(() => ({ code: vi.fn() })),
      view: vi.fn().mockReturnValue(VIEW_RENDERED)
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
    expect(mockH.redirect().code).toHaveBeenCalledWith(REDIRECT_STATUS_CODE)

    mockRequest = {
      query: {
        lang: LANG_CY,
        locationId: '123',
        locationName: 'Test Location'
      },
      path: SO2_PATH_CY
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/sylffwr-deuocsid/cy?lang=cy&locationId=123&locationName=Test+Location'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = sulphurDioxideController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    const expectedData = createExpectedViewData(
      mockContent,
      actualUrl,
      mockRequest.query.lang,
      SO2_PATH_CY,
      mockRequest.query
    )
    expect(mockH.view).toHaveBeenCalledWith(
      'sulphur-dioxide/index',
      expectedData
    )
  })

  it('should render by default to sulphurDioxide welsh page if lang is not cy or en', () => {
    mockRequest.query.lang = 'fr'
    mockRequest.query.locationId = '123'
    mockRequest.query.locationName = 'Test Location'
    mockRequest.path = SO2_PATH_CY
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/sylffwr-deuocsid/cy?lang=fr&locationId=123&locationName=Test+Location'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = sulphurDioxideController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    const expectedData = createExpectedViewData(
      mockContent,
      actualUrl,
      LANG_CY,
      SO2_PATH_CY,
      mockRequest.query
    )
    expect(mockH.view).toHaveBeenCalledWith(
      'sulphur-dioxide/index',
      expectedData
    )
  })
})
