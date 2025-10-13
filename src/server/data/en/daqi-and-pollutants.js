''
const SERVICE_NAME = 'Check air quality'
const pageTitleTemplate = (pollutant) =>
  `What is ${pollutant}? - Check air quality - GOV.UK`

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
      d: 'Air pollutants monitored near by',
      e: ''
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
        a: 'There are no major emission sources of ozone itself. Reactions between other pollutants form ozone in the air. For example, when pollutants from cars, power stations and factories react with sunlight.',
        b: 'Ground level ozone can be at unhealthy levels on both hot and cold days. It can travel by the wind, affecting both urban and rural areas.',
        c: `${SHORT_TERM_EXPOSURE_PREFIX} to ozone can cause:`,
        d: 'shortness of breath, wheezing and coughing',
        e: ASTHMA_ATTACKS,
        f: `increased risk of ${RESPIRATORY_INFECTIONS}`,
        g: 'irritation of eyes, nose and throat',
        h: `${LONG_TERM_EXPOSURE_PREFIX} to ozone may lead to:`,
        i: 'increased respiratory illnesses',
        j: 'nervous system issues',
        k: 'cancer',
        l: 'heart issues'
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
        a: "Nitrogen dioxide is a colourless gas. It's mainly produced during:",
        b: 'burning of petrol or diesel in a car engine',
        c: 'burning natural gas in a central-heating boiler or power station',
        d: 'welding',
        e: 'the use of explosives',
        f: 'commercial manufacturing',
        g: 'food manufacturing',
        h: `${SHORT_TERM_EXPOSURE_PREFIX} to nitrogen dioxide can cause:`,
        i: ASTHMA_ATTACKS,
        j: RESPIRATORY_INFECTIONS,
        k: 'symptoms of lung or heart conditions to get worse',
        l: `${LONG_TERM_EXPOSURE_PREFIX} to nitrogen dioxide can cause:`,
        m: `an increase risk of ${RESPIRATORY_INFECTIONS}`,
        n: 'poorer lung function in children'
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
        a: "Sulphur dioxide is a colourless gas with a strong odour. It's mainly produced from:",
        b: 'burning petrol or diesel in vehicles',
        c: 'gas boilers',
        d: 'coal burning power stations',
        e: 'commercial manufacturing',
        f: 'food manufacturing',
        g: `${SHORT_TERM_EXPOSURE_PREFIX} can cause irritation to the:`,
        h: 'eyes',
        i: 'nose',
        j: 'throat',
        k: `${LONG_TERM_EXPOSURE_PREFIX} at high levels may lead to:`,
        l: 'reduced lung function',
        m: 'altered sense of smell',
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
        a: 'Particulate matter (PM) are small particles of solids or liquids that are in the air. The particles are only 10 micrometres in diameter. For context, the width of a human hair is 50 to 70 micrometres.',
        b: 'The main sources of particulate matter are:',
        c: 'dust from construction sites',
        d: 'dust from landfills',
        e: 'dust from agriculture',
        f: 'wildfires',
        g: 'pollen',
        h: 'power stations',
        i: 'vehicles',
        j: 'Short term health impacts of PM10 can include:',
        k: 'difficulty breathing',
        l: 'coughing',
        m: 'eye, nose and throat irritation',
        n: 'chest tightness and pain',
        o: 'Long term health impacts of PM10 can include:',
        p: 'lung tissue damage',
        q: ASTHMA,
        r: 'heart failure',
        s: 'cancer',
        t: 'chronic obstructive pulmonary disease (COPD)'
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
        a: 'Particulate matter (PM) are small particles of solids or liquids that are in the air. The particles are only 2.5 micrometres in diameter. For context, the width of a human hair is 50 to 70 micrometres.',
        b: 'PM2.5 particles may include:',
        c: 'dust',
        d: 'soot',
        e: 'smoke',
        f: 'drops of liquid',
        g: 'The main sources of particulate matter are from:',
        h: 'burning of fuel by vehicles, industry and domestic properties',
        i: 'wear of tyres and brakes',
        j: 'wind blown soil and dust',
        k: 'sea spray particles',
        l: 'burning vegetation',
        m: 'Short term health impacts of PM2.5 can include worsening of conditions such as:',
        n: ASTHMA,
        o: 'chronic obstructive pulmonary disease (COPD)',
        p: 'Long term health impacts of PM2.5 can include:',
        q: 'strokes',
        r: 'lung cancer',
        s: 'diabetes',
        t: "Alzheimer's and Parkinson's disease",
        u: 'poor lung health in children'
      },
      description:
        'PM2.5 is a particulate matter (PM) made of small particles of solids or liquids in the air. Learn the sources of PM2.5 and how exposure can impact health.'
    }
  }
}
