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
    title: 'Nitrogen dioxide',
    href: '/pollutants/nitrogen-dioxide',
    low_range: '0 to 200'
  },
  MP10: {
    title: 'PM10',
    href: '/pollutants/particulate-matter-10',
    low_range: '0 to 50'
  },
  GE10: {
    title: 'PM10',
    href: '/pollutants/particulate-matter-10',
    low_range: '0 to 50'
  },
  PM25: {
    title: 'PM2.5',
    href: '/pollutants/particulate-matter-25',
    low_range: '0 to 35'
  },
  O3: {
    title: 'Ozone',
    href: '/pollutants/ozone',
    low_range: '0 to 100'
  },
  SO2: {
    title: 'Sulphur dioxide',
    href: '/pollutants/sulphur-dioxide',
    low_range: '0 to 100'
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
    'This monitoring area is located in a city or a town. It is located so pollutant measurements do not come from one specific source.',
  'Background Suburban':
    'This monitoring area is on the outskirts of an urban area or in an area of its own. It is located so pollutant measurements do not come from one specific source.',
  'Background Rural':
    'This monitoring area is in small settlements or areas with natural ecosystems, forests or crops. It is located so pollutant measurements do not come from one specific source.',
  'Industrial Suburban':
    'This monitoring area is on the outskirts of an urban area or in an area of its own and downwind of an industrial source.',
  'Industrial Urban':
    'This monitoring area is located in a city or a town downwind of an industrial source.',
  'Traffic Urban':
    'This monitoring area is located in a city or a town close to roads, motorways or highways.'
}
