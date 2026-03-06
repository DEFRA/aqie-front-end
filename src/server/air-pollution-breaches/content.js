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
    whatCausesSuffix: ' levels?',
    lastUpdatedPrefix: 'Last updated'
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
    noInformation: 'No information available',
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
    whatCausesSuffix: '?',
    lastUpdatedPrefix: 'Diweddarwyd ddiwethaf'
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
    noInformation: 'Dim gwybodaeth ar gael',
    fromPrefix: 'O',
    toPrefix: 'Tan'
  }
}

const activeBreachesEn = [
  {
    region: 'East of England',
    monitoringLocation: 'Loughborough Thorpe Acre',
    pollutantName: 'Ozone',
    pollutantLink: '/pollutants/ozone?lang=en',
    alertStartedText: 'About 10 hours ago (5:33am, 6 March 2026)',
    lastUpdatedText: '2 hours ago (1:42pm)'
  }
]

const activeBreachesCy = [
  {
    region: 'Dwyrain Lloegr',
    monitoringLocation: 'Loughborough Thorpe Acre',
    pollutantName: 'Oson',
    pollutantLink: '/llygryddion/oson/cy?lang=cy',
    alertStartedText: 'Tua 10 awr yn ôl (5:33am, 6 Mawrth 2026)',
    lastUpdatedText: '2 awr yn ôl (1:42pm)'
  }
]

const pastBreachesEn = [
  {
    title: 'Birmingham Hall Green, West Midlands, England (2 August 2025)',
    alertRegion: 'West Midlands, England',
    monitoringArea: 'Birmingham Hall Green',
    pollutantName: 'Ozone',
    pollutantLink: '/pollutants/ozone?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '12:02pm, 2 August 2025',
    alertPeriodTo: '12:02pm, 3 August 2025'
  },
  {
    title: 'London Bloomsbury, Greater London, England (21 July 2025)',
    alertRegion: 'Greater London, England',
    monitoringArea: 'London Bloomsbury',
    pollutantName: 'PM2.5',
    pollutantLink: '/pollutants/particulate-matter-25?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '12:02pm, 21 July 2025',
    alertPeriodTo: '12:02pm, 22 July 2025'
  },
  {
    title: 'London Honor Oak Park, Greater London, England (5 July 2025)',
    noInformation: true
  },
  {
    title: 'London N. Kensington, Greater London, England (25 June 2025)',
    noInformation: true
  }
]

const pastBreachesCy = [
  {
    title: 'Birmingham Hall Green, Gorllewin Canolbarth Lloegr (2 Awst 2025)',
    alertRegion: 'Gorllewin Canolbarth Lloegr',
    monitoringArea: 'Birmingham Hall Green',
    pollutantName: 'Oson',
    pollutantLink: '/llygryddion/oson/cy?lang=cy',
    dataSource: 'Rhwydwaith Awtomatig Trefol a Gwledig (AURN)',
    alertPeriodFrom: '12:02pm, 2 Awst 2025',
    alertPeriodTo: '12:02pm, 3 Awst 2025'
  },
  {
    title: 'London Bloomsbury, Llundain Fwyaf (21 Gorffennaf 2025)',
    alertRegion: 'Llundain Fwyaf',
    monitoringArea: 'London Bloomsbury',
    pollutantName: 'PM2.5',
    pollutantLink: '/llygryddion/mater-gronynnol-25/cy?lang=cy',
    dataSource: 'Rhwydwaith Awtomatig Trefol a Gwledig (AURN)',
    alertPeriodFrom: '12:02pm, 21 Gorffennaf 2025',
    alertPeriodTo: '12:02pm, 22 Gorffennaf 2025'
  },
  {
    title: 'London Honor Oak Park, Llundain Fwyaf (5 Gorffennaf 2025)',
    noInformation: true
  },
  {
    title: 'London N. Kensington, Llundain Fwyaf (25 Mehefin 2025)',
    noInformation: true
  }
]

export {
  breachesContentEn,
  breachesContentCy,
  activeBreachesEn,
  activeBreachesCy,
  pastBreachesEn,
  pastBreachesCy
}
