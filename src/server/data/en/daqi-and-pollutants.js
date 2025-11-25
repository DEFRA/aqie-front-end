''
import {
  ACTIONS_REDUCE_EXPOSURE_ROUTE_EN,
  HEALTH_EFFECTS_ROUTE_EN
} from '../constants.js'

const SERVICE_NAME = 'Check air quality'

/**
 * English translations for DAQI display and pollutant information pages
 */
export const daqiTranslations = {
  daqi: {
    forecastIntro: 'The air pollution forecast for today is',
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
      b: 'Latest at',
      c: 'How air pollutants can affect your health',
      d: 'Air pollutants monitored near by',
      e: '',
      on: 'on',
      ukForecast: 'UK forecast'
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
    },
    // '' AQC-657: Exposure reduction advice section (HTML rendered via partial)
    exposureHtml: `<h2 class="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">How you can reduce your exposure to air pollution</h2>
<p>Long term exposure to air pollution (over years) can lead to many different <a class="govuk-link" href="${HEALTH_EFFECTS_ROUTE_EN}?lang=en">health conditions</a> and can reduce life expectancy.</p>
<p>You should try to reduce your exposure to air pollution to protect your health. Consider the following actions:</p>
<ul class="govuk-list govuk-list--bullet">
  <li>take routes where there is less traffic, especially at busy times of day</li>
  <li>commute, walk or exercise in parks or other green spaces, if you are not affected by pollen</li>
  <li>if you exercise indoors, make sure the room is well ventilated</li>
</ul>
<p>Get more advice on <a class="govuk-link" href="${ACTIONS_REDUCE_EXPOSURE_ROUTE_EN}?lang=en">actions you can take to reduce your exposure to air pollution</a>.</p>`
  }
}

export const actionsReduceExposureTranslations = {
  actionsReduceExposure: {
    title: 'Actions you can take to reduce your exposure to air pollution',
    pageTitle: `Actions you can take to reduce your exposure to air pollution – ${SERVICE_NAME} – GOV.UK`,
    description:
      'Learn practical actions to reduce your exposure to air pollution in urban areas, rural areas, indoors and outdoors.',
    intro:
      'There is no safe level of air pollution, but there are actions you can take to reduce your exposure.',
    mainAdvice:
      'You should try to reduce your exposure to air pollution where you can, even when levels are low. Long term exposure to air pollution (over years) can lead to',
    healthConditionsLink: HEALTH_EFFECTS_ROUTE_EN,
    healthConditionsLinkText:
      'many different health conditions and reduce life expectancy',
    urbanAreas: {
      heading: 'Urban areas',
      description:
        'Urban areas have more than 10,000 residents, for example a large town or a city.',
      advice:
        'Consider the following actions if you live or work in an urban area:',
      actions: [
        'if you need to walk next to a busy road, keep as far from the edge of the road as you can – putting even a short distance between yourself and the source of pollution reduces the amount of pollution you breathe in',
        'avoid driving in heavy traffic – sitting in traffic can expose you to high levels of pollution',
        'check pollution forecasts to help you plan outdoor activities'
      ]
    },
    ruralAreas: {
      heading: 'Rural areas',
      description:
        'Rural areas have less than 10,000 residents, for example a village, hamlet or small town.',
      advice:
        'Some pollutants are often higher in the countryside, such as ozone.',
      advice2:
        'Consider the following actions if you live or work in a rural area:',
      actions: [
        'check for agricultural activities and plan to avoid them – ploughing fields, spreading fertilisers, and spraying pesticides can all increase air pollution levels',
        'avoid bonfires and burning garden waste',
        'check pollution forecasts – pollution can travel long distances and you cannot always see the sources'
      ]
    },
    allOutdoorAreas: {
      heading: 'General advice',
      advice: 'Consider the following actions in any area:',
      actions: [
        'take routes where there is less traffic, especially at busy times of day',
        'commute, walk or exercise in parks or other green spaces, if you are not affected by pollen',
        'if you exercise indoors, make sure the room is well ventilated'
      ]
    },
    indoorAirPollution: {
      heading: 'Indoor air pollution',
      description:
        'The air quality indoors is not always better than outdoors.',
      advice:
        'Consider the following actions to improve your indoor air quality:',
      actions: [
        'avoid smoking or vaping indoors',
        'ventilate when cooking – for example, use an extractor fan or open windows',
        'avoid burning on a stove or open fire if you can',
        'check labels on cleaning products, aerosols and paints – look for products labelled as low emission or "low VOC"'
      ],
      additionalAdvice:
        "If you need to use cleaning products, aerosols and paints indoors, follow the manufacturer's instructions and use them in a ventilated area."
    },
    reduceContribution: {
      heading: 'Reduce your contribution to air pollution',
      advice: 'Consider the following actions to reduce your air pollution:',
      actions: [
        'walk, cycle and use public transport more frequently',
        "drive less, and when you do drive, drive smarter – car share if you can, turn your engine off when you're not moving, and keep your vehicle well maintained",
        'consider switching to a hybrid or electric vehicle',
        'compost or take garden waste to a refuse centre rather than burning it',
        'avoid unnecessary burning at home – for example, using a wood burner or open fire',
        'if you need to burn wood or other fuel for heating, make sure you use <a href="https://www.readytoburn.org/" class="govuk-link">Ready to Burn</a> fuels and keep your appliances clean and maintained'
      ]
    }
  }
}

