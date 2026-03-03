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
import OsGridRef from 'mt-osgridref'
import { LANG_EN, LANG_CY, REDIRECT_STATUS_CODE } from '../../data/constants.js'
import { createURLRouteBookmarks } from './create-bookmark-ids.js'
import reduceMatches from './reduce-matches.js'
import { filterMatches } from './filter-matches.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { config } from '../../../config/index.js'

const logger = createLogger()

// Helper function to build mock query parameters
const buildMockQueryParams = (request) => {
  const mocksEnabled = config.get('disableTestMocks') === false

  if (!mocksEnabled) {
    return ''
  }

  const params = []
  const mockLevel = request.query?.mockLevel
  const mockDay = request.query?.mockDay
  const mockPollutantBand = request.query?.mockPollutantBand
  const testMode = request.query?.testMode

  if (mockLevel !== undefined) {
    params.push(`mockLevel=${encodeURIComponent(mockLevel)}`)
  }
  if (mockDay !== undefined) {
    params.push(`mockDay=${encodeURIComponent(mockDay)}`)
  }
  if (mockPollutantBand !== undefined) {
    params.push(`mockPollutantBand=${encodeURIComponent(mockPollutantBand)}`)
  }
  if (testMode !== undefined) {
    params.push(`testMode=${encodeURIComponent(testMode)}`)
  }

  return params.length > 0 ? `?${params.join('&')}` : ''
}

