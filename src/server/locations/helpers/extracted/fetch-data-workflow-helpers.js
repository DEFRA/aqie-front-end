import {
  STATUS_BAD_REQUEST,
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK
} from '../../../data/constants.js'
import { buildNIOptionsOAuth } from './util-helpers.js'
import { handleTestModeFetchData } from './test-mode-helpers.js'

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
  const niDi = {
    ...di.overrides,
    request: diRequest || {},
    searchTerms,
    secondSearchTerm
  }
  const getNIPlaces = await di.handleNILocationData(
    userLocation,
    optionsOAuth,
    niDi
  )
  return getNIPlaces
}

function extractDailySummary(getForecasts) {
  let getDailySummary = getForecasts?.['forecast-summary']
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
    const getNIPlaces = await handleNILocation(
      userLocation,
      searchTerms,
      secondSearchTerm,
      optionsOAuth,
      deps,
      diRequest
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
