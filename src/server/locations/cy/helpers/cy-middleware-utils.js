import { fetchData } from '../../helpers/fetch-data.js'
import { calendarWelsh } from '../../../data/cy/cy.js'
import { calendarEnglish } from '../../../data/en/en.js'
import { handleErrorInputAndRedirect } from '../../helpers/error-input-and-redirect.js'
import {
  getLanguageDates,
  getFormattedDateSummary
} from '../../helpers/middleware-helpers.js'
import { LOCATION_TYPE_UK, LOCATION_TYPE_NI } from '../../../data/constants.js'
import { isOnlyWords } from '../../helpers/convert-string.js'
import { transformKeys } from '../../helpers/transform-summary-keys.js'
import {
  validateLocationPostcode,
  handleLocationNotFound
} from './cy-validation-helpers.js'
import {
  processUKLocation,
  processNILocation
} from './cy-location-processors.js'

// '' Helper function to validate input and handle initial errors
export const validateInputAndHandleErrors = async (
  request,
  h,
  lang,
  payload,
  searchOptions,
  welsh
) => {
  const { searchTerms, searchTermsLocationType, initialLocationType } =
    searchOptions

  // '' Handle error input and redirection
  const redirectError = handleErrorInputAndRedirect(
    request,
    h,
    lang,
    payload,
    searchTerms
  )
  if (!redirectError.locationType) {
    return { error: redirectError }
  }

  let { userLocation, locationNameOrPostcode } = redirectError
  let locationType = initialLocationType
  if (searchTerms) {
    userLocation = searchTerms
    locationType = searchTermsLocationType
  }

  // '' Handle invalid postcode
  if (locationType === 'Invalid Postcode') {
    return {
      error: handleLocationNotFound(
        request,
        h,
        locationNameOrPostcode,
        lang,
        true,
        welsh
      )
    }
  }

  // '' Validate location input
  const isLocationValidPostcode = validateLocationPostcode(
    userLocation,
    redirectError.locationType
  )
  const userLocationWordsOnly = isOnlyWords(userLocation)

  if (!isLocationValidPostcode && !userLocationWordsOnly) {
    return {
      error: handleLocationNotFound(
        request,
        h,
        locationNameOrPostcode,
        lang,
        Boolean(searchTerms),
        welsh
      )
    }
  }

  return { userLocation, locationNameOrPostcode, locationType }
}

// '' Helper function to fetch and process data
export const fetchAndProcessData = async (
  request,
  locationType,
  userLocation,
  locationNameOrPostcode,
  lang,
  searchTerms,
  secondSearchTerm
) => {
  // '' Fetch location data
  const { getDailySummary, getForecasts, getOSPlaces } = await fetchData(
    request,
    {
      locationType,
      userLocation,
      locationNameOrPostcode,
      lang,
      searchTerms,
      secondSearchTerm
    }
  )

  if (!getDailySummary) {
    return { error: 'NO_DAILY_SUMMARY' }
  }

  // '' Process date and summary data
  const { getMonthSummary, formattedDateSummary } = getFormattedDateSummary(
    getDailySummary?.issue_date,
    calendarEnglish,
    calendarWelsh,
    lang
  )
  const { transformedDailySummary } = transformKeys(getDailySummary, lang)
  const { englishDate, welshDate } = getLanguageDates(
    formattedDateSummary,
    getMonthSummary,
    calendarEnglish,
    calendarWelsh
  )

  return {
    getDailySummary,
    getForecasts,
    getOSPlaces,
    transformedDailySummary,
    englishDate,
    welshDate
  }
}

// '' Helper function to set session data
export const setSessionData = (
  request,
  locationNameOrPostcode,
  lang,
  searchTerms
) => {
  request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
  request.yar.set('searchTermsSaved', searchTerms)
}

// '' Helper function to process location based on type
export const processLocationByType = (
  request,
  h,
  locationType,
  processParams
) => {
  if (locationType === LOCATION_TYPE_UK) {
    return processUKLocation(request, h, processParams.ukParams)
  } else if (locationType === LOCATION_TYPE_NI) {
    return processNILocation(request, h, processParams.niParams)
  } else {
    // '' Handle other location types
    return handleLocationNotFound(
      request,
      h,
      processParams.locationNameOrPostcode,
      processParams.lang
    )
  }
}
