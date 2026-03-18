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

function initializeRequestData(request) {
  const safeRequest = request || {}
  const query = safeRequest.query || {}
  const headers = safeRequest.headers || {}
  const locationId = safeRequest?.params?.id
  const searchTermsSaved = safeRequest?.yar?.get?.('searchTermsSaved')
  const currentUrl = safeRequest?.url?.href || ''
  const lang = query?.lang ?? LANG_EN
  const mocksDisabled = config.get('disableTestMocks')
  const mocksEnabled = !mocksDisabled

  if (mocksEnabled) {
    storeSessionParameter(safeRequest, 'mockLevel', query?.mockLevel)
    storeSessionParameter(safeRequest, 'mockDay', query?.mockDay)
    storeSessionParameter(
      safeRequest,
      'mockPollutantBand',
      query?.mockPollutantBand
    )

    if (query?.testMode !== undefined && safeRequest?.yar?.set) {
      safeRequest.yar.set('testMode', query.testMode)
    }
  } else {
    if (query?.mockLevel !== undefined) {
      logMocksDisabledWarning('Mock level')
    }
    if (query?.mockDay !== undefined) {
      logMocksDisabledWarning('Mock day')
    }
    if (query?.mockPollutantBand !== undefined) {
      logMocksDisabledWarning('Mock pollutant band')
    }
    if (query?.testMode !== undefined) {
      logMocksDisabledWarning('Test mode')
    }
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
