import { createLogger } from './logging/logger.js'
const logger = createLogger()

async function catchFetchError(url, options) {
  try {
    const startTime = performance.now()
    const date = new Date().toUTCString()
    const response = await fetch(url, options)
    const endTime = performance.now()
    const duration = endTime - startTime
    logger.info(`API from ${url} fetch took ${date} ${duration} milliseconds`)
    const status = response.status
    if (!response.ok) {
      logger.info(
        `Failed to fetch data from ${url}: ${JSON.stringify(response)}`
      )
      return [status, undefined]
    }
    const data = await response.json()
    return [status, data]
  } catch (error) {
    logger.error(`Failed to fetch data from ${url}: ${error.message}`)
    // Return 0 as status code for network or unexpected errors
    return [0, undefined]
  }
}

export { catchFetchError }
