import { describe, it, expect } from 'vitest'
import { simpleHelper, anotherHelper, validateInput } from './simple-utils.js'

describe('Simple Utils', () => {
  describe('simpleHelper', () => {
    it('should return null for falsy input', () => {
      // ''
      expect(simpleHelper(null)).toBeNull()
      expect(simpleHelper('')).toBeNull()
      expect(simpleHelper(0)).toBeNull()
    })

    it('should convert input to string for truthy input', () => {
      expect(simpleHelper(123)).toBe('123')
      expect(simpleHelper('test')).toBe('test')
      expect(simpleHelper(true)).toBe('true')
    })
  })

  describe('anotherHelper', () => {
    it('should add two numbers', () => {
      expect(anotherHelper(1, 2)).toBe(3)
      expect(anotherHelper(0, 0)).toBe(0)
      expect(anotherHelper(-1, 1)).toBe(0)
    })
  })

  describe('validateInput', () => {
    it('should return true for valid input', () => {
      expect(validateInput('test')).toBe(true)
      expect(validateInput(123)).toBe(true)
      expect(validateInput(0)).toBe(true)
      expect(validateInput('')).toBe(true)
    })

    it('should return false for null or undefined', () => {
      expect(validateInput(null)).toBe(false)
      expect(validateInput(undefined)).toBe(false)
    })
  })
})
