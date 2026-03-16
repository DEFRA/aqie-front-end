// API utility helpers
import {
  STATUS_UNAUTHORIZED,
  STATUS_OK,
  STATUS_INTERNAL_SERVER_ERROR,
  FORECASTS_API_PATH,
  ROUND_OF_SIX,
  MEASUREMENTS_API_PATH
} from '../../../data/constants.js'
import { config } from '../../../../config/index.js'
async function callAndHandleForecastsResponse(
  url,
  opts,
  catchFetchError,
  httpStatusOk,
  logger,
  errorResponse
) {
  logger.info(`[DEBUG FORECAST API] Calling forecast API: ${url}`)
  const [forecastStatus, getForecasts] = await catchFetchError(url, opts)
  if (forecastStatus !== httpStatusOk) {
    logger.error('Error fetching forecasts data: status code', forecastStatus)
    return errorResponse(
      'Forecasts fetch failed',
      forecastStatus || STATUS_INTERNAL_SERVER_ERROR
    )
  }
  logger.info('Forecasts data fetched')

  // '' Log raw forecast data to track coordinate origins
  if (getForecasts?.forecasts && Array.isArray(getForecasts.forecasts)) {
    logger.info(
      `[FORECAST API RAW] Received ${getForecasts.forecasts.length} forecast stations`
    )
    getForecasts.forecasts.forEach((station, idx) => {
      if (station.location?.coordinates) {
        const rawStation = {
          area: station.area,
          name: station.name,
          areaType: station.areaType,
          coordinates: station.location.coordinates,
          coordinateType: station.location.type
        }

        logger.info(
          `[FORECAST API RAW] Station ${idx}: ${JSON.stringify(rawStation)}`,
          rawStation
        )
      }
    })
  }

  return getForecasts
}

async function callForecastsApi({
  config: apiConfig,
  injectedConfig,
  optionsEphemeralProtected,
  injectedOptionsEphemeralProtected,
  options,
  injectedOptions,
  catchFetchError,
  injectedCatchFetchError,
  httpStatusOk,
  injectedHttpStatusOk,
  logger,
  injectedLogger,
  errorResponse,
  injectedErrorResponse,
  request
}) {
  const resolvedConfig = apiConfig || injectedConfig
  const resolvedOptionsEphemeralProtected =
    optionsEphemeralProtected || injectedOptionsEphemeralProtected || {}
  const resolvedOptions = options || injectedOptions || {}
  const resolvedCatchFetchError = catchFetchError || injectedCatchFetchError
  const resolvedHttpStatusOk = httpStatusOk || injectedHttpStatusOk || STATUS_OK
  const resolvedLogger = logger || injectedLogger
  const resolvedErrorResponse = errorResponse || injectedErrorResponse

  const forecastsApiUrl = resolvedConfig.get('forecastsApiUrl')
  const { url, opts } = selectForecastsUrlAndOptions({
    request,
    forecastsApiUrl,
    optionsEphemeralProtected: resolvedOptionsEphemeralProtected,
    options: resolvedOptions
  })
  return callAndHandleForecastsResponse(
    url,
    opts,
    resolvedCatchFetchError,
    resolvedHttpStatusOk,
    resolvedLogger,
    resolvedErrorResponse
  )
}

// Helper to build remote forecasts URL and options
function buildRemoteForecastsUrlAndOpts(forecastsApiUrl, localOptions) {
  return {
    url: forecastsApiUrl,
    opts: {
      ...localOptions,
      headers: {
        ...localOptions.headers,
        'Content-Type': 'application/json'
      }
    }
  }
}

function isLocalRequest(request) {
  const resolvedRequest = request?.request || request
  const host = resolvedRequest?.headers?.host
  if (!host) {
    return false
  }
  return host.includes('localhost') || host.includes('127.0.0.1')
}

function getEnvironmentName(request) {
  const resolvedRequest = request?.request || request
  return (
    resolvedRequest?.app?.config?.env || process.env.NODE_ENV || 'development'
  )
}

