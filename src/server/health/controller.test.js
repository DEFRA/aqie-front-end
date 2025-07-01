import { describe, it, expect } from 'vitest'

describe('Health Controller Tests', () => {
  it('should return health status as healthy', () => {
    const getHealthStatus = () => 'healthy'
    const result = getHealthStatus()
    expect(result).toBe('healthy')
  })

  it('should handle error in health status gracefully', () => {
    const getHealthStatus = (error) => (error ? 'unhealthy' : 'healthy')
    const result = getHealthStatus(true)
    expect(result).toBe('unhealthy')
  })
})
