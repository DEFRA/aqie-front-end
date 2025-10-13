// Welsh translations module for DAQI display, pollutant information pages, and air quality data
import { WELSH_TITLE } from '../constants.js'

const WELSH_SERVICE_NAME = 'Gwirio ansawdd aer'
const GOVUK_SUFFIX = ' – GOV.UK'
const pageTitleTemplate = (pollutant) =>
  `${pollutant} – ${WELSH_SERVICE_NAME}${GOVUK_SUFFIX}`
const HEADER_TEXT = WELSH_TITLE

// Common Welsh exposure phrases
const SHORT_TERM_EXPOSURE_PREFIX = 'Gall amlygiad byrdymor'
const LONG_TERM_EXPOSURE_PREFIX = 'Gall amlygiad hirdymor'

// Common Welsh health effects
const ASTHMA_ATTACKS_WELSH = 'pyliau asthma'
const ASTHMA_WELSH = 'asma'
const HEALTH_EFFECTS_WELSH = 'Effeithiau ar iechyd'

// Common Welsh body parts and symptoms
const EYES_WELSH = 'llygaid'
const NOSE_WELSH = 'trwyn'
const THROAT_WELSH = 'gwddf'
const EYES_NOSE_THROAT_INFLAMMATION = "llid yn y llygaid, y trwyn a'r gwddf"
const RESPIRATORY_INFECTIONS = "heintiau'r anadl"

// Common Welsh health conditions and effects
const COPD_WELSH = 'clefyd rhwystrol cronig yr ysgyfaint (COPD)'
const CANCER_WELSH = 'canser'
const HEART_PROBLEMS_WELSH = 'materion y galon'
const LUNG_FUNCTION_WELSH = 'gweithrediad yr ysgyfaint'

// Common Welsh pollutant sources
const COMMERCIAL_MANUFACTURING = 'gweithgynhyrchu masnachol'
const FOOD_MANUFACTURING = 'gweithgynhyrchu bwyd'

// Common Welsh health effects patterns
const SHORT_EFFECTS_PM10 = 'Mae effeithiau iechyd byrdymor PM10 yn cynnwys:'
const LONG_EFFECTS_PM10 = 'Mae effeithiau hirdymor PM10 yn cynnwys:'
const SHORT_EFFECTS_PM25 =
  "Gall effeithiau iechyd byrdymor PM2.5 gynnwys cyflyrau sy'n gwaethygu, fel:"
const LONG_EFFECTS_PM25 = 'Gall effeithiau hirdymor PM2.5 gynnwys:'

/**
 * Welsh translations for DAQI display and pollutant information pages
 */
export const daqiTranslationsWelsh = {
  daqi: {
    description: {
      a: 'Gwiriwch ansawdd aer',
      b: ". Mynnwch gyngor ar iechyd, gwybodaeth am lygryddion a chanllawiau ar sut i leihau'ch amlygiad i lygrydd aer."
    },
    caption:
      "Mae'r mynegai ansawdd aer dyddiol(DAQI) yn dweud wrthoch chi am lefelau llygredd aer.Mae'n darparu cyngor iechyd ar gyfer y lefelau presennol.",
    summaryText:
      'Sut y gall lefelau gwahanol o lygredd aer effeithio ar iechyd',
    predictionLinkText: 'Gwybodaeth am',
    predictionLink: "sut mae llygredd aer yn cael ei rag-weld a'i fesur.",
    headText: {
      a: 'Lefel',
      b: 'Mynegai',
      c: 'Cyngor iechyd'
    },
    healthAdvice: {
      paragraphs: {
        a: 'Iechyd cyngor ar gyfer lefelau',
        b: 'o lygredd aer'
      }
    },
    pageTexts: {
      a: 'Crynodeb o lygredd aer y UK',
      b: 'Y diweddariad diwethaf ddoe am 5am',
      c: 'Sut y gall llygryddion aer effeithio ar eich iechyd',
      d: "Llygryddion aer sy'n cael eu monitro gerllaw"
    },
    headings: {
      main: 'Mynegai Ansawdd Aer Dyddiol (DAQI)',
      predictedLevels: 'Lefelau llygredd aer a ragwelir'
    },
    tabs: {
      today: 'Heddiw'
    },
    pollutantText: {
      a: 'Mater gronynnol (PM)',
      b: "Mae mater gronynnol yn ddarnau mân iawn o ronynnau solet neu hylif sydd wedi'u dal yn yr awyr.Maen nhw'n dod o ffynonellau fel teiars ceir, breciau, pibellau gwacáu, llwch, llosgi coed a phaill.",
      c: 'Yn cael eu cynhyrchu trwy losgi tanwyddau ffosil, er enghraifft, mewn ceir, gorsafoedd pŵer a ffatrïoedd.',
      d: 'Nwyon'
    },
    pollutantsNames: {
      a: 'PM2.5',
      b: 'PM10',
      c: 'Nitrogen deuocsid',
      d: 'Osôn',
      e: 'Sylffwr deuocsid'
    },
    pollutantTable: {
      a: 'milltir i ffwrdd',
      b: 'Llygrydd',
      c: 'Diweddaraf',
      d: 'Lefel',
      e: 'Amrediad isel',
      f: 'Mesur diweddaraf yn',
      g: 'ar'
    },
    levels: {
      a: 'Isel',
      b: 'Cymedrol',
      c: 'Uchel',
      d: 'Uchel iawn'
    },
    tooltipText: {
      level:
        'Cyfrifir y lefel ar sail y mynegai ansawdd aer dyddiol (DAQI). Mae 4 lefel: isel, cymedrol, uchel ac uchel iawn.',
      latest1: "Mae'r darlleniadau'n cael eu mesur bob awr. Mae'r uned µg/m",
      latest2:
        ' yn sefyll am ficrogramau (miliynfed o gram) am bob metr ciwbig o aer.'
    }
  }
}

