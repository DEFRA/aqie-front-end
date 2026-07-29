import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getLatLonAndForecastCoords,
  buildForecastNum,
  isValidNonNegativeNumber,
  buildPollutantsObject,
  buildNearestLocationEntry,
  buildNearestLocationsRange,
  getNearestLocation
} from './get-nearest-location.js'

import * as locationUtil from './location-util.js'
import * as fetchData from './fetch-data.js'

// Mock dependencies
vi.mock('./location-util.js', () => ({
  convertPointToLonLat: vi.fn(),
  coordinatesTotal: vi.fn(),
  getNearLocation: vi.fn(),
  pointsInRange: vi.fn()
}))

vi.mock('./fetch-data.js', () => ({
  fetchMeasurements: vi.fn()
}))

vi.mock('./pollutant-level-calculation.js', () => ({
  getPollutantLevel: vi.fn(() => ({
    getDaqi: 3,
    getBand: 'low'
  }))
}))

vi.mock('./cy/pollutant-level-calculation.js', () => ({
  getPollutantLevelCy: vi.fn(() => ({
    getDaqi: 3,
    getBand: 'isel'
  }))
}))

vi.mock('geolib', () => ({
  getDistance: vi.fn(() => 1609.344), // 1 mile in meters
  orderByDistance: vi.fn((origin, points) => points)
}))

// Provide a global logger stub
global.logger = {
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn()
}

describe('getLatLonAndForecastCoords', () => {
  it('returns latlon and forecastCoordinates when matches exist', () => {
    const matches = [{ id: 1 }]
    const location = { name: 'Test' }
    const index = 0
    const forecasts = [{ data: 'test' }]

    locationUtil.convertPointToLonLat.mockReturnValue({ lat: 51.5, lon: -0.1 })
    locationUtil.coordinatesTotal.mockReturnValue([
      { latitude: 51.5, longitude: -0.1 }
    ])

    const result = getLatLonAndForecastCoords(
      matches,
      location,
      index,
      forecasts
    )

    expect(result.latlon).toEqual({ lat: 51.5, lon: -0.1 })
    expect(result.forecastCoordinates).toEqual([
      { latitude: 51.5, longitude: -0.1 }
    ])
  })

  it('returns empty objects when matches array is empty', () => {
    const result = getLatLonAndForecastCoords([], {}, 0, [])
    expect(result.latlon).toEqual({})
    expect(result.forecastCoordinates).toEqual([])
  })
})

describe('buildForecastNum', () => {
  it('builds forecast numbers for today and other days', () => {
    const matches = [{ id: 1 }]
    const nearestLocation = [
      {
        forecast: [
          { day: 'Mon', value: 3 },
          { day: 'Tue', value: 4 },
          { day: 'Wed', value: 2 }
        ]
      }
    ]
    const forecastDay = 'Tue'

    const result = buildForecastNum(matches, nearestLocation, forecastDay)

    expect(result).toEqual([[{ today: 4 }, { Mon: 3 }, { Wed: 2 }]])
  })

  it('returns 0 when matches array is empty', () => {
    expect(buildForecastNum([], [], 'Mon')).toBe(0)
  })

  it('handles no matching forecastDay', () => {
    const matches = [{ id: 1 }]
    const nearestLocation = [
      {
        forecast: [
          { day: 'Mon', value: 3 },
          { day: 'Tue', value: 4 }
        ]
      }
    ]
    const result = buildForecastNum(matches, nearestLocation, 'Fri')

    expect(result).toEqual([[{ Mon: 3 }, { Tue: 4 }]])
  })
})

describe('isValidNonNegativeNumber', () => {
  it('returns true for valid positive numbers', () => {
    expect(isValidNonNegativeNumber(5)).toBe(true)
    expect(isValidNonNegativeNumber(0)).toBe(true)
  })

  it('returns true for numeric strings', () => {
    expect(isValidNonNegativeNumber('10')).toBe(true)
  })

  it('returns false for negative numbers', () => {
    expect(isValidNonNegativeNumber(-5)).toBe(false)
    expect(isValidNonNegativeNumber('-10')).toBe(false)
  })

  it('returns false for NaN', () => {
    expect(isValidNonNegativeNumber(NaN)).toBe(false)
    expect(isValidNonNegativeNumber('not a number')).toBe(false)
  })

  it('returns true for null but false for undefined', () => {
    expect(isValidNonNegativeNumber(null)).toBe(true)
    expect(isValidNonNegativeNumber(undefined)).toBe(false)
  })

  it('returns false for Infinity', () => {
    expect(isValidNonNegativeNumber(Infinity)).toBe(false)
    expect(isValidNonNegativeNumber(-Infinity)).toBe(false)
  })
})

