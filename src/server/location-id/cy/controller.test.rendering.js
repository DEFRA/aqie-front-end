// Import test setup and mocks first
import './test-setup.js'
import {
  createMockRequest,
  createMockH,
  createMockLocationData,
  MOCK_COOKIE_MESSAGE,
  MOCK_SUMMARY_DATE,
  MOCK_WELSH_SERVICE,
  LOCATION_NOT_FOUND_VIEW,
  LOCATIONS_VIEW
} from './test-helpers/mocks.js'

/* global vi, describe, it, expect, beforeEach */

import { getLocationDetailsController } from './controller.js'

// '' - Helper to setup common test data
const setupMockProcessLocationData = async () => {
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
}

// '' - Helper to setup null location data for not found tests
const setupNullLocationData = async () => {
  const { setMockProcessLocationDataResult } = await import(
    '../../common/helpers/location-controller-helper.js'
  )
  setMockProcessLocationDataResult({
    locationDetails: null,
    forecastData: null,
    measurementData: null
  })
}

describe('Welsh Location ID Controller - View Rendering - Successful rendering', () => {
  let mockRequest
  let mockH

  beforeEach(async () => {
    mockRequest = createMockRequest()
    mockH = createMockH()
    vi.clearAllMocks()

    await setupMockProcessLocationData()
  })

  it('should successfully render Welsh location view with all required data', async () => {
    const mockLocationData = createMockLocationData({
      getForecasts: [{ id: 1, data: 'forecast' }],
      dailySummary: { today: 'Mock summary' },
      summaryDate: '2023-10-15',
      welshDate: MOCK_SUMMARY_DATE
    })

    mockRequest.yar.get.mockImplementation((key) => {
      if (key === 'locationData') {
        return mockLocationData
      }
      return null
    })

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATIONS_VIEW,
      expect.objectContaining({
        result: expect.any(Object),
        airQuality: expect.any(Object),
        pageTitle: expect.stringContaining('Ansawdd aer yn'),
        lang: 'cy',
        welshMonth: expect.any(String),
        summaryDate: MOCK_SUMMARY_DATE,
        displayBacklink: true,
        serviceName: MOCK_WELSH_SERVICE
      })
    )
  })

  it('should handle Northern Ireland location type correctly', async () => {
    const mockLocationData = createMockLocationData({
      locationType: 'NI',
      results: [{ id: 'BELF1', name: 'Belfast' }],
      getForecasts: [{ id: 1, data: 'forecast' }],
      dailySummary: { today: 'Mock summary' },
      summaryDate: '2023-10-15'
    })

    mockRequest.params.id = 'BELF1'
    mockRequest.yar.get.mockImplementation((key) => {
      if (key === 'locationData') {
        return mockLocationData
      }
      return null
    })

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATIONS_VIEW,
      expect.objectContaining({
        lang: 'cy'
      })
    )
  })
})

describe('Welsh Location ID Controller - View Rendering - Error handling', () => {
  let mockRequest
  let mockH

  beforeEach(async () => {
    mockRequest = createMockRequest()
    mockH = createMockH()
    vi.clearAllMocks()

    await setupMockProcessLocationData()
  })

  it('should render location not found view when processLocationData returns null', async () => {
    const mockLocationData = createMockLocationData({
      getForecasts: [{ id: 1, data: 'mock' }]
    })

    mockRequest.yar.get.mockImplementation((key) =>
      key === 'locationData' ? mockLocationData : null
    )

    await setupNullLocationData()

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND_VIEW,
      expect.objectContaining({
        paragraph: { a: 'Mock Welsh not found message' },
        serviceName: 'Mock Welsh heading',
        lang: 'cy'
      })
    )
  })

  it('should handle empty location data gracefully', async () => {
    const mockLocationData = createMockLocationData({
      getForecasts: [{ id: 1, data: 'mock' }]
    })

    mockRequest.yar.get.mockImplementation((key) =>
      key === 'locationData' ? mockLocationData : null
    )

    await setupNullLocationData()

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND_VIEW,
      expect.any(Object)
    )
  })
})

describe('Welsh Location ID Controller - View Rendering - Welsh localization', () => {
  let mockRequest
  let mockH

  beforeEach(async () => {
    mockRequest = createMockRequest()
    mockH = createMockH()
    vi.clearAllMocks()

    await setupMockProcessLocationData()
  })

  it('should use Welsh calendar month correctly', async () => {
    const mockLocationData = createMockLocationData()

    mockRequest.yar.get.mockImplementation((key) =>
      key === 'locationData' ? mockLocationData : null
    )

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATIONS_VIEW,
      expect.objectContaining({
        welshMonth: expect.any(String)
      })
    )
  })

  it('should use correct language constant for Welsh', async () => {
    const mockLocationData = createMockLocationData({
      englishDate: '15 October 2023'
    })

    mockRequest.yar.get.mockImplementation((key) =>
      key === 'locationData' ? mockLocationData : null
    )

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATIONS_VIEW,
      expect.objectContaining({
        lang: 'cy'
      })
    )
  })

  it('should prioritize Welsh date over English date when available', async () => {
    const mockLocationData = createMockLocationData({
      welshDate: MOCK_SUMMARY_DATE,
      englishDate: '15 October 2023'
    })

    mockRequest.yar.get.mockImplementation((key) =>
      key === 'locationData' ? mockLocationData : null
    )

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATIONS_VIEW,
      expect.objectContaining({
        summaryDate: MOCK_SUMMARY_DATE
      })
    )
  })

  it('should include all required Welsh translations in view data', async () => {
    const mockLocationData = createMockLocationData()

    mockRequest.yar.get.mockImplementation((key) =>
      key === 'locationData' ? mockLocationData : null
    )

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATIONS_VIEW,
      expect.objectContaining({
        footerTxt: { cookies: 'Cwcis' },
        phaseBanner: { tag: 'Beta' },
        backlink: { text: 'Yn ôl' },
        cookieBanner: { message: MOCK_COOKIE_MESSAGE },
        dailySummaryTexts: { today: 'Heddiw' }
      })
    )
  })
})
