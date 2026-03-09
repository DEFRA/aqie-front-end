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
  },
  {
    region: 'Greater London',
    monitoringLocation: 'London Bloomsbury',
    pollutantName: 'PM2.5',
    pollutantLink: '/pollutants/particulate-matter-25?lang=en',
    alertStartedText: 'About 8 hours ago (7:18am, 6 March 2026)',
    lastUpdatedText: '1 hour ago (2:37pm)'
  },
  {
    region: 'West Midlands',
    monitoringLocation: 'Birmingham Hall Green',
    pollutantName: 'Nitrogen dioxide',
    pollutantLink: '/pollutants/nitrogen-dioxide?lang=en',
    alertStartedText: 'About 6 hours ago (9:06am, 6 March 2026)',
    lastUpdatedText: '45 minutes ago (2:52pm)'
  },
  {
    region: 'Yorkshire and the Humber',
    monitoringLocation: 'Leeds Headingley',
    pollutantName: 'PM10',
    pollutantLink: '/pollutants/particulate-matter-10?lang=en',
    alertStartedText: 'About 5 hours ago (10:11am, 6 March 2026)',
    lastUpdatedText: '35 minutes ago (3:02pm)'
  },
  {
    region: 'South East',
    monitoringLocation: 'Portsmouth Centre',
    pollutantName: 'Sulphur dioxide',
    pollutantLink: '/pollutants/sulphur-dioxide?lang=en',
    alertStartedText: 'About 4 hours ago (11:08am, 6 March 2026)',
    lastUpdatedText: '20 minutes ago (3:17pm)'
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
  },
  {
    title: 'Southampton Centre, South East, England (17 June 2025)',
    alertRegion: 'South East, England',
    monitoringArea: 'Southampton Centre',
    pollutantName: 'Nitrogen dioxide',
    pollutantLink: '/pollutants/nitrogen-dioxide?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '10:14am, 17 June 2025',
    alertPeriodTo: '10:14am, 18 June 2025'
  },
  {
    title: 'Cardiff Centre, South Wales, Wales (9 June 2025)',
    alertRegion: 'South Wales, Wales',
    monitoringArea: 'Cardiff Centre',
    pollutantName: 'PM10',
    pollutantLink: '/pollutants/particulate-matter-10?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '2:32pm, 9 June 2025',
    alertPeriodTo: '2:32pm, 10 June 2025'
  },
  {
    title: 'Newcastle Centre, North East, England (28 May 2025)',
    alertRegion: 'North East, England',
    monitoringArea: 'Newcastle Centre',
    pollutantName: 'Ozone',
    pollutantLink: '/pollutants/ozone?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '9:06am, 28 May 2025',
    alertPeriodTo: '9:06am, 29 May 2025'
  },
  {
    title: 'Leicester University, East Midlands, England (15 May 2025)',
    alertRegion: 'East Midlands, England',
    monitoringArea: 'Leicester University',
    pollutantName: 'PM2.5',
    pollutantLink: '/pollutants/particulate-matter-25?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '6:48am, 15 May 2025',
    alertPeriodTo: '6:48am, 16 May 2025'
  },
  {
    title: 'Liverpool Speke, North West, England (2 May 2025)',
    noInformation: true
  },
  {
    title: 'Manchester Piccadilly, North West, England (20 April 2025)',
    alertRegion: 'North West, England',
    monitoringArea: 'Manchester Piccadilly',
    pollutantName: 'Nitrogen dioxide',
    pollutantLink: '/pollutants/nitrogen-dioxide?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '4:25pm, 20 April 2025',
    alertPeriodTo: '4:25pm, 21 April 2025'
  },
  {
    title: 'Plymouth Centre, South West, England (8 April 2025)',
    alertRegion: 'South West, England',
    monitoringArea: 'Plymouth Centre',
    pollutantName: 'Sulphur dioxide',
    pollutantLink: '/pollutants/sulphur-dioxide?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '1:11pm, 8 April 2025',
    alertPeriodTo: '1:11pm, 9 April 2025'
  },
  {
    title: 'Nottingham Centre, East Midlands, England (31 March 2025)',
    alertRegion: 'East Midlands, England',
    monitoringArea: 'Nottingham Centre',
    pollutantName: 'PM10',
    pollutantLink: '/pollutants/particulate-matter-10?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '11:58am, 31 March 2025',
    alertPeriodTo: '11:58am, 1 April 2025'
  },
  {
    title: 'Belfast Centre, Northern Ireland (23 March 2025)',
    noInformation: true
  },
  {
    title: 'Leeds Centre, Yorkshire and the Humber, England (14 March 2025)',
    alertRegion: 'Yorkshire and the Humber, England',
    monitoringArea: 'Leeds Centre',
    pollutantName: 'Ozone',
    pollutantLink: '/pollutants/ozone?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '3:05pm, 14 March 2025',
    alertPeriodTo: '3:05pm, 15 March 2025'
  },
  {
    title:
      'Sheffield Tinsley, Yorkshire and the Humber, England (2 March 2025)',
    alertRegion: 'Yorkshire and the Humber, England',
    monitoringArea: 'Sheffield Tinsley',
    pollutantName: 'PM2.5',
    pollutantLink: '/pollutants/particulate-matter-25?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '9:44am, 2 March 2025',
    alertPeriodTo: '9:44am, 3 March 2025'
  },
  {
    title: 'Oxford Centre Roadside, South East, England (19 February 2025)',
    noInformation: true
  },
  {
    title: 'Bristol St Pauls, South West, England (11 February 2025)',
    alertRegion: 'South West, England',
    monitoringArea: 'Bristol St Pauls',
    pollutantName: 'Nitrogen dioxide',
    pollutantLink: '/pollutants/nitrogen-dioxide?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '7:20am, 11 February 2025',
    alertPeriodTo: '7:20am, 12 February 2025'
  },
  {
    title: 'Hull Freetown, Yorkshire and the Humber, England (26 January 2025)',
    alertRegion: 'Yorkshire and the Humber, England',
    monitoringArea: 'Hull Freetown',
    pollutantName: 'PM10',
    pollutantLink: '/pollutants/particulate-matter-10?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '5:10pm, 26 January 2025',
    alertPeriodTo: '5:10pm, 27 January 2025'
  },
  {
    title: 'Swansea Centre, South Wales, Wales (15 January 2025)',
    alertRegion: 'South Wales, Wales',
    monitoringArea: 'Swansea Centre',
    pollutantName: 'Sulphur dioxide',
    pollutantLink: '/pollutants/sulphur-dioxide?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '12:01pm, 15 January 2025',
    alertPeriodTo: '12:01pm, 16 January 2025'
  },
  {
    title: 'Cambridge Roadside, East of England (7 January 2025)',
    noInformation: true
  },
  {
    title: 'Derby Centre, East Midlands, England (29 December 2024)',
    alertRegion: 'East Midlands, England',
    monitoringArea: 'Derby Centre',
    pollutantName: 'Ozone',
    pollutantLink: '/pollutants/ozone?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '8:23am, 29 December 2024',
    alertPeriodTo: '8:23am, 30 December 2024'
  },
  {
    title: 'Reading New Town, South East, England (14 December 2024)',
    alertRegion: 'South East, England',
    monitoringArea: 'Reading New Town',
    pollutantName: 'PM2.5',
    pollutantLink: '/pollutants/particulate-matter-25?lang=en',
    dataSource: 'Automatic Urban and Rural Network (AURN)',
    alertPeriodFrom: '10:35am, 14 December 2024',
    alertPeriodTo: '10:35am, 15 December 2024'
  },
  {
    title: 'Exeter Centre, South West, England (3 December 2024)',
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
