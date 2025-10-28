import {
  siteTypeDescriptions,
  pollutantTypes
} from '../../data/cy/monitoring-sites.js'
import * as airQualityData from '../../data/cy/air-quality.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import {
  LANG_CY,
  LANG_EN,
  REDIRECT_STATUS_CODE,
  HTTP_STATUS_INTERNAL_SERVER_ERROR
} from '../../data/constants.js'
import { getSearchTermsFromUrl } from '../../locations/helpers/get-search-terms-from-url.js'
import { config } from '../../../config/index.js'
// Import shared helper functions
import {
  initializeLocationVariables,
  processLocationData,
  buildLocationViewData,
  renderLocationView,
  renderNotFoundView,
  optimizeLocationDataInSession
} from '../../common/helpers/location-controller-helper.js'

const logger = createLogger()

function shouldRedirectToEnglish(query) {
  return query?.lang && query?.lang === LANG_EN && !query?.searchTerms
}

function getPreviousUrl(request) {
  return request.headers.referer || request.headers.referrer
}

function buildRedirectUrl(currentUrl) {
  const { searchTerms, secondSearchTerm, searchTermsLocationType } =
    getSearchTermsFromUrl(currentUrl)
  return `/lleoliad?lang=cy&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(secondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(searchTermsLocationType)}`
}

// Cleaned up - UI components and helper functions now handled by shared helper

const getLocationDetailsController = {
  handler: async (request, h) => {
    try {
      const { query } = request
      const locationId = request.params.id
      const searchTermsSaved = request.yar.get('searchTermsSaved')
      const useNewRicardoMeasurementsEnabled = config.get(
        'useNewRicardoMeasurementsEnabled'
      )

      if (shouldRedirectToEnglish(query)) {
        return h.redirect(`/location/${locationId}/?lang=en`)
      }
      // Get the previous URL hit by the user from the referer header
      const previousUrl = getPreviousUrl(request)
      const currentUrl = request.url.href

      if (previousUrl === undefined && !searchTermsSaved) {
        request.yar.clear('locationData')
        return h
          .redirect(buildRedirectUrl(currentUrl))
          .code(REDIRECT_STATUS_CODE)
          .takeover()
      }

      // Initialize Welsh variables using helper
      const initData = initializeLocationVariables(request, LANG_CY)
      const locationData = request.yar.get('locationData') || {}

      // Validate session data - redirect to search if missing required data
      if (
        !Array.isArray(locationData?.results) ||
        !locationData?.getForecasts
      ) {
        request.yar.clear('locationData')
        return h
          .redirect(buildRedirectUrl(currentUrl))
          .code(REDIRECT_STATUS_CODE)
          .takeover()
      }

      // Process Welsh location data using helper
      const processedData = await processLocationData(
        request,
        locationData,
        locationId,
        LANG_CY,
        useNewRicardoMeasurementsEnabled
      )

      if (processedData.locationDetails) {
        // Optimize session data to reduce memory usage
        optimizeLocationDataInSession(
          request,
          locationData,
          processedData.nearestLocation,
          processedData.nearestLocationsRange
        )

        // Build view data using helper
        const viewData = buildLocationViewData({
          locationDetails: processedData.locationDetails,
          nearestLocationsRange: processedData.nearestLocationsRange,
          locationData,
          forecastNum: processedData.forecastNum,
          lang: LANG_CY,
          getMonth: initData.getMonth,
          metaSiteUrl: initData.metaSiteUrl,
          airQualityData,
          siteTypeDescriptions,
          pollutantTypes
        })

        return renderLocationView(h, viewData)
      } else {
        return renderNotFoundView(h, LANG_CY)
      }
    } catch (error) {
      logger.error(`error on single location ${error.message}`)
      return h
        .response('Internal Server Error')
        .code(HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export { getLocationDetailsController }
