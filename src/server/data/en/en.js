export const english = {
  login: {
    pageTitle: 'Sign in - Private beta air quality',
    heading: 'This is a private beta',
    texts: {
      a: 'You should only continue if you have been invited to.',
      b: 'Password',
      buttonText: 'Continue'
    }
  },
  checkLocalAirQuality: {
    pageTitle: 'Check local air quality - GOV.UK',
    heading: 'Check local air quality',
    page: 'Check local air quality',
    paragraphs: {
      a: 'Use this service to:',
      b: 'check air quality in a local area',
      c: 'find information on air pollutants'
    },
    button: 'Start now'
  },
  searchLocation: {
    pageTitle: 'Check local air quality - GOV.UK',
    heading: 'Check local air quality',
    page: 'search-location',
    serviceName: 'Check local air quality',
    searchParams: {
      label: {
        text: 'Where do you want to check?'
      },
      hint: {
        text1: 'Enter a location or postcode',
        text2: 'Enter a postcode'
      },
      locations: {
        a: 'England, Scotland or Wales',
        b: 'Northern Ireland'
      }
    },
    button: 'Continue',
    errorText: {
      radios: {
        title: 'There is a problem',
        list: {
          text: 'Select where you want to check'
        }
      },
      uk: {
        fields: {
          title: 'There is a problem',
          list: {
            text: 'Enter a location or postcode'
          }
        }
      },
      ni: {
        fields: {
          title: 'There is a problem',
          list: {
            text: 'Enter postcode'
          }
        }
      }
    }
  },
  notFoundLocation: {
    heading: 'Check local air quality',
    paragraphs: {
      a: 'We could not find',
      b: 'If you searched for a place in England, Scotland or Wales, you should:',
      c: 'check the spelling',
      d: 'enter a broader location',
      e: 'enter a correct postcode',
      f: 'If you searched for a place in Northern Ireland, check that you have entered the correct postcode.',
      g: 'Go back to search a location'
    }
  },
  notFoundUrl: {
    heading: 'Page not found',
    paragraphs: {
      a: 'There is no page at ',
      b: 'This may be because:',
      c: 'you typed or pasted the web address incorrectly'
    }
  },
  multipleLocations: {
    pageTitle: 'Check local air quality - GOV.UK',
    title: 'Locations matching',
    serviceName: 'Check local air quality',
    paragraphs: {
      a: 'More than one match was found for your location. Choose the correct location from the following options:',
      b: 'Alternatively,',
      c: 'try searching again'
    }
  },
  phaseBanner: {
    paragraphs: {
      a: 'Beta',
      b: 'Give your',
      c: 'feedback',
      d: 'on this new service'
    }
  },
  backlink: {
    text: 'Change location'
  },
  cookieBanner: {
    title: 'Cookies on Check local air quality',
    paragraphs: {
      a: 'We use some essential cookies to make this service work.',
      b: "We'd also like to use analytics cookies so we can understand how you use the service and make improvements."
    },
    buttons: {
      a: 'Accept analytics cookies',
      b: 'Reject analytics cookies',
      c: 'View cookies'
    }
  },
  footerTxt: {
    cookies: 'Cookies',
    privacy: 'Privacy',
    accessibility: 'Accessibility statement',
    paragraphs: {
      a: 'All content is available under the',
      b: 'Open Government Licence v3.0, ',
      c: 'except where otherwise stated',
      d: 'Crown copyright'
    }
  },
  daqi: {
    paragraphs: {
      a: 'The air pollution forecast for today is',
      b: 'out of 10'
    },
    caption:
      'The daily air quality index (DAQI) tells you about levels of air pollution. It provides health advice for current levels.',
    summaryText: 'How different levels of air pollution can affect health',
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
    pollutantText: {
      a: 'Gases',
      b: 'Produced by burning fossil fuels. For example, in cars, power stations and factories.',
      c: 'Particulate matter are tiny pieces of solid or liquid particles suspended in the air. They come from sources like car tyres, brakes, exhausts, dust, wood burning and pollen.',
      d: 'Particulate matter (PM)'
    },
    pollutantsNames: {
      a: 'Ozone',
      b: 'Nitrogen dioxide',
      c: 'Sulphur dioxide',
      d: 'PM2.5',
      e: 'PM10'
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
        'The level is calculated based on the daily air quality index (DAQI). There are 4 levels: low, moderate, high and very high.',
      latest:
        'Readings are measured every hour. The unit µg/&#13221; stands for micrograms (one millionth of a gram) per cubic metre of air.'
    }
  },
  pollutants: {
    ozone: {
      title: 'Ozone (O₃)',
      pageTitle: 'Ozone(O₃) – Check local air quality – GOV.UK',
      headerText: 'Check local air quality',
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
      }
    },
    nitrogenDioxide: {
      title: 'Nitrogen dioxide (NO₂)',
      pageTitle: 'Nitrogen dioxide (NO₂) – Check local air quality – GOV.UK',
      headerText: 'Check local air quality',
      headings: {
        a: 'Sources of nitrogen dioxide',
        b: 'Health effects'
      },
      paragraphs: {
        a: 'Nitrogen dioxide is a colourless gas. It’s mainly produced during:',
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
      }
    },
    sulphurDioxide: {
      title: 'Sulphur dioxide (SO₂)',
      pageTitle: 'Sulphur dioxide (NO₂) – Check local air quality – GOV.UK',
      headerText: 'Check local air quality',
      headings: {
        a: 'Sources of sulphur dioxide',
        b: 'Health effects'
      },
      paragraphs: {
        a: 'Sulphur dioxide is a colourless gas with a strong odour. It’s mainly produced from:',
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
      }
    },
    particulateMatter10: {
      title: 'Particulate matter (PM10)',
      pageTitle: 'Particulate matter (PM10) – Check local air quality – GOV.UK',
      headerText: 'Check local air quality',
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
      }
    },
    particulateMatter25: {
      title: 'Particulate matter (PM2.5)',
      pageTitle:
        'Particulate matter (PM2.5) – Check local air quality – GOV.UK',
      headerText: 'Check local air quality',
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
        t: 'Alzheimer’s and Parkinson’s disease',
        u: 'poor lung health in children'
      }
    }
  },
  footer: {
    privacy: {
      title: 'Check local air quality privacy notice',
      headings: {
        a: 'What personal data we collect and how it is used',
        b: 'Lawful basis for processing your personal data',
        c: 'Consent to process your personal data',
        d: '>Who we share your personal data with',
        e: 'How long we hold personal data',
        f: 'What happens if you do not provide the personal data',
        g: 'The personal data you provide is not used for:',
        h: 'Transfer of your personal data outside of the UK',
        i: 'Your rights',
        j: 'Complaints'
      },
      paragraphs: {
        a: 'This privacy notice explains how the Check local air quality service processes and shares your personal data. If you have any queries about the content of this privacy notice, please email <a href="mailto:data.protection@defra.gov.uk">data.protection@defra.gov.uk.',
        b: 'Department for Environment, Food and Rural Affairs (Defra) is the controller for the personal data we collect:',
        c: 'Department for Environment, Food and Rural Affairs',
        d: 'Seacole Building',
        e: '2 Marsham Street',
        f: 'London',
        g: 'SW1P 4DF',
        h: 'If you need further information about how Defra uses your personal data and your associated rights you can contact the Defra data protection manager at ',
        i: 'or at the above address.',
        j: 'The data protection officer for Defra is responsible for checking that Defra complies with legislation. You can contact them at',
        k: 'We collect:',
        l: 'the postcode or placename that you search for as this is essential data for the service to give relevant data',
        m: 'your IP address so that we can collect information on where users are based',
        n: 'your device and operating system to enable us to improve our service',
        o: "the search term you used to find 'Check local air quality' to enable us to improve our service",
        p: "the pages you interact with in 'Check local air quality' to enable us to improve our service",
        q: 'The legal basis for processing your personal data to conduct research on the effectiveness of the service is consent. You do not have to provide your consent and you can withdraw your consent at any time.',
        r: 'The processing of your personal data is based on consent. You can withdraw consent at any time by emailing ',
        s: 'We do not share the personal data collected under this privacy notice with other organisations.',
        t: 'We respect your personal privacy when responding to access to information requests. We only share information when necessary to meet the statutory requirements of the Environmental Information Regulations 2004 and the Freedom of Information Act 2000.',
        u: 'We will keep your personal data for 7 in line with legislative requirements which is 7.',
        v: 'Contact the Defra Record Centre',
        w: 'If you do not provide the personal data of the postcode or location that you are searching for, then you will not be able to use our service as we will not be able to provide you any data.',
        x: 'The other personal data is optional and only required for service improvement.',
        y: 'The personal data you provide is not used for:',
        z: 'automated decision making (making a decision by automated means without any human involvement)',
        a1: 'profiling (automated processing of personal data to evaluate certain things about an individual)',
        a2: 'We will only transfer your personal data to another country that is deemed adequate for data protection purposes.',
        a3: 'Based on the lawful processing above, your individual rights are:',
        a4: 'Consent',
        a5: 'The right to be informed',
        a6: 'The right of access',
        a7: 'The right to rectification',
        a8: 'The right to erasure',
        a9: 'The right to restrict processing',
        a10: 'The right to data portability',
        a11: 'Rights in relation to automated decision making and profiling',
        a12: 'More information about your',
        a13: 'individual rights',
        a14: 'under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018 (DPA 2018),',
        a15: 'can be found at the Information Commissioner’s Office',
        a16: 'Complaints',
        a17: 'You have the right to',
        a18: 'make a complaint',
        a19: 'to the Information Commissioner’s Office at any time.',
        c20: 'Personal information charter',
        c21: 'Our',
        c22: 'personal information charter',
        c23: 'explains more about your rights over your personal data.'
      }
    },
    cookies: {
      title: '',
      headings: {
        a: '',
        b: '',
        c: ''
      },
      paragraphs: {
        a: '',
        b: '',
        c: ''
      }
    },
    accessibility: {
      title: '',
      headings: {
        a: '',
        b: '',
        c: ''
      },
      paragraphs: {
        a: '',
        b: '',
        c: ''
      }
    }
  }
}
