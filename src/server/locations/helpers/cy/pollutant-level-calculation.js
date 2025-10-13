// '' Welsh pollutant level calculation using unified config
import { getPollutantLevel as getUnifiedPollutantLevel } from '../pollutant-threshold-config.js'

function getPollutantLevelCy(polValue, pollutant) {
  return getUnifiedPollutantLevel(polValue, pollutant, 'cy')
}

export { getPollutantLevelCy }
