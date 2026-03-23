import { proxyFetch } from '../../../server/common/helpers/proxy.js'
import { createLogger } from '../../../server/common/helpers/logging/logger.js'
import { WRONG_POSTCODE } from '../../data/constants.js'
const logger = createLogger()

const DEFAULT_STATUS_CODE = 200
const HTTP_STATUS_NO_CONTENT = 204
const HTTP_STATUS_NOT_FOUND = 404

const logProxyFetchTiming = (url, response, startTime) => {
  const date = new Date().toUTCString()
  const duration = performance.now() - startTime
  logger.info(
    `API response.status: ${response.status} from ${url} fetch took ${date} ${duration} milliseconds`
  )
}

const isResponseBodyEmpty = (response) => {
  const contentLength = response.headers.get('content-length')
  return response.status === HTTP_STATUS_NO_CONTENT || contentLength === '0'
}

const getProxyFetchErrorResult = (statusCode) => {
  if (statusCode && statusCode !== DEFAULT_STATUS_CODE) {
    return [
      statusCode,
      statusCode === HTTP_STATUS_NOT_FOUND
        ? WRONG_POSTCODE
        : { error: 'service-unavailable' }
    ]
  }
  return [null, { error: 'service-unavailable' }]
}

const logProxyFetchError = (url, error) => {
  const isAbortError = error.name === 'AbortError'
  const errorMsg = isAbortError ? 'Request timeout/aborted' : error.message
  logger.error(
    `Failed to proxyFetch data from ${url}: ${errorMsg}${isAbortError ? ' (timeout)' : ''}`
  )
}

async function catchProxyFetchError(url, options, shouldCallApi) {
  let statusCode = DEFAULT_STATUS_CODE
  if (!shouldCallApi) {
    return [statusCode, WRONG_POSTCODE]
  }

  try {
    const startTime = performance.now()
    const response = await proxyFetch(url, options)
    logProxyFetchTiming(url, response, startTime)
    statusCode = response.status

    if (!response.ok) {
      logger.info(
        `Failed to fetch data from ${url}: ${JSON.stringify(response)}`
      )
      throw new Error(`HTTP error! status from ${url}: ${response.status}`)
    }

    if (isResponseBodyEmpty(response)) {
      return [statusCode, null]
    }

    const data = await response.json()
    return [statusCode, data]
  } catch (error) {
    logProxyFetchError(url, error)
    return getProxyFetchErrorResult(statusCode)
  }
}

export { catchProxyFetchError }
