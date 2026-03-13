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
  optionsEphemeralProtected,
  options,
  catchFetchError,
  httpStatusOk,
  logger,
  errorResponse,
  request
}) {
  const forecastsApiUrl = apiConfig.get('forecastsApiUrl')
  const { url, opts } = selectForecastsUrlAndOptions({
    request,
    forecastsApiUrl,
    optionsEphemeralProtected,
    options
  })
  return callAndHandleForecastsResponse(
    url,
    opts,
    catchFetchError,
    httpStatusOk,
    logger,
    errorResponse
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
  const host = request?.headers?.host
  if (!host) {
    return false
  }
  return host.includes('localhost') || host.includes('127.0.0.1')
}

function getEnvironmentName(request) {
  return request?.app?.config?.env || process.env.NODE_ENV || 'development'
}

function getEphemeralProtectedApiUrl(request, fallbackConfig = config) {
  const env = getEnvironmentName(request)
  const configSource = request?.app?.config || fallbackConfig

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
    return getValue('ephemeralProtectedTestApiUrl') || null
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
    opts: {
      ...optionsEphemeralProtected,
      headers: {
        ...optionsEphemeralProtected?.headers
      }
    }
  }
}

// Helper to select API URL and options for Ricardo measurements
function selectMeasurementsUrlAndOptions(latitude, longitude, di = {}) {
  const {
    config: apiConfig,
    logger,
    optionsEphemeralProtected,
    options,
    request
  } = di

  if (!config.get('isProduction')) {
    logger.info(
      `[URL BUILD DEBUG] Using measurements with latitude: ${latitude}, longitude: ${longitude}`
    )
  }

  const queryParams = buildMeasurementsQueryParams(latitude, longitude)
  const baseUrl = apiConfig.get('ricardoMeasurementsApiUrl')

  if (!config.get('isProduction')) {
    logger.info(`[URL BUILD DEBUG] Base URL from config: ${baseUrl}`)
    logger.info(`[URL BUILD DEBUG] Query params: ${queryParams.toString()}`)
  }

  const ricardoMeasurementsApiUrl = `${baseUrl}${queryParams.toString()}`

  if (!config.get('isProduction')) {
    logger.info(
      `[URL BUILD DEBUG] Full Ricardo measurements API URL: ${ricardoMeasurementsApiUrl}`
    )
  }

  const ephemeralUrl = getEphemeralProtectedApiUrl(request, apiConfig)
  if (isLocalRequest(request) && ephemeralUrl) {
    if (!config.get('isProduction')) {
      logger.info(
        '[URL BUILD DEBUG] Using LOCAL ephemeral measurements API URL'
      )
    }
    return buildLocalMeasurementsUrlAndOpts(
      queryParams,
      ephemeralUrl,
      optionsEphemeralProtected
    )
  }

  const result = buildRemoteMeasurementsUrlAndOpts(
    ricardoMeasurementsApiUrl,
    options
  )
  if (!config.get('isProduction')) {
    logger.info(`[URL BUILD DEBUG] Using REMOTE URL: ${result.url}`)
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
  optionsEphemeralProtected,
  shouldCallApi,
  catchProxyFetchError,
  httpStatusOk,
  logger,
  formatUKApiResponse
}) {
  const isLocal =
    String(osNamesApiUrlFull).includes('localhost') ||
    String(osNamesApiUrlFull).includes('127.0.0.1')
  const selectedOptions = isLocal ? optionsEphemeralProtected : options
  logger.info(
    `[DEBUG] Calling catchProxyFetchError with URL: ${osNamesApiUrlFull}`
  )
  logger.info('[DEBUG] Options:', JSON.stringify(selectedOptions))
  const [statusCodeOSPlace, getOSPlaces] = await catchProxyFetchError(
    osNamesApiUrlFull,
    selectedOptions,
    shouldCallApi
  )
  if (statusCodeOSPlace === httpStatusOk) {
    logger.info('getOSPlaces data fetched:')
    return formatUKApiResponse(getOSPlaces)
  }
  if (statusCodeOSPlace === STATUS_UNAUTHORIZED) {
    logger.warn(
      `OS Names API returned 401 (unauthorized). Check OS_NAMES_API_KEY. URL was suppressed in logs.`
    )
    return null
  }
  logger.error('Error fetching statusCodeOSPlace data:', statusCodeOSPlace)
  return null
}

export {
  callAndHandleForecastsResponse,
  callForecastsApi,
  selectForecastsUrlAndOptions,
  selectMeasurementsUrlAndOptions,
  callAndHandleMeasurementsResponse,
  buildAndCheckUKApiUrl,
  callAndHandleUKApiResponse
}
