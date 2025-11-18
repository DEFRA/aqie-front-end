import { convertFirstLetterIntoUppercase } from './convert-first-letter-into-upper-case.js'
import { english } from '../../data/en/en.js'
import moment from 'moment-timezone'
import {
  convertStringToHyphenatedLowercaseWords,
  extractAndFormatUKPostcode,
  splitAndKeepFirstWord,
  isValidFullPostcodeUK,
  formatUKPostcode
} from './convert-string.js'
import { LANG_EN, LANG_CY, REDIRECT_STATUS_CODE } from '../../data/constants.js'
import { createURLRouteBookmarks } from './create-bookmark-ids.js'
import reduceMatches from './reduce-matches.js'
import { filterMatches } from './filter-matches.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { config } from '../../../config/index.js'

const logger = createLogger()

// Helper function to handle single match
const handleSingleMatch = (
  h,
  request,
  {
    selectedMatches,
    getForecasts,
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
  const showSummaryDate = isSummaryDateToday(getDailySummary?.issue_date)
  const issueTime = getIssueTime(getDailySummary?.issue_date)

  request.yar.set('locationData', {
    results: selectedMatches,
    getForecasts: getForecasts?.forecasts,
    transformedDailySummary,
    englishDate,
    dailySummary: getDailySummary,
    welshDate,
    getMonth: month,
    title,
    headerTitle,
    titleRoute,
    headerTitleRoute,
    locationType,
    lang,
    showSummaryDate,
    issueTime
  })
  logger.info(`Redirecting to location with custom ID: ${customId}`)

  // '' Disable mock parameters when configured (production by default)
  const mocksDisabled = config.get('disableTestMocks')

  // Preserve mock parameters in redirect if present (only when mocks enabled)
  const mockLevel = !mocksDisabled ? request.query?.mockLevel : undefined
  const mockLevelParam =
    mockLevel !== undefined ? `?mockLevel=${encodeURIComponent(mockLevel)}` : ''

  const mockDay = !mocksDisabled ? request.query?.mockDay : undefined
  const mockDayParam =
    mockDay !== undefined ? `&mockDay=${encodeURIComponent(mockDay)}` : ''

  const mockPollutantBand = !mocksDisabled
    ? request.query?.mockPollutantBand
    : undefined
  const mockPollutantParam =
    mockPollutantBand !== undefined
      ? `&mockPollutantBand=${encodeURIComponent(mockPollutantBand)}`
      : ''

  const testMode = !mocksDisabled ? request.query?.testMode : undefined
  const testModeParam =
    testMode !== undefined ? `&testMode=${encodeURIComponent(testMode)}` : ''

  const queryParams = `${mockLevelParam}${mockDayParam}${mockPollutantParam}${testModeParam}`

  return lang === LANG_EN
    ? h
        .redirect(`/location/${customId}${queryParams}`)
        .code(REDIRECT_STATUS_CODE)
        .takeover()
    : h
        .redirect(`/lleoliad/${customId}${queryParams}`)
        .code(REDIRECT_STATUS_CODE)
        .takeover()
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
  const showSummaryDate = isSummaryDateToday(getDailySummary?.issue_date)
  const issueTime = getIssueTime(getDailySummary?.issue_date)

  request.yar.set('locationData', {
    results: selectedMatches,
    getForecasts: getForecasts?.forecasts,
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
    lang,
    showSummaryDate,
    issueTime
  })

  return lang === LANG_EN
    ? h.redirect('multiple-results').code(REDIRECT_STATUS_CODE).takeover()
    : h.redirect('canlyniadau-lluosog/cy').code(REDIRECT_STATUS_CODE).takeover()
}

// Helper function to process matches
const processMatches = (
  matches,
  userLocation,
  locationNameOrPostcode,
  searchTerms,
  secondSearchTerm = undefined
) => {
  const fullPostcodePattern = /^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i // Regex for full UK postcode
  const partialPostcodePattern =
    /^(?:[A-Z]{1,2}\d{1,2}|[A-Z]\d[A-Z]|\d[A-Z]{2})$/i // Regex for partial UK postcode
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
  const { home } = english
  let title = ''
  let headerTitle = ''
  let urlRoute = ''
  let term1 = ''

  if (locationDetails?.[0]) {
    const gazetteerEntry = locationDetails[0].GAZETTEER_ENTRY

    if (gazetteerEntry?.DISTRICT_BOROUGH) {
      ;({ title, headerTitle, urlRoute, term1 } = handleDistrictBorough(
        gazetteerEntry,
        home
      ))
    } else if (gazetteerEntry?.COUNTY_UNITARY) {
      ;({ title, headerTitle, urlRoute, term1 } = handleCountyUnitary(
        gazetteerEntry,
        locationNameOrPostcode,
        home
      ))
    } else {
      // '' Handle case where neither DISTRICT_BOROUGH nor COUNTY_UNITARY is present
      title = locationNameOrPostcode
      headerTitle = locationNameOrPostcode
      urlRoute = convertStringToHyphenatedLowercaseWords(locationNameOrPostcode)
      term1 = locationNameOrPostcode
    }
  }

  title = convertFirstLetterIntoUppercase(title)
  headerTitle = convertFirstLetterIntoUppercase(headerTitle)
  urlRoute = convertStringToHyphenatedLowercaseWords(urlRoute)

  const postcodeCheck = term1
  const postcode = extractAndFormatUKPostcode(postcodeCheck)
  urlRoute = postcode
    ? splitAndKeepFirstWord(urlRoute)
    : convertStringToHyphenatedLowercaseWords(urlRoute)

  return { title, headerTitle, urlRoute }
}

/**
 * Handles the case where DISTRICT_BOROUGH is present in the gazetteer entry.
 */
const handleDistrictBorough = (gazetteerEntry, home) => {
  let title = ''
  let headerTitle = ''
  let urlRoute = ''
  let term1 = ''

  if (gazetteerEntry.NAME2) {
    title = `${gazetteerEntry.NAME2}, ${gazetteerEntry.DISTRICT_BOROUGH} - ${home.pageTitle}`
    headerTitle = `${gazetteerEntry.NAME2}, ${gazetteerEntry.DISTRICT_BOROUGH}`
    urlRoute = `${gazetteerEntry.NAME2}_${gazetteerEntry.DISTRICT_BOROUGH}`
    term1 = gazetteerEntry.NAME2
  } else {
    term1 = gazetteerEntry.NAME1
    const isFullPostcode = isValidFullPostcodeUK(term1)
    const formattedPostcode = isFullPostcode ? formatUKPostcode(term1) : term1
    title = `${formattedPostcode}, ${gazetteerEntry.DISTRICT_BOROUGH} - ${home.pageTitle}`
    headerTitle = `${formattedPostcode}, ${gazetteerEntry.DISTRICT_BOROUGH}`
    urlRoute = `${gazetteerEntry.NAME1}_${gazetteerEntry.DISTRICT_BOROUGH}`
  }

  return { title, headerTitle, urlRoute, term1 }
}

/**
 * Handles the case where COUNTY_UNITARY is present in the gazetteer entry.
 */
const handleCountyUnitary = (gazetteerEntry, locationNameOrPostcode, home) => {
  let title = ''
  let headerTitle = ''
  let urlRoute = ''
  let term1 = ''

  if (gazetteerEntry.NAME2) {
    title = `${locationNameOrPostcode}, ${gazetteerEntry.COUNTY_UNITARY} - ${home.pageTitle}`
    headerTitle = `${locationNameOrPostcode}, ${gazetteerEntry.COUNTY_UNITARY}`
    urlRoute = `${gazetteerEntry.NAME2}_${gazetteerEntry.COUNTY_UNITARY}`
    term1 = locationNameOrPostcode
  } else {
    title = `${locationNameOrPostcode}, ${gazetteerEntry.COUNTY_UNITARY} - ${home.pageTitle}`
    headerTitle = `${locationNameOrPostcode}, ${gazetteerEntry.COUNTY_UNITARY}`
    urlRoute = `${gazetteerEntry.NAME1}_${gazetteerEntry.COUNTY_UNITARY}`
    term1 = locationNameOrPostcode
  }

  return { title, headerTitle, urlRoute, term1 }
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

// Helper function to check if date is today
const isSummaryDateToday = (issueDate) => {
  if (!issueDate) return false
  const today = moment().format('YYYY-MM-DD')
  const issueDateFormatted = moment(issueDate).format('YYYY-MM-DD')
  return today === issueDateFormatted
}

// '' Helper function to extract time from issue_date in H:mm format
const getIssueTime = (issueDate) => {
  if (!issueDate) return '5:00am' // Default fallback
  const issueMoment = moment(issueDate)
  if (!issueMoment.isValid()) return '5:00am' // Default fallback for invalid dates
  return issueMoment.format('h:mma') // Format as h:mma (e.g., "5:34am", "2:05pm")
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
  isSummaryDateToday,
  getIssueTime,
  deduplicateResults
}
