// Subscription backend service wrapper ''
import { config } from '../../../config/index.js'
import { proxyFetch } from '../../../helpers/proxy-fetch.js'
import { createLogger } from '../helpers/logging/logger.js'
import {
  DEFAULT_TIMEOUT_MS,
  MAX_ERROR_BODY_LENGTH
} from '../../data/constants.js'
import { buildBackendApiFetchOptions } from '../helpers/backend-api-helper.js'

const logger = createLogger('subscription-service')

/**
 * Make POST request to subscription API with automatic local/remote handling ''
 * @param {Object} request - Hapi request object (for detecting localhost)
 * @param {string} apiPath - API path
 * @param {Object} body - Request body
 * @returns {Object} Response object
 */
async function postJson(request, apiPath, body) {
  const enabled = config.get('subscriptionApi.enabled')
  const baseUrl = config.get('subscriptionApi.baseUrl')
  if (!enabled || !baseUrl) {
    logger.debug('Subscription API disabled or baseUrl missing; skipping', {
      apiPath
    })
    return { skipped: true }
  }

  const apiKey = config.get('subscriptionApi.apiKey')
  const timeout = config.get('subscriptionApi.timeoutMs') || DEFAULT_TIMEOUT_MS

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    // Use reusable helper to build URL and options based on environment ''
    const additionalHeaders = apiKey
      ? { authorization: `Bearer ${apiKey}` }
      : {}
    const { url, fetchOptions } = buildBackendApiFetchOptions(
      request,
      baseUrl,
      apiPath,
      { method: 'POST', body, additionalHeaders }
    )

    const res = await proxyFetch(url, {
      ...fetchOptions,
      signal: controller.signal
    })
    clearTimeout(timer)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const msg = `Subscription API error ${res.status}`
      logger.warn(msg, {
        url,
        status: res.status,
        body: text?.slice(0, MAX_ERROR_BODY_LENGTH)
      })
      return { ok: false, status: res.status, body: text }
    }
    const data = await res.json().catch(() => ({}))
    return { ok: true, data }
  } catch (err) {
    clearTimeout(timer)
    logger.error('Subscription API request failed', err)
    return { ok: false, error: err }
  }
}

/**
 * Record email capture ''
 * @param {string} email - Email address
 * @param {Object} request - Hapi request object (optional)
 */
export async function recordEmailCapture(email, request = null) {
  const emailPath = config.get('subscriptionApi.emailPath')
  return postJson(request, emailPath, { email })
}

/**
 * Record SMS capture ''
 * @param {string} mobileNumber - Mobile number
 * @param {Object} request - Hapi request object (optional)
 */
export async function recordSmsCapture(mobileNumber, request = null) {
  const smsPath = config.get('subscriptionApi.smsPath')
  return postJson(request, smsPath, { mobileNumber })
}