describe('buildPollutantsObject', () => {
  it('builds pollutants object with English language', () => {
    const curr = {
      pollutants: {
        no2: {
          value: 25,
          exception: false,
          featureOfInterest: 'test',
          time: {
            date: '2024-01-15T10:00:00Z',
            hour: '10am',
            day: '15',
            month: 'January',
            year: '2024'
          }
        }
      }
    }

    const result = buildPollutantsObject(curr, 'en')

    expect(result.no2.value).toBe(25)
    expect(result.no2.daqi).toBe(3)
    expect(result.no2.band).toBe('low')

    // Backend time is passed through exactly
    expect(result.no2.time).toEqual({
      date: '2024-01-15T10:00:00Z',
      hour: '10am',
      day: '15',
      month: 'January',
      year: '2024'
    })
  })

  it('builds pollutants object with Welsh language', () => {
    const curr = {
      pollutants: {
        o3: {
          value: 30,
          exception: false,
          featureOfInterest: 'test',
          time: {
            date: '2024-01-15T10:00:00Z',
            hour: '10am',
            day: '15',
            month: 'January',
            year: '2024'
          }
        }
      }
    }

    const result = buildPollutantsObject(curr, 'cy')

    expect(result.o3.value).toBe(30)
    expect(result.o3.band).toBe('isel')
  })

  it('skips pollutants with invalid values', () => {
    const curr = {
      pollutants: {
        no2: { value: -5 },
        o3: { value: 30, time: {} }
      }
    }

    const result = buildPollutantsObject(curr, 'en')

    expect(result.no2).toBeUndefined()
    expect(result.o3).toBeDefined()
  })

  it('returns empty array when no pollutants exist', () => {
    expect(buildPollutantsObject({ pollutants: {} }, 'en')).toEqual([])
  })

  it('handles missing time object gracefully', () => {
    const curr = {
      pollutants: {
        no2: {
          value: 25,
          exception: false,
          featureOfInterest: 'test'
        }
      }
    }

    const result = buildPollutantsObject(curr, 'en')

    expect(result.no2.time.date).toBeUndefined()
  })
})

describe('buildNearestLocationEntry', () => {
  it('builds a valid nearest location entry', () => {
    const curr = {
      area: 'Test Area',
      areaType: 'City',
      location: {
        type: 'Point',
        coordinates: [51.5, -0.1]
      },
      name: 'Test Location',
      updated: '2024-01-15T10:00:00Z',
      pollutants: {
        no2: {
          value: 25,
          exception: false,
          featureOfInterest: 'test',
          time: { date: '2024-01-15T10:00:00Z' }
        }
      }
    }

    const latlon = { lat: 51.5074, lon: -0.1278 }

    const result = buildNearestLocationEntry(curr, latlon, 'en')

    expect(result).toBeDefined()
    expect(result.area).toBe('Test Area')
    expect(result.pollutants.no2.value).toBe(25)
  })

  it('returns null when no valid pollutants exist', () => {
    const curr = {
      area: 'Test Area',
      areaType: 'City',
      location: { type: 'Point', coordinates: [51.5, -0.1] },
      pollutants: {}
    }

    const result = buildNearestLocationEntry(curr, { lat: 1, lon: 1 }, 'en')

    expect(result).toBeNull()
  })

  it('defaults id to empty string when name is missing', () => {
    const curr = {
      area: 'Test Area',
      areaType: 'City',
      location: { type: 'Point', coordinates: [51.5, -0.1] },
      pollutants: {
        no2: { value: 25, time: {} }
      }
    }

    const result = buildNearestLocationEntry(curr, { lat: 1, lon: 1 }, 'en')

    expect(result.id).toBe('')
  })
})

