import {
  LANG_EN,
  LANG_CY,
  REDIRECT_PATH_CY,
  REDIRECT_PATH_EN,
  POSTCODE_SPACE_INDEX
} from '../../data/constants.js'
import { english } from '../../data/en/en.js'
import { welsh } from '../../data/cy/cy.js'

/**
 * Handles missing location type and name/postcode.
 */
const handleMissingLocation = (request, h, lang) => {
  const { searchLocation } = lang === LANG_EN ? english : welsh

  request.yar.set('errors', {
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

  request.yar.set('errorMessage', {
    errorMessage: {
      text: searchLocation.errorText.radios.list.text
    }
  })

  request.yar.set('locationType', '')
  request.yar.set('locationNameOrPostcode', '')

  const redirectPath =
    lang === LANG_CY
      ? 'chwilio-lleoliad/cy?lang=cy'
      : '/search-location?lang=en'
  return h.redirect(redirectPath).takeover()
}

/**
 * Handles UK-specific errors.
 */
const handleUKError = (request, h, lang, locationNameOrPostcode) => {
  const { searchLocation } = lang === LANG_EN ? english : welsh

  request.yar.set('errors', {
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

  request.yar.set('errorMessage', {
    errorMessage: {
      text: searchLocation.errorText.uk.fields.list.text
    }
  })

  request.yar.set('locationNameOrPostcode', locationNameOrPostcode)

  const redirectPath = lang === LANG_EN ? REDIRECT_PATH_EN : REDIRECT_PATH_CY
  return h.redirect(redirectPath).takeover()
}

/**
 * Handles NI-specific errors.
 */
const handleNIError = (request, h, lang, locationNameOrPostcode) => {
  const { searchLocation } = lang === LANG_EN ? english : welsh

  request.yar.set('errors', {
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

  request.yar.set('errorMessage', {
    errorMessage: {
      text: searchLocation.errorText.ni.fields.list.text
    }
  })

  request.yar.set('locationNameOrPostcode', locationNameOrPostcode)

  const redirectPath = lang === LANG_EN ? REDIRECT_PATH_EN : REDIRECT_PATH_CY
  return h.redirect(redirectPath).takeover()
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
