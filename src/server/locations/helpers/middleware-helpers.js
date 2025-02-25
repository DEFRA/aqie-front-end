import { convertFirstLetterIntoUppercase } from '~/src/server/locations/helpers/convert-first-letter-into-upper-case'
import { english } from '~/src/server/data/en/en.js'
import moment from 'moment-timezone'
import {
  removeAllWordsAfterUnderscore,
  convertStringToHyphenatedLowercaseWords,
  extractAndFormatUKPostcode,
  splitAndKeepFirstWord,
  isValidFullPostcodeUK,
  formatUKPostcode,
  splitAndCheckSpecificWords,
  isOnlyLettersAndMoreThanFour
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
  const fullPostcodePattern = /^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i
  const partialPostcodePattern = /^[a-z]{1,2}\d[a-z\d]?$/i
  let newMatches = matches.filter((item) => {
    const name1 = item?.GAZETTEER_ENTRY.NAME1.toUpperCase().replace(/\s+/g, '')
    const name2 = item?.GAZETTEER_ENTRY.NAME2?.toUpperCase().replace(/\s+/g, '')
    let borough = item?.GAZETTEER_ENTRY?.DISTRICT_BOROUGH?.toUpperCase()
    let unitary = item?.GAZETTEER_ENTRY?.COUNTY_UNITARY?.toUpperCase()
    borough = borough?.split(' - ').join(' ') // Replace hyphens with spaces
    borough = borough?.replace(/-/g, ' ') // Replace hyphens with spaces
    unitary = unitary?.split(' - ').join(' ') // Replace hyphens with spaces
    unitary = unitary?.replace(/-/g, ' ') // Replace hyphens with spaces
    let name1Postcode = ''
    if (secondSearchTerm === '') {
      secondSearchTerm = 'UNDEFINED'
    }
    if (searchTerms && borough) {
      if (secondSearchTerm === 'UNDEFINED') {
        return (
          name1?.includes(userLocation.replace(/\s+/g, '')) ||
          userLocation.replace(/\s+/g, '').includes(name1)
        )
      }
      return (
        name1?.includes(userLocation.replace(/\s+/g, '')) &&
        userLocation.replace(/\s+/g, '').includes(name1) &&
        secondSearchTerm.includes(borough) &&
        borough?.includes(secondSearchTerm)
      )
    } else if (searchTerms && unitary) {
      if (name2) {
        if (secondSearchTerm === 'UNDEFINED') {
          return (
            name2?.includes(userLocation.replace(/\s+/g, '')) ||
            userLocation.replace(/\s+/g, '').includes(name2)
          )
        }
        return (
          name2?.includes(userLocation.replace(/\s+/g, '')) &&
          userLocation.replace(/\s+/g, '').includes(name2) &&
          secondSearchTerm.includes(unitary) &&
          unitary?.includes(secondSearchTerm)
        )
      }
      if (secondSearchTerm === 'UNDEFINED') {
        return (
          name1?.includes(userLocation.replace(/\s+/g, '')) ||
          userLocation.replace(/\s+/g, '').includes(name1)
        )
      }
      return (
        name1?.includes(userLocation.replace(/\s+/g, '')) ||
        userLocation.replace(/\s+/g, '').includes(name1) ||
        secondSearchTerm.includes(unitary) ||
        unitary?.includes(secondSearchTerm)
      )
    }
    const isFullPostcode = isValidFullPostcodeUK(name1)
    logger.info(`isFullPostcode in middleware NI ${isFullPostcode}`)
    if (isFullPostcode) {
      logger.info(`name1 in middleware NI ${name1}`)
      name1Postcode = formatUKPostcode(name1)
      logger.info(`name1Postcode in middleware NI ${name1Postcode}`)
      logger.info(`userLocation in middleware NI ${userLocation}`)
      logger.info(`name2 in middleware NI ${name2}`)
      return (
        name1.includes(userLocation.replace(/\s+/g, '')) ||
        name1Postcode.includes(userLocation.replace(/\s+/g, '')) ||
        userLocation.includes(name1Postcode) ||
        userLocation.includes(name2)
      )
    }
    logger.info(`name1 default in middleware NI ${name1}`)
    logger.info(`userLocation default in middleware NI ${userLocation}`)
    logger.info(`name2 default in middleware NI ${name2}`)
    const checkWords = splitAndCheckSpecificWords(userLocation, name1)
    return (
      checkWords ||
      name1.includes(userLocation.replace(/\s+/g, '')) ||
      userLocation.includes(name1) ||
      userLocation.includes(name2)
    )
  })
  const alphanumericPattern = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/
  const isAlphanumeric = alphanumericPattern.test(locationNameOrPostcode)
  if (
    (isAlphanumeric || isNaN(Number(locationNameOrPostcode))) &&
    !fullPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    !partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    searchTerms &&
    secondSearchTerm !== 'UNDEFINED'
  ) {
    newMatches = newMatches.slice(0, 1)
  }
  if (
    (isAlphanumeric || isNaN(Number(locationNameOrPostcode))) &&
    !fullPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    !partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    searchTerms
  ) {
    if (newMatches.length === 1) {
      newMatches = newMatches.slice(0, 1)
    }
    if (newMatches.length > 1) {
      if (secondSearchTerm !== 'UNDEFINED') {
        newMatches = newMatches.slice(0, 1)
      } else {
        newMatches = []
      }
    }
  }
  if (
    (isAlphanumeric || !isNaN(Number(locationNameOrPostcode))) &&
    !fullPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    !partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    newMatches.length > 1
  ) {
    newMatches = []
  }
  const conditionTwo =
    fullPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    newMatches.length === 2
  const conditonThree =
    partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    newMatches.length > 0 &&
    locationNameOrPostcode.length <= 6
  const conditionFour =
    newMatches.length === 1 &&
    !partialPostcodePattern.test(locationNameOrPostcode.toUpperCase())
  const onlyLetters = isOnlyLettersAndMoreThanFour(locationNameOrPostcode)

  if (
    conditionTwo ||
    conditonThree ||
    conditionFour ||
    (newMatches.length >= 2 && onlyLetters && searchTerms)
  ) {
    if (newMatches[0].GAZETTEER_ENTRY.NAME2) {
      newMatches[0].GAZETTEER_ENTRY.NAME1 = newMatches[0].GAZETTEER_ENTRY.NAME2
    } else {
      newMatches[0].GAZETTEER_ENTRY.NAME1 = locationNameOrPostcode.toUpperCase() // Set the name to the partial postcode
    }
    newMatches = [newMatches[0]]
    let urlRoute = ''
    if (newMatches[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
      if (newMatches[0].GAZETTEER_ENTRY.NAME2) {
        urlRoute = `${newMatches[0].GAZETTEER_ENTRY.NAME2}_${newMatches[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      } else {
        urlRoute = `${newMatches[0].GAZETTEER_ENTRY.NAME1}_${newMatches[0].GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      }
    } else {
      urlRoute = newMatches[0].GAZETTEER_ENTRY.NAME2
        ? `${newMatches[0].GAZETTEER_ENTRY.NAME2}_${newMatches[0].GAZETTEER_ENTRY.COUNTY_UNITARY}`
        : `${newMatches[0].GAZETTEER_ENTRY.NAME1}_${newMatches[0].GAZETTEER_ENTRY.COUNTY_UNITARY}`
    }
    const headerTitle = convertStringToHyphenatedLowercaseWords(urlRoute)
    const postcodCheck = removeAllWordsAfterUnderscore(headerTitle)
    const postcode = extractAndFormatUKPostcode(postcodCheck) // Use the helper function to extract and format UK postcode from headerTitle
    const finalHeaderTitle = postcode
      ? splitAndKeepFirstWord(headerTitle)
      : convertStringToHyphenatedLowercaseWords(headerTitle)
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
      ? splitAndKeepFirstWord(postcode)
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
