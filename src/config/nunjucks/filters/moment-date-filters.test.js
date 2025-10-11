import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  addMomentFilters,
  addDaysToTodayAbrev,
  addDaysToTodayAbrevWelsh
} from './moment-date-filters.js'

describe('moment-date-filters', () => {
  let mockEnv

  beforeEach(() => {
    mockEnv = {
      addFilter: vi.fn()
    }
  })

  describe('addMomentFilters', () => {
    it('should add all date filters to nunjucks environment', () => {
      // ''
      addMomentFilters(mockEnv)

      expect(mockEnv.addFilter).toHaveBeenCalledWith(
        'govukDate',
        expect.any(Function)
      )
      expect(mockEnv.addFilter).toHaveBeenCalledWith(
        'govukDateHour',
        expect.any(Function)
      )
      expect(mockEnv.addFilter).toHaveBeenCalledWith(
        'date',
        expect.any(Function)
      )
      expect(mockEnv.addFilter).toHaveBeenCalledWith(
        'minusOneHour',
        expect.any(Function)
      )
    })

    it('should execute filter functions successfully', () => {
      // ''
      let capturedFilter
      const mockEnvCapture = {
        addFilter: vi.fn((name, fn) => {
          if (name === 'govukDate') {
            capturedFilter = fn
          }
        })
      }

      addMomentFilters(mockEnvCapture)

      if (capturedFilter) {
        const result = capturedFilter('2023-10-11')
        expect(result).toBeDefined()
      }
    })

    it('should handle errors gracefully', () => {
      // ''
      const errorEnv = {
        addFilter: vi.fn(() => {
          throw new Error('Test error')
        })
      }

      const result = addMomentFilters(errorEnv)

      expect(result).toBeInstanceOf(Error)
    })
  })

  describe('addDaysToTodayAbrev', () => {
    it('should add addDaysToTodayAbrev filter to environment', () => {
      // ''
      addDaysToTodayAbrev(mockEnv)

      expect(mockEnv.addFilter).toHaveBeenCalledWith(
        'addDaysToTodayAbrev',
        expect.any(Function)
      )
    })

    it('should handle invalid environment and return error', () => {
      // ''
      const result = addDaysToTodayAbrev(null)

      expect(result).toBeInstanceOf(Error)
    })

    it('should handle environment without addFilter method', () => {
      // ''
      const invalidEnv = {}
      const result = addDaysToTodayAbrev(invalidEnv)

      expect(result).toBeInstanceOf(Error)
    })
  })

  describe('addDaysToTodayAbrevWelsh', () => {
    it('should add addDaysToTodayAbrevWelsh filter to environment', () => {
      // ''
      addDaysToTodayAbrevWelsh(mockEnv)

      expect(mockEnv.addFilter).toHaveBeenCalledWith(
        'addDaysToTodayAbrevWelsh',
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

      const result = addDaysToTodayAbrevWelsh(errorEnv)

      expect(result).toBeInstanceOf(Error)
    })
  })
})
