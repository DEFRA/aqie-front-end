''
import { ACTIONS_REDUCE_EXPOSURE_ROUTE_EN } from '../constants.js'

const DAQI_INDEX_LOW = 1
const DAQI_INDEX_LOW_MID = 2
const DAQI_INDEX_MID = 3
const DAQI_INDEX_MODERATE_START = 4
const DAQI_INDEX_MODERATE_MID = 5
const DAQI_INDEX_MODERATE_END = 6
const DAQI_INDEX_HIGH_START = 7
const DAQI_INDEX_HIGH_MID = 8
const DAQI_INDEX_HIGH_END = 9
const DAQI_INDEX_VERY_HIGH = 10

export const warningMessages = {
  forecastWarning:
    '{level} levels of air pollution are predicted in this location from {weekday}.'
}

export const commonMessages = {
  low: {
    values: [DAQI_INDEX_LOW, DAQI_INDEX_LOW_MID, DAQI_INDEX_MID],
    // '' AQC-657: Removed redundant legacy phrase "Enjoy your usual outdoor activities." after rebase; updated copy for low level
    advice:
      'For most people, short term exposure to low levels of air pollution is not an issue.',
    insetText: `<p>For most people, short term exposure to low levels of air pollution is not an issue. Continue your usual outdoor activities.</p>

<p>Some people might experience symptoms due to air pollution, even when levels are low.</p>

<p>Adults and children with lung or heart conditions are at greater risk of experiencing symptoms.</p>
<p>Symptoms could include:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>coughing</li>
    <li>chest tightness and pain</li>
    <li>difficulty breathing</li>
    <li>worsening of asthma symptoms</li>
    <li>worsening of heart-related symptoms, such as heart palpitations</li>
    <li>worsening of chronic obstructive pulmonary disease (COPD) symptoms</li>
</ul>
<p>Follow your doctor or nurse's usual advice about physically demanding activities and managing your condition.</p>
<p>Follow your agreed management plan if you have one – for example, an asthma action plan. Ask your doctor or nurse for a plan if you do not have one.</p>
<p>Also consider the impact of other triggers on your symptoms – for example, high pollen outside or poor air quality indoors.</p>`,
    atrisk: {
      // '' Provide distinct at-risk summaries instead of redundant generic sentence
      adults: 'Some people may experience symptoms, even when levels are low.',
      asthma: 'People with asthma should follow their usual management plan.',
      oldPeople:
        'Older people with heart or lung conditions should follow usual advice.'
    },
    outlook:
      'The current spell of unsettled weather will continue, helping to keep air pollution levels low across the UK during today.'
  },
  moderate: {
    values: [
      DAQI_INDEX_MODERATE_START,
      DAQI_INDEX_MODERATE_MID,
      DAQI_INDEX_MODERATE_END
    ],
    advice:
      'For most people, short term exposure to moderate levels of air pollution is not an issue.',
    insetText: `<p>For most people, short term exposure to moderate levels of air pollution is not an issue. Continue your usual outdoor activities. However, if you are experiencing symptoms, try to reduce your exposure to air pollution.</p>

<h3 class="govuk-heading-s">Short term air pollution exposure</h3>

<p>Short term exposure (over hours or days) can cause a range of health impacts, including:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>coughing</li>
    <li>eye, nose, and throat irritation</li>
    <li>chest tightness and pain</li>
    <li>difficulty breathing</li>
    <li>worsening of asthma symptoms</li>
    <li>worsening of heart-related symptoms, such as heart palpitations</li>
    <li>worsening of chronic obstructive pulmonary disease (COPD) symptoms</li>
</ul>

<p>Symptoms could start within hours or several days after exposure to air pollution.</p>

<p>Speak to your doctor or nurse if:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>you have new symptoms</li>
    <li>your symptoms get worse</li>
    <li>your symptoms do not get better after a week</li>
</ul>

<p>Also consider the impact of other triggers on your symptoms – for example, high pollen outside or poor air quality indoors.</p>

<h3 class="govuk-heading-s">Advice for adults and children with lung or heart conditions</h3>

<p>Try to adapt physically demanding activities outdoors, especially if your symptoms get worse.</p>
<p>Follow your agreed management plan if you have one – for example, an asthma action plan. Ask your doctor or nurse for a plan if you do not have one.</p>`,
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
    values: [DAQI_INDEX_HIGH_START, DAQI_INDEX_HIGH_MID, DAQI_INDEX_HIGH_END],
    advice:
      'Anyone experiencing discomfort such as sore eyes, cough or sore throat should consider reducing activity, particularly outdoors.',
    insetText: `<p>Try to <a class="govuk-link" href="${ACTIONS_REDUCE_EXPOSURE_ROUTE_EN}?lang=en">reduce your exposure to air pollution</a>, especially if you're experiencing symptoms.</p>

<h3 class="govuk-heading-s">Short term air pollution exposure</h3>

<p>Short term exposure (over hours or days) can cause a range of health impacts, including:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>coughing</li>
    <li>eye, nose, and throat irritation</li>
    <li>chest tightness and pain</li>
    <li>difficulty breathing</li>
    <li>worsening of asthma symptoms</li>
    <li>worsening of heart-related symptoms, such as heart palpitations</li>
    <li>worsening of chronic obstructive pulmonary disease (COPD) symptoms</li>
</ul>

<p>Symptoms could start within hours or several days after exposure to air pollution.</p>

<p>Speak to your doctor or nurse if:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>you have new symptoms</li>
    <li>your symptoms get worse</li>
    <li>your symptoms do not get better after a week</li>
</ul>

<p>Also consider the impact of other triggers on your symptoms – for example, high pollen outside or poor air quality indoors.</p>

<h3 class="govuk-heading-s">Advice for adults and children with lung or heart conditions, and older people</h3>

<p>You should adapt physically demanding activities outdoors, especially if your symptoms get worse.</p>
<p>Follow your agreed management plan if you have one – for example, an asthma action plan. Ask your doctor or nurse for a plan if you do not have one.</p>`,
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
    values: [DAQI_INDEX_VERY_HIGH],
    advice:
      'Reduce physical exertion, particularly outdoors, especially if you experience symptoms such as cough or sore throat.',
    insetText: `<p>Try to <a class="govuk-link" href="${ACTIONS_REDUCE_EXPOSURE_ROUTE_EN}?lang=en">reduce your exposure to air pollution</a>, especially if you're experiencing symptoms.</p>

<h3 class="govuk-heading-s">Short term air pollution exposure</h3>

<p>Short term exposure (over hours or days) can cause a range of health impacts, including:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>coughing</li>
    <li>eye, nose, and throat irritation</li>
    <li>chest tightness and pain</li>
    <li>difficulty breathing</li>
    <li>worsening of asthma symptoms</li>
    <li>worsening of heart-related symptoms, such as heart palpitations</li>
    <li>worsening of chronic obstructive pulmonary disease (COPD) symptoms</li>
</ul>

<p>Symptoms could start within hours or several days after exposure to air pollution.</p>

<p>Speak to your doctor or nurse if:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>you have new symptoms</li>
    <li>your symptoms get worse</li>
    <li>your symptoms do not get better after a week</li>
</ul>

<p>Also consider the impact of other triggers on your symptoms – for example, high pollen outside or poor air quality indoors.</p>

<h3 class="govuk-heading-s">Advice for adults and children with lung or heart conditions, and older people</h3>

<p>You should adapt physically demanding activities outdoors, especially if your symptoms get worse.</p>
<p>Follow your agreed management plan if you have one – for example, an asthma action plan. Ask your doctor or nurse for a plan if you do not have one.</p>`,
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
    advice: 'No data available.',
    insetText: '<p>No data available.</p>'
  }
}

export function getCommonMessage(band) {
  return commonMessages[band] || commonMessages.unknown
}

export function getDetailedInfo(aqValue = '4') {
  const value = aqValue

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
    insetText: message.insetText, // '' AQC-657: Include insetText for dynamic health advice display
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
