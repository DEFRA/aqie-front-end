import {
  pointsInRange,
  getNearLocation,
  orderByDistance,
  convertPointToLonLat,
  coordinatesTotal
} from './location-util'
import * as geolib from 'geolib'
import OsGridRef from 'mt-osgridref'

vi.mock('geolib', () => ({
  isPointWithinRadius: vi.fn(),
  findNearest: vi.fn(),
  orderByDistance: vi.fn(),
  convertPointToLonLat: vi.fn(),
  coordinatesTotal: vi.fn()
}))
vi.mock('mt-osgridref')

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
    vi.spyOn(geolib, 'isPointWithinRadius').mockReturnValue(false)

    const result = pointsInRange(point1, point2)
    expect(result).toBe(false)
  })
})

describe('getNearLocation', () => {
  it('should return nearest location', () => {
    // ''
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

  it('should return empty array when getLocation is undefined', () => {
    // ''
    const lat = 51.5074
    const lon = -0.1278
    const forecastCoordinates = [{ latitude: 51.5074, longitude: -0.1278 }]
    const forecasts = [{ location: { coordinates: [51.5074, -0.1278] } }]
    geolib.findNearest.mockReturnValue(undefined)

    const result = getNearLocation(lat, lon, forecastCoordinates, forecasts)
    expect(result).toEqual([])
  })

  it('should return empty array when getLocation missing latitude', () => {
    // ''
    const lat = 51.5074
    const lon = -0.1278
    const forecastCoordinates = [{ latitude: 51.5074, longitude: -0.1278 }]
    const forecasts = [{ location: { coordinates: [51.5074, -0.1278] } }]
    geolib.findNearest.mockReturnValue({ longitude: -0.1278 })

    const result = getNearLocation(lat, lon, forecastCoordinates, forecasts)
    expect(result).toEqual([])
  })

  it('should handle error in findNearest and return empty array', () => {
    // ''
    const lat = 51.5074
    const lon = -0.1278
    const forecastCoordinates = [{ latitude: 51.5074, longitude: -0.1278 }]
    const forecasts = [{ location: { coordinates: [51.5074, -0.1278] } }]
    geolib.findNearest.mockImplementation(() => {
      throw new Error('findNearest error')
    })

    const result = getNearLocation(lat, lon, forecastCoordinates, forecasts)
    expect(result).toEqual([])
  })

  it('should return empty array when lat or lon is missing', () => {
    // ''
    const forecastCoordinates = [{ latitude: 51.5074, longitude: -0.1278 }]
    const forecasts = [{ location: { coordinates: [51.5074, -0.1278] } }]

    const result = getNearLocation(null, null, forecastCoordinates, forecasts)
    expect(result).toEqual([])
  })
})

describe('orderByDistance', () => {
  it('should return locations ordered by distance', () => {
    const lat = 51.5074
    const lon = -0.1278
    const forecastCoordinates = [{ latitude: 51.5074, longitude: -0.1278 }]
    const orderedLocations = [{ latitude: 51.5074, longitude: -0.1278 }]
    vi.spyOn(geolib, 'orderByDistance').mockReturnValue(orderedLocations)

    const result = orderByDistance(lat, lon, forecastCoordinates)
    expect(result).toEqual(orderedLocations)
  })
})

describe('convertPointToLonLat', () => {
  it('should convert UK location points to lat/lon', () => {
    // ''
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

  it('should convert NI location points using xCoordinate/yCoordinate', () => {
    // '' xCoordinate/yCoordinate are already in Lat/Long format, not Grid
    const matches = [
      {
        xCoordinate: -6.1278,
        yCoordinate: 54.5074,
        GAZETTEER_ENTRY: { LONGITUDE: 999, LATITUDE: 888 }
      }
    ]
    const location = 'ni-location'
    const index = 0

    const result = convertPointToLonLat(matches, location, index)
    expect(result).toEqual({ lat: 54.5074, lon: -6.1278 })
  })

  it('should convert NI location using LONGITUDE/LATITUDE when coordinates missing', () => {
    // '' LONGITUDE/LATITUDE are already in Lat/Long format, use directly
    const matches = [
      {
        GAZETTEER_ENTRY: { LONGITUDE: -6.1278, LATITUDE: 54.5074 }
      }
    ]
    const location = 'ni-location'
    const index = 0

    const result = convertPointToLonLat(matches, location, index)
    expect(result).toEqual({ lat: 54.5074, lon: -6.1278 })
  })

  it('should convert NI location using Irish Grid (easting/northing) to WGS84', () => {
    // '' Test Irish Grid (EPSG:29903) to WGS84 conversion using proj4
    const matches = [
      {
        easting: 333500, // Belfast Irish Grid easting
        northing: 374000 // Belfast Irish Grid northing
      }
    ]
    const location = 'ni-location'
    const index = 0

    const result = convertPointToLonLat(matches, location, index)

    // '' Verify conversion to WGS84 coordinates
    expect(result.lat).toBeCloseTo(54.597, 2)
    expect(result.lon).toBeCloseTo(-5.934, 2)
  })

  it('should convert BT93 8AD (Enniskillen) using Irish Grid to WGS84', () => {
    // '' Test with Enniskillen coordinates
    const matches = [
      {
        easting: 322735,
        northing: 358240
      }
    ]
    const location = 'ni-location'
    const index = 0

    const result = convertPointToLonLat(matches, location, index)

    expect(result.lat).toBeCloseTo(54.458, 2)
    expect(result.lon).toBeCloseTo(-6.107, 2)
  })

  it('should handle proj4 error for NI location when using invalid easting/northing', () => {
    // '' Test error handling when converting invalid Irish Grid coordinates
    const matches = [
      {
        easting: 'invalid',
        northing: 'invalid'
      }
    ]
    const location = 'ni-location'
    const index = 0

    const result = convertPointToLonLat(matches, location, index)
    // Should return empty strings when conversion fails
    expect(result).toEqual({ lat: '', lon: '' })
  })
})

describe('coordinatesTotal', () => {
  it('should return coordinates from matches', () => {
    // ''
    const matches = [{ location: { coordinates: [51.5074, -0.1278] } }]
    const result = coordinatesTotal(matches)

    expect(result).toEqual([{ latitude: 51.5074, longitude: -0.1278 }])
  })

  it('should handle error in reduce and return empty array', () => {
    // ''
    const matches = [{ location: null }] // This will cause an error

    const result = coordinatesTotal(matches)

    expect(result).toEqual([])
  })
})