function getEphemeralProtectedApiUrl(request, fallbackConfig = config) {
  const resolvedRequest = request?.request || request
  const env = getEnvironmentName(request)
  const configSource = resolvedRequest?.app?.config || fallbackConfig

  if (!configSource) {
    return null
  }

  const getValue = (key) =>
    typeof configSource.get === 'function'
      ? configSource.get(key)
      : configSource?.[key]

  if (env === 'perf-test') {
    return getValue('ephemeralProtectedPerfTestApiUrl') || null
  }
  if (env === 'test') {
    return (
      getValue('ephemeralProtectedTestApiUrl') ||
      getValue('ephemeralProtectedDevApiUrl') ||
      null
    )
  }

  return (
    getValue('ephemeralProtectedTestApiUrl') ||
    getValue('ephemeralProtectedDevApiUrl') ||
    null
  )
}

function buildLocalForecastsUrlAndOpts(
  ephemeralUrl,
  localOptionsEphemeralProtected
) {
  const url = `${ephemeralUrl}${FORECASTS_API_PATH}`
  return {
    url,
    opts: {
      ...localOptionsEphemeralProtected,
      headers: {
        ...localOptionsEphemeralProtected?.headers
      }
    }
  }
}

// Helper to select the correct forecasts URL and options based on environment.
// Forecasts always use direct environment backend service URL.
function selectForecastsUrlAndOptions({
  request,
  forecastsApiUrl,
  optionsEphemeralProtected: localOptionsEphemeralProtected,
  options: localOptions
}) {
  const ephemeralUrl = getEphemeralProtectedApiUrl(request)
  if (isLocalRequest(request) && ephemeralUrl) {
    return buildLocalForecastsUrlAndOpts(
      ephemeralUrl,
      localOptionsEphemeralProtected
    )
  }
  return buildRemoteForecastsUrlAndOpts(forecastsApiUrl, localOptions)
}

// Helper to build query parameters for new Ricardo measurements
function buildMeasurementsQueryParams(latitude, longitude) {
  const formatCoordinate = (coord) => Number(coord).toFixed(ROUND_OF_SIX)
  if (!URLSearchParams) {
    throw new Error('URLSearchParams is not available in this environment')
  }
  return new URLSearchParams({
    page: '1',
    'latest-measurement': 'true',
    'with-closed': 'false',
    'with-pollutants': 'true',
    latitude: formatCoordinate(latitude),
    longitude: formatCoordinate(longitude),
    'networks[]': '4',
    totalItems: '3',
    distance: '60',
    'daqi-pollutant': 'true'
  })
}

// Helper to build remote measurements URL and options
function buildRemoteMeasurementsUrlAndOpts(url, options = {}) {
  return {
    url,
    opts: {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json'
      }
    }
  }
}

function buildLocalMeasurementsUrlAndOpts(
  queryParams,
  ephemeralUrl,
  optionsEphemeralProtected
) {
  const measurementsApiPath = MEASUREMENTS_API_PATH || ''
  if (!measurementsApiPath) {
    throw new Error(
      'MEASUREMENTS_API_PATH constant must be set for local requests'
    )
  }

  let separator
  if (measurementsApiPath.endsWith('?')) {
    separator = ''
  } else if (measurementsApiPath.includes('?')) {
    separator = '&'
  } else {
    separator = '?'
  }
  const fullUrl = `${ephemeralUrl}${measurementsApiPath}${separator}${queryParams.toString()}`

  return {
    url: fullUrl,
    opts: optionsEphemeralProtected
  }
}

