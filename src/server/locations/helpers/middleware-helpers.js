import {
  convertStringToHyphenatedLowercaseWords,
  firstLetterUppercase
} from '~/src/server/common/helpers/stringUtils'
import { english } from '~/src/server/data/en/en.js'
import { routesTitles } from '~/src/server/locations/helpers/routes-titles-util'

// Helper function to handle location not found
const handleLocationNotFound = (
  h,
  locationNameOrPostcode,
  notFoundLocation,
  home,
  footerTxt,
  phaseBanner,
  backlink,
  cookieBanner,
  lang
) => {
  return h.view('locations/location-not-found', {
    userLocation: locationNameOrPostcode,
    serviceName: notFoundLocation.heading,
    paragraph: notFoundLocation.paragraphs,
    pageTitle: `${notFoundLocation.paragraphs.a} ${locationNameOrPostcode} - ${home.pageTitle}`,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    lang
  })
}

// Helper function to handle single match
const handleSingleMatch = ({
  h,
  request,
  matches,
  forecastNum,
  getForecasts,
  getMeasurements,
  getDailySummary,
  nearestLocationsRange,
  englishDate,
  welshDate,
  month,
  headerTitle,
  titleRoute,
  headerTitleRoute,
  title
}) => {
  const customId = convertStringToHyphenatedLowercaseWords(title) // Use the helper function to generate the custom ID
  request.yar.set('locationData', {
    results: matches,
    rawForecasts: getForecasts?.forecasts,
    forecastNum: matches.length !== 0 ? forecastNum : 0,
    forecastSummary: getDailySummary,
    nearestLocationsRange: matches.length !== 0 ? nearestLocationsRange : [],
    measurements: getMeasurements?.measurements,
    englishDate,
    welshDate,
    getMonth: month,
    title,
    headerTitle,
    titleRoute,
    headerTitleRoute
  })
  return h.redirect(`/location/${customId}`).takeover()
}

// Helper function to handle multiple matches
const handleMultipleMatches = ({
  h,
  request,
  matches,
  locationNameOrPostcode,
  userLocation,
  getForecasts,
  getMeasurements,
  multipleLocations,
  airQuality,
  airQualityData,
  nearestLocationsRange,
  siteTypeDescriptions,
  pollutantTypes,
  getDailySummary,
  footerTxt,
  phaseBanner,
  backlink,
  cookieBanner,
  calendarWelsh,
  month,
  welshDate,
  englishDate,
  lang
}) => {
  const refactoredForRouteTitle = routesTitles(matches, locationNameOrPostcode)

  request.yar.set('locationData', {
    results: refactoredForRouteTitle,
    rawForecasts: getForecasts?.forecasts,
    measurements: getMeasurements?.measurements,
    multipleLocations,
    title: multipleLocations.title,
    paragraphs: multipleLocations.paragraphs,
    userLocation: locationNameOrPostcode,
    airQuality,
    airQualityData: airQualityData.commonMessages,
    monitoringSites: nearestLocationsRange,
    siteTypeDescriptions,
    pollutantTypes,
    pageTitle: `${multipleLocations.title} ${userLocation} -  ${multipleLocations.pageTitle}`,
    serviceName: multipleLocations.serviceName,
    forecastSummary: getDailySummary.today,
    dailySummary: getDailySummary,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    welshMonth: calendarWelsh[month],
    calendarWelsh,
    summaryDate: lang === 'cy' ? welshDate : englishDate,
    welshDate,
    englishDate,
    lang
  })

  return h.redirect('multiple-results').takeover()
}

// Helper function to process matches
const processMatches = (matches, locationNameOrPostcode, userLocation) => {
  const partialPostcodePattern = /^([A-Z]{1,2}\d[A-Z\d]?)$/
  const newMatches = matches.filter((item) => {
    const name = item?.GAZETTEER_ENTRY.NAME1.toUpperCase().replace(/\s+/g, '')
    const name2 = item?.GAZETTEER_ENTRY.NAME2?.toUpperCase().replace(/\s+/g, '')
    return (
      name.includes(userLocation.replace(/\s+/g, '')) ||
      userLocation.includes(name) ||
      userLocation.includes(name2)
    )
  })
  if (
    partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    matches.length > 0 &&
    locationNameOrPostcode.length <= 3
  ) {
    if (matches[0].GAZETTEER_ENTRY.NAME2) {
      matches[0].GAZETTEER_ENTRY.NAME1 = matches[0].GAZETTEER_ENTRY.NAME2
    } else {
      matches[0].GAZETTEER_ENTRY.NAME1 = locationNameOrPostcode
    }
  }

  return newMatches.reduce((acc, item) => {
    let headerTitle = ''
    if (item.GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
      if (item.GAZETTEER_ENTRY.NAME2) {
        headerTitle = `${item.GAZETTEER_ENTRY.NAME2}, ${item.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      } else {
        headerTitle = `${item.GAZETTEER_ENTRY.NAME1}, ${item.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      }
    } else {
      headerTitle = `${locationNameOrPostcode}, ${item.GAZETTEER_ENTRY.COUNTY_UNITARY}`
    }
    headerTitle = convertStringToHyphenatedLowercaseWords(headerTitle)
    item.GAZETTEER_ENTRY.ID = headerTitle // Update the nested object property
    acc.push(item)
    return acc
  }, [])
}

const getTitleAndHeaderTitle = (locationDetails, locationNameOrPostcode) => {
  let title = ''
  let headerTitle = ''
  const { home } = english
  if (locationDetails) {
    if (locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
      if (locationDetails.GAZETTEER_ENTRY.NAME2) {
        title = `${locationDetails.GAZETTEER_ENTRY.NAME2}, ${locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH} - ${home.pageTitle}`
        headerTitle = `${locationDetails.GAZETTEER_ENTRY.NAME2}, ${locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      } else {
        title = `${locationDetails.GAZETTEER_ENTRY.NAME1}, ${locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH} - ${home.pageTitle}`
        headerTitle = `${locationDetails.GAZETTEER_ENTRY.NAME1}, ${locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      }
    } else {
      title = `${locationNameOrPostcode}, ${locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY} - ${home.pageTitle}`
      headerTitle = `${locationNameOrPostcode}, ${locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY}`
    }
  }
  title = firstLetterUppercase(title)
  headerTitle = firstLetterUppercase(headerTitle)
  return { title, headerTitle }
}

const getLanguageDates = (
  formattedDateSummary,
  getMonthSummary,
  calendarEnglish,
  calendarWelsh
) => {
  return {
    englishDate: `${calendarEnglish[getMonthSummary.month]} ${formattedDateSummary}`,
    welshDate: `${calendarWelsh[getMonthSummary.month]} ${formattedDateSummary}`
  }
}

export {
  handleLocationNotFound,
  handleSingleMatch,
  handleMultipleMatches,
  processMatches,
  getTitleAndHeaderTitle,
  getLanguageDates
}
