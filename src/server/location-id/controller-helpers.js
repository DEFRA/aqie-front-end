import { createLogger } from '../common/helpers/logging/logger.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../data/constants.js'
import { config } from '../../config/index.js'
import { getDetailedInfo } from '../data/en/air-quality.js'
import { getSearchTermsFromUrl } from '../locations/helpers/get-search-terms-from-url.js'

const logger = createLogger()

/**
 * Build query string from search parameters
 * @param {string} searchTerms - Search terms to include
 * @param {string} locationNameForTemplate - Location name for template
 * @returns {string} Query string with parameters
 */
function buildQueryString(searchTerms, locationNameForTemplate) {
  const queryParams = []
  if (searchTerms) {
    queryParams.push(`searchTerms=${encodeURIComponent(searchTerms)}`)
  }
  if (locationNameForTemplate) {
    queryParams.push(
      `locationName=${encodeURIComponent(locationNameForTemplate)}`
    )
  }
  return queryParams.length > 0 ? `&${queryParams.join('&')}` : ''
}

/**
 * Process common messages for air quality data
 * @param {object} commonMessages - Common messages object
 * @param {string} locationId - Location identifier
 * @param {string} lang - Language code
 * @param {string} queryString - Query string parameters
 * @returns {object} Processed messages
 */
function processCommonMessages(commonMessages, locationId, lang, queryString) {
  const processed = {}
  for (const key of Object.keys(commonMessages)) {
    const message = commonMessages[key]
    if (message && typeof message === 'object') {
      processed[key] = { ...message }
      if (message.insetText && typeof message.insetText === 'string') {
        processed[key].insetText = processInsetText(
          message.insetText,
          locationId,
          lang,
          queryString
        )
      }
    } else {
      processed[key] = message
    }
  }
  return processed
}

/**
 * Process air quality messages to replace placeholders and add query params
 * @param {object} airQualityData - Air quality data object
 * @param {string} locationId - Location identifier
 * @param {string} lang - Language code
 * @param {string} searchTerms - Search terms
 * @param {string} locationNameForTemplate - Location name for template
 * @returns {object} Processed air quality data
 */
export function processAirQualityMessages(
  airQualityData,
  locationId,
  lang,
  searchTerms,
  locationNameForTemplate
) {
  if (!airQualityData?.commonMessages) {
    return {}
  }

  const queryString = buildQueryString(searchTerms, locationNameForTemplate)
  const processedAirQualityData = processCommonMessages(
    airQualityData.commonMessages,
    locationId,
    lang,
    queryString
  )

  if (airQualityData?.daqi?.exposureHtml) {
    if (!processedAirQualityData.daqi) {
      processedAirQualityData.daqi = { ...airQualityData.daqi }
    }
    processedAirQualityData.daqi.exposureHtml = processInsetText(
      airQualityData.daqi.exposureHtml,
      locationId,
      lang,
      queryString
    )
  }

  return processedAirQualityData
}

/**
 * Process inset text by replacing placeholders and adding query params to links
 * @param {string} text - Text to process
 * @param {string} locationId - Location identifier
 * @param {string} lang - Language code
 * @param {string} queryString - Query string parameters
 * @returns {string} Processed text
 */
function processInsetText(text, locationId, lang, queryString) {
  let processedText = text.replaceAll('{locationId}', locationId)

  if (!queryString) {
    return processedText
  }

  if (lang === LANG_CY) {
    processedText = processedText
      .replaceAll(
        'effeithiau-iechyd?lang=cy',
        `effeithiau-iechyd?lang=cy${queryString}`
      )
      .replaceAll(
        'camau-lleihau-amlygiad/cy?lang=cy',
        `camau-lleihau-amlygiad/cy?lang=cy${queryString}`
      )
  } else {
    processedText = processedText
      .replaceAll(
        'health-effects?lang=en',
        `health-effects?lang=en${queryString}`
      )
      .replaceAll(
        'actions-reduce-exposure?lang=en',
        `actions-reduce-exposure?lang=en${queryString}`
      )
  }

  return processedText
}

/**
 * Add query parameter if value exists
 * @param {Array} params - Array of parameters
 * @param {string} name - Parameter name
 * @param {*} value - Parameter value
 */
function addParamIfExists(params, name, value) {
  if (value !== null && value !== undefined) {
    params.push(`${name}=${encodeURIComponent(value)}`)
  }
}

/**
 * Build query parameters for mock features
 * @param {object} request - Request object
 * @param {boolean} mocksDisabled - Whether mocks are disabled
 * @returns {string} Query parameters string
 */
export function buildMockQueryParams(request, mocksDisabled) {
  if (mocksDisabled) {
    return ''
  }

  const params = []
  const query = request.query || {}

  addParamIfExists(params, 'mockLevel', query.mockLevel)
  addParamIfExists(params, 'mockDay', query.mockDay)
  addParamIfExists(params, 'mockPollutantBand', query.mockPollutantBand)
  addParamIfExists(params, 'testMode', query.testMode)

  return params.length > 0 ? `&${params.join('&')}` : ''
}

