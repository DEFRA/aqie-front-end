import { describe, it, expect } from 'vitest'

describe('Error Controller Tests', () => {
  it('should handle error correctly', () => {
    const handleError = (error) => (error ? 'Error Occurred' : 'No Error')
    const result = handleError(true)
    expect(result).toBe('Error Occurred')
  })

  it('should return no error for false input', () => {
    const handleError = (error) => (error ? 'Error Occurred' : 'No Error')
    const result = handleError(false)
    expect(result).toBe('No Error')
  })
})
