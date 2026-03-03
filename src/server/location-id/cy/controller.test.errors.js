// Import test setup and mocks first
import './test-setup.js'
import {
  createMockRequest,
  createMockH,
  HTTP_STATUS_SERVER_ERROR
} from './test-helpers/mocks.js'

/* global vi, describe, it, expect, beforeEach */

import { getLocationDetailsController } from './controller.js'

describe('Welsh Location ID Controller - Error Handling', () => {
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

  it('should handle errors gracefully and return 500 response', async () => {
    mockRequest.yar.get.mockImplementation(() => {
      throw new Error('Mock error')
    })

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith('Internal Server Error')
    expect(mockH.response().code).toHaveBeenCalledWith(HTTP_STATUS_SERVER_ERROR)
  })
})
