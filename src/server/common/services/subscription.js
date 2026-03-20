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

function getConfigValue(path, fallback = undefined) {
  try {
    return config.get(path)
  } catch (err) {
    logger.warn('Subscription API config key missing; skipping capture path', {
      path,
      error: err?.message
    })
    return fallback
  }
}

/**
 * Make POST request to subscription API with automatic local/remote handling ''
 * @param request - Hapi request object (for detecting localhost)
 * @param {string} apiPath - API path
 * @param body - Request body
 * @returns Response object
 */
async function postJson(request, apiPath, body) {
  const enabled = getConfigValue('subscriptionApi.enabled', false)
  const baseUrl = getConfigValue('subscriptionApi.baseUrl', '')
  if (!apiPath) {
    logger.debug('Subscription API path missing; skipping', {
      bodyKeys: Object.keys(body || {})
    })
    return { skipped: true }
  }
  if (!enabled || !baseUrl) {
    logger.debug('Subscription API disabled or baseUrl missing; skipping', {
      apiPath
    })
    return { skipped: true }
  }

  const apiKey = getConfigValue('subscriptionApi.apiKey', '')
  const timeout = getConfigValue(
    'subscriptionApi.timeoutMs',
    DEFAULT_TIMEOUT_MS
  )

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
 * @param request - Hapi request object (optional)
 */
export async function recordEmailCapture(email, request = null) {
  const emailPath = getConfigValue('subscriptionApi.emailPath', '')
  return postJson(request, emailPath, { email })
}

/**
 * Record SMS capture ''
 * @param {string} mobileNumber - Mobile number
 * @param request - Hapi request object (optional)
 */
export async function recordSmsCapture(mobileNumber, request = null) {
  const smsPath = getConfigValue('subscriptionApi.smsPath', '')
  return postJson(request, smsPath, { mobileNumber })
}
