import { accessibilityController, accessibilityHandler } from './controller.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../../data/constants.js'
import { vi } from 'vitest'

const BASE_ACCESSIBILITY_URL =
  'https://check-air-quality.service.gov.uk/accessibility'
const BASE_WELSH_ACCESSIBILITY_URL =
  'https://check-air-quality.service.gov.uk/hygyrchedd'
const WELSH_ACCESSIBILITY_PATH = '/hygyrchedd/cy'

const setupMockRequest = (lang, _url) => ({
  query: { lang },
  path: _url
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

// Extracted helper functions for validation logic
const validateRedirect = (
  mockRequest,
  expectedUrl,
  redirectPath,
  mockH,
  content
) => {
  const actualUrl = getAirQualitySiteUrl(mockRequest)
  expect(actualUrl).toBe(expectedUrl)
  const result = accessibilityController.handler(mockRequest, mockH, content)
  expect(result).toBe('redirected')
  expect(mockH.redirect).toHaveBeenCalledWith(redirectPath)
}

const validateRender = (mockRequest, expectedUrl, lang, mockH, content) => {
  const actualUrl = getAirQualitySiteUrl(mockRequest)
  expect(actualUrl).toBe(expectedUrl)
  const result = accessibilityHandler(mockRequest, mockH, content)
  expect(result).toBe('view rendered')
  expect(mockH.view).toHaveBeenCalledWith('accessibility/index', {
    pageTitle: content.footer.accessibility.pageTitle,
    description: content.footer.accessibility.description,
    metaSiteUrl: actualUrl,
    title: content.footer.accessibility.title,
    heading: content.footer.accessibility.heading,
    headings: content.footer.accessibility.headings,
    paragraphs: content.footer.accessibility.paragraphs,
    displayBacklink: false,
    phaseBanner: content.phaseBanner,
    footerTxt: content.footerTxt,
    serviceName: content.multipleLocations.serviceName,
    cookieBanner: content.cookieBanner,
    lang,
    currentPath: '/hygyrchedd/cy'
  })
}

const testRedirectToEnglish = (mockH, content) => {
  const mockRequest = setupMockRequest(LANG_EN, '/accessibility')
  const expectedUrl = `${BASE_ACCESSIBILITY_URL}?lang=en`
  validateRedirect(
    mockRequest,
    expectedUrl,
    '/accessibility?lang=en',
    mockH,
    content
  )
}

const testRenderAccessibilityPage = (mockH, content) => {
  const mockRequest = setupMockRequest(LANG_CY, WELSH_ACCESSIBILITY_PATH)
  const expectedUrl = `${BASE_WELSH_ACCESSIBILITY_URL}/cy?lang=cy`
  validateRender(mockRequest, expectedUrl, LANG_CY, mockH, content)
}

const testDefaultToWelsh = (mockH, content) => {
  const mockRequest = setupMockRequest('fr', WELSH_ACCESSIBILITY_PATH)
  const expectedUrl = `${BASE_WELSH_ACCESSIBILITY_URL}/cy?lang=fr`
  validateRender(mockRequest, expectedUrl, LANG_CY, mockH, content)
}

const mockContent = welsh

describe('Accessibility Handler', () => {
  let mockH

  beforeEach(() => {
    mockH = setupMockH()
  })

  it('should redirect to the English version if the language is "en"', () =>
    testRedirectToEnglish(mockH, mockContent))

  it('should render the accessibility page with the necessary data', () =>
    testRenderAccessibilityPage(mockH, mockContent))

  it('should render the accessibility page by Default to Welsh if language is not cy and en', () =>
    testDefaultToWelsh(mockH, mockContent))
})
