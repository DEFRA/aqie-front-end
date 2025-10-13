// '' Welsh pollutant threshold configuration
const POLLUTANT_THRESHOLDS_CY = {
  PM10: [
    { max: 50, daqi: 1, band: 'Isel' },
    { max: 75, daqi: 4, band: 'Cymedrol' },
    { max: 100, daqi: 7, band: 'Uchel' },
    { max: Infinity, daqi: 10, band: 'Uchel iawn' }
  ],
  GE10: [
    { max: 50, daqi: 1, band: 'Isel' },
    { max: 75, daqi: 4, band: 'Cymedrol' },
    { max: 100, daqi: 7, band: 'Uchel' },
    { max: Infinity, daqi: 10, band: 'Uchel iawn' }
  ],
  NO2: [
    { max: 200, daqi: 1, band: 'Isel' },
    { max: 400, daqi: 4, band: 'Cymedrol' },
    { max: 600, daqi: 7, band: 'Uchel' },
    { max: Infinity, daqi: 10, band: 'Uchel iawn' }
  ],
  PM25: [
    { max: 36, daqi: 1, band: 'Isel' },
    { max: 53, daqi: 4, band: 'Cymedrol' },
    { max: 70, daqi: 7, band: 'Uchel' },
    { max: Infinity, daqi: 10, band: 'Uchel iawn' }
  ],
  SO2: [
    { max: 266, daqi: 1, band: 'Isel' },
    { max: 710, daqi: 4, band: 'Cymedrol' },
    { max: 1064, daqi: 7, band: 'Uchel' },
    { max: Infinity, daqi: 10, band: 'Uchel iawn' }
  ],
  O3: [
    { max: 100, daqi: 1, band: 'Isel' },
    { max: 160, daqi: 4, band: 'Cymedrol' },
    { max: 240, daqi: 7, band: 'Uchel' },
    { max: Infinity, daqi: 10, band: 'Uchel iawn' }
  ]
}

// '' Helper function to find the appropriate threshold for a pollutant value
function findPollutantThresholdCy(thresholds, value) {
  return thresholds.find((threshold) => value <= threshold.max)
}

function getPollutantLevelCy(polValue, pollutant) {
  const thresholds = POLLUTANT_THRESHOLDS_CY[pollutant]

  if (!thresholds) {
    return { getDaqi: 0, getBand: '' }
  }

  const threshold = findPollutantThresholdCy(thresholds, polValue)

  if (!threshold) {
    return { getDaqi: 0, getBand: '' }
  }

  return { getDaqi: threshold.daqi, getBand: threshold.band }
}

export { getPollutantLevelCy }
