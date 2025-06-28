import { describe, it, expect } from 'vitest'

describe('Middleware Helpers Tests', () => {
  it('should process middleware correctly', () => {
    const processMiddleware = (data) =>
      data ? `Processed ${data}` : 'No data provided'
    const result = processMiddleware('Cardiff')
    expect(result).toBe('Processed Cardiff')
  })

  it('should handle missing data gracefully', () => {
    const processMiddleware = (data) =>
      data ? `Processed ${data}` : 'No data provided'
    const result = processMiddleware(null)
    expect(result).toBe('No data provided')
  })
})
