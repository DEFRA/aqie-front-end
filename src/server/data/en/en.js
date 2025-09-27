export const english = {
  login: {
    pageTitle: 'Sign in - Check air quality - GOV.UK',
    heading: 'This is a private beta',
    texts: {
      a: 'You should only continue if you have been invited to.',
      b: 'Password',
      buttonText: 'Continue'
    }
  },
  home: {
    pageTitle: 'Check air quality - GOV.UK',
    heading: 'Check air quality',
    page: 'Check air quality',
    paragraphs: {
      a: 'Use this service to:',
      b: 'check air quality in a local area',
      c: 'find information on air pollutants',
      d: 'find health information and guidance'
    },
    button: 'Start now',
    description:
      'Check air quality in your local area and the air pollution forecast for the next 5 days. Also, get health advice to reduce your exposure to pollutants'
  },
  searchLocation: {
    pageTitle: 'Where do you want to check? - Check air quality - GOV.UK',
    heading: 'Check air quality',
    page: 'search-location',
    serviceName: 'Check air quality',
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
            text: 'Enter a postcode'
          }
        }
      }
    },
    description:
      'Search the air quality in any local area. Also, get health advice about air pollution and how to reduce your exposure.'
  },
  notFoundLocation: {
    heading: 'Check air quality',
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
    serviceAll: {
      heading: 'Sorry, this service is unavailable',
      paragraphs: {
        a: 'Try again later',
        b: 'You can contact the ',
        c: 'air quality team ',
        d: ' if this error continues'
      }
    },
    serviceAPI: {
      pageTitle:
        'Sorry, there is a problem with the service - Check air quality - GOV.UK',
      heading: 'Sorry, there is a problem with the service',
      paragraphs: {
        a: 'Try again later',
        b: 'You can contact the ',
        c: 'air quality team ',
        d: ' if this error continues'
      }
    },
    nonService: {
      pageTitle: 'Page not found - Check air quality - GOV.UK',
      heading: 'Page not found',
      paragraphs: {
        a: 'If you typed the web address, check it is correct.',
        b: 'If you pasted the web address, check you copied the entire address.',
        c: 'Contact the ',
        d: 'air quality team',
        e: ' if you continue to get this error message.'
      }
    }
  },
  multipleLocations: {
    titlePrefix: 'Air quality in',
    pageTitle: 'Check air quality - GOV.UK',
    title: 'Locations matching',
    serviceName: 'Check air quality',
    paragraphs: {
      a: 'More than one match was found for your location. Choose the correct location from the following options:',
      b: 'Alternatively,',
      c: 'try searching again'
    },
    description:
      'Check air quality in your local area and the air pollution forecast for the next 5 days. Also, get health advice to reduce your exposure to pollutants.'
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
    title: 'Cookies on Check air quality',
    paragraphs: {
      a: 'We use some essential cookies to make this service work.',
      b: "We'd also like to use analytics cookies so we can understand how you use the service and make improvements."
    },
    buttons: {
      a: 'Accept analytics cookies',
      b: 'Reject analytics cookies',
      c: 'View cookies'
    },
    hideCookieMsg: {
      text0: 'You’ve accepted analytics cookies. You can ',
      text1: 'You’ve rejected analytics cookies. You can',
      text2: 'change your cookie settings',
      text3: ' at any time.',
      buttonText: 'Hide cookie message'
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
    description: {
      a: 'Check air quality for',
      b: '. Get health advice, pollutant information and guidance on how to reduce your exposure to air pollution.'
    },
    caption:
      'The daily air quality index (DAQI) tells you about levels of air pollution. It provides health advice for current levels.',
    summaryText: 'How different levels of air pollution can affect health',
    predictionLink: 'Find out how air pollution is predicted and measured',
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
  },
  pollutants: {
    ozone: {
      title: 'Ozone (O₃)',
      pageTitle: 'Ozone(O₃) – Check air quality – GOV.UK',
      headerText: 'Check air quality',
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
      pageTitle: 'Nitrogen dioxide (NO₂) – Check air quality – GOV.UK',
      headerText: 'Check air quality',
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
      },
      description:
        'Learn how nitrogen dioxide is produced. Also, learn the short term and long term health effects of nitrogen dioxide exposure.'
    },
    sulphurDioxide: {
      title: 'Sulphur dioxide (SO₂)',
      pageTitle: 'Sulphur dioxide (SO₂) – Check air quality – GOV.UK',
      headerText: 'Check air quality',
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
      },
      description:
        'Learn how sulphur dioxide is produced. Also, learn the short term and long term health effects of sulphur dioxide'
    },
    particulateMatter10: {
      title: 'Particulate matter (PM10)',
      pageTitle: 'Particulate matter (PM10) – Check air quality – GOV.UK',
      headerText: 'Check air quality',
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
      pageTitle: 'Particulate matter (PM2.5) – Check air quality – GOV.UK',
      headerText: 'Check air quality',
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
      },
      description:
        'PM2.5 is a particulate matter (PM) made of small particles of solids or liquids in the air. Learn the sources of PM2.5 and how exposure can impact health.'
    }
  },
  dailySummaryTexts: {
    paragraphs: {
      a: 'UK air pollution summary',
      b: 'Today',
      c: 'Tomorrow',
      d: 'Outlook'
    }
  },
  footer: {
    privacy: {
      pageTitle: 'Privacy - Check air quality - GOV.UK',
      title: 'Check air quality privacy notice',
      heading: 'Check air quality',
      headings: {
        a: 'Who collects your personal data',
        b: 'What personal data we collect and how it is used',
        c: 'Lawful basis for processing your personal data',
        d: 'Consent to process your personal data',
        e: 'Who we share your personal data with',
        f: 'How long we hold personal data',
        g: 'What happens if you do not provide the personal data',
        h: 'Use of automated decision-making or profiling',
        i: 'Transfer of your personal data outside of the UK',
        j: 'Your rights',
        k: 'Complaints',
        l: 'Personal information charter'
      },
      paragraphs: {
        a: 'This privacy notice explains how the Check air quality service processes and shares your personal data. If you have any queries about the content of this privacy notice, please email',
        b: 'Department for Environment, Food and Rural Affairs (Defra) is the controller for the personal data we collect:',
        c: 'Department for Environment, Food and Rural Affairs',
        d: 'Seacole Building',
        e: '2 Marsham Street',
        f: 'London',
        g: 'SW1P 4DF',
        h: 'If you need further information about how Defra uses your personal data and your associated rights you can contact the Defra data protection manager at ',
        i: 'or at the above address.',
        j: 'The data protection officer for Defra is responsible for checking that Defra complies with legislation. You can contact them at',
        k0: 'For the service to be functional, we collect the postcode or placename that you search for as this is essential data for the service to give relevant data.',
        k: 'If you accept the Google analytical cookies, then we will collect:',
        l: 'your IP address so that we can collect location information of users to our service. This will help us see what geographical locations are using our service. ',
        m: 'your device and operating system to enable us to improve our service',
        n: "the search term you used to find 'Check air quality' to enable us to improve our service",
        o: "the pages you interact with in 'Check air quality' to enable us to improve our service",
        q: 'The legal basis for processing your personal data to conduct research on the effectiveness of the service is consent. You do not have to provide your consent and you can withdraw your consent at any time.',
        r: 'The processing of your personal data is based on consent. We do not collect any information that could be personally linked to an individual; however, the IP address will be recorded for functionality of the service.',
        r2: 'If you have consented to accepting cookies, any information that we collect during this process cannot be removed as we will be unable to identify that information to a specific individual.',
        s: 'We do not share the personal data collected under this privacy notice with other organisations.',
        t: 'We respect your personal privacy when responding to access to information requests. We only share information when necessary to meet the statutory requirements of the Environmental Information Regulations 2004 and the Freedom of Information Act 2000.',
        u: 'We will keep your personal data for 7 years in line with legislative requirements which is 7 years.',
        w: 'for advice on retention period that you need to state here.',
        x: 'If you do not provide the personal data of the postcode or location that you are searching for, then you will not be able to use our service as we will not be able to provide you any data.',
        y: 'The other personal data is optional and only required for service improvement.',
        z: 'The personal data you provide is not used for:',
        a0: 'automated decision making (making a decision by automated means without any human involvement)',
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
        a16: 'You have the right to',
        a17: 'make a complaint',
        a18: 'to the Information Commissioner’s Office at any time.',
        a19: 'Personal information charter',
        a20: 'Our',
        a21: 'personal information charter',
        a22: 'explains more about your rights over your personal data.',
        a23: 'You can',
        a24: 'opt in and out of cookie acceptance.'
      },
      description:
        'Check air quality takes your privacy seriously. Read this Privacy Policy to learn how we treat your personal data.'
    },
    cookies: {
      title: 'Cookies',
      pageTitle: 'Cookies - Check air quality - GOV.UK',
      headings: {
        a: 'Essential cookies (strictly necessary)',
        b: 'Analytics cookies (optional)',
        c: 'Analytics cookies we use',
        d: 'Do you want to accept analytics cookies?'
      },
      table1: {
        title: 'Essential cookies we use',
        text1: 'Name',
        text2: 'Purpose',
        text3: 'Expires',
        text4: 'airaqie_cookies_analytics',
        text5: 'Saves your cookie consent settings',
        text6: '1 year'
      },
      table2: {
        text1: 'Name',
        text2: 'Purpose',
        text3: 'Expires',
        text4:
          'Helps us count how many people visit the Check air quality by telling us if you’ve visited before.',
        text5: '2 years',
        text6: '_gid',
        text7:
          'Helps us count how many people visit the Check air quality by telling us if you’ve visited before.',
        text8: '24 hours',
        text9: 'Used to reduce the number of requests.',
        text10: '1 minute',
        text11:
          'Application related data is managed in this cookie and it is required for application functionality to work',
        text12: '30 minutes'
      },
      paragraphs: {
        w: '',
        a: 'Check air quality',
        b: 'puts small files (known as ‘cookies’) on your computer.',
        c: 'These cookies are used across the Check air quality website.',
        d: 'We only set cookies when JavaScript is running in your browser and you’ve accepted them. If you choose not to run Javascript, the information on this page will not apply to you.',
        e: 'Find out',
        f: 'how to manage cookies',
        g: 'from the Information Commissioner‘s Office.',
        h: 'We use an essential cookie to remember when you accept or reject cookies on our website.',
        i: 'We use Google Analytics software to understand how people use the Check air quality. We do this to help make sure the site is meeting the needs of its users and to help us make improvements.',
        j: 'We do not collect or store your personal information (for example your name or address) so this information cannot be used to identify who you are.',
        k: 'We do not allow Google to use or share our analytics data.',
        l: 'Google Analytics stores information about:',
        m: 'the pages you visit',
        n: 'how long you spend on each page',
        o: 'how you arrived at the site',
        p: 'what you click on while you visit the site',
        q: 'the device and browser you use',
        r: 'Yes',
        s: 'No',
        buttonText: 'Save cookie settings',
        ga1: 'The cookies',
        ga2: '_ga_',
        ga3: '_gat_UA-[G-8CMZBTDQBC]',
        ga4: 'and',
        ga5: 'will only be active if you accept the cookies. However, if you do not accept cookies, they may still appear in your cookie session, but they will not be active.'
      },
      description:
        'Check air quality uses cookies. By using this service you agree to our use of cookies.'
    },
    accessibility: {
      title: 'Accessibility Statement',
      pageTitle: 'Accessibility Statement - Check air quality - GOV.UK',
      headings: {
        a: 'Compliance status',
        b: 'Preparation of this accessibility statement',
        c: 'Feedback and contact information',
        d: 'Enforcement procedure'
      },
      paragraphs: {
        a: 'Department for Environment, Food & Rural Affairs is committed to making its websites accessible in accordance with the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018.',
        b: 'This accessibility statement applies to',
        c: 'This website is fully compliant with the Web Content Accessibility Guidelines (WCAG) version 2.2 AA standard.',
        d: 'This statement was prepared on 18 September 2024.',
        e: 'The website was evaluated by the Department for Environment, Food & Rural Affairs.',
        f: 'The statement was last reviewed on 16 September 2024.',
        g: 'If you notice any compliance failures or need to request information and content that is not provided in this document, please email',
        h: 'The Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 (the ‘accessibility regulations’).',
        i: 'If you’re not happy with how we respond to your complaint, contact the Equality Advisory and Support Service (EASS).'
      },
      description:
        'Check air quality is committed to improving accessibility for all web, mobile, and app users, guided by the latest Web Content Accessibility Guidelines (WCAG).'
    }
  }
}

export const calendarEnglish = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]
