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
  isOnlyLettersAndMoreThanFour,
  hasExactMatch
} from '~/src/server/locations/helpers/convert-string'
import { LANG_EN, LANG_CY } from '~/src/server/data/constants'
import { createURLRouteBookmarks } from '~/src/server/locations/helpers/create-bookmark-ids'
import { searchTermsAndBorough } from '~/src/server/locations/helpers/search-terms-borough'
import { searchTermsAndUnitary } from '~/src/server/locations/helpers/search-terms-unitary'

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
  secondSearchTerm
) => {
  const normalizeString = (str) => str?.toUpperCase().replace(/\s+/g, '')
  const fullPostcodePattern = /^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i
  const partialPostcodePattern = /^[a-z]{1,2}\d[a-z\d]?$/i
  const isFullPostcode = isValidFullPostcodeUK(userLocation)
  let exactWordFirstTerm = null
  let exactWordSecondTerm = null
  let selectedMatches = matches.filter((item) => {
    const name1 = normalizeString(item?.GAZETTEER_ENTRY.NAME1)
    const name2 = normalizeString(item?.GAZETTEER_ENTRY.NAME2)
    let borough = normalizeString(item?.GAZETTEER_ENTRY?.DISTRICT_BOROUGH)
    let unitary = normalizeString(item?.GAZETTEER_ENTRY?.COUNTY_UNITARY)
    borough = borough?.split(' - ').join(' ') // Replace hyphens with spaces
    borough = borough?.replace(/-/g, ' ') // Replace hyphens with spaces
    unitary = unitary?.split(' - ').join(' ') // Replace hyphens with spaces
    unitary = unitary?.replace(/-/g, ' ') // Replace hyphens with spaces

    if (secondSearchTerm === '') {
      secondSearchTerm = 'UNDEFINED'
    }
    if (searchTerms && borough) {
      exactWordFirstTerm = hasExactMatch(userLocation, name1)
      exactWordSecondTerm = hasExactMatch(secondSearchTerm, borough)
      return searchTermsAndBorough(
        userLocation,
        name1,
        secondSearchTerm,
        borough,
        exactWordFirstTerm,
        exactWordSecondTerm
      )
    } else if (searchTerms && unitary) {
      const exactWordFirstTerm = hasExactMatch(userLocation, name1)
      const exactWordSecondTerm = hasExactMatch(secondSearchTerm, unitary)
      return searchTermsAndUnitary(
        userLocation,
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
        normalizeString(userLocation).includes(normalizeString(name1))
      )
    }
    const checkWords = splitAndCheckSpecificWords(userLocation, name1)
    return (
      checkWords ||
      name1.includes(normalizeString(userLocation)) ||
      userLocation.includes(name2)
    )
  })
  if (isFullPostcode && selectedMatches.length > 1) {
    selectedMatches = selectedMatches.slice(0, 1)
  }
  const alphanumericPattern = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/
  const isAlphanumeric = alphanumericPattern.test(locationNameOrPostcode)
  if (
    (isAlphanumeric || isNaN(Number(locationNameOrPostcode))) &&
    !fullPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    !partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    searchTerms &&
    secondSearchTerm !== 'UNDEFINED' &&
    selectedMatches.length > 1
  ) {
    selectedMatches = selectedMatches.slice(0, 1)
  }
  if (
    (isAlphanumeric || isNaN(Number(locationNameOrPostcode))) &&
    !fullPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    !partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    searchTerms
  ) {
    if (selectedMatches.length === 1) {
      selectedMatches = selectedMatches.slice(0, 1)
    }
    if (selectedMatches.length > 1) {
      if (secondSearchTerm !== 'UNDEFINED') {
        selectedMatches = selectedMatches.slice(0, 1)
      } else {
        selectedMatches = []
      }
    }
  }
  if (
    (isAlphanumeric || !isNaN(Number(locationNameOrPostcode))) &&
    !fullPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    !partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    selectedMatches.length > 1
  ) {
    selectedMatches = []
  }
  const conditionTwo =
    fullPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    selectedMatches.length === 2
  const conditonThree =
    partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    selectedMatches.length > 0 &&
    locationNameOrPostcode.length <= 6
  const conditionFour =
    selectedMatches.length === 1 &&
    !partialPostcodePattern.test(locationNameOrPostcode.toUpperCase())
  const onlyLetters = isOnlyLettersAndMoreThanFour(locationNameOrPostcode)

  if (
    conditionTwo ||
    conditonThree ||
    conditionFour ||
    (selectedMatches.length >= 2 && onlyLetters && searchTerms)
  ) {
    selectedMatches = [selectedMatches[0]]
  }
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
      title = `${locationNameOrPostcode}, ${locationDetails[0].GAZETTEER_ENTRY.COUNTY_UNITARY} - ${home.pageTitle}`
      headerTitle = `${locationNameOrPostcode}, ${locationDetails[0].GAZETTEER_ENTRY.COUNTY_UNITARY}`
      urlRoute = `${locationDetails[0].GAZETTEER_ENTRY.NAME1}_${locationDetails[0].GAZETTEER_ENTRY.COUNTY_UNITARY}`
      term1 = locationNameOrPostcode
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
