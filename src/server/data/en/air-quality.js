export const commonMessages = {
  low: {
    values: [1, 2, 3],
    advice: 'Enjoy your usual outdoor activities.',
    atrisk: {
      adults: 'Enjoy your usual outdoor activities.',
      asthma: 'Enjoy your usual outdoor activities.',
      oldPeople: 'Enjoy your usual outdoor activities.'
    },
    outlook:
      'The current spell of unsettled weather will continue, helping to keep air pollution levels low across the UK during today.'
  },
  moderate: {
    values: [4, 5, 6],
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
    values: [7, 8, 9],
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

export function getDetailedInfo(aqValue) {
  const value = aqValue || '4'

  const lookup = {
    1: { band: 'low', readableBand: 'low' },
    2: { band: 'low', readableBand: 'low' },
    3: { band: 'low', readableBand: 'low' },
    4: { band: 'moderate', readableBand: 'moderate' },
    5: { band: 'moderate', readableBand: 'moderate' },
    6: { band: 'moderate', readableBand: 'moderate' },
    7: { band: 'high', readableBand: 'high' },
    8: { band: 'high', readableBand: 'high' },
    9: { band: 'high', readableBand: 'high' },
    10: { band: 'veryHigh', readableBand: 'very high' }
  }

  const bandInfo = lookup[value] || {
    band: 'unknown',
    readableBand: 'unknown'
  }
  const band = bandInfo.band
  const readableBand = bandInfo.readableBand

  const message = getCommonMessage(band)

  return {
    value,
    band,
    readableBand,
    advice: message.advice,
    atrisk: message.atrisk,
    outlook: message.outlook,
    ukToday: message.ukToday, // Consider updating these messages to be relevant for each day
    ukTomorrow: message.ukTomorrow,
    ukOutlook: message.ukOutlook
  }
}

// Function to get air quality labelling for today and the next 4 days
export function getAirQuality(
  aqValueToday,
  aqValueDay2,
  aqValueDay3,
  aqValueDay4,
  aqValueDay5
) {
  return {
    today: getDetailedInfo(aqValueToday),
    day2: getDetailedInfo(aqValueDay2),
    day3: getDetailedInfo(aqValueDay3),
    day4: getDetailedInfo(aqValueDay4),
    day5: getDetailedInfo(aqValueDay5)
  }
}

// Function for determining the highest air quality value
export function getHighestAQDetails(
  aqValueToday,
  aqValueDay2,
  aqValueDay3,
  aqValueDay4,
  aqValueDay5
) {
  const highestAQValue = Math.max(
    aqValueToday,
    aqValueDay2,
    aqValueDay3,
    aqValueDay4,
    aqValueDay5
  )
  return getAirQuality(
    highestAQValue,
    highestAQValue,
    highestAQValue,
    highestAQValue,
    highestAQValue
  ).today
}
