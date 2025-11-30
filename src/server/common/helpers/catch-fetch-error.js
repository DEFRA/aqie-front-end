import { createLogger } from './logging/logger.js'
const logger = createLogger()

const ACCEPT_ENCODING_IDENTITY = 'identity'
const CONTENT_TYPE_JSON = 'application/json'
const ERROR_UNABLE_TO_READ = '[unable to read response body]'
const STATUS_NETWORK_ERROR = 0

function buildSafeOptions(options) {
  const baseHeaders = options?.headers ? options.headers : {}
  const headers = {
    ...baseHeaders,
    'Accept-Encoding': ACCEPT_ENCODING_IDENTITY
  }
  return { ...options, headers }
}

async function getErrorText(response, url) {
  try {
    return await response.text()
  } catch (e) {
    logger.error(`Unable to read response body from ${url}:`, e)
    return ERROR_UNABLE_TO_READ
  }
}

async function handleErrorResponse(response, url, status) {
  const errorText = await getErrorText(response, url)
  logger.error(
    `Failed to fetch data from ${url}: status=${status}, body=${errorText}`
  )
  return [status, undefined]
}

async function parseJsonResponse(response, url, status) {
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
}

async function handleNonJsonResponse(response, status, contentType) {
  const text = await response.text()
  logger.error(`Unexpected content-type: ${contentType}, body: ${text}`)
  return [status, undefined]
}

async function processResponse(response, url) {
  const status = response.status
  const encoding = response.headers.get('content-encoding')
  logger.info(`Content-Encoding for ${url}: ${encoding}`)

  if (!response.ok) {
    return handleErrorResponse(response, url, status)
  }

  logger.info(`Response status for ${url}: ${status}`)
  logger.info(
    `Response headers for ${url}:`,
    Object.fromEntries(response.headers.entries())
  )

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes(CONTENT_TYPE_JSON)) {
    return parseJsonResponse(response, url, status)
  }

  return handleNonJsonResponse(response, status, contentType)
}

async function catchFetchError(url, options) {
  try {
    const safeOptions = buildSafeOptions(options)
    const startTime = performance.now()
    const date = new Date().toUTCString()
    const response = await fetch(url, safeOptions)
    const endTime = performance.now()
    const duration = endTime - startTime
    logger.info(`API from ${url} fetch took ${date} ${duration} milliseconds`)

    return processResponse(response, url)
  } catch (error) {
    logger.error(`Failed to fetch data from ${url}:`, error)
    return [STATUS_NETWORK_ERROR, undefined]
  }
}

export { catchFetchError }
