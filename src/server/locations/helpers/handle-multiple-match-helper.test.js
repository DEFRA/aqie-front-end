/* global describe, it, expect, beforeEach, vi */

import { handleMultipleMatchesHelper } from './handle-multiple-match-helper.js'
import * as middlewareHelpers from './middleware-helpers.js'

vi.mock('./middleware-helpers.js', () => ({
  handleMultipleMatches: vi.fn()
}))

describe('handle-multiple-match-helper', () => {
  let mockH
  let mockRequest
  let mockParams
  let mockSelectedMatches

  beforeEach(() => {
    mockH = {
      view: vi.fn().mockReturnValue('view result'),
      redirect: vi.fn().mockReturnValue('redirect result')
    }

    mockRequest = {
      path: '/test-path',
      query: { lang: 'en' }
    }

    mockSelectedMatches = [
      { name: 'Location 1', id: 'loc1' },
      { name: 'Location 2', id: 'loc2' }
    ]

    mockParams = {
      locationNameOrPostcode: 'Test Location',
      userLocation: 'test',
      getForecasts: [{ date: '2024-01-01', value: 3 }],
      getDailySummary: { today: { value: 2 } },
      airQualityData: { current: 'Good' },
      transformedDailySummary: { transformed: true },
      calendarWelsh: { monday: 'Dydd Llun' },
      month: 'January',
      welshDate: '1 Ionawr 2024',
      englishDate: '1 January 2024',
      locationType: 'uk-location',
      lang: 'en',
      english: {
        multipleLocations: {
          title: 'Multiple locations found',
          description: 'Please select a location'
        },
        backlink: { text: 'Back', url: '/back' },
        cookieBanner: { message: 'We use cookies' },
        phaseBanner: { tag: 'Beta' },
        footerTxt: { copyright: '© Crown copyright' }
      }
    }

    vi.clearAllMocks()
  })

  describe('handleMultipleMatchesHelper', () => {
    it('should call handleMultipleMatches with correct parameters', () => {
      middlewareHelpers.handleMultipleMatches.mockReturnValue(
        'multiple matches result'
      )

      const result = handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      expect(middlewareHelpers.handleMultipleMatches).toHaveBeenCalledTimes(1)
      expect(result).toBe('multiple matches result')
    })

    it('should pass h parameter to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      expect(callArgs[0]).toBe(mockH)
    })

    it('should pass request parameter to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      expect(callArgs[1]).toBe(mockRequest)
    })

    it('should pass selectedMatches to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.selectedMatches).toBe(mockSelectedMatches)
    })

    it('should pass locationNameOrPostcode to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.locationNameOrPostcode).toBe('Test Location')
    })

    it('should pass userLocation to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.userLocation).toBe('test')
    })

    it('should pass getForecasts to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.getForecasts).toEqual([
        { date: '2024-01-01', value: 3 }
      ])
    })

    it('should pass multipleLocations from english to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.multipleLocations).toEqual({
        title: 'Multiple locations found',
        description: 'Please select a location'
      })
    })

    it('should pass airQualityData to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.airQualityData).toEqual({ current: 'Good' })
    })

    it('should pass getDailySummary to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.getDailySummary).toEqual({ today: { value: 2 } })
    })

    it('should pass transformedDailySummary to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.transformedDailySummary).toEqual({
        transformed: true
      })
    })

    it('should pass footerTxt from english to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.footerTxt).toEqual({ copyright: '© Crown copyright' })
    })

    it('should pass phaseBanner from english to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.phaseBanner).toEqual({ tag: 'Beta' })
    })

    it('should pass backlink from english to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.backlink).toEqual({ text: 'Back', url: '/back' })
    })

    it('should pass cookieBanner from english to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.cookieBanner).toEqual({ message: 'We use cookies' })
    })

    it('should pass calendarWelsh to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.calendarWelsh).toEqual({ monday: 'Dydd Llun' })
    })

    it('should pass month to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.month).toBe('January')
    })

    it('should pass welshDate to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.welshDate).toBe('1 Ionawr 2024')
    })

    it('should pass englishDate to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.englishDate).toBe('1 January 2024')
    })

    it('should pass locationType to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.locationType).toBe('uk-location')
    })

    it('should pass lang to handleMultipleMatches', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams.lang).toBe('en')
    })

    it('should include siteTypeDescriptions in passed params', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams).toHaveProperty('siteTypeDescriptions')
    })

    it('should include pollutantTypes in passed params', () => {
      handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        mockSelectedMatches
      )

      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      const passedParams = callArgs[2]
      expect(passedParams).toHaveProperty('pollutantTypes')
    })

    it('should handle empty selectedMatches array', () => {
      middlewareHelpers.handleMultipleMatches.mockReturnValue('empty result')

      const result = handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        []
      )

      expect(result).toBe('empty result')
      expect(middlewareHelpers.handleMultipleMatches).toHaveBeenCalled()
    })

    it('should handle large selectedMatches array', () => {
      const largeMatches = Array.from({ length: 100 }, (_, i) => ({
        name: `Location ${i}`,
        id: `loc${i}`
      }))

      middlewareHelpers.handleMultipleMatches.mockReturnValue('large result')

      const result = handleMultipleMatchesHelper(
        mockH,
        mockRequest,
        mockParams,
        largeMatches
      )

      expect(result).toBe('large result')
      const callArgs = middlewareHelpers.handleMultipleMatches.mock.calls[0]
      expect(callArgs[2].selectedMatches).toHaveLength(100)
    })
  })
})
