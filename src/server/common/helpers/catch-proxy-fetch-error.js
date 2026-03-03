import { proxyFetch } from '../../../server/common/helpers/proxy.js'
import { createLogger } from '../../../server/common/helpers/logging/logger.js'
import { WRONG_POSTCODE } from '../../data/constants.js'
const logger = createLogger()

async function catchProxyFetchError(url, options, shouldCallApi) {
  let statusCode = 200
  if (shouldCallApi) {
    try {
      const startTime = performance.now()
      const date = new Date().toUTCString()
      const response = await proxyFetch(url, options)
      const endTime = performance.now()
      const duration = endTime - startTime
      logger.info(
        `API response.status: ${response.status} from ${url} fetch took ${date} ${duration} milliseconds`
      )
      statusCode = response.status
      if (!response.ok) {
        logger.info(
          `Failed to fetch data from ${url}: ${JSON.stringify(response)}`
        )
        throw new Error(`HTTP error! status from ${url}: ${response.status}`)
      }
      // '' Skip JSON parsing for 204/empty bodies to avoid parse errors
      const contentLength = response.headers.get('content-length')
      const isEmptyBody = response.status === 204 || contentLength === '0'
      if (isEmptyBody) {
        return [statusCode, null]
      }

      const data = await response.json()
      return [statusCode, data]
    } catch (error) {
      // '' Check if error is due to timeout/abort
      const isAbortError = error.name === 'AbortError'
      const errorMsg = isAbortError ? 'Request timeout/aborted' : error.message

      logger.error(
        `Failed to proxyFetch data from ${url}: ${errorMsg}${isAbortError ? ' (timeout)' : ''}`
      )

      // '' Differentiate between bad postcode (404) and upstream failure
      if (statusCode && statusCode !== 200) {
        const isNotFound = statusCode === 404
        return [
          statusCode,
          isNotFound ? WRONG_POSTCODE : { error: 'service-unavailable' }
        ]
      }
      return [null, { error: 'service-unavailable' }]
    }
  }
  return [statusCode, WRONG_POSTCODE]
}

export { catchProxyFetchError }
