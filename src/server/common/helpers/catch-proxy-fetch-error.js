import { proxyFetch } from '~/src/helpers/proxy-fetch.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
const logger = createLogger()

async function catchProxyFetchError(url, options, shouldCallApi) {
  let statusCode = 500
  if (shouldCallApi) {
    try {
      const startTime = performance.now()
      const date = new Date().toUTCString()
      const response = await proxyFetch(url, options)
      const endTime = performance.now()
      const duration = endTime - startTime
      logger.info(`API from ${url} fetch took ${date} ${duration} milliseconds`)
      statusCode = response.status
      if (!response.ok) {
        logger.info(
          `Failed to fetch data from ${url}: ${JSON.stringify(response)}`
        )
        throw new Error(`HTTP error! status from ${url}: ${response.status}`)
      }
      const data = await response.json()
      return [statusCode, data]
    } catch (error) {
      logger.error(`Failed to proxyFetch data from ${url}: ${error.message}`)
      return [error]
    }
  }
  return [statusCode, 'wrong postcode']
}

export { catchProxyFetchError }
