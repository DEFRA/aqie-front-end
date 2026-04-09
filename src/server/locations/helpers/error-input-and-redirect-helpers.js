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

const setSessionIfChanged = (request, key, value) => {
  const currentValue = request?.yar?.get?.(key)
  if (Object.is(currentValue, value)) {
    return
  }

  if (
    currentValue &&
    value &&
    typeof currentValue === 'object' &&
    typeof value === 'object'
  ) {
    try {
      if (JSON.stringify(currentValue) === JSON.stringify(value)) {
        return
      }
    } catch {
      // Ignore serialization errors and continue to set
    }
  }

  request.yar.set(key, value)
}

/**
 * Handles missing location type and name/postcode.
 */
const handleMissingLocation = (request, h, lang) => {
  const { searchLocation } = lang === LANG_EN ? english : welsh

  setSessionIfChanged(request, 'errors', {
    errors: {
      titleText: searchLocation.errorText.radios.title,
      errorList: [
        {
          text: searchLocation.errorText.radios.list.text,
          href: '#locationType'
        }
      ]
    }
  })

  setSessionIfChanged(request, 'errorMessage', {
    errorMessage: {
      text: searchLocation.errorText.radios.list.text
    }
  })

  setSessionIfChanged(request, 'locationType', '')
  setSessionIfChanged(request, 'locationNameOrPostcode', '')

  const redirectPath =
    lang === LANG_CY
      ? 'chwilio-lleoliad/cy?lang=cy'
      : '/search-location?lang=en'
  return h.redirect(redirectPath).code(REDIRECT_STATUS_CODE).takeover()
}

/**
 * Handles UK-specific errors.
 */
const handleUKError = (request, h, lang, locationNameOrPostcode) => {
  const { searchLocation } = lang === LANG_EN ? english : welsh

  setSessionIfChanged(request, 'errors', {
    errors: {
      titleText: searchLocation.errorText.uk.fields.title,
      errorList: [
        {
          text: searchLocation.errorText.uk.fields.list.text,
          href: '#engScoWal'
        }
      ]
    }
  })

  setSessionIfChanged(request, 'errorMessage', {
    errorMessage: {
      text: searchLocation.errorText.uk.fields.list.text
    }
  })

  setSessionIfChanged(request, 'locationNameOrPostcode', locationNameOrPostcode)

  const redirectPath = lang === LANG_EN ? REDIRECT_PATH_EN : REDIRECT_PATH_CY
  return h.redirect(redirectPath).code(REDIRECT_STATUS_CODE).takeover()
}

/**
 * Handles NI-specific errors.
 */
const handleNIError = (request, h, lang, locationNameOrPostcode) => {
  const { searchLocation } = lang === LANG_EN ? english : welsh

  setSessionIfChanged(request, 'errors', {
    errors: {
      titleText: searchLocation.errorText.ni.fields.title,
      errorList: [
        {
          text: searchLocation.errorText.ni.fields.list.text,
          href: '#ni'
        }
      ]
    }
  })

  setSessionIfChanged(request, 'errorMessage', {
    errorMessage: {
      text: searchLocation.errorText.ni.fields.list.text
    }
  })

  setSessionIfChanged(request, 'locationNameOrPostcode', locationNameOrPostcode)

  const redirectPath = lang === LANG_EN ? REDIRECT_PATH_EN : REDIRECT_PATH_CY
  return h.redirect(redirectPath).code(REDIRECT_STATUS_CODE).takeover()
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
