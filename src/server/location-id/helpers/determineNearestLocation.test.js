import { describe, it, expect } from 'vitest'

describe('Determine Nearest Location Tests', () => {
  it('should determine the nearest location correctly', () => {
    const determineNearestLocation = (locations, currentLocation) => {
      return locations.find(
        (location) =>
          location.distance ===
          Math.min(...locations.map((loc) => loc.distance))
      )
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
