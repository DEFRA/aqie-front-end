// Import test setup and mocks first
import './test-setup.js'
import {
  createMockRequest,
  createMockH,
  createMockLocationData
} from './test-helpers/mocks.js'

/* global vi, describe, it, expect, beforeEach */

import { getLocationDetailsController } from './controller.js'

describe('Welsh Location ID Controller - Core Functionality', () => {
  let mockRequest
  let mockH

  beforeEach(async () => {
    mockRequest = createMockRequest()
    mockH = createMockH()
    vi.clearAllMocks()

    const { setMockProcessLocationDataResult } = await import(
      '../../common/helpers/location-controller-helper.js'
    )
    setMockProcessLocationDataResult({
      locationDetails: {
        id: 'CARD3',
        name: 'Cardiff',
        locationType: 'UK'
      },
      forecastData: { mockForecast: 'data' },
      measurementData: { mockMeasurement: 'data' }
    })
  })

  it('should export getLocationDetailsController', () => {
    expect(getLocationDetailsController).toBeDefined()
    expect(typeof getLocationDetailsController.handler).toBe('function')
  })

  it('should clear searchTermsSaved from session', async () => {
    const mockLocationData = createMockLocationData()

    mockRequest.yar.get.mockImplementation((key) =>
      key === 'locationData' ? mockLocationData : null
    )

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
  })

  it('should update locationData with optimized forecasts and measurements', async () => {
    const mockLocationData = createMockLocationData({
      getForecasts: [{ id: 1, largeData: 'original' }],
      getMeasurements: [{ id: 1, largeData: 'original' }]
    })

    mockRequest.yar.get.mockImplementation((key) =>
      key === 'locationData' ? mockLocationData : null
    )

    const { setMockProcessLocationDataResult } = await import(
      '../../common/helpers/location-controller-helper.js'
    )
    setMockProcessLocationDataResult({
      locationDetails: {
        id: 'CARD3',
        name: 'Cardiff',
        locationType: 'UK'
      },
      forecastData: { mockForecast: 'data' },
      measurementData: { mockMeasurement: 'data' },
      nearestLocation: { id: 1, data: 'mock' },
      nearestLocationsRange: [{ id: 1, name: 'Mock Site' }]
    })

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'locationData',
      expect.objectContaining({
        getForecasts: { id: 1, data: 'mock' },
        getMeasurements: [{ id: 1, name: 'Mock Site' }]
      })
    )
  })
})
