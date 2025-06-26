import { english, calendarEnglish } from '~/src/server/data/en/en.js'
import { calendarWelsh } from '~/src/server/data/cy/cy.js'
import moment from 'moment-timezone'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'
import { getNIData } from '~/src/server/locations/helpers/get-ni-single-data'
import redirectToWelshLocation from '~/src/server/location-id/helpers/redirectToWelshLocation.js'
import handleSearchTermsRedirection from '~/src/server/location-id/helpers/handleSearchTermsRedirection.js'
import determineLocationType from '~/src/server/location-id/helpers/determineLocationType.js'
import renderLocationDetailsView from '~/src/server/location-id/helpers/renderLocationDetailsView.js'
import renderLocationNotFoundView from '~/src/server/location-id/helpers/renderLocationNotFoundView.js'
import determineNearestLocation from '~/src/server/location-id/helpers/determineNearestLocation.js'
import matchLocationId from '~/src/server/location-id/helpers/matchLocationId.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { LANG_EN, LOCATION_TYPE_NI } from '~/src/server/data/constants.js'

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
      if (searchTermsRedirect) {
        return searchTermsRedirect
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
