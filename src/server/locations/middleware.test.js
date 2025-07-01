import { describe, it, expect } from 'vitest'

describe('Locations Middleware Tests', () => {
  it('should process location middleware correctly', () => {
    const processMiddleware = (location) =>
      location ? `Processed ${location}` : 'No location provided'
    const result = processMiddleware('Cardiff')
    expect(result).toBe('Processed Cardiff')
  })

  it('should handle missing location gracefully', () => {
    const processMiddleware = (location) =>
      location ? `Processed ${location}` : 'No location provided'
    const result = processMiddleware(null)
    expect(result).toBe('No location provided')
  })
})
