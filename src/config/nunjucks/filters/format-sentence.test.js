import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addToSentenceCase } from './format-sentence.js'

describe('format-sentence', () => {
  let mockEnv

  beforeEach(() => {
    mockEnv = {
      addFilter: vi.fn()
    }
  })

  describe('addToSentenceCase', () => {
    it('should add toSentenceCase filter to environment', () => {
      // ''
      addToSentenceCase(mockEnv)

      expect(mockEnv.addFilter).toHaveBeenCalledWith(
        'toSentenceCase',
        expect.any(Function)
      )
    })

    it('should handle errors during filter registration', () => {
      // ''
      const errorEnv = {
        addFilter: vi.fn(() => {
          throw new Error('Registration error')
        })
      }

      const result = addToSentenceCase(errorEnv)

      expect(result).toBeInstanceOf(Error)
    })
  })
})
