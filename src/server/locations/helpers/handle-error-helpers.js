import { getAirQuality } from '~/src/server/data/en/air-quality.js'
import { getLocationNameOrPostcode } from '~/src/server/locations/helpers/location-type-util'
import {
  handleMissingLocation,
  handleUKError,
  handleNIError,
  formatPostcode
} from '~/src/server/locations/helpers/error-input-and-redirect-helpers.js'
import {
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  isOnlyWords,
  isValidFullPostcodeNI,
  isValidPartialPostcodeNI
} from '~/src/server/locations/helpers/convert-string'
import { LOCATION_TYPE_UK, LOCATION_TYPE_NI } from '~/src/server/data/constants'
/**
 * Handles the case where search terms are not provided.
 */
const handleNoSearchTerms = (request, h, lang, payload) => {
  const locationType =
    request.payload?.locationType || request.yar.get('locationType')
  const locationNameOrPostcode =
    getLocationNameOrPostcode(locationType, payload) ||
    request.yar.get('locationNameOrPostcode')

  if (!locationType || !locationNameOrPostcode) {
    return handleMissingLocation(request, h, lang)
  }

  const airQuality = getAirQuality(payload?.aq, 2, 4, 5, 7)
  request.yar.set('locationType', locationType)
  request.yar.set('locationNameOrPostcode', locationNameOrPostcode)
  request.yar.set('airQuality', airQuality)

  const userLocation = formatPostcode(locationNameOrPostcode.toUpperCase())

  if (!userLocation && locationType === LOCATION_TYPE_UK) {
    return handleUKError(request, h, lang, locationNameOrPostcode)
  }

  if (!userLocation && locationType === LOCATION_TYPE_NI) {
    return handleNIError(request, h, lang, locationNameOrPostcode)
  }

  return { locationType, userLocation, locationNameOrPostcode }
}

/**
 * Handles the case where search terms are provided.
 */
const handleSearchTerms = (searchTerms) => {
  if (
    isOnlyWords(searchTerms) ||
    isValidFullPostcodeUK(searchTerms) ||
    isValidPartialPostcodeUK(searchTerms)
  ) {
    return {
      locationType: 'uk-location',
      userLocation: searchTerms,
      locationNameOrPostcode: searchTerms
    }
  }

  if (
    isValidFullPostcodeNI(searchTerms) ||
    isValidPartialPostcodeNI(searchTerms)
  ) {
    return {
      locationType: 'ni-location',
      userLocation: searchTerms,
      locationNameOrPostcode: searchTerms
    }
  }

  return {
    locationType: 'uk-location',
    userLocation: searchTerms,
    locationNameOrPostcode: searchTerms
  }
}

export { handleSearchTerms, handleNoSearchTerms }
