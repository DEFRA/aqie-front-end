// '' English pollutant level calculation using unified config
import { getPollutantLevel as getUnifiedPollutantLevel } from './pollutant-threshold-config.js'

function getPollutantLevel(polValue, pollutant) {
  return getUnifiedPollutantLevel(polValue, pollutant, 'en')
}

export { getPollutantLevel }
