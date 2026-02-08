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
    // ''
    const matches = [
      {
        xCoordinate: 123456,
        yCoordinate: 654321,
        GAZETTEER_ENTRY: { LONGITUDE: 999, LATITUDE: 888 }
      }
    ]
    const location = 'ni-location'
    const index = 0
    const latlon = { _lat: 54.5074, _lon: -6.1278 }
    OsGridRef.osGridToLatLong.mockReturnValue(latlon)

    const result = convertPointToLonLat(matches, location, index)
    expect(result).toEqual({ lat: 54.5074, lon: -6.1278 })
  })

  it('should convert NI location using LONGITUDE/LATITUDE when coordinates missing', () => {
    // ''
    const matches = [
      {
        GAZETTEER_ENTRY: { LONGITUDE: 123456, LATITUDE: 654321 }
      }
    ]
    const location = 'ni-location'
    const index = 0
    const latlon = { _lat: 54.5074, _lon: -6.1278 }
    OsGridRef.osGridToLatLong.mockReturnValue(latlon)

    const result = convertPointToLonLat(matches, location, index)
    expect(result).toEqual({ lat: 54.5074, lon: -6.1278 })
  })

  it('should handle OsGridRef error for NI location', () => {
    // ''
    const matches = [
      {
        GAZETTEER_ENTRY: { LONGITUDE: 'invalid', LATITUDE: 'invalid' }
      }
    ]
    const location = 'ni-location'
    const index = 0
    const latlon = { _lat: 54.5074, _lon: -6.1278 }
    OsGridRef.mockImplementation(() => {
      throw new Error('Invalid coordinates')
    })
    OsGridRef.osGridToLatLong.mockReturnValue(latlon)

    const result = convertPointToLonLat(matches, location, index)
    expect(result).toEqual({ lat: 54.5074, lon: -6.1278 })
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
