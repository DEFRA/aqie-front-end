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
  injectedCatchFetchError,
  injectedHttpStatusOk,
  injectedLogger,
  injectedErrorResponse
) {
  const [forecastStatus, getForecasts] = await injectedCatchFetchError(
    url,
    opts
  )
  if (forecastStatus !== injectedHttpStatusOk) {
    injectedLogger.error(
      'Error fetching forecasts data: status code',
      forecastStatus
    )
    return injectedErrorResponse(
      'Forecasts fetch failed',
      forecastStatus || 500
    )
  }
  injectedLogger.info('Forecasts data fetched')

  return getForecasts
}

async function callForecastsApi({
  injectedConfig,
  injectedOptionsEphemeralProtected,
  injectedOptions,
  injectedCatchFetchError,
  injectedHttpStatusOk,
  injectedLogger,
  injectedErrorResponse,
  request
}) {
  const forecastsApiUrl = injectedConfig.get('forecastsApiUrl')
  // ''
  const { url, opts } = selectForecastsUrlAndOptions({
    request,
    forecastsApiUrl,
    optionsEphemeralProtected: injectedOptionsEphemeralProtected,
    options: injectedOptions
  })
  return callAndHandleForecastsResponse(
    url,
    opts,
    injectedCatchFetchError,
    injectedHttpStatusOk,
    injectedLogger,
    injectedErrorResponse
  )
}

