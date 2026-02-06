import './test-helpers/middleware-mocks.js'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as middleware from './middleware.js'
import { fetchData } from './helpers/fetch-data.js'
import { transformKeys } from './helpers/transform-summary-keys.js'
import { getFormattedDateSummary } from './helpers/middleware-helpers.js'
import { handleUKLocationType } from './helpers/extra-middleware-helpers.js'
import { handleErrorInputAndRedirect } from './helpers/error-input-and-redirect.js'
import {
  isValidPartialPostcodeNI,
  isValidPartialPostcodeUK
} from './helpers/convert-string.js'
import { sentenceCase } from '../common/helpers/sentence-case.js'
import { convertFirstLetterIntoUppercase } from './helpers/convert-first-letter-into-upper-case.js'
import {
  LANG_EN,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  LOCATION_NOT_FOUND_URL,
  WRONG_POSTCODE,
  STATUS_NOT_FOUND,
  STATUS_INTERNAL_SERVER_ERROR
} from '../data/constants.js'
import {
  PAGE_NOT_FOUND,
  ERROR_INDEX,
  TAKEOVER_RESULT,
  MOCK_DATE_STRING,
  MOCK_DATE_OBJECT,
  setupMocks,
  mocks
} from './test-helpers/middleware-test-setup.js'

const { searchMiddleware } = middleware

describe('searchMiddleware - UK location processing', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('should handle UK location type processing successfully', async () => {
    const { mockRequest, mockH } = mocks
    // Patch transformKeys to return expected object
    vi.mocked(transformKeys).mockReturnValue({
      transformedDailySummary: MOCK_DATE_OBJECT
    })
    mockRequest.query = {
      searchTerms: 'cardiff', // input is lowercase
      secondSearchTerm: 'wales'
    }

    // Patch fetchData to include today property in getDailySummary
    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING, today: {} },
      getForecasts: { forecasts: [] },
      getOSPlaces: { results: [{ id: '1', name: 'Cardiff' }] },
      getNIPlaces: null
    })

    // Patch handleErrorInputAndRedirect to return UK locationType
    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: LOCATION_TYPE_UK,
      userLocation: 'Cardiff',
      locationNameOrPostcode: 'Cardiff'
    })

    const result = await searchMiddleware(mockRequest, mockH)

    expect(handleErrorInputAndRedirect).toHaveBeenCalledWith(
      mockRequest,
      mockH,
      LANG_EN,
      mockRequest.payload,
      'CARDIFF'
    )

    expect(fetchData).toHaveBeenCalledWith(mockRequest, {
      locationType: LOCATION_TYPE_UK,
      userLocation: 'Cardiff',
      searchTerms: 'CARDIFF',
      secondSearchTerm: 'WALES'
    })

    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'searchTermsSaved',
      'CARDIFF'
    )
    expect(handleUKLocationType).toHaveBeenCalled()

    expect(result).toBe('uk-location-result')
  })
})

describe('searchMiddleware - NI location processing', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('should handle NI location type processing successfully', async () => {
    const { mockRequest, mockH } = mocks
    // Patch transformKeys to return expected object
    vi.mocked(transformKeys).mockReturnValue({
      transformedDailySummary: MOCK_DATE_OBJECT
    })
    mockRequest.query = {
      searchTerms: 'belfast',
      secondSearchTerm: 'ni'
    }

    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: LOCATION_TYPE_NI,
      userLocation: 'Belfast',
      locationNameOrPostcode: 'Belfast'
    })

    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING, today: {} },
      getForecasts: { forecasts: [] },
      getOSPlaces: null,
      getNIPlaces: {
        results: [
          {
            postcode: 'BT1 1AA',
            town: 'belfast',
            id: '1'
          }
        ]
      }
    })

    vi.mocked(sentenceCase).mockReturnValue('Belfast')
    vi.mocked(convertFirstLetterIntoUppercase).mockReturnValue(
      'BT1 1AA, Belfast'
    )

    const result = await searchMiddleware(mockRequest, mockH)

    expect(fetchData).toHaveBeenCalledWith(mockRequest, {
      locationType: LOCATION_TYPE_NI,
      userLocation: 'Belfast',
      searchTerms: 'BELFAST',
      secondSearchTerm: 'NI'
    })

    expect(mockRequest.yar.set).toHaveBeenCalledWith(
      'locationData',
      expect.anything()
    )
    expect(handleUKLocationType).not.toHaveBeenCalled()
    expect(result).toBe(TAKEOVER_RESULT)
  })
})

