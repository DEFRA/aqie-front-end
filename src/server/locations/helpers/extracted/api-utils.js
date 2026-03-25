// API utility helpers
import {
  STATUS_OK,
  STATUS_INTERNAL_SERVER_ERROR,
  FORECASTS_API_PATH,
  ROUND_OF_SIX,
  MEASUREMENTS_API_PATH
} from '../../../data/constants.js'
import { config } from '../../../../config/index.js'
import { buildRemoteRicardoMeasurementsUrl } from './api-utils-measurements.js'
export { buildAndCheckUKApiUrl } from './api-utils-uk.js'
export { callAndHandleUKApiResponseCompat as callAndHandleUKApiResponse } from './api-utils-uk.js'
async function callAndHandleForecastsResponse(
  url,
  opts,
  catchFetchError,
  httpStatusOk,
  logger,
  errorResponse
) {
  const [forecastStatus, getForecasts] = await catchFetchError(url, opts)
  if (forecastStatus !== httpStatusOk) {
    logger.error('Error fetching forecasts data: status code', forecastStatus)
    return errorResponse(
      'Forecasts fetch failed',
      forecastStatus || STATUS_INTERNAL_SERVER_ERROR
    )
  }
  logger.info('Forecasts data fetched')

  return getForecasts
}

function getFirstTruthyValue(...values) {
  for (const value of values) {
    if (value) {
      return value
    }
  }

  return undefined
}

