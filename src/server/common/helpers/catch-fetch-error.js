import { createLogger } from '~/src/server/common/helpers/logging/logger'
const logger = createLogger()

async function catchFetchError(url, options) {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      logger.info(
        `Failed to fetch data from ${url}: ${JSON.stringify(response)}`
      )
      throw new Error(`HTTP error! status from ${url}: ${response.status}`)
    }
    const data = await response.json()
    return [undefined, data]
  } catch (error) {
    logger.error(`Failed to fetch data from ${url}: ${error.message}`)
    return [error]
  }
}

export { catchFetchError }
