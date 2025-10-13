''
const SERVICE_NAME = 'Check air quality'

/**
 * English translations for navigation, search, and authentication components
 */
export const navigationTranslations = {
  login: {
    pageTitle: `Sign in - ${SERVICE_NAME} - GOV.UK`,
    heading: 'This is a private beta',
    texts: {
      a: 'You should only continue if you have been invited to.',
      b: 'Password',
      buttonText: 'Continue'
    }
  },
  home: {
    pageTitle: `${SERVICE_NAME} - GOV.UK`,
    heading: SERVICE_NAME,
    page: SERVICE_NAME,
    paragraphs: {
      a: 'Use this service to:',
      b: 'check air quality in a local area',
      c: 'find information on air pollutants',
      d: 'find health information and guidance'
    },
    button: 'Start now',
    description: `${SERVICE_NAME} in your local area and the air pollution forecast for the next 5 days. Also, get health advice to reduce your exposure to pollutants`
  },
  searchLocation: {
    pageTitle: `Where do you want to check? - ${SERVICE_NAME} - GOV.UK`,
    heading: SERVICE_NAME,
    page: 'search-location',
    serviceName: SERVICE_NAME,
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
    heading: SERVICE_NAME,
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
      pageTitle: `Sorry, there is a problem with the service - ${SERVICE_NAME} - GOV.UK`,
      heading: 'Sorry, there is a problem with the service',
      paragraphs: {
        a: 'Try again later',
        b: 'You can contact the ',
        c: 'air quality team ',
        d: ' if this error continues'
      }
    },
    nonService: {
      pageTitle: `Page not found - ${SERVICE_NAME} - GOV.UK`,
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
    pageTitle: `${SERVICE_NAME} - GOV.UK`,
    title: 'Locations matching',
    serviceName: SERVICE_NAME,
    paragraphs: {
      a: 'More than one match was found for your location. Choose the correct location from the following options:',
      b: 'Alternatively,',
      c: 'try searching again'
    },
    description: `${SERVICE_NAME} in your local area and the air pollution forecast for the next 5 days. Also, get health advice to reduce your exposure to pollutants.`
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
  dailySummaryTexts: {
    paragraphs: {
      b: 'Today',
      c: 'Tomorrow',
      d: 'Outlook'
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
