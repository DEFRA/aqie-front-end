import { convertFirstLetterIntoUppercase } from '~/src/server/locations/helpers/convert-first-letter-into-upper-case'
import { english } from '~/src/server/data/en/en.js'
import moment from 'moment-timezone'
import {
  removeAllWordsAfterUnderscore,
  convertStringToHyphenatedLowercaseWords,
  extractAndFormatUKPostcode,
  splitAndKeepFirstWord,
  removeLastWordAndHyphens,
  removeLastWordAndAddHyphens
} from '~/src/server/locations/helpers/convert-string'
import { LANG_EN, LANG_CY } from '~/src/server/data/constants'
import { createLogger } from '~/src/server/common/helpers/logging/logger'

const logger = createLogger()

// Helper function to handle single match
const handleSingleMatch = (
  h,
  request,
  {
    searchTerms,
    selectedMatches,
    forecastNum,
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
    nearestLocationsRangeEnglish,
    nearestLocationsRangeWelsh,
    lang
  }
) => {
  const customId = selectedMatches.length === 1 ? urlRoute : headerTitleRoute // Use the helper function to generate the custom ID
  request.yar.set('locationData', {
    results: selectedMatches,
    rawForecasts: getForecasts?.forecasts,
    forecastNum: selectedMatches.length !== 0 ? forecastNum : 0,
    transformedDailySummary,
    measurements: getMeasurements?.measurements,
    englishDate,
    dailySummary: getDailySummary,
    welshDate,
    getMonth: month,
    title,
    headerTitle,
    titleRoute,
    headerTitleRoute,
    locationType,
    nearestLocationsRangeEnglish,
    nearestLocationsRangeWelsh,
    lang
  })
  logger.info(
    `::::::::::: handleSingleMatch searchTerms  ::::::::::: ${searchTerms}`
  )
  return lang === LANG_EN
    ? h.redirect(`/location/${customId}`).takeover()
    : h.redirect(`/lleoliad/${customId}`).takeover()
}

