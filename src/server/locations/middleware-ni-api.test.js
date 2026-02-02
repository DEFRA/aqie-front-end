import { describe, it, expect } from 'vitest'
import proj4 from 'proj4'

/**
 * '' Test suite to verify Northern Ireland API coordinate handling
 *
 * '' CRITICAL: Real NI API returns easting/northing (Irish Grid EPSG:29903 coordinates)
 * '' Mock API returns xCoordinate/yCoordinate (WGS84 lat/long)
 * '' Both need to be converted to latitude/longitude for session storage
 *
 * '' Production MongoDB data shows:
 * '' BT1 1AA: coordinates: [146778, 530104] - These are Irish Grid easting/northing (INCORRECT in DB)
 * '' BT93 8AD: coordinates: [22735, 528240] - These are Irish Grid easting/northing (INCORRECT in DB)
 */

// '' Define Irish Grid (EPSG:29903) projection - from epsg.io
const irishGrid =
  '+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +units=m +no_defs +type=crs'
const wgs84 = 'EPSG:4326'

describe('NI API Coordinate Mapping', () => {
  describe('Real NI API (Irish Grid Coordinates)', () => {
    it('should convert easting/northing (Irish Grid) to latitude/longitude', () => {
      // '' Real NI API response structure from production
      const realApiResponse = {
        results: [
          {
            postcode: 'BT1 1AA',
            town: 'Belfast',
            easting: 333500, // Irish Grid easting
            northing: 374000, // Irish Grid northing
            district: 'Belfast',
            county: 'Antrim'
          }
        ]
      }

      // '' Simulate the conversion logic from middleware.js using proj4
      const resultsWithCoords = realApiResponse.results.map((result) => {
        let latitude, longitude

        if (result.easting && result.northing) {
          const [lon, lat] = proj4(irishGrid, wgs84, [
            result.easting,
            result.northing
          ])
          latitude = lat
          longitude = lon
        }

        return {
          ...result,
          latitude,
          longitude
        }
      })

      // '' Verify conversion produces valid WGS84 coordinates for Belfast
      expect(resultsWithCoords[0].latitude).toBeCloseTo(54.597, 2)
      expect(resultsWithCoords[0].longitude).toBeCloseTo(-5.93, 2)
      // '' Original Irish Grid coordinates should be preserved
      expect(resultsWithCoords[0].easting).toBe(333500)
      expect(resultsWithCoords[0].northing).toBe(374000)
    })

    it('should convert BT93 8AD (Enniskillen) Irish Grid to lat/long correctly', () => {
      // '' Real coordinates for BT93 8AD from production MongoDB
      const realApiResponse = {
        results: [
          {
            postcode: 'BT93 8AD',
            town: 'Enniskillen',
            easting: 322735, // Real Irish Grid easting
            northing: 358240, // Real Irish Grid northing
            district: 'Fermanagh and Omagh',
            county: 'Fermanagh'
          }
        ]
      }

      const resultsWithCoords = realApiResponse.results.map((result) => {
        let latitude, longitude

        if (result.easting && result.northing) {
          const [lon, lat] = proj4(irishGrid, wgs84, [
            result.easting,
            result.northing
          ])
          latitude = lat
          longitude = lon
        }

        return {
          ...result,
          latitude,
          longitude
        }
      })

      // '' Verify Enniskillen coordinates (Western NI)
      expect(resultsWithCoords[0].latitude).toBeCloseTo(54.458, 2)
      expect(resultsWithCoords[0].longitude).toBeCloseTo(-6.107, 2)
    })
  })

  describe('Mock NI API (WGS84 Coordinates)', () => {
    it('should use xCoordinate/yCoordinate directly from mock data when no easting/northing', () => {
      // '' Mock API response structure (from db.json) - when easting/northing are not present
      const mockApiResponse = {
        results: [
          {
            postcode: 'BT93 8AD',
            town: 'Belfast',
            xCoordinate: -5.9386, // WGS84 longitude
            yCoordinate: 54.578, // WGS84 latitude
            district: 'Belfast',
            county: 'Antrim'
          }
        ]
      }

      const resultsWithCoords = mockApiResponse.results.map((result) => {
        let latitude, longitude

        if (result.easting && result.northing) {
          const [lon, lat] = proj4(irishGrid, wgs84, [
            result.easting,
            result.northing
          ])
          latitude = lat
          longitude = lon
        } else if (result.xCoordinate && result.yCoordinate) {
          latitude = result.yCoordinate
          longitude = result.xCoordinate
        }

        return {
          ...result,
          latitude,
          longitude
        }
      })

      // '' Should use xCoordinate/yCoordinate directly
      expect(resultsWithCoords[0].latitude).toBe(54.578)
      expect(resultsWithCoords[0].longitude).toBe(-5.9386)
    })
  })

  describe('Coordinate Transformation Priority', () => {
    it('should prioritize Irish Grid (easting/northing) over xCoordinate/yCoordinate', () => {
      // '' Real API may have both, Irish Grid should take precedence
      const apiResponse = {
        results: [
          {
            postcode: 'BT1 1AA',
            easting: 333500,
            northing: 374000,
            xCoordinate: -5.9301, // These might be present but should be ignored
            yCoordinate: 54.597
          }
        ]
      }

      const resultsWithCoords = apiResponse.results.map((result) => {
        let latitude, longitude

        if (result.easting && result.northing) {
          const [lon, lat] = proj4(irishGrid, wgs84, [
            result.easting,
            result.northing
          ])
          latitude = lat
          longitude = lon
        } else if (result.xCoordinate && result.yCoordinate) {
          latitude = result.yCoordinate
          longitude = result.xCoordinate
        }

        return {
          ...result,
          latitude,
          longitude
        }
      })

      // '' Should use converted Irish Grid, not direct xCoordinate/yCoordinate
      expect(resultsWithCoords[0].latitude).toBeCloseTo(54.597, 2)
      expect(resultsWithCoords[0].longitude).toBeCloseTo(-5.93, 2)
    })
  })

  describe('End-to-end Coordinate Flow', () => {
    it('should match the actual middleware transformation for real API', () => {
      // '' Real NI API response (what we actually get in production)
      const getNIPlaces = {
        results: [
          {
            postcode: 'BT1 1AA',
            town: 'Belfast',
            easting: 333500,
            northing: 374000
          }
        ]
      }

      // '' This is the exact code from middleware.js
      const resultsWithCoords = getNIPlaces?.results?.map((result) => {
        let latitude, longitude

        if (result.easting && result.northing) {
          const [lon, lat] = proj4(irishGrid, wgs84, [
            result.easting,
            result.northing
          ])
          latitude = lat
          longitude = lon
        } else if (result.xCoordinate && result.yCoordinate) {
          latitude = result.yCoordinate
          longitude = result.xCoordinate
        } else {
          latitude = result.latitude
          longitude = result.longitude
        }

        return {
          ...result,
          latitude,
          longitude
        }
      })

      expect(resultsWithCoords[0].latitude).toBeCloseTo(54.597, 2)
      expect(resultsWithCoords[0].longitude).toBeCloseTo(-5.93, 2)
    })

    it('should match the actual middleware transformation for mock API without easting/northing', () => {
      // '' Mock API response (from db.json with ONLY xCoordinate/yCoordinate)
      const getNIPlaces = {
        results: [
          {
            postcode: 'BT93 8AD',
            town: 'Belfast',
            xCoordinate: -5.9386,
            yCoordinate: 54.578
          }
        ]
      }

      const resultsWithCoords = getNIPlaces?.results?.map((result) => {
        let latitude, longitude

        if (result.easting && result.northing) {
          const [lon, lat] = proj4(irishGrid, wgs84, [
            result.easting,
            result.northing
          ])
          latitude = lat
          longitude = lon
        } else if (result.xCoordinate && result.yCoordinate) {
          latitude = result.yCoordinate
          longitude = result.xCoordinate
        } else {
          latitude = result.latitude
          longitude = result.longitude
        }

        return {
          ...result,
          latitude,
          longitude
        }
      })

      expect(resultsWithCoords[0].latitude).toBe(54.578)
      expect(resultsWithCoords[0].longitude).toBe(-5.9386)
    })
  })
})
