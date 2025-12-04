/* global vi */
import { welsh } from '../../data/cy/cy.js'
import { particulateMatter10Controller } from '../../particulate-matter-10/cy/controller.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const PM10_PATH_CY = '/llygryddion/mater-gronynnol-10/cy'
const VIEW_RENDERED = 'view rendered'

// Helper to create expected view data
function createExpectedViewData(content, url, langCode, pollutantData) {
  return {
    pageTitle: content.pollutants.particulateMatter10.pageTitle,
    description: content.pollutants.particulateMatter10.description,
    metaSiteUrl: url,
    particulateMatter10: pollutantData,
    page: 'particulate matter 10',
    displayBacklink: true,
    backLinkText: 'Llygredd aer yn Test Location',
    backLinkUrl: '/lleoliad/123?lang=cy',
    customBackLink: true,
    phaseBanner: content.phaseBanner,
    footerTxt: content.footerTxt,
    cookieBanner: content.cookieBanner,
    serviceName: content.multipleLocations.serviceName,
    lang: langCode,
    currentPath: PM10_PATH_CY
  }
}

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

describe('Welsh redirects', () => {
  it('should redirect to the English version if the language is "en"', () => {
    mockRequest.query.lang = LANG_EN
    const result = particulateMatter10Controller.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(
      '/pollutants/particulate-matter-10?lang=en'
    )
  })
})

describe('Welsh content rendering', () => {
  it('should render the particulateMatter10 cy page with the necessary data', () => {
    mockRequest.query.lang = LANG_CY
    mockRequest.query.locationId = '123'
    mockRequest.query.locationName = 'Test Location'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/mater-gronynnol-10/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = particulateMatter10Controller.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    const expectedData = createExpectedViewData(
      mockContent,
      actualUrl,
      mockRequest.query.lang,
      particulateMatter10
    )
    expect(mockH.view).toHaveBeenCalledWith(
      'particulate-matter-10/index',
      expectedData
    )
  })

  it('should render by default to particulateMatter10 cy page if lang is not cy or en', () => {
    mockRequest.query.lang = 'test'
    mockRequest.query.locationId = '123'
    mockRequest.query.locationName = 'Test Location'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/mater-gronynnol-10/cy?lang=test'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = particulateMatter10Controller.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    const expectedData = createExpectedViewData(
      mockContent,
      actualUrl,
      LANG_CY,
      particulateMatter10
    )
    expect(mockH.view).toHaveBeenCalledWith(
      'particulate-matter-10/index',
      expectedData
    )
  })
})
