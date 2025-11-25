import { accessibilityController, accessibilityHandler } from './controller.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../../data/constants.js'
import { vi } from 'vitest'

const BASE_ACCESSIBILITY_URL =
  'https://check-air-quality.service.gov.uk/accessibility'
const BASE_WELSH_ACCESSIBILITY_URL =
  'https://check-air-quality.service.gov.uk/hygyrchedd'

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
  mockContent
) => {
  const actualUrl = getAirQualitySiteUrl(mockRequest)
  expect(actualUrl).toBe(expectedUrl)
  const result = accessibilityController.handler(
    mockRequest,
    mockH,
    mockContent
  )
  expect(result).toBe('redirected')
  expect(mockH.redirect).toHaveBeenCalledWith(redirectPath)
}

const validateRender = (mockRequest, expectedUrl, lang, mockH, mockContent) => {
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
    lang,
    currentPath: '/hygyrchedd/cy'
  })
}

const testRedirectToEnglish = (mockH, mockContent) => {
  const mockRequest = setupMockRequest(LANG_EN, '/accessibility')
  const expectedUrl = `${BASE_ACCESSIBILITY_URL}?lang=en`
  validateRedirect(
    mockRequest,
    expectedUrl,
    '/accessibility?lang=en',
    mockH,
    mockContent
  )
}

const testRenderAccessibilityPage = (mockH, mockContent) => {
  const mockRequest = setupMockRequest(LANG_CY, '/hygyrchedd/cy')
  const expectedUrl = `${BASE_WELSH_ACCESSIBILITY_URL}/cy?lang=cy`
  validateRender(mockRequest, expectedUrl, LANG_CY, mockH, mockContent)
}

const testDefaultToWelsh = (mockH, mockContent) => {
  const mockRequest = setupMockRequest('fr', '/hygyrchedd/cy')
  const expectedUrl = `${BASE_WELSH_ACCESSIBILITY_URL}/cy?lang=fr`
  validateRender(mockRequest, expectedUrl, LANG_CY, mockH, mockContent)
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
