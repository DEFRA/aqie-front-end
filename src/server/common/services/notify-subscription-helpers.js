import { createLogger } from '../helpers/logging/logger.js'
import { config } from '../../../config/index.js'
import { HTTP_STATUS_OK } from '../../data/constants.js'

const logger = createLogger('notify-service')
const CONFIG_NOTIFY_ENABLED = 'notify.enabled'
const CONFIG_NOTIFY_BASE_URL = 'notify.baseUrl'
const MAX_SUBSCRIPTIONS_PER_CONTACT = 5
const STATUS_BAD_REQUEST = 400

function getContactLastDigits(phoneNumber = '', digits = 6) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return undefined
  }

  return phoneNumber.slice(-digits)
}

function extractSubscriptionsFromResponse(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.subscriptions)) {
    return data.subscriptions
  }

  return []
}

function extractSubscriptionCount(data, subscriptions = []) {
  if (typeof data?.count === 'number') {
    return data.count
  }

  return subscriptions.length
}

export function resolveSubscriptionAlertType(contact) {
  const isEmail = typeof contact === 'string' && contact.includes('@')
  return isEmail ? 'email' : 'sms'
}

export function createMaxAlertsCheckLog(
  alertBackendBaseUrl,
  getSubscriptionsPath,
  alertType,
  phoneNumber
) {
  return {
    alertBackendBaseUrl,
    getSubscriptionsPath,
    alertType,
    contactLast6: getContactLastDigits(phoneNumber)
  }
}

export function getNotifySubscriptionConfig(alertBackendBaseUrl) {
  const enabled = config.get(CONFIG_NOTIFY_ENABLED)
  const baseUrl = alertBackendBaseUrl || config.get(CONFIG_NOTIFY_BASE_URL)
  return { enabled, baseUrl }
}

export function handleDisabledSubscriptionCheck(
  getSubscriptionsPath,
  enabled,
  baseUrl
) {
  if (enabled && baseUrl) {
    return null
  }

  const subscriptionsDisabledLog = {
    getSubscriptionsPath,
    enabled,
    baseUrl: baseUrl || '[not configured]'
  }
  logger.warn(
    `Notify API disabled or baseUrl missing; allowing by default: ${JSON.stringify(subscriptionsDisabledLog)}`,
    subscriptionsDisabledLog
  )
  return { ok: true, maxReached: false }
}

export function handleMockMaxSubscriptionCheck(alertType, phoneNumber) {
  const mockMaxReached = config.get('notify.mockSubscriptionCheckMaxReached')
  if (!mockMaxReached) {
    return null
  }

  logger.warn(
    'mockSubscriptionCheckMaxReached is enabled — returning maxReached:true',
    {
      alertType,
      contactLast6: getContactLastDigits(phoneNumber)
    }
  )
  return { ok: true, maxReached: true }
}

export function evaluateSubscriptionResponse(status, data, alertType) {
  if (status === STATUS_BAD_REQUEST) {
    const maxReachedLog = {
      statusCode: data?.statusCode,
      error: data?.error,
      message: data?.message
    }
    logger.warn(
      `Maximum alerts reached: ${JSON.stringify(maxReachedLog)}`,
      maxReachedLog
    )
    return { ok: true, maxReached: true }
  }

  if (status === HTTP_STATUS_OK) {
    const subscriptions = extractSubscriptionsFromResponse(data)
    const count = extractSubscriptionCount(data, subscriptions)

    if (count >= MAX_SUBSCRIPTIONS_PER_CONTACT) {
      logger.warn(
        `Subscription count ${count} >= ${MAX_SUBSCRIPTIONS_PER_CONTACT} from 200 response — treating as maxReached`,
        { alertType, count }
      )
      return { ok: true, maxReached: true }
    }

    logger.info(`User can add more ${alertType} locations (count=${count})`)
    return { ok: true, maxReached: false }
  }

  const unexpectedResponseLog = { status, alertType, data }
  logger.warn(
    `Unexpected response from subscriptions API (status=${status}) — if this is 401/403 your CDP API key may have expired. Failing open.`,
    unexpectedResponseLog
  )
  return { ok: false, maxReached: false }
}
