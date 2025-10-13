// English translations module for DAQI display, pollutant information pages, and air quality data
const SERVICE_NAME = 'Check air quality'
const GOVUK_SUFFIX = ' - GOV.UK'
const pageTitleTemplate = (pollutant) =>
  `What is ${pollutant}? - ${SERVICE_NAME}${GOVUK_SUFFIX}`

/**
 * Description template for pollutant information pages
 */
const createPollutantDescription = (pollutant, verb) =>
  `Learn how ${pollutant} is ${verb}. Also, learn the short term and long term health effects of ${pollutant} exposure.`

/**
 * Page meta titles for consistent formatting
 */
const HEADER_TEXT = SERVICE_NAME

// Common English exposure phrases
const SHORT_TERM_EXPOSURE_PREFIX = 'Short term exposure'
const LONG_TERM_EXPOSURE_PREFIX = 'Long term exposure'

// Common English health effects
const ASTHMA_ATTACKS = 'asthma attacks'
const ASTHMA = 'asthma'
const RESPIRATORY_INFECTIONS = 'respiratory infections'
const HEALTH_EFFECTS = 'Health effects'
const COMMERCIAL_MANUFACTURING = 'commercial manufacturing'
const FOOD_MANUFACTURING = 'food manufacturing'

// Common English health effect descriptions
const SHORT_TERM_PM10_IMPACTS = 'Short term health impacts of PM10 can include:'
const LONG_TERM_PM10_IMPACTS = 'Long term health impacts of PM10 can include:'
const SHORT_TERM_PM25_IMPACTS =
  'Short term health impacts of PM2.5 can include worsening of conditions such as:'
const LONG_TERM_PM25_IMPACTS = 'Long term health impacts of PM2.5 can include:'

// Common pollutant health symptoms to reduce duplication
const COMMON_HEALTH_SYMPTOMS = {
  DIFFICULTY_BREATHING: 'difficulty breathing',
  COUGHING: 'coughing',
  SHORTNESS_OF_BREATH: 'shortness of breath',
  WHEEZING: 'wheezing and coughing',
  EYE_IRRITATION: 'irritation of eyes, nose and throat',
  CHEST_TIGHTNESS: 'chest tightness and pain',
  LUNG_FUNCTION: 'reduced lung function',
  COPD: 'chronic obstructive pulmonary disease (COPD)',
  HEART_ISSUES: 'heart issues',
  CANCER: 'cancer',
  NERVOUS_SYSTEM: 'nervous system issues',
  EYES: 'eyes',
  NOSE: 'nose',
  THROAT: 'throat'
}

// Common pollution sources to reduce duplication
const COMMON_SOURCES = {
  VEHICLES: 'vehicles',
  POWER_STATIONS: 'power stations',
  PETROL_DIESEL: 'burning petrol or diesel in vehicles',
  GAS_BOILERS: 'gas boilers',
  COAL_POWER: 'coal burning power stations',
  CONSTRUCTION_DUST: 'dust from construction sites',
  AGRICULTURE_DUST: 'dust from agriculture',
  WILDFIRES: 'wildfires',
  POLLEN: 'pollen',
  DUST: 'dust',
  SOOT: 'soot',
  SMOKE: 'smoke',
  LIQUID_DROPS: 'drops of liquid'
}

// Common vulnerability and health impact patterns
const VULNERABILITY_PATTERNS = {
  SYMPTOMS_WORSE: 'symptoms of lung or heart conditions to get worse',
  INCREASED_RISK: 'increased risk of',
  POORER_FUNCTION: 'poorer lung function in children',
  LUNG_TISSUE_DAMAGE: 'lung tissue damage',
  HEART_FAILURE: 'heart failure',
  ALTERED_SMELL: 'altered sense of smell',
  STROKES: 'strokes',
  LUNG_CANCER: 'lung cancer',
  DIABETES: 'diabetes',
  NEUROLOGICAL: "Alzheimer's and Parkinson's disease",
  POOR_LUNG_HEALTH: 'poor lung health in children'
}

