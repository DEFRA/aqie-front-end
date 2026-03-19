import { config } from '../../../../config/index.js'
import { catchFetchError } from '../../../common/helpers/catch-fetch-error.js'
import {
  STATUS_OK,
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK
} from '../../../data/constants.js'
import { selectMeasurementsUrlAndOptions } from './api-utils.js'
import {
  isTestMode,
  errorResponse,
  validateParams,
  isMockEnabled,
  combineUKSearchTerms,
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  buildUKApiUrl,
  shouldCallUKApi,
  buildUKLocationFilters
} from '../location-helpers.js'
import {
  handleUKLocationData as localHandleUKLocationData,
  handleNILocationData as localHandleNILocationData,
  refreshOAuthToken as localRefreshOAuthToken
} from './util-helpers.js'

const getFirstConfigValue = (configInstance, keys = []) => {
  for (const key of keys) {
    const value = configInstance.get(key)
    if (value) {
      return value
    }
  }
  return null
}

const getApiKeyCandidatesByEnv = (env) => {
  if (env === 'perf-test') {
    return ['cdpXApiKeyPerfTest', 'cdpXApiKey']
  }
  if (env === 'test') {
    return ['cdpXApiKeyTest', 'cdpXApiKey']
  }
  return ['cdpXApiKeyTest', 'cdpXApiKeyDev', 'cdpXApiKey']
}

const getOverrideOrDefault = (overrides, key, fallback) => {
  if (overrides?.[key]) {
    return overrides[key]
  }
  return fallback
}

function buildApiOptions(request) {
  const env = request?.app?.config?.env || process.env.NODE_ENV
  const cdpXApiKey = getFirstConfigValue(config, getApiKeyCandidatesByEnv(env))

  if (cdpXApiKey) {
    return { headers: { 'x-api-key': cdpXApiKey } }
  }
  return {}
}

function ensureForecastSummary(forecastData) {
  if (
    forecastData &&
    typeof forecastData === 'object' &&
    !('forecast-summary' in forecastData)
  ) {
    forecastData['forecast-summary'] = { today: null }
  }
  return forecastData
}

const resolveMeasurementsInputs = (
  useNewRicardoMeasurementsEnabledOrDi,
  diOverride
) => {
  const isLegacySignature =
    typeof useNewRicardoMeasurementsEnabledOrDi === 'boolean'
  const di =
    isLegacySignature && diOverride
      ? diOverride
      : useNewRicardoMeasurementsEnabledOrDi || {}
  const useNewRicardoMeasurementsEnabled = isLegacySignature
    ? useNewRicardoMeasurementsEnabledOrDi
    : true

  return {
    isLegacySignature,
    di,
    useNewRicardoMeasurementsEnabled
  }
}

const resolveMeasurementsDependencies = ({ di, logger }) => ({
  logger: di.logger || logger,
  config: di.config || config,
  catchFetchError: di.catchFetchError || catchFetchError,
  optionsEphemeralProtected:
    di.optionsEphemeralProtected || buildApiOptions(di.request),
  options: di.options || {},
  isTestMode: typeof di.isTestMode === 'function' ? di.isTestMode : isTestMode
})

const selectMeasurementsRequestData = ({
  latitude,
  longitude,
  useNewRicardoMeasurementsEnabled,
  deps,
  di,
  isLegacySignature
}) => {
  try {
    const selection = selectMeasurementsUrlAndOptions(
      latitude,
      longitude,
      useNewRicardoMeasurementsEnabled,
      {
        config: deps.config,
        logger: deps.logger,
        optionsEphemeralProtected: deps.optionsEphemeralProtected,
        options: deps.options,
        request: di.request
      }
    )

    return { url: selection.url, opts: selection.opts }
  } catch (err) {
    if (
      isLegacySignature &&
      String(err?.message || '').includes('config fail')
    ) {
      throw err
    }
    deps.logger.error(`Unexpected error in fetchMeasurements: ${err.message}`)
    return null
  }
}

function setupDependencies(diOverrides, context) {
  const overrides = diOverrides || {}
  const { fetchForecasts, logger } = context

  return {
    fetchForecasts: getOverrideOrDefault(
      overrides,
      'fetchForecasts',
      fetchForecasts
    ),
    handleUKLocationData: getOverrideOrDefault(
      overrides,
      'handleUKLocationData',
      localHandleUKLocationData
    ),
    handleNILocationData: getOverrideOrDefault(
      overrides,
      'handleNILocationData',
      localHandleNILocationData
    ),
    isTestMode: getOverrideOrDefault(overrides, 'isTestMode', isTestMode),
    validateParams: getOverrideOrDefault(
      overrides,
      'validateParams',
      validateParams
    ),
    logger: getOverrideOrDefault(overrides, 'logger', logger),
    errorResponse: getOverrideOrDefault(
      overrides,
      'errorResponse',
      errorResponse
    ),
    isMockEnabled: getOverrideOrDefault(
      overrides,
      'isMockEnabled',
      isMockEnabled
    ),
    refreshOAuthToken: getOverrideOrDefault(
      overrides,
      'refreshOAuthToken',
      localRefreshOAuthToken
    ),
    buildUKLocationFilters: getOverrideOrDefault(
      overrides,
      'buildUKLocationFilters',
      buildUKLocationFilters
    ),
    combineUKSearchTerms: getOverrideOrDefault(
      overrides,
      'combineUKSearchTerms',
      combineUKSearchTerms
    ),
    isValidFullPostcodeUK: getOverrideOrDefault(
      overrides,
      'isValidFullPostcodeUK',
      isValidFullPostcodeUK
    ),
    isValidPartialPostcodeUK: getOverrideOrDefault(
      overrides,
      'isValidPartialPostcodeUK',
      isValidPartialPostcodeUK
    ),
    buildUKApiUrl: getOverrideOrDefault(
      overrides,
      'buildUKApiUrl',
      buildUKApiUrl
    ),
    shouldCallUKApi: getOverrideOrDefault(
      overrides,
      'shouldCallUKApi',
      shouldCallUKApi
    ),
    config: getOverrideOrDefault(overrides, 'config', config),
    // Shared constants used by routing helpers
    locationTypeNi: LOCATION_TYPE_NI,
    locationTypeUk: LOCATION_TYPE_UK,
    statusOk: STATUS_OK
  }
}

export {
  buildApiOptions,
  ensureForecastSummary,
  getOverrideOrDefault,
  resolveMeasurementsInputs,
  resolveMeasurementsDependencies,
  selectMeasurementsRequestData,
  setupDependencies
}
