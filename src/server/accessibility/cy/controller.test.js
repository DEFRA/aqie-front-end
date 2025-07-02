import { accessibilityController, accessibilityHandler } from './controller.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../../data/constants.js'
import { vi } from 'vitest'

const BASE_ACCESSIBILITY_URL =
  'https://check-air-quality.service.gov.uk/accessibility'
const BASE_WELSH_ACCESSIBILITY_URL =
  'https://check-air-quality.service.gov.uk/hygyrchedd'

const setupMockRequest = (lang, path) => ({
  query: { lang },
  path
})

const setupMockH = () => ({
  redirect: vi.fn().mockImplementation(() => {
    return {
      code: vi.fn().mockImplementation((statusCode) => {
        return statusCode === REDIRECT_STATUS_CODE ? 'redirected' : 'error'
      })
    }
  }),
  view: vi.fn().mockReturnValue('view rendered')
})

const mockContent = welsh

describe('Accessibility Handler', () => {
  let mockH

  beforeEach(() => {
    mockH = setupMockH()
  })

  const testRedirectToEnglish = () => {
    const mockRequest = setupMockRequest(LANG_EN, '/accessibility')
    const expectedUrl = `${BASE_ACCESSIBILITY_URL}?lang=en`
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = accessibilityController.handler(
      mockRequest,
      mockH,
      mockContent
    )
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/accessibility?lang=en')
  }

  const testRenderAccessibilityPage = () => {
    const mockRequest = setupMockRequest(LANG_CY, '/hygyrchedd/cy')
    const expectedUrl = `${BASE_WELSH_ACCESSIBILITY_URL}/cy?lang=cy`
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = accessibilityController.handler(
      mockRequest,
      mockH,
      mockContent
    )
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('accessibility/index', {
      pageTitle: mockContent.footer.accessibility.pageTitle,
      title: mockContent.footer.accessibility.title,
      description: mockContent.footer.accessibility.description,
      metaSiteUrl: actualUrl,
      heading: mockContent.footer.accessibility.heading,
      headings: mockContent.footer.accessibility.headings,
      paragraphs: mockContent.footer.accessibility.paragraphs,
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      serviceName: mockContent.multipleLocations.serviceName,
      cookieBanner: mockContent.cookieBanner,
      lang: LANG_CY
    })
  }

  const testDefaultToWelsh = () => {
    const mockRequest = setupMockRequest('fr', '/hygyrchedd/cy')
    const expectedUrl = `${BASE_WELSH_ACCESSIBILITY_URL}/cy?lang=fr`
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = accessibilityHandler(mockRequest, mockH, mockContent)
    expect(result).toBe('view rendered')
    expect(mockH.view).toHaveBeenCalledWith('accessibility/index', {
      pageTitle: mockContent.footer.accessibility.pageTitle,
      description: mockContent.footer.accessibility.description,
      metaSiteUrl: actualUrl,
      title: mockContent.footer.accessibility.title,
      heading: mockContent.footer.accessibility.heading,
      headings: mockContent.footer.accessibility.headings,
      paragraphs: mockContent.footer.accessibility.paragraphs,
      displayBacklink: false,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      serviceName: mockContent.multipleLocations.serviceName,
      cookieBanner: mockContent.cookieBanner,
      lang: LANG_CY
    })
  }

  it(
    'should redirect to the English version if the language is "en"',
    testRedirectToEnglish
  )

  it(
    'should render the accessibility page with the necessary data',
    testRenderAccessibilityPage
  )

  it(
    'should render the accessibility page by Default to Welsh if language is not cy and en',
    testDefaultToWelsh
  )
})