export const pollutantTranslationsWelsh = {
  // sonar-disable-next-line javascript:S1192
  pollutants: {
    ozone: {
      title: 'Osôn(O₃)',
      pageTitle: pageTitleTemplate('Osôn(O₃)'),
      headerText: HEADER_TEXT,
      headings: {
        a: 'Ffynonellau osôn',
        b: HEALTH_EFFECTS_WELSH
      },
      paragraphs: {
        a: "Does dim ffynonellau allyriadau mawr o osôn ei hun. Mae osôn yn yr aer yn cael ei ffurfio gan adweithiau rhwng llygryddion eraill, er enghraifft, pan fydd llygryddion o geir, gorsafoedd pŵer a ffatrïoedd yn adweithio gyda golau'r haul.",
        b: "Gall osôn ar lefel y ddaear fod ar lefelau afiach ar ddiwrnodau poeth ac oer. Gall deithio gyda'r gwynt, gan effeithio ar ardaloedd trefol a gwledig.",
        c: `${SHORT_TERM_EXPOSURE_PREFIX} i osôn achosi:`,
        d: 'diffyg anadl, gwichian a phesychu',
        e: ASTHMA_ATTACKS_WELSH,
        f: `mwy o risg o ${RESPIRATORY_INFECTIONS}`,
        g: EYES_NOSE_THROAT_INFLAMMATION,
        h: `${LONG_TERM_EXPOSURE_PREFIX} i osôn arwain at y canlynol:`,
        i: 'mwy o salwch yr anadl',
        j: 'materion y system nerfol',
        k: CANCER_WELSH,
        l: HEART_PROBLEMS_WELSH
      },
      description:
        'Dysgwch sut mae osôn yn cael ei ffurfio. Hefyd, dysgwch am effeithiau iechyd byrdymor a hirdymor amlygiad i osôn.'
    },
    nitrogenDioxide: {
      title: 'Nitrogen deuocsid (NO₂)',
      pageTitle: pageTitleTemplate('Nitrogen deuocsid (NO₂)'),
      headerText: HEADER_TEXT,
      headings: {
        a: 'Ffynonellau nitrogen deuocsid',
        b: HEALTH_EFFECTS_WELSH
      },
      paragraphs: {
        a: "Mae nitrogen deuocsid yn nwy di-liw. Mae'n cael ei gynhyrchu'n bennaf yn sgil:",
        b: 'llosgi petrol neu ddisel mewn injan car',
        c: 'llosgi nwy naturiol mewn boeler gwres canolog neu orsaf bŵer',
        d: 'weldio',
        e: 'defnyddio ffrwydron',
        f: COMMERCIAL_MANUFACTURING,
        g: FOOD_MANUFACTURING,
        h: `${SHORT_TERM_EXPOSURE_PREFIX} i nitrogen deuocsid achosi:`,
        i: ASTHMA_ATTACKS_WELSH,
        j: RESPIRATORY_INFECTIONS,
        k: "symptomau cyflyrau'r ysgyfaint neu'r galon i waethygu",
        l: `${LONG_TERM_EXPOSURE_PREFIX} i nitrogen deuocsid achosi:`,
        m: `mwy o risg o ${RESPIRATORY_INFECTIONS}`,
        n: `gwaeth ${LUNG_FUNCTION_WELSH} mewn plant`
      },
      description:
        'Dysgwch sut mae nitrogen deuocsid yn cael ei gynhyrchu. Hefyd, dysgwch am effeithiau iechyd byrdymor a hirdymor amlygiad i nitrogen deuocsid.'
    },
    sulphurDioxide: {
      title: 'Sylffwr deuocsid (SO₂)',
      pageTitle: pageTitleTemplate('Sylffwr deuocsid (SO₂)'),
      headerText: HEADER_TEXT,
      headings: {
        a: 'Ffynonellau sylffwr deuocsid',
        b: HEALTH_EFFECTS_WELSH
      },
      paragraphs: {
        a: "Mae sylffwr deuocsid yn nwy di-liw sydd ag arogl cryf. Mae'n cael ei gynhyrchu'n bennaf yn sgil:",
        b: 'llosgi petrol neu ddisel mewn cerbydau',
        c: 'boeleri nwy',
        d: "pwerdai sy'n llosgi glo",
        e: COMMERCIAL_MANUFACTURING,
        f: FOOD_MANUFACTURING,
        g: `${SHORT_TERM_EXPOSURE_PREFIX} achosi llid ar y canlynol:`,
        h: EYES_WELSH,
        i: NOSE_WELSH,
        j: THROAT_WELSH,
        k: `${LONG_TERM_EXPOSURE_PREFIX} ar lefelau uchel arwain at y canlynol:`,
        l: `llai o ${LUNG_FUNCTION_WELSH}`,
        m: 'newid synnwyr arogli',
        n: `mwy o ${RESPIRATORY_INFECTIONS}`
      },
      description:
        'Dysgwch sut mae sylffwr deuocsid yn cael ei gynhyrchu. Hefyd, dysgwch am effeithiau iechyd byrdymor a thymor hir sylffwr deuocsid.'
    },
    particulateMatter10: {
      title: 'Mater gronynnol (PM10)',
      pageTitle: pageTitleTemplate('Mater gronynnol (PM10)'),
      headerText: HEADER_TEXT,
      headings: {
        a: 'Ffynonellau PM10',
        b: HEALTH_EFFECTS_WELSH
      },
      paragraphs: {
        a: "Mae mater gronynnol (PM) yn ronynnau mân iawn o solidau neu hylifau yn yr aer. Dim ond 10 micrometr mewn diamedr yw'r gronynnau.O ran cyd- destun, mae lled blewyn o wallt dynol yn 50 i 70 micrometr.",
        b: 'Prif ffynonellau mater gronynnol yw:',
        c: 'llwch o safleoedd adeiladu',
        d: 'llwch o safleoedd tirlenwi',
        e: 'llwch o amaethyddiaeth',
        f: 'tanau gwyllt',
        g: 'paill',
        h: 'gorsafoedd pŵer',
        i: 'Cerbydau',
        j: SHORT_EFFECTS_PM10,
        k: 'anhawster anadlu',
        l: 'pesychu',
        m: EYES_NOSE_THROAT_INFLAMMATION,
        n: 'tyndra a phoen y frest',
        o: LONG_EFFECTS_PM10,
        p: "difrod i feinwe'r ysgyfaint",
        q: ASTHMA_WELSH,
        r: 'methiant y galon',
        s: CANCER_WELSH,
        t: COPD_WELSH
      },
      description:
        "Mae PM10 yn fater gronynnol (PM) wedi'i wneud o ronynnau bach o solidau neu hylifau yn yr awyr. Dysgwch am ffynonellau PM10 a sut y gall amlygiad iddo effeithio ar iechyd."
    },
    particulateMatter25: {
      title: 'Mater gronynnol (PM2.5)',
      pageTitle: pageTitleTemplate('Mater gronynnol (PM2.5)'),
      headerText: HEADER_TEXT,
      headings: {
        a: 'Ffynonellau PM2.5',
        b: HEALTH_EFFECTS_WELSH
      },
      paragraphs: {
        a: "Mae mater gronynnol (PM) yn ronynnau mân iawn o solidau neu hylifau sydd yn yr aer. Dim ond 2.5 micrometr mewn diamedr yw'r gronynnau.O ran cyd- destun, mae lled blewyn o wallt dynol yn 50 i 70 micrometr.",
        b: 'Gall gronynnau PM2.5 gynnwys:',
        c: 'llwch',
        d: 'huddygl',
        e: 'mwg',
        f: 'diferion hylif',
        g: 'Prif ffynonellau mater gronynnol yw:',
        h: 'llosgi tanwydd mewn cerbydau, diwydiant ac eiddo domestig',
        i: 'traul ar deiars a breciau',
        j: 'pridd a llwch yn cael eu chwythu gan y gwynt',
        k: 'gronynnau ewyn y môr',
        l: 'llosgi llystyfiant',
        m: SHORT_EFFECTS_PM25,
        n: ASTHMA_WELSH,
        o: COPD_WELSH,
        p: LONG_EFFECTS_PM25,
        q: 'strôc',
        r: 'canser yr ysgyfaint',
        s: 'diabetes',
        t: 'clefyd Alzheimer a chlefyd Parkinson',
        u: 'iechyd ysgyfaint gwael mewn plant'
      },
      description:
        "Mae PM2.5 yn fater gronynnol (PM) wedi'i wneud o ronynnau bach o solidau neu hylifau yn yr awyr. Dysgwch am ffynonellau PM2.5 a sut y gall amlygiad iddo effeithio ar iechyd."
    }
  }
}
