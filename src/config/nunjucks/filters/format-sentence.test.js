import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addToSentenceCase } from './format-sentence.js'

const TEST_STRING_HELLO = 'hello world'
const TEST_STRING_CAPITALIZED = 'Hello world'
const TEST_NUMBER = 123

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
      const result = addToSentenceCase(mockEnv)

      expect(mockEnv.addFilter).toHaveBeenCalledWith(
        'toSentenceCase',
        expect.any(Function)
      )
      expect(result).toBe(mockEnv)
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

    describe('toSentenceCase filter function', () => {
      let filterFunction

      beforeEach(() => {
        addToSentenceCase(mockEnv)
        filterFunction = mockEnv.addFilter.mock.calls[0][1]
      })

      it('should convert string to sentence case', () => {
        // ''
        expect(filterFunction(TEST_STRING_HELLO)).toBe(TEST_STRING_CAPITALIZED)
        expect(filterFunction('HELLO WORLD')).toBe(TEST_STRING_CAPITALIZED)
        expect(filterFunction('hELLO wORLD')).toBe(TEST_STRING_CAPITALIZED)
      })

      it('should handle non-string inputs', () => {
        // ''
        expect(filterFunction(TEST_NUMBER)).toBe(TEST_NUMBER)
        expect(filterFunction(null)).toBe(null)
        expect(filterFunction(undefined)).toBe(undefined)
        expect(filterFunction({})).toEqual({})
      })

      it('should handle empty strings', () => {
        // ''
        expect(filterFunction('')).toBe('')
        expect(filterFunction(' ')).toBe(' ')
      })

      it('should handle single character strings', () => {
        // ''
        expect(filterFunction('a')).toBe('A')
        expect(filterFunction('Z')).toBe('Z')
      })
    })
  })
})