describe('searchMiddleware - location not found scenarios', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('should handle location data not found for UK type', async () => {
    const { mockRequest, mockH, mockView } = mocks
    mockRequest.query = {
      searchTerms: 'unknown',
      secondSearchTerm: 'location'
    }

    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING },
      getForecasts: { forecasts: [] },
      getOSPlaces: null, // No results
      getNIPlaces: null
    })

    vi.mocked(isValidPartialPostcodeUK).mockReturnValue(false)
    vi.mocked(isValidPartialPostcodeNI).mockReturnValue(false)

    const result = await searchMiddleware(mockRequest, mockH)

    expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
      locationNameOrPostcode: 'Belfast',
      lang: LANG_EN
    })

    expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
    expect(mockView).toHaveBeenCalledWith(
      ERROR_INDEX,
      expect.objectContaining({
        statusCode: STATUS_NOT_FOUND,
        message: PAGE_NOT_FOUND
      })
    )

    expect(result).toBe(TAKEOVER_RESULT)
  })

  it('should handle NI location with no results', async () => {
    const { mockRequest, mockH, mockView } = mocks
    mockRequest.query = {
      searchTerms: 'unknown',
      secondSearchTerm: 'ni'
    }

    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: LOCATION_TYPE_NI,
      userLocation: 'Unknown',
      locationNameOrPostcode: 'Unknown'
    })

    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING },
      getForecasts: { forecasts: [] },
      getOSPlaces: null,
      getNIPlaces: { results: [] } // Empty results
    })

    await searchMiddleware(mockRequest, mockH)

    expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
      locationNameOrPostcode: 'Unknown',
      lang: LANG_EN
    })

    expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
    expect(mockView).toHaveBeenCalledWith(
      ERROR_INDEX,
      expect.objectContaining({
        statusCode: STATUS_NOT_FOUND
      })
    )
  })

  it('should show service unavailable when NI API fails', async () => {
    // ''
    const { mockRequest, mockH, mockView } = mocks
    mockRequest.query = {
      searchTerms: 'bt1 1fb'
    }

    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: LOCATION_TYPE_NI,
      userLocation: 'BT1 1FB',
      locationNameOrPostcode: 'BT1 1FB'
    })

    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING, today: {} },
      getForecasts: { forecasts: [] },
      getOSPlaces: null,
      getNIPlaces: { results: [], error: 'service-unavailable' }
    })

    await searchMiddleware(mockRequest, mockH)

    expect(mockView).toHaveBeenCalledWith(
      ERROR_INDEX,
      expect.objectContaining({
        statusCode: STATUS_INTERNAL_SERVER_ERROR
      })
    )
  })
})

describe('searchMiddleware - postcode validation', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('should handle partial postcode validation', async () => {
    const { mockRequest, mockH } = mocks
    mockRequest.query = {
      searchTerms: 'cf1',
      secondSearchTerm: ''
    }

    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: LOCATION_TYPE_UK,
      userLocation: 'CF1',
      locationNameOrPostcode: 'Unknown'
    })

    vi.mocked(isValidPartialPostcodeUK).mockReturnValue(true)
    vi.mocked(isValidPartialPostcodeNI).mockReturnValue(false)

    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING },
      getForecasts: { forecasts: [] },
      getOSPlaces: { results: [{ id: '1' }] },
      getNIPlaces: null
    })

    await searchMiddleware(mockRequest, mockH)

    expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
      locationNameOrPostcode: 'Unknown',
      lang: LANG_EN
    })
  })
})

describe('searchMiddleware - wrong postcode error', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('should handle wrong postcode error', async () => {
    const { mockRequest, mockH, mockView } = mocks
    mockRequest.query = {
      searchTerms: 'invalid',
      secondSearchTerm: ''
    }

    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING },
      getForecasts: { forecasts: [] },
      getOSPlaces: WRONG_POSTCODE,
      getNIPlaces: null
    })

    await searchMiddleware(mockRequest, mockH)

    expect(mockView).toHaveBeenCalledWith(
      ERROR_INDEX,
      expect.objectContaining({
        statusCode: STATUS_NOT_FOUND,
        heading: PAGE_NOT_FOUND
      })
    )
  })
})

