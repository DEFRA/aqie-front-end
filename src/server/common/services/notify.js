// Notify service - calls backend wrapper API that handles GOV.UK Notify integration
import { createLogger } from '../helpers/logging/logger.js'
import { config } from '../../../config/index.js'
import { proxyFetch } from '../../../helpers/proxy-fetch.js'
import {
  DEFAULT_TIMEOUT_MS,
  MAX_ERROR_BODY_LENGTH
} from '../../data/constants.js'

const logger = createLogger('notify-service')

/**
 * Build full URL for notify endpoint
 */
function buildUrl(path) {
  const base = (config.get('notify.baseUrl') || '').replace(/\/$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}${suffix}`
}

/**
 * Make POST request to backend notify API
 */
async function postToBackend(url, body) {
  const enabled = config.get('notify.enabled')
  const baseUrl = config.get('notify.baseUrl')

  if (!enabled || !baseUrl) {
    logger.debug('Notify API disabled or baseUrl missing; skipping', { url })
    return { skipped: true }
  }

  const timeout = config.get('notify.timeoutMs') || DEFAULT_TIMEOUT_MS
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await proxyFetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    })

    clearTimeout(timer)

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const msg = `Notify API error ${res.status}`
      logger.warn(msg, {
        url,
        status: res.status,
        body: text?.slice(0, MAX_ERROR_BODY_LENGTH)
      })
      return { ok: false, status: res.status, body: text }
    }

    const data = await res.json().catch(() => ({}))
    logger.info('Notify message sent successfully', { url })
    return { ok: true, data }
  } catch (err) {
    clearTimeout(timer)
    logger.error('Notify API request failed', err)
    return { ok: false, error: err }
  }
}

/**
 * Send email verification code via backend API
 */
export async function sendEmailCode(emailAddress, code) {
  const url = buildUrl(config.get('notify.emailPath') || '/send-email-code')
  return postToBackend(url, { emailAddress, code })
}

/**
 * Send SMS verification code via backend API
 */
export async function sendSmsCode(mobileNumber, code) {
  const url = buildUrl(config.get('notify.smsPath') || '/send-sms-code')
  return postToBackend(url, { mobileNumber, code })
}
