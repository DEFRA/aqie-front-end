import { convertFirstLetterIntoUppercase } from '~/src/server/locations/helpers/convert-first-letter-into-upper-case'
import { english } from '~/src/server/data/en/en.js'
import moment from 'moment-timezone'
import {
  convertStringToHyphenatedLowercaseWords,
  extractAndFormatUKPostcode,
  splitAndKeepFirstWord,
  isValidFullPostcodeUK,
  formatUKPostcode,
  splitAndCheckSpecificWords,
  hasExactMatch
} from '~/src/server/locations/helpers/convert-string'
import { LANG_EN, LANG_CY } from '~/src/server/data/constants'
import { createURLRouteBookmarks } from '~/src/server/locations/helpers/create-bookmark-ids'
import { searchTermsAndBorough } from '~/src/server/locations/helpers/search-terms-borough'
import { searchTermsAndUnitary } from '~/src/server/locations/helpers/search-terms-unitary'
import reduceMatches from '~/src/server/locations/helpers/reduce-matches'

// Helper function to handle single match
const handleSingleMatch = (
  h,
  request,
  {
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
  }
) => {
  const customId = selectedMatches.length === 1 ? urlRoute : headerTitleRoute // Use the helper function to generate the custom ID
  request.yar.set('locationData', {
    results: selectedMatches,
    getForecasts: getForecasts?.forecasts,
    transformedDailySummary,
    getMeasurements: getMeasurements?.measurements,
    englishDate,
    dailySummary: getDailySummary,
    welshDate,
    getMonth: month,
    title,
    headerTitle,
    titleRoute,
    headerTitleRoute,
    locationType,
    lang
  })
  return lang === LANG_EN
    ? h.redirect(`/location/${customId}`).takeover()
    : h.redirect(`/lleoliad/${customId}`).takeover()
}

// Helper function to handle multiple matches
const handleMultipleMatches = (
  h,
  request,
  {
    selectedMatches,
    locationNameOrPostcode,
    userLocation,
    getForecasts,
    getMeasurements,
    multipleLocations,
    airQuality,
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
  }
) => {
  request.yar.set('locationData', {
    results: selectedMatches,
    getForecasts: getForecasts?.forecasts,
    getMeasurements: getMeasurements?.measurements,
    multipleLocations,
    title: multipleLocations.title,
    paragraphs: multipleLocations.paragraphs,
    userLocation: locationNameOrPostcode,
    airQuality,
    airQualityData: airQualityData.commonMessages,
    siteTypeDescriptions,
    pollutantTypes,
    pageTitle: `${multipleLocations.title} ${userLocation} -  ${multipleLocations.pageTitle}`,
    serviceName: multipleLocations.serviceName,
    dailySummary: getDailySummary,
    transformedDailySummary,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    welshMonth: calendarWelsh[month],
    calendarWelsh,
    summaryDate: lang === LANG_CY ? welshDate : englishDate,
    welshDate,
    englishDate,
    locationType,
    lang
  })

  return lang === LANG_EN
    ? h.redirect('multiple-results').takeover()
    : h.redirect('canlyniadau-lluosog/cy').takeover()
}

// Helper function to process matches
const processMatches = (
  matches,
  userLocation,
  locationNameOrPostcode,
  searchTerms,
  secondSearchTerm = 'UNDEFINED'
) => {
  const normalizeString = (str) => str?.toUpperCase().replace(/\s+/g, '') // Normalize string by converting to uppercase and removing spaces
  const fullPostcodePattern = /^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i // Regex for full UK postcode
  const partialPostcodePattern = /^[a-z]{1,2}\d[a-z\d]?$/i // Regex for partial UK postcode
  const alphanumericPattern = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/ // Regex for alphanumeric strings

  const isFullPostcode = isValidFullPostcodeUK(userLocation) // Check if user location is a full postcode
  let exactWordFirstTerm = null
  let exactWordSecondTerm = null

  // Helper function to filter matches
  const filterMatches = (item) => {
    const name1 = normalizeString(item?.GAZETTEER_ENTRY.NAME1)
    const name2 = normalizeString(item?.GAZETTEER_ENTRY.NAME2)
    const borough = normalizeString(
      item?.GAZETTEER_ENTRY?.DISTRICT_BOROUGH
    )?.replace(/-/g, ' ')
    const unitary = normalizeString(
      item?.GAZETTEER_ENTRY?.COUNTY_UNITARY
    )?.replace(/-/g, ' ')

    if (searchTerms && borough) {
      exactWordFirstTerm = hasExactMatch(searchTerms, name1)
      exactWordSecondTerm = hasExactMatch(secondSearchTerm, borough)
      return searchTermsAndBorough(
        searchTerms,
        name1,
        secondSearchTerm,
        borough,
        exactWordFirstTerm,
        exactWordSecondTerm
      )
    }

    if (searchTerms && unitary) {
      exactWordFirstTerm = hasExactMatch(searchTerms, name1, name2)
      exactWordSecondTerm = hasExactMatch(secondSearchTerm, unitary)
      return searchTermsAndUnitary(
        searchTerms,
        name1,
        name2,
        secondSearchTerm,
        unitary,
        exactWordFirstTerm,
        exactWordSecondTerm
      )
    }

    if (isFullPostcode) {
      return (
        name1.includes(normalizeString(userLocation)) &&
        normalizeString(userLocation).includes(name1)
      )
    }

    const checkWords = splitAndCheckSpecificWords(
      userLocation,
      item?.GAZETTEER_ENTRY.NAME1
    )
    return (
      checkWords ||
      name1.includes(normalizeString(userLocation)) ||
      userLocation.includes(name2)
    )
  }

  // Filter matches based on criteria
  let selectedMatches = matches.filter(filterMatches)

  // Use the external reduceMatches function
  const search = { searchTerms, secondSearchTerm }
  const isAlphanumeric = alphanumericPattern.test(locationNameOrPostcode)
  const isNotPostcode =
    !fullPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    !partialPostcodePattern.test(locationNameOrPostcode.toUpperCase())
  const postcodes = { isFullPostcode, isNotPostcode }
  selectedMatches = reduceMatches(
    selectedMatches,
    locationNameOrPostcode,
    postcodes,
    isAlphanumeric,
    search
  )

  // Add IDs to selected matches
  const { selectedMatchesAddedIDs } = createURLRouteBookmarks(selectedMatches)
  selectedMatches = selectedMatchesAddedIDs

  return { selectedMatches, exactWordFirstTerm, exactWordSecondTerm }
}

