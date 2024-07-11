/* eslint-disable prettier/prettier */
export const monitoringSites = [
  {
    site_name: 'Glazebury',
    distance: 3.3,
    site_type: 'rural-site',
    pollutants: [
      {
        type: 'ozone',
        measurement: 39.914,
        trend: 'Rising',
        band: 'Low2',
        aqi: 2,
        low_range: '0 to 100'
      },
      {
        type: 'nitrogen-dioxide',
        measurement: 220.436,
        trend: 'Falling',
        band: 'Moderate',
        aqi: 4,
        low_range: '0 to 200'
      },
      {
        type: 'particulate-matter10',
        measurement: 8.113,
        trend: 'Falling',
        band: 'Low',
        aqi: 1,
        low_range: '0 to 35'
      },
      {
        type: 'particulate-matter2',
        measurement: 37.2,
        trend: 'Falling',
        band: 'Moderate',
        aqi: 4,
        low_range: '0 to 35'
      }
    ]
  },
  {
    site_name: 'Salford Eccles',
    distance: 5.3,
    site_type: 'urban-site',
    pollutants: [
      {
        type: 'ozone',
        measurement: 39.914,
        trend: 'Rising',
        band: 'Low',
        aqi: 2,
        low_range: '0 to 100'
      },
      {
        type: 'nitrogen-dioxide',
        measurement: 219.436,
        trend: 'Rising',
        band: 'Moderate',
        aqi: 4,
        low_range: '0 to 200'
      },
      {
        type: 'sulphur-dioxide',
        measurement: 220.436,
        trend: 'Steady',
        band: 'Moderate',
        aqi: 4,
        low_range: '0 to 200'
      },
      {
        type: 'particulate-matter10',
        measurement: 8.113,
        trend: 'Falling',
        band: 'Low',
        aqi: 1,
        low_range: '0 to 35'
      },
      {
        type: 'particulate-matter2',
        measurement: 37.2,
        trend: 'Falling',
        band: 'Moderate',
        aqi: 4,
        low_range: '0 to 35'
      }
    ]
  },
  {
    site_name: 'Bury Whitefield Roadside',
    distance: 7.6,
    site_type: 'Traffic Urban',
    pollutants: [
      {
        type: 'nitrogen-dioxide',
        measurement: 150.289,
        trend: 'Rising',
        band: 'Low',
        aqi: 3,
        low_range: '0 to 200'
      },
      {
        type: 'particulate-matter10',
        measurement: 7.623,
        trend: 'Falling',
        band: 'Low',
        aqi: 1,
        low_range: '0 to 35'
      },
      {
        type: 'particulate-matter2',
        measurement: 41.8,
        trend: 'Falling',
        band: 'Moderate',
        aqi: 4,
        low_range: '0 to 35'
      }
    ]
  }
]

// Pollutant reference data

export const pollutantTypes = {
  NO2: {
    title: 'Nitrogen deuocsid',
    href: '/llygryddion/nitrogen-deuocsid/cy',
    low_range: '0 i 200'
  },
  MP10: {
    title: 'PM10',
    href: '/llygryddion/mater gronynnol-10/cy',
    low_range: '0 i 50'
  },
  GE10: {
    title: 'PM10',
    href: '/llygryddion/mater gronynnol-10/cy',
    low_range: '0 i 50'
  },
  PM25: {
    title: 'PM2.5',
    href: '/llygryddion/mater gronynnol-25/cy',
    low_range: '0 i 35'
  },
  O3: {
    title: 'Osôn',
    href: '/llygryddion/oson/cy',
    low_range: '0 i 100'
  },
  SO2: {
    title: 'Sylffwr deuocsid',
    href: '/llygryddion/sylffwr-deuocsid/cy',
    low_range: '0 i 100'
  }
}

// Used to populate toggletips on monitoring sites //

// Urban traffic area -Traffic Urban
// Urban industrial area - Industrial Urban
// Suburban industrial area - Industrial Suburban
// Suburban background area - Background Suburban
// Rural background area - Background Rural
// Urban background area - Background Urban
export const siteTypeDescriptions = {
  'Background Urban':
    "Mae'r ardal fonitro hon wedi'i lleoli mewn dinas neu dref. Mae wedi'i leoli fel nad yw mesuriadau llygryddion yn dod o un ffynhonnell benodol.",
  'Background Suburban':
    "Mae'r ardal fonitro hon ar gyrion ardal drefol neu mewn ardal ei hun. Mae wedi'i leoli fel nad yw mesuriadau llygryddion yn dod o un ffynhonnell benodol.",
  'Background Rural':
    "Mae'r ardal fonitro hon mewn aneddiadau bach neu ardaloedd ag ecosystemau, coedwigoedd neu gnydau naturiol. Mae wedi'i leoli fel nad yw mesuriadau llygryddion yn dod o un ffynhonnell benodol.",
  'Industrial Suburban':
    "Mae'r ardal fonitro hon ar gyrion ardal drefol neu mewn ardal ar ei phen ei hun ac i lawr y gwynt o ffynhonnell ddiwydiannol.",
  'Industrial Urban':
    "Mae'r ardal fonitro hon wedi'i lleoli mewn dinas neu dref i lawr y gwynt o ffynhonnell ddiwydiannol.",
  'Traffic Urban':
    "Mae'r safle monitro yma wedi'i leoli mewn lleoliad cefndir. Mae wedi cael ei leoli er mwyn sicrhau nad yw mesuriadau llygryddion yn dod o un ffynhonnell benodol. Mae'r safle yma yn groes i'r gwynt o ffynonellau llygredd mewn dinasoedd, ffynonellau diwydiannol ac ardaloedd gwledig. Bydd y pwynt samplu yma yn rhoi syniad o lefel y llygryddion am sawl cilometr sgwâr."
}
