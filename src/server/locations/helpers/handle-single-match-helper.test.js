import { describe, it, expect, vi } from 'vitest'
import {
  handleSingleMatchTest,
  handleSingleMatchHelper
} from './handle-single-match-helper.js'
import { handleSingleMatch } from './middleware-helpers.js'

// Mock the middleware-helpers
vi.mock('./middleware-helpers.js', () => ({
  handleSingleMatch: vi.fn()
}))

describe('handle-single-match-helper', () => {
  describe('handleSingleMatchHelper', () => {
    it('should call handleSingleMatch with correct parameters', () => {
      // ''
      const mockH = {}
      const mockRequest = {}
      const mockParams = {
        getForecasts: [],
        getDailySummary: {},
        transformedDailySummary: [],
        englishDate: '2025-10-11',
        welshDate: '2025-10-11',
        month: 'October',
        lang: 'en',
        locationType: 'uk'
      }
      const mockSelectedMatches = [{ id: 1 }]
      const mockTitleData = {
        title: 'Test Title',
        headerTitle: 'Header',
        titleRoute: '/test',
        headerTitleRoute: '/header',
        urlRoute: '/url'
      }

      handleSingleMatchHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches,
        mockTitleData
      )

      expect(handleSingleMatch).toHaveBeenCalledWith(
        mockH,
        mockRequest,
        expect.objectContaining({
          selectedMatches: mockSelectedMatches,
          getForecasts: [],
          getDailySummary: {},
          transformedDailySummary: [],
          englishDate: '2025-10-11',
          welshDate: '2025-10-11',
          month: 'October',
          headerTitle: 'Header',
          titleRoute: '/test',
          headerTitleRoute: '/header',
          title: 'Test Title',
          urlRoute: '/url',
          locationType: 'uk',
          lang: 'en'
        })
      )
    })
  })

  describe('handleSingleMatchTest', () => {
    it('should return match when match is provided', () => {
      const match = { id: 1, name: 'Test Match' }
      const result = handleSingleMatchTest(match)
      expect(result).toEqual(match)
    })

    it('should return null when match is null', () => {
      const result = handleSingleMatchTest(null)
      expect(result).toBeNull()
    })

    it('should return null when match is undefined', () => {
      const result = handleSingleMatchTest(undefined)
      expect(result).toBeNull()
    })
  })
})