// Helper to select API URL and options for Ricardo measurements
function selectMeasurementsUrlAndOptions(
  latitude,
  longitude,
  useNewRicardoMeasurementsEnabledOrDi,
  diOverride
) {
  const useNewRicardoMeasurementsEnabled =
    typeof useNewRicardoMeasurementsEnabledOrDi === 'boolean'
      ? useNewRicardoMeasurementsEnabledOrDi
      : true
  const di =
    typeof useNewRicardoMeasurementsEnabledOrDi === 'boolean'
      ? diOverride || {}
      : useNewRicardoMeasurementsEnabledOrDi || {}

  const {
    config: apiConfig,
    injectedConfig,
    logger,
    injectedLogger,
    optionsEphemeralProtected,
    injectedOptionsEphemeralProtected,
    options,
    injectedOptions,
    request
  } = di

  const resolvedConfig = apiConfig || injectedConfig || config
  const resolvedLogger = injectedLogger ||
    logger || { info: () => {}, error: () => {} }
  const resolvedOptionsEphemeralProtected =
    optionsEphemeralProtected || injectedOptionsEphemeralProtected || {}
  const resolvedOptions = options || injectedOptions || {}

  if (!config.get('isProduction')) {
    resolvedLogger.info(
      `[URL BUILD DEBUG] Using measurements with latitude: ${latitude}, longitude: ${longitude}`
    )
  }

  const queryParams = buildMeasurementsQueryParams(latitude, longitude)
  const baseUrl = useNewRicardoMeasurementsEnabled
    ? resolvedConfig.get('ricardoMeasurementsApiUrl')
    : resolvedConfig.get('measurementsApiUrl')

  if (!config.get('isProduction')) {
    resolvedLogger.info(`[URL BUILD DEBUG] Base URL from config: ${baseUrl}`)
    resolvedLogger.info(
      `[URL BUILD DEBUG] Query params: ${queryParams.toString()}`
    )
  }

  const ricardoMeasurementsApiUrl = useNewRicardoMeasurementsEnabled
    ? `${baseUrl}${queryParams.toString()}`
    : baseUrl

  if (!config.get('isProduction')) {
    resolvedLogger.info(
      `[URL BUILD DEBUG] Full Ricardo measurements API URL: ${ricardoMeasurementsApiUrl}`
    )
  }

  if (useNewRicardoMeasurementsEnabled) {
    resolvedLogger.info(
      `New Ricardo measurements API URL: ${ricardoMeasurementsApiUrl}`
    )
  } else {
    resolvedLogger.info(
      `Old measurements API URL: ${ricardoMeasurementsApiUrl}`
    )
  }

  const ephemeralUrl = getEphemeralProtectedApiUrl(request, resolvedConfig)
  if (isLocalRequest(request) && ephemeralUrl) {
    if (!config.get('isProduction')) {
      resolvedLogger.info(
        '[URL BUILD DEBUG] Using LOCAL ephemeral measurements API URL'
      )
    }
    return buildLocalMeasurementsUrlAndOpts(
      queryParams,
      ephemeralUrl,
      resolvedOptionsEphemeralProtected
    )
  }

  const result = buildRemoteMeasurementsUrlAndOpts(
    ricardoMeasurementsApiUrl,
    resolvedOptions
  )
  if (!config.get('isProduction')) {
    resolvedLogger.info(`[URL BUILD DEBUG] Using REMOTE URL: ${result.url}`)
  }
  return result
}

// Helper to call the measurements API and handle the response
async function callAndHandleMeasurementsResponse(
  url,
  opts,
  catchFetchError,
  logger
) {
  if (!config.get('isProduction')) {
    logger.info(`[API DEBUG] Calling measurements API: ${url}`)
    logger.info(`[API DEBUG] Request options:`, JSON.stringify(opts, null, 2))
  }

  const [status, data] = await catchFetchError(url, opts)

  if (!config.get('isProduction')) {
    logger.info(`[API DEBUG] Response status: ${status}`)
    logger.info(`[API DEBUG] Response data type: ${typeof data}`)
    logger.info(`[API DEBUG] Response data is array: ${Array.isArray(data)}`)
    logger.info(
      `[API DEBUG] Full response data:`,
      JSON.stringify(data, null, 2)
    )
  }

  if (status !== STATUS_OK) {
    logger.error(`Error fetching data: ${data?.message}`)
    return []
  }
  logger.info('Data fetched successfully.')
  return data || []
}