export const pollutantTranslations = {
  // sonar-disable-next-line javascript:S1192
  pollutants: {
    ozone: {
      title: 'Ozone (O₃)',
      pageTitle: `Ozone(O₃) – ${SERVICE_NAME} – GOV.UK`,
      headerText: `${SERVICE_NAME}`,
      headings: {
        a: 'Sources of ozone',
        b: 'Health effects'
      },
      paragraphs: {
        a: 'There are no major emission sources of ozone itself. Reactions between other pollutants form ozone in the air. For example, when pollutants from cars, power stations and factories react with sunlight.',
        b: 'Ground level ozone can be at unhealthy levels on both hot and cold days. It can travel by the wind, affecting both urban and rural areas.',
        c: 'Short term exposure to ozone can cause:',
        d: 'shortness of breath, wheezing and coughing',
        e: 'asthma attacks',
        f: 'increased risk of respiratory infections',
        g: 'irritation of eyes, nose and throat',
        h: 'Long term exposure to ozone may lead to:',
        i: 'increased respiratory illnesses',
        j: 'nervous system issues',
        k: 'cancer',
        l: 'heart issues'
      },
      description:
        'Learn how ozone is formed. Also, learn the short term and long term health effects of ozone exposure.'
    },
    nitrogenDioxide: {
      title: 'Nitrogen dioxide (NO₂)',
      pageTitle: `Nitrogen dioxide (NO₂) – ${SERVICE_NAME} – GOV.UK`,
      headerText: `${SERVICE_NAME}`,
      headings: {
        a: 'Sources of nitrogen dioxide',
        b: 'Health effects'
      },
      paragraphs: {
        a: "Nitrogen dioxide is a colourless gas. It's mainly produced during:",
        b: 'burning of petrol or diesel in a car engine',
        c: 'burning natural gas in a central-heating boiler or power station',
        d: 'welding',
        e: 'the use of explosives',
        f: 'commercial manufacturing',
        g: 'food manufacturing',
        h: 'Short term exposure to nitrogen dioxide can cause:',
        i: 'asthma attacks',
        j: 'respiratory infections',
        k: 'symptoms of lung or heart conditions to get worse',
        l: 'Long term exposure to nitrogen dioxide can cause:',
        m: 'an increase risk of respiratory infections',
        n: 'poorer lung function in children'
      },
      description:
        'Learn how nitrogen dioxide is produced. Also, learn the short term and long term health effects of nitrogen dioxide exposure.'
    },
    sulphurDioxide: {
      title: 'Sulphur dioxide (SO₂)',
      pageTitle: `Sulphur dioxide (SO₂) – ${SERVICE_NAME} – GOV.UK`,
      headerText: `${SERVICE_NAME}`,
      headings: {
        a: 'Sources of sulphur dioxide',
        b: 'Health effects'
      },
      paragraphs: {
        a: "Sulphur dioxide is a colourless gas with a strong odour. It's mainly produced from:",
        b: 'burning petrol or diesel in vehicles',
        c: 'gas boilers',
        d: 'coal burning power stations',
        e: 'commercial manufacturing',
        f: 'food manufacturing',
        g: 'Short term exposure can cause irritation to the:',
        h: 'eyes',
        i: 'nose',
        j: 'throat',
        k: 'Long term exposure at high levels may lead to:',
        l: 'reduced lung function',
        m: 'altered sense of smell',
        n: 'increased respiratory infections'
      },
      description:
        'Learn how sulphur dioxide is produced. Also, learn the short term and long term health effects of sulphur dioxide'
    },
    particulateMatter10: {
      title: 'Particulate matter (PM10)',
      pageTitle: `Particulate matter (PM10) – ${SERVICE_NAME} – GOV.UK`,
      headerText: `${SERVICE_NAME}`,
      headings: {
        a: 'Sources of PM10',
        b: 'Health effects'
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
        q: 'asthma',
        r: 'heart failure',
        s: 'cancer',
        t: 'chronic obstructive pulmonary disease (COPD)'
      },
      description:
        'PM10 is a particulate matter (PM) made of small particles of solids or liquids in the air. Learn the sources of PM10 and how exposure can impact health.'
    },
    particulateMatter25: {
      title: 'Particulate matter (PM2.5)',
      pageTitle: `Particulate matter (PM2.5) – ${SERVICE_NAME} – GOV.UK`,
      headerText: `${SERVICE_NAME}`,
      headings: {
        a: 'Sources of PM2.5',
        b: 'Health effects'
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
        n: 'asthma',
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
