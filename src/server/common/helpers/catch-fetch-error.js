import { createLogger } from './logging/logger.js'
const logger = createLogger()

async function catchFetchError(url, options) {
  try {
    // Force Accept-Encoding: identity for all requests to avoid decompression issues
    let safeOptions = options
    if (options && options.headers) {
      safeOptions = {
        ...options,
        headers: {
          ...options.headers,
          'Accept-Encoding': 'identity'
        }
      }
    } else {
      safeOptions = {
        ...options,
        headers: {
          'Accept-Encoding': 'identity'
        }
      }
    }
    const startTime = performance.now()
    const date = new Date().toUTCString()
    const response = await fetch(url, safeOptions)
    const endTime = performance.now()
    const duration = endTime - startTime
    const status = response.status
    if (!response.ok) {
      let errorText = ''
      try {
        errorText = await response.text()
      } catch (e) {
        errorText = '[unable to read response body]'
      }
      logger.error(
        `Failed to fetch data from ${url}: status=${status}, body=${errorText}`
      )
      return [status, undefined]
    }
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      try {
        const data = await response.json()
        if (typeof data === 'undefined') {
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
    logger.error(`Failed to fetch data from ${url}:`, error)
    return [0, undefined]
  }
}

export { catchFetchError }
