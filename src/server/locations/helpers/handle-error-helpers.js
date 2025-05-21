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
import {
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  AIR_QUALITY_THRESHOLD_1,
  AIR_QUALITY_THRESHOLD_2,
  AIR_QUALITY_THRESHOLD_3,
  AIR_QUALITY_THRESHOLD_4
} from '~/src/server/data/constants'
/**
 * Handles the case where search terms are not provided.
 */
const REFERER_PATH_INDEX = 3 // '' Index for the path segment in the referer header

const getRefererPath = (request) => {
  // '' Extracts the path segment from the referer header.
  const tempString = request?.headers?.referer?.split('/')[REFERER_PATH_INDEX]
  return tempString?.split('?')[0]
}

const getLocationTypeAndName = (request, payload) => {
  // '' Retrieves locationType and locationNameOrPostcode from payload or session.
  const locationType = request.payload?.locationType
  const locationNameOrPostcode =
    getLocationNameOrPostcode(locationType, payload) ||
    request.yar.get('locationNameOrPostcode')
  return { locationType, locationNameOrPostcode }
}

const setSessionValues = (
  request,
  locationType,
  locationNameOrPostcode,
  airQuality
) => {
  // '' Sets session values for locationType, locationNameOrPostcode, and airQuality.
  request.yar.set('locationType', locationType)
  request.yar.set('locationNameOrPostcode', locationNameOrPostcode)
  request.yar.set('airQuality', airQuality)
}

const handleNoSearchTerms = (request, h, lang, payload) => {
  // '' Main handler for missing search terms.
  const str = getRefererPath(request)
  let { locationType, locationNameOrPostcode } = getLocationTypeAndName(
    request,
    payload
  )
  const airQuality = getAirQuality(
    payload?.aq,
    AIR_QUALITY_THRESHOLD_1,
    AIR_QUALITY_THRESHOLD_2,
    AIR_QUALITY_THRESHOLD_3,
    AIR_QUALITY_THRESHOLD_4
  )

  if (
    !locationType &&
    str !== 'search-location' &&
    str !== 'chwilio-lleoliad'
  ) {
    locationType = request.yar.get('locationType')
    locationNameOrPostcode = request.yar.get('locationNameOrPostcode')
  } else {
    setSessionValues(request, locationType, locationNameOrPostcode, airQuality)
  }

  if (!locationType && !locationNameOrPostcode) {
    return handleMissingLocation(request, h, lang)
  }

  const userLocation = formatPostcode(locationNameOrPostcode?.toUpperCase())

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
