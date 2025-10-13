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

// Common Welsh pollutant sources
const COMMERCIAL_MANUFACTURING = 'gweithgynhyrchu masnachol'
const FOOD_MANUFACTURING = 'gweithgynhyrchu bwyd'

// Common Welsh health effects patterns
const SHORT_EFFECTS_PM10 = 'Mae effeithiau iechyd byrdymor PM10 yn cynnwys:'
const LONG_EFFECTS_PM10 = 'Mae effeithiau hirdymor PM10 yn cynnwys:'
const SHORT_EFFECTS_PM25 =
  "Gall effeithiau iechyd byrdymor PM2.5 gynnwys cyflyrau sy'n gwaethygu, fel:"
const LONG_EFFECTS_PM25 = 'Gall effeithiau hirdymor PM2.5 gynnwys:'

// Additional Welsh health symptoms to reduce duplication
const COMMON_HEALTH_SYMPTOMS_WELSH = {
  DIFFICULTY_BREATHING: 'anhawster anadlu',
  COUGHING: 'pesychu',
  SHORTNESS_OF_BREATH: 'byrdra anadl',
  WHEEZING: 'whezan a phesychu',
  CHEST_TIGHTNESS: 'tyndera a phoen yn y frest',
  REDUCED_LUNG_FUNCTION: 'gweithrediad ysgyfaint gostyngedig',
  INCREASED_RESPIRATORY_ILLNESS: 'salwch anadlol cynyddol',
  ALTERED_SMELL: 'synnwyr arogli wedi newid'
}

// Additional Welsh pollution sources to reduce duplication
const COMMON_SOURCES_WELSH = {
  POWER_STATIONS: 'gorsafoedd pŵer',
  PETROL_DIESEL_VEHICLES: 'llosgi petrol neu ddesel mewn cerbydau',
  GAS_BOILERS: 'boeleri nwy',
  COAL_POWER_STATIONS: 'gorsafoedd pŵer llosgi glo',
  CONSTRUCTION_DUST: 'llwch o safleoedd adeiladu',
  AGRICULTURE_DUST: 'llwch o amaethyddiaeth',
  WILDFIRES: 'tanau gwyllt',
  POLLEN: 'paill',
  DUST: 'llwch',
  SOOT: 'huddygl',
  SMOKE: 'mwg',
  LIQUID_DROPS: 'diferion hylif'
}

// Additional Welsh burning-related constants to eliminate duplicated literals
const BURNING_SOURCES_WELSH = {
  PETROL_DIESEL_ENGINE: 'llosgi petrol neu ddisel mewn injan car',
  NATURAL_GAS_BOILER:
    'llosgi nwy naturiol mewn boeler gwres canolog neu orsaf bŵer',
  FUEL_BY_VEHICLES: 'llosgi tanwydd mewn cerbydau, diwydiant ac eiddo domestig',
  VEGETATION: 'llosgi llystyfiant'
}

// Additional Welsh vulnerability patterns to reduce duplication
const VULNERABILITY_PATTERNS_WELSH = {
  SYMPTOMS_WORSE: "symptomau cyflyrau'r ysgyfaint neu'r galon yn gwaethygu",
  POORER_LUNG_FUNCTION: 'gweithrediad ysgyfaint gwaeth mewn plant',
  LUNG_TISSUE_DAMAGE: 'difrod meinwe ysgyfaint',
  HEART_FAILURE: 'methiant calon',
  STROKES: 'strôc',
  LUNG_CANCER: 'canser ysgyfaint',
  DIABETES: 'diabetes',
  NEUROLOGICAL_DISEASES: 'clefyd Alzheimer a Parkinson',
  POOR_LUNG_HEALTH_CHILDREN: 'iechyd ysgyfaint gwael mewn plant'
}

