import { createLogger } from '../common/helpers/logging/logger.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { config } from '../../config/index.js'
import { getDetailedInfo } from '../data/en/air-quality.js'

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
 * Apply mock level to specific day or all days
 * @param {object} airQuality - Air quality data
 * @param {number} level - Mock level value
 * @param {string} mockDay - Day to apply mock to
 * @returns {object} Modified air quality data
 */
export function applyMockToDay(airQuality, level, mockDay) {
  const mockDayData = getDetailedInfo(level)

  // '' Debug: Log incoming airQuality structure
  logger.info(
    `🔍 applyMockToDay - incoming: today=${airQuality?.today?.value}, day2=${airQuality?.day2?.value}, day3=${airQuality?.day3?.value}, day4=${airQuality?.day4?.value}, day5=${airQuality?.day5?.value}, mockDay=${mockDay}, mockLevel=${level}`
  )

  if (mockDay && ['today', 'day2', 'day3', 'day4', 'day5'].includes(mockDay)) {
    // '' Preserve original air quality data for non-mocked days - use spread unconditionally
    const modifiedAirQuality = {
      today: airQuality?.today ? { ...airQuality.today } : airQuality?.today,
      day2: airQuality?.day2 ? { ...airQuality.day2 } : airQuality?.day2,
      day3: airQuality?.day3 ? { ...airQuality.day3 } : airQuality?.day3,
      day4: airQuality?.day4 ? { ...airQuality.day4 } : airQuality?.day4,
      day5: airQuality?.day5 ? { ...airQuality.day5 } : airQuality?.day5
    }
    // '' Override the specific day with the mock level
    modifiedAirQuality[mockDay] = mockDayData
    logger.info(
      `🎯 Applied mock level ${level} to ${mockDay} only (value: ${mockDayData.value}, band: ${mockDayData.band}, readableBand: ${mockDayData.readableBand})`
    )
    logger.info(
      `🔍 applyMockToDay - output: today=${modifiedAirQuality?.today?.value}, day2=${modifiedAirQuality?.day2?.value}, day3=${modifiedAirQuality?.day3?.value}, day4=${modifiedAirQuality?.day4?.value}, day5=${modifiedAirQuality?.day5?.value}`
    )
    return modifiedAirQuality
  }
  // '' If no specific day, apply to today only
  return {
    today: mockDayData,
    day2: airQuality?.day2 ? { ...airQuality.day2 } : airQuality?.day2,
    day3: airQuality?.day3 ? { ...airQuality.day3 } : airQuality?.day3,
    day4: airQuality?.day4 ? { ...airQuality.day4 } : airQuality?.day4,
    day5: airQuality?.day5 ? { ...airQuality.day5 } : airQuality?.day5
  }
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
  const useNewRicardoMeasurementsEnabled = config.get(
    'useNewRicardoMeasurementsEnabled'
  )
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
    useNewRicardoMeasurementsEnabled,
    currentUrl,
    lang
  }
}

/**
 * Build redirect URL with search terms and mock parameters
 * @param {string} lang - Language code
 * @param {string} searchParams - Search parameters string
 * @param {object} request - Request object
 * @returns {string} Redirect URL
 */
function buildRedirectUrl(lang, searchParams, request) {
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

  return `/location?lang=${encodeURIComponent(lang)}${searchParams}${mockLevelParam}${mockPollutantParam}${testModeParam}`
}

/**
 * Validate and process session data, redirect if invalid
 * @param {object} locationData - Location data from session
 * @param {string} currentUrl - Current URL
 * @param {string} lang - Language code
 * @param {object} h - Hapi response toolkit
 * @param {object} request - Request object
 * @param {Function} getSearchTermsFromUrl - Function to extract search terms from URL
 * @param {number} REDIRECT_STATUS_CODE - HTTP status code for redirect
 * @returns {object|null} Redirect response or null if valid
 */
export function validateAndProcessSessionData(
  locationData,
  currentUrl,
  lang,
  h,
  request,
  getSearchTermsFromUrl,
  REDIRECT_STATUS_CODE
) {
  if (!Array.isArray(locationData?.results) || !locationData?.getForecasts) {
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

    const redirectUrl = buildRedirectUrl(lang, searchParams, request)
    return h.redirect(redirectUrl).code(REDIRECT_STATUS_CODE).takeover()
  }
  return null
}