describe('buildNearestLocationsRange', () => {
  it('builds nearest locations range with valid measurements', () => {
    const matches = [{ id: 1 }]
    const measurements = [
      {
        area: 'Test Area',
        areaType: 'City',
        location: { type: 'Point', coordinates: [51.5, -0.1] },
        name: 'Test Location',
        pollutants: {
          no2: { value: 25, time: {} }
        }
      }
    ]

    locationUtil.coordinatesTotal.mockReturnValue([
      { latitude: 51.5, longitude: -0.1 }
    ])
    locationUtil.pointsInRange.mockReturnValue(true)

    const result = buildNearestLocationsRange(
      matches,
      measurements,
      { lat: 1, lon: 1 },
      'en'
    )

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(1)
  })

  it('returns empty array when matches is empty', () => {
    expect(
      buildNearestLocationsRange([], [], { lat: 1, lon: 1 }, 'en')
    ).toEqual([])
  })

  it('filters out measurements without coordinates', () => {
    const matches = [{ id: 1 }]
    const measurements = [
      {
        area: 'Test Area',
        location: {},
        pollutants: { no2: { value: 25, time: {} } }
      }
    ]

    locationUtil.coordinatesTotal.mockReturnValue([])
    locationUtil.pointsInRange.mockReturnValue(true)

    const result = buildNearestLocationsRange(
      matches,
      measurements,
      { lat: 1, lon: 1 },
      'en'
    )

    expect(result).toEqual([])
  })
})

describe('getNearestLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    locationUtil.convertPointToLonLat.mockReturnValue({ lat: 51.5, lon: -0.1 })
    locationUtil.coordinatesTotal.mockReturnValue([
      { latitude: 51.5, longitude: -0.1 }
    ])
    locationUtil.getNearLocation.mockReturnValue([
      { forecast: [{ day: 'Mon', value: 3 }] }
    ])
    locationUtil.pointsInRange.mockReturnValue(true)
  })

  it('gets nearest location with legacy measurements', async () => {
    fetchData.fetchMeasurements.mockResolvedValue([
      {
        area: 'Test',
        location: { type: 'Point', coordinates: [51.5, -0.1] },
        name: 'Test Location',
        pollutants: {
          no2: { value: 25, time: {} }
        }
      }
    ])

    const result = await getNearestLocation(
      [{ id: 1 }],
      [{ data: 'test' }],
      { name: 'Test' },
      0,
      'en',
      false,
      { request: {} }
    )

    expect(result.nearestLocationsRange.length).toBe(1)
  })

  it('gets nearest location with new measurements', async () => {
    fetchData.fetchMeasurements.mockResolvedValue({
      measurements: [
        {
          area: 'Test',
          location: { type: 'Point', coordinates: [51.5, -0.1] },
          name: 'Test Location',
          pollutants: {
            no2: { value: 25, time: {} }
          }
        }
      ]
    })

    const result = await getNearestLocation(
      [{ id: 1 }],
      [{ data: 'test' }],
      { name: 'Test' },
      0,
      'en',
      true,
      { request: {} }
    )

    expect(result.nearestLocationsRange.length).toBe(1)
  })

  it('handles empty matches array', async () => {
    locationUtil.convertPointToLonLat.mockReturnValue({})
    locationUtil.coordinatesTotal.mockReturnValue([])
    locationUtil.getNearLocation.mockReturnValue({})

    fetchData.fetchMeasurements.mockResolvedValue([])

    const result = await getNearestLocation([], [], {}, 0, 'en', false, {
      request: {}
    })

    expect(result.forecastNum).toBe(0)
    expect(result.nearestLocationsRange).toEqual([])
    expect(result.nearestLocation).toEqual({})
  })

  it('skips measurements when skipMeasurements=true', async () => {
    const result = await getNearestLocation(
      [{ id: 1 }],
      [{ data: 'test' }],
      { name: 'Test' },
      0,
      'en',
      true,
      { request: {}, skipMeasurements: true }
    )

    expect(result.nearestLocationsRange).toEqual([])
    expect(fetchData.fetchMeasurements).not.toHaveBeenCalled()
  })

  it('returns empty array when new measurements payload has no measurements property', async () => {
    fetchData.fetchMeasurements.mockResolvedValue({})

    const result = await getNearestLocation(
      [{ id: 1 }],
      [{ data: 'test' }],
      { name: 'Test' },
      0,
      'en',
      true,
      { request: {} }
    )

    expect(result.nearestLocationsRange).toEqual([])
  })

  it('returns empty array when latlon is missing lat/lon for new path', async () => {
    locationUtil.convertPointToLonLat.mockReturnValue({})

    const result = await getNearestLocation(
      [{ id: 1 }],
      [{ data: 'test' }],
      { name: 'Test' },
      0,
      'en',
      true,
      { request: {} }
    )

    expect(result.nearestLocationsRange).toEqual([])
    expect(fetchData.fetchMeasurements).not.toHaveBeenCalled()
  })
})