const getTitleAndHeaderTitle = (locationDetails, locationNameOrPostcode) => {
  let title = ''
  let headerTitle = ''
  let urlRoute = ''
  let term1 = ''
  let formattedPostcode = ''
  const { home } = english
  if (locationDetails[0]) {
    if (locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
      if (locationDetails[0].GAZETTEER_ENTRY.NAME2) {
        title = `${locationDetails[0].GAZETTEER_ENTRY.NAME2}, ${locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH} - ${home.pageTitle}`
        headerTitle = `${locationDetails[0].GAZETTEER_ENTRY.NAME2}, ${locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        urlRoute = `${locationDetails[0].GAZETTEER_ENTRY.NAME2}_${locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        term1 = locationDetails[0].GAZETTEER_ENTRY.NAME2
      } else {
        term1 = locationDetails[0].GAZETTEER_ENTRY.NAME1
        const isFullPostcode = isValidFullPostcodeUK(term1)
        formattedPostcode = isFullPostcode ? formatUKPostcode(term1) : term1
        title = `${formattedPostcode}, ${locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH} - ${home.pageTitle}`
        headerTitle = `${formattedPostcode}, ${locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        urlRoute = `${locationDetails[0].GAZETTEER_ENTRY.NAME1}_${locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      }
    } else {
      if (locationDetails[0].GAZETTEER_ENTRY.NAME2) {
        title = `${locationNameOrPostcode}, ${locationDetails[0].GAZETTEER_ENTRY.COUNTY_UNITARY} - ${home.pageTitle}`
        headerTitle = `${locationNameOrPostcode}, ${locationDetails[0].GAZETTEER_ENTRY.COUNTY_UNITARY}`
        urlRoute = `${locationDetails[0].GAZETTEER_ENTRY.NAME2}_${locationDetails[0].GAZETTEER_ENTRY.COUNTY_UNITARY}`
        term1 = locationNameOrPostcode
      } else {
        title = `${locationNameOrPostcode}, ${locationDetails[0].GAZETTEER_ENTRY.COUNTY_UNITARY} - ${home.pageTitle}`
        headerTitle = `${locationNameOrPostcode}, ${locationDetails[0].GAZETTEER_ENTRY.COUNTY_UNITARY}`
        urlRoute = `${locationDetails[0].GAZETTEER_ENTRY.NAME1}_${locationDetails[0].GAZETTEER_ENTRY.COUNTY_UNITARY}`
        term1 = locationNameOrPostcode
      }
    }
  }
  title = convertFirstLetterIntoUppercase(title)
  headerTitle = convertFirstLetterIntoUppercase(headerTitle)
  urlRoute = convertStringToHyphenatedLowercaseWords(urlRoute)
  const postcodCheck = term1
  const postcode = extractAndFormatUKPostcode(postcodCheck) // Use the helper function to extract and format UK postcode from urlRoute
  urlRoute = postcode
    ? splitAndKeepFirstWord(urlRoute)
    : convertStringToHyphenatedLowercaseWords(urlRoute)

  return { title, headerTitle, urlRoute }
}

const getLanguageDates = (
  formattedDateSummary,
  getMonthSummary,
  calendarEnglish,
  calendarWelsh
) => {
  return {
    englishDate: `${formattedDateSummary[0]} ${calendarEnglish[getMonthSummary]} ${formattedDateSummary[2]}`,
    welshDate: `${formattedDateSummary[0]} ${calendarWelsh[getMonthSummary]} ${formattedDateSummary[2]}`
  }
}

const getFormattedDateSummary = (issueDate, calendarEnglish) => {
  const formattedDateSummary = moment(issueDate)
    .format('DD MMMM YYYY')
    .split(' ')
  const getMonthSummary = calendarEnglish.findIndex(function (item) {
    return item.indexOf(formattedDateSummary[1]) !== -1
  })
  return { getMonthSummary, formattedDateSummary }
}

export {
  handleSingleMatch,
  handleMultipleMatches,
  processMatches,
  getTitleAndHeaderTitle,
  getLanguageDates,
  getFormattedDateSummary
}