/**
 * Check if Welsh redirect is needed
 * @param {object} query - Query parameters
 * @param {string} locationId - Location identifier
 * @returns {boolean} True if redirect needed
 */
export function shouldRedirectToWelsh(query, locationId) {
  const lang = query?.lang?.slice(0, 2)
  return lang === LANG_CY && locationId
}

/**
 * Check if English redirect is needed (from Welsh path)
 * @param {object} query - Query parameters
 * @returns {boolean} True if redirect needed
 */
export function shouldRedirectToEnglish(query) {
  const lang = query?.lang?.slice(0, 2)
  return lang === LANG_EN
}

/**
 * Validate mock parameters
 * @param {*} mockLevel - Mock level to validate
 * @returns {object} Validation result with valid flag and level
 */
export function validateMockLevel(mockLevel) {
  if (mockLevel === undefined || mockLevel === null) {
    return { valid: false, level: null }
  }

  const level = Number.parseInt(mockLevel, 10)
  const valid = !Number.isNaN(level) && level >= 0 && level <= 10

  return { valid, level }
}

/**
 * Validate mock pollutant band value
 * @param {*} mockPollutantBand - Pollutant band to validate
 * @returns {object} Validation result with valid flag and band
 */
export function validateMockPollutantBand(mockPollutantBand) {
  if (mockPollutantBand === undefined || mockPollutantBand === null) {
    return { valid: false, band: null }
  }

  const bandStr = mockPollutantBand.toString().toLowerCase()
  const validBands = new Set([
    'low',
    'moderate',
    'high',
    'very-high',
    'very high'
  ])
  const valid =
    validBands.has(bandStr) || validBands.has(bandStr.replace('-', ' '))

  return { valid, band: bandStr }
}

/**
 * Clone air quality day data safely
 * @param {object} dayData - Day data to clone
 * @returns {object} Cloned or original data
 */
function cloneDayData(dayData) {
  return dayData ? { ...dayData } : dayData
}

/**
 * Create base air quality structure from existing data
 * @param {object} airQuality - Air quality data
 * @returns {object} Cloned structure
 */
function createBaseAirQuality(airQuality) {
  return {
    today: cloneDayData(airQuality?.today),
    day2: cloneDayData(airQuality?.day2),
    day3: cloneDayData(airQuality?.day3),
    day4: cloneDayData(airQuality?.day4),
    day5: cloneDayData(airQuality?.day5)
  }
}

/**
 * Apply mock level to specific day or all days
 * @param {object} airQuality - Air quality data
 * @param {number} level - Mock level value
 * @param {string} mockDay - Day to apply mock to
 * @returns {object} Modified air quality data
 */
export function applyMockToDay(airQuality, level, mockDay) {
  const mockDayData = getDetailedInfo(level)
  const validDays = ['today', 'day2', 'day3', 'day4', 'day5']

  logger.info(
    `🔍 applyMockToDay - incoming: today=${airQuality?.today?.value}, day2=${airQuality?.day2?.value}, day3=${airQuality?.day3?.value}, day4=${airQuality?.day4?.value}, day5=${airQuality?.day5?.value}, mockDay=${mockDay}, mockLevel=${level}`
  )

  const modifiedAirQuality = createBaseAirQuality(airQuality)

  const targetDay = mockDay && validDays.includes(mockDay) ? mockDay : 'today'
  modifiedAirQuality[targetDay] = mockDayData

  logger.info(
    `🎯 Applied mock level ${level} to ${targetDay} only (value: ${mockDayData.value}, band: ${mockDayData.band}, readableBand: ${mockDayData.readableBand})`
  )
  logger.info(
    `🔍 applyMockToDay - output: today=${modifiedAirQuality?.today?.value}, day2=${modifiedAirQuality?.day2?.value}, day3=${modifiedAirQuality?.day3?.value}, day4=${modifiedAirQuality?.day4?.value}, day5=${modifiedAirQuality?.day5?.value}`
  )

  return modifiedAirQuality
}

/**
 * Apply mock pollutant band to monitoring sites
 * @param {object} request - Request object
 * @param {Array} monitoringSites - Monitoring sites data
 * @param {Function} generateMockPollutantBand - Function to generate mock pollutant band
 * @param {Function} applyMockPollutantsToSites - Function to apply pollutants to sites
 * @returns {Array} Modified monitoring sites
 */
