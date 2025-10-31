import * as geolib from 'geolib'
import {
  getNearLocation,
  convertPointToLonLat,
  coordinatesTotal,
  pointsInRange
} from './location-util.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'
import { getNearestLocation } from './get-nearest-location.js'

vi.mock('geolib')
vi.mock('moment-timezone')
vi.mock('./location-util.js')
vi.mock('./pollutant-level-calculation')
vi.mock('./cy/pollutant-level-calculation')
vi.mock('../../data/en/air-quality.js')
vi.mock('../../data/cy/air-quality.js')
vi.mock('../../common/helpers/logging/logger.js')

describe.skip('getNearestLocation', () => {
  let matches, forecasts, measurements, location, index, lang

  beforeEach(() => {
    matches = [
      {
        /* mock data */
      }
    ]
    forecasts = [
      {
        /* mock data */
      }
    ]
    measurements = [
      {
        /* mock data */
      }
    ]
    location = {
      /* mock data */
    }
    index = 0
    lang = LANG_EN

    convertPointToLonLat.mockReturnValue({ lat: 51.5074, lon: -0.1278 })
    coordinatesTotal.mockReturnValue([
      { latitude: 51.5074, longitude: -0.1278 }
    ])
    getNearLocation.mockReturnValue([
      {
        /* mock data */
      }
    ])
    geolib.orderByDistance.mockReturnValue([
      { latitude: 51.5074, longitude: -0.1278 }
    ])
    pointsInRange.mockReturnValue(true)
  })

  it('should return nearest location data for English language', () => {
    const result = getNearestLocation(
      matches,
      forecasts,
      measurements,
      location,
      index,
      lang,
      {} // mock request
    )
    expect(result).toHaveProperty('forecastNum')
    expect(result).toHaveProperty('nearestLocationsRange')
    expect(result).toHaveProperty('airQuality')
    expect(result).toHaveProperty('latlon')
  })

  it('should return nearest location data for Welsh language', () => {
    lang = LANG_CY
    const result = getNearestLocation(
      matches,
      forecasts,
      measurements,
      location,
      index,
      lang,
      {} // mock request
    )
    expect(result).toHaveProperty('forecastNum')
    expect(result).toHaveProperty('nearestLocationsRange')
    expect(result).toHaveProperty('airQuality')
    expect(result).toHaveProperty('latlon')
  })

  it('should handle empty matches array', () => {
    matches = []
    const result = getNearestLocation(
      matches,
      forecasts,
      measurements,
      location,
      index,
      lang,
      {} // mock request
    )
    expect(result).toEqual({
      forecastNum: 0,
      nearestLocationsRange: [],
      airQuality: undefined,
      latlon: {}
    })
  })

  it('should filter and sort nearest locations correctly', () => {
    measurements = [
      {
        location: { coordinates: [51.5074, -0.1278] },
        pollutants: {
          NO2: { value: 50, time: { date: '2025-01-01T12:00:00Z' } }
        },
        area: 'Area 1',
        areaType: 'Type 1',
        name: 'Location 1',
        updated: '2025-01-01T12:00:00Z'
      }
    ]
    const result = getNearestLocation(
      matches,
      forecasts,
      measurements,
      location,
      index,
      lang,
      {} // mock request
    )
    expect(result.nearestLocationsRange).toHaveLength(1)
    expect(result.nearestLocationsRange[0]).toHaveProperty(
      'pollutants.NO2.value',
      50
    )
  })
})
