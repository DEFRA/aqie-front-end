import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  addMomentFilters,
  addDaysToTodayAbrev,
  addDaysToTodayAbrevWelsh,
  addDaysToTodayFull,
  addDaysToTodayFullWelsh
} from './moment-date-filters.js'

const TEST_ISO_DATE = '2024-03-20'
const NOW_STRING = 'now'
const TEST_DEFAULT_DAYS_MSG =
  'should default to 0 days when non-number provided'
const TEST_INVALID_ENV_MSG = 'should handle invalid environment'
const TEST_REG_ERROR_MSG = 'should handle errors during filter registration'
const TEST_NO_ADDFILTER_MSG =
  'should handle environment without addFilter function'
const REG_ERROR_MSG = 'Registration error'
const HOURS_TO_SUBTRACT = 1.56
const ABBREVIATED_DAY_LENGTH = 3
const MIN_FULL_DAY_LENGTH = 3

// Mock logger to avoid console spam during tests
vi.mock('../../../server/common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn()
  }))
}))

// DO NOT mock moment-timezone - we need real execution for coverage

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

    const result = filterFunction(2)

    // With real moment, we get a real abbreviated day name
    expect(typeof result).toBe('string')
    expect(result.length).toBe(ABBREVIATED_DAY_LENGTH)
  })

  it(TEST_DEFAULT_DAYS_MSG, () => {
    addDaysToTodayAbrev(mockEnv)
    const filterFunction = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'addDaysToTodayAbrev'
    )[1]

    const result = filterFunction('invalid')

    // When non-number provided, should default to 0 days (today)
    expect(typeof result).toBe('string')
    expect(result.length).toBe(ABBREVIATED_DAY_LENGTH)
  })

  it(TEST_INVALID_ENV_MSG, () => {
    const result = addDaysToTodayAbrev(null)
    expect(result).toBeInstanceOf(Error)
  })

  it(TEST_NO_ADDFILTER_MSG, () => {
    const result = addDaysToTodayAbrev({})
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

    const result = filterFunction(2)

    // With real moment in Welsh locale
    expect(typeof result).toBe('string')
    expect(result.length).toBe(ABBREVIATED_DAY_LENGTH)
  })

  it(TEST_DEFAULT_DAYS_MSG, () => {
    addDaysToTodayAbrevWelsh(mockEnv)
    const filterFunction = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'addDaysToTodayAbrevWelsh'
    )[1]

    const result = filterFunction('invalid')

    // Non-number defaults to 0 days
    expect(typeof result).toBe('string')
    expect(result.length).toBe(ABBREVIATED_DAY_LENGTH)
  })

  it(TEST_INVALID_ENV_MSG, () => {
    const result = addDaysToTodayAbrevWelsh(null)
    expect(result).toBeInstanceOf(Error)
  })

  it(TEST_NO_ADDFILTER_MSG, () => {
    const result = addDaysToTodayAbrevWelsh({})
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

    const result = filterFunction(2)

    // With real moment, full day name
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(MIN_FULL_DAY_LENGTH)
  })

  it(TEST_DEFAULT_DAYS_MSG, () => {
    addDaysToTodayFull(mockEnv)
    const filterFunction = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'addDaysToTodayFull'
    )[1]

    const result = filterFunction('not a number')

    // Non-number defaults to 0
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(MIN_FULL_DAY_LENGTH)
  })

  it(TEST_INVALID_ENV_MSG, () => {
    const result = addDaysToTodayFull(null)
    expect(result).toBeInstanceOf(Error)
  })

  it(TEST_NO_ADDFILTER_MSG, () => {
    const result = addDaysToTodayFull({})
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

    const result = filterFunction(2)

    // Real moment returns full Welsh day name
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(MIN_FULL_DAY_LENGTH)
  })

  it(TEST_DEFAULT_DAYS_MSG, () => {
    addDaysToTodayFullWelsh(mockEnv)
    const filterFunction = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'addDaysToTodayFullWelsh'
    )[1]

    const result = filterFunction(null)

    // Non-number defaults to 0
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(MIN_FULL_DAY_LENGTH)
  })

  it(TEST_INVALID_ENV_MSG, () => {
    const result = addDaysToTodayFullWelsh(null)
    expect(result).toBeInstanceOf(Error)
  })

  it(TEST_NO_ADDFILTER_MSG, () => {
    const result = addDaysToTodayFullWelsh({})
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

    const result = govukDateFilter(NOW_STRING)
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('govukDate should format date string', () => {
    addMomentFilters(mockEnv)
    const govukDateFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'govukDate'
    )[1]

    const result = govukDateFilter(TEST_ISO_DATE)
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })
})

describe('govukDateHour filter', () => {
  it('govukDateHour should handle "NOW" string using moment.tz', () => {
    addMomentFilters(mockEnv)
    const govukDateHourFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'govukDateHour'
    )[1]

    const result = govukDateHourFilter(NOW_STRING)
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('govukDateHour should format non-NOW date with hour using moment()', () => {
    addMomentFilters(mockEnv)
    const govukDateHourFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'govukDateHour'
    )[1]

    // Clear any previous calls
    vi.clearAllMocks()

    const result = govukDateHourFilter('2024-03-20T09:00:00')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
    expect(result).toContain('2024')
  })

  it('govukDateHour should handle various non-NOW date formats', () => {
    addMomentFilters(mockEnv)
    const govukDateHourFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'govukDateHour'
    )[1]

    vi.clearAllMocks()

    const result = govukDateHourFilter('2025-01-15T14:00:00Z')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('govukDateHour should handle empty string as non-NOW', () => {
    addMomentFilters(mockEnv)
    const govukDateHourFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'govukDateHour'
    )[1]

    vi.clearAllMocks()

    const result = govukDateHourFilter('')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })
})

describe('date filter', () => {
  it('date filter should handle "NOW" string using moment.tz', () => {
    addMomentFilters(mockEnv)
    const dateFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'date'
    )[1]

    const result = dateFilter(NOW_STRING)
    expect(result).toBeDefined()
  })

  it('date filter should return moment object for non-NOW date string', () => {
    addMomentFilters(mockEnv)
    const dateFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'date'
    )[1]

    vi.clearAllMocks()

    const result = dateFilter(TEST_ISO_DATE)
    expect(result).toBeDefined()
    expect(typeof result.format).toBe('function')
  })

  it('date filter should handle various non-NOW date values', () => {
    addMomentFilters(mockEnv)
    const dateFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'date'
    )[1]

    vi.clearAllMocks()

    const result = dateFilter('2025-06-15T10:30:00')
    expect(result).toBeDefined()
    expect(typeof result.format).toBe('function')
  })

  it('date filter should handle null as non-NOW', () => {
    addMomentFilters(mockEnv)
    const dateFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'date'
    )[1]

    vi.clearAllMocks()

    const result = dateFilter(null)
    expect(result).toBeDefined()
    expect(typeof result.format).toBe('function')
  })

  it('date filter should handle undefined as non-NOW', () => {
    addMomentFilters(mockEnv)
    const dateFilter = mockEnv.addFilter.mock.calls.find(
      (call) => call[0] === 'date'
    )[1]

    vi.clearAllMocks()

    const result = dateFilter(undefined)
    expect(result).toBeDefined()
    expect(typeof result.format).toBe('function')
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
