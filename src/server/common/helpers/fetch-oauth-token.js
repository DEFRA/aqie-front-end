import { createLogger } from './logging/logger.js'
import { catchFetchError } from './catch-fetch-error.js'
import { config } from '../../../config/index.js'

const logger = createLogger()

const tokenUrl = config.get('oauthTokenUrlNIreland')
const oauthTokenNorthernIrelandTenantId = config.get(
  'oauthTokenNorthernIrelandTenantId'
)
const clientId = config.get('clientIdNIreland')
const clientSecret = config.get('clientSecretNIreland')
const redirectUri = config.get('redirectUriNIreland')
const scope = config.get('scopeNIreland')
const tokenTimeoutMs = config.get('niApiTimeoutMs') ?? 15000

// '' Retry configuration for OAuth token fetch
const MAX_RETRIES = 5
const INITIAL_RETRY_DELAY = 2000 // 2 seconds
const MAX_RETRY_DELAY = 10000 // 10 seconds

// '' Helper function to wait for a specified delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// '' Create AbortController with timeout for token fetch
function createTimeoutController(timeoutMs) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  return { controller, timeoutId }
}

// '' Calculate exponential backoff delay with jitter
function calculateRetryDelay(attempt) {
  const exponentialDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt)
  const delayWithJitter = exponentialDelay * (0.5 + Math.random() * 0.5)
  return Math.min(delayWithJitter, MAX_RETRY_DELAY)
}

export async function fetchOAuthToken(options = {}) {
  const fetchLogger = options.logger || logger

  fetchLogger.info('OAuth token requested')

  const url = `${tokenUrl}/${oauthTokenNorthernIrelandTenantId}/oauth2/v2.0/token`
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      scope,
      grant_type: 'client_credentials',
      state: '1245'
    })
  }

  let lastError = null
  let lastStatusCode = null

  // '' Retry loop with exponential backoff
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const retryDelay = calculateRetryDelay(attempt - 1)
        fetchLogger.info(
          `Retrying OAuth token fetch (attempt ${attempt + 1}/${MAX_RETRIES}) after ${Math.round(retryDelay)}ms delay`
        )
        await delay(retryDelay)
      }

      // '' Invoking token API with explicit timeout
      const { controller, timeoutId } = createTimeoutController(tokenTimeoutMs)
      let statusCodeToken
      let dataToken
      try {
        ;[statusCodeToken, dataToken] = await catchFetchError(url, {
          ...requestOptions,
          signal: controller.signal
        })
      } finally {
        clearTimeout(timeoutId)
      }

      if (statusCodeToken !== 200) {
        lastStatusCode = statusCodeToken
        lastError = 'oauth-fetch-failed'
        fetchLogger.warn(
          `OAuth token fetch attempt ${attempt + 1}/${MAX_RETRIES} failed with status ${statusCodeToken}`
        )

        // '' Don't retry on client errors (4xx), only on server errors (5xx) or timeouts (0)
        if (statusCodeToken >= 400 && statusCodeToken < 500) {
          fetchLogger.error(
            'Client error detected, not retrying:',
            statusCodeToken
          )
          fetchLogger.error('OAuth token response data:', dataToken)
          return { error: 'oauth-fetch-failed', statusCode: statusCodeToken }
        }

        continue // Retry on 5xx or 0
      }

      if (!dataToken || !dataToken.access_token) {
        lastError = 'oauth-token-missing'
        lastStatusCode = statusCodeToken
        fetchLogger.warn(
          `OAuth token response missing access_token on attempt ${attempt + 1}/${MAX_RETRIES}`
        )
        continue
      }

      fetchLogger.info(
        `OAuth token fetched successfully${attempt > 0 ? ` on attempt ${attempt + 1}` : ''}`
      )
      return dataToken.access_token
    } catch (error) {
      lastError = error
      fetchLogger.error(
        `Unexpected error during OAuth token fetch attempt ${attempt + 1}/${MAX_RETRIES}:`,
        error
      )
    }
  }

  // '' All retries exhausted
  fetchLogger.error(
    `Failed to fetch OAuth token after ${MAX_RETRIES} attempts. Last error: ${lastError}`
  )
  return {
    error: lastError || 'oauth-fetch-failed',
    statusCode: lastStatusCode || 0
  }
}
