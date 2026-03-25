import { config } from '../../../config/index.js'
import { calendarWelsh } from '../../data/cy/cy.js'
import { english } from '../../data/en/en.js'
import * as airQualityData from '../../data/en/air-quality.js'
import {
  siteTypeDescriptions,
  pollutantTypes
} from '../../data/en/monitoring-sites.js'
import {
  LANG_CY,
  LOCATION_TYPE_UK,
  REDIRECT_STATUS_CODE
} from '../../data/constants.js'
import { convertFirstLetterIntoUppercase } from '../../locations/helpers/convert-first-letter-into-upper-case.js'
import { gazetteerEntryFilter } from '../../locations/helpers/gazetteer-util.js'
import { getSearchTermsFromUrl } from '../../locations/helpers/get-search-terms-from-url.js'
import { transformKeys } from '../../locations/helpers/transform-summary-keys.js'
import { airQualityValues } from '../../locations/helpers/air-quality-values.js'
import {
  compareLastElements,
  formatNorthernIrelandPostcode
} from '../../locations/helpers/convert-string.js'
import { getForecastWarning } from '../../locations/helpers/forecast-warning.js'
import {
  processAirQualityMessages,
  buildMockQueryParams,
  applyMockToDay,
  applyMockPollutants as applyMockPollutantsHelper
} from '../controller-helpers.js'
import {
  mockPollutantBand as generateMockPollutantBand,
  applyMockPollutantsToSites
} from '../../common/helpers/mock-pollutant-level.js'

function applyMockLevel(request, airQuality) {
  const mocksDisabled = config.get('disableTestMocks')
  if (mocksDisabled) {
    return airQuality
  }

  const mockLevel = request.yar.get('mockLevel')
  const mockDay = request.yar.get('mockDay')
  if (mockLevel === undefined || mockLevel === null) {
    return airQuality
  }

  const level = Number.parseInt(mockLevel, 10)
  if (Number.isNaN(level) || level < 0 || level > 10) {
    return airQuality
  }

  return applyMockToDay(airQuality, level, mockDay)
}

function applyMockPollutants(request, monitoringSites) {
  return applyMockPollutantsHelper(
    request,
    monitoringSites,
    generateMockPollutantBand,
    applyMockPollutantsToSites
  )
}

function normalizeSearchTermsForRedirect(searchTerms, request) {
  const fallbackSearchTerms = request?.params?.id || ''
  let safeSearchTerms = searchTerms || fallbackSearchTerms

  const normalizedNIPostcodeRegex = /^bt\d{1,2}\d[a-z]{2}$/i
  if (normalizedNIPostcodeRegex.test(safeSearchTerms)) {
    safeSearchTerms = formatNorthernIrelandPostcode(
      safeSearchTerms.toUpperCase()
    )
  }

  return safeSearchTerms
}

function getSearchRedirectParams(currentUrl, request) {
  const { searchTerms, secondSearchTerm, searchTermsLocationType } =
    getSearchTermsFromUrl(currentUrl)

  const safeSearchTerms = normalizeSearchTermsForRedirect(searchTerms, request)
  const safeSecondSearchTerm = secondSearchTerm || ''
  const safeSearchTermsLocationType =
    !searchTermsLocationType || searchTermsLocationType === 'Invalid Postcode'
      ? LOCATION_TYPE_UK
      : searchTermsLocationType

  return {
    safeSearchTerms,
    safeSecondSearchTerm,
    safeSearchTermsLocationType
  }
}

function buildDefinedQueryParams(query = {}) {
  const params = []

  if (query.mockLevel !== undefined) {
    params.push(`mockLevel=${encodeURIComponent(query.mockLevel)}`)
  }
  if (query.mockDay !== undefined) {
    params.push(`mockDay=${encodeURIComponent(query.mockDay)}`)
  }
  if (query.mockPollutantBand !== undefined) {
    params.push(
      `mockPollutantBand=${encodeURIComponent(query.mockPollutantBand)}`
    )
  }
  if (query.testMode !== undefined) {
    params.push(`testMode=${encodeURIComponent(query.testMode)}`)
  }

  return params.length > 0 ? `&${params.join('&')}` : ''
}

function buildMockParamsForSearchRedirect(request) {
  const mocksDisabled = config.get('disableTestMocks')
  return mocksDisabled ? '' : buildDefinedQueryParams(request?.query)
}

function handleWelshRedirect(query, locationId, h) {
  if (query?.lang && query.lang === LANG_CY && !query?.searchTerms) {
    const mockParams = buildMockQueryParams(
      { query },
      config.get('disableTestMocks')
    )

    return h
      .redirect(`/lleoliad/${locationId}/?lang=cy${mockParams}`)
      .code(REDIRECT_STATUS_CODE)
  }

  return null
}

