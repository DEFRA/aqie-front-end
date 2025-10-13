''
import { WELSH_TITLE } from '../constants.js'

// Welsh page not found constant
export const PAGE_NOT_FOUND_CY = 'Tudalen heb ei chanfod'
const ERROR_TITLE = 'Mae yna broblem'
const WELSH_SERVICE_NAME = 'Gwirio ansawdd aer'
const WELSH_SERVICE_NAME_SPACED = 'Gwirio ansawdd aer '
const DAQI_DESCRIPTION =
  "Mae'r mynegai ansawdd aer dyddiol(DAQI) yn dweud wrthoch chi am lefelau llygredd aer. Mae'n darparu cyngor iechyd ar gyfer y lefelau presennol."

// Common page title patterns for Welsh
const WELSH_PAGE_TITLE_BASE = `${WELSH_SERVICE_NAME} - GOV.UK`
const createWelshPageTitle = (prefix) =>
  prefix ? `${prefix} - ${WELSH_SERVICE_NAME} - GOV.UK` : WELSH_PAGE_TITLE_BASE

/**
 * Welsh translations for navigation, search, and authentication components
 */
export const navigationTranslationsWelsh = {
  home: {
    pageTitle: WELSH_PAGE_TITLE_BASE,
    heading: `${WELSH_TITLE}`,
    caption: DAQI_DESCRIPTION,
    summaryText:
      'Sut y gall lefelau gwahanol o lygredd aer effeithio ar iechyd',
    page: `${WELSH_TITLE}`,
    paragraphs: {
      a: 'Defnyddiwch y gwasanaeth yma:',
      b: 'i wirio ansawdd yr aer mewn ardal leol',
      c: 'i ddod o hyd i wybodaeth am lygryddion aer',
      d: 'i ddod o hyd i wybodaeth a chyfarwyddyd ar iechyd'
    },
    button: 'Dechrau nawr',
    description:
      "Gwiriwch ansawdd aer eich ardal leol a'r rhagolygon llygredd aer am y 5 diwrnod nesaf. Hefyd, mynnwch gyngor iechyd i leihau'ch amlygiad i lygryddion."
  },
  searchLocation: {
    pageTitle: createWelshPageTitle('Ble hoffech chi wirio?'),
    heading: WELSH_SERVICE_NAME_SPACED,
    page: 'search-location',
    serviceName: WELSH_SERVICE_NAME_SPACED,
    searchParams: {
      label: {
        text: 'Ble hoffech chi wirio?'
      },
      hint: {
        text1: 'Rhowch leoliad neu god post',
        text2: 'Rhowch god post'
      },
      locations: {
        a: 'Lloegr, Yr Alban, Cymru',
        b: 'Gogledd Iwerddon'
      }
    },
    button: 'Parhau',
    errorText: {
      radios: {
        title: ERROR_TITLE,
        list: {
          text: 'Dewiswch lle rydych chi am wirio'
        }
      },
      uk: {
        fields: {
          title: ERROR_TITLE,
          list: {
            text: 'Rhowch leoliad neu god post'
          }
        }
      },
      ni: {
        fields: {
          title: ERROR_TITLE,
          list: {
            text: 'Rhowch god post'
          }
        }
      }
    },
    description:
      "Chwiliwch am ansawdd aer unrhyw ardal leol. Hefyd, mynnwch gyngor iechyd am lygredd aer a sut i leihau'ch amlygiad iddo."
  },
  notFoundLocation: {
    heading: WELSH_SERVICE_NAME_SPACED,
    paragraphs: {
      a: 'Rydyn ni wedi methu dod o hyd i',
      b: "Os buoch chi'n chwilio am le yng Nghymru, Lloegr neu'r Alban, fe ddylech chi:",
      c: "gwirio'r sillafu",
      d: 'rhoi lleoliad ehangach',
      e: 'rhoi cod post cywir',
      f: "Os buoch chi'n chwilio am le yng Ngogledd Iwerddon, Gwirio eich bod wedi rhoi'r cod post cywir.",
      g: 'Ewch yn ôl i chwilio am leoliad',
      h: PAGE_NOT_FOUND_CY
    }
  },
  notFoundUrl: {
    nonService: {
      pageTitle: createWelshPageTitle("Ni allem ddod o hyd i'r dudalen hon"),
      heading: "Ni allem ddod o hyd i'r dudalen hon",
      paragraphs: {
        a: 'Ewch yn ôl i ansawdd aer',
        b: 'If you pasted the web address, check you copied the entire address.',
        c: 'Contact the ',
        d: 'air quality team',
        e: ' if you continue to get this error message.'
      }
    },
    serviceAPI: {
      heading: "Ni allem ddod o hyd i'r dudalen hon",
      paragraphs: {
        a: 'Ewch yn ôl i ansawdd aer'
      }
    }
  },
  multipleLocations: {
    titlePrefix: 'Ansawdd aer –',
    pageTitle: WELSH_PAGE_TITLE_BASE,
    title: 'Lleoliadau yn cyfateb',
    heading: WELSH_SERVICE_NAME_SPACED,
    serviceName: WELSH_SERVICE_NAME_SPACED,
    paragraphs: {
      a: "Canfuwyd mwy nag un cyfatebiaeth ar gyfer eich lleoliad. Dewiswch y lleoliad cywir o'r opsiynau canlynol:",
      b: 'Fel arall,',
      c: 'ceisiwch chwilio eto'
    },
    description:
      "Gwiriwchansawdd aer eich ardal leol a'r rhagolygonllygredd aer am y 5 diwrnod nesaf. Hefyd,mynnwch gyngor iechyd i leihau'ch amlygiad ilygryddion."
  },
  phaseBanner: {
    paragraphs: {
      a: 'Beta',
      b: 'Rhowch eich',
      c: 'adborth',
      d: 'ar y gwasanaeth newydd hwn'
    }
  },
  backlink: {
    text: 'Newid lleoliad'
  },
  dailySummaryTexts: {
    paragraphs: {
      b: 'Heddiw',
      c: 'Yfory',
      d: 'Rhagolygon'
    }
  }
}

// Welsh month names for calendar use
export const calendarWelsh = [
  'Ionawr',
  'Chwefror',
  'Mawrth',
  'Ebrill',
  'Mai',
  'Mehefin',
  'Gorffennaf',
  'Awst',
  'Medi',
  'Hydref',
  'Tachwedd',
  'Rhagfyr'
]