// Welsh particle descriptions to reduce duplication
const PARTICLE_DESCRIPTIONS_WELSH = {
  PM_DEFINITION:
    'Mae mater gronynnol (PM) yn ronynnau bach o solidau neu hylifau sydd yn yr awyr.',
  PM10_CONTEXT:
    "Mae'r gronynnau dim ond 10 micromedr mewn diamedr. I roi cyd-destun, mae lled gwallt dynol rhwng 50 a 70 micromedr.",
  PM25_CONTEXT:
    "Mae'r gronynnau dim ond 2.5 micromedr mewn diamedr. I roi cyd-destun, mae lled gwallt dynol rhwng 50 a 70 micromedr."
}

// Common Welsh paragraph generation functions to eliminate duplication
const createWelshExposureText = (pollutant, timeframe) =>
  `${timeframe === 'short' ? SHORT_TERM_EXPOSURE_PREFIX : LONG_TERM_EXPOSURE_PREFIX} i ${pollutant} achosi:`

const createWelshSourceIntroText = (pollutant, verb) => {
  const gasDescription = pollutant.includes('sylffwr') ? ' ag arogl cryf' : ''
  const mainlyText =
    verb === 'cynhyrchu'
      ? 'yn bennaf yn cael ei gynhyrchu yn ystod:'
      : 'yn bennaf yn cael ei gynhyrchu o:'
  return `Mae ${pollutant} yn nwy di-liw${gasDescription}. Mae ${mainlyText}`
}

const createWelshPMSourcesIntro = () => 'Prif ffynonellau mater gronynnol yw:'

