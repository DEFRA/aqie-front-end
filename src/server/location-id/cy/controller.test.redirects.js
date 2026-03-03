// Import test setup and mocks first
import './test-setup.js'
import {
  createMockRequest,
  createMockH,
  createMockLocationData,
  REDIRECT_URL_CARDIFF
} from './test-helpers/mocks.js'

/* global vi, describe, it, expect, beforeEach */

import { getLocationDetailsController } from './controller.js'

describe('Welsh Location ID Controller - Redirects', () => {
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

  it('should redirect to English when lang=en query parameter is provided', async () => {
    mockRequest.query = { lang: 'en' }

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith('/location/CARD3/?lang=en')
  })

  it('should redirect to Welsh location search when no previous URL and no saved search terms', async () => {
    mockRequest.headers.referer = null
    mockRequest.yar.get.mockReturnValue(null)

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(REDIRECT_URL_CARDIFF)
    expect(mockRequest.yar.clear).toHaveBeenCalledWith('locationData')
  })

  it('should redirect to search when session data is invalid', async () => {
    const mockLocationDataInvalid = {
      locationType: 'UK',
      results: null,
      getForecasts: [{ id: 1, data: 'forecast' }]
    }

    mockRequest.yar.get.mockReturnValue(mockLocationDataInvalid)
    mockRequest.url.href = 'http://localhost:3000/lleoliad/CARD3?lang=cy'

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(REDIRECT_URL_CARDIFF)
    expect(mockRequest.yar.clear).toHaveBeenCalledWith('locationData')
  })

  it('should redirect to search when getForecasts is missing', async () => {
    const mockLocationDataInvalid = {
      locationType: 'UK',
      results: [{ id: 'CARD3', name: 'Cardiff' }],
      getForecasts: null
    }

    mockRequest.yar.get.mockReturnValue(mockLocationDataInvalid)
    mockRequest.url.href = 'http://localhost:3000/lleoliad/CARD3?lang=cy'

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(
      '/lleoliad?lang=cy&searchTerms=Cardiff&secondSearchTerm=&searchTermsLocationType=city'
    )
    expect(mockRequest.yar.clear).toHaveBeenCalledWith('locationData')
  })

  it('should not redirect when searchTermsSaved is true', async () => {
    const mockLocationData = createMockLocationData()

    mockRequest.headers.referer = null
    mockRequest.yar.get.mockImplementation((key) => {
      // '' - Return consistent types to satisfy SonarQube
      if (key === 'searchTermsSaved') {
        return { saved: true }
      }
      if (key === 'locationData') {
        return mockLocationData
      }
      return null
    })

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.redirect).not.toHaveBeenCalled()
    expect(mockH.view).toHaveBeenCalled()
  })
})
