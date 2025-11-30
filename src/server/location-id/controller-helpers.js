import { createLogger } from '../common/helpers/logging/logger.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { config } from '../../config/index.js'

const logger = createLogger()

/**
 * Process air quality messages to replace placeholders and add query params
 */
/**
 * Build query string from search parameters
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
 */
function addParamIfExists(params, name, value) {
  if (value !== null && value !== undefined) {
    params.push(`${name}=${encodeURIComponent(value)}`)
  }
}

/**
 * Build query parameters for mock features
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
 */
export function shouldRedirectToWelsh(query, locationId) {
  const lang = query?.lang?.slice(0, 2)
  return lang === LANG_CY && locationId
}

/**
 * Check if English redirect is needed (from Welsh path)
 */
export function shouldRedirectToEnglish(query) {
  const lang = query?.lang?.slice(0, 2)
  return lang === LANG_EN
}

/**
 * Validate mock parameters
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
 */
export function applyMockToDay(airQuality, level, mockDay) {
  if (mockDay && ['today', 'day2', 'day3', 'day4', 'day5'].includes(mockDay)) {
    const mockDayData = {
      today: airQuality?.today || null,
      day2: airQuality?.day2 || null,
      day3: airQuality?.day3 || null,
      day4: airQuality?.day4 || null,
      day5: airQuality?.day5 || null
    }
    mockDayData[mockDay] = { value: level, band: 'moderate' }
    return mockDayData
  }
  return { today: { value: level, band: 'moderate' } }
}

/**
 * Apply mock pollutant band to monitoring sites
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
 * Store session parameter with mocks disabled check
 */
function storeSessionParameter(
  request,
  paramName,
  paramValue,
  mocksDisabled,
  paramLabel
) {
  if (paramValue !== undefined && !mocksDisabled) {
    if (paramValue === '' || paramValue === 'clear') {
      request.yar.set(paramName, null)
      logger.info(`🎨 ${paramLabel} explicitly cleared from session`)
    } else {
      request.yar.set(paramName, paramValue)
      logger.info(`🎨 ${paramLabel} ${paramValue} stored in session`)
    }
  } else if (mocksDisabled && paramValue !== undefined) {
    logger.warn(
      `🚫 Attempted to set ${paramLabel.toLowerCase()} when mocks disabled (disableTestMocks=true) - ignoring parameter`
    )
  } else {
    // Parameter not present, preserve existing session value
  }
}

/**
 * Initialize request data and handle session storage
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

  // '' Store mock parameters in session
  storeSessionParameter(
    request,
    'mockLevel',
    query?.mockLevel,
    mocksDisabled,
    'Mock level'
  )
  storeSessionParameter(
    request,
    'mockDay',
    query?.mockDay,
    mocksDisabled,
    'Mock day'
  )

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
    mocksDisabled,
    'Mock pollutant band'
  )

  // '' Store testMode (persists across requests when mocks enabled)
  if (query?.testMode !== undefined && !mocksDisabled) {
    request.yar.set('testMode', query.testMode)
    logger.info(`🧪 Test mode ${query.testMode} stored in session`)
  } else if (mocksDisabled && query?.testMode !== undefined) {
    logger.warn(
      `🚫 Attempted to set test mode when mocks disabled (disableTestMocks=true) - ignoring parameter`
    )
  } else {
    // Parameter not present, preserve existing session value
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