function handleSearchTermsRedirect({
  headers,
  searchTermsSaved,
  currentUrl,
  request,
  h,
  hasSessionCookie,
  clearSessionKeyIfExists,
  logger
}) {
  const previousUrl = headers.referer || headers.referrer
  const isPreviousAndCurrentUrlEqual = previousUrl
    ? compareLastElements(previousUrl, currentUrl)
    : false

  const hasSession = hasSessionCookie(request)
  if (!isPreviousAndCurrentUrlEqual || searchTermsSaved || !hasSession) {
    return null
  }

  const { safeSearchTerms, safeSecondSearchTerm, safeSearchTermsLocationType } =
    getSearchRedirectParams(currentUrl, request)

  clearSessionKeyIfExists(request, 'locationData')
  const mockParams = buildMockParamsForSearchRedirect(request)

  logger.info('[DEBUG controller] Redirecting because search terms are missing')

  return h
    .redirect(
      `/location?lang=en&searchTerms=${encodeURIComponent(safeSearchTerms)}&secondSearchTerm=${encodeURIComponent(safeSecondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(safeSearchTermsLocationType)}${mockParams}`
    )
    .code(REDIRECT_STATUS_CODE)
    .takeover()
}

function prepareLocationTitles(locationDetails) {
  const { title, headerTitle } = gazetteerEntryFilter(locationDetails)
  return {
    title: convertFirstLetterIntoUppercase(title),
    headerTitle: convertFirstLetterIntoUppercase(headerTitle)
  }
}

function prepareAirQuality({ forecastNum, lang, request, locationData }) {
  const forecastNumSafe =
    Array.isArray(forecastNum) && forecastNum.length > 0 ? forecastNum : []
  const highestAQ =
    forecastNumSafe.length > 0 ? Math.max(...forecastNumSafe) : 0

  let { airQuality } = airQualityValues(forecastNumSafe, lang)
  const { transformedDailySummary } = locationData.dailySummary
    ? transformKeys(locationData.dailySummary, lang, highestAQ)
    : { transformedDailySummary: null }

  airQuality = applyMockLevel(request, airQuality)

  return { airQuality, transformedDailySummary, forecastNumSafe }
}

function extractLocationContext(request, headerTitle) {
  return {
    searchTerms: request?.query?.searchTerms || '',
    locationNameForTemplate: request?.query?.locationName || headerTitle
  }
}

function buildLocationViewData({
  locationDetails,
  nearestLocationsRange,
  locationData,
  forecastNum,
  lang,
  getMonth,
  metaSiteUrl,
  request,
  locationId
}) {
  const { title, headerTitle } = prepareLocationTitles(locationDetails)

  const { airQuality, transformedDailySummary } = prepareAirQuality({
    forecastNum,
    lang,
    request,
    locationData
  })

  const modifiedMonitoringSites = applyMockPollutants(
    request,
    nearestLocationsRange
  )
  const forecastWarning = getForecastWarning(airQuality, lang)
  const { searchTerms, locationNameForTemplate } = extractLocationContext(
    request,
    headerTitle
  )

  const processedAirQualityData = processAirQualityMessages(
    airQualityData,
    locationId,
    lang,
    searchTerms,
    locationNameForTemplate
  )

  const firstResult = locationData?.results?.[0]
  const latlon =
    firstResult?.latitude != null && firstResult?.longitude != null
      ? {
          lat: Number(firstResult.latitude.toFixed(4)),
          lon: Number(firstResult.longitude.toFixed(4))
        }
      : locationData.latlon

  return {
    result: locationDetails,
    airQuality,
    airQualityData: processedAirQualityData,
    monitoringSites: modifiedMonitoringSites,
    siteTypeDescriptions,
    pollutantTypes,
    pageTitle: `${english.multipleLocations.titlePrefix} ${title} - ${english.multipleLocations.pageTitle}`,
    metaSiteUrl,
    description: `${english.daqi.description.a} ${headerTitle}${english.daqi.description.b}`,
    title: `${english.multipleLocations.titlePrefix} ${headerTitle}`,
    headerTitle,
    locationName: locationNameForTemplate,
    locationId,
    latlon,
    searchTerms,
    displayBacklink: true,
    transformedDailySummary,
    footerTxt: english.footerTxt,
    phaseBanner: english.phaseBanner,
    backlink: english.backlink,
    cookieBanner: english.cookieBanner,
    daqi: english.daqi,
    welshMonth: calendarWelsh[getMonth],
    summaryDate:
      lang === LANG_CY ? locationData.welshDate : locationData.englishDate,
    showSummaryDate: locationData.showSummaryDate,
    issueTime: locationData.issueTime,
    dailySummaryTexts: english.dailySummaryTexts,
    serviceName: english.multipleLocations.serviceName,
    forecastWarning,
    lang
  }
}

function buildNotFoundViewData(lang) {
  return {
    paragraph: english.notFoundLocation.paragraphs,
    serviceName: english.notFoundLocation.heading,
    footerTxt: english.footerTxt,
    phaseBanner: english.phaseBanner,
    backlink: english.backlink,
    cookieBanner: english.cookieBanner,
    lang
  }
}

export {
  handleWelshRedirect,
  handleSearchTermsRedirect,
  buildLocationViewData,
  buildNotFoundViewData
}
