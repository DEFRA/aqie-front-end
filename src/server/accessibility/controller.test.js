/* global vi */
import { accessibilityController, accessibilityHandler } from './controller.js'
import { english } from '../data/en/en.js'
import { welsh } from '../data/cy/cy.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

const ACCESSIBILITY_PATH = '/accessibility'
const VIEW_RENDERED = 'view rendered'
const ACCESSIBILITY_INDEX_VIEW = 'accessibility/index'
const MOCK_ENGLISH_CONTENT = english
const MOCK_WELSH_CONTENT = welsh

// Helper to create expected view data
function createExpectedViewData(content, actualUrl, lang, currentPath) {
  return {
    pageTitle: content.footer.accessibility.pageTitle,
    title: content.footer.accessibility.title,
    description: content.footer.accessibility.description,
    metaSiteUrl: actualUrl,
    heading: content.footer.accessibility.heading,
    headings: content.footer.accessibility.headings,
    paragraphs: content.footer.accessibility.paragraphs,
    displayBacklink: false,
    phaseBanner: content.phaseBanner,
    footerTxt: content.footerTxt,
    serviceName: content.multipleLocations.serviceName,
    cookieBanner: content.cookieBanner,
    lang,
    currentPath
  }
}

function createMockRequest() {
  return {
    query: {},
    path: ACCESSIBILITY_PATH
  }
}

function createMockH() {
  return {
    redirect: vi.fn().mockImplementation(() => {
      return {
        code: vi.fn().mockImplementation(() => {
          return 'redirected'
        })
      }
    }),
    view: vi.fn().mockReturnValue(VIEW_RENDERED)
  }
}

describe('Accessibility Handler - Welsh Redirects', () => {
  let mockRequest
  let mockH

  vi.mock('../../common/helpers/get-site-url.js', () => ({
    getAirQualitySiteUrl: vi.fn((request) => {
      return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
    })
  }))

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
  })

  it('should redirect to the Welsh version if the language is "cy"', () => {
    mockRequest.query.lang = LANG_CY
    mockRequest.path = '/hygyrchedd/cy'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/hygyrchedd/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = accessibilityController.handler(
      mockRequest,
      mockH,
      MOCK_ENGLISH_CONTENT
    )
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/hygyrchedd/cy?lang=cy')
  })
})

describe('Accessibility Handler - English Content', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
  })

  it('should render the accessibility page with the necessary data', () => {
    mockRequest = {
      query: {
        lang: LANG_EN
      },
      path: ACCESSIBILITY_PATH
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/accessibility?lang=en'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)

    const result = accessibilityController.handler(
      mockRequest,
      mockH,
      MOCK_ENGLISH_CONTENT
    )
    expect(result).toBe(VIEW_RENDERED)
    const expectedData = createExpectedViewData(
      MOCK_ENGLISH_CONTENT,
      actualUrl,
      mockRequest.query.lang,
      ACCESSIBILITY_PATH
    )
    expect(mockH.view).toHaveBeenCalledWith(
      ACCESSIBILITY_INDEX_VIEW,
      expectedData
    )
  })

  it('should render the accessibility page when the lang is not en nor cy and path is /accessibility', () => {
    mockRequest = {
      query: {
        lang: 'fr'
      },
      path: ACCESSIBILITY_PATH
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/accessibility?lang=fr'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)

    const result = accessibilityController.handler(
      mockRequest,
      mockH,
      MOCK_ENGLISH_CONTENT
    )
    expect(result).toBe(VIEW_RENDERED)
    const expectedData = createExpectedViewData(
      MOCK_ENGLISH_CONTENT,
      actualUrl,
      LANG_EN,
      ACCESSIBILITY_PATH
    )
    expect(mockH.view).toHaveBeenCalledWith(
      ACCESSIBILITY_INDEX_VIEW,
      expectedData
    )
  })
})

describe('Accessibility Handler - Welsh Content', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
  })

  it('should use Welsh content when lang is neither en nor cy', () => {
    mockRequest = {
      query: {
        lang: 'fr' // This will be 'fr' after slice, not 'en' or 'cy'
      },
      path: '/some-other-path' // Not '/accessibility'
    }
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/some-other-path?lang=fr'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)

    const result = accessibilityController.handler(
      mockRequest,
      mockH,
      MOCK_ENGLISH_CONTENT
    )
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(ACCESSIBILITY_INDEX_VIEW, {
      pageTitle: MOCK_WELSH_CONTENT.footer.accessibility.pageTitle,
      title: MOCK_WELSH_CONTENT.footer.accessibility.title,
      description: MOCK_WELSH_CONTENT.footer.accessibility.description,
      metaSiteUrl: actualUrl,
      heading: MOCK_WELSH_CONTENT.footer.accessibility.heading,
      headings: MOCK_WELSH_CONTENT.footer.accessibility.headings,
      paragraphs: MOCK_WELSH_CONTENT.footer.accessibility.paragraphs,
      displayBacklink: false,
      phaseBanner: MOCK_WELSH_CONTENT.phaseBanner,
      footerTxt: MOCK_WELSH_CONTENT.footerTxt,
      serviceName: MOCK_WELSH_CONTENT.multipleLocations.serviceName,
      cookieBanner: MOCK_WELSH_CONTENT.cookieBanner,
      lang: 'fr',
      currentPath: '/hygyrchedd/cy'
    })
  })
})
describe('Accessibility Handler - Direct Handler Function', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = createMockRequest()
    mockH = createMockH()
  })

  it('should test accessibilityHandler function directly', () => {
    // ''
    const result = accessibilityHandler(
      mockRequest,
      mockH,
      MOCK_ENGLISH_CONTENT
    )
    expect(result).toBe(VIEW_RENDERED)
  })
})
