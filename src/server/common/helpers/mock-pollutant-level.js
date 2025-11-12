/**
 * Mock Pollutant Level Utility
 *
 * This utility allows you to mock specific pollutant band levels for testing and visualization purposes.
 * It generates mock pollutant data with specified bands (Low, Moderate, High, Very High) that will
 * display with the corresponding colors in the pollutants table.
 *
 * Usage:
 * import { mockPollutantLevel, mockPollutantBand } from './mock-pollutant-level.js'
 *
 * // Mock all pollutants with 'High' band
 * const mockData = mockPollutantBand('high')
 *
 * // Mock specific pollutants
 * const mockData = mockPollutantLevel({ NO2: 'moderate', PM25: 'high', O3: 'low' })
 */

import { createLogger } from './logging/logger.js'
const logger = createLogger()

/**
 * Pollutant band definitions with their corresponding values and colors
 * '' - These bands map to the CSS classes: low, moderate, high, very-high
 */
const POLLUTANT_BANDS = {
  low: {
    label: 'Low',
    description: 'Low pollution level',
    cssClass: 'low',
    daqi: 1
  },
  moderate: {
    label: 'Moderate',
    description: 'Moderate pollution level',
    cssClass: 'moderate',
    daqi: 4
  },
  high: {
    label: 'High',
    description: 'High pollution level',
    cssClass: 'high',
    daqi: 7
  },
  'very-high': {
    label: 'Very High',
    description: 'Very high pollution level',
    cssClass: 'very-high',
    daqi: 10
  }
}

/**
 * Pollutant value ranges for each band
 * '' - Based on UK DAQI thresholds
 */
const POLLUTANT_VALUE_RANGES = {
  NO2: {
    low: 100,
    moderate: 300,
    high: 500,
    'very-high': 700
  },
  PM25: {
    low: 20,
    moderate: 40,
    high: 60,
    'very-high': 80
  },
  PM10: {
    low: 30,
    moderate: 60,
    high: 80,
    'very-high': 110
  },
  GE10: {
    low: 30,
    moderate: 60,
    high: 80,
    'very-high': 110
  },
  O3: {
    low: 80,
    moderate: 120,
    high: 200,
    'very-high': 250
  },
  SO2: {
    low: 150,
    moderate: 400,
    high: 750,
    'very-high': 1000
  }
}

/**
 * Get mock pollutant data for a specific band
 * '' - Returns pollutant object with value, band, daqi, and time
 */
function getMockPollutantData(pollutantType, band) {
  const bandInfo = POLLUTANT_BANDS[band]
  const value = POLLUTANT_VALUE_RANGES[pollutantType][band]

  if (!bandInfo || !value) {
    logger.warn(
      `Invalid pollutant type (${pollutantType}) or band (${band}). Using default.`
    )
    return null
  }

  const now = new Date()
  const hour = now.getHours().toString().padStart(2, '0')
  const day = now.getDate()
  const month = now.toLocaleString('en-GB', { month: 'long' })
  const year = now.getFullYear()

  return {
    value: value,
    band: bandInfo.label,
    daqi: bandInfo.daqi,
    time: {
      hour: hour + ':00',
      day: day,
      month: month,
      year: year
    }
  }
}

/**
 * Mock all pollutants with the same band level
 * '' - Useful for testing a specific pollution scenario
 *
 * @param {string} band - The band level: 'low', 'moderate', 'high', 'very-high'
 * @param {object} options - Configuration options
 * @returns {object} Mock monitoring sites with pollutant data
 */
export function mockPollutantBand(band = 'moderate', options = {}) {
  const { logDetails = false } = options

  // Normalize band to lowercase with hyphen
  const normalizedBand = band.toLowerCase().replace(/\s+/g, '-')

  if (!POLLUTANT_BANDS[normalizedBand]) {
    logger.error(
      `Invalid band: ${band}. Must be one of: low, moderate, high, very-high`
    )
    return null
  }

  if (logDetails) {
    logger.info(
      `🧪 Mocking all pollutants with band: ${POLLUTANT_BANDS[normalizedBand].label}`
    )
  }

  const pollutantTypes = ['NO2', 'PM25', 'PM10', 'O3', 'SO2']
  const mockPollutants = {}

  pollutantTypes.forEach((type) => {
    const pollutantData = getMockPollutantData(type, normalizedBand)
    if (pollutantData) {
      mockPollutants[type] = pollutantData
    }
  })

  return mockPollutants
}

/**
 * Mock specific pollutants with individual band levels
 * '' - Allows granular control over each pollutant
 *
 * @param {object} pollutantBands - Object mapping pollutant types to band levels
 *   Example: { NO2: 'high', PM25: 'moderate', O3: 'low' }
 * @param {object} options - Configuration options
 * @returns {object} Mock monitoring sites with pollutant data
 */
export function mockPollutantLevel(pollutantBands = {}, options = {}) {
  const { logDetails = false, fillMissing = true } = options

  const mockPollutants = {}
  const pollutantTypes = ['NO2', 'PM25', 'PM10', 'O3', 'SO2']

  if (logDetails) {
    logger.info(`🧪 Mocking specific pollutants:`, pollutantBands)
  }

  pollutantTypes.forEach((type) => {
    let band = pollutantBands[type]

    // Fill missing pollutants with 'low' by default if fillMissing is true
    if (!band && fillMissing) {
      band = 'low'
    }

    if (band) {
      // Normalize band
      const normalizedBand = band.toLowerCase().replace(/\s+/g, '-')
      const pollutantData = getMockPollutantData(type, normalizedBand)

      if (pollutantData) {
        mockPollutants[type] = pollutantData
      }
    }
  })

  return mockPollutants
}

/**
 * Apply mock pollutants to monitoring sites data
 * '' - Replaces pollutant data in existing monitoring sites structure
 *
 * @param {array} monitoringSites - Original monitoring sites array
 * @param {object} mockPollutants - Mock pollutant data to apply
 * @param {object} options - Configuration options
 * @returns {array} Modified monitoring sites with mock data
 */
export function applyMockPollutantsToSites(
  monitoringSites = [],
  mockPollutants = {},
  options = {}
) {
  const { applyToAllSites = true, logDetails = false } = options

  if (!monitoringSites || monitoringSites.length === 0) {
    logger.warn('No monitoring sites to apply mock pollutants to')
    return monitoringSites
  }

  if (logDetails) {
    logger.info(
      `🧪 Applying mock pollutants to ${monitoringSites.length} site(s)`
    )
  }

  return monitoringSites.map((site, index) => {
    // Apply to all sites or just the first one
    if (applyToAllSites || index === 0) {
      return {
        ...site,
        pollutants: {
          ...site.pollutants,
          ...mockPollutants
        }
      }
    }
    return site
  })
}

/**
 * Get available band options for reference
 * '' - Helper function for debugging and documentation
 */
export function getAvailableBands() {
  return Object.keys(POLLUTANT_BANDS).map((key) => ({
    key,
    label: POLLUTANT_BANDS[key].label,
    description: POLLUTANT_BANDS[key].description,
    cssClass: POLLUTANT_BANDS[key].cssClass
  }))
}

/**
 * Validate band string
 * '' - Returns normalized band or null if invalid
 */
export function validateBand(band) {
  const normalized = band.toLowerCase().replace(/\s+/g, '-')
  return POLLUTANT_BANDS[normalized] ? normalized : null
}

export default {
  mockPollutantBand,
  mockPollutantLevel,
  applyMockPollutantsToSites,
  getAvailableBands,
  validateBand
}
