import * as airQuality from './src/server/data/cy/air-quality.js'

const info = airQuality.getDetailedInfo(1)
console.log('Testing Welsh air quality data for level 1 (Low):')
console.log('Has insetText:', !!info.insetText)
console.log('InsetText length:', info.insetText?.length)
console.log('First 100 characters:', info.insetText?.substring(0, 100))
console.log(
  '\nFull insetText starts with Welsh?',
  info.insetText?.includes("I'r rhan fwyaf")
)
console.log(
  'Full insetText starts with English?',
  info.insetText?.includes('For most people')
)
