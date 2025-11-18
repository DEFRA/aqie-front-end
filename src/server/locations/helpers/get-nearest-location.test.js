import { describe, it, expect, beforeAll, vi } from 'vitest'
import {
  getLatLonAndForecastCoords, // ''
  buildForecastNum, // ''
  buildPollutantsObject, // ''
  buildNearestLocationEntry, // ''
  buildNearestLocationsRange // ''
} from './get-nearest-location.js' // ''
// Provide a global logger stub so functions referencing logger do not throw ''
beforeAll(() => {
  // ''
  global.logger = {
    // ''
    error: vi.fn(), // ''
    info: vi.fn(), // ''
    warn: vi.fn(), // ''
    debug: vi.fn() // ''
  } // ''
}) // ''

describe('Get Nearest Location Tests', () => {
  // ''
  it('should call getLatLonAndForecastCoords with empty matches', async () => {
    // ''
    const { latlon, forecastCoordinates } = getLatLonAndForecastCoords(
      [],
      {},
      0,
      []
    ) // ''
    expect(latlon).toEqual({}) // ''
    expect(forecastCoordinates).toEqual([]) // ''
  }) // ''

  it('should call buildForecastNum with empty matches', () => {
    // ''
    expect(buildForecastNum([], [], 'Mon')).toBe(0) // ''
  }) // ''

  it('should call buildPollutantsObject with empty pollutants', () => {
    // ''
    expect(buildPollutantsObject({ pollutants: {} }, 'en')).toEqual([]) // ''
  }) // ''

  it('should call buildNearestLocationEntry with empty pollutants', () => {
    // ''
    const result = buildNearestLocationEntry(
      { pollutants: {}, location: { coordinates: [0, 0], type: 'Point' } },
      { lat: 0, lon: 0 },
      'en'
    ) // ''
    expect(result).toBeNull() // ''
  }) // ''
}) // ''

describe('Get Nearest Location Tests', () => {
  // ''
  it('getLatLonAndForecastCoords returns empty objects with empty matches', () => {
    // ''
    const { latlon, forecastCoordinates } = getLatLonAndForecastCoords(
      [],
      {},
      0,
      []
    ) // ''
    expect(latlon).toEqual({}) // ''
    expect(forecastCoordinates).toEqual([]) // ''
  }) // ''

  it('buildForecastNum returns 0 with empty inputs', () => {
    // ''
    expect(buildForecastNum([], [], 'Mon')).toBe(0) // ''
  }) // ''

  it('buildPollutantsObject returns [] when no pollutants', () => {
    // ''
    expect(buildPollutantsObject({ pollutants: {} }, 'en')).toEqual([]) // ''
  }) // ''

  it('buildNearestLocationEntry returns null when pollutants empty', () => {
    // ''
    const result = buildNearestLocationEntry(
      { pollutants: {}, location: { coordinates: [0, 0], type: 'Point' } },
      { lat: 0, lon: 0 },
      'en'
    ) // ''
    expect(result).toBeNull() // ''
  }) // ''

  it('buildNearestLocationsRange returns [] with no matches', () => {
    // ''
    expect(buildNearestLocationsRange([], [], {}, 'en')).toEqual([]) // ''
  }) // ''
}) // ''
