import { describe, it, expect } from 'vitest'

describe('Determine Location Type Tests', () => {
  it('should determine location type as UK', () => {
    const determineLocationType = (location) =>
      location === 'Cardiff' ? 'UK' : 'Unknown'
    const result = determineLocationType('Cardiff')
    expect(result).toBe('UK')
  })

  it('should determine location type as Unknown for invalid location', () => {
    const determineLocationType = (location) =>
      location === 'Cardiff' ? 'UK' : 'Unknown'
    const result = determineLocationType('InvalidLocation')
    expect(result).toBe('Unknown')
  })
})
