// ''
import {
  normalizeLocationType,
  buildUKTestModeResult,
  buildNITestModeResult,
  handleUnsupportedLocationType
} from './fetch-data.js'
import { describe, it, expect, vi } from 'vitest'

describe('normalizeLocationType', () => {
  it('should normalize UK string and constant', () => {
    expect(normalizeLocationType('UK')).toBe('UK')
    expect(normalizeLocationType('NI')).toBe('NI')
    expect(normalizeLocationType('OTHER')).toBe('OTHER')
  })
})

describe('buildUKTestModeResult', () => {
  it('should wrap results in array if not already', () => {
    expect(buildUKTestModeResult('foo')).toEqual({
      getDailySummary: 'summary',
      getForecasts: 'summary',
      getOSPlaces: { results: ['foo'] }
    })
    expect(buildUKTestModeResult({ results: ['bar'] })).toEqual({
      getDailySummary: 'summary',
      getForecasts: 'summary',
      getOSPlaces: { results: ['bar'] }
    })
  })
})

describe('buildNITestModeResult', () => {
  it('should wrap getNIPlaces or default', () => {
    expect(buildNITestModeResult('foo')).toEqual({
      getDailySummary: 'summary',
      getForecasts: { 'forecast-summary': 'summary' },
      getNIPlaces: 'foo'
    })
    expect(buildNITestModeResult()).toEqual({
      getDailySummary: 'summary',
      getForecasts: { 'forecast-summary': 'summary' },
      getNIPlaces: { results: [] }
    })
  })
})

describe('handleUnsupportedLocationType', () => {
  it('should log error and return error response', () => {
    const logger = { error: vi.fn() }
    const errorResponse = vi.fn((msg, code) => ({ msg, code }))
    const result = handleUnsupportedLocationType(logger, errorResponse, 'BAD')
    expect(logger.error).toHaveBeenCalledWith(
      'Unsupported location type provided:',
      'BAD'
    )
    expect(result).toEqual({
      msg: 'Unsupported location type provided',
      code: 400
    })
  })
})
// ''
