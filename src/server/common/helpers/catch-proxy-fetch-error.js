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
      statusCode = response.status
      if (!response.ok) {
        throw new Error(`HTTP error! status from ${url}: ${response.status}`)
      }
      const data = await response.json()
      return [statusCode, data]
    } catch (error) {
      logger.error(`Failed to proxyFetch data from ${url}: ${error.message}`)
      return [error]
    }
  }
  return [statusCode, WRONG_POSTCODE]
}

export { catchProxyFetchError }