function resolveForecastApiDependencies(params) {
  return {
    resolvedConfig: getFirstTruthyValue(params.config, params.injectedConfig),
    resolvedOptionsEphemeralProtected:
      getFirstTruthyValue(
        params.optionsEphemeralProtected,
        params.injectedOptionsEphemeralProtected
      ) || {},
    resolvedOptions:
      getFirstTruthyValue(params.options, params.injectedOptions) || {},
    resolvedCatchFetchError: getFirstTruthyValue(
      params.catchFetchError,
      params.injectedCatchFetchError
    ),
    resolvedHttpStatusOk: getFirstTruthyValue(
      params.httpStatusOk,
      params.injectedHttpStatusOk,
      STATUS_OK
    ),
    resolvedLogger: getFirstTruthyValue(params.logger, params.injectedLogger),
    resolvedErrorResponse: getFirstTruthyValue(
      params.errorResponse,
      params.injectedErrorResponse
    )
  }
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
  const {
    resolvedConfig,
    resolvedOptionsEphemeralProtected,
    resolvedOptions,
    resolvedCatchFetchError,
    resolvedHttpStatusOk,
    resolvedLogger,
    resolvedErrorResponse
  } = resolveForecastApiDependencies({
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
    injectedErrorResponse
  })

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

function getConfigGetter(configSource) {
  return (key) =>
    typeof configSource.get === 'function'
      ? configSource.get(key)
      : configSource?.[key]
}

function getEphemeralUrlKeysByEnv(env) {
  if (env === 'perf-test') {
    return ['ephemeralProtectedPerfTestApiUrl']
  }

  if (env === 'test') {
    return ['ephemeralProtectedTestApiUrl', 'ephemeralProtectedDevApiUrl']
  }

  return ['ephemeralProtectedTestApiUrl', 'ephemeralProtectedDevApiUrl']
}

function getFirstConfiguredValue(getValue, keys = []) {
  for (const key of keys) {
    const value = getValue(key)
    if (value) {
      return value
    }
  }

  return null
}

function getEphemeralProtectedApiUrl(request, fallbackConfig = config) {
  const resolvedRequest = request?.request || request
  const env = getEnvironmentName(request)
  const configSource = resolvedRequest?.app?.config || fallbackConfig

  if (!configSource) {
    return null
  }

  const getValue = getConfigGetter(configSource)
  const keys = getEphemeralUrlKeysByEnv(env)
  return getFirstConfiguredValue(getValue, keys)
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

function resolveMeasurementsSelectionInput(
  useNewRicardoMeasurementsEnabledOrDi,
  diOverride
) {
  if (typeof useNewRicardoMeasurementsEnabledOrDi === 'boolean') {
    return {
      useNewRicardoMeasurementsEnabled: useNewRicardoMeasurementsEnabledOrDi,
      di: diOverride || {}
    }
  }

  return {
    useNewRicardoMeasurementsEnabled: true,
    di: useNewRicardoMeasurementsEnabledOrDi || {}
  }
}

function resolveMeasurementsDependencies(di) {
  return {
    resolvedConfig: di.config || di.injectedConfig || config,
    resolvedLogger: di.injectedLogger ||
      di.logger || { info: () => {}, error: () => {} },
    resolvedOptionsEphemeralProtected:
      di.optionsEphemeralProtected ||
      di.injectedOptionsEphemeralProtected ||
      {},
    resolvedOptions: di.options || di.injectedOptions || {},
    request: di.request
  }
}

function buildNewRicardoMeasurementsSelection({
  latitude,
  longitude,
  resolvedConfig,
  resolvedLogger,
  resolvedOptionsEphemeralProtected,
  resolvedOptions,
  request,
  isProduction
}) {
  const queryParams = buildMeasurementsQueryParams(latitude, longitude)
  const queryString = queryParams.toString()
  const baseUrl = resolvedConfig.get('ricardoMeasurementsApiUrl')

  const ephemeralUrl = getEphemeralProtectedApiUrl(request, resolvedConfig)
  if (!isProduction && isLocalRequest(request) && ephemeralUrl) {
    const localResult = buildLocalMeasurementsUrlAndOpts(
      queryParams,
      ephemeralUrl,
      resolvedOptionsEphemeralProtected
    )
    resolvedLogger.info(`New Ricardo measurements API URL: ${localResult.url}`)
    return localResult
  }

  const newRicardoMeasurementsApiUrl = buildRemoteRicardoMeasurementsUrl(
    baseUrl,
    queryString
  )

  resolvedLogger.info(
    `New Ricardo measurements API URL: ${newRicardoMeasurementsApiUrl}`
  )

  return buildRemoteMeasurementsUrlAndOpts(
    newRicardoMeasurementsApiUrl,
    resolvedOptions
  )
}

function buildOldMeasurementsSelection(
  resolvedConfig,
  resolvedLogger,
  resolvedOptions
) {
  const measurementsAPIurl = resolvedConfig.get('measurementsApiUrl')
  resolvedLogger.info(`Old measurements API URL: ${measurementsAPIurl}`)
  return buildRemoteMeasurementsUrlAndOpts(measurementsAPIurl, resolvedOptions)
}

// Helper to select API URL and options for Ricardo measurements
function selectMeasurementsUrlAndOptions(
  latitude,
  longitude,
  useNewRicardoMeasurementsEnabledOrDi,
  diOverride
) {
  const { useNewRicardoMeasurementsEnabled, di } =
    resolveMeasurementsSelectionInput(
      useNewRicardoMeasurementsEnabledOrDi,
      diOverride
    )

  const {
    resolvedConfig,
    resolvedLogger,
    resolvedOptionsEphemeralProtected,
    resolvedOptions,
    request
  } = resolveMeasurementsDependencies(di)

  const isProduction = Boolean(config.get('isProduction'))

  if (!useNewRicardoMeasurementsEnabled) {
    return buildOldMeasurementsSelection(
      resolvedConfig,
      resolvedLogger,
      resolvedOptions
    )
  }

  return buildNewRicardoMeasurementsSelection({
    latitude,
    longitude,
    resolvedConfig,
    resolvedLogger,
    resolvedOptionsEphemeralProtected,
    resolvedOptions,
    request,
    isProduction
  })
}

// Helper to call the measurements API and handle the response
async function callAndHandleMeasurementsResponse(
  url,
  opts,
  catchFetchError,
  logger
) {
  const [status, data] = await catchFetchError(url, opts)

  if (status !== STATUS_OK) {
    logger.error(`Error fetching data: ${data?.message}`)
    return []
  }
  logger.info('Data fetched successfully.')
  return data || []
}

export {
  callAndHandleForecastsResponse,
  callForecastsApi,
  selectForecastsUrlAndOptions,
  selectMeasurementsUrlAndOptions,
  callAndHandleMeasurementsResponse
}
