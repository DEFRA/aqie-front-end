import { ACTIONS_REDUCE_EXPOSURE_ROUTE_CY } from '../constants.js'

export const warningMessages = {
  forecastWarning:
    'Rhagwelir lefelau {level} o lygredd aer yn y lleoliad hwn o {weekday}.'
}

export const commonMessages = {
  isel: {
    values: [1, 2, 3],
    advice: 'Mwynhewch eich gweithgareddau awyr agored arferol.',
    insetText: `<p>I’r rhan fwyaf o bobl, dyw amlygiad byrdymor i lefelau isel o lygredd aer ddim yn broblem. Ewch ymlaen â’ch gweithgareddau awyr agored arferol.</p>
<p>Gallai rhai pobl brofi symptomau oherwydd llygredd aer, hyd yn oed pan fo’r lefelau’n isel.</p>
<p>Mae oedolion a phlant sydd â chyflyrau’r ysgyfaint neu’r galon yn wynebu mwy o risg o brofi symptomau.</p>
<p>Gallai’r symptomau gynnwys:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>pesychu</li>
    <li>tyndra a phoen yn y frest</li>
    <li>anhawster anadlu</li>
    <li>symptomau asthma gwaeth</li>
    <li>symptomau gwaeth yn gysylltiedig â’r galon, fel crychguriadau’r galon</li>
    <li>symptomau gwaeth clefyd rhwystrol cronig yr ysgyfaint (COPD)</li>
</ul>
<p>Dilynwch gyngor arferol eich meddyg neu’ch nyrs am weithgareddau sy’n heriol yn gorfforol a rheoli’ch cyflwr.</p>
<p>Dilynwch eich cynllun rheoli cytûn os oes un gennych – er enghraifft, cynllun gweithredu asthma. Gofynnwch i’ch meddyg neu’ch nyrs am gynllun os nad oes un gennych.</p>
<p>Ystyriwch effaith sbardunau eraill ar eich symptomau hefyd – er enghraifft, paill uchel y tu allan neu ansawdd aer gwael dan do.</p>`,
    atrisk: {
      adults: 'Mwynhewch eich gweithgareddau awyr agored arferol.',
      asthma: 'Mwynhewch eich gweithgareddau awyr agored arferol.',
      oldPeople: 'Mwynhewch eich gweithgareddau awyr agored arferol.'
    },
    outlook:
      'The current spell of unsettled weather will continue, helping to keep air pollution levels low across the UK during today.'
  },
  cymedrol: {
    values: [4, 5, 6],
    advice:
      "I'r rhan fwyaf o bobl, dyw amlygiad byrdymor i lefelau cymedrol o lygredd aer ddim yn broblem.",
    insetText: `<h3 class="govuk-heading-s">Amlygiad byrdymor i lygredd aer</h3>
<p>Gall amlygiad byrdymor (dros oriau neu ddyddiau) achosi ystod o effeithiau ar iechyd, gan gynnwys:</p>
<p>Gallai'r symptomau gynnwys:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>pesychu</li>
    <li>llid ar y llygaid, y trwyn a'r gwddf</li>
    <li>tyndra a phoen yn y frest</li>
    <li>anhawster anadlu</li>
    <li>symptomau asthma gwaeth</li>
    <li>symptomau gwaeth yn gysylltiedig â'r galon, fel crychguriadau'r galon</li>
    <li>symptomau gwaeth clefyd rhwystrol cronig yr ysgyfaint (COPD)</li>
</ul>
<p>Os ydych chi'n profi symptomau, ystyriwch leihau gweithgareddau sy'n heriol yn gorfforol, yn enwedig yn yr awyr agored. Cysylltwch â'ch meddyg os yw'ch symptomau yn parhau.</p>
<p>Os oes gennych gyflwr ar yr ysgyfaint neu'r galon, dilynwch gyngor arferol eich meddyg neu'ch nyrs am weithgareddau sy'n heriol yn gorfforol a rheoli'ch cyflwr.</p>
<p>Dilynwch eich cynllun rheoli cytûn os oes un gennych – er enghraifft, cynllun gweithredu asthma. Gofynnwch i’ch meddyg neu’ch nyrs am gynllun os nad oes un gennych.</p>`,
    atrisk: {
      adults:
        'Dylai oedolion sydd â phroblemau’r galon ac sy’n teimlo’n sâl ystyried gwneud ymarfer corff llai egnïol, yn enwedig y tu allan.',
      asthma:
        'Dylai pobl sydd ag asthma fod yn barod i ddefnyddio’u hanadlydd lliniaru.',
      oldPeople:
        'Dylai pobl hŷn ystyried gwneud gweithgareddau llai egnïol, yn enwedig y tu allan.'
    },
    outlook:
      'The influx of warm air from the continent is resulting in moderate air pollution levels throughout many areas today.'
  },
  uchel: {
    values: [7, 8, 9],
    advice:
      "Dylai unrhyw un sy'n profi anghysur fel dolur llygaid, peswch neu ddolur gwddf ystyried lleihau eu gweithgareddau, yn enwedig yn yr awyr agored.",
    insetText: `<p>Ceisiwch <a class="govuk-link" href="${ACTIONS_REDUCE_EXPOSURE_ROUTE_CY}?lang=cy">leihau'ch amlygiad i lygredd aer</a>, yn enwedig os byddwch chi'n profi symptomau.</p>
<h3 class="govuk-heading-s">Amlygiad byrdymor i lygredd aer</h3>
<p>Gall amlygiad byrdymor (dros oriau neu ddyddiau) achosi ystod o effeithiau ar iechyd, gan gynnwys:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>pesychu</li>
    <li>llid ar y llygaid, y trwyn a'r gwddf</li>
    <li>tyndra a phoen yn y frest</li>
    <li>anhawster anadlu</li>
    <li>symptomau asthma gwaeth</li>
    <li>symptomau gwaeth yn gysylltiedig â'r galon, fel crychguriadau'r galon</li>
    <li>symptomau gwaeth clefyd rhwystrol cronig yr ysgyfaint (COPD)</li>
</ul>
<p>Gallai'r symptomau ddechrau o fewn oriau neu sawl diwrnod ar ôl amlygiad i lygredd aer.</p>
<p>Siaradwch â'ch meddyg neu'ch nyrs:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>os oes gennych chi symptomau newydd</li>
    <li>os bydd eich symptomau'n gwaethygu</li>
    <li>os na fydd eich symptomau'n gwella ar ôl wythnos</li>
</ul>
<p>Ystyriwch effaith sbardunau eraill ar eich symptomau hefyd – er enghraifft, paill uchel y tu allan neu ansawdd aer gwael dan do.</p>`,
    atrisk: {
      adults:
        'Dylai oedolion sydd â phroblemau’r galon leihau ymdrech gorfforol egnïol, yn arbennig yn yr awyr agored, yn enwedig os ydynt yn profi symptomau.',
      asthma:
        'Efallai y bydd pobl sydd ag asthma yn gweld bod angen defnyddio’u hnanadlydd llliniaru yn amlach.',
      oldPeople: 'Dylai pobl hŷn leihau eu hymdrech gorfforol.'
    },
    outlook:
      'Warm temperatures are expected to increase pollution levels to high across many areas today.'
  },
  uchelIawn: {
    values: [10],
    advice:
      "Lleihewch ymdrech gorfforol, yn arbennig yn yr awyr agored, yn enwedig os ydych chi'n profi symptomau fel peswch neu ddolur gwddf.",
    insetText: `<p>Ceisiwch <a class="govuk-link" href="${ACTIONS_REDUCE_EXPOSURE_ROUTE_CY}?lang=cy">leihau'ch amlygiad i lygredd aer</a>, yn enwedig os byddwch chi'n profi symptomau.</p>
<h3 class="govuk-heading-s">Amlygiad byrdymor i lygredd aer</h3>
<p>Gall amlygiad byrdymor (dros oriau neu ddyddiau) achosi ystod o effeithiau ar iechyd, gan gynnwys:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>pesychu</li>
    <li>llid ar y llygaid, y trwyn a'r gwddf</li>
    <li>tyndra a phoen yn y frest</li>
    <li>anhawster anadlu</li>
    <li>symptomau asthma gwaeth</li>
    <li>symptomau gwaeth yn gysylltiedig â'r galon, fel crychguriadau'r galon</li>
    <li>symptomau gwaeth clefyd rhwystrol cronig yr ysgyfaint (COPD)</li>
</ul>
<p>Gallai'r symptomau ddechrau o fewn oriau neu sawl diwrnod ar ôl amlygiad i lygredd aer.</p>
<p>Siaradwch â'ch meddyg neu'ch nyrs:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>os oes gennych chi symptomau newydd</li>
    <li>os bydd eich symptomau'n gwaethygu</li>
    <li>os na fydd eich symptomau'n gwella ar ôl wythnos</li>
</ul>
<p>Ystyriwch effaith sbardunau eraill ar eich symptomau hefyd – er enghraifft, paill uchel y tu allan neu ansawdd aer gwael dan do.</p>`,
    atrisk: {
      adults:
        "Dylai oedolion sydd â phroblemau'r galon leihau ymdrech gorfforol egnïol, yn arbennig yn yr awyr agored, yn enwedig os ydynt yn profi symptomau.",
      asthma:
        "Efallai y bydd pobl sydd ag asthma yn gweld bod angen defnyddio'u hnanadlydd llliniaru yn amlach.",
      oldPeople: 'Dylai pobl hŷn leihau eu hymdrech gorfforol.'
    },
    outlook:
      'The current heatwave shows no signs of relenting, causing air pollution levels to remain very high across many areas today.'
  },
  unknown: {
    advice: 'Dim data ar gael.'
  }
}

