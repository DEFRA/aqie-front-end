import { english } from '../../data/en/en.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../../data/constants.js'
import { getAirQualitySiteUrl } from './get-site-url.js'
import { createLocationBackLink } from './back-link-helper.js'

/**
 * Configuration for each pollutant type
 */
const pollutantConfigs = {
  nitrogenDioxide: {
    dataKey: 'nitrogenDioxide',
    viewTemplate: 'nitrogen-dioxide/index',
    pageName: 'nitrogen dioxide',
    currentPath: '/pollutants/nitrogen-dioxide',
    welshRedirectPath: '/llygryddion/nitrogen-deuocsid/cy'
  },
  ozone: {
    dataKey: 'ozone',
    viewTemplate: 'ozone/index',
    pageName: 'ozone',
    currentPath: '/pollutants/ozone',
    welshRedirectPath: '/llygryddion/oson/cy'
  },
  particulateMatter10: {
    dataKey: 'particulateMatter10',
    viewTemplate: 'particulate-matter-10/index',
    pageName: 'particulate matter 10',
    currentPath: '/pollutants/particulate-matter-10',
    welshRedirectPath: '/llygryddion/mater-gronynnol-10/cy'
  },
  particulateMatter25: {
    dataKey: 'particulateMatter25',
    viewTemplate: 'particulate-matter-25/index',
    pageName: 'particulate matter 25',
    currentPath: '/pollutants/particulate-matter-25',
    welshRedirectPath: '/llygryddion/mater-gronynnol-25/cy'
  },
  sulphurDioxide: {
    dataKey: 'sulphurDioxide',
    viewTemplate: 'sulphur-dioxide/index',
    pageName: 'sulphur dioxide',
    currentPath: '/pollutants/sulphur-dioxide',
    welshRedirectPath: '/llygryddion/sylffwr-deuocsid/cy'
  }
}

/**
 * Generic pollutant controller handler
 * Eliminates code duplication across all English pollutant controllers
 *
 * @param {string} pollutantType - The pollutant type key (e.g., 'nitrogenDioxide', 'ozone')
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} Hapi response
 */
export function createPollutantHandler(pollutantType, request, h) {
  const config = pollutantConfigs[pollutantType]
  if (!config) {
    throw new Error(`Unknown pollutant type: ${pollutantType}`)
  }

  const pollutantData = english.pollutants[config.dataKey]
  const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
  const { query } = request
  const lang = LANG_EN
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // Handle Welsh language redirect
  if (query?.lang && query?.lang === LANG_CY) {
    const queryParams = new URLSearchParams({ lang: LANG_CY })
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
      .redirect(`${config.welshRedirectPath}?${queryParams.toString()}`)
      .code(REDIRECT_STATUS_CODE)
  }

  // Redirect to search location if no locationId
  const { locationId, locationName, searchTerms } = query || {}
  if (!locationId) {
    return h
      .redirect(`/search-location?lang=${lang}`)
      .code(REDIRECT_STATUS_CODE)
  }

  // Create context-aware back link
  const backLinkConfig = createLocationBackLink({
    locationId,
    locationName,
    searchTerms,
    lang
  })

  // Build view context
  const viewContext = {
    pageTitle: pollutantData.pageTitle,
    description: pollutantData.description,
    metaSiteUrl,
    [config.dataKey]: pollutantData,
    page: config.pageName,
    ...backLinkConfig,
    phaseBanner,
    footerTxt,
    cookieBanner,
    serviceName: multipleLocations.serviceName,
    currentPath: config.currentPath,
    queryParams: query,
    locationId,
    locationName,
    searchTerms: searchTerms || null,
    lang: query.lang ?? lang
  }

  return h.view(config.viewTemplate, viewContext)
}