// Helper function to handle single match
const handleSingleMatch = async (
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

  // '' Log issue_date when passing dailySummary into session location data
  logger.info(
    `[DEBUG issue_date] passing to session dailySummary: ${getDailySummary?.issue_date ?? 'N/A'}`,
    {
      issueDate: getDailySummary?.issue_date,
      locationType,
      customId
    }
  )

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

  // '' Set searchTermsSaved before redirect to prevent controller redirect loop
  request.yar.set('searchTermsSaved', request.query.searchTerms || '')

  logger.info(`Redirecting to location with custom ID: ${customId}`)

  // '' Check if user is in notification registration flow (SMS or Email)
  const notificationFlow = request.yar.get('notificationFlow')
  if (notificationFlow) {
    // '' Update session with new location data for notification
    const locationData = request.yar.get('locationData')

    logger.info(
      `[DEBUG handleSingleMatch] Notification flow detected: ${notificationFlow}`,
      {
        flow: notificationFlow,
        hasLocationData: !!locationData,
        hasResults: !!locationData?.results,
        resultsCount: locationData?.results?.length,
        customId,
        title: headerTitle || title
      }
    )

    if (locationData && locationData.results && locationData.results[0]) {
      const result = locationData.results[0]
      const gazetteerEntry = result.GAZETTEER_ENTRY || result

      // '' Convert British National Grid coordinates (GEOMETRY_X/Y) to lat/long
      let lat, lon
      if (gazetteerEntry.GEOMETRY_X && gazetteerEntry.GEOMETRY_Y) {
        // '' Convert BNG coordinates to WGS84 lat/long
        const point = new OsGridRef(
          gazetteerEntry.GEOMETRY_X,
          gazetteerEntry.GEOMETRY_Y
        )
        const latlon = OsGridRef.osGridToLatLong(point)
        lat = latlon._lat
        lon = latlon._lon
      } else {
        // '' Fallback to direct latitude/longitude if available
        lat =
          gazetteerEntry.LATITUDE || gazetteerEntry.latitude || result.latitude
        lon =
          gazetteerEntry.LONGITUDE ||
          gazetteerEntry.longitude ||
          result.longitude
      }

      // '' Update session with new location data (overwrites previous alert's location)
      request.yar.set('location', headerTitle || title)
      request.yar.set('locationId', customId)
      request.yar.set('latitude', lat)
      request.yar.set('longitude', lon)

      const sessionLocationData = {
        location: headerTitle || title,
        locationId: customId,
        lat,
        lon,
        hasLat: !!lat,
        hasLon: !!lon,
        geometryX: gazetteerEntry.GEOMETRY_X,
        geometryY: gazetteerEntry.GEOMETRY_Y
      }

      logger.info(
        `[DEBUG handleSingleMatch] Updated session location data for ${notificationFlow} flow: ${JSON.stringify(sessionLocationData)}`,
        sessionLocationData
      )
    } else {
      logger.warn(
        `[DEBUG handleSingleMatch] No location data found in session for ${notificationFlow} flow`,
        {
          hasLocationData: !!locationData,
          locationDataKeys: locationData ? Object.keys(locationData) : []
        }
      )
    }

    // '' Keep flow flag for the session and redirect to confirm details page
    logger.info(
      `[DEBUG handleSingleMatch] Redirecting to ${notificationFlow} confirm details (notificationFlow=${notificationFlow})`
    )

    if (notificationFlow === 'sms') {
      const smsConfirmDetailsPath = config.get('notify.smsConfirmDetailsPath')
      return h
        .redirect(`${smsConfirmDetailsPath}?lang=${lang}`)
        .code(REDIRECT_STATUS_CODE)
        .takeover()
    } else if (notificationFlow === 'email') {
      const emailDetailsPath = config.get('notify.emailDetailsPath')
      return h
        .redirect(`${emailDetailsPath}?lang=${lang}`)
        .code(REDIRECT_STATUS_CODE)
        .takeover()
    }
  }

  // '' Build query parameters for mock testing (only when mocks enabled)
  const queryParams = buildMockQueryParams(request)

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

// Helper function to normalize POPULATED_PLACE (handles arrays consistently) ''
const normalizePopulatedPlace = (populatedPlace) => {
  if (!populatedPlace) return ''

  // If it's an array, sort alphabetically and join with comma
  if (Array.isArray(populatedPlace)) {
    return populatedPlace.sort().join(', ')
  }

  // If it's already a string, return as-is
  return String(populatedPlace)
}

// Helper function to get the appropriate location field for postcodes ''
// '' For postcodes, use POPULATED_PLACE if it exists (for consistency), else DISTRICT_BOROUGH
// '' This ensures we always get the same location name (e.g., "Hornsey") for the same postcode
const getPostcodeLocationField = (gazetteerEntry) => {
  const populatedPlace = normalizePopulatedPlace(
    gazetteerEntry?.POPULATED_PLACE
  )
  if (populatedPlace) {
    return populatedPlace
  }
  return (
    gazetteerEntry?.DISTRICT_BOROUGH || gazetteerEntry?.COUNTY_UNITARY || ''
  )
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

    // '' For postcodes, prefer POPULATED_PLACE when available
    const isPostcode = gazetteerEntry?.LOCAL_TYPE === 'Postcode'
    if (isPostcode) {
      const locationField = getPostcodeLocationField(gazetteerEntry)
      if (locationField) {
        term1 = gazetteerEntry.NAME1
        const isFullPostcode = isValidFullPostcodeUK(term1)
        const formattedPostcode = isFullPostcode
          ? formatUKPostcode(term1)
          : term1
        title = `${formattedPostcode}, ${locationField} - ${home.pageTitle}`
        headerTitle = `${formattedPostcode}, ${locationField}`
        urlRoute = `${gazetteerEntry.NAME1}_${locationField}`
      } else {
        // '' Fallback when no location field is available for postcode
        term1 = gazetteerEntry.NAME1
        const isFullPostcode = isValidFullPostcodeUK(term1)
        const formattedPostcode = isFullPostcode
          ? formatUKPostcode(term1)
          : term1
        title = `${formattedPostcode} - ${home.pageTitle}`
        headerTitle = formattedPostcode
        urlRoute = gazetteerEntry.NAME1
      }
    } else if (gazetteerEntry?.DISTRICT_BOROUGH) {
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
    return item.includes(formattedDateSummary[1])
  })
  return { getMonthSummary, formattedDateSummary }
}

// Helper function to check if date is today
const isSummaryDateToday = (issueDate) => {
  if (!issueDate) {
    return false
  }

  // '' Compare in UK timezone to avoid midnight boundary mismatches
  const nowUk = moment.tz('Europe/London')
  const issueDateUk = moment.tz(issueDate, 'Europe/London')
  if (!issueDateUk.isValid()) {
    return false
  }

  return nowUk.isSame(issueDateUk, 'day')
}

// '' Helper function to extract time from issue_date in H:mm format
const getIssueTime = (issueDate) => {
  if (!issueDate) {
    return '5:00am'
  }
  const issueMoment = moment(issueDate)
  if (!issueMoment.isValid()) {
    return '5:00am'
  }
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