export function getCommonMessage(band) {
  return commonMessages[band] || commonMessages.unknown
}

export function getDetailedInfo(aqValue) {
  const value = aqValue || '4'

  const lookup = {
    1: { band: 'isel', readableBand: 'isel' },
    2: { band: 'isel', readableBand: 'isel' },
    3: { band: 'isel', readableBand: 'isel' },
    4: { band: 'cymedrol', readableBand: 'cymedrol' },
    5: { band: 'cymedrol', readableBand: 'cymedrol' },
    6: { band: 'cymedrol', readableBand: 'cymedrol' },
    7: { band: 'uchel', readableBand: 'uchel' },
    8: { band: 'uchel', readableBand: 'uchel' },
    9: { band: 'uchel', readableBand: 'uchel' },
    10: { band: 'uchelIawn', readableBand: 'uchel iawn' }
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
    insetText: message.insetText,
    atrisk: message.atrisk,
    outlook: message.outlook,
    ukToday: message.ukToday, // Consider updating these messages to be relevant for each day
    ukTomorrow: message.ukTomorrow,
    ukOutlook: message.ukOutlook
  }
}

// Function to get air quality labelling for today and the next 4 days
export function getAirQualityCy(
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
  return getAirQualityCy(
    highestAQValue,
    highestAQValue,
    highestAQValue,
    highestAQValue,
    highestAQValue
  ).today
}
