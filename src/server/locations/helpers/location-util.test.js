import {
  pointsInRange,
  getNearLocation,
  orderByDistance,
  convertPointToLonLat,
  coordinatesTotal
} from '~/src/server/locations/helpers/location-util'
import * as geolib from 'geolib'
import OsGridRef from 'mt-osgridref'
import { createLogger } from '~/src/server/common/helpers/logging/logger'

jest.mock('geolib', () => ({
  isPointWithinRadius: jest.fn(),
  findNearest: jest.fn(),
  orderByDistance: jest.fn(),
  convertPointToLonLat: jest.fn(),
  coordinatesTotal: jest.fn()
}))
jest.mock('~/src/server/common/helpers/logging/logger', () => ({
  createLogger: jest.fn(() => ({
    error: jest.fn(),
    info: jest.fn()
  }))
}))
jest.mock('mt-osgridref')
const logger = createLogger()

describe('pointsInRange', () => {
  it('should return true if points are within range', () => {
    const point1 = { lat: 51.5074, lon: -0.1278 }
    const point2 = { latitude: 51.5074, longitude: -0.1278 }
    geolib.isPointWithinRadius.mockReturnValue(true)

    const result = pointsInRange(point1, point2)
    expect(result).toBe(true)
  })

  it('should return false if points are not within range', () => {
    const point1 = { lat: 51.5074, lon: -0.1278 }
    const point2 = { latitude: 48.8566, longitude: 2.3522 }
    jest.spyOn(geolib, 'isPointWithinRadius').mockReturnValue(false)

    const result = pointsInRange(point1, point2)
    expect(result).toBe(false)
  })
})

describe('getNearLocation', () => {
  it('should return nearest location', () => {
    const lat = 51.5074
    const lon = -0.1278
    const forecastCoordinates = [{ latitude: 51.5074, longitude: -0.1278 }]
    const forecasts = [{ location: { coordinates: [51.5074, -0.1278] } }]
    geolib.findNearest.mockReturnValue({
      latitude: 51.5074,
      longitude: -0.1278
    })

    const result = getNearLocation(lat, lon, forecastCoordinates, forecasts)
    expect(result).toEqual(forecasts)
  })

  it.skip('should log error and return empty array if getLocation is missing latitude or longitude', () => {
    const lat = 51.5074
    const lon = -0.1278
    const forecastCoordinates = [{ latitude: 51.5074, longitude: -0.1278 }]
    geolib.findNearest.mockReturnValue({
      latitude: undefined,
      longitude: undefined
    })

    const result = getNearLocation(lat, lon, forecastCoordinates, [])
    expect(logger.error).toHaveBeenCalledWith(
      'getLocation is undefined or missing properties'
    )
    expect(result).toEqual([])
  })
  it.skip('should log error and return empty array if an exception occurs', () => {
    const lat = 51.5074
    const lon = -0.1278
    const forecastCoordinates = [{ latitude: 51.5074, longitude: -0.1278 }]
    const error = new Error('Test error')
    geolib.findNearest.mockImplementation(() => {
      throw error
    })

    const result = getNearLocation(lat, lon, forecastCoordinates, [])
    expect(logger.error).toHaveBeenCalledWith(
      `Failed to fetch getNearLocation: ${JSON.stringify(error.message)}`
    )
    expect(result).toEqual([])
  })
})

describe('orderByDistance', () => {
  it('should return locations ordered by distance', () => {
    const lat = 51.5074
    const lon = -0.1278
    const forecastCoordinates = [{ latitude: 51.5074, longitude: -0.1278 }]
    const orderedLocations = [{ latitude: 51.5074, longitude: -0.1278 }]
    jest.spyOn(geolib, 'orderByDistance').mockReturnValue(orderedLocations)

    const result = orderByDistance(lat, lon, forecastCoordinates)
    expect(result).toEqual(orderedLocations)
  })
})

describe('convertPointToLonLat', () => {
  it('should convert UK location points to lat/lon', () => {
    const matches = [
      { GAZETTEER_ENTRY: { GEOMETRY_X: 123456, GEOMETRY_Y: 654321 } }
    ]
    const location = 'uk-location'
    const index = 0
    const latlon = { _lat: 51.5074, _lon: -0.1278 }
    OsGridRef.osGridToLatLong.mockReturnValue(latlon)

    const result = convertPointToLonLat(matches, location, index)
    expect(result).toEqual({ lat: 51.5074, lon: -0.1278 })
  })

  it.skip('should log error and return empty lat/lon if an exception occurs', () => {
    const matches = [{ xCoordinate: 123456, yCoordinate: 654321 }]
    const location = 'ni-location'
    const index = 0
    const error = new Error('Test error')
    OsGridRef.mockImplementation(() => {
      throw error
    })

    const result = convertPointToLonLat(matches, location, index)
    expect(logger.error).toHaveBeenCalledWith(
      `Failed to fetch convertPointToLonLat matches\n.reduce: ${JSON.stringify(error.message)}`
    )
    expect(result).toEqual({ lat: '', lon: '' })
  })
})

describe('coordinatesTotal', () => {
  it('should return coordinates from matches', () => {
    const matches = [{ location: { coordinates: [51.5074, -0.1278] } }]
    const result = coordinatesTotal(matches)

    expect(result).toEqual([{ latitude: 51.5074, longitude: -0.1278 }])
  })

  it.skip('should log error and return empty array if an exception occurs', () => {
    const matches = null
    const error = new Error('Test error')
    jest.spyOn(Array.prototype, 'reduce').mockImplementation(() => {
      throw error
    })

    const result = coordinatesTotal(matches)
    expect(logger.error).toHaveBeenCalledWith(
      `Failed to fetch coordinatesTotal matches\n.reduce: "${error}"`
    )
    expect(result).toEqual([])
  })
})
