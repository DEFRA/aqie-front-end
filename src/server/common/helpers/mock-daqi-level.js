/**
 * Mock DAQI Level Utility
 *
 * This utility allows you to mock a specific DAQI level (0-10) for testing and visualization purposes.
 * It generates mock air quality data with the specified level that will display with the corresponding colors.
 *
 * Usage:
 * import { mockDaqiLevel, mockLevelColor } from './mock-daqi-level.js'
 *
 * // Mock a specific level (e.g., level 7 - High/Light Red)
 * const mockData = mockDaqiLevel(7)
 *
 * // Or use mockLevelColor for more detailed control
 * const mockColorData = mockLevelColor(5, { includeForecast: true })
 */

import { createLogger } from './logging/logger.js'
const logger = createLogger()

/**
 * DAQI Level definitions with their corresponding bands and colors
 */
const DAQI_LEVELS = {
  0: { band: 'No data', color: 'light-grey', description: 'No data available' },
  1: { band: 'Low', color: '#9CFF9C', description: 'Low - Light green' },
  2: { band: 'Low', color: '#31FF00', description: 'Low - Bright green' },
  3: { band: 'Low', color: '#31CF00', description: 'Low - Medium green' },
  4: { band: 'Moderate', color: '#FFFF00', description: 'Moderate - Yellow' },
  5: {
    band: 'Moderate',
    color: '#FFCF00',
    description: 'Moderate - Orange-yellow'
  },
  6: { band: 'Moderate', color: '#ffdd00', description: 'Moderate - Orange' },
  7: { band: 'High', color: '#FF6464', description: 'High - Light red' },
  8: { band: 'High', color: '#FF0000', description: 'High - Red' },
  9: { band: 'High', color: '#990000', description: 'High - Dark red' },
  10: { band: 'Very High', color: '#4c2c92', description: 'Very High - Purple' }
}

/**
 * Get full detailed info for a DAQI level (matching getDetailedInfo structure)
 */
function getFullDetailedInfo(level) {
  const levelInfo = DAQI_LEVELS[level]

  // Band mapping
  const bandMapping = {
    'No data': { band: 'unknown', readableBand: 'unknown' },
    Low: { band: 'low', readableBand: 'low' },
    Moderate: { band: 'moderate', readableBand: 'moderate' },
    High: { band: 'high', readableBand: 'high' },
    'Very High': { band: 'veryHigh', readableBand: 'very high' }
  }

  const bandInfo = bandMapping[levelInfo.band] || {
    band: 'unknown',
    readableBand: 'unknown'
  }

  // Mock messages
  const messages = {
    low: {
      advice: 'Enjoy your usual outdoor activities.',
      atrisk: {
        adults: 'Enjoy your usual outdoor activities.',
        asthma: 'Enjoy your usual outdoor activities.',
        oldPeople: 'Enjoy your usual outdoor activities.'
      },
      outlook: 'Air pollution levels are low.'
    },
    moderate: {
      advice:
        'For most people, short term exposure to moderate levels of air pollution is not an issue.',
      atrisk: {
        adults:
          'Adults who have heart problems and feel unwell should consider doing less strenuous exercise.',
        asthma:
          'People with asthma should be prepared to use their reliever inhaler.',
        oldPeople: 'Older people should consider doing less strenuous activity.'
      },
      outlook: 'Air pollution levels are moderate.'
    },
    high: {
      advice:
        'Anyone experiencing discomfort should consider reducing activity, particularly outdoors.',
      atrisk: {
        adults:
          'Adults with heart problems should reduce strenuous physical exertion.',
        asthma:
          'People with asthma may find they need to use their reliever inhaler more often.',
        oldPeople: 'Older people should reduce physical exertion.'
      },
      outlook: 'Air pollution levels are high.'
    },
    veryHigh: {
      advice: 'Reduce physical exertion, particularly outdoors.',
      atrisk: {
        adults:
          'Adults with heart problems should avoid strenuous physical activity.',
        asthma:
          'People with asthma may need to use their reliever inhaler more often.',
        oldPeople: 'Older people should avoid strenuous physical activity.'
      },
      outlook: 'Air pollution levels are very high.'
    },
    unknown: {
      advice: 'No data available.',
      atrisk: {},
      outlook: 'No data available.'
    }
  }

  const message = messages[bandInfo.band] || messages.unknown

  return {
    value: level.toString(), // ⭐ MUST BE STRING, not number
    band: bandInfo.band,
    readableBand: bandInfo.readableBand,
    advice: message.advice,
    atrisk: message.atrisk,
    outlook: message.outlook
  }
}

/**
 * Mock a specific DAQI level with color display
 *
 * @param {number} level - DAQI level (0-10)
 * @param {Object} options - Optional configuration
 * @param {boolean} options.includeForecast - Include 5-day forecast (default: true)
 * @param {boolean} options.allSameLevel - All days same level (default: true)
 * @param {boolean} options.logDetails - Log color and level details (default: true)
 * @returns {Object} Mock air quality data structure
 */
