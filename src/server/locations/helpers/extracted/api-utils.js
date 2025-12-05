// API utility helpers
import {
  STATUS_UNAUTHORIZED,
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
  const [forecastStatus, getForecasts] = await catchFetchError(
    url,
    opts
  )
  if (forecastStatus !== httpStatusOk) {
    logger.error(
      'Error fetching forecasts data: status code',
      forecastStatus
    )
    return errorResponse(
      'Forecasts fetch failed',
      forecastStatus || 500
    )
  }
  logger.info('Forecasts data fetched')

  return getForecasts
}

async function callForecastsApi({
  config,
  optionsEphemeralProtected,
  options,
  catchFetchError,
  httpStatusOk,
  logger,
  errorResponse,
  request
}) {
  const forecastsApiUrl = config.get('forecastsApiUrl')
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

// Helper to check if request is from localhost
function isLocalRequest(request) {
  if (!request || !request.headers || !request.headers.host) {
    return false
  }
  const host = request.headers.host
  return host.includes('localhost') || host.includes('127.0.0.1')
}

// Helper to get CDP API key from multiple sources
function getCdpApiKey(localOptionsEphemeralProtected) {
  if (
    localOptionsEphemeralProtected &&
    localOptionsEphemeralProtected.headers &&
    localOptionsEphemeralProtected.headers['x-api-key']
  ) {
    return localOptionsEphemeralProtected.headers['x-api-key']
  }
  if (typeof config !== 'undefined' && config.get) {
    const configKey = config.get('cdpXApiKey')
    if (configKey) return configKey
  }
  if (process && process.env && process.env.CDP_X_API_KEY) {
    return process.env.CDP_X_API_KEY
  }
  return null
}

// Helper to get ephemeral protected dev API URL
function getEphemeralDevApiUrl(request) {
  if (request && request.app && request.app.config) {
    return request.app.config.ephemeralProtectedDevApiUrl
  }
  if (typeof config !== 'undefined' && config.get) {
    return config.get('ephemeralProtectedDevApiUrl')
  }
  return null
}

// Helper to build local forecasts URL and options
function buildLocalForecastsUrlAndOpts(
  request,
  localOptionsEphemeralProtected
) {
  const ephemeralProtectedDevApiUrl = getEphemeralDevApiUrl(request)
  const cdpXApiKey = getCdpApiKey(localOptionsEphemeralProtected)
  
  if (!ephemeralProtectedDevApiUrl) {
    throw new Error(
      'ephemeralProtectedDevApiUrl must be provided in config for local requests'
    )
  }
  if (!FORECASTS_API_PATH) {
    throw new Error(
      'FORECASTS_API_PATH constant must be defined for local requests'
    )
  }
  
  const url = `${ephemeralProtectedDevApiUrl}${FORECASTS_API_PATH}`
  const opts = { ...localOptionsEphemeralProtected }
  opts.headers = {
    ...(opts.headers || {}),
    'x-api-key': cdpXApiKey
  }
  return { url, opts }
}

// Helper to build remote forecasts URL and options
function buildRemoteForecastsUrlAndOpts(forecastsApiUrl, localOptions) {
  return {
    url: forecastsApiUrl,
    opts: {
      ...localOptions,
      headers: {
        ...(localOptions.headers || {}),
        'Content-Type': 'application/json'
      }
    }
  }
}

// Helper to select the correct forecasts URL and options based on environment
function selectForecastsUrlAndOptions({
  request,
  forecastsApiUrl,
  optionsEphemeralProtected: localOptionsEphemeralProtected,
  options: localOptions
}) {
  if (isLocalRequest(request)) {
    return buildLocalForecastsUrlAndOpts(request, localOptionsEphemeralProtected)
  } else {
    return buildRemoteForecastsUrlAndOpts(forecastsApiUrl, localOptions)
  }
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

// Helper to build local measurements URL and options
function buildLocalMeasurementsUrlAndOpts(
  queryParams,
  config,
  optionsEphemeralProtected
) {
  const ephemeralProtectedDevApiUrl = config.get(
    'ephemeralProtectedDevApiUrl'
  )
  const measurementsApiPath = MEASUREMENTS_API_PATH || ''
  
  if (!ephemeralProtectedDevApiUrl) {
    throw new Error(
      'ephemeralProtectedDevApiUrl must be provided in config for local requests'
    )
  }
  if (!measurementsApiPath) {
    throw new Error(
      'MEASUREMENTS_API_PATH constant must be set for local requests'
    )
  }
  
  return {
    url: `${ephemeralProtectedDevApiUrl}${measurementsApiPath}${queryParams.toString()}`,
    opts: optionsEphemeralProtected
  }
}

// Helper to build remote measurements URL and options
function buildRemoteMeasurementsUrlAndOpts(url, options) {
  return {
    url,
    opts: {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Content-Type': 'application/json'
      }
    }
  }
}

// Helper to select API URL and options for new/old Ricardo measurements
function selectMeasurementsUrlAndOptions(
  latitude,
  longitude,
  useNewRicardoMeasurementsEnabled,
  di = {}
) {
  const {
    config,
    logger,
    optionsEphemeralProtected,
    options,
    request
  } = di
  
  if (useNewRicardoMeasurementsEnabled) {
    logger.info(
      `Using mock measurements with latitude: ${latitude}, longitude: ${longitude}`
    )
    
    const queryParams = buildMeasurementsQueryParams(latitude, longitude)
    const baseUrl = config.get('ricardoMeasurementsApiUrl')
    const newRicardoMeasurementsApiUrl = `${baseUrl}?${queryParams.toString()}`
    
    logger.info(
      `New Ricardo measurements API URL: ${newRicardoMeasurementsApiUrl}`
    )
    
    if (isLocalRequest(request)) {
      return buildLocalMeasurementsUrlAndOpts(
        queryParams,
        config,
        optionsEphemeralProtected
      )
    } else {
      return buildRemoteMeasurementsUrlAndOpts(
        newRicardoMeasurementsApiUrl,
        options
      )
    }
  } else {
    const measurementsAPIurl = config.get('measurementsApiUrl')
    logger.info(`Old measurements API URL: ${measurementsAPIurl}`)
    return buildRemoteMeasurementsUrlAndOpts(measurementsAPIurl, options)
  }
}

// Helper to call the measurements API and handle the response
async function callAndHandleMeasurementsResponse(
  url,
  opts,
  catchFetchError,
  logger
) {
  const [status, data] = await catchFetchError(url, opts)
  if (status !== 200) {
    logger.error(`Error fetching data: ${data && data.message}`)
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
async function callAndHandleUKApiResponse(
  osNamesApiUrlFull,
  options,
  optionsEphemeralProtected,
  shouldCallApi,
  catchProxyFetchError,
  httpStatusOk,
  logger,
  formatUKApiResponse
) {
  const isLocal =
    String(osNamesApiUrlFull).includes('localhost') ||
    String(osNamesApiUrlFull).includes('127.0.0.1')
  const selectedOptions = isLocal
    ? optionsEphemeralProtected
    : options
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
  } else {
    if (statusCodeOSPlace === STATUS_UNAUTHORIZED) {
      logger.warn(
        `OS Names API returned 401 (unauthorized). Check OS_NAMES_API_KEY. URL was suppressed in logs.`
      )
      return null
    } else {
      logger.error(
        'Error fetching statusCodeOSPlace data:',
        statusCodeOSPlace
      )
      return null
    }
  }
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
