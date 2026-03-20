import { createLogger } from './logging/logger.js'
import { config } from '../../../config/index.js'

const logger = createLogger()
const DEFAULT_RETRY_DELAY_MS = 500

/**
 * Creates an AbortController that times out after specified milliseconds
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {AbortController}
 */
function createTimeoutController(timeoutMs) {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)
  return controller
}

/**
 * Delays execution for specified milliseconds
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRetrySettings(options = {}) {
  return {
    maxRetries: options.maxRetries ?? config.get('niApiMaxRetries') ?? 2,
    retryDelayMs:
      options.retryDelayMs ??
      config.get('niApiRetryDelayMs') ??
      DEFAULT_RETRY_DELAY_MS,
    timeoutMs: options.timeoutMs ?? config.get('niApiTimeoutMs') ?? 10000,
    operationName: options.operationName ?? 'API call'
  }
}

function getAttemptLog(attempt = 0, maxRetries = 0) {
  return attempt > 0 ? ` (attempt ${attempt + 1}/${maxRetries + 1})` : ''
}

function getErrorType(error) {
  const isTimeout = error?.message?.includes('Timeout')
  const isAbortError = error?.name === 'AbortError'
  return isTimeout || isAbortError ? 'timeout' : 'error'
}

function hasRemainingRetries(attempt = 0, maxRetries = 0) {
  return attempt <= maxRetries
}

function getBackoffDelay(retryDelayMs = 0, attempt = 1) {
  const jitterMs = Math.floor(Math.random() * Math.max(1, retryDelayMs / 4))
  return {
    jitterMs,
    backoffDelay: retryDelayMs * attempt + jitterMs
  }
}

async function runAttemptWithTimeout(fetchFn, timeoutMs) {
  const controller = createTimeoutController(timeoutMs)
  const startTime = performance.now()
  const result = await Promise.race([
    fetchFn(controller),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    )
  ])
  const duration = performance.now() - startTime
  return { result, duration }
}

/**
 * Fetches with retry logic and timeout support
 * @param {Function} fetchFn - The fetch function to execute (should return a Promise)
 * @param options - Retry options
 * @param {number} [options.maxRetries=2] - Maximum number of retry attempts
 * @param {number} [options.retryDelayMs=500] - Delay between retries in milliseconds
 * @param {number} [options.timeoutMs=10000] - Request timeout in milliseconds
 * @param {string} [options.operationName='API call'] - Name of operation for logging
 * @returns {Promise<any>} - Result from fetchFn
 */
async function fetchWithRetry(fetchFn, options = {}) {
  const { maxRetries, retryDelayMs, timeoutMs, operationName } =
    getRetrySettings(options)

  let lastError = null
  let attempt = 0

  while (attempt <= maxRetries) {
    try {
      const attemptLog = getAttemptLog(attempt, maxRetries)
      logger.info(`[fetchWithRetry] Starting ${operationName}${attemptLog}`)

      const { result, duration } = await runAttemptWithTimeout(
        fetchFn,
        timeoutMs
      )

      logger.info(
        `[fetchWithRetry] ${operationName} succeeded${attemptLog} in ${Math.round(duration)}ms`
      )
      return result
    } catch (error) {
      lastError = error
      attempt++

      const errorType = getErrorType(error)

      logger.warn(
        `[fetchWithRetry] ${operationName} ${errorType} on attempt ${attempt}/${maxRetries + 1}: ${error.message}`
      )

      // Don't retry if we've exhausted attempts
      if (!hasRemainingRetries(attempt, maxRetries)) {
        logger.error(
          `[fetchWithRetry] ${operationName} failed after ${attempt} attempts: ${error.message}`
        )
        throw error
      }

      // '' Wait before retrying (exponential backoff + jitter to reduce synchronized retries)
      const { jitterMs, backoffDelay } = getBackoffDelay(retryDelayMs, attempt)
      logger.info(
        `[fetchWithRetry] Waiting ${backoffDelay}ms before retry ${attempt + 1}/${maxRetries + 1}`,
        {
          baseDelayMs: retryDelayMs,
          jitterMs
        }
      )
      await delay(backoffDelay)
    }
  }

  throw lastError
}

export { fetchWithRetry, createTimeoutController, delay }
