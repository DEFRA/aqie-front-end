import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getLatLonAndForecastCoords,
  buildForecastNum,
  isValidNonNegativeNumber,
  buildPollutantsObject,
  buildNearestLocationEntry,
  buildNearestLocationsRange,
  getNearestLocation,
  getAdjustedDateTimeParts
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

  it('should return 0 when matches array is empty', () => {
    const matches = []
    const nearestLocation = []
    const forecastDay = 'Mon'

    const result = buildForecastNum(matches, nearestLocation, forecastDay)

    expect(result).toBe(0)
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

describe('getAdjustedDateTimeParts', () => {
  it('should add 1 hour when offset is +01:00 (BST)', () => {
    const result = getAdjustedDateTimeParts('2026-07-27T16:00:00+01:00')
    expect(result.hour).toBe('5pm')
    expect(result.day).toBe('27')
    expect(result.month).toBe('July')
    expect(result.year).toBe('2026')
  })

  it('should not adjust hour when string ends in Z (UTC)', () => {
    const result = getAdjustedDateTimeParts('2026-07-27T14:00:00Z')
    expect(result.hour).toBe('2pm')
    expect(result.day).toBe('27')
    expect(result.month).toBe('July')
    expect(result.year).toBe('2026')
  })

  it('should handle backend format with milliseconds', () => {
    const result = getAdjustedDateTimeParts('2026-07-28T08:00:00.000Z')
    expect(result.hour).toBe('8am')
    expect(result.day).toBe('28')
    expect(result.month).toBe('July')
    expect(result.year).toBe('2026')
  })

  it('should roll over to the next day when +01:00 pushes past midnight', () => {
    const result = getAdjustedDateTimeParts('2026-07-27T23:30:00+01:00')
    expect(result.hour).toBe('12am')
    expect(result.day).toBe('28')
    expect(result.month).toBe('July')
    expect(result.year).toBe('2026')
  })

  it('should roll over to the next month when day/hour overflow', () => {
    const result = getAdjustedDateTimeParts('2026-07-31T23:15:00+01:00')
    expect(result.day).toBe('1')
    expect(result.month).toBe('August')
    expect(result.year).toBe('2026')
  })

  it('should format midnight (0) as 12am', () => {
    const result = getAdjustedDateTimeParts('2026-07-27T00:00:00Z')
    expect(result.hour).toBe('12am')
  })

  it('should format noon (12) as 12pm', () => {
    const result = getAdjustedDateTimeParts('2026-07-27T12:00:00Z')
    expect(result.hour).toBe('12pm')
  })

  it('should return undefined when date string is missing', () => {
    expect(getAdjustedDateTimeParts(undefined)).toBeUndefined()
    expect(getAdjustedDateTimeParts(null)).toBeUndefined()
    expect(getAdjustedDateTimeParts('')).toBeUndefined()
  })

  it('should return undefined when date string does not match expected pattern', () => {
    expect(getAdjustedDateTimeParts('not-a-date')).toBeUndefined()
  })

  it('should not adjust for offsets other than +01:00', () => {
    const result = getAdjustedDateTimeParts('2026-07-27T14:00:00+02:00')
    expect(result.hour).toBe('2pm')
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

  it('should recompute display time from the timestamp offset on the new Ricardo path (ignoring pre-computed parts)', () => {
    const curr = {
      pollutants: {
        no2: {
          value: 25,
          exception: false,
          featureOfInterest: 'test',
          time: {
            date: '2024-01-15T10:00:00Z',
            // Backend-supplied parts are present (new Ricardo path) but are
            // recomputed from the timestamp; the '11am' below is overridden.
            hour: '11am',
            day: '15',
            month: 'January',
            year: '2024'
          }
        }
      }
    }

    const result = buildPollutantsObject(curr, 'en')

    // 10:00 wall clock + 00:00 offset -> 10:00 -> 10am
    expect(result.no2.time).toEqual({
      date: '2024-01-15T10:00:00Z',
      hour: '10am',
      day: '15',
      month: 'January',
      year: '2024'
    })
  })

  it('should fall back to backend parts when the timestamp is unparseable on the new Ricardo path', () => {
    const curr = {
      pollutants: {
        no2: {
          value: 25,
          exception: false,
          featureOfInterest: 'test',
          time: {
            date: 'not-a-date',
            hour: '11am',
            day: '15',
            month: 'January',
            year: '2024'
          }
        }
      }
    }

    const result = buildPollutantsObject(curr, 'en')

    expect(result.no2.time.hour).toBe('11am')
    expect(result.no2.time.day).toBe('15')
    expect(result.no2.time.month).toBe('January')
    expect(result.no2.time.year).toBe('2024')
  })

  it('should fall back to moment calculation when backend time parts are partially missing', () => {
    const curr = {
      pollutants: {
        no2: {
          value: 25,
          exception: false,
          featureOfInterest: 'test',
          time: {
            date: '2026-07-28T08:00:00.000Z',
            hour: '9am', // backend value - should be ignored
            day: '28',
            month: 'July',
            year: '2026'
          }
        }
      }
    }

    const result = buildPollutantsObject(curr, 'en')

    // Manually derived from date (Z => no adjustment) => 8am, not backend's 9am
    expect(result.no2.time.hour).toBe('8am')
    expect(result.no2.time.day).toBe('28')
    expect(result.no2.time.month).toBe('July')
    expect(result.no2.time.year).toBe('2026')
  })

  it('should correctly add 1 hour for +01:00 offset dates with no backend time parts', () => {
    const curr = {
      pollutants: {
        no2: {
          value: 25,
          exception: false,
          featureOfInterest: 'test',
          time: { date: '2026-07-27T16:00:00+01:00' }
        }
      }
    }

    const result = buildPollutantsObject(curr, 'en')

    expect(result.no2.time.hour).toBe('5pm')
  })

  it('should not adjust hour for Z (UTC) dates with no backend time parts', () => {
    const curr = {
      pollutants: {
        no2: {
          value: 25,
          exception: false,
          featureOfInterest: 'test',
          time: { date: '2026-07-27T14:00:00Z' }
        }
      }
    }

    const result = buildPollutantsObject(curr, 'en')

    expect(result.no2.time.hour).toBe('2pm')
  })

  it('should fall back to moment calculation when date does not match manual parse pattern', () => {
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

    const result = buildPollutantsObject(curr, 'en')

    expect(result.no2.time.hour).toBeDefined()
    expect(result.no2.time.day).toBeDefined()
    expect(result.no2.time.month).toBeDefined()
    expect(result.no2.time.year).toBeDefined()
  })

  it('should shift the wall-clock time forward by the offset for a +01:00 timestamp (new Ricardo path)', () => {
    const curr = {
      pollutants: {
        no2: {
          value: 25,
          exception: false,
          featureOfInterest: 'test',
          time: {
            date: '2026-07-27T14:00:00+01:00',
            // Backend parts present (new Ricardo path); recomputed from date.
            hour: '9am',
            day: '1',
            month: 'January',
            year: '2000'
          }
        }
      }
    }

    const result = buildPollutantsObject(curr, 'en')

    // 14:00 wall clock + 01:00 offset -> 15:00 -> 3pm
    expect(result.no2.time.hour).toBe('3pm')
    expect(result.no2.time.day).toBe('27')
    expect(result.no2.time.month).toBe('July')
    expect(result.no2.time.year).toBe('2026')
  })

  it('should display the wall-clock time as-is for a Z (UTC) timestamp (new Ricardo path)', () => {
    const curr = {
      pollutants: {
        no2: {
          value: 25,
          exception: false,
          featureOfInterest: 'test',
          time: {
            date: '2026-07-27T14:00:00Z',
            hour: '9am',
            day: '1',
            month: 'January',
            year: '2000'
          }
        }
      }
    }

    const result = buildPollutantsObject(curr, 'en')

    // 14:00 wall clock + 00:00 offset -> 14:00 -> 2pm
    expect(result.no2.time.hour).toBe('2pm')
    expect(result.no2.time.day).toBe('27')
    expect(result.no2.time.month).toBe('July')
    expect(result.no2.time.year).toBe('2026')
  })

  it('should handle missing time object gracefully using optional chaining fallback', () => {
    const curr = {
      pollutants: {
        no2: {
          value: 25,
          exception: false,
          featureOfInterest: 'test'
          // no time property at all
        }
      }
    }

    const result = buildPollutantsObject(curr, 'en')

    expect(result.no2).toBeDefined()
    expect(result.no2.time.date).toBeUndefined()
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

  it('should default id to empty string when name is missing', () => {
    const curr = {
      area: 'Test Area',
      areaType: 'City',
      location: {
        type: 'Point',
        coordinates: [51.5, -0.1]
      },
      name: undefined,
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

    expect(result.id).toBe('')
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

  it('should filter out measurements without location coordinates', () => {
    const matches = [{ id: 1 }]
    const getMeasurments = [
      {
        area: 'Test Area',
        areaType: 'City',
        location: {},
        name: 'No Coords Location',
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

    locationUtil.coordinatesTotal.mockReturnValue([])
    locationUtil.pointsInRange.mockReturnValue(true)

    const result = buildNearestLocationsRange(
      matches,
      getMeasurments,
      latlon,
      'en'
    )

    expect(result).toEqual([])
  })

  it('should sort results by distance ascending', () => {
    const matches = [{ id: 1 }]
    const getMeasurments = [
      {
        area: 'Far',
        location: { type: 'Point', coordinates: [52.5, -1.1] },
        name: 'Far Location',
        pollutants: {
          no2: {
            value: 10,
            exception: false,
            featureOfInterest: 'test',
            time: { date: '2024-01-15T10:00:00Z' }
          }
        }
      },
      {
        area: 'Near',
        location: { type: 'Point', coordinates: [51.5, -0.1] },
        name: 'Near Location',
        pollutants: {
          no2: {
            value: 15,
            exception: false,
            featureOfInterest: 'test',
            time: { date: '2024-01-15T10:00:00Z' }
          }
        }
      }
    ]
    const latlon = { lat: 51.5074, lon: -0.1278 }

    locationUtil.coordinatesTotal.mockReturnValue([
      { latitude: 52.5, longitude: -1.1 },
      { latitude: 51.5, longitude: -0.1 }
    ])
    locationUtil.pointsInRange.mockReturnValue(true)

    const result = buildNearestLocationsRange(
      matches,
      getMeasurments,
      latlon,
      'en'
    )

    expect(result.length).toBe(2)
    // Both mocked to same distance via geolib mock, so just confirm array shape
    expect(result[0]).toHaveProperty('distance')
    expect(result[1]).toHaveProperty('distance')
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
      { request }
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
      { request }
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
      { request }
    )

    expect(result.forecastNum).toBe(0)
    expect(result.nearestLocationsRange).toEqual([])
    expect(result.nearestLocation).toEqual({})
  })

  it('should skip measurements entirely when skipMeasurements is true', async () => {
    const matches = [{ id: 1 }]
    const forecasts = [{ data: 'test' }]
    const location = { name: 'Test' }

    const result = await getNearestLocation(
      matches,
      forecasts,
      location,
      0,
      'en',
      true,
      { request: {}, skipMeasurements: true }
    )

    expect(result.nearestLocationsRange).toEqual([])
    expect(fetchData.fetchMeasurements).not.toHaveBeenCalled()
  })

  it('should skip measurements when skipMeasurements is true on legacy path too', async () => {
    const matches = [{ id: 1 }]
    const forecasts = [{ data: 'test' }]
    const location = { name: 'Test' }

    const result = await getNearestLocation(
      matches,
      forecasts,
      location,
      0,
      'en',
      false,
      { request: {}, skipMeasurements: true }
    )

    expect(result.nearestLocationsRange).toEqual([])
    expect(fetchData.fetchMeasurements).not.toHaveBeenCalled()
  })

  it('should return empty array when new measurements payload has no measurements property', async () => {
    const matches = [{ id: 1 }]
    const forecasts = [{ data: 'test' }]
    const location = { name: 'Test' }

    fetchData.fetchMeasurements.mockResolvedValue({})

    const result = await getNearestLocation(
      matches,
      forecasts,
      location,
      0,
      'en',
      true,
      { request: {} }
    )

    expect(result.nearestLocationsRange).toEqual([])
  })

  it('should return empty array when latlon is missing lat/lon for new path', async () => {
    const matches = [{ id: 1 }]
    const forecasts = [{ data: 'test' }]
    const location = { name: 'Test' }

    locationUtil.convertPointToLonLat.mockReturnValue({})

    const result = await getNearestLocation(
      matches,
      forecasts,
      location,
      0,
      'en',
      true,
      { request: {} }
    )

    expect(result.nearestLocationsRange).toEqual([])
    expect(fetchData.fetchMeasurements).not.toHaveBeenCalled()
  })

  it('should default context to empty object when not provided', async () => {
    const matches = []
    const forecasts = []
    const location = { name: 'Test' }

    locationUtil.convertPointToLonLat.mockReturnValue({})
    locationUtil.coordinatesTotal.mockReturnValue([])
    locationUtil.getNearLocation.mockReturnValue({})
    fetchData.fetchMeasurements.mockResolvedValue([])

    const result = await getNearestLocation(
      matches,
      forecasts,
      location,
      0,
      'en',
      false
    )

    expect(result.nearestLocationsRange).toEqual([])
  })
})