export function applyMockPollutants(
  request,
  monitoringSites,
  generateMockPollutantBand,
  applyMockPollutantsToSites
) {
  const mocksDisabled = config.get('disableTestMocks')
  if (mocksDisabled) {
    logger.info(`🚫 Mock pollutant bands disabled (disableTestMocks=true)`)
    return monitoringSites
  }

  const mockPollutantBandFromSession = request.yar.get('mockPollutantBand')
  logger.info(
    `🔍 applyMockPollutants called - mockPollutantBand from session:`,
    mockPollutantBandFromSession,
    `(type: ${typeof mockPollutantBandFromSession})`
  )

  if (
    mockPollutantBandFromSession !== undefined &&
    mockPollutantBandFromSession !== null
  ) {
    const bandStr = mockPollutantBandFromSession.toString().toLowerCase()
    logger.info(`🔍 Parsed band:`, bandStr)

    const validBands = new Set([
      'low',
      'moderate',
      'high',
      'very-high',
      'very high'
    ])
    if (validBands.has(bandStr) || validBands.has(bandStr.replace('-', ' '))) {
      logger.info(`🎨 Mock Pollutant Band '${bandStr}' applied from session`)
      const mockPollutants = generateMockPollutantBand(bandStr, {
        logDetails: false
      })
      const modifiedSites = applyMockPollutantsToSites(
        monitoringSites,
        mockPollutants,
        {
          applyToAllSites: true,
          logDetails: false
        }
      )
      return modifiedSites
    } else {
      logger.warn(
        `Invalid mock pollutant band: ${mockPollutantBandFromSession}. Must be one of: low, moderate, high, very-high.`
      )
    }
  }

  logger.info(`🔍 Returning original monitoringSites (no mock pollutants)`)
  return monitoringSites
}

/**
 * Store session parameter (assumes mocks are enabled - caller must check)
 * @param {object} request - Request object
 * @param {string} paramName - Parameter name
 * @param {*} paramValue - Parameter value
 * @param {string} paramLabel - Parameter label for logging
 */
function storeSessionParameter(request, paramName, paramValue, paramLabel) {
  if (paramValue !== undefined) {
    if (paramValue === '' || paramValue === 'clear') {
      request.yar.set(paramName, null)
      logger.info(`🎨 ${paramLabel} explicitly cleared from session`)
    } else {
      request.yar.set(paramName, paramValue)
      logger.info(`🎨 ${paramLabel} ${paramValue} stored in session`)
    }
  }
}

/**
 * Log warning when attempting to set mock parameter while mocks are disabled
 * @param {string} paramLabel - Parameter label for logging
 */
function logMocksDisabledWarning(paramLabel) {
  logger.warn(
    `🚫 Attempted to set ${paramLabel.toLowerCase()} when mocks disabled (disableTestMocks=true) - ignoring parameter`
  )
}

/**
 * Initialize request data and handle session storage
 * @param {object} request - Request object
 * @returns {object} Initialized request data
 */
export function initializeRequestData(request) {
  const { query, headers = {} } = request
  const locationId = request.params.id
  const searchTermsSaved = request.yar.get('searchTermsSaved')
  const currentUrl = request.url.href
  const lang = query?.lang ?? LANG_EN
  const mocksDisabled = config.get('disableTestMocks')
  const mocksEnabled = !mocksDisabled

  // '' Store mock parameters in session (only if mocks enabled)
  if (mocksEnabled) {
    storeSessionParameter(request, 'mockLevel', query?.mockLevel, 'Mock level')
    storeSessionParameter(request, 'mockDay', query?.mockDay, 'Mock day')

    // '' Debug logging for mockPollutantBand
    if (query?.mockPollutantBand !== undefined) {
      logger.info(
        `🔍 DEBUG mockPollutantBand - query.mockPollutantBand:`,
        query?.mockPollutantBand
      )
      logger.info(
        `🔍 DEBUG mockPollutantBand - type:`,
        typeof query?.mockPollutantBand
      )
      logger.info(
        `🔍 DEBUG mockPollutantBand - full query object:`,
        JSON.stringify(query)
      )
    }

    storeSessionParameter(
      request,
      'mockPollutantBand',
      query?.mockPollutantBand,
      'Mock pollutant band'
    )

    // '' Store testMode (persists across requests when mocks enabled)
    if (query?.testMode !== undefined) {
      request.yar.set('testMode', query.testMode)
      logger.info(`🧪 Test mode ${query.testMode} stored in session`)
    }
  } else {
    // '' Log warnings if mock parameters provided when mocks are disabled
    if (query?.mockLevel !== undefined) {
      logMocksDisabledWarning('Mock level')
    }
    if (query?.mockDay !== undefined) {
      logMocksDisabledWarning('Mock day')
    }
    if (query?.mockPollutantBand !== undefined) {
      logMocksDisabledWarning('Mock pollutant band')
    }
    if (query?.testMode !== undefined) {
      logMocksDisabledWarning('Test mode')
    }
  }

  return {
    query,
    headers,
    locationId,
    searchTermsSaved,
    currentUrl,
    lang
  }
}

