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

export function getCdpApiKey() {
  const env = process.env.NODE_ENV

  if (env === 'perf-test') {
    return config.get('cdpXApiKeyPerfTest') || config.get('cdpXApiKey') || null
  }
  if (env === 'test') {
    return config.get('cdpXApiKeyTest') || config.get('cdpXApiKey') || null
  }

  return (
    config.get('cdpXApiKeyTest') ||
    config.get('cdpXApiKeyDev') ||
    config.get('cdpXApiKey') ||
    null
  )
}

export function getEphemeralDevApiUrl() {
  const env = process.env.NODE_ENV

  if (env === 'perf-test') {
    return config.get('ephemeralProtectedPerfTestApiUrl') || null
  }
  if (env === 'test') {
    return config.get('ephemeralProtectedTestApiUrl') || null
  }

  return (
    config.get('ephemeralProtectedTestApiUrl') ||
    config.get('ephemeralProtectedDevApiUrl') ||
    null
  )
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
  request,
  productionBaseUrl,
  apiPath,
  additionalHeaders = {}
) {
  const isLocal = isLocalRequest(request)
  const ephemeralUrl = getEphemeralDevApiUrl()
  const normalizedApiPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`

  if (isLocal && ephemeralUrl) {
    const cdpApiKey = getCdpApiKey()
    const serviceName = new URL(productionBaseUrl).hostname.split('.')[0]

    return {
      url: `${ephemeralUrl}/${serviceName}${normalizedApiPath}`,
      headers: {
        ...additionalHeaders,
        ...(cdpApiKey ? { 'x-api-key': cdpApiKey } : {}),
        'Content-Type': 'application/json'
      }
    }
  }

  // '' Default to direct service-to-service URL
  const baseUrl = productionBaseUrl.replace(/\/$/, '')
  const url = `${baseUrl}${normalizedApiPath}`
  const headers = {
    ...additionalHeaders,
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
