/* global vi */

/**
 * Shared test constants and helper functions for Welsh location controller tests
 *
 * Note: vi.mock() calls must be defined in each test file at the top level,
 * not imported from here, due to Vitest's hoisting behavior.
 */

// Test constants
export const MOCK_COOKIE_MESSAGE = 'Mock cookie message'
export const MOCK_WELSH_NOT_FOUND_MESSAGE = 'Mock Welsh not found message'
export const MOCK_WELSH_HEADING = 'Mock Welsh heading'
export const MOCK_WELSH_TITLE_PREFIX = 'Ansawdd aer yn'
export const MOCK_WELSH_SERVICE = 'Mock Welsh service'
export const MOCK_SUMMARY_DATE = '15 Hydref 2023'
export const LOCATION_NOT_FOUND_VIEW = 'location-not-found/index'
export const LOCATIONS_VIEW = 'locations/location'
export const REDIRECT_URL_CARDIFF =
  '/lleoliad?lang=cy&searchTerms=Cardiff&secondSearchTerm=&searchTermsLocationType=city'
export const HTTP_STATUS_SERVER_ERROR = 500

/**
 * Creates a mock request object for testing
 */
export function createMockRequest() {
  return {
    params: { id: 'CARD3' },
    query: { lang: 'cy' },
    url: { href: '/lleoliad/CARD3?lang=cy' },
    headers: { referer: '/search' },
    yar: {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
      _store: {}
    }
  }
}

/**
 * Creates a mock Hapi response toolkit
 */
export function createMockH() {
  return {
    view: vi.fn().mockReturnValue('mock view response'),
    redirect: vi.fn().mockReturnValue({
      code: vi.fn().mockReturnValue({
        takeover: vi.fn()
      })
    }),
    response: vi.fn().mockReturnValue({
      code: vi.fn()
    })
  }
}

/**
 * Creates mock location data for testing
 */
export function createMockLocationData(overrides = {}) {
  return {
    locationType: 'UK',
    results: [{ id: 'CARD3', name: 'Cardiff' }],
    getForecasts: [],
    dailySummary: {},
    ...overrides
  }
}
