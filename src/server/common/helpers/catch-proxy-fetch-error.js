import { proxyFetch } from '~/src/helpers/proxy-fetch.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
const logger = createLogger()

async function catchProxyFetchError(url, options, shouldCallApi) {
  if (shouldCallApi) {
    try {
      const response = await proxyFetch(url, options)
      if (!response.ok) {
        logger.info(
          `Failed to fetch data from ${url}: ${JSON.stringify(response)}`
        )
        throw new Error(`HTTP error! status from ${url}: ${response.status}`)
      }
      const data = await response.json()
      return [undefined, data]
    } catch (error) {
      logger.error(`Failed to proxyFetch data from ${url}: ${error.message}`)
      return [error]
    }
  }
  return [undefined, undefined]
}

export { catchProxyFetchError }
