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
        band: 'Low',
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

export const siteTypeDescriptions = {
  'Background Urban':
    'This monitoring site is based in an urban area. An urban area is a city or a town, where there are many 2-storey buildings. For the measurement of ozone, an urban area includes parks, residential houses and commercial buildings.',
  'Background Suburban':
    'This monitoring site is based in a suburban location. Suburban areas are located either on their own or on the outskirts of a city or urban area. They are areas of different-sized buildings that may be close to farms, ales and woods.',
  'Traffic Urban':
    'This monitoring site is based near vehicle traffic. It is located close to a road, motorway or highway. This means we know that recorded pollutants come from this source.',
  'Background Rural':
    'This monitoring site is in rural location. A rural site can be in a small settlement or area with natural ecosystems, forests or crops. The sites are more than 20 kilometres from cities and towns and more than 5 kilometres away from industrial sites, motorways and major roads.',
  'Industrial Suburban':
    'This monitoring site is based in an industrial location. The pollutants are measured downwind of the industrial source and the nearest residential area.',
  'Industrial Urban':
    'This monitoring site is based in a background location. It is located to make sure pollutant measurements do not come from one specific source. The site is upwind from pollution sources in cities, industrial sources and rural areas.'
}
