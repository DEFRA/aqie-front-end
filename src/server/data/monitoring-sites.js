/* eslint-disable prettier/prettier */
// Pollutant reference
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
