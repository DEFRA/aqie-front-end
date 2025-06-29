import { describe, it, expect } from 'vitest'

describe('Match Location ID Tests', () => {
  it('should match location ID correctly', () => {
    const matchLocationId = (id, locations) =>
      locations.find((location) => location.id === id)
    const locations = [
      { id: 1, name: 'Cardiff' },
      { id: 2, name: 'Swansea' }
    ]
    const result = matchLocationId(1, locations)
    expect(result).toEqual({ id: 1, name: 'Cardiff' })
  })

  it('should return undefined for non-existent ID', () => {
    const matchLocationId = (id, locations) =>
      locations.find((location) => location.id === id)
    const locations = [
      { id: 1, name: 'Cardiff' },
      { id: 2, name: 'Swansea' }
    ]
    const result = matchLocationId(3, locations)
    expect(result).toBeUndefined()
  })
})
