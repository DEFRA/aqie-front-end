import { createLogger } from '../../common/helpers/logging/logger.js'
import { LANG_EN } from '../../data/constants.js'
import { config } from '../../../config/index.js'

const logger = createLogger()

function storeSessionParameter(request, paramName, paramValue) {
  if (!request?.yar?.set) {
    return
  }

  if (paramValue !== undefined) {
    if (paramValue === '' || paramValue === 'clear') {
      request.yar.set(paramName, null)
    } else {
      request.yar.set(paramName, paramValue)
    }
  }
}

function logMocksDisabledWarning(paramLabel) {
  logger.warn(
    `Attempted to set ${paramLabel.toLowerCase()} when mocks disabled (disableTestMocks=true) - ignoring parameter`
  )
}

function getLocationIdFromRequest(request) {
  return request && request.params ? request.params.id : undefined
}

function getSearchTermsSavedFromRequest(request) {
  if (!request || !request.yar || typeof request.yar.get !== 'function') {
    return undefined
  }

  return request.yar.get('searchTermsSaved')
}

function getCurrentUrlFromRequest(request) {
  return request && request.url && request.url.href ? request.url.href : ''
}

function getRequestContext(request) {
  const safeRequest = request || {}
  const query = safeRequest.query || {}
  const headers = safeRequest.headers || {}
  const locationId = getLocationIdFromRequest(safeRequest)
  const searchTermsSaved = getSearchTermsSavedFromRequest(safeRequest)
  const currentUrl = getCurrentUrlFromRequest(safeRequest)
  const lang = query.lang ?? LANG_EN

  return {
    safeRequest,
    query,
    headers,
    locationId,
    searchTermsSaved,
    currentUrl,
    lang
  }
}

function hasYarSet(request) {
  return Boolean(request && request.yar && typeof request.yar.set === 'function')
}

function applyMockSessionValues(request, query) {
  storeSessionParameter(request, 'mockLevel', query.mockLevel)
  storeSessionParameter(request, 'mockDay', query.mockDay)
  storeSessionParameter(request, 'mockPollutantBand', query.mockPollutantBand)

  if (query.testMode !== undefined && hasYarSet(request)) {
    request.yar.set('testMode', query.testMode)
  }
}

function warnForIgnoredMockParams(query) {
  const mockParamChecks = [
    { key: 'mockLevel', label: 'Mock level' },
    { key: 'mockDay', label: 'Mock day' },
    { key: 'mockPollutantBand', label: 'Mock pollutant band' },
    { key: 'testMode', label: 'Test mode' }
  ]

  mockParamChecks.forEach(({ key, label }) => {
    if (query[key] !== undefined) {
      logMocksDisabledWarning(label)
    }
  })
}

function initializeRequestData(request) {
  const {
    safeRequest,
    query,
    headers,
    locationId,
    searchTermsSaved,
    currentUrl,
    lang
  } = getRequestContext(request)
  const mocksDisabled = config.get('disableTestMocks')
  const mocksEnabled = !mocksDisabled

  if (mocksEnabled) {
    applyMockSessionValues(safeRequest, query)
  } else {
    warnForIgnoredMockParams(query)
  }

  return {
    query,
    headers,
    locationId,
    searchTermsSaved,
    currentUrl,
    lang
  }
}

export { initializeRequestData }
