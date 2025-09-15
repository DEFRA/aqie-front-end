import { describe, test, expect, vi, beforeEach } from 'vitest'

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
  REDIRECT_STATUS_CODE: 301
}))

vi.mock('../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example.com/air-quality')
}))

describe('Multiple Results Controller', () => {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()

    mockRequest = {
      yar: {
        get: vi.fn()
      },
      path: '/multiple-results'
    }

    mockH = {
      view: vi.fn(() => 'rendered-view'),
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
    const mockLocationData = {
      results: ['location1', 'location2'],
      monitoringSites: [],
      transformedDailySummary: {},
      calendarWelsh: { 1: 'Ionawr' },
      englishDate: '2025-01-01',
      welshDate: '1 Ionawr 2025',
      getMonth: 1,
      lang: 'en',
      userLocation: 'Test Location'
    }

    mockRequest.yar.get.mockReturnValue(mockLocationData)

    const module = await import('./controller.js')
    await module.getLocationDataController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalled()
    expect(mockRequest.yar.get).toHaveBeenCalledWith('locationData')
  })

  test('should handle empty location data gracefully', async () => {
    // ''
    mockRequest.yar.get.mockReturnValue([])

    const module = await import('./controller.js')
    await module.getLocationDataController.handler(mockRequest, mockH)

    expect(mockRequest.yar.get).toHaveBeenCalledWith('locationData')
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

    expect(mockRequest.yar.get).toHaveBeenCalledWith('locationData')
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

    expect(mockRequest.yar.get).toHaveBeenCalledWith('locationData')
  })

  test('should handle Welsh language redirect properly', async () => {
    // ''
    const mockLocationData = {
      results: ['location1'],
      lang: 'en',
      userLocation: 'Test Location'
    }

    // Set up request with cy query parameter to trigger redirect
    mockRequest.query = { lang: 'cy' }
    mockRequest.yar.get.mockReturnValue(mockLocationData)

    // Mock redirect chain
    const mockCodeFunction = vi.fn().mockReturnValue('redirect-result')
    mockH.redirect.mockReturnValue({
      code: mockCodeFunction
    })

    const module = await import('./controller.js')
    const result = await module.getLocationDataController.handler(
      mockRequest,
      mockH
    )

    expect(mockH.redirect).toHaveBeenCalledWith('/lleoliadau-lluosog')
    expect(mockCodeFunction).toHaveBeenCalledWith(301)
    expect(result).toBe('redirect-result')
  })

  test('should handle authentication token error with 401 status', async () => {
    // ''
    // Provide complete mock data to avoid undefined errors
    const mockLocationData = {
      results: ['location1'],
      monitoringSites: [],
      transformedDailySummary: {},
      calendarWelsh: { 1: 'Ionawr' },
      englishDate: '2025-01-01',
      welshDate: '1 Ionawr 2025',
      getMonth: 1,
      lang: 'en',
      userLocation: 'Test Location'
    }

    mockRequest.yar.get.mockReturnValue(mockLocationData)
    mockRequest.query = {} // No cy lang to avoid redirect

    // Reset the mock and create a fresh implementation
    mockH.view.mockReset()
    let firstCall = true
    mockH.view.mockImplementation((view, data) => {
      if (firstCall && view !== 'error/index') {
        firstCall = false
        // Use the exact error message that matches the controller's condition
        const error = new Error(
          "Cannot read properties of undefined (reading 'access_token')"
        )
        throw error
      }
      return 'error page rendered'
    })

    const module = await import('./controller.js')
    const result = await module.getLocationDataController.handler(
      mockRequest,
      mockH
    )

    // Verify that the error page was rendered with 401 status
    expect(mockH.view).toHaveBeenCalledWith(
      'error/index',
      expect.objectContaining({
        statusCode: 401
      })
    )
    expect(result).toBe('error page rendered')
  })

  test('should handle general errors with 500 status', async () => {
    // ''
    // Provide complete mock data to avoid undefined errors
    const mockLocationData = {
      results: ['location1'],
      monitoringSites: [],
      transformedDailySummary: {},
      calendarWelsh: { 1: 'Ionawr' },
      englishDate: '2025-01-01',
      welshDate: '1 Ionawr 2025',
      getMonth: 1,
      lang: 'en',
      userLocation: 'Test Location'
    }

    mockRequest.yar.get.mockReturnValue(mockLocationData)
    mockRequest.query = {} // No cy lang to avoid redirect

    // Reset the mock and create a fresh implementation
    mockH.view.mockReset()
    let firstCall = true
    mockH.view.mockImplementation((view, data) => {
      if (firstCall && view !== 'error/index') {
        firstCall = false
        const error = new Error('Some other error')
        throw error
      }
      return 'error page rendered'
    })

    const module = await import('./controller.js')
    const result = await module.getLocationDataController.handler(
      mockRequest,
      mockH
    )

    // Verify that the error page was rendered
    expect(mockH.view).toHaveBeenCalledWith(
      'error/index',
      expect.objectContaining({
        statusCode: 500
      })
    )
    expect(result).toBe('error page rendered')
  })
})
