import { createLogger } from './logging/logger.js'
const logger = createLogger()

async function catchFetchError(url, options) {
  try {
    // Force Accept-Encoding: identity for all requests to avoid decompression issues
    const safeOptions = options?.headers
      ? {
          ...options,
          headers: {
            ...options.headers,
            'Accept-Encoding': 'identity'
          }
        }
      : {
          ...options,
          headers: {
            'Accept-Encoding': 'identity'
          }
        }
    const startTime = performance.now()
    const date = new Date().toUTCString()
    const response = await fetch(url, safeOptions)
    const endTime = performance.now()
    const duration = endTime - startTime
    logger.info(`API from ${url} fetch took ${date} ${duration} milliseconds`)
    const status = response.status
    // Log the content-encoding header for debugging
    const encoding = response.headers.get('content-encoding')
    logger.info(`Content-Encoding for ${url}: ${encoding}`)
    if (!response.ok) {
      let errorText = ''
      try {
        errorText = await response.text()
      } catch (e) {
        // Log the error when unable to read response body
        logger.error(`Unable to read response body from ${url}:`, e)
        errorText = '[unable to read response body]'
      }
      logger.error(
        `Failed to fetch data from ${url}: status=${status}, body=${errorText}`
      )
      return [status, undefined]
    }
    // Log all response headers and status for debugging
    logger.info(`Response status for ${url}: ${status}`)
    logger.info(
      `Response headers for ${url}:`,
      Object.fromEntries(response.headers.entries())
    )
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      try {
        const data = await response.json()
        if (data === undefined) {
          logger.error(`Parsed JSON is undefined from ${url}`)
        }
        return [status, data]
      } catch (jsonError) {
        logger.error(`Failed to parse JSON from ${url}:`, jsonError)
        const text = await response.text()
        logger.error(`Raw response body: ${text}`)
        return [status, undefined]
      }
    } else {
      const text = await response.text()
      logger.error(`Unexpected content-type: ${contentType}, body: ${text}`)
      return [status, undefined]
    }
  } catch (error) {
    // Log full error object for better debugging (e.g., Z_DATA_ERROR)
    logger.error(`Failed to fetch data from ${url}:`, error)
    // Return 0 as status code for network or unexpected errors
    return [0, undefined]
  }
}

export { catchFetchError }
