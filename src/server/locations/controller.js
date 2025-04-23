import { english } from '~/src/server/data/en/en.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'

const logger = createLogger()

// Helper function to determine language
const determineLanguage = (queryLang, path, referer) => {
  const lang = queryLang?.slice(0, 2)
  if (lang === LANG_CY) {
    return LANG_CY
  }
  if (lang === LANG_EN) {
    return LANG_EN
  }
  if (path === '/location') {
    return LANG_EN
  }
  return referer?.includes('search-location') ? LANG_EN : LANG_CY
}

// Helper function to prepare view data
const prepareViewData = (lang = LANG_EN) => {
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
    lang // Language
  }
}

// Refactored handler function
const getLocationDataController = {
  handler: async (request, h) => {
    try {
      const { query, path, headers } = request // Destructure request properties
      const referer = headers?.referer // Extract referer from headers

      // Determine the language
      const lang = determineLanguage(query?.lang, path, referer)

      // Prepare the view data
      const viewData = prepareViewData(lang)

      // Render the view
      return h.view('location-not-found/index', viewData)
    } catch (error) {
      // Log the error and rethrow it
      logger.error('Error in getLocationDataController.handler:', error) // ''
      throw error
    }
  }
}

export { getLocationDataController, determineLanguage, prepareViewData }