// Helper function to handle multiple matches
const handleMultipleMatches = (
  h,
  request,
  {
    forecastNum,
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
    nearestLocationsRangeEnglish,
    nearestLocationsRangeWelsh,
    lang
  }
) => {
  request.yar.set('locationData', {
    results: selectedMatches,
    rawForecasts: getForecasts?.forecasts,
    measurements: getMeasurements?.measurements,
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
    forecastNum,
    nearestLocationsRangeEnglish,
    nearestLocationsRangeWelsh,
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
  const partialPostcodePattern =
    /\b(?!BT)(?:EN[1-9]|[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/i
  let newMatches = matches.filter((item) => {
    const name1 = item?.GAZETTEER_ENTRY.NAME1.toUpperCase().replace(/\s+/g, '')
    const name2 = item?.GAZETTEER_ENTRY.NAME2?.toUpperCase().replace(/\s+/g, '')
    let borough = item?.GAZETTEER_ENTRY?.DISTRICT_BOROUGH?.toUpperCase()
    let unitary = item?.GAZETTEER_ENTRY?.COUNTY_UNITARY?.toUpperCase()
    borough = borough?.split(' - ').join(' ') // Replace hyphens with spaces
    borough = borough?.replace(/-/g, ' ') // Replace hyphens with spaces
    unitary = unitary?.split(' - ').join(' ') // Replace hyphens with spaces
    unitary = unitary?.replace(/-/g, ' ') // Replace hyphens with spaces
    if (searchTerms && borough) {
      return (
        name1?.includes(userLocation) &&
        userLocation.includes(name1) &&
        secondSearchTerm.includes(borough) &&
        borough?.includes(secondSearchTerm)
      )
    } else if (searchTerms && unitary) {
      if (name2) {
        return (
          name2?.includes(userLocation) &&
          userLocation.includes(name2) &&
          secondSearchTerm.includes(unitary) &&
          unitary?.includes(secondSearchTerm)
        )
      }
      return (
        name1?.includes(userLocation) &&
        userLocation.includes(name1) &&
        secondSearchTerm.includes(unitary) &&
        unitary?.includes(secondSearchTerm)
      )
    }
    return (
      name1.includes(userLocation.replace(/\s+/g, '')) ||
      userLocation.includes(name1) ||
      userLocation.includes(name2)
    )
  })
  if (
    partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    newMatches.length > 0 &&
    locationNameOrPostcode.length <= 3
  ) {
    if (newMatches[0].GAZETTEER_ENTRY.NAME2) {
      newMatches[0].GAZETTEER_ENTRY.NAME1 = newMatches[0].GAZETTEER_ENTRY.NAME2
    } else {
      newMatches[0].GAZETTEER_ENTRY.NAME1 = locationNameOrPostcode.toUpperCase() // Set the name to the partial postcode
    }
    newMatches = [newMatches[0]]
    const urlRoute = `${newMatches[0].GAZETTEER_ENTRY.NAME1}_${newMatches[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
    let headerTitle = convertStringToHyphenatedLowercaseWords(urlRoute)
    headerTitle = headerTitle.replace(/-/g, ' ')
    const postcodCheck = removeAllWordsAfterUnderscore(headerTitle)
    const postcode = extractAndFormatUKPostcode(postcodCheck) // Use the helper function to extract and format UK postcode from headerTitle
    const finalHeaderTitle = postcode
      ? removeLastWordAndHyphens(headerTitle)
      : removeLastWordAndAddHyphens(headerTitle)
    newMatches[0].GAZETTEER_ENTRY.ID = finalHeaderTitle
    return newMatches
  }

  return newMatches.reduce((acc, item) => {
    let urlRoute = ''
    if (item.GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
      if (item.GAZETTEER_ENTRY.NAME2) {
        urlRoute = `${item.GAZETTEER_ENTRY.NAME2}_${item.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      } else {
        urlRoute = `${item.GAZETTEER_ENTRY.NAME1}_${item.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      }
    } else {
      urlRoute = item.GAZETTEER_ENTRY.NAME2
        ? `${item.GAZETTEER_ENTRY.NAME2}_${item.GAZETTEER_ENTRY.COUNTY_UNITARY}`
        : `${item.GAZETTEER_ENTRY.NAME1}_${item.GAZETTEER_ENTRY.COUNTY_UNITARY}`
    }
    urlRoute = convertStringToHyphenatedLowercaseWords(urlRoute) // Use the helper function to generate the custom ID
    urlRoute = urlRoute.replace(/-/g, ' ')
    const postcodCheck = removeAllWordsAfterUnderscore(urlRoute)
    const postcode = extractAndFormatUKPostcode(postcodCheck) // Use the helper function to extract and format UK postcode from headerTitle
    const finalUrlRoute = postcode
      ? postcode.replace(/\s+/g, '')
      : convertStringToHyphenatedLowercaseWords(urlRoute)
    item.GAZETTEER_ENTRY.ID = finalUrlRoute // Update the nested object property
    acc.push(item)
    return acc
  }, [])
}

const getTitleAndHeaderTitle = (locationDetails, locationNameOrPostcode) => {
  let title = ''
  let headerTitle = ''
  let urlRoute = ''
  let term1 = ''
  const { home } = english
  if (locationDetails[0]) {
    if (locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
      if (locationDetails[0].GAZETTEER_ENTRY.NAME2) {
        title = `${locationDetails[0].GAZETTEER_ENTRY.NAME2}, ${locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH} - ${home.pageTitle}`
        headerTitle = `${locationDetails[0].GAZETTEER_ENTRY.NAME2}, ${locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        urlRoute = `${locationDetails[0].GAZETTEER_ENTRY.NAME2}_${locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        term1 = locationDetails[0].GAZETTEER_ENTRY.NAME2
      } else {
        title = `${locationDetails[0].GAZETTEER_ENTRY.NAME1}, ${locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH} - ${home.pageTitle}`
        headerTitle = `${locationDetails[0].GAZETTEER_ENTRY.NAME1}, ${locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        urlRoute = `${locationDetails[0].GAZETTEER_ENTRY.NAME1}_${locationDetails[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        term1 = locationDetails[0].GAZETTEER_ENTRY.NAME1
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
