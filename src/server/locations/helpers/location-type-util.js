import {
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  LANG_CY,
  SEARCH_LOCATION_ROUTE_EN,
  SEARCH_LOCATION_ROUTE_CY,
  SEARCH_LOCATION_PATH_EN,
  REDIRECT_STATUS_CODE,
  POSTCODE_SPACE_INDEX
} from '../../data/constants.js'
import { calendarEnglish } from '../../data/en/en.js'
import moment from 'moment-timezone'

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

const getLocationNameOrPostcode = (locationType, payload) => {
  if (locationType === LOCATION_TYPE_UK) {
    return payload.engScoWal.trim()
  } else if (locationType === LOCATION_TYPE_NI) {
    return payload?.ni?.trim()
  } else {
    return null
  }
}

const handleRedirect = (h, redirectRoute) => {
  return h.redirect(redirectRoute).code(REDIRECT_STATUS_CODE)
}

const getMonth = () => {
  const [, monthName] = moment().format('DD MMMM YYYY').split(' ')
  const getFormattedDate = calendarEnglish.indexOf(monthName)
  return { getFormattedDate }
}
const configureLocationTypeAndRedirects = (
  request,
  h,
  {
    locationType,
    locationNameOrPostcode,
    str,
    query,
    searchLocation,
    airQuality
  }
) => {
  if (locationType === LOCATION_TYPE_UK) {
    locationNameOrPostcode = request.payload.engScoWal.trim()
  } else if (locationType === LOCATION_TYPE_NI) {
    locationNameOrPostcode = request.payload.ni
  } else {
    locationNameOrPostcode = ''
  }

  if (!locationType && str !== SEARCH_LOCATION_PATH_EN) {
    locationType = request.yar.get('locationType')
    locationNameOrPostcode = request.yar.get('locationNameOrPostcode')
  } else {
    setSessionIfChanged(request, 'locationType', locationType)
    setSessionIfChanged(
      request,
      'locationNameOrPostcode',
      locationNameOrPostcode
    )
    setSessionIfChanged(request, 'airQuality', airQuality)
  }

  if (!locationNameOrPostcode && !locationType) {
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
      errorMessage: { text: searchLocation.errorText.radios.list.text }
    })

    if (query?.lang === LANG_CY) {
      return h.redirect(SEARCH_LOCATION_ROUTE_CY).code(REDIRECT_STATUS_CODE)
    }

    if (str === SEARCH_LOCATION_PATH_EN) {
      return h.redirect(SEARCH_LOCATION_ROUTE_EN).code(REDIRECT_STATUS_CODE)
    }
  }

  return null
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
    const spaceIndex = userLocation.length - POSTCODE_SPACE_INDEX
    userLocation = `${userLocation.slice(0, spaceIndex)} ${userLocation.slice(
      spaceIndex
    )}`
    return userLocation
  }

  if (!userLocation && locationType === LOCATION_TYPE_UK) {
    setSessionIfChanged(request, 'errors', {
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
    setSessionIfChanged(request, 'errorMessage', {
      errorMessage: {
        text: searchLocation.errorText.uk.fields.list.text // 'Enter a location or postcode'
      }
    })
    return h.redirect(SEARCH_LOCATION_PATH_EN)
  }
  if (!userLocation && locationType === LOCATION_TYPE_NI) {
    setSessionIfChanged(request, 'errors', {
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
    setSessionIfChanged(request, 'errorMessage', {
      errorMessage: {
        text: searchLocation.errorText.ni.fields.list.text // 'Enter a postcode'
      }
    })
    return h.redirect(SEARCH_LOCATION_PATH_EN)
  }
  return null
}

export {
  getLocationNameOrPostcode,
  handleRedirect,
  getMonth,
  configureLocationTypeAndRedirects,
  filteredAndSelectedLocationType
}
