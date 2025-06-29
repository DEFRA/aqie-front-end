import { describe, it, expect } from 'vitest'

describe('Filter Matches Tests', () => {
  it('should filter matches based on criteria', () => {
    const filterMatches = (matches, criteria) =>
      matches.filter((match) => match.name.includes(criteria))
    const matches = [
      { id: 1, name: 'Cardiff' },
      { id: 2, name: 'Swansea' },
      { id: 3, name: 'Newport' }
    ]
    const result = filterMatches(matches, 'Cardiff')
    expect(result).toEqual([{ id: 1, name: 'Cardiff' }])
  })

  it('should return an empty array for no matching criteria', () => {
    const filterMatches = (matches, criteria) =>
      matches.filter((match) => match.name.includes(criteria))
    const matches = [
      { id: 1, name: 'Cardiff' },
      { id: 2, name: 'Swansea' },
      { id: 3, name: 'Newport' }
    ]
    const result = filterMatches(matches, 'InvalidCriteria')
    expect(result).toEqual([])
  })
})
