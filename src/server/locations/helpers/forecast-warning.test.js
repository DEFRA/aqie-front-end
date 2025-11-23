import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getForecastWarning } from './forecast-warning.js'
import moment from 'moment'

describe('getForecastWarning', () => {
  beforeEach(() => {
    // Set a fixed date for consistent testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z')) // Monday
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return null when airQuality is null', () => {
    const result = getForecastWarning(null, 'en')
    expect(result).toBeNull()
  })

  it('should return null when airQuality is undefined', () => {
    const result = getForecastWarning(undefined, 'en')
    expect(result).toBeNull()
  })

  it('should return null when no high or very high bands found', () => {
    const airQuality = {
      today: { band: 'low', readableBand: 'Low' },
      day2: { band: 'moderate', readableBand: 'Moderate' },
      day3: { band: 'low', readableBand: 'Low' },
      day4: { band: 'moderate', readableBand: 'Moderate' },
      day5: { band: 'low', readableBand: 'Low' }
    }
    const result = getForecastWarning(airQuality, 'en')
    expect(result).toBeNull()
  })

  it('should detect "high" band on today (English)', () => {
    const airQuality = {
      today: { band: 'high', readableBand: 'High' },
      day2: { band: 'low', readableBand: 'Low' }
    }
    const result = getForecastWarning(airQuality, 'en')

    expect(result).toBeDefined()
    expect(result.level).toBe('High')
    expect(result.dayKey).toBe('today')
    expect(result.text).toContain('High')
    expect(result.weekday).toBe('Monday')
  })

  it('should detect "veryHigh" band on day2 (English)', () => {
    const airQuality = {
      today: { band: 'low', readableBand: 'Low' },
      day2: { band: 'veryHigh', readableBand: 'Very high' },
      day3: { band: 'low', readableBand: 'Low' }
    }
    const result = getForecastWarning(airQuality, 'en')

    expect(result).toBeDefined()
    expect(result.level).toBe('Very high')
    expect(result.dayKey).toBe('day2')
    expect(result.text).toContain('Very high')
    expect(result.weekday).toBe('Tuesday') // Day after Monday
  })

  it('should detect "uchel" (high) band in Welsh', () => {
    const airQuality = {
      today: { band: 'low', readableBand: 'Isel' },
      day2: { band: 'uchel', readableBand: 'Uchel' }
    }
    const result = getForecastWarning(airQuality, 'cy')

    expect(result).toBeDefined()
    expect(result.level).toBe('Uchel')
    expect(result.dayKey).toBe('day2')
  })

  it('should detect "uchelIawn" (very high) band in Welsh', () => {
    const airQuality = {
      today: { band: 'uchelIawn', readableBand: 'Uchel Iawn' }
    }
    const result = getForecastWarning(airQuality, 'cy')

    expect(result).toBeDefined()
    expect(result.level).toBe('Uchel Iawn')
    expect(result.dayKey).toBe('today')
  })

  it('should return first high/very high occurrence when multiple exist', () => {
    const airQuality = {
      today: { band: 'low', readableBand: 'Low' },
      day2: { band: 'high', readableBand: 'High' },
      day3: { band: 'veryHigh', readableBand: 'Very high' },
      day4: { band: 'high', readableBand: 'High' }
    }
    const result = getForecastWarning(airQuality, 'en')

    expect(result).toBeDefined()
    expect(result.dayKey).toBe('day2') // First occurrence
    expect(result.level).toBe('High')
  })

  it('should check day3 when today and day2 are low', () => {
    const airQuality = {
      today: { band: 'low', readableBand: 'Low' },
      day2: { band: 'moderate', readableBand: 'Moderate' },
      day3: { band: 'high', readableBand: 'High' }
    }
    const result = getForecastWarning(airQuality, 'en')

    expect(result).toBeDefined()
    expect(result.dayKey).toBe('day3')
    expect(result.weekday).toBe('Wednesday')
  })

  it('should check day4 when earlier days are low/moderate', () => {
    const airQuality = {
      today: { band: 'low', readableBand: 'Low' },
      day2: { band: 'moderate', readableBand: 'Moderate' },
      day3: { band: 'moderate', readableBand: 'Moderate' },
      day4: { band: 'veryHigh', readableBand: 'Very high' }
    }
    const result = getForecastWarning(airQuality, 'en')

    expect(result).toBeDefined()
    expect(result.dayKey).toBe('day4')
    expect(result.weekday).toBe('Thursday')
  })

  it('should check day5 when all earlier days are not high/veryHigh', () => {
    const airQuality = {
      today: { band: 'low', readableBand: 'Low' },
      day2: { band: 'moderate', readableBand: 'Moderate' },
      day3: { band: 'moderate', readableBand: 'Moderate' },
      day4: { band: 'moderate', readableBand: 'Moderate' },
      day5: { band: 'high', readableBand: 'High' }
    }
    const result = getForecastWarning(airQuality, 'en')

    expect(result).toBeDefined()
    expect(result.dayKey).toBe('day5')
    expect(result.weekday).toBe('Friday')
  })

  it('should skip days with missing data', () => {
    const airQuality = {
      today: null,
      day2: undefined,
      day3: { band: 'high', readableBand: 'High' }
    }
    const result = getForecastWarning(airQuality, 'en')

    expect(result).toBeDefined()
    expect(result.dayKey).toBe('day3')
  })

  it('should skip days with missing band property', () => {
    const airQuality = {
      today: { readableBand: 'Low' }, // No band
      day2: { band: null, readableBand: 'Low' },
      day3: { band: 'high', readableBand: 'High' }
    }
    const result = getForecastWarning(airQuality, 'en')

    expect(result).toBeDefined()
    expect(result.dayKey).toBe('day3')
  })

  it('should default to "en" language when no lang specified', () => {
    const airQuality = {
      today: { band: 'high', readableBand: 'High' }
    }
    const result = getForecastWarning(airQuality)

    expect(result).toBeDefined()
    expect(result.text).toBeDefined()
  })

  it('should use band value when readableBand is missing', () => {
    const airQuality = {
      today: { band: 'high' } // No readableBand
    }
    const result = getForecastWarning(airQuality, 'en')

    expect(result).toBeDefined()
    expect(result.level).toBe('high')
  })

  it('should capitalize first letter of level in warning text', () => {
    const airQuality = {
      today: { band: 'veryHigh', readableBand: 'very high' } // Lowercase
    }
    const result = getForecastWarning(airQuality, 'en')

    expect(result).toBeDefined()
    expect(result.text).toContain('Very high') // Should be capitalized
  })

  it('should calculate correct weekday for each day offset', () => {
    // Test each day to ensure weekday calculation is correct
    const days = [
      { key: 'today', expectedDay: 'Monday', offset: 0 },
      { key: 'day2', expectedDay: 'Tuesday', offset: 1 },
      { key: 'day3', expectedDay: 'Wednesday', offset: 2 },
      { key: 'day4', expectedDay: 'Thursday', offset: 3 },
      { key: 'day5', expectedDay: 'Friday', offset: 4 }
    ]

    days.forEach(({ key, expectedDay }) => {
      const airQuality = {
        [key]: { band: 'high', readableBand: 'High' }
      }
      const result = getForecastWarning(airQuality, 'en')
      expect(result.weekday).toBe(expectedDay)
    })
  })

  it('should handle empty airQuality object', () => {
    const result = getForecastWarning({}, 'en')
    expect(result).toBeNull()
  })

  it('should return warning with all required properties', () => {
    const airQuality = {
      today: { band: 'high', readableBand: 'High' }
    }
    const result = getForecastWarning(airQuality, 'en')

    expect(result).toHaveProperty('text')
    expect(result).toHaveProperty('level')
    expect(result).toHaveProperty('weekday')
    expect(result).toHaveProperty('dayKey')
  })
})
