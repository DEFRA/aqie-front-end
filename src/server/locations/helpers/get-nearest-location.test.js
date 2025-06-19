import { getNearestLocation } from './get-nearest-location'
import * as geolib from 'geolib'
import moment from 'moment-timezone'
import {
  getNearLocation,
  convertPointToLonLat,
  coordinatesTotal,
  pointsInRange
} from '~/src/server/locations/helpers/location-util.js'
import { getPollutantLevelCy } from '~/src/server/locations/helpers/cy/pollutant-level-calculation'
import { LANG_CY } from '~/src/server/data/constants'

jest.mock('geolib')
jest.mock('moment-timezone')
jest.mock('~/src/server/locations/helpers/location-util.js')
jest.mock('~/src/server/locations/helpers/pollutant-level-calculation')
jest.mock('~/src/server/locations/helpers/cy/pollutant-level-calculation')

describe('getNearestLocation', () => {
  it('should return nearest location data when matches are provided', () => {
    const matches = [{ id: 'match1' }]
    const forecasts = [{ id: 'forecast1' }]
    const measurements = [{ id: 'measurement1' }]
    const location = { lat: 51.5074, lon: -0.1278 }
    const index = 0
    const lang = LANG_CY

    convertPointToLonLat.mockReturnValue({ lat: 51.5074, lon: -0.1278 })
    coordinatesTotal.mockReturnValue([
      { latitude: 51.5074, longitude: -0.1278 }
    ])
    getNearLocation.mockReturnValue([{ forecast: [{ day: 'Mon', value: 10 }] }])
    geolib.orderByDistance.mockReturnValue([
      { latitude: 51.5074, longitude: -0.1278 }
    ])
    pointsInRange.mockReturnValue(true)
    getPollutantLevelCy.mockReturnValue({ getDaqi: 1, getBand: 'Low' })

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
    expect(result).toHaveProperty('latlon')
  })

  it('should return empty data when matches are not provided', () => {
    const matches = []
    const forecasts = []
    const measurements = []
    const location = { lat: 51.5074, lon: -0.1278 }
    const index = 0
    const lang = LANG_CY

    const result = getNearestLocation(
      matches,
      forecasts,
      measurements,
      location,
      index,
      lang
    )

    expect(result.forecastNum).toBe(0)
    expect(result.nearestLocationsRange).toEqual([])
    expect(result.latlon).toEqual({})
  })

  it('should handle pollutants correctly', () => {
    const matches = [{ id: 'match1' }]
    const forecasts = [{ id: 'forecast1' }]
    const measurements = [
      {
        location: { coordinates: [51.5074, -0.1278] },
        pollutants: {
          NO2: { value: 20, time: { date: '2025-06-17T00:00:00Z' } },
          PM10: { value: null, time: { date: '2025-06-17T00:00:00Z' } }
        }
      }
    ]
    const location = { lat: 51.5074, lon: -0.1278 }
    const index = 0
    const lang = LANG_CY

    convertPointToLonLat.mockReturnValue({ lat: 51.5074, lon: -0.1278 })
    coordinatesTotal.mockReturnValue([
      { latitude: 51.5074, longitude: -0.1278 }
    ])
    getNearLocation.mockReturnValue([{ forecast: [{ day: 'Mon', value: 10 }] }])
    geolib.orderByDistance.mockReturnValue([
      { latitude: 51.5074, longitude: -0.1278 }
    ])
    pointsInRange.mockReturnValue(true)
    getPollutantLevelCy.mockReturnValue({ getDaqi: 1, getBand: 'Low' })
    moment.mockImplementation(() => ({ format: jest.fn(() => 'formatted') }))

    const result = getNearestLocation(
      matches,
      forecasts,
      measurements,
      location,
      index,
      lang
    )

    expect(result.nearestLocationsRange[0].pollutants).toHaveProperty('NO2')
    expect(result.nearestLocationsRange[0].pollutants.NO2).toHaveProperty(
      'value',
      20
    )
    expect(result.nearestLocationsRange[0].pollutants.NO2).toHaveProperty(
      'daqi',
      1
    )
    expect(result.nearestLocationsRange[0].pollutants.NO2).toHaveProperty(
      'band',
      'Low'
    )
  })
})
