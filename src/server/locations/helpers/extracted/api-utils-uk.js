import { STATUS_UNAUTHORIZED, STATUS_OK } from '../../../data/constants.js'

function getFirstTruthyValue(...values) {
  for (const value of values) {
    if (value) {
      return value
    }
  }

  return undefined
}

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

function resolveUkApiDependencies(input) {
  return {
    resolvedLogger: getFirstTruthyValue(input.logger, input.injectedLogger) || {
      info: () => {},
      warn: () => {},
      error: () => {}
    },
    resolvedOptions:
      getFirstTruthyValue(input.options, input.injectedOptions) || {},
    resolvedOptionsEphemeralProtected:
      getFirstTruthyValue(
        input.optionsEphemeralProtected,
        input.injectedOptionsEphemeralProtected
      ) || {},
    resolvedCatchProxyFetchError: getFirstTruthyValue(
      input.catchProxyFetchError,
      input.injectedCatchProxyFetchError
    ),
    resolvedHttpStatusOk: getFirstTruthyValue(
      input.httpStatusOk,
      input.injectedHttpStatusOk,
      STATUS_OK
    )
  }
}

function isLocalUrl(url) {
  const normalized = String(url)
  return normalized.includes('localhost') || normalized.includes('127.0.0.1')
}

function selectUkApiOptions(url, resolvedOptions, resolvedOptionsEphemeral) {
  return isLocalUrl(url) ? resolvedOptionsEphemeral : resolvedOptions
}

function handleUkApiStatusResponse(
  statusCodeOSPlace,
  resolvedHttpStatusOk,
  resolvedLogger,
  getOSPlaces,
  formatUKApiResponse
) {
  if (statusCodeOSPlace === resolvedHttpStatusOk) {
    resolvedLogger.info('getOSPlaces data fetched:')
    return formatUKApiResponse(getOSPlaces)
  }

  if (statusCodeOSPlace === STATUS_UNAUTHORIZED) {
    resolvedLogger.warn(
      'OS Names API returned 401 (unauthorized). Check OS_NAMES_API_KEY. URL was suppressed in logs.'
    )
    return null
  }

  resolvedLogger.error(
    'Error fetching statusCodeOSPlace data:',
    statusCodeOSPlace
  )
  return null
}

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
  const {
    resolvedLogger,
    resolvedOptions,
    resolvedOptionsEphemeralProtected,
    resolvedCatchProxyFetchError,
    resolvedHttpStatusOk
  } = resolveUkApiDependencies({
    options,
    injectedOptions,
    optionsEphemeralProtected,
    injectedOptionsEphemeralProtected,
    catchProxyFetchError,
    injectedCatchProxyFetchError,
    httpStatusOk,
    injectedHttpStatusOk,
    logger,
    injectedLogger
  })

  const selectedOptions = selectUkApiOptions(
    osNamesApiUrlFull,
    resolvedOptions,
    resolvedOptionsEphemeralProtected
  )

  resolvedLogger.info(
    `[DEBUG] Calling catchProxyFetchError with URL: ${osNamesApiUrlFull}`
  )
  resolvedLogger.info('[DEBUG] Options:', JSON.stringify(selectedOptions))

  const [statusCodeOSPlace, getOSPlaces] = await resolvedCatchProxyFetchError(
    osNamesApiUrlFull,
    selectedOptions,
    shouldCallApi
  )

  return handleUkApiStatusResponse(
    statusCodeOSPlace,
    resolvedHttpStatusOk,
    resolvedLogger,
    getOSPlaces,
    formatUKApiResponse
  )
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

export { buildAndCheckUKApiUrl, callAndHandleUKApiResponseCompat }