// Helper to build the UK API URL and check for API key
function buildAndCheckUKApiUrl(
  userLocation,
  searchTerms,
  secondSearchTerm,
  deps
) {
  const filters = deps.buildUKLocationFilters()
  const osNamesApiUrl = deps.config.get('osNamesApiUrl')
  const osNamesApiKey = deps.config.get('osNamesApiKey')
  const hasOsKey = Boolean(osNamesApiKey && String(osNamesApiKey).trim() !== '')
  const combinedLocation = deps.combineUKSearchTerms(
    userLocation,
    searchTerms,
    secondSearchTerm,
    deps.isValidFullPostcodeUK,
    deps.isValidPartialPostcodeUK
  )
  const osNamesApiUrlFull = deps.buildUKApiUrl(
    combinedLocation,
    filters,
    osNamesApiUrl,
    osNamesApiKey
  )
  return { osNamesApiUrlFull, hasOsKey, combinedLocation }
}

// Helper to call the UK API and handle the response
async function callAndHandleUKApiResponse({
  osNamesApiUrlFull,
  options,
  injectedOptions,
  optionsEphemeralProtected,
  injectedOptionsEphemeralProtected,
  shouldCallApi,
  catchProxyFetchError,
  injectedCatchProxyFetchError,
  httpStatusOk,
  injectedHttpStatusOk,
  logger,
  injectedLogger,
  formatUKApiResponse
}) {
  const resolvedLogger = logger ||
    injectedLogger || { info: () => {}, warn: () => {}, error: () => {} }
  const resolvedOptions = options || injectedOptions || {}
  const resolvedOptionsEphemeralProtected =
    optionsEphemeralProtected || injectedOptionsEphemeralProtected || {}
  const resolvedCatchProxyFetchError =
    catchProxyFetchError || injectedCatchProxyFetchError
  const resolvedHttpStatusOk = httpStatusOk || injectedHttpStatusOk || STATUS_OK

  const isLocal =
    String(osNamesApiUrlFull).includes('localhost') ||
    String(osNamesApiUrlFull).includes('127.0.0.1')
  const selectedOptions = isLocal
    ? resolvedOptionsEphemeralProtected
    : resolvedOptions
  resolvedLogger.info(
    `[DEBUG] Calling catchProxyFetchError with URL: ${osNamesApiUrlFull}`
  )
  resolvedLogger.info('[DEBUG] Options:', JSON.stringify(selectedOptions))
  const [statusCodeOSPlace, getOSPlaces] = await resolvedCatchProxyFetchError(
    osNamesApiUrlFull,
    selectedOptions,
    shouldCallApi
  )
  if (statusCodeOSPlace === resolvedHttpStatusOk) {
    resolvedLogger.info('getOSPlaces data fetched:')
    return formatUKApiResponse(getOSPlaces)
  }
  if (statusCodeOSPlace === STATUS_UNAUTHORIZED) {
    resolvedLogger.warn(
      `OS Names API returned 401 (unauthorized). Check OS_NAMES_API_KEY. URL was suppressed in logs.`
    )
    return null
  }
  resolvedLogger.error(
    'Error fetching statusCodeOSPlace data:',
    statusCodeOSPlace
  )
  return null
}

function callAndHandleUKApiResponseCompat(...args) {
  if (args.length > 1) {
    const [
      osNamesApiUrlFull,
      options,
      optionsEphemeralProtected,
      shouldCallApi,
      catchProxyFetchError,
      httpStatusOk,
      logger,
      formatUKApiResponse
    ] = args
    return callAndHandleUKApiResponse({
      osNamesApiUrlFull,
      options,
      optionsEphemeralProtected,
      shouldCallApi,
      catchProxyFetchError,
      httpStatusOk,
      logger,
      formatUKApiResponse
    })
  }

  return callAndHandleUKApiResponse(args[0] || {})
}

export {
  callAndHandleForecastsResponse,
  callForecastsApi,
  selectForecastsUrlAndOptions,
  selectMeasurementsUrlAndOptions,
  callAndHandleMeasurementsResponse,
  buildAndCheckUKApiUrl,
  callAndHandleUKApiResponseCompat as callAndHandleUKApiResponse
}
