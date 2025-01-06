import {
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  LANG_CY,
  REDIRECT_PATH_EN,
  REDIRECT_PATH_CY,
  SEARCH_LOCATION_PATH_EN
} from '~/src/server/data/constants'
import { calendarEnglish } from '~/src/server/data/en/en.js'
import moment from 'moment-timezone'

const getLocationNameOrPostcode = (locationType, payload) => {
  if (locationType === LOCATION_TYPE_UK) {
    return payload.engScoWal.trim()
  } else if (locationType === LOCATION_TYPE_NI) {
    return payload.ni
  }
  return ''
}

const handleRedirect = (h, lang) => {
  if (lang === LANG_CY) {
    return h.redirect(REDIRECT_PATH_CY)
  }
  return null
}

const getMonth = () => {
  const formattedDate = moment().format('DD MMMM YYYY').split(' ')
  const getFormattedDate = calendarEnglish.findIndex(
    (item) => item.indexOf(formattedDate[1]) !== -1
  )
  return { getFormattedDate }
}

const configureLocationTypeAndRedirects = (
  request,
  h,
  locationType,
  locationNameOrPostcode,
  str,
  query,
  searchLocation,
  airQuality
) => {
  if (locationType === LOCATION_TYPE_UK) {
    locationNameOrPostcode = request.payload.engScoWal.trim()
  } else if (locationType === LOCATION_TYPE_NI) {
    locationNameOrPostcode = request.payload.ni
  }
  if (!locationType && str !== SEARCH_LOCATION_PATH_EN) {
    locationType = request.yar.get('locationType')
    locationNameOrPostcode = request.yar.get('locationNameOrPostcode')
  } else {
    request.yar.set('locationType', locationType)
    request.yar.set('locationNameOrPostcode', locationNameOrPostcode)
    request.yar.set('airQuality', airQuality)
  }
  if (!locationNameOrPostcode && !locationType) {
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
      errorMessage: { text: searchLocation.errorText.radios.list.text }
    })

    // request.yar.set('locationType', '')
    // request.yar.get('', '')

    if (query?.lang === LANG_CY) {
      return h.redirect(REDIRECT_PATH_CY)
    }
    if (str === SEARCH_LOCATION_PATH_EN) {
      return h.redirect(REDIRECT_PATH_EN)
    }
  }
}

const filteredAndSelectedLocationType = (
  locationType,
  userLocation,
  request,
  searchLocation,
  h
) => {
  // Regex patterns to check for full and partial postcodes
  const fullPostcodePattern = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})$/

  // Insert a space for full postcodes without a space
  if (fullPostcodePattern.test(userLocation) && !userLocation.includes(' ')) {
    const spaceIndex = userLocation.length - 3
    userLocation = `${userLocation.slice(0, spaceIndex)} ${userLocation.slice(
      spaceIndex
    )}`
  }

  if (!userLocation && locationType === LOCATION_TYPE_UK) {
    request.yar.set('errors', {
      errors: {
        titleText: searchLocation.errorText.uk.fields.title, // 'There is a problem',
        errorList: [
          {
            text: searchLocation.errorText.uk.fields.list.text, // 'Enter a location or postcode',
            href: '#engScoWal'
          }
        ]
      }
    })
    request.yar.set('errorMessage', {
      errorMessage: {
        text: searchLocation.errorText.uk.fields.list.text // 'Enter a location or postcode'
      }
    })
    request.yar.set('locationType', LOCATION_TYPE_UK)
    return h.redirect(SEARCH_LOCATION_PATH_EN)
  }
  if (!userLocation && locationType === LOCATION_TYPE_NI) {
    request.yar.set('errors', {
      errors: {
        titleText: searchLocation.errorText.ni.fields.title, // 'There is a problem',
        errorList: [
          {
            text: searchLocation.errorText.ni.fields.list.text, // 'Enter a postcode',
            href: '#ni'
          }
        ]
      }
    })
    request.yar.set('errorMessage', {
      errorMessage: {
        text: searchLocation.errorText.ni.fields.list.text // 'Enter a postcode'
      }
    })
    request.yar.set('locationType', LOCATION_TYPE_NI)
    return h.redirect(SEARCH_LOCATION_PATH_EN)
  }
  locationType = request.yar.get('locationType')
}

export {
  getLocationNameOrPostcode,
  handleRedirect,
  getMonth,
  configureLocationTypeAndRedirects,
  filteredAndSelectedLocationType
}
