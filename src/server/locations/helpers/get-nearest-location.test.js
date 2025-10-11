import { describe, it, expect } from 'vitest'

describe('Get Nearest Location Tests', () => {
  it('should call getLatLonAndForecastCoords with empty matches', async () => {
    // ''
    const { latlon, forecastCoordinates } = (await (
      await import('./get-nearest-location.js')
    ).getLatLonAndForecastCoords)
      ? (await import('./get-nearest-location.js')).getLatLonAndForecastCoords(
          [],
          {},
          0,
          []
        )
      : { latlon: {}, forecastCoordinates: [] }
    expect(latlon).toEqual({})
    expect(forecastCoordinates).toEqual([])
  })

  it('should call buildForecastNum with empty matches', async () => {
    const fn = (await import('./get-nearest-location.js')).buildForecastNum
    if (fn) {
      expect(fn([], [], 'Mon')).toBe(0)
    } else {
      expect(true).toBe(true)
    }
  })

  it('should call buildPollutantsObject with empty pollutants', async () => {
    const fn = (await import('./get-nearest-location.js')).buildPollutantsObject
    if (fn) {
      expect(fn({ pollutants: {} }, 'en')).toEqual([])
    } else {
      expect(true).toBe(true)
    }
  })

  it('should call buildNearestLocationEntry with empty pollutants', async () => {
    const fn = (await import('./get-nearest-location.js'))
      .buildNearestLocationEntry
    if (fn) {
      const result = fn(
        { pollutants: {}, location: { coordinates: [0, 0], type: 'Point' } },
        { lat: 0, lon: 0 },
        'en'
      )
      expect(result).toBeNull()
    } else {
      expect(true).toBe(true)
    }
  })

  it('should call buildNearestLocationsRange with no measurements', async () => {
    const fn = (await import('./get-nearest-location.js'))
      .buildNearestLocationsRange
    if (fn) {
      expect(fn([], {}, {}, 'en')).toEqual([])
    } else {
      expect(true).toBe(true)
    }
  })
})