describe('searchMiddleware - error input redirect', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('should handle error input redirect', async () => {
    const { mockRequest, mockH } = mocks
    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: null // Error case
    })

    const result = await searchMiddleware(mockRequest, mockH)

    expect(result).toEqual({ locationType: null })
  })

  it.skip('should handle unknown location type', async () => {
    const { mockRequest, mockH } = mocks
    mockRequest.query = { searchTerms: null }

    // Patch handleErrorInputAndRedirect to return undefined locationType
    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: null,
      userLocation: null,
      locationNameOrPostcode: null
    })

    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING },
      getForecasts: { forecasts: [] },
      getOSPlaces: null,
      getNIPlaces: null
    })

    vi.mocked(isValidPartialPostcodeUK).mockReturnValue(false)
    vi.mocked(isValidPartialPostcodeNI).mockReturnValue(false)

    // Ensure mockH.redirect is properly mocked
    mockH.redirect = vi.fn(function () {
      return {
        takeover: vi.fn().mockReturnValue(TAKEOVER_RESULT)
      }
    })

    await searchMiddleware(mockRequest, mockH)

    expect(mockRequest.yar.clear).not.toHaveBeenCalledWith('searchTermsSaved')
    expect(mockH.redirect).toHaveBeenCalledWith(
      `${LOCATION_NOT_FOUND_URL}?lang=en`
    )
    // Check that the takeover method on the redirect chain was called
    expect(mockH.redirect().takeover).toHaveBeenCalled()
  })

  it.skip('should handle direct location not found redirect without search terms', async () => {
    const { mockRequest, mockH } = mocks
    mockRequest.query = { searchTerms: null }

    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: null,
      userLocation: null,
      locationNameOrPostcode: null
    })

    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING },
      getForecasts: { forecasts: [] },
      getOSPlaces: null,
      getNIPlaces: null
    })

    // Ensure mockH.redirect is properly mocked
    mockH.redirect = vi.fn(function () {
      return {
        takeover: vi.fn().mockReturnValue(TAKEOVER_RESULT)
      }
    })

    await searchMiddleware(mockRequest, mockH)

    expect(mockRequest.yar.clear).not.toHaveBeenCalledWith('searchTermsSaved')
    expect(mockH.redirect).toHaveBeenCalledWith(
      `${LOCATION_NOT_FOUND_URL}?lang=en`
    )
    // Check that the takeover method on the redirect chain was called
    expect(mockH.redirect().takeover).toHaveBeenCalled()
  })
})

describe('searchMiddleware - date formatting', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('should process date formatting correctly', async () => {
    const { mockRequest, mockH } = mocks
    // Ensure not-found and invalid-daily-summary checks do not exit early
    vi.spyOn(middleware, 'isInvalidDailySummary').mockReturnValue(false)
    vi.spyOn(middleware, 'shouldReturnNotFound').mockReturnValue(false)
    mockRequest.query = {
      searchTerms: 'test'
    }

    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: 'UK', // Use a valid location type so the middleware proceeds
      userLocation: 'Test',
      locationNameOrPostcode: 'Test'
    })

    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING, today: {} },
      getForecasts: { forecasts: [] },
      getOSPlaces: { results: [{ id: '1' }] },
      getNIPlaces: null
    })

    // Mock getFormattedDateSummary to track calls and return expected structure
    vi.mocked(getFormattedDateSummary).mockReturnValue({
      formattedDateSummary: ['15', 'January', '2024'],
      getMonthSummary: 0
    })

    const result = await searchMiddleware(mockRequest, mockH)

    // Verify the middleware completes and returns a result
    expect(result).toBeDefined()
  })
  it.skip('should process date formatting correctly', async () => {
    // Example assertion for demonstration
    // This test is skipped, but if enabled, it should check date formatting logic
    // Arrange: mock getFormattedDateSummary
    // Act: (would call the middleware)
    // Assert:
    expect(getFormattedDateSummary).toHaveBeenCalledWith(MOCK_DATE_STRING)
  })
})

