/**
 * Shared helper for Welsh pollutant controllers to reduce code duplication
 * Handles common patterns: language detection, English redirects, and view rendering
 */

import { welsh } from '../../../data/cy/cy.js'
import {
  LANG_CY,
  LANG_EN,
  REDIRECT_STATUS_CODE,
  LANG_SLICE_LENGTH
} from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../get-site-url.js'

// Common view properties that all pollutant controllers use
const COMMON_VIEW_PROPERTIES = {
  displayBacklink: false
}

// Language redirect patterns for Welsh pollutant pages
const WELSH_PATH_PATTERNS = {
  'sylffwr-deuocsid': '/llygryddion/sylffwr-deuocsid/cy',
  'mater-gronynnol-10': '/llygryddion/mater-gronynnol-10/cy',
  'nitrogen-deuocsid': '/llygryddion/nitrogen-deuocsid/cy',
  oson: '/llygryddion/oson/cy',
  'mater-gronynnol-25': '/llygryddion/mater-gronynnol-25/cy'
}

/**
 * Creates a standardized Welsh pollutant controller handler
 * @param {Object} config - Configuration object
 * @param {string} config.pollutantKey - Key in welsh.pollutants (e.g., 'sulphurDioxide')
 * @param {string} config.englishPath - English redirect path (e.g., '/pollutants/sulphur-dioxide')
 * @param {string} config.viewTemplate - View template name (e.g., 'sulphur-dioxide/index')
 * @param {string} config.welshPathKey - Key for Welsh path pattern matching
 * @param {string} config.pageIdentifier - Page identifier for view context
 * @returns {Object} Hapi controller object
 */
export function createWelshPollutantController(config) {
  const {
    pollutantKey,
    englishPath,
    viewTemplate,
    welshPathKey,
    pageIdentifier
  } = config

  return {
    handler: (request, h) => {
      const pollutantData = welsh.pollutants[pollutantKey]
      const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
      const { query, path } = request
      const metaSiteUrl = getAirQualitySiteUrl(request)

      // Handle English language redirect
      if (query?.lang && query?.lang === LANG_EN) {
        return h.redirect(`${englishPath}?lang=en`).code(REDIRECT_STATUS_CODE)
      }

      // Determine language with Welsh path validation
      let lang = query?.lang?.slice(0, LANG_SLICE_LENGTH)
      const expectedWelshPath = WELSH_PATH_PATTERNS[welshPathKey]
      if (lang !== LANG_CY && lang !== LANG_EN && path === expectedWelshPath) {
        lang = LANG_CY
      }

      // Create view context with standardized properties
      const viewContext = {
        pageTitle: pollutantData.pageTitle,
        description: pollutantData.description,
        metaSiteUrl,
        [pollutantKey]: pollutantData,
        page: pageIdentifier,
        phaseBanner,
        footerTxt,
        cookieBanner,
        serviceName: multipleLocations.serviceName,
        lang,
        ...COMMON_VIEW_PROPERTIES
      }

      return h.view(viewTemplate, viewContext)
    }
  }
}
