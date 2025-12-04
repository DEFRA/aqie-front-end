import {
  LANG_EN,
  LANG_CY,
  REDIRECT_PATH_CY,
  REDIRECT_PATH_EN,
  POSTCODE_SPACE_INDEX,
  REDIRECT_STATUS_CODE
} from '../../data/constants.js'
import { english } from '../../data/en/en.js'
import { welsh } from '../../data/cy/cy.js'

/**
 * ''
 * Generic error handler to reduce code duplication.
 * Sets error messages and redirects based on error configuration.
 */
const handleError = (request, h, lang, errorConfig) => {
  const { searchLocation } = lang === LANG_EN ? english : welsh
  const { errorTextPath, href, locationValue, redirectPath } = errorConfig

  // '' Navigate to the error text using the provided path
  const errorText = errorTextPath.reduce(
    (obj, key) => obj[key],
    searchLocation.errorText
  )

  request.yar.set('errors', {
    errors: {
      titleText: errorText.title,
      errorList: [
        {
          text: errorText.list.text,
          href
        }
      ]
    }
  })

  request.yar.set('errorMessage', {
    errorMessage: {
      text: errorText.list.text
    }
  })

  if (locationValue !== undefined) {
    request.yar.set('locationNameOrPostcode', locationValue)
  }

  return h.redirect(redirectPath).code(REDIRECT_STATUS_CODE).takeover()
}

/**
 * Handles missing location type and name/postcode.
 */
const handleMissingLocation = (request, h, lang) => {
  request.yar.set('locationType', '')
  request.yar.set('locationNameOrPostcode', '')

  return handleError(request, h, lang, {
    errorTextPath: ['radios'],
    href: '#locationType',
    redirectPath:
      lang === LANG_CY
        ? 'chwilio-lleoliad/cy?lang=cy'
        : '/search-location?lang=en'
  })
}

/**
 * Handles UK-specific errors.
 */
const handleUKError = (request, h, lang, locationNameOrPostcode) => {
  const redirectPath = lang === LANG_EN ? REDIRECT_PATH_EN : REDIRECT_PATH_CY

  return handleError(request, h, lang, {
    errorTextPath: ['uk', 'fields'],
    href: '#engScoWal',
    locationValue: locationNameOrPostcode,
    redirectPath
  })
}

/**
 * Handles NI-specific errors.
 */
const handleNIError = (request, h, lang, locationNameOrPostcode) => {
  const redirectPath = lang === LANG_EN ? REDIRECT_PATH_EN : REDIRECT_PATH_CY

  return handleError(request, h, lang, {
    errorTextPath: ['ni', 'fields'],
    href: '#ni',
    locationValue: locationNameOrPostcode,
    redirectPath
  })
}

/**
 * Formats postcodes by inserting a space if necessary.
 */

const formatPostcode = (userLocation) => {
  const fullPostcodePattern = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})$/i // Case-insensitive regex
  if (fullPostcodePattern.test(userLocation) && !userLocation.includes(' ')) {
    const spaceIndex = userLocation.length - POSTCODE_SPACE_INDEX
    return `${userLocation.slice(0, spaceIndex)} ${userLocation.slice(spaceIndex)}`
  }
  return userLocation
}

export { handleMissingLocation, handleUKError, handleNIError, formatPostcode }