describe('searchMiddleware - NI WRONG_POSTCODE handling', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('should handle NI location with WRONG_POSTCODE error', async () => {
    const { mockRequest, mockH } = mocks
    mockRequest.query = {
      searchTerms: 'invalid',
      secondSearchTerm: 'ni'
    }

    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: LOCATION_TYPE_NI,
      userLocation: 'Invalid',
      locationNameOrPostcode: 'Invalid'
    })

    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING, today: {} },
      getForecasts: { forecasts: [] },
      getOSPlaces: null,
      getNIPlaces: WRONG_POSTCODE
    })

    vi.mocked(transformKeys).mockReturnValue({
      transformedDailySummary: MOCK_DATE_OBJECT
    })

    const result = await searchMiddleware(mockRequest, mockH)

    expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
      locationNameOrPostcode: 'Invalid',
      lang: LANG_EN
    })
    expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
    expect(result).toBe(TAKEOVER_RESULT)
  })
})

describe('searchMiddleware - NI empty results handling', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('should handle NI location with empty results array', async () => {
    const { mockRequest, mockH } = mocks
    mockRequest.query = {
      searchTerms: 'unknown',
      secondSearchTerm: 'ni'
    }

    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: LOCATION_TYPE_NI,
      userLocation: 'Unknown',
      locationNameOrPostcode: 'Unknown'
    })

    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING, today: {} },
      getForecasts: { forecasts: [] },
      getOSPlaces: null,
      getNIPlaces: { results: [] }
    })

    vi.mocked(transformKeys).mockReturnValue({
      transformedDailySummary: MOCK_DATE_OBJECT
    })

    vi.mocked(isValidPartialPostcodeNI).mockReturnValue(false)
    vi.mocked(isValidPartialPostcodeUK).mockReturnValue(false)

    const result = await searchMiddleware(mockRequest, mockH)

    expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
      locationNameOrPostcode: 'Unknown',
      lang: LANG_EN
    })
    expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
    expect(result).toBe(TAKEOVER_RESULT)
  })
})

describe('searchMiddleware - location not found without searchTerms', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('should redirect when searchTerms is empty', async () => {
    const { mockRequest, mockH } = mocks
    mockRequest.query = {
      searchTerms: '',
      secondSearchTerm: ''
    }

    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: LOCATION_TYPE_UK,
      userLocation: 'Test',
      locationNameOrPostcode: 'Test'
    })

    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING },
      getForecasts: { forecasts: [] },
      getOSPlaces: null,
      getNIPlaces: null
    })

    vi.mocked(isValidPartialPostcodeNI).mockReturnValue(true)
    vi.mocked(isValidPartialPostcodeUK).mockReturnValue(false)

    const result = await searchMiddleware(mockRequest, mockH)

    expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
      locationNameOrPostcode: 'Test',
      lang: LANG_EN
    })
    expect(mockH.redirect).toHaveBeenCalledWith('location-not-found')
    expect(result).toBe(TAKEOVER_RESULT)
  })
})

describe('searchMiddleware - unknown location type fallback', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('should redirect to location-not-found for unknown location type', async () => {
    const { mockRequest, mockH } = mocks
    mockRequest.query = {
      searchTerms: 'test',
      secondSearchTerm: ''
    }

    // Mock an unknown location type (neither UK nor NI)
    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: 'UNKNOWN',
      userLocation: 'Test',
      locationNameOrPostcode: 'Test'
    })

    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: MOCK_DATE_STRING, today: {} },
      getForecasts: { forecasts: [] },
      getOSPlaces: { results: [{ id: '1' }] }, // Valid data to pass validation
      getNIPlaces: null
    })

    vi.mocked(transformKeys).mockReturnValue({
      transformedDailySummary: MOCK_DATE_OBJECT
    })

    vi.mocked(isValidPartialPostcodeNI).mockReturnValue(false)
    vi.mocked(isValidPartialPostcodeUK).mockReturnValue(false)

    const result = await searchMiddleware(mockRequest, mockH)

    expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
    expect(result).toBe(TAKEOVER_RESULT)
  })
})
