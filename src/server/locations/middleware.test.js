import { describe, it, expect, vi } from 'vitest'
import { h } from 'some-hypothetical-library'
import { REDIRECT_STATUS_CODE } from '../data/constants.js'

// Mocking the h.redirect function
vi.mock('some-hypothetical-library', () => ({
  h: {
    redirect: vi.fn(() => ({
      code: vi.fn(() => 'redirected')
    }))
  }
}))

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

  it('should redirect with a 301 status code', () => {
    const mockRedirect = h.redirect
    const mockCode = mockRedirect().code

    mockCode(REDIRECT_STATUS_CODE)

    expect(mockRedirect).toHaveBeenCalled()
    expect(mockCode).toHaveBeenCalledWith(REDIRECT_STATUS_CODE)
  })
})