// Particle matter descriptions to reduce duplication
const PARTICLE_DESCRIPTIONS = {
  PM10_CONTEXT:
    'The particles are only 10 micrometres in diameter. For context, the width of a human hair is 50 to 70 micrometres.',
  PM25_CONTEXT:
    'The particles are only 2.5 micrometres in diameter. For context, the width of a human hair is 50 to 70 micrometres.',
  PM_DEFINITION:
    'Particulate matter (PM) are small particles of solids or liquids that are in the air.'
}

// Common paragraph generation functions to eliminate duplication
const createExposureText = (pollutant, timeframe) =>
  `${timeframe === 'short' ? SHORT_TERM_EXPOSURE_PREFIX : LONG_TERM_EXPOSURE_PREFIX} to ${pollutant} can cause:`

const createExposureIrritationText = (timeframe) =>
  `${timeframe === 'short' ? SHORT_TERM_EXPOSURE_PREFIX : LONG_TERM_EXPOSURE_PREFIX} can cause irritation to the:`

const createSourceIntroText = (pollutant, verb) =>
  `${pollutant} is a colourless gas${pollutant.includes('sulphur') ? ' with a strong odour' : ''}. It's mainly ${verb} ${pollutant.includes('nitrogen') ? 'during:' : 'from:'}`

const createPMSourcesIntro = () => 'The main sources of particulate matter are:'

const createPMParticlesIntro = (pmType) => `${pmType} particles may include:`

/**
 * English translations for DAQI display and pollutant information pages
 */
export const daqiTranslations = {
  daqi: {
    description: {
      a: `${SERVICE_NAME} for`,
      b: '. Get health advice, pollutant information and guidance on how to reduce your exposure to air pollution.'
    },
    caption:
      'The daily air quality index (DAQI) tells you about levels of air pollution. It provides health advice for current levels.',
    summaryText: 'How different levels of air pollution can affect health',
    predictionLinkText: 'Find out',
    predictionLink: 'how air pollution is predicted and measured',
    headText: {
      a: 'Level',
      b: 'Index',
      c: 'Health advice'
    },
    healthAdvice: {
      paragraphs: {
        a: 'Health advice for',
        b: 'levels of air pollution'
      }
    },
    pageTexts: {
      a: 'UK air pollution summary',
      b: 'Latest at 5am on',
      c: 'How air pollutants can affect your health',
      d: 'Air pollutants monitored near by'
    },
    headings: {
      main: 'Daily Air Quality Index (DAQI)',
      predictedLevels: 'Predicted air pollution levels'
    },
    tabs: {
      today: 'Today'
    },
    pollutantText: {
      a: 'Particulate matter (PM)',
      b: 'Particulate matter are tiny pieces of solid or liquid particles suspended in the air. They come from sources like car tyres, brakes, exhausts, dust, wood burning and pollen.',
      c: 'Produced by burning fossil fuels. For example, in cars, power stations and factories.',
      d: 'Gases'
    },
    pollutantsNames: {
      a: 'PM2.5',
      b: 'PM10',
      c: 'Nitrogen dioxide',
      d: 'Ozone',
      e: 'Sulphur dioxide'
    },
    pollutantTable: {
      a: 'miles away',
      b: 'Pollutants',
      c: 'Latest',
      d: 'Level',
      e: 'Low range',
      f: 'Latest measurement at',
      g: 'on'
    },
    levels: {
      a: 'Low',
      b: 'Moderate',
      c: 'High',
      d: 'Very high'
    },
    tooltipText: {
      level:
        'There are 4 levels: low, moderate, high and very high. The level is determined by the highest reading of a single pollutant.',
      latest1: 'Readings are measured every hour. The unit µg/m',
      latest2:
        ' stands for micrograms (one millionth of a gram) per cubic metre of air.'
    }
  }
}

