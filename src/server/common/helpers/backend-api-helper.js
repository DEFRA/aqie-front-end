// Reusable backend API helper for CDP services ''
import { config } from '../../../config/index.js'

/**
 * Check if request is from localhost
 */
export function isLocalRequest(request) {
  if (!request?.headers?.host) {
    return false
  }
  const host = request.headers.host
  return host.includes('localhost') || host.includes('127.0.0.1')
}

/**
 * Get CDP API key from multiple sources
 */
export function getCdpApiKey() {
  if (config !== undefined && config.get) {
    const configKey = config.get('cdpXApiKey')
    if (configKey) {
      return configKey
    }
  }
  if (process?.env?.CDP_X_API_KEY) {
    return process.env.CDP_X_API_KEY
  }
  return null
}

/**
 * Get the ephemeral protected API URL for the current environment.
 * Returns an empty string (falsy) when no ephemeral URL is configured,
 * which signals that we are running in production and should use the
 * service's own production base URL instead.
 */
export function getEphemeralDevApiUrl() {
  if (config !== undefined && config.get) {
    const isTest = config.get('isTest')
    const isPerfTest = config.get('isPerfTest')

    if (isPerfTest) {
      return config.get('ephemeralProtectedPerfTestApiUrl')
    }

    if (isTest) {
      return config.get('ephemeralProtectedTestApiUrl')
    }

    return config.get('ephemeralProtectedDevApiUrl')
  }
  return null
}

/**
 * Build API request options for local or remote environment
 * @param {Object} request - Hapi request object (optional, for detecting localhost)
 * @param {string} productionBaseUrl - Production API base URL (e.g., 'https://aqie-notify-service.dev.cdp-int.defra.cloud')
 * @param {string} apiPath - API path (e.g., '/subscribe/generate-otp')
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} { url, headers } - Complete URL and headers for the API request
 */
export function buildBackendApiRequest(
  _request,
  productionBaseUrl,
  apiPath,
  additionalHeaders = {}
) {
  // '' If an ephemeral URL is configured for this environment, route through it.
  // A missing/empty ephemeral URL means we are in production – use the service’s own base URL directly.
  const ephemeralUrl = getEphemeralDevApiUrl()

  if (!ephemeralUrl) {
    // '' Production: no ephemeral gateway – call the backend service directly
    const baseUrl = productionBaseUrl.replace(/\/$/, '')
    const path = apiPath.startsWith('/') ? apiPath : `/${apiPath}`
    const productionUrl = `${baseUrl}${path}`
    const productionHeaders = {
      ...additionalHeaders,
      'Content-Type': 'application/json'
    }

    return { url: productionUrl, headers: productionHeaders }
  }

  // '' Non-production: route through the ephemeral gateway with CDP_X_API_KEY
  const cdpApiKey = getCdpApiKey()

  // Extract service name from production URL (e.g. 'aqie-notify-service' from 'https://aqie-notify-service.test.cdp-int.defra.cloud')
  const urlObj = new URL(productionBaseUrl)
  const serviceName = urlObj.hostname.split('.')[0]

  const url = `${ephemeralUrl}/${serviceName}${apiPath}`
  const headers = {
    ...additionalHeaders,
    'x-api-key': cdpApiKey,
    'Content-Type': 'application/json'
  }

  return { url, headers }
}

/**
 * Build fetch options for backend API request
 * @param {Object} request - Hapi request object (optional)
 * @param {string} productionBaseUrl - Production API base URL
 * @param {string} apiPath - API path
 * @param {Object} options - Additional options
 * @param {string} options.method - HTTP method (default: 'POST')
 * @param {Object} options.body - Request body (will be JSON.stringified)
 * @param {Object} options.additionalHeaders - Additional headers
 * @returns {Object} { url, fetchOptions } - URL and fetch options
 */
export function buildBackendApiFetchOptions(
  request,
  productionBaseUrl,
  apiPath,
  options = {}
) {
  const { method = 'POST', body, additionalHeaders = {} } = options

  const { url, headers } = buildBackendApiRequest(
    request,
    productionBaseUrl,
    apiPath,
    additionalHeaders
  )

  const fetchOptions = {
    method,
    headers
  }

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body)
  }

  return { url, fetchOptions }
}