// Helper to select the correct forecasts URL and options based on environment
function selectForecastsUrlAndOptions({
  request,
  forecastsApiUrl,
  optionsEphemeralProtected: localOptionsEphemeralProtected,
  options: localOptions
}) {
  // Only use the request object to determine if the call is local
  let isLocal = false
  if (request && request.headers && request.headers.host) {
    const host = request.headers.host
    isLocal = host.includes('localhost') || host.includes('127.0.0.1')
  }
  let url, opts
  if (isLocal) {
    let cdpXApiKey
    const ephemeralProtectedDevApiUrl =
      request && request.app && request.app.config
        ? request.app.config.ephemeralProtectedDevApiUrl
        : typeof config !== 'undefined' &&
          config.get &&
          config.get('ephemeralProtectedDevApiUrl')
    // fallback: try process.env for cdpXApiKey
    if (
      localOptionsEphemeralProtected &&
      localOptionsEphemeralProtected.headers &&
      localOptionsEphemeralProtected.headers['x-api-key']
    ) {
      cdpXApiKey = localOptionsEphemeralProtected.headers['x-api-key']
    }
    if (!cdpXApiKey && typeof config !== 'undefined') {
      cdpXApiKey = config.get && config.get('cdpXApiKey')
    }
    if (!cdpXApiKey && process && process.env && process.env.CDP_X_API_KEY) {
      cdpXApiKey = process.env.CDP_X_API_KEY
    }
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
    url = `${ephemeralProtectedDevApiUrl}${FORECASTS_API_PATH}`
    opts = { ...localOptionsEphemeralProtected }
    opts.headers = {
      ...(opts.headers || {}),
      'x-api-key': cdpXApiKey
    }
  } else {
    url = forecastsApiUrl
    opts = { ...localOptions }
    // For remote, always set Content-Type: application/json
    opts.headers = {
      ...(opts.headers || {}),
      'Content-Type': 'application/json'
    }
  }
  return {
    url,
    opts
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
    injectedConfig,
    injectedLogger,
    injectedOptionsEphemeralProtected,
    injectedOptions,
    request
  } = di
  const formatCoordinate = (coord) => Number(coord).toFixed(ROUND_OF_SIX)
  if (useNewRicardoMeasurementsEnabled) {
    injectedLogger.info(
      `Using mock measurements with latitude: ${latitude}, longitude: ${longitude}`
    )
    if (!URLSearchParams) {
      throw new Error('URLSearchParams is not available in this environment')
    }
    const queryParams = new URLSearchParams({
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
    const baseUrl = injectedConfig.get('ricardoMeasurementsApiUrl')
    const newRicardoMeasurementsApiUrl = `${baseUrl}?${queryParams.toString()}`
    injectedLogger.info(
      `New Ricardo measurements API URL: ${newRicardoMeasurementsApiUrl}`
    )
    let isLocal = false
    if (request && request.headers && request.headers.host) {
      const host = request.headers.host
      isLocal = host.includes('localhost') || host.includes('127.0.0.1')
    }
    if (isLocal) {
      const ephemeralProtectedDevApiUrl = injectedConfig.get(
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
        opts: injectedOptionsEphemeralProtected
      }
    } else {
      // For remote, always set Content-Type: application/json
      const remoteHeaders = {
        ...(injectedOptions.headers || {}),
        'Content-Type': 'application/json'
      }
      return {
        url: newRicardoMeasurementsApiUrl,
        opts: { ...injectedOptions, headers: remoteHeaders }
      }
    }
  } else {
    const measurementsAPIurl = injectedConfig.get('measurementsApiUrl')
    injectedLogger.info(`Old measurements API URL: ${measurementsAPIurl}`)
    // For remote, always set Content-Type: application/json
    const remoteHeaders = {
      ...(injectedOptions.headers || {}),
      'Content-Type': 'application/json'
    }
    return {
      url: measurementsAPIurl,
      opts: { ...injectedOptions, headers: remoteHeaders }
    }
  }
}

// Helper to call the measurements API and handle the response
async function callAndHandleMeasurementsResponse(
  url,
  opts,
  injectedCatchFetchError,
  injectedLogger
) {
  const [status, data] = await injectedCatchFetchError(url, opts)
  if (status !== 200) {
    injectedLogger.error(`Error fetching data: ${data && data.message}`)
    return []
  }
  injectedLogger.info('Data fetched successfully.')
  return data || []
}

// Helper to build the UK API URL and check for API key
function buildAndCheckUKApiUrl(
  userLocation,
  searchTerms,
  secondSearchTerm,
  injected
) {
  const filters = injected.buildUKLocationFilters()
  const osNamesApiUrl = injected.config.get('osNamesApiUrl')
  const osNamesApiKey = injected.config.get('osNamesApiKey')
  const hasOsKey = Boolean(osNamesApiKey && String(osNamesApiKey).trim() !== '')
  const combinedLocation = injected.combineUKSearchTerms(
    userLocation,
    searchTerms,
    secondSearchTerm,
    injected.isValidFullPostcodeUK,
    injected.isValidPartialPostcodeUK
  )
  const osNamesApiUrlFull = injected.buildUKApiUrl(
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
  injectedOptions,
  injectedOptionsEphemeralProtected,
  shouldCallApi,
  injectedCatchProxyFetchError,
  injectedHttpStatusOk,
  injectedLogger,
  injectedFormatUKApiResponse
) {
  const isLocal =
    String(osNamesApiUrlFull).includes('localhost') ||
    String(osNamesApiUrlFull).includes('127.0.0.1')
  const selectedOptions = isLocal
    ? injectedOptionsEphemeralProtected
    : injectedOptions
  injectedLogger.info(
    `[DEBUG] Calling catchProxyFetchError with URL: ${osNamesApiUrlFull}`
  )
  injectedLogger.info('[DEBUG] Options:', JSON.stringify(selectedOptions))
  const [statusCodeOSPlace, getOSPlaces] = await injectedCatchProxyFetchError(
    osNamesApiUrlFull,
    selectedOptions,
    shouldCallApi
  )
  if (statusCodeOSPlace === injectedHttpStatusOk) {
    injectedLogger.info('getOSPlaces data fetched:')
    return injectedFormatUKApiResponse(getOSPlaces)
  } else {
    if (statusCodeOSPlace === STATUS_UNAUTHORIZED) {
      injectedLogger.warn(
        `OS Names API returned 401 (unauthorized). Check OS_NAMES_API_KEY. URL was suppressed in logs.`
      )
      return null
    } else {
      injectedLogger.error(
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
