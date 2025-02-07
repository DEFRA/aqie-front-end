import * as geolib from 'geolib'
import moment from 'moment-timezone'
import {
  getNearLocation,
  convertPointToLonLat,
  coordinatesTotal,
  pointsInRange
} from '~/src/server/locations/helpers/location-util.js'
// import { getPollutantLevel } from '~/src/server/locations/helpers/pollutant-level-calculation'
// import { getPollutantLevelCy } from '~/src/server/locations/helpers/cy/pollutant-level-calculation'
import { getAirQuality } from '~/src/server/data/en/air-quality.js'
import { getAirQualityCy } from '~/src/server/data/cy/air-quality.js'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'

jest.mock('geolib')
jest.mock('moment-timezone')
jest.mock('~/src/server/locations/helpers/location-util.js')
jest.mock('~/src/server/locations/helpers/pollutant-level-calculation')
jest.mock('~/src/server/locations/helpers/cy/pollutant-level-calculation')
jest.mock('~/src/server/data/en/air-quality.js')
jest.mock('~/src/server/data/cy/air-quality.js')
jest.mock('~/src/server/common/helpers/logging/logger')

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
    moment.tz.mockReturnValue({ format: jest.fn().mockReturnValue('Mon') })
    getAirQuality.mockReturnValue({
      /* mock data */
    })
    getAirQualityCy.mockReturnValue({
      /* mock data */
    })
    createLogger.mockReturnValue({ info: jest.fn() })
  })

  it.skip('should return nearest location data for English language', () => {
    const result = getNearestLocation(
      matches,
      forecasts,
      measurements,
      location,
      index,
      lang
    )
    expect(result).toHaveProperty('forecastNum')
    expect(result).toHaveProperty('nearestLocationsRange')
    expect(result).toHaveProperty('airQuality')
    expect(result).toHaveProperty('latlon')
  })

  it.skip('should return nearest location data for Welsh language', () => {
    lang = LANG_CY
    const result = getNearestLocation(
      matches,
      forecasts,
      measurements,
      location,
      index,
      lang
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
      lang
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
      lang
    )
    expect(result.nearestLocationsRange).toHaveLength(1)
    expect(result.nearestLocationsRange[0]).toHaveProperty(
      'pollutants.NO2.value',
      50
    )
  })
})
