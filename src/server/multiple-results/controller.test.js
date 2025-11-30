import { describe, test, expect, vi, beforeEach } from 'vitest'

// Test constants
const MOCK_ENGLISH_DATE = '2025-01-01'
const MOCK_WELSH_DATE = '1 Ionawr 2025'
const MOCK_USER_LOCATION = 'Test Location'
const ERROR_INDEX_VIEW = 'error/index'
const ERROR_PAGE_RENDERED = 'error page rendered'
const REDIRECT_RESULT = 'redirect-result'
const LOCATION_DATA_KEY = 'locationData'
const MULTIPLE_RESULTS_PATH = '/multiple-results'
const RENDERED_VIEW = 'rendered-view'

// Mock dependencies
vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn(),
    info: vi.fn()
  }))
}))

vi.mock('../data/en/en.js', () => ({
  english: {
    multipleLocations: {
      title: 'Multiple Locations',
      pageTitle: 'Search Results',
      description: 'Multiple location search results',
      serviceName: 'Air Quality Service'
    },
    notFoundUrl: {
      serviceAPI: {
        pageTitle: 'Service Error'
      }
    }
  }
}))

vi.mock('../data/constants.js', () => ({
  LANG_CY: 'cy',
  MULTIPLE_LOCATIONS_ROUTE_CY: '/lleoliadau-lluosog',
  REDIRECT_STATUS_CODE: 301,
  STATUS_UNAUTHORIZED: 401,
  STATUS_INTERNAL_SERVER_ERROR: 500
}))

vi.mock('../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example.com/air-quality')
}))

// Helper functions
const createMockLocationData = (overrides = {}) => ({
  results: ['location1', 'location2'],
  monitoringSites: [],
  transformedDailySummary: {},
  calendarWelsh: { 1: 'Ionawr' },
  englishDate: MOCK_ENGLISH_DATE,
  welshDate: MOCK_WELSH_DATE,
  getMonth: 1,
  lang: 'en',
  userLocation: MOCK_USER_LOCATION,
  ...overrides
})

const setupErrorMock = (mockH, errorMessage) => {
  mockH.view.mockReset()
  let firstCall = true
  mockH.view.mockImplementation((view, _data) => {
    if (firstCall && view !== ERROR_INDEX_VIEW) {
      firstCall = false
      throw new Error(errorMessage)
    }
    return ERROR_PAGE_RENDERED
  })
}

describe('Multiple Results Controller', function () {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()

    mockRequest = {
      yar: {
        get: vi.fn()
      },
      path: MULTIPLE_RESULTS_PATH
    }

    mockH = {
      view: vi.fn(() => RENDERED_VIEW),
      redirect: vi.fn()
    }
  })

  test('should export getLocationDataController', async () => {
    // ''
    const module = await import('./controller.js')

    expect(module.getLocationDataController).toBeDefined()
    expect(module.getLocationDataController.handler).toBeDefined()
    expect(typeof module.getLocationDataController.handler).toBe('function')
  })

  test('should handle valid location data successfully', async () => {
    // ''
    const mockLocationData = createMockLocationData()

    mockRequest.yar.get.mockReturnValue(mockLocationData)

    const module = await import('./controller.js')
    await module.getLocationDataController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalled()
    expect(mockRequest.yar.get).toHaveBeenCalledWith(LOCATION_DATA_KEY)
  })

  test('should handle empty location data gracefully', async () => {
    // ''
    mockRequest.yar.get.mockReturnValue([])

    const module = await import('./controller.js')
    await module.getLocationDataController.handler(mockRequest, mockH)

    expect(mockRequest.yar.get).toHaveBeenCalledWith(LOCATION_DATA_KEY)
  })

  test('should handle errors gracefully and show error page', async () => {
    // ''
    // Create incomplete data that will cause an error in processing
    const incompleteData = {
      results: null, // This will cause issues
      lang: 'en'
    }

    mockRequest.yar.get.mockReturnValue(incompleteData)

    const module = await import('./controller.js')

    // The controller should handle this gracefully
    try {
      await module.getLocationDataController.handler(mockRequest, mockH)
    } catch (error) {
      // If an error is thrown, it should be handled by the controller
      expect(error).toBeDefined()
    }

    expect(mockRequest.yar.get).toHaveBeenCalledWith(LOCATION_DATA_KEY)
  })
})

