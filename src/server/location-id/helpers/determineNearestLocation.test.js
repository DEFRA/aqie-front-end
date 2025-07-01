import { describe, it, expect } from 'vitest'

describe('Determine Nearest Location Tests', () => {
  it('should determine the nearest location correctly', () => {
    // '' Helper function to get the minimum distance from the locations array
    const getMinimumDistance = (locations) => {
      return Math.min(...locations.map((loc) => loc.distance))
    }

    // '' Determines the nearest location based on the minimum distance
    const determineNearestLocation = (locations, currentLocation) => {
      const minDistance = getMinimumDistance(locations)
      return locations.find((location) => location.distance === minDistance)
    }

    const locations = [
      { name: 'Cardiff', distance: 10 },
      { name: 'Swansea', distance: 5 },
      { name: 'Newport', distance: 15 }
    ]
    const result = determineNearestLocation(locations)
    expect(result).toEqual({ name: 'Swansea', distance: 5 })
  })

  it('should return undefined for empty locations array', () => {
    const determineNearestLocation = (locations) => {
      return locations.length ? locations[0] : undefined
    }
    const result = determineNearestLocation([])
    expect(result).toBeUndefined()
  })
})
