// Air quality band constants
const LOW_MIN = 1
const LOW_MID = 2
const LOW_MAX = 3
const MODERATE_MIN = 4
const MODERATE_MID = 5
const MODERATE_MAX = 6
const HIGH_MIN = 7
const HIGH_MID = 8
const HIGH_MAX = 9

// Common advice messages
const ENJOY_OUTDOOR_ACTIVITIES = 'Enjoy your usual outdoor activities.'
const LOW_AT_RISK_ADVICE = {
  adults: ENJOY_OUTDOOR_ACTIVITIES,
  asthma: ENJOY_OUTDOOR_ACTIVITIES,
  oldPeople: ENJOY_OUTDOOR_ACTIVITIES
}

export const commonMessages = {
  low: {
    values: [LOW_MIN, LOW_MID, LOW_MAX],
    advice: ENJOY_OUTDOOR_ACTIVITIES,
    atrisk: LOW_AT_RISK_ADVICE,
    outlook:
      'The current spell of unsettled weather will continue, helping to keep air pollution levels low across the UK during today.'
  },
  moderate: {
    values: [MODERATE_MIN, MODERATE_MID, MODERATE_MAX],
    advice:
      'For most people, short term exposure to moderate levels of air pollution is not an issue.',
    atrisk: {
      adults:
        'Adults who have heart problems and feel unwell should consider doing less strenuous exercise, especially outside.',
      asthma:
        'People with asthma should be prepared to use their reliever inhaler.',
      oldPeople:
        'Older people should consider doing less strenuous activity, especially outside.'
    },
    outlook:
      'The influx of warm air from the continent is resulting in moderate air pollution levels throughout many areas today.'
  },
  high: {
    values: [HIGH_MIN, HIGH_MID, HIGH_MAX],
    advice:
      'Anyone experiencing discomfort such as sore eyes, cough or sore throat should consider reducing activity, particularly outdoors.',
    atrisk: {
      adults:
        'Adults with heart problems should reduce strenuous physical exertion, particularly outdoors, especially if they experience symptoms.',
      asthma:
        'People with asthma may find they need to use their reliever inhaler more often.',
      oldPeople: 'Older people should reduce physical exertion.'
    },
    outlook:
      'Warm temperatures are expected to increase pollution levels to high across many areas today.'
  },
  veryHigh: {
    values: [10],
    advice:
      'Reduce physical exertion, particularly outdoors, especially if you experience symptoms such as cough or sore throat.',
    atrisk: {
      adults:
        'Adults with heart problems should avoid strenuous physical activity.',
      asthma:
        'People with asthma may need to use their reliever inhaler more often.',
      oldPeople: 'Older people should avoid strenuous physical activity.'
    },
    outlook:
      'The current heatwave shows no signs of relenting, causing air pollution levels to remain very high across many areas today.'
  },
  unknown: {
    advice: 'No data available.'
  }
}

export function getCommonMessage(band) {
  return commonMessages[band] || commonMessages.unknown
}

function getBandInfo(value) {
  if (value >= LOW_MIN && value <= LOW_MAX) {
    return { band: 'low', readableBand: 'low' }
  }
  if (value >= MODERATE_MIN && value <= MODERATE_MAX) {
    return { band: 'moderate', readableBand: 'moderate' }
  }
  if (value >= HIGH_MIN && value <= HIGH_MAX) {
    return { band: 'high', readableBand: 'high' }
  }
  if (value === 10) {
    return { band: 'veryHigh', readableBand: 'very high' }
  }
  return { band: 'unknown', readableBand: 'unknown' }
}

export function getAirQuality(aqValue = '4') {
  const value = aqValue
  const { band, readableBand } = getBandInfo(value)
  const message = getCommonMessage(band)

  return {
    value,
    band,
    readableBand,
    advice: message.advice,
    atrisk: message.atrisk,
    outlook: message.outlook
  }
}
