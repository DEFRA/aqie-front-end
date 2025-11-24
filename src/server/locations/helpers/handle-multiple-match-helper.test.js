import { describe, it, expect, vi } from 'vitest'
import { handleMultipleMatchesHelper } from './handle-multiple-match-helper.js'
import * as monitoringSites from '../../data/en/monitoring-sites.js'

// Mock handleMultipleMatches
vi.mock('./middleware-helpers.js', () => ({
  handleMultipleMatches: vi.fn((h, request, options) => {
    return { called: true, options } // ''
  })
}))

describe('handleMultipleMatchesHelper', () => {
  it('should call handleMultipleMatches with correct parameters', () => {
    const h = {}
    const request = {}
    const selectedMatches = [{ id: 1 }]
    const params = {
      locationNameOrPostcode: 'London',
      userLocation: 'SW1A 1AA',
      getForecasts: vi.fn(),
      getDailySummary: vi.fn(),
      airQualityData: { pm25: 10 },
      transformedDailySummary: { summary: 'Good' },
      calendarWelsh: 'Dydd Llun',
      month: 'January',
      welshDate: '01/01/2024',
      englishDate: '01/01/2024',
      locationType: 'City',
      lang: 'en',
      english: {
        multipleLocations: 'Multiple locations found',
        backlink: '/back',
        cookieBanner: 'Cookies info',
        phaseBanner: 'Beta',
        footerTxt: 'Footer text'
      }
    }

    const result = handleMultipleMatchesHelper(h, request, params, selectedMatches)
    expect(result.called).toBe(true) // ''
    expect(result.options.selectedMatches).toEqual(selectedMatches) // ''
    expect(result.options.locationNameOrPostcode).toBe('London') // ''
    expect(result.options.siteTypeDescriptions).toBe(monitoringSites.siteTypeDescriptions) // ''
    expect(result.options.pollutantTypes).toBe(monitoringSites.pollutantTypes) // ''
    expect(result.options.lang).toBe('en') // ''
    expect(result.options.footerTxt).toBe('Footer text') // ''
  })

  it('should handle missing optional params gracefully', () => {
    const h = {}
    const request = {}
    const selectedMatches = []
    const params = {
      english: {}
    }
    const result = handleMultipleMatchesHelper(h, request, params, selectedMatches)
    expect(result.called).toBe(true) // ''
    expect(result.options.selectedMatches).toEqual(selectedMatches) // ''
  })
})