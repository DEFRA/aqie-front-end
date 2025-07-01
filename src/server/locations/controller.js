import { english } from '../data/en/en.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

// Helper function to determine language
const determineLanguage = (queryLang, path, referer) => {
  const lang = queryLang?.slice(0, 2)
  if (lang === 'cy') {
    return 'cy'
  }
  if (lang === 'en') {
    return 'en'
  }
  if (path === '/location') {
    return 'en'
  }
  if (referer?.includes('search-location')) {
    return 'en'
  }
  return 'cy' // Default to Welsh
}

// Helper function to prepare view data
const prepareViewData = (lang = 'en') => {
  const {
    searchLocation,
    notFoundLocation,
    footerTxt,
    phaseBanner,
    backlink,
    home,
    cookieBanner
  } = english // Assuming `english` is the default language data

  return {
    userLocation: '', // Default user location
    pageTitle: `${notFoundLocation.paragraphs.a} - ${home.pageTitle}`, // Construct the page title
    paragraph: notFoundLocation.paragraphs, // Paragraph data
    footerTxt, // Footer text
    serviceName: searchLocation.serviceName, // Service name
    phaseBanner, // Phase banner data
    backlink, // Backlink data
    cookieBanner, // Cookie banner data
    lang: lang || 'en' // Ensure lang defaults to 'en'
  }
}

// Refactored handler function
const getLocationDataController = {
  handler: async (request, h) => {
    try {
      const { query, path, headers } = request // Destructure request properties
      const referer = headers?.referer // Extract referer from headers

      logger.info('Handler invoked with request:', { query, path, referer }) // Log request details

      // Determine the language
      const lang = determineLanguage(query?.lang, path, referer)
      logger.info('Determined language:', lang) // Log determined language

      // Prepare the view data
      const viewData = prepareViewData(lang)
      logger.info('Prepared view data:', viewData) // Log view data

      // Render the view
      const response = h.view('location-not-found/index', viewData)
      logger.info('View rendered successfully') // Log successful rendering

      return response
    } catch (error) {
      // Log the error and rethrow it
      logger.error('Error in getLocationDataController.handler:', error) // Log error details
      throw error
    }
  }
}

export { getLocationDataController, determineLanguage, prepareViewData }
