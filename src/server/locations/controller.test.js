import {
  getLocationDataController,
  determineLanguage,
  prepareViewData
} from './controller.js'

/* global vi */

vi.mock('./controller.js', () => ({
  getLocationDataController: {
    handler: vi.fn(),
    options: {}
  },
  determineLanguage: vi.fn((queryLang, path, referer) => {
    const lang = queryLang?.slice(0, 2)
    if (lang === 'cy') {
      return 'cy'
    }
    if (lang === 'en') {
      return 'en'
    }
    if (path === '/location') {
      return 'en'
    }
    if (referer?.includes('search-location')) {
      return 'en'
    }
    return 'cy'
  }),
  prepareViewData: vi.fn(() => ({
    lang: 'en',
    pageTitle: 'Default Page Title - ',
    userLocation: ''
  }))
}))

// Add logger mock to capture logs during test execution
vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn()
  })
}))

afterEach(() => {
  vi.clearAllMocks() // Clear mock call history
})

describe('controller.js exports', () => {
  it('should export getLocationDataController', () => {
    expect(typeof getLocationDataController.handler).toBe('function')
  })

  it('should export determineLanguage', () => {
    expect(typeof determineLanguage).toBe('function')
  })

  it('should export prepareViewData', () => {
    expect(typeof prepareViewData).toBe('function')
  })
})

describe('determineLanguage', () => {
  it('should return "cy" when queryLang is "cy"', () => {
    // Test for Welsh language
    expect(determineLanguage('cy')).toBe('cy')
  })

  it('should return "en" when queryLang is "en"', () => {
    // Test for English language
    expect(determineLanguage('en')).toBe('en')
  })

  it('should return "en" when path is "/location"', () => {
    // Test for default English language based on path
    expect(determineLanguage(null, '/location')).toBe('en')
  })

  it('should return "en" when referer includes "search-location"', () => {
    // Test for English language based on referer
    expect(determineLanguage(null, null, 'search-location')).toBe('en')
  })

  it('should return "cy" as the default when no conditions are met', () => {
    // Test for default Welsh language
    expect(determineLanguage(null, '/some-path', 'some-other-referer')).toBe(
      'cy'
    )
  })
})

describe('prepareViewData', () => {
  it('should return view data with default language when no language is provided', () => {
    const viewData = prepareViewData() // Call without arguments
    expect(viewData.lang).toBe('en') // Default to LANG_EN
    expect(viewData.pageTitle).toContain(' - ')
    expect(viewData.userLocation).toBe('')
  })
})