export function mockLevelColor(level, options = {}) {
  const {
    includeForecast = true,
    allSameLevel = true,
    logDetails = true
  } = options

  // Validate level
  if (level < 0 || level > 10 || !Number.isInteger(level)) {
    logger.error(
      `Invalid DAQI level: ${level}. Must be integer between 0 and 10.`
    )
    return null
  }

  const levelInfo = DAQI_LEVELS[level]

  if (logDetails) {
    logger.info('='.repeat(60))
    logger.info(`Mock DAQI Level: ${level}`)
    logger.info(`Band: ${levelInfo.band}`)
    logger.info(`Color: ${levelInfo.color}`)
    logger.info(`Description: ${levelInfo.description}`)
    logger.info('='.repeat(60))
  }

  // Create mock air quality object with full structure
  const mockAirQuality = {
    today: getFullDetailedInfo(level)
  }

  // Add forecast days if requested
  if (includeForecast) {
    if (allSameLevel) {
      // All days same level
      mockAirQuality.day2 = getFullDetailedInfo(level)
      mockAirQuality.day3 = getFullDetailedInfo(level)
      mockAirQuality.day4 = getFullDetailedInfo(level)
      mockAirQuality.day5 = getFullDetailedInfo(level)
    } else {
      // Vary levels slightly for more realistic mock
      const day2Level = Math.min(10, Math.max(0, level + 1))
      const day3Level = Math.min(10, Math.max(0, level - 1))
      const day4Level = Math.min(10, Math.max(0, level + 2))
      const day5Level = Math.min(10, Math.max(0, level))

      mockAirQuality.day2 = getFullDetailedInfo(day2Level)
      mockAirQuality.day3 = getFullDetailedInfo(day3Level)
      mockAirQuality.day4 = getFullDetailedInfo(day4Level)
      mockAirQuality.day5 = getFullDetailedInfo(day5Level)
    }
  }

  return mockAirQuality
}

/**
 * Alias for mockLevelColor for backward compatibility
 */
export function mockDaqiLevel(level, options = {}) {
  return mockLevelColor(level, options)
}

/**
 * Generate mock data for all DAQI levels (0-10) for testing
 *
 * @returns {Array} Array of mock data for each level
 */
export function mockAllLevels() {
  logger.info('Generating mock data for all DAQI levels (0-10)...')

  const allLevels = []
  for (let level = 0; level <= 10; level++) {
    const mockData = mockLevelColor(level, { logDetails: false })
    allLevels.push({
      level,
      data: mockData,
      info: DAQI_LEVELS[level]
    })
  }

  logger.info(`Generated mock data for ${allLevels.length} levels`)
  return allLevels
}

/**
 * Get DAQI level information
 *
 * @param {number} level - DAQI level (0-10)
 * @returns {Object} Level information (band, color, description)
 */
export function getDaqiLevelInfo(level) {
  if (level < 0 || level > 10) {
    return null
  }
  return DAQI_LEVELS[level]
}

/**
 * Get color for a specific DAQI level
 *
 * @param {number} level - DAQI level (0-10)
 * @returns {string} Hex color code or color name
 */
export function getDaqiColor(level) {
  const info = getDaqiLevelInfo(level)
  return info ? info.color : null
}

/**
 * Middleware helper to inject mock DAQI level
 * Use this in your route handler or middleware to override actual data
 *
 * @param {Object} request - Hapi request object
 * @param {number} mockLevel - DAQI level to mock (0-10)
 * @returns {Object} Modified request with mock data
 */
export function injectMockLevel(request, mockLevel) {
  const mockData = mockLevelColor(mockLevel, {
    includeForecast: true,
    allSameLevel: true,
    logDetails: true
  })

  if (mockData) {
    // Store in session or request
    if (request.yar) {
      request.yar.set('mockAirQuality', mockData)
    }
    logger.info(`Mock DAQI level ${mockLevel} injected into request`)
  }

  return request
}

/**
 * Check if mock mode is enabled
 *
 * @param {Object} request - Hapi request object
 * @returns {boolean} True if mock mode is enabled
 */
export function isMockMode(request) {
  if (request.yar) {
    return !!request.yar.get('mockAirQuality')
  }
  return false
}

/**
 * Clear mock mode
 *
 * @param {Object} request - Hapi request object
 */
export function clearMockMode(request) {
  if (request.yar) {
    request.yar.clear('mockAirQuality')
    logger.info('Mock DAQI mode cleared')
  }
}

export default {
  mockLevelColor,
  mockDaqiLevel,
  mockAllLevels,
  getDaqiLevelInfo,
  getDaqiColor,
  injectMockLevel,
  isMockMode,
  clearMockMode,
  DAQI_LEVELS
}
