import {
  STATUS_BAD_REQUEST,
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK
} from '../../../data/constants.js'
import { buildNIOptionsOAuth } from './util-helpers.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { handleTestModeFetchData } from './test-mode-helpers.js'

const logger = createLogger()

async function handleUKLocation(
  userLocation,
  searchTerms,
  secondSearchTerm,
  di,
  diRequest
) {
  const ukDi = {
    ...di.overrides,
    request: diRequest || {},
    buildUKLocationFilters: di.buildUKLocationFilters,
    combineUKSearchTerms: di.combineUKSearchTerms,
    isValidFullPostcodeUK: di.isValidFullPostcodeUK,
    isValidPartialPostcodeUK: di.isValidPartialPostcodeUK,
    buildUKApiUrl: di.buildUKApiUrl,
    shouldCallUKApi: (...args) => di.shouldCallUKApi(...args),
    config: di.config,
    searchTerms,
    secondSearchTerm
  }
  const osPlacesResult =
    typeof di.handleUKLocationData === 'function' &&
    di.handleUKLocationData.length <= 2
      ? await di.handleUKLocationData(userLocation, ukDi)
      : await di.handleUKLocationData(
          userLocation,
          searchTerms,
          secondSearchTerm,
          ukDi
        )
  return osPlacesResult
}

async function handleNILocation(
  userLocation,
  searchTerms,
  secondSearchTerm,
  optionsOAuth,
  di,
  diRequest
) {
  const niDi = { ...di.overrides, request: diRequest || {} }
  const getNIPlaces = await di.handleNILocationData(
    userLocation,
    optionsOAuth,
    niDi
  )
  return getNIPlaces
}

function extractDailySummary(getForecasts) {
  let getDailySummary = getForecasts?.['forecast-summary']
  logger.info(`[DEBUG FORECAST] forecast-summary exists: ${!!getDailySummary}`)
  logger.info(
    `[DEBUG FORECAST] getForecasts keys: ${Object.keys(getForecasts || {}).join(', ')}`
  )
  if (!getDailySummary || typeof getDailySummary !== 'object') {
    getDailySummary = { today: null }
  }
  return getDailySummary
}

async function buildOAuthForNI(locationType, deps, request) {
  if (locationType !== LOCATION_TYPE_NI) {
    return null
  }
  const niOptions = await buildNIOptionsOAuth({
    request,
    isMockEnabled: deps.isMockEnabled,
    refreshOAuthTokenFn: deps.refreshOAuthToken
  })
  return niOptions.optionsOAuth
}

async function fetchAndExtractForecasts(deps, diRequest, diOverrides) {
  const getForecasts = await deps.fetchForecasts({
    ...diOverrides,
    request: diRequest
  })
  const getDailySummary = extractDailySummary(getForecasts)
  const logInfo =
    typeof deps.logger?.info === 'function'
      ? deps.logger.info.bind(deps.logger)
      : logger.info.bind(logger)
  logInfo(
    `[DEBUG issue_date] received from forecasts: ${getDailySummary?.issue_date ?? 'N/A'}`,
    {
      issueDate: getDailySummary?.issue_date,
      requestPath: diRequest?.path,
      requestId: diRequest?.info?.id
    }
  )
  return { getForecasts, getDailySummary }
}

const routeFetchDataByLocationType = async ({
  locationType,
  userLocation,
  searchTerms,
  secondSearchTerm,
  optionsOAuth,
  deps,
  diRequest,
  getDailySummary,
  getForecasts,
  diOverrides
}) => {
  if (deps.isTestMode()) {
    return handleTestModeFetchData({
      locationType,
      userLocation,
      searchTerms,
      secondSearchTerm,
      optionsOAuth,
      getDailySummary,
      getForecasts,
      injectedHandleUKLocationData: deps.handleUKLocationData,
      injectedHandleNILocationData: deps.handleNILocationData,
      injectedLogger: deps.logger,
      injectedErrorResponse: deps.errorResponse,
      args: diOverrides
    })
  }

  if (locationType === LOCATION_TYPE_UK) {
    const osPlacesResult = await handleUKLocation(
      userLocation,
      searchTerms,
      secondSearchTerm,
      deps,
      diRequest
    )
    return { getDailySummary, getForecasts, getOSPlaces: osPlacesResult }
  }

  if (locationType === LOCATION_TYPE_NI) {
    logger.info(
      `[FETCH DATA] Step 4: Calling NI Places API for ${userLocation}...`
    )
    const getNIPlaces = await handleNILocation(
      userLocation,
      searchTerms,
      secondSearchTerm,
      optionsOAuth,
      deps,
      diRequest
    )
    logger.info(
      `[FETCH DATA] Step 5: NI Places API complete. Results: ${getNIPlaces?.results?.length ?? 0}`
    )
    return { getDailySummary, getForecasts, getNIPlaces }
  }

  deps.logger.error('Unsupported location type provided:', locationType)
  return deps.errorResponse(
    'Unsupported location type provided',
    STATUS_BAD_REQUEST
  )
}

export {
  buildOAuthForNI,
  fetchAndExtractForecasts,
  routeFetchDataByLocationType
}
