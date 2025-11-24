import { describe, it, expect, vi, beforeEach } from 'vitest'
import moment from 'moment-timezone'
import {
  addMomentFilters,
  addDaysToTodayAbrev,
  addDaysToTodayAbrevWelsh,
  addDaysToTodayFull,
  addDaysToTodayFullWelsh,
  __logger // ''
} from './moment-date-filters.js'
import * as momentDateFiltersModule from './moment-date-filters.js' // ''

// Mock moment-timezone
vi.mock('moment-timezone', () => {
  const mockMoment = vi.fn(() => ({
    tz: vi.fn().mockReturnThis(),
    format: vi.fn(() => '20 March 2024'),
    subtract: vi.fn(function (hours, unit) { return this }), // ''
    add: vi.fn().mockReturnThis(),
    locale: vi.fn().mockReturnThis(),
    calendar: vi.fn(() => '20 March 2024 AM')
  }))
  mockMoment.tz = vi.fn(() => ({
    format: vi.fn(() => '20 March 2024')
  }))
  return { default: mockMoment }
})

// Mock logger at module level
vi.mock('../../../server/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    error: vi.fn(), // ''
    info: vi.fn(), // ''
    warn: vi.fn(), // ''
    debug: vi.fn() // ''
  })
}))

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

    it('should format calendar string with lowercase am/pm', () => {
      addMomentFilters(mockEnv)
      const minusOneHourFilter = mockEnv.addFilter.mock.calls.find(
        (call) => call[0] === 'minusOneHour'
      )[1]

      const mockMomentObj = {
        subtract: vi.fn().mockReturnThis(),
        calendar: vi.fn().mockReturnValue('20 March 2024 AM')
      }
      // Simulate subtract being called with 1.56
      mockMomentObj.subtract.mockImplementation(function (hours, unit) {
        return this
      })
      minusOneHourFilter(mockMomentObj)
      expect(mockMomentObj.subtract).toHaveBeenCalledWith(1.56, 'hours') // ''
      const result = minusOneHourFilter(mockMomentObj)
      expect(result).toBe('20 March 2024 am')
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

    it('should default days to 0 if not a number', () => {
      addDaysToTodayAbrev(mockEnv)
      const filterFunction = mockEnv.addFilter.mock.calls.find(
        (call) => call[0] === 'addDaysToTodayAbrev'
      )[1]

      const mockMomentObj = {
        locale: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
        format: vi.fn().mockReturnValue('Mon')
      }
      vi.mocked(moment).mockReturnValue(mockMomentObj)

      const result = filterFunction('notANumber')
      expect(mockMomentObj.add).toHaveBeenCalledWith(0, 'days')
      expect(result).toBe('Mon')
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

    it('should log error for invalid environment', () => {
      vi.spyOn(__logger, 'error')
      const result = addDaysToTodayAbrev(null)
      expect(__logger.error).toHaveBeenCalled() // ''
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

    it('should default days to 0 if not a number', () => {
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

      const result = filterFunction('notANumber')
      expect(mockMomentObj.add).toHaveBeenCalledWith(0, 'days')
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

  describe('addDaysToTodayFull', () => {
    it('should add addDaysToTodayFull filter to environment', () => {
      const result = addDaysToTodayFull(mockEnv)
      expect(mockEnv.addFilter).toHaveBeenCalledWith(
        'addDaysToTodayFull',
        expect.any(Function)
      )
      expect(result).toBe(mockEnv)
    })

    it('should create filter that adds days and returns full day name', () => {
      addDaysToTodayFull(mockEnv)
      const filterFunction = mockEnv.addFilter.mock.calls.find(
        (call) => call[0] === 'addDaysToTodayFull'
      )[1]

      const mockMomentObj = {
        locale: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
        format: vi.fn().mockReturnValue('Wednesday')
      }
      vi.mocked(moment).mockReturnValue(mockMomentObj)

      const result = filterFunction(3)
      expect(mockMomentObj.locale).toHaveBeenCalledWith('en')
      expect(mockMomentObj.add).toHaveBeenCalledWith(3, 'days')
      expect(mockMomentObj.format).toHaveBeenCalledWith('dddd')
      expect(result).toBe('Wednesday')
    })

    it('should default days to 0 if not a number', () => {
      addDaysToTodayFull(mockEnv)
      const filterFunction = mockEnv.addFilter.mock.calls.find(
        (call) => call[0] === 'addDaysToTodayFull'
      )[1]

      const mockMomentObj = {
        locale: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
        format: vi.fn().mockReturnValue('Monday')
      }
      vi.mocked(moment).mockReturnValue(mockMomentObj)

      const result = filterFunction(undefined)
      expect(mockMomentObj.add).toHaveBeenCalledWith(0, 'days')
      expect(result).toBe('Monday')
    })

    it('should handle errors during filter registration', () => {
      const errorEnv = {
        addFilter: vi.fn(() => {
          throw new Error('Registration error')
        })
      }
      const result = addDaysToTodayFull(errorEnv)
      expect(result).toBeInstanceOf(Error)
    })

    it('should log error for invalid environment', () => {
      vi.spyOn(__logger, 'error')
      const result = addDaysToTodayFull(null)
      expect(__logger.error).toHaveBeenCalled() // ''
      expect(result).toBeInstanceOf(Error)
    })
  })

  describe('addDaysToTodayFullWelsh', () => {
    it('should add addDaysToTodayFullWelsh filter to environment', () => {
      const result = addDaysToTodayFullWelsh(mockEnv)
      expect(mockEnv.addFilter).toHaveBeenCalledWith(
        'addDaysToTodayFullWelsh',
        expect.any(Function)
      )
      expect(result).toBe(mockEnv)
    })

    it('should create filter that adds days and returns full day name in Welsh', () => {
      addDaysToTodayFullWelsh(mockEnv)
      const filterFunction = mockEnv.addFilter.mock.calls.find(
        (call) => call[0] === 'addDaysToTodayFullWelsh'
      )[1]

      const mockMomentObj = {
        locale: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
        format: vi.fn().mockReturnValue('Dydd Mercher')
      }
      vi.mocked(moment).mockReturnValue(mockMomentObj)

      const result = filterFunction(4)
      expect(mockMomentObj.locale).toHaveBeenCalledWith('cy')
      expect(mockMomentObj.add).toHaveBeenCalledWith(4, 'days')
      expect(mockMomentObj.format).toHaveBeenCalledWith('dddd')
      expect(result).toBe('Dydd Mercher')
    })

    it('should default days to 0 if not a number', () => {
      addDaysToTodayFullWelsh(mockEnv)
      const filterFunction = mockEnv.addFilter.mock.calls.find(
        (call) => call[0] === 'addDaysToTodayFullWelsh'
      )[1]

      const mockMomentObj = {
        locale: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
        format: vi.fn().mockReturnValue('Dydd Llun')
      }
      vi.mocked(moment).mockReturnValue(mockMomentObj)

      const result = filterFunction(undefined)
      expect(mockMomentObj.add).toHaveBeenCalledWith(0, 'days')
      expect(result).toBe('Dydd Llun')
    })

    it('should handle errors during filter registration', () => {
      const errorEnv = {
        addFilter: vi.fn(() => {
          throw new Error('Registration error')
        })
      }
      const result = addDaysToTodayFullWelsh(errorEnv)
      expect(result).toBeInstanceOf(Error)
    })
  })
})