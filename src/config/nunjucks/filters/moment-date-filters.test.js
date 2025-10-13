import { describe, it, expect, vi, beforeEach } from 'vitest'
import moment from 'moment-timezone'
import {
  addMomentFilters,
  addDaysToTodayAbrev,
  addDaysToTodayAbrevWelsh
} from './moment-date-filters.js'

// Mock moment-timezone
vi.mock('moment-timezone', () => {
  const mockMoment = vi.fn(() => ({
    tz: vi.fn().mockReturnThis(),
    format: vi.fn(() => '20 March 2024'),
    subtract: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    locale: vi.fn().mockReturnThis()
  }))
  mockMoment.tz = vi.fn(() => ({
    format: vi.fn(() => '20 March 2024')
  }))
  return { default: mockMoment }
})

describe('moment-date-filters', () => {
  let mockEnv

  beforeEach(() => {
    mockEnv = {
      addFilter: vi.fn()
    }
    vi.clearAllMocks()
  })

  describe('addMomentFilters', () => {
    it('should add all date filters to nunjucks environment', () => {
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
      expect(mockEnv.addFilter).toHaveBeenCalledTimes(4)
    })

    it('should handle errors gracefully', () => {
      const errorEnv = {
        addFilter: vi.fn(() => {
          throw new Error('Filter registration failed')
        })
      }

      const result = addMomentFilters(errorEnv)
      expect(result).toBeInstanceOf(Error)
    })
  })

  describe('addDaysToTodayAbrev', () => {
    it('should add addDaysToTodayAbrev filter to environment', () => {
      const result = addDaysToTodayAbrev(mockEnv)

      expect(mockEnv.addFilter).toHaveBeenCalledWith(
        'addDaysToTodayAbrev',
        expect.any(Function)
      )
      expect(result).toBe(mockEnv)
    })

    it('should create filter that adds days to current date', () => {
      addDaysToTodayAbrev(mockEnv)
      const filterFunction = mockEnv.addFilter.mock.calls.find(
        (call) => call[0] === 'addDaysToTodayAbrev'
      )[1]

      const mockMomentObj = {
        locale: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
        format: vi.fn().mockReturnValue('Wed')
      }
      vi.mocked(moment).mockReturnValue(mockMomentObj)

      const result = filterFunction(2)

      expect(mockMomentObj.locale).toHaveBeenCalledWith('en')
      expect(mockMomentObj.add).toHaveBeenCalledWith(2, 'days')
      expect(mockMomentObj.format).toHaveBeenCalledWith('ddd')
      expect(result).toBe('Wed')
    })

    it('should handle errors during filter registration', () => {
      const errorEnv = {
        addFilter: vi.fn(() => {
          throw new Error('Registration error')
        })
      }

      const result = addDaysToTodayAbrev(errorEnv)
      expect(result).toBeInstanceOf(Error)
    })
  })

  describe('addDaysToTodayAbrevWelsh', () => {
    it('should add addDaysToTodayAbrevWelsh filter to environment', () => {
      const result = addDaysToTodayAbrevWelsh(mockEnv)

      expect(mockEnv.addFilter).toHaveBeenCalledWith(
        'addDaysToTodayAbrevWelsh',
        expect.any(Function)
      )
      expect(result).toBe(mockEnv)
    })

    it('should create filter that adds days to current date in Welsh locale', () => {
      addDaysToTodayAbrevWelsh(mockEnv)
      const filterFunction = mockEnv.addFilter.mock.calls.find(
        (call) => call[0] === 'addDaysToTodayAbrevWelsh'
      )[1]

      const mockMomentObj = {
        locale: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
        format: vi.fn().mockReturnValue('Mer')
      }
      vi.mocked(moment).mockReturnValue(mockMomentObj)

      const result = filterFunction(2)

      expect(mockMomentObj.locale).toHaveBeenCalledWith('cy')
      expect(mockMomentObj.add).toHaveBeenCalledWith(2, 'days')
      expect(mockMomentObj.format).toHaveBeenCalledWith('ddd')
      expect(result).toBe('Mer')
    })

    it('should handle errors during filter registration', () => {
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
