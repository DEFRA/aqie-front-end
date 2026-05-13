const breachesContentEn = {
  pageTitle: 'Air pollution breaches',
  heading: 'Air pollution breaches',
  intro: {
    legal:
      'The <a href="https://www.legislation.gov.uk/uksi/2010/1001/contents" class="govuk-link">Air Quality Standards Regulations (2010)</a> sets out the legal safe limits for specific air pollutants.',
    actions:
      'When a pollutant goes over (breaches) its legal safe limit in one area, it may be a serious health risk to people nearby. <a href="/actions-reduce-exposure?lang=en" class="govuk-link">Find out what to do if you’re in an area with an active air pollution breach</a>.',
    measured: 'Air pollution levels across the UK are measured hourly.'
  },
  active: {
    heading: 'Active breaches',
    countMessage:
      'There is currently <b>{count}</b> active air pollution breach',
    timingMessage:
      'This alert will stay active until 24 hours after the last measured breach. This is currently expected to be in about 2 hours.',
    labels: {
      monitoringLocation: 'Monitoring location',
      pollutant: 'Pollutant',
      alertStarted: 'Alert started'
    },
    whatCausesPrefix: 'What causes high ',
    whatCausesSuffix: ' levels?'
  },
  past: {
    heading: 'Past breaches',
    subheading: 'Recorded in the last 12 months',
    showText: 'Show',
    hideText: 'Hide',
    labels: {
      alertRegion: 'Alert region',
      monitoringArea: 'Monitoring area',
      pollutant: 'Pollutant',
      dataSource: 'Data source',
      alertPeriod: 'Alert period'
    },
    fromPrefix: 'From',
    toPrefix: 'To'
  }
}

const breachesContentCy = {
  pageTitle: 'Torriadau llygredd aer',
  heading: 'Torriadau llygredd aer',
  intro: {
    legal:
      'Mae <a href="https://www.legislation.gov.uk/uksi/2010/1001/contents" class="govuk-link">Rheoliadau Safonau Ansawdd Aer (2010)</a> yn nodi’r terfynau cyfreithiol diogel ar gyfer llygryddion aer penodol.',
    actions:
      'Pan fydd llygrydd yn mynd dros (torri) ei derfyn cyfreithiol diogel mewn un ardal, gall hyn fod yn risg iechyd ddifrifol i bobl gerllaw. <a href="/camau-lleihau-amlygiad/cy?lang=cy" class="govuk-link">Darganfyddwch beth i’w wneud os ydych mewn ardal â thorriad llygredd aer gweithredol</a>.',
    measured: 'Mae lefelau llygredd aer ledled y DU yn cael eu mesur bob awr.'
  },
  active: {
    heading: 'Torriadau gweithredol',
    countMessage:
      'Ar hyn o bryd mae <b>{count}</b> torriad llygredd aer gweithredol',
    timingMessage:
      'Bydd y rhybudd hwn yn aros yn weithredol tan 24 awr ar ôl y torriad mesuredig diwethaf. Ar hyn o bryd disgwylir hyn mewn tua 2 awr.',
    labels: {
      monitoringLocation: 'Lleoliad monitro',
      pollutant: 'Llygrydd',
      alertStarted: 'Dechreuodd y rhybudd'
    },
    whatCausesPrefix: 'Beth sy’n achosi lefelau uchel o ',
    whatCausesSuffix: '?'
  },
  past: {
    heading: 'Torriadau blaenorol',
    subheading: 'Wedi’u cofnodi yn y 12 mis diwethaf',
    showText: 'Dangos',
    hideText: 'Cuddio',
    labels: {
      alertRegion: 'Rhanbarth rhybudd',
      monitoringArea: 'Ardal fonitro',
      pollutant: 'Llygrydd',
      dataSource: 'Ffynhonnell data',
      alertPeriod: 'Cyfnod rhybudd'
    },
    fromPrefix: 'O',
    toPrefix: 'Tan'
  }
}

export { breachesContentEn, breachesContentCy }
