// '' Pollutant threshold configuration
const POLLUTANT_THRESHOLDS = {
  PM10: [
    { max: 50, daqi: 1, band: 'Low' },
    { max: 75, daqi: 4, band: 'Moderate' },
    { max: 100, daqi: 7, band: 'High' },
    { max: Infinity, daqi: 10, band: 'Very high' }
  ],
  GE10: [
    { max: 50, daqi: 1, band: 'Low' },
    { max: 75, daqi: 4, band: 'Moderate' },
    { max: 100, daqi: 7, band: 'High' },
    { max: Infinity, daqi: 10, band: 'Very high' }
  ],
  NO2: [
    { max: 200, daqi: 1, band: 'Low' },
    { max: 400, daqi: 4, band: 'Moderate' },
    { max: 600, daqi: 7, band: 'High' },
    { max: Infinity, daqi: 10, band: 'Very high' }
  ],
  PM25: [
    { max: 36, daqi: 1, band: 'Low' },
    { max: 53, daqi: 4, band: 'Moderate' },
    { max: 70, daqi: 7, band: 'High' },
    { max: Infinity, daqi: 10, band: 'Very high' }
  ],
  SO2: [
    { max: 266, daqi: 1, band: 'Low' },
    { max: 710, daqi: 4, band: 'Moderate' },
    { max: 1064, daqi: 7, band: 'High' },
    { max: Infinity, daqi: 10, band: 'Very high' }
  ],
  O3: [
    { max: 100, daqi: 1, band: 'Low' },
    { max: 160, daqi: 4, band: 'Moderate' },
    { max: 240, daqi: 7, band: 'High' },
    { max: Infinity, daqi: 10, band: 'Very high' }
  ]
}

// '' Helper function to find the appropriate threshold for a pollutant value
function findPollutantThreshold(thresholds, value) {
  return thresholds.find((threshold) => value <= threshold.max)
}

function getPollutantLevel(polValue, pollutant) {
  const thresholds = POLLUTANT_THRESHOLDS[pollutant]

  if (!thresholds) {
    return { getDaqi: 0, getBand: '' }
  }

  const threshold = findPollutantThreshold(thresholds, polValue)

  if (!threshold) {
    return { getDaqi: 0, getBand: '' }
  }

  return { getDaqi: threshold.daqi, getBand: threshold.band }
}

export { getPollutantLevel }