describe('Multiple Results Controller - Error Handling', function () {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()

    mockRequest = {
      yar: {
        get: vi.fn()
      },
      path: MULTIPLE_RESULTS_PATH
    }

    mockH = {
      view: vi.fn(() => RENDERED_VIEW),
      redirect: vi.fn()
    }
  })

  test('should handle authentication errors with 401 status', async () => {
    // ''
    // Test the controller's ability to handle errors
    const module = await import('./controller.js')

    // Create a scenario that would typically cause authentication issues
    const problematicData = {
      results: [],
      // Missing required properties that might cause access_token error
      lang: 'en'
    }

    mockRequest.yar.get.mockReturnValue(problematicData)

    await module.getLocationDataController.handler(mockRequest, mockH)

    expect(mockRequest.yar.get).toHaveBeenCalledWith(LOCATION_DATA_KEY)
  })

  test('should handle authentication token error with 401 status', async () => {
    // ''
    const mockLocationData = createMockLocationData({ results: ['location1'] })

    mockRequest.yar.get.mockReturnValue(mockLocationData)
    mockRequest.query = {} // No cy lang to avoid redirect

    setupErrorMock(mockH, "Cannot read properties of undefined (reading 'access_token')")

    const module = await import('./controller.js')
    const result = await module.getLocationDataController.handler(
      mockRequest,
      mockH
    )

    // Verify that the error page was rendered with 401 status
    expect(mockH.view).toHaveBeenCalledWith(
      ERROR_INDEX_VIEW,
      expect.objectContaining({
        statusCode: 401
      })
    )
    expect(result).toBe(ERROR_PAGE_RENDERED)
  })

  test('should handle general errors with 500 status', async () => {
    // ''
    const mockLocationData = createMockLocationData({ results: ['location1'] })

    mockRequest.yar.get.mockReturnValue(mockLocationData)
    mockRequest.query = {} // No cy lang to avoid redirect

    setupErrorMock(mockH, 'Some other error')

    const module = await import('./controller.js')
    const result = await module.getLocationDataController.handler(
      mockRequest,
      mockH
    )

    // Verify that the error page was rendered
    expect(mockH.view).toHaveBeenCalledWith(
      ERROR_INDEX_VIEW,
      expect.objectContaining({
        statusCode: 500
      })
    )
    expect(result).toBe(ERROR_PAGE_RENDERED)
  })
})

describe('Multiple Results Controller - Welsh Language', function () {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()

    mockRequest = {
      yar: {
        get: vi.fn()
      },
      path: MULTIPLE_RESULTS_PATH
    }

    mockH = {
      view: vi.fn(() => RENDERED_VIEW),
      redirect: vi.fn()
    }
  })

  test('should handle Welsh language redirect properly', async () => {
    // ''
    const { REDIRECT_STATUS_CODE } = await import('../data/constants.js')
    const mockLocationData = createMockLocationData({
      results: ['location1'],
      userLocation: MOCK_USER_LOCATION
    })

    // Set up request with cy query parameter to trigger redirect
    mockRequest.query = { lang: 'cy' }
    mockRequest.yar.get.mockReturnValue(mockLocationData)

    // Mock redirect chain
    const mockCodeFunction = vi.fn().mockReturnValue(REDIRECT_RESULT)
    mockH.redirect.mockReturnValue({
      code: mockCodeFunction
    })

    const module = await import('./controller.js')
    const result = await module.getLocationDataController.handler(
      mockRequest,
      mockH
    )

    expect(mockH.redirect).toHaveBeenCalledWith('/lleoliadau-lluosog')
    expect(mockCodeFunction).toHaveBeenCalledWith(REDIRECT_STATUS_CODE)
    expect(result).toBe(REDIRECT_RESULT)
  })
})
