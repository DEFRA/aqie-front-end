import { describe, it, expect, vi, beforeEach } from 'vitest'
import moment from 'moment-timezone'
import {
  addMomentFilters,
  addDaysToTodayAbrev,
  addDaysToTodayAbrevWelsh,
  addDaysToTodayFull,
  addDaysToTodayFullWelsh
} from './moment-date-filters.js'

const TEST_DATE = '20 March 2024'
const TEST_ISO_DATE = '2024-03-20'
const TEST_DEFAULT_DAYS_MSG =
  'should default to 0 days when non-number provided'
const TEST_INVALID_ENV_MSG = 'should handle invalid environment'
const TEST_REG_ERROR_MSG = 'should handle errors during filter registration'
const REG_ERROR_MSG = 'Registration error'
const HOURS_TO_SUBTRACT = 1.56

// Mock moment-timezone
vi.mock('moment-timezone', () => {
  const mockMoment = vi.fn(() => ({
    tz: vi.fn().mockReturnThis(),
    format: vi.fn(() => TEST_DATE),
    subtract: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    locale: vi.fn().mockReturnThis()
  }))
  mockMoment.tz = vi.fn(() => ({
    format: vi.fn(() => TEST_DATE)
  }))
  return { default: mockMoment }
})

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
    expect(mockEnv.addFilter).toHaveBeenCalledWith('date', expect.any(Function))
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

  it(TEST_DEFAULT_DAYS_MSG, () => {
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

    const result = filterFunction('invalid')

    expect(mockMomentObj.add).toHaveBeenCalledWith(0, 'days')
    expect(result).toBe('Mon')
  })

  it(TEST_INVALID_ENV_MSG, () => {
    const result = addDaysToTodayAbrev(null)
    expect(result).toBeInstanceOf(Error)
  })

  it(TEST_REG_ERROR_MSG, () => {
    const errorEnv = {
      addFilter: vi.fn(() => {
        throw new Error(REG_ERROR_MSG)
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

  it(TEST_DEFAULT_DAYS_MSG, () => {
    addDaysToTodayAbrevWelsh(mockEnv)
    const filterFunction = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'addDaysToTodayAbrevWelsh'
    )[1]

    const mockMomentObj = {
      locale: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
      format: vi.fn().mockReturnValue('Llun')
    }
    vi.mocked(moment).mockReturnValue(mockMomentObj)

    const result = filterFunction('invalid')

    expect(mockMomentObj.add).toHaveBeenCalledWith(0, 'days')
    expect(result).toBe('Llun')
  })

  it(TEST_INVALID_ENV_MSG, () => {
    const result = addDaysToTodayAbrevWelsh(null)
    expect(result).toBeInstanceOf(Error)
  })

  it(TEST_REG_ERROR_MSG, () => {
    const errorEnv = {
      addFilter: vi.fn(() => {
        throw new Error(REG_ERROR_MSG)
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

    const result = filterFunction(2)

    expect(mockMomentObj.locale).toHaveBeenCalledWith('en')
    expect(mockMomentObj.add).toHaveBeenCalledWith(2, 'days')
    expect(mockMomentObj.format).toHaveBeenCalledWith('dddd')
    expect(result).toBe('Wednesday')
  })

  it(TEST_DEFAULT_DAYS_MSG, () => {
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

    const result = filterFunction('invalid')

    expect(mockMomentObj.add).toHaveBeenCalledWith(0, 'days')
    expect(result).toBe('Monday')
  })

  it(TEST_INVALID_ENV_MSG, () => {
    const result = addDaysToTodayFull(null)
    expect(result).toBeInstanceOf(Error)
  })

  it(TEST_REG_ERROR_MSG, () => {
    const errorEnv = {
      addFilter: vi.fn(() => {
        throw new Error(REG_ERROR_MSG)
      })
    }

    const result = addDaysToTodayFull(errorEnv)
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

    const result = filterFunction(2)

    expect(mockMomentObj.locale).toHaveBeenCalledWith('cy')
    expect(mockMomentObj.add).toHaveBeenCalledWith(2, 'days')
    expect(mockMomentObj.format).toHaveBeenCalledWith('dddd')
    expect(result).toBe('Dydd Mercher')
  })

  it(TEST_DEFAULT_DAYS_MSG, () => {
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

    const result = filterFunction(null)

    expect(mockMomentObj.add).toHaveBeenCalledWith(0, 'days')
    expect(result).toBe('Dydd Llun')
  })

  it(TEST_INVALID_ENV_MSG, () => {
    const result = addDaysToTodayFullWelsh(null)
    expect(result).toBeInstanceOf(Error)
  })

  it(TEST_REG_ERROR_MSG, () => {
    const errorEnv = {
      addFilter: vi.fn(() => {
        throw new Error(REG_ERROR_MSG)
      })
    }

    const result = addDaysToTodayFullWelsh(errorEnv)
    expect(result).toBeInstanceOf(Error)
  })
})

describe('govukDate filter', () => {
  it('govukDate should handle "NOW" string', () => {
    addMomentFilters(mockEnv)
    const govukDateFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'govukDate'
    )[1]

    const mockMomentTz = {
      format: vi.fn().mockReturnValue('20 March 2024')
    }
    vi.mocked(moment.tz).mockReturnValue(mockMomentTz)

    const result = govukDateFilter('NOW')
    expect(result).toBeDefined()
  })

  it('govukDate should format date string', () => {
    addMomentFilters(mockEnv)
    const govukDateFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'govukDate'
    )[1]

    const mockMomentTz = {
      format: vi.fn().mockReturnValue(TEST_DATE)
    }
    vi.mocked(moment.tz).mockReturnValue(mockMomentTz)

    govukDateFilter(TEST_ISO_DATE)
    expect(mockMomentTz.format).toHaveBeenCalledWith('DD MMMM YYYY')
  })
})

describe('govukDateHour filter', () => {
  it('govukDateHour should handle "NOW" string', () => {
    addMomentFilters(mockEnv)
    const govukDateHourFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'govukDateHour'
    )[1]

    const mockMomentTz = {
      format: vi.fn().mockReturnValue('9am, 20, March, 2024')
    }
    vi.mocked(moment.tz).mockReturnValue(mockMomentTz)

    const result = govukDateHourFilter('NOW')
    expect(result).toBeDefined()
  })

  it('govukDateHour should format date with hour', () => {
    addMomentFilters(mockEnv)
    const govukDateHourFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'govukDateHour'
    )[1]

    const mockMoment = {
      format: vi.fn().mockReturnValue('9am, 20, March, 2024')
    }
    vi.mocked(moment).mockReturnValue(mockMoment)

    govukDateHourFilter('2024-03-20T09:00:00')
    expect(mockMoment.format).toHaveBeenCalledWith('ha, DD, MMMM, YYYY')
  })
})

describe('date filter', () => {
  it('date filter should handle "NOW" string', () => {
    addMomentFilters(mockEnv)
    const dateFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'date'
    )[1]

    const mockMomentTz = {
      format: vi.fn().mockReturnValue('2024-03-20')
    }
    vi.mocked(moment.tz).mockReturnValue(mockMomentTz)

    const result = dateFilter('NOW')
    expect(result).toBeDefined()
  })

  it('date filter should return moment object for date string', () => {
    addMomentFilters(mockEnv)
    const dateFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'date'
    )[1]

    const mockMoment = {
      format: vi.fn().mockReturnValue(TEST_ISO_DATE)
    }
    vi.mocked(moment).mockReturnValue(mockMoment)

    const result = dateFilter(TEST_ISO_DATE)
    expect(result).toBeDefined()
  })
})

describe('minusOneHour filter', () => {
  it('minusOneHour should subtract 1.56 hours and format', () => {
    addMomentFilters(mockEnv)
    const minusOneHourFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'minusOneHour'
    )[1]

    const mockMomentObj = {
      subtract: vi.fn().mockReturnThis(),
      calendar: vi.fn().mockReturnValue('Today at 8:00 AM')
    }

    const result = minusOneHourFilter(mockMomentObj)

    expect(mockMomentObj.subtract).toHaveBeenCalledWith(
      HOURS_TO_SUBTRACT,
      'hours'
    )
    expect(result).toBe('Today at 8:00 am')
  })

  it('minusOneHour should replace PM with pm', () => {
    addMomentFilters(mockEnv)
    const minusOneHourFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'minusOneHour'
    )[1]

    const mockMomentObj = {
      subtract: vi.fn().mockReturnThis(),
      calendar: vi.fn().mockReturnValue('Today at 8:00 PM')
    }

    const result = minusOneHourFilter(mockMomentObj)

    expect(result).toBe('Today at 8:00 pm')
  })
})
