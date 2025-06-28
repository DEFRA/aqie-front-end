import { describe, it, expect } from 'vitest'

describe('Handle Single Match Helper Tests', () => {
  it('should handle single match correctly', () => {
    const handleSingleMatch = (matches) =>
      matches.length === 1 ? matches[0] : null
    const matches = [{ id: 1, name: 'Cardiff' }]
    const result = handleSingleMatch(matches)
    expect(result).toEqual({ id: 1, name: 'Cardiff' })
  })

  it('should return null for multiple matches', () => {
    const handleSingleMatch = (matches) =>
      matches.length === 1 ? matches[0] : null
    const matches = [
      { id: 1, name: 'Cardiff' },
      { id: 2, name: 'Swansea' }
    ]
    const result = handleSingleMatch(matches)
    expect(result).toBeNull()
  })
})