export const pollutantTranslations = {
  // sonar-disable-next-line javascript:S1192
  pollutants: {
    ozone: {
      title: 'Ozone (O₃)',
      pageTitle: pageTitleTemplate('Ozone(O₃)'),
      headerText: HEADER_TEXT,
      headings: {
        a: 'Sources of ozone',
        b: HEALTH_EFFECTS
      },
      paragraphs: {
        a: `There are no major emission sources of ozone itself. Reactions between other pollutants form ozone in the air. For example, when pollutants from cars, ${COMMON_SOURCES.POWER_STATIONS} and factories react with sunlight.`,
        b: 'Ground level ozone can be at unhealthy levels on both hot and cold days. It can travel by the wind, affecting both urban and rural areas.',
        c: `${SHORT_TERM_EXPOSURE_PREFIX} to ozone can cause:`,
        d: `${COMMON_HEALTH_SYMPTOMS.SHORTNESS_OF_BREATH}, ${COMMON_HEALTH_SYMPTOMS.WHEEZING}`,
        e: ASTHMA_ATTACKS,
        f: `${VULNERABILITY_PATTERNS.INCREASED_RISK} ${RESPIRATORY_INFECTIONS}`,
        g: COMMON_HEALTH_SYMPTOMS.EYE_IRRITATION,
        h: `${LONG_TERM_EXPOSURE_PREFIX} to ozone may lead to:`,
        i: 'increased respiratory illnesses',
        j: COMMON_HEALTH_SYMPTOMS.NERVOUS_SYSTEM,
        k: COMMON_HEALTH_SYMPTOMS.CANCER,
        l: COMMON_HEALTH_SYMPTOMS.HEART_ISSUES
      },
      description: createPollutantDescription('ozone', 'formed')
    },
    nitrogenDioxide: {
      title: 'Nitrogen dioxide (NO₂)',
      pageTitle: pageTitleTemplate('Nitrogen dioxide (NO₂)'),
      headerText: HEADER_TEXT,
      headings: {
        a: 'Sources of nitrogen dioxide',
        b: HEALTH_EFFECTS
      },
      paragraphs: {
        a: createSourceIntroText('nitrogen dioxide', 'produced'),
        b: 'burning of petrol or diesel in a car engine',
        c: 'burning natural gas in a central-heating boiler or power station',
        d: 'welding',
        e: 'the use of explosives',
        f: COMMERCIAL_MANUFACTURING,
        g: FOOD_MANUFACTURING,
        h: createExposureText('nitrogen dioxide', 'short'),
        i: ASTHMA_ATTACKS,
        j: RESPIRATORY_INFECTIONS,
        k: VULNERABILITY_PATTERNS.SYMPTOMS_WORSE,
        l: createExposureText('nitrogen dioxide', 'long'),
        m: `an ${VULNERABILITY_PATTERNS.INCREASED_RISK} ${RESPIRATORY_INFECTIONS}`,
        n: VULNERABILITY_PATTERNS.POORER_FUNCTION
      },
      description: createPollutantDescription('nitrogen dioxide', 'produced')
    },
    sulphurDioxide: {
      title: 'Sulphur dioxide (SO₂)',
      pageTitle: pageTitleTemplate('Sulphur dioxide (SO₂)'),
      headerText: HEADER_TEXT,
      headings: {
        a: 'Sources of sulphur dioxide',
        b: HEALTH_EFFECTS
      },
      paragraphs: {
        a: createSourceIntroText('sulphur dioxide', 'produced'),
        b: COMMON_SOURCES.PETROL_DIESEL,
        c: COMMON_SOURCES.GAS_BOILERS,
        d: COMMON_SOURCES.COAL_POWER,
        e: COMMERCIAL_MANUFACTURING,
        f: FOOD_MANUFACTURING,
        g: createExposureIrritationText('short'),
        h: COMMON_HEALTH_SYMPTOMS.EYES,
        i: COMMON_HEALTH_SYMPTOMS.NOSE,
        j: COMMON_HEALTH_SYMPTOMS.THROAT,
        k: `${LONG_TERM_EXPOSURE_PREFIX} at high levels may lead to:`,
        l: COMMON_HEALTH_SYMPTOMS.LUNG_FUNCTION,
        m: VULNERABILITY_PATTERNS.ALTERED_SMELL,
        n: `increased ${RESPIRATORY_INFECTIONS}`
      },
      description: createPollutantDescription('sulphur dioxide', 'produced')
    },
    particulateMatter10: {
      title: 'Particulate matter (PM10)',
      pageTitle: pageTitleTemplate('Particulate matter (PM10)'),
      headerText: HEADER_TEXT,
      headings: {
        a: 'Sources of PM10',
        b: HEALTH_EFFECTS
      },
      paragraphs: {
        a: `${PARTICLE_DESCRIPTIONS.PM_DEFINITION} ${PARTICLE_DESCRIPTIONS.PM10_CONTEXT}`,
        b: createPMSourcesIntro(),
        c: COMMON_SOURCES.CONSTRUCTION_DUST,
        d: 'dust from landfills',
        e: COMMON_SOURCES.AGRICULTURE_DUST,
        f: COMMON_SOURCES.WILDFIRES,
        g: COMMON_SOURCES.POLLEN,
        h: COMMON_SOURCES.POWER_STATIONS,
        i: COMMON_SOURCES.VEHICLES,
        j: SHORT_TERM_PM10_IMPACTS,
        k: COMMON_HEALTH_SYMPTOMS.DIFFICULTY_BREATHING,
        l: COMMON_HEALTH_SYMPTOMS.COUGHING,
        m: COMMON_HEALTH_SYMPTOMS.EYE_IRRITATION,
        n: COMMON_HEALTH_SYMPTOMS.CHEST_TIGHTNESS,
        o: LONG_TERM_PM10_IMPACTS,
        p: VULNERABILITY_PATTERNS.LUNG_TISSUE_DAMAGE,
        q: ASTHMA,
        r: VULNERABILITY_PATTERNS.HEART_FAILURE,
        s: COMMON_HEALTH_SYMPTOMS.CANCER,
        t: COMMON_HEALTH_SYMPTOMS.COPD
      },
      description:
        'PM10 is a particulate matter (PM) made of small particles of solids or liquids in the air. Learn the sources of PM10 and how exposure can impact health.'
    },
    particulateMatter25: {
      title: 'Particulate matter (PM2.5)',
      pageTitle: pageTitleTemplate('Particulate matter (PM2.5)'),
      headerText: HEADER_TEXT,
      headings: {
        a: 'Sources of PM2.5',
        b: HEALTH_EFFECTS
      },
      paragraphs: {
        a: `${PARTICLE_DESCRIPTIONS.PM_DEFINITION} ${PARTICLE_DESCRIPTIONS.PM25_CONTEXT}`,
        b: createPMParticlesIntro('PM2.5'),
        c: COMMON_SOURCES.DUST,
        d: COMMON_SOURCES.SOOT,
        e: COMMON_SOURCES.SMOKE,
        f: COMMON_SOURCES.LIQUID_DROPS,
        g: createPMSourcesIntro(),
        h: 'burning of fuel by vehicles, industry and domestic properties',
        i: 'wear of tyres and brakes',
        j: 'wind blown soil and dust',
        k: 'sea spray particles',
        l: 'burning vegetation',
        m: SHORT_TERM_PM25_IMPACTS,
        n: ASTHMA,
        o: COMMON_HEALTH_SYMPTOMS.COPD,
        p: LONG_TERM_PM25_IMPACTS,
        q: VULNERABILITY_PATTERNS.STROKES,
        r: VULNERABILITY_PATTERNS.LUNG_CANCER,
        s: VULNERABILITY_PATTERNS.DIABETES,
        t: VULNERABILITY_PATTERNS.NEUROLOGICAL,
        u: VULNERABILITY_PATTERNS.POOR_LUNG_HEALTH
      },
      description:
        'PM2.5 is a particulate matter (PM) made of small particles of solids or liquids in the air. Learn the sources of PM2.5 and how exposure can impact health.'
    }
  }
}
