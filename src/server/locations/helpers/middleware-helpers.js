import { convertFirstLetterIntoUppercase } from '~/src/server/locations/helpers/convert-first-letter-into-upper-case'
import { english } from '~/src/server/data/en/en.js'
import moment from 'moment-timezone'
import {
  convertStringToHyphenatedLowercaseWords,
  extractAndFormatUKPostcode,
  splitAndKeepFirstWord,
  isValidFullPostcodeUK,
  formatUKPostcode
} from '~/src/server/locations/helpers/convert-string'
import { LANG_EN, LANG_CY } from '~/src/server/data/constants'
import { createURLRouteBookmarks } from '~/src/server/locations/helpers/create-bookmark-ids'
import reduceMatches from '~/src/server/locations/helpers/reduce-matches'
import { filterMatches } from '~/src/server/locations/helpers/filter-matches'

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
  const resolvedLocationNameOrPostcode =
    locationNameOrPostcode ?? 'Unknown Location'
  request.yar.set('locationData', {
    results: selectedMatches,
    getForecasts: getForecasts?.forecasts,
    getMeasurements: getMeasurements?.measurements,
    multipleLocations,
    title: multipleLocations.title,
    paragraphs: multipleLocations.paragraphs,
    userLocation: resolvedLocationNameOrPostcode,
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
  const fullPostcodePattern = /^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i // Regex for full UK postcode
  const partialPostcodePattern = /^[a-z]{1,2}\d[a-z\d]?$/i // Regex for partial UK postcode

  const isFullPostcode = isValidFullPostcodeUK(userLocation) // Check if user location is a full postcode
  // Filter matches based on criteria
  let selectedMatches = matches.filter((item) =>
    filterMatches(item, {
      searchTerms,
      secondSearchTerm,
      isFullPostcode,
      userLocation
    })
  )
  const options = {
    searchTerms,
    secondSearchTerm,
    fullPostcodePattern,
    partialPostcodePattern,
    isFullPostcode
  }
  selectedMatches = reduceMatches(
    selectedMatches,
    locationNameOrPostcode,
    options
  )

  // Add IDs to selected matches
  const { selectedMatchesAddedIDs } = createURLRouteBookmarks(selectedMatches)
  selectedMatches = selectedMatchesAddedIDs

  return { selectedMatches }
}

const getTitleAndHeaderTitle = (
  locationDetails,
  locationNameOrPostcode = 'Unknown Location'
) => {
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

// Helper function to deduplicate results
const deduplicateResults = (results) => {
  return Array.from(new Set(results.map((item) => JSON.stringify(item)))).map(
    (item) => JSON.parse(item)
  )
}

export {
  handleSingleMatch,
  handleMultipleMatches,
  processMatches,
  getTitleAndHeaderTitle,
  getLanguageDates,
  getFormattedDateSummary,
  deduplicateResults
}
