// '' - Unified pollutant threshold configuration to eliminate duplication
import {
  POLLUTANT_BAND_LABELS,
  POLLUTANT_THRESHOLD_VALUES,
  FIRST_INDEX
} from '../../data/constants.js'

// '' - Common threshold structure using constants
const POLLUTANT_THRESHOLDS_CONFIG = {
  PM10: [
    { max: POLLUTANT_THRESHOLD_VALUES.PM10_MAX_1, daqi: 1, bandKey: 'LOW' },
    {
      max: POLLUTANT_THRESHOLD_VALUES.PM10_MAX_2,
      daqi: 4,
      bandKey: 'MODERATE'
    },
    { max: POLLUTANT_THRESHOLD_VALUES.PM10_MAX_3, daqi: 7, bandKey: 'HIGH' },
    { max: Infinity, daqi: 10, bandKey: 'VERY_HIGH' }
  ],
  GE10: [
    { max: POLLUTANT_THRESHOLD_VALUES.PM10_MAX_1, daqi: 1, bandKey: 'LOW' },
    {
      max: POLLUTANT_THRESHOLD_VALUES.PM10_MAX_2,
      daqi: 4,
      bandKey: 'MODERATE'
    },
    { max: POLLUTANT_THRESHOLD_VALUES.PM10_MAX_3, daqi: 7, bandKey: 'HIGH' },
    { max: Infinity, daqi: 10, bandKey: 'VERY_HIGH' }
  ],
  NO2: [
    { max: POLLUTANT_THRESHOLD_VALUES.NO2_MAX_1, daqi: 1, bandKey: 'LOW' },
    { max: POLLUTANT_THRESHOLD_VALUES.NO2_MAX_2, daqi: 4, bandKey: 'MODERATE' },
    { max: POLLUTANT_THRESHOLD_VALUES.NO2_MAX_3, daqi: 7, bandKey: 'HIGH' },
    { max: Infinity, daqi: 10, bandKey: 'VERY_HIGH' }
  ],
  PM25: [
    { max: POLLUTANT_THRESHOLD_VALUES.PM25_MAX_1, daqi: 1, bandKey: 'LOW' },
    {
      max: POLLUTANT_THRESHOLD_VALUES.PM25_MAX_2,
      daqi: 4,
      bandKey: 'MODERATE'
    },
    { max: POLLUTANT_THRESHOLD_VALUES.PM25_MAX_3, daqi: 7, bandKey: 'HIGH' },
    { max: Infinity, daqi: 10, bandKey: 'VERY_HIGH' }
  ],
  SO2: [
    { max: POLLUTANT_THRESHOLD_VALUES.SO2_MAX_1, daqi: 1, bandKey: 'LOW' },
    { max: POLLUTANT_THRESHOLD_VALUES.SO2_MAX_2, daqi: 4, bandKey: 'MODERATE' },
    { max: POLLUTANT_THRESHOLD_VALUES.SO2_MAX_3, daqi: 7, bandKey: 'HIGH' },
    { max: Infinity, daqi: 10, bandKey: 'VERY_HIGH' }
  ],
  O3: [
    { max: POLLUTANT_THRESHOLD_VALUES.O3_MAX_1, daqi: 1, bandKey: 'LOW' },
    { max: POLLUTANT_THRESHOLD_VALUES.O3_MAX_2, daqi: 4, bandKey: 'MODERATE' },
    { max: POLLUTANT_THRESHOLD_VALUES.O3_MAX_3, daqi: 7, bandKey: 'HIGH' },
    { max: Infinity, daqi: 10, bandKey: 'VERY_HIGH' }
  ]
}

// '' - Helper function to find the appropriate threshold for a pollutant value
function findPollutantThreshold(thresholds, value) {
  return thresholds.find((threshold) => value <= threshold.max)
}

// '' - Unified function that works for both languages
function getPollutantLevel(polValue, pollutant, language = 'en') {
  const thresholds = POLLUTANT_THRESHOLDS_CONFIG[pollutant]

  if (!thresholds) {
    return { getDaqi: FIRST_INDEX, getBand: '' }
  }

  const threshold = findPollutantThreshold(thresholds, polValue)

  if (!threshold) {
    return { getDaqi: FIRST_INDEX, getBand: '' }
  }

  const bandLabel = POLLUTANT_BAND_LABELS[threshold.bandKey][language] || ''

  return { getDaqi: threshold.daqi, getBand: bandLabel }
}

export { getPollutantLevel, POLLUTANT_THRESHOLDS_CONFIG }
