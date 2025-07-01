import { getAirQuality } from '../../data/en/air-quality.js'
import { getLocationNameOrPostcode } from './location-type-util.js'
import {
  handleMissingLocation,
  handleUKError,
  handleNIError,
  formatPostcode
} from './error-input-and-redirect-helpers.js'
import {
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  isOnlyWords,
  isValidFullPostcodeNI,
  isValidPartialPostcodeNI
} from './convert-string.js'
import {
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  AIR_QUALITY_THRESHOLD_1,
  AIR_QUALITY_THRESHOLD_2,
  AIR_QUALITY_THRESHOLD_3,
  AIR_QUALITY_THRESHOLD_4
} from '../../data/constants.js'
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
    console.log('Debugging handleNoSearchTerms - Missing Location:', {
      locationType,
      locationNameOrPostcode,
      referer: str
    })

    // Call handleMissingLocation instead of redirecting directly
    return handleMissingLocation(request, h, lang)
  }

  const userLocation = formatPostcode(locationNameOrPostcode?.toUpperCase())

  if (!userLocation && locationType === LOCATION_TYPE_UK) {
    return handleUKError(request, h, lang, locationNameOrPostcode)
  }

  if (!userLocation && locationType === LOCATION_TYPE_NI) {
    return handleNIError(request, h, lang, locationNameOrPostcode)
  }

  console.log('Debugging handleNoSearchTerms:', {
    locationType,
    locationNameOrPostcode,
    referer: str
  })

  return { locationType, userLocation, locationNameOrPostcode }
}

/**
 * Handles the case where search terms are provided.
 */
const DEFAULT_LOCATION_TYPE = 'uk-location'
const NI_LOCATION_TYPE = 'ni-location'

const handleSearchTerms = (searchTerms) => {
  // Debugging logs
  console.log('Validating search terms:', searchTerms)
  console.log('isValidFullPostcodeNI:', isValidFullPostcodeNI(searchTerms))
  console.log(
    'isValidPartialPostcodeNI:',
    isValidPartialPostcodeNI(searchTerms)
  )
  console.log('isValidFullPostcodeUK:', isValidFullPostcodeUK(searchTerms))
  console.log(
    'isValidPartialPostcodeUK:',
    isValidPartialPostcodeUK(searchTerms)
  )

  // Prioritize UK postcodes over NI postcodes
  if (
    isValidFullPostcodeUK(searchTerms) ||
    isValidPartialPostcodeUK(searchTerms)
  ) {
    return {
      locationType: DEFAULT_LOCATION_TYPE,
      userLocation: searchTerms,
      locationNameOrPostcode: searchTerms
    }
  }

  if (
    isValidFullPostcodeNI(searchTerms) ||
    isValidPartialPostcodeNI(searchTerms)
  ) {
    return {
      locationType: NI_LOCATION_TYPE,
      userLocation: searchTerms,
      locationNameOrPostcode: searchTerms
    }
  }

  if (isOnlyWords(searchTerms)) {
    return {
      locationType: DEFAULT_LOCATION_TYPE,
      userLocation: searchTerms,
      locationNameOrPostcode: searchTerms
    }
  }

  // Default to UK location for invalid search terms
  return {
    locationType: DEFAULT_LOCATION_TYPE,
    userLocation: searchTerms,
    locationNameOrPostcode: searchTerms
  }
}

export { handleSearchTerms, handleNoSearchTerms }
