import { describe, it, expect } from 'vitest'
import { govukRebrand } from './index.js'

describe('Nunjucks Globals Index', () => {
  describe('govukRebrand export', () => {
    it('should export govukRebrand as a boolean', () => {
      expect(govukRebrand).toBeDefined()
      expect(typeof govukRebrand).toBe('boolean')
    })

    it('should have govukRebrand set to true', () => {
      expect(govukRebrand).toBe(true)
    })

    it('should be truthy in conditional statements', () => {
      expect(Boolean(govukRebrand)).toBe(true)

      if (govukRebrand) {
        expect(true).toBe(true) // This should execute
      } else {
        expect(false).toBe(true) // This should not execute
      }
    })

    it('should work in template conditions', () => {
      // Simulate how this would be used in nunjucks templates
      const templateCondition = govukRebrand
        ? 'rebrand-active'
        : 'default-styling'
      expect(templateCondition).toBe('rebrand-active')
    })

    it('should be serializable to JSON', () => {
      const serialized = JSON.stringify({ govukRebrand })
      const parsed = JSON.parse(serialized)

      expect(parsed.govukRebrand).toBe(true)
    })
  })
})