/**
 * Build redirect URL with search terms and mock parameters
 * @param {string} lang - Language code
 * @param {string} searchParams - Search parameters string
 * @param {object} request - Request object
 * @param {string} locationId - Location ID from URL (for bookmark support)
 * @returns {string} Redirect URL
 */
// eslint-disable-next-line no-unused-vars
function buildRedirectUrl(lang, searchParams, request, locationId = null) {
  const mockLevel = request.query?.mockLevel
  const mockLevelParam =
    mockLevel !== null && mockLevel !== undefined
      ? `&mockLevel=${encodeURIComponent(mockLevel)}`
      : ''

  const mockPollutantBand = request.query?.mockPollutantBand
  const mockPollutantParam =
    mockPollutantBand !== null && mockPollutantBand !== undefined
      ? `&mockPollutantBand=${encodeURIComponent(mockPollutantBand)}`
      : ''

  const testMode = request.query?.testMode
  const testModeParam =
    testMode !== null && testMode !== undefined
      ? `&testMode=${encodeURIComponent(testMode)}`
      : ''

  // '' If locationId is provided (bookmark scenario), pass it as searchTerms to middleware
  const searchTermsParam = locationId
    ? `&searchTerms=${encodeURIComponent(locationId.toUpperCase())}`
    : ''

  return `/location?lang=${encodeURIComponent(lang)}${searchParams}${searchTermsParam}${mockLevelParam}${mockPollutantParam}${testModeParam}`
}

/**
 * Validate and process session data, redirect if invalid
 * @param {object} locationData - Location data from session
 * @param {string} currentUrl - Current URL
 * @param {string} lang - Language code
 * @param {object} h - Hapi response toolkit
 * @param {object} request - Request object
 * @param {string} locationId - Location ID from URL (for bookmark support)
 * @returns {object|null} Redirect response or null if valid
 */
export function validateAndProcessSessionData(
  locationData,
  currentUrl,
  lang,
  h,
  request,
  locationId
) {
  logger.info(
    `[DEBUG validateAndProcessSessionData] locationData exists: ${!!locationData}`
  )
  logger.info(
    `[DEBUG validateAndProcessSessionData] locationData.results is array: ${Array.isArray(locationData?.results)}`
  )
  logger.info(
    `[DEBUG validateAndProcessSessionData] locationData.getForecasts exists: ${!!locationData?.getForecasts}`
  )
  logger.info(
    `[DEBUG validateAndProcessSessionData] locationData.results length: ${locationData?.results?.length || 0}`
  )
  logger.info(
    `[DEBUG validateAndProcessSessionData] locationId from URL: ${locationId}`
  )

  // '' Check for valid results AND forecasts (like 0.685.0)
  if (!Array.isArray(locationData?.results) || !locationData?.getForecasts) {
    logger.info(
      `[DEBUG validateAndProcessSessionData] REDIRECTING - validation failed`
    )

    // '' Extract searchTerms from current URL path (0.685.0 approach)
    const { searchTerms, secondSearchTerm, searchTermsLocationType } =
      getSearchTermsFromUrl(currentUrl)

    request.yar.clear('locationData')

    const safeSearchTerms = searchTerms || ''
    const safeSecondSearchTerm = secondSearchTerm || ''
    const safeSearchTermsLocationType = searchTermsLocationType || ''
    const searchParams =
      safeSearchTerms || safeSecondSearchTerm || safeSearchTermsLocationType
        ? `&searchTerms=${encodeURIComponent(safeSearchTerms)}&secondSearchTerm=${encodeURIComponent(safeSecondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(safeSearchTermsLocationType)}`
        : ''

    // '' Preserve mock parameters in redirect
    const mockLevel = request.query?.mockLevel
    const mockLevelParam =
      mockLevel !== undefined
        ? `&mockLevel=${encodeURIComponent(mockLevel)}`
        : ''

    const mockPollutantBand = request.query?.mockPollutantBand
    const mockPollutantParam =
      mockPollutantBand !== undefined
        ? `&mockPollutantBand=${encodeURIComponent(mockPollutantBand)}`
        : ''

    const testMode = request.query?.testMode
    const testModeParam =
      testMode !== undefined ? `&testMode=${encodeURIComponent(testMode)}` : ''

    const redirectUrl = `/location?lang=${encodeURIComponent(lang)}${searchParams}${mockLevelParam}${mockPollutantParam}${testModeParam}`

    logger.info(
      `[DEBUG validateAndProcessSessionData] Redirect URL: ${redirectUrl}`
    )
    return h.redirect(redirectUrl).code(REDIRECT_STATUS_CODE).takeover()
  }
  logger.info(
    `[DEBUG validateAndProcessSessionData] NOT redirecting - validation passed`
  )
  return null
}
