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
    href: '/llygryddion /nitrogen-dioxide/cy',
    low_range: '0 to 200'
  },
  MP10: {
    title: 'PM10',
    href: '/llygryddion/mater-gronynnol-10/cy',
    low_range: '0 to 50'
  },
  GE10: {
    title: 'PM10',
    href: '/llygryddion/mater-gronynnol-10/cy',
    low_range: '0 to 50'
  },
  PM25: {
    title: 'PM2.5',
    href: '/llygryddion/mater-gronynnol-25/cy',
    low_range: '0 to 35'
  },
  O3: {
    title: 'Osôn',
    href: '/llygryddion/osôn/cy',
    low_range: '0 to 100'
  },
  SO2: {
    title: 'Sylffwr deuocsid',
    href: '/llygryddion/sylffwr-deuocsid/cy',
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
    "Mae'r safle monitro yma wedi'i leoli ger traffig cerbydau. Mae wedi'i leoli'n agos at ffordd, traffordd neu briffordd.Mae hyn yn golygu ein bod ni'n gwybod bod y llygryddion sydd wedi'u cofnodi yn dod o'r ffynhonnell yma. Rhaid i lygryddion gael eu mesur ar hyd darn o ffordd sy'n fwy na 100 metr o hyd.Bydd y chwiliedydd samplu o leiaf 25 metr i ffwrdd o gyffyrdd mawr a llai na 10 metr o ymyl y ffordd.",
  'Background Suburban':
    "Mae'r safle monitro yma wedi'i leoli mewn lleoliad diwydiannol. Mae safleoedd diwydiannol wedi'u lleoli'n agos at fannau fel: - gweithfeydd pŵer - llosgyddion - gweithfeydd trin gwastraff. Mae'r llygryddion yn cael eu mesur dan y gwynt o'r ffynhonnell ddiwydiannol a'r ardal breswyl agosaf.",
  'Background Rural':
    "Mae'r safle monitro yma wedi'i leoli mewn lleoliad maestrefol. Mae mannau maestrefol naill ai ar eu pen eu hunain neu ar gyrion dinas neu ardal drefol.Maen nhw'n ardaloedd o adeiladau o faint gwahanol a all fod yn agos at y canlynol: - ffermydd - llynnoedd - coedwigoedd. Mae mesuriadau osôn yn cael eu cymryd pan fo yna amlygiad uchel i'r canlynol: - pobl - cnydau sensitif - ecosystemau naturiol",
  'Industrial Suburban':
    "Mae'r safle monitro yma wedi'i leoli mewn ardal drefol. Mae ardal drefol yn ddnas neu dref, lle mae llawer o adeiladau deulawr. O ran mesur osôn, mae ardal drefol yn cynnwys: - adeiladau preswyl - syfleusterau masnachol - parciau - strydoedd mawr neu sgwariau sydd â lefelau isel o draffig - cyfleusterau addysg, chwaraeon a hamdden",
  'Industrial Urban':
    "Mae'r safle monitro yma mewn lleoliad gwledig. Gall safle gwledig fod mewn anheddiad bach neu ardal sydd ag ecosystemau naturiol, coedwigoedd neu gnydau.Mae'r safleoedd dros 20 cilometr i ffwrdd o ddinasoedd a threfi a mwy na 5 cilometr i ffwrdd o'r canlynol: - safleoedd diwydiannol - traffyrdd - ffyrdd mawr",
  'Traffic Urban':
    "Mae'r safle monitro yma wedi'i leoli mewn lleoliad cefndir. Mae wedi cael ei leoli er mwyn sicrhau nad yw mesuriadau llygryddion yn dod o un ffynhonnell benodol. Mae'r safle yma yn groes i'r gwynt o ffynonellau llygredd mewn dinasoedd, ffynonellau diwydiannol ac ardaloedd gwledig. Bydd y pwynt samplu yma yn rhoi syniad o lefel y llygryddion am sawl cilometr sgwâr."
}
