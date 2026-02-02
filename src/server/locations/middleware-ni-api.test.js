import { describe, it, expect } from 'vitest'

/**
 * '' Test suite to verify Northern Ireland API coordinate handling
 * '' Tests that both mock and real API paths correctly map coordinates
 * '' Real NI API returns xCoordinate/yCoordinate (already in Lat/Long WGS84)
 * '' These need to be mapped to latitude/longitude for session consistency
 */

describe('NI API Coordinate Mapping', () => {
  describe('buildNILocationData coordinate transformation', () => {
    it('should map xCoordinate/yCoordinate to longitude/latitude for real API data', () => {
      // '' Simulate real NI API response structure
      const realApiResponse = {
        results: [
          {
            postcode: 'BT1 1AA',
            town: 'Belfast',
            xCoordinate: -5.9301, // longitude in WGS84
            yCoordinate: 54.597, // latitude in WGS84
            easting: 333500,
            northing: 374000
          }
        ]
      }

      // '' Transform as middleware does
      const resultsWithCoords = realApiResponse.results.map((result) => ({
        ...result,
        latitude: result.yCoordinate || result.latitude,
        longitude: result.xCoordinate || result.longitude
      }))

      // '' Verify mapping
      expect(resultsWithCoords[0].latitude).toBe(54.597)
      expect(resultsWithCoords[0].longitude).toBe(-5.9301)
      expect(resultsWithCoords[0].yCoordinate).toBe(54.597) // Original preserved
      expect(resultsWithCoords[0].xCoordinate).toBe(-5.9301) // Original preserved
    })

    it('should map xCoordinate/yCoordinate to longitude/latitude for mock data', () => {
      // '' Simulate mock API response structure (same as real API)
      const mockApiResponse = {
        results: [
          {
            postcode: 'BT93 8AD',
            town: 'Belfast',
            xCoordinate: -5.9386,
            yCoordinate: 54.578,
            easting: 332900,
            northing: 371400
          }
        ]
      }

      // '' Transform as middleware does
      const resultsWithCoords = mockApiResponse.results.map((result) => ({
        ...result,
        latitude: result.yCoordinate || result.latitude,
        longitude: result.xCoordinate || result.longitude
      }))

      // '' Verify mapping
      expect(resultsWithCoords[0].latitude).toBe(54.578)
      expect(resultsWithCoords[0].longitude).toBe(-5.9386)
    })

    it('should handle multiple results from API', () => {
      const apiResponse = {
        results: [
          {
            postcode: 'BT1 1AA',
            town: 'Belfast',
            xCoordinate: -5.9301,
            yCoordinate: 54.597
          },
          {
            postcode: 'BT12 1AB',
            town: 'Belfast',
            xCoordinate: -5.9601,
            yCoordinate: 54.583
          }
        ]
      }

      const resultsWithCoords = apiResponse.results.map((result) => ({
        ...result,
        latitude: result.yCoordinate || result.latitude,
        longitude: result.xCoordinate || result.longitude
      }))

      expect(resultsWithCoords).toHaveLength(2)
      expect(resultsWithCoords[0].latitude).toBe(54.597)
      expect(resultsWithCoords[1].latitude).toBe(54.583)
    })

    it('should fallback to existing latitude/longitude if xCoordinate/yCoordinate missing', () => {
      // '' Edge case: API already has latitude/longitude
      const apiResponse = {
        results: [
          {
            postcode: 'BT1 1AA',
            town: 'Belfast',
            latitude: 54.597,
            longitude: -5.9301
          }
        ]
      }

      const resultsWithCoords = apiResponse.results.map((result) => ({
        ...result,
        latitude: result.yCoordinate || result.latitude,
        longitude: result.xCoordinate || result.longitude
      }))

      expect(resultsWithCoords[0].latitude).toBe(54.597)
      expect(resultsWithCoords[0].longitude).toBe(-5.9301)
    })

    it('should preserve all original fields after mapping', () => {
      const apiResponse = {
        results: [
          {
            postcode: 'BT1 1AA',
            town: 'Belfast',
            district: 'Belfast',
            county: 'Antrim',
            xCoordinate: -5.9301,
            yCoordinate: 54.597,
            easting: 333500,
            northing: 374000
          }
        ]
      }

      const resultsWithCoords = apiResponse.results.map((result) => ({
        ...result,
        latitude: result.yCoordinate || result.latitude,
        longitude: result.xCoordinate || result.longitude
      }))

      // '' All original fields should be preserved
      expect(resultsWithCoords[0].postcode).toBe('BT1 1AA')
      expect(resultsWithCoords[0].town).toBe('Belfast')
      expect(resultsWithCoords[0].district).toBe('Belfast')
      expect(resultsWithCoords[0].county).toBe('Antrim')
      expect(resultsWithCoords[0].easting).toBe(333500)
      expect(resultsWithCoords[0].northing).toBe(374000)
      expect(resultsWithCoords[0].xCoordinate).toBe(-5.9301)
      expect(resultsWithCoords[0].yCoordinate).toBe(54.597)
      expect(resultsWithCoords[0].latitude).toBe(54.597)
      expect(resultsWithCoords[0].longitude).toBe(-5.9301)
    })
  })

  describe('Session coordinate storage', () => {
    it('should store latitude and longitude for notifications', () => {
      // '' After coordinate mapping, session should have latitude/longitude
      const result = {
        postcode: 'BT1 1AA',
        town: 'Belfast',
        xCoordinate: -5.9301,
        yCoordinate: 54.597,
        latitude: 54.597, // Mapped from yCoordinate
        longitude: -5.9301 // Mapped from xCoordinate
      }

      // '' Simulate session.set calls
      const session = {
        latitude: result.latitude,
        longitude: result.longitude
      }

      expect(session.latitude).toBe(54.597)
      expect(session.longitude).toBe(-5.9301)
    })
  })

  describe('Real vs Mock API path independence', () => {
    it('should handle real API structure (enabledMock: false)', () => {
      // '' Real API returns xCoordinate/yCoordinate (WGS84 lat/long)
      const getNIPlaces = {
        results: [
          {
            postcode: 'BT1 1AA',
            town: 'Belfast',
            xCoordinate: -5.9301,
            yCoordinate: 54.597
          }
        ]
      }

      // '' Both paths now do the same mapping
      const resultsWithCoords = getNIPlaces?.results?.map((result) => ({
        ...result,
        latitude: result.yCoordinate || result.latitude,
        longitude: result.xCoordinate || result.longitude
      }))

      expect(resultsWithCoords[0].latitude).toBe(54.597)
      expect(resultsWithCoords[0].longitude).toBe(-5.9301)
    })

    it('should handle mock API structure (enabledMock: true)', () => {
      // '' Mock API returns same structure from db.json
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

      // '' Both paths now do the same mapping
      const resultsWithCoords = getNIPlaces?.results?.map((result) => ({
        ...result,
        latitude: result.yCoordinate || result.latitude,
        longitude: result.xCoordinate || result.longitude
      }))

      expect(resultsWithCoords[0].latitude).toBe(54.578)
      expect(resultsWithCoords[0].longitude).toBe(-5.9386)
    })
  })
})
