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
import { createLocationBackLink } from '../back-link-helper.js'

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
        const queryParams = new URLSearchParams({ lang: LANG_EN })
        if (query.locationId) {
          queryParams.append('locationId', query.locationId)
        }
        if (query.locationName) {
          queryParams.append('locationName', query.locationName)
        }
        if (query.searchTerms) {
          queryParams.append('searchTerms', query.searchTerms)
        }
        return h
          .redirect(`${englishPath}?${queryParams.toString()}`)
          .code(REDIRECT_STATUS_CODE)
      }

      // Determine language with Welsh path validation
      let lang = query?.lang?.slice(0, LANG_SLICE_LENGTH)
      const expectedWelshPath = WELSH_PATH_PATTERNS[welshPathKey]
      if (lang !== LANG_CY && lang !== LANG_EN && path === expectedWelshPath) {
        lang = LANG_CY
      }

      // '' Redirect to search location if no locationId (user needs to search for location)
      const { locationId, locationName, searchTerms } = query || {}
      if (!locationId) {
        return h
          .redirect(`/chwilio-lleoliad/cy?lang=cy`)
          .code(REDIRECT_STATUS_CODE)
      }

      // '' Create context-aware back link based on query params
      const backLinkConfig = createLocationBackLink({
        locationId,
        locationName,
        searchTerms,
        lang: LANG_CY
      })

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
        currentPath: expectedWelshPath,
        queryParams: query,
        locationId,
        locationName,
        searchTerms,
        lang,
        ...backLinkConfig
      }

      return h.view(viewTemplate, viewContext)
    }
  }
}
