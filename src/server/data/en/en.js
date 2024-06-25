export const english = {
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
      a: 'Accept analytics',
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
        'There are 4 levels: low, moderate, high and very high. The level is determined by the highest reading of a single pollutant.',
      latest:
        'Readings are measured every hour. The unit µg/&#13221; stands for micrograms (one millionth of a gram) per cubic metre of air.'
    }
  }
}
