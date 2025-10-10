import { describe, it, expect, vi } from 'vitest'
import { handleSingleMatchTest } from './handle-single-match-helper.js'

// Mock the middleware-helpers
vi.mock('./middleware-helpers.js', () => ({
  handleSingleMatch: vi.fn()
}))

describe('handle-single-match-helper', () => {
  describe('handleSingleMatchTest', () => {
    it('should return match when match is provided', () => {
      const match = { id: 1, name: 'Test Match' }
      const result = handleSingleMatchTest(match)
      expect(result).toEqual(match)
    })

    it('should return null when match is null', () => {
      const result = handleSingleMatchTest(null)
      expect(result).toBeNull()
    })

    it('should return null when match is undefined', () => {
      const result = handleSingleMatchTest(undefined)
      expect(result).toBeNull()
    })
  })
})
