import {
  siteTypeDescriptions,
  pollutantTypes
} from '../data/en/monitoring-sites.js'
import * as airQualityData from '../data/en/air-quality.js'
import {
  LANG_CY,
  LANG_EN,
  LOCATION_NOT_FOUND,
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK
} from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { english, calendarEnglish } from '../data/en/en.js'
import { calendarWelsh } from '../data/cy/cy.js'
import moment from 'moment-timezone'
import { convertFirstLetterIntoUppercase } from '../locations/helpers/convert-first-letter-into-upper-case.js'
import { gazetteerEntryFilter } from '../locations/helpers/gazetteer-util.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getSearchTermsFromUrl } from '../locations/helpers/get-search-terms-from-url.js'
import { transformKeys } from '../locations/helpers/transform-summary-keys.js'
import { airQualityValues } from '../locations/helpers/air-quality-values.js'
import { getNearestLocation } from '../locations/helpers/get-nearest-location.js'
import { getIdMatch } from '../locations/helpers/get-id-match.js'
import { getNIData } from '../locations/helpers/get-ni-single-data.js'
import { compareLastElements } from '../locations/helpers/convert-string.js'

const logger = createLogger()
const HTTP_INTERNAL_SERVER_ERROR = 500

// Ensure proper formatting of the try-catch block
const getLocationDetailsController = {
  handler: async (request, h) => {
    try {
      const { query, headers, params, yar, url } = request
      const locationId = params.id
      const searchTermsSaved = yar.get('searchTermsSaved')

      // Extracted logic for Welsh redirection
      const welshRedirect = redirectToWelshLocation(query, locationId, h)
      if (welshRedirect) {
        return welshRedirect
      }

      // Extracted logic for search terms redirection
      const previousUrl = headers.referer || headers.referrer
      const currentUrl = url.href
      const searchTermsRedirect = handleSearchTermsRedirection(
        previousUrl,
        currentUrl,
        searchTermsSaved,
        request,
        h
      )
      if (
        (previousUrl === undefined && !searchTermsSaved) ||
        (isPreviousAndCurrentUrlEqual && !searchTermsSaved)
      ) {
        const { searchTerms, secondSearchTerm, searchTermsLocationType } =
          getSearchTermsFromUrl(currentUrl)
        request.yar.clear('locationData')
        return h
          .redirect(
            `/location?lang=en&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(
              secondSearchTerm
            )}&searchTermsLocationType=${encodeURIComponent(
              searchTermsLocationType
            )}`
          )
          .takeover()
      }

      yar.clear('searchTermsSaved')

      // Extracted logic for language and date formatting
      const lang = query?.lang ?? LANG_EN
      const formattedDate = moment().format('DD MMMM YYYY').split(' ')
      const getMonth = calendarEnglish.findIndex((item) =>
        item.includes(formattedDate[1])
      )

      const metaSiteUrl = getAirQualitySiteUrl(request)
      const locationData = yar.get('locationData') || []
      const { getForecasts, getMeasurements } = locationData

      // Extracted logic for location type determination
      const locationType = determineLocationType(locationData)

      let distance
      if (locationData.locationType === LOCATION_TYPE_NI) {
        distance = determineNearestLocation(
          locationData,
          getForecasts,
          getMeasurements,
          locationType,
          0,
          lang
        )
      }

      const indexNI = 0
      const { resultNI } = getNIData(locationData, distance, locationType)

      // Extracted logic for matching location ID
      const { locationIndex, locationDetails } = matchLocationId(
        locationId,
        locationData,
        resultNI,
        locationType,
        indexNI
      )

      const { forecastNum, nearestLocationsRange } = determineNearestLocation(
        locationData,
        getForecasts,
        getMeasurements,
        locationType,
        locationIndex,
        lang
      )

      logger.debug(`locationDetails: ${locationDetails}`)

      const { notFoundLocation, daqi, multipleLocations } = english

      if (locationDetails) {
        const config = {
          english,
          multipleLocations,
          daqi,
          calendarWelsh,
          getMonth,
          forecastNum,
          nearestLocationsRange,
          locationData,
          lang,
          metaSiteUrl
        }

        return renderLocationDetailsView(locationDetails, config, h)
      }

      return renderLocationNotFoundView(notFoundLocation, english, lang, h)
    } catch (error) {
      logger.error(`Error on single location: ${error.message}`)
      const errorResponse = {
        error: 'Internal Server Error',
        message: error.message
      }
      return h.response(errorResponse).code(HTTP_INTERNAL_SERVER_ERROR)
    }
  }
}

export { getLocationDetailsController }
