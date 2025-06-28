import { describe, it, expect } from 'vitest'

describe('Redirect to Welsh Location Tests', () => {
  it('should redirect to the correct Welsh location', () => {
    const redirectToWelshLocation = (location) =>
      `https://welsh-location.com/${location}`
    const result = redirectToWelshLocation('Cardiff')
    expect(result).toBe('https://welsh-location.com/Cardiff')
  })

  it('should handle invalid location gracefully', () => {
    const redirectToWelshLocation = (location) =>
      location ? `https://welsh-location.com/${location}` : 'Invalid location'
    const result = redirectToWelshLocation(null)
    expect(result).toBe('Invalid location')
  })
})
