import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
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
  getPollutantLevel: vi.fn((value, pollutant) => ({
    getDaqi: 3,
    getBand: 'low'
  }))
}))

vi.mock('./cy/pollutant-level-calculation.js', () => ({
  getPollutantLevelCy: vi.fn((value, pollutant) => ({
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
  it('should return latlon and forecastCoordinates when matches exist', () => {
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

  it('should return empty objects when matches array is empty', () => {
    const matches = []
    const location = { name: 'Test' }
    const index = 0
    const forecasts = [{ data: 'test' }]

    const result = getLatLonAndForecastCoords(
      matches,
      location,
      index,
      forecasts
    )

    expect(result.latlon).toEqual({})
    expect(result.forecastCoordinates).toEqual([])
  })
})

describe('buildForecastNum', () => {
  it('should build forecast numbers for today and other days', () => {
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

  it('should return [] when matches array is empty', () => {
    const matches = []
    const nearestLocation = []
    const forecastDay = 'Mon'

    const result = buildForecastNum(matches, nearestLocation, forecastDay)

    expect(result).toEqual([])
  })

  it('should handle no matching forecastDay', () => {
    const matches = [{ id: 1 }]
    const nearestLocation = [
      {
        forecast: [
          { day: 'Mon', value: 3 },
          { day: 'Tue', value: 4 }
        ]
      }
    ]
    const forecastDay = 'Fri'

    const result = buildForecastNum(matches, nearestLocation, forecastDay)

    expect(result).toEqual([[{ Mon: 3 }, { Tue: 4 }]])
  })
})

describe('isValidNonNegativeNumber', () => {
  it('should return true for valid positive numbers', () => {
    expect(isValidNonNegativeNumber(5)).toBe(true)
    expect(isValidNonNegativeNumber(0)).toBe(true)
    expect(isValidNonNegativeNumber(123.45)).toBe(true)
  })

  it('should return true for numeric strings', () => {
    expect(isValidNonNegativeNumber('10')).toBe(true)
    expect(isValidNonNegativeNumber('0')).toBe(true)
    expect(isValidNonNegativeNumber('45.67')).toBe(true)
  })

  it('should return false for negative numbers', () => {
    expect(isValidNonNegativeNumber(-5)).toBe(false)
    expect(isValidNonNegativeNumber('-10')).toBe(false)
  })

  it('should return false for NaN', () => {
    expect(isValidNonNegativeNumber(NaN)).toBe(false)
    expect(isValidNonNegativeNumber('not a number')).toBe(false)
  })

  it('should return true for null (coerces to 0) but false for undefined', () => {
    expect(isValidNonNegativeNumber(null)).toBe(true) // Number(null) = 0
    expect(isValidNonNegativeNumber(undefined)).toBe(false) // Number(undefined) = NaN
  })

  it('should return false for Infinity', () => {
    expect(isValidNonNegativeNumber(Infinity)).toBe(false)
    expect(isValidNonNegativeNumber(-Infinity)).toBe(false)
  })
})

describe('buildPollutantsObject', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should build pollutants object with English language', () => {
    const curr = {
      pollutants: {
        no2: {
          value: 25,
          exception: false,
          featureOfInterest: 'test',
          time: { date: '2024-01-15T10:00:00Z' }
        }
      }
    }
    const lang = 'en'

    const result = buildPollutantsObject(curr, lang)

    expect(result.no2.value).toBe(25)
    expect(result.no2.daqi).toBe(3)
    expect(result.no2.band).toBe('low')
  })

  it('should build pollutants object with Welsh language', () => {
    const curr = {
      pollutants: {
        o3: {
          value: 30,
          exception: false,
          featureOfInterest: 'test',
          time: { date: '2024-01-15T10:00:00Z' }
        }
      }
    }
    const lang = 'cy'

    const result = buildPollutantsObject(curr, lang)

    expect(result.o3.value).toBe(30)
    expect(result.o3.daqi).toBe(3)
    expect(result.o3.band).toBe('isel')
  })

  it('should skip pollutants with invalid values', () => {
    const curr = {
      pollutants: {
        no2: {
          value: -5,
          exception: false,
          featureOfInterest: 'test',
          time: { date: '2024-01-15T10:00:00Z' }
        },
        o3: {
          value: 30,
          exception: false,
          featureOfInterest: 'test',
          time: { date: '2024-01-15T10:00:00Z' }
        }
      }
    }
    const lang = 'en'

    const result = buildPollutantsObject(curr, lang)

    expect(result.no2).toBeUndefined()
    expect(result.o3).toBeDefined()
  })

  it('should return empty array when no pollutants', () => {
    expect(buildPollutantsObject({ pollutants: {} }, 'en')).toEqual([])
  })
})

describe('buildNearestLocationEntry', () => {
  it('should build a valid nearest location entry', () => {
    const curr = {
      area: 'Test Area',
      areaType: 'City',
      location: {
        type: 'Point',
        coordinates: [51.5, -0.1]
      },
      id: 'test-id',
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
    const lang = 'en'

    const result = buildNearestLocationEntry(curr, latlon, lang)

    expect(result).toBeDefined()
    expect(result.area).toBe('Test Area')
    expect(result.name).toBe('Test Location')
    expect(result.distance).toBeDefined()
    expect(result.pollutants).toBeDefined()
  })

  it('should return null when no valid pollutants exist', () => {
    const curr = {
      area: 'Test Area',
      areaType: 'City',
      location: {
        type: 'Point',
        coordinates: [51.5, -0.1]
      },
      id: 'test-id',
      name: 'Test Location',
      updated: '2024-01-15T10:00:00Z',
      pollutants: {}
    }
    const latlon = { lat: 51.5074, lon: -0.1278 }
    const lang = 'en'

    const result = buildNearestLocationEntry(curr, latlon, lang)

    expect(result).toBeNull()
  })
})

describe('buildNearestLocationsRange', () => {
  it('should build nearest locations range with valid measurements', () => {
    const matches = [{ id: 1 }]
    const getMeasurments = [
      {
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
    ]
    const latlon = { lat: 51.5074, lon: -0.1278 }
    const lang = 'en'

    locationUtil.coordinatesTotal.mockReturnValue([
      { latitude: 51.5, longitude: -0.1 }
    ])
    locationUtil.pointsInRange.mockReturnValue(true)

    const result = buildNearestLocationsRange(
      matches,
      getMeasurments,
      latlon,
      lang
    )

    expect(Array.isArray(result)).toBe(true)
  })

  it('should return empty array when matches is empty', () => {
    const matches = []
    const getMeasurments = []
    const latlon = { lat: 51.5074, lon: -0.1278 }
    const lang = 'en'

    const result = buildNearestLocationsRange(
      matches,
      getMeasurments,
      latlon,
      lang
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

  it('should get nearest location with old measurements (useNewRicardoMeasurementsEnabled=false)', async () => {
    const matches = [{ id: 1 }]
    const forecasts = [{ data: 'test' }]
    const location = { name: 'Test' }
    const index = 0
    const lang = 'en'
    const useNewRicardoMeasurementsEnabled = false
    const request = {}

    fetchData.fetchMeasurements.mockResolvedValue([
      {
        area: 'Test',
        location: { type: 'Point', coordinates: [51.5, -0.1] },
        name: 'Test Location',
        pollutants: {
          no2: {
            value: 25,
            exception: false,
            featureOfInterest: 'test',
            time: { date: '2024-01-15T10:00:00Z' }
          }
        }
      }
    ])

    const result = await getNearestLocation(
      matches,
      forecasts,
      location,
      index,
      lang,
      useNewRicardoMeasurementsEnabled,
      request
    )

    expect(result).toHaveProperty('forecastNum')
    expect(result).toHaveProperty('nearestLocationsRange')
    expect(result).toHaveProperty('nearestLocation')
    expect(result).toHaveProperty('latlon')
  })

  it('should get nearest location with new measurements (useNewRicardoMeasurementsEnabled=true)', async () => {
    const matches = [{ id: 1 }]
    const forecasts = [{ data: 'test' }]
    const location = { name: 'Test' }
    const index = 0
    const lang = 'en'
    const useNewRicardoMeasurementsEnabled = true
    const request = {}

    fetchData.fetchMeasurements.mockResolvedValue({
      measurements: [
        {
          area: 'Test',
          location: { type: 'Point', coordinates: [51.5, -0.1] },
          name: 'Test Location',
          id: 'test-1',
          pollutants: {
            no2: {
              value: 25,
              exception: false,
              featureOfInterest: 'test',
              time: { date: '2024-01-15T10:00:00Z' }
            }
          }
        }
      ]
    })

    const result = await getNearestLocation(
      matches,
      forecasts,
      location,
      index,
      lang,
      useNewRicardoMeasurementsEnabled,
      request
    )

    expect(result).toHaveProperty('forecastNum')
    expect(result).toHaveProperty('nearestLocationsRange')
    expect(result).toHaveProperty('nearestLocation')
    expect(result).toHaveProperty('latlon')
  })

  it('should handle empty matches array', async () => {
    const matches = []
    const forecasts = []
    const location = { name: 'Test' }
    const index = 0
    const lang = 'en'
    const useNewRicardoMeasurementsEnabled = false
    const request = {}

    locationUtil.convertPointToLonLat.mockReturnValue({})
    locationUtil.coordinatesTotal.mockReturnValue([])
    locationUtil.getNearLocation.mockReturnValue({})
    fetchData.fetchMeasurements.mockResolvedValue([]) // Return empty array

    const result = await getNearestLocation(
      matches,
      forecasts,
      location,
      index,
      lang,
      useNewRicardoMeasurementsEnabled,
      request
    )

    expect(result.forecastNum).toEqual([])
    expect(result.nearestLocationsRange).toEqual([])
    expect(result.nearestLocation).toEqual([]) // '' nearestLocationSafe converts non-arrays to []
  })
})
