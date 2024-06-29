export const commonMessages = {
  low: {
    values: [1, 2, 3],
    advice: 'Mwynhewch eich gweithgareddau awyr agored arferol.',
    atrisk: {
      adults: 'Mwynhewch eich gweithgareddau awyr agored arferol.',
      asthma: 'Mwynhewch eich gweithgareddau awyr agored arferol.',
      oldPeople: 'Mwynhewch eich gweithgareddau awyr agored arferol.'
    },
    outlook:
      'The current spell of unsettled weather will continue, helping to keep air pollution levels low across the UK during today.'
  },
  moderate: {
    values: [4, 5, 6],
    advice:
      'I’r rhan fwyaf o bobl, dyw amlygiad byrdymor i lefelau cymedrol o lygredd aer ddim yn broblem.',
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
  high: {
    values: [7, 8, 9],
    advice:
      'Dylai unrhyw un sy’n profi anghysur fel dolur llygaid, peswch neu ddolur gwddf ystyried lleihau eu gweithgareddau, yn enwedig yn yr awyr agored.',
    atrisk: {
      adults:
        'Dylai oedolion sydd â phroblemau’r galon leihau ymdrech gorfforol egnïol, yn arbennig yn yr awyr agored, yn enwedig os ydynt yn profi symptomau.',
      asthma:
        'Efallai y bydd pobl sydd ag asthma yn gweld bod angen defnyddio’u hnanadlydd llliniaru yn amlach.',
      oldPeople: 'Dylai pobl hŷn leihau eu hymdrech gorfforol.'
    },
    outlook:
      'Mae disgwyl i dymheredd cynnes gynyddu lefelau llygredd i lefel uchel ar draws sawl ardal heddiw.'
  },
  veryHigh: {
    values: [10],
    advice:
      'Ewch ati i leihau’ch ymdrech gorfforol, yn enwedig yn yr awyr agored, yn arbennig os ydych chi’n profi symptomau fel peswch neu ddolur gwddf.',
    atrisk: {
      adults:
        'Dylai oedolion sydd â phroblemau’r galon osgoi gweithgareddau corfforol egnïol.',
      asthma:
        'Efallai y bydd angen i bobl sydd ag asthma ddefnyddio’u hanadlydd lliniaru yn amlach.',
      oldPeople: 'Dylai pobl hŷn osgoi gweithgareddau corfforol egnïol.'
    },
    outlook:
      'Nid yw’r tywydd poeth presennol yn dangos unrhyw arwyddion o ad- daliad, gan achosi i lefelau llygredd aer barhau’n uchel iawn ar draws sawl ardal heddiw.'
  },
  unknown: {
    advice: 'Dim data ar gael.'
  }
}

export function getCommonMessage(band) {
  return commonMessages[band] || commonMessages.unknown
}

export function getAirQuality(aqValue) {
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
    10: { band: 'veryHigh', readableBand: 'uchel iawn' }
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
    outlook: message.outlook
  }
}
