import {
  isValidFullPostcodeUK,
  isOnlyWords,
  convertStringToHyphenatedLowercaseWords
} from '~/src/server/locations/helpers/convert-string'
import { LANG_EN } from '~/src/server/data/constants'
import {
  handleSingleMatch,
  handleMultipleMatches,
  processMatches,
  getTitleAndHeaderTitle
} from '~/src/server/locations/helpers/middleware-helpers'
import * as airQualityData from '~/src/server/data/en/air-quality.js'
import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/en/monitoring-sites.js'
import { calendarWelsh } from '~/src/server/data/cy/cy.js'

// Helper function to handle invalid postcodes
const handleInvalidDailySummary = (
  request,
  h,
  locationNameOrPostcode,
  lang = LANG_EN
) => {
  request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
  request.yar.clear('searchTermsSaved')
  return h.redirect('/location-not-found').takeover()
}

// Helper function to validate location input
const validateLocationInput = (userLocation, lang = LANG_EN, request, h) => {
  const isLocationValidPostcode = isValidFullPostcodeUK(userLocation)
  const wordsOnly = isOnlyWords(userLocation)
  if (!isLocationValidPostcode && !wordsOnly) {
    request.yar.set('locationDataNotFound', {
      locationNameOrPostcode: userLocation,
      lang
    })
    request.yar.clear('searchTermsSaved')
    return h.redirect('/location-not-found').takeover()
  }
  return null
}

// Helper function to handle redirection for invalid input
const handleErrorInputAndRedirect = (
  request,
  h,
  lang,
  payload,
  searchTerms
) => {
  const locationNameOrPostcode = payload?.engScoWal || payload?.ni
  if (!payload?.locationType && !searchTerms) {
    request.yar.set('locationDataNotFound', {
      locationNameOrPostcode: '',
      lang
    })
    return h.redirect('/location-not-found').takeover()
  }
  return {
    locationType: payload?.locationType || '',
    userLocation: searchTerms || locationNameOrPostcode,
    locationNameOrPostcode: searchTerms || locationNameOrPostcode
  }
}

// Helper function to handle UK location type
const handleUKLocationType = async (request, h, params) => {
  const {
    locationType,
    userLocation,
    locationNameOrPostcode,
    lang,
    searchTerms,
    secondSearchTerm,
    getOSPlaces,
    getDailySummary,
    getForecasts,
    getMeasurements,
    transformedDailySummary,
    englishDate,
    welshDate,
    month,
    multipleLocations,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner
  } = params

  let { results } = getOSPlaces
  results = Array.from(
    new Set(results.map((item) => JSON.stringify(item)))
  ).map((item) => JSON.parse(item)) // Remove duplicates

  const { selectedMatches } = processMatches(
    results,
    userLocation,
    locationNameOrPostcode,
    searchTerms,
    secondSearchTerm
  )
  const { title, headerTitle, urlRoute } = getTitleAndHeaderTitle(
    selectedMatches,
    locationNameOrPostcode
  )
  const headerTitleRoute = convertStringToHyphenatedLowercaseWords(
    String(urlRoute)
  )
  const titleRoute = convertStringToHyphenatedLowercaseWords(String(title))
  if (selectedMatches.length === 1) {
    return handleSingleMatch(h, request, {
      selectedMatches,
      getForecasts,
      getMeasurements,
      getDailySummary,
      transformedDailySummary,
      englishDate,
      welshDate,
      month,
      headerTitle,
      titleRoute,
      headerTitleRoute,
      title,
      urlRoute,
      locationType,
      lang
    })
  } else if (selectedMatches.length > 1) {
    return handleMultipleMatches(h, request, {
      selectedMatches,
      locationNameOrPostcode,
      userLocation,
      getForecasts,
      getMeasurements,
      multipleLocations,
      airQualityData,
      siteTypeDescriptions,
      pollutantTypes,
      getDailySummary,
      transformedDailySummary,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      calendarWelsh,
      month,
      welshDate,
      englishDate,
      locationType,
      lang
    })
  } else {
    request.yar.clear('searchTermsSaved')
    return h.redirect('/location-not-found').takeover()
  }
}

export {
  handleInvalidDailySummary,
  validateLocationInput,
  handleErrorInputAndRedirect,
  handleUKLocationType
}
