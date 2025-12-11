// Subscription backend service wrapper ''
import { config } from '../../../config/index.js'
import { proxyFetch } from '../../../helpers/proxy-fetch.js'
import { createLogger } from '../helpers/logging/logger.js'
import {
  DEFAULT_TIMEOUT_MS,
  MAX_ERROR_BODY_LENGTH
} from '../../data/constants.js'

const logger = createLogger('subscription-service')

function buildUrl(path) {
  const base = (config.get('subscriptionApi.baseUrl') || '').replace(/\/$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}${suffix}`
}

async function postJson(url, body) {
  const enabled = config.get('subscriptionApi.enabled')
  const baseUrl = config.get('subscriptionApi.baseUrl')
  if (!enabled || !baseUrl) {
    logger.debug('Subscription API disabled or baseUrl missing; skipping', {
      url
    })
    return { skipped: true }
  }

  const apiKey = config.get('subscriptionApi.apiKey')
  const timeout = config.get('subscriptionApi.timeoutMs') || DEFAULT_TIMEOUT_MS

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await proxyFetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify(body),
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

export async function recordEmailCapture(email) {
  // Minimal payload now; expand later with metadata as needed ''
  const url = buildUrl(config.get('subscriptionApi.emailPath'))
  return postJson(url, { email })
}

export async function recordSmsCapture(mobileNumber) {
  const url = buildUrl(config.get('subscriptionApi.smsPath'))
  return postJson(url, { mobileNumber })
}
