import { getAirQuality } from '~/src/server/data/en/air-quality.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { fetchData } from '~/src/server/locations/helpers/fetch-data'
import { english } from '~/src/server/data/en/en.js'
import { LANG_EN } from '~/src/server/data/constants'
import {
  getLocationNameOrPostcode,
  handleRedirect,
  configureLocationTypeAndRedirects,
  filteredAndSelectedLocationType
} from '~/src/server/locations/helpers/location-type-util'
import { selectNIUKLocationType } from '~/src/server/locations/helpers/uk-ni-select-util'

const logger = createLogger()

const getLocationDataController = {
  handler: async (request, h) => {
    const { query, payload, headers } = request
    const lang = LANG_EN
    const tempString = headers?.referer?.split('/')[3]
    const str = tempString?.split('?')[0]
    const partialPostcodePattern = /^([A-Z]{1,2}\d[A-Z\d]?)$/

    const redirectResponse = handleRedirect(query, h)
    if (redirectResponse) {
      return redirectResponse
    }
    const { searchLocation, footerTxt, phaseBanner, cookieBanner } = english
    const locationType = payload?.locationType
    const airQuality = getAirQuality(payload?.aq, 2, 4, 5, 7)
    const locationNameOrPostcode = getLocationNameOrPostcode(
      locationType,
      payload
    )
    const userLocation = locationNameOrPostcode.toUpperCase()
    configureLocationTypeAndRedirects(
      request,
      h,
      locationType,
      locationNameOrPostcode,
      str,
      query,
      searchLocation,
      airQuality
    )
    filteredAndSelectedLocationType(
      locationType,
      userLocation,
      request,
      searchLocation,
      h
    )
    try {
      const { getDailySummary, getForecasts, getMeasurements, getOSPlaces } =
        await fetchData(locationType, userLocation, request, h)

      return selectNIUKLocationType(
        request,
        getForecasts,
        getMeasurements,
        getDailySummary,
        locationType,
        userLocation,
        locationNameOrPostcode,
        getOSPlaces,
        partialPostcodePattern,
        lang,
        h
      )
    } catch (error) {
      logger.error(
        `error from location refresh outside fetch APIs: ${error.message}`
      )
      let statusCode = 500
      if (
        error.message ===
        "Cannot read properties of undefined (reading 'access_token')"
      ) {
        statusCode = 401
      }
      return h.view('error/index', {
        pageTitle: english.notFoundUrl.serviceAPI.pageTitle,
        footerTxt,
        url: request.path,
        phaseBanner,
        displayBacklink: false,
        cookieBanner,
        serviceName: english.multipleLocations.serviceName,
        notFoundUrl: english.notFoundUrl,
        statusCode,
        lang
      })
    }
  }
}

export { getLocationDataController }