const createWelshPMParticlesIntro = (pmType) =>
  `Gall gronynnau ${pmType} gynnwys:`

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
        a: `Does dim ffynonellau allyriadau mawr o osôn ei hun. Mae osôn yn yr aer yn cael ei ffurfio gan adweithiau rhwng llygryddion eraill, er enghraifft, pan fydd llygryddion o geir, ${COMMON_SOURCES_WELSH.POWER_STATIONS} a ffatrïoedd yn adweithio gyda golau'r haul.`,
        b: "Gall osôn ar lefel y ddaear fod ar lefelau afiach ar ddiwrnodau poeth ac oer. Gall deithio gyda'r gwynt, gan effeithio ar ardaloedd trefol a gwledig.",
        c: `${SHORT_TERM_EXPOSURE_PREFIX} i osôn achosi:`,
        d: `${COMMON_HEALTH_SYMPTOMS_WELSH.SHORTNESS_OF_BREATH}, ${COMMON_HEALTH_SYMPTOMS_WELSH.WHEEZING}`,
        e: ASTHMA_ATTACKS_WELSH,
        f: `mwy o risg o ${RESPIRATORY_INFECTIONS}`,
        g: EYES_NOSE_THROAT_INFLAMMATION,
        h: `${LONG_TERM_EXPOSURE_PREFIX} i osôn arwain at y canlynol:`,
        i: COMMON_HEALTH_SYMPTOMS_WELSH.INCREASED_RESPIRATORY_ILLNESS,
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
        a: createWelshSourceIntroText('nitrogen deuocsid', 'cynhyrchu'),
        b: BURNING_SOURCES_WELSH.PETROL_DIESEL_ENGINE,
        c: BURNING_SOURCES_WELSH.NATURAL_GAS_BOILER,
        d: 'weldio',
        e: 'defnyddio ffrwydron',
        f: COMMERCIAL_MANUFACTURING,
        g: FOOD_MANUFACTURING,
        h: createWelshExposureText('nitrogen deuocsid', 'short'),
        i: ASTHMA_ATTACKS_WELSH,
        j: RESPIRATORY_INFECTIONS,
        k: VULNERABILITY_PATTERNS_WELSH.SYMPTOMS_WORSE,
        l: createWelshExposureText('nitrogen deuocsid', 'long'),
        m: `mwy o risg o ${RESPIRATORY_INFECTIONS}`,
        n: VULNERABILITY_PATTERNS_WELSH.POORER_LUNG_FUNCTION
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
        a: createWelshSourceIntroText('sylffwr deuocsid', 'cynhyrchu'),
        b: COMMON_SOURCES_WELSH.PETROL_DIESEL_VEHICLES,
        c: COMMON_SOURCES_WELSH.GAS_BOILERS,
        d: COMMON_SOURCES_WELSH.COAL_POWER_STATIONS,
        e: COMMERCIAL_MANUFACTURING,
        f: FOOD_MANUFACTURING,
        g: `${SHORT_TERM_EXPOSURE_PREFIX} achosi llid ar y canlynol:`,
        h: EYES_WELSH,
        i: NOSE_WELSH,
        j: THROAT_WELSH,
        k: `${LONG_TERM_EXPOSURE_PREFIX} ar lefelau uchel arwain at y canlynol:`,
        l: COMMON_HEALTH_SYMPTOMS_WELSH.REDUCED_LUNG_FUNCTION,
        m: COMMON_HEALTH_SYMPTOMS_WELSH.ALTERED_SMELL,
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
        a: `${PARTICLE_DESCRIPTIONS_WELSH.PM_DEFINITION} ${PARTICLE_DESCRIPTIONS_WELSH.PM10_CONTEXT}`,
        b: createWelshPMSourcesIntro(),
        c: COMMON_SOURCES_WELSH.CONSTRUCTION_DUST,
        d: 'llwch o safleoedd tirlenwi',
        e: COMMON_SOURCES_WELSH.AGRICULTURE_DUST,
        f: COMMON_SOURCES_WELSH.WILDFIRES,
        g: COMMON_SOURCES_WELSH.POLLEN,
        h: COMMON_SOURCES_WELSH.POWER_STATIONS,
        i: 'Cerbydau',
        j: SHORT_EFFECTS_PM10,
        k: COMMON_HEALTH_SYMPTOMS_WELSH.DIFFICULTY_BREATHING,
        l: COMMON_HEALTH_SYMPTOMS_WELSH.COUGHING,
        m: EYES_NOSE_THROAT_INFLAMMATION,
        n: COMMON_HEALTH_SYMPTOMS_WELSH.CHEST_TIGHTNESS,
        o: LONG_EFFECTS_PM10,
        p: VULNERABILITY_PATTERNS_WELSH.LUNG_TISSUE_DAMAGE,
        q: ASTHMA_WELSH,
        r: VULNERABILITY_PATTERNS_WELSH.HEART_FAILURE,
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
        a: `${PARTICLE_DESCRIPTIONS_WELSH.PM_DEFINITION} ${PARTICLE_DESCRIPTIONS_WELSH.PM25_CONTEXT}`,
        b: createWelshPMParticlesIntro('PM2.5'),
        c: COMMON_SOURCES_WELSH.DUST,
        d: COMMON_SOURCES_WELSH.SOOT,
        e: COMMON_SOURCES_WELSH.SMOKE,
        f: COMMON_SOURCES_WELSH.LIQUID_DROPS,
        g: createWelshPMSourcesIntro(),
        h: BURNING_SOURCES_WELSH.FUEL_BY_VEHICLES,
        i: 'traul ar deiars a breciau',
        j: 'pridd a llwch yn cael eu chwythu gan y gwynt',
        k: 'gronynnau ewyn y môr',
        l: BURNING_SOURCES_WELSH.VEGETATION,
        m: SHORT_EFFECTS_PM25,
        n: ASTHMA_WELSH,
        o: COPD_WELSH,
        p: LONG_EFFECTS_PM25,
        q: VULNERABILITY_PATTERNS_WELSH.STROKES,
        r: VULNERABILITY_PATTERNS_WELSH.LUNG_CANCER,
        s: VULNERABILITY_PATTERNS_WELSH.DIABETES,
        t: VULNERABILITY_PATTERNS_WELSH.NEUROLOGICAL_DISEASES,
        u: VULNERABILITY_PATTERNS_WELSH.POOR_LUNG_HEALTH_CHILDREN
      },
      description:
        "Mae PM2.5 yn fater gronynnol (PM) wedi'i wneud o ronynnau bach o solidau neu hylifau yn yr awyr. Dysgwch am ffynonellau PM2.5 a sut y gall amlygiad iddo effeithio ar iechyd."
    }
  }
}
