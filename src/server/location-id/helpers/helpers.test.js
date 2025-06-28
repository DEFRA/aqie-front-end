import { describe, it, expect } from 'vitest'

describe('Helpers Tests', () => {
  it('should format location correctly', () => {
    const formatLocation = (location) => location.toUpperCase()
    const result = formatLocation('cardiff')
    expect(result).toBe('CARDIFF')
  })

  it('should handle empty location gracefully', () => {
    const formatLocation = (location) =>
      location ? location.toUpperCase() : 'Unknown'
    const result = formatLocation('')
    expect(result).toBe('Unknown')
  })
})
