// Pollutant reference data

export const pollutantTypes = {
  PM25: {
    title: 'PM2.5',
    href: '/llygryddion/mater-gronynnol-25/cy',
    low_range: '0 i 35'
  },
  PM10: {
    title: 'PM10',
    href: '/llygryddion/mater-gronynnol-10/cy',
    low_range: '0 i 50'
  },
  GE10: {
    title: 'PM10',
    href: '/llygryddion/mater-gronynnol-10/cy',
    low_range: '0 i 50'
  },
  NO2: {
    title: 'Nitrogen deuocsid',
    href: '/llygryddion/nitrogen-deuocsid/cy',
    low_range: '0 i 200'
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
    "Mae'r ardal fonitro hon ar gyrion ardal drefol neu mewn ardal ar ei phen ei hun ac i lawr y gwynt o ffynhonnell ddiwydiannol",
  'Industrial Urban':
    "Mae'r ardal fonitro hon wedi'i lleoli mewn dinas neu dref i lawr y gwynt o ffynhonnell ddiwydiannol.",
  'Traffic Urban':
    'Mae’r ardal fonitro hon wedi’i lleoli mewn dinas neu dref sy’n agos at ffyrdd, traffyrdd neu briffyrdd.'
}
