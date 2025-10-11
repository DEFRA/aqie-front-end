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

    describe('toSentenceCase filter function', () => {
      let filterFunction

      beforeEach(() => {
        addToSentenceCase(mockEnv)
        filterFunction = mockEnv.addFilter.mock.calls[0][1]
      })

      it('should convert string to sentence case', () => {
        // ''
        expect(filterFunction('hello world')).toBe('Hello world')
        expect(filterFunction('HELLO WORLD')).toBe('Hello world')
        expect(filterFunction('hELLO wORLD')).toBe('Hello world')
      })

      it('should handle non-string inputs', () => {
        // ''
        expect(filterFunction(123)).toBe(123)
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
