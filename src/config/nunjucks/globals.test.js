import { describe, it, expect } from 'vitest'
import { assign } from './globals.js'
import lodashAssign from 'lodash/assign.js'

describe('Nunjucks Globals', () => {
  describe('assign export', () => {
    it('should export lodash assign function', () => {
      expect(assign).toBeDefined()
      expect(assign).toBe(lodashAssign)
      expect(typeof assign).toBe('function')
    })

    it('should work as lodash assign', () => {
      const target = { a: 1 }
      const source = { b: 2 }
      const result = assign(target, source)

      expect(result).toEqual({ a: 1, b: 2 })
      expect(result).toBe(target) // lodash assign modifies target
    })

    it('should handle multiple source objects', () => {
      const target = {}
      const source1 = { a: 1 }
      const source2 = { b: 2 }
      const source3 = { c: 3 }

      const result = assign(target, source1, source2, source3)

      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('should handle empty objects', () => {
      const target = {}
      const source = {}
      const result = assign(target, source)

      expect(result).toEqual({})
    })

    it('should handle undefined sources', () => {
      const target = { a: 1 }
      const result = assign(target, undefined)

      expect(result).toEqual({ a: 1 })
    })

    it('should handle null sources', () => {
      const target = { a: 1 }
      const result = assign(target, null)

      expect(result).toEqual({ a: 1 })
    })

    it('should overwrite existing properties', () => {
      const target = { a: 1, b: 2 }
      const source = { a: 3, c: 4 }
      const result = assign(target, source)

      expect(result).toEqual({ a: 3, b: 2, c: 4 })
    })

    it('should handle nested objects', () => {
      const target = { nested: { a: 1 } }
      const source = { nested: { b: 2 } }
      const result = assign(target, source)

      // lodash assign does shallow merge, so nested object is replaced
      expect(result.nested).toEqual({ b: 2 })
      expect(result.nested).not.toHaveProperty('a')
    })
  })
})
