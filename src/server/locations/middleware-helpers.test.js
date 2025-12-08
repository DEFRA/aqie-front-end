import './test-helpers/middleware-mocks.js'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as middleware from './middleware.js'
import {
  isValidPartialPostcodeNI,
  isValidPartialPostcodeUK
} from './helpers/convert-string.js'
import { setupMocks } from './test-helpers/middleware-test-setup.js'

describe('shouldReturnNotFound', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('returns true for NI location type with empty results', () => {
    const redirectError = { locationType: 'NI' }
    const getNIPlaces = { results: [] }
    const userLocation = 'BT1 1AA'
    const getOSPlaces = {}
    expect(
      middleware.shouldReturnNotFound(
        redirectError,
        getNIPlaces,
        userLocation,
        getOSPlaces
      )
    ).toBe(false)
  })

  it('returns true for isLocationDataNotFound', () => {
    const redirectError = { locationType: 'UK' }
    const getNIPlaces = { results: [1] }
    const userLocation = 'SW1A 1AA'
    const getOSPlaces = null
    // Simulate isLocationDataNotFound returning true by passing nulls
    expect(
      middleware.shouldReturnNotFound(
        redirectError,
        getNIPlaces,
        userLocation,
        getOSPlaces
      )
    ).toBe(false)
  })

  it('returns false for valid NI results', () => {
    const redirectError = { locationType: 'NI' }
    const getNIPlaces = { results: [1, 2] }
    const userLocation = 'BT1 1AA'
    const getOSPlaces = {}
    vi.mocked(isValidPartialPostcodeUK).mockReturnValue(false)
    vi.mocked(isValidPartialPostcodeNI).mockReturnValue(false)
    expect(
      middleware.shouldReturnNotFound(
        redirectError,
        getNIPlaces,
        userLocation,
        getOSPlaces
      )
    ).toBe(false)
  })
})

describe('isInvalidDailySummary', () => {
  beforeEach(() => {
    setupMocks()
  })

  it('returns true for null', () => {
    expect(middleware.isInvalidDailySummary(null)).toBe(true)
  })
  it('returns true for non-object', () => {
    expect(middleware.isInvalidDailySummary('string')).toBe(true)
  })
  it('returns true for missing today property', () => {
    expect(middleware.isInvalidDailySummary({})).toBe(true)
  })
  it('returns false for valid daily summary', () => {
    expect(middleware.isInvalidDailySummary({ today: {} })).toBe(false)
  })
})
