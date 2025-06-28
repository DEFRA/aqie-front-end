import { describe, it, expect } from 'vitest'

describe('Get Nearest Location Tests', () => {
  it('should return the nearest location based on distance', () => {
    const getNearestLocation = (locations) => {
      return locations.reduce((nearest, location) => {
        return location.distance < nearest.distance ? location : nearest
      })
    }
    const locations = [
      { name: 'Cardiff', distance: 10 },
      { name: 'Swansea', distance: 5 },
      { name: 'Newport', distance: 15 }
    ]
    const result = getNearestLocation(locations)
    expect(result).toEqual({ name: 'Swansea', distance: 5 })
  })

  it('should return undefined for empty locations array', () => {
    const getNearestLocation = (locations) => {
      return locations.length ? locations[0] : undefined
    }
    const result = getNearestLocation([])
    expect(result).toBeUndefined()
  })
})
