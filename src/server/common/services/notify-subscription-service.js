import { createLogger } from '../helpers/logging/logger.js'
import { config } from '../../../config/index.js'
import { catchFetchError } from '../helpers/catch-fetch-error.js'
import { buildBackendApiFetchOptions } from '../helpers/backend-api-helper.js'
import {
  resolveSubscriptionAlertType,
  createMaxAlertsCheckLog,
  getNotifySubscriptionConfig,
  handleDisabledSubscriptionCheck,
  handleMockMaxSubscriptionCheck,
  evaluateSubscriptionResponse
} from './notify-subscription-helpers.js'

const logger = createLogger('notify-service')
const CONFIG_NOTIFY_ALERT_BACKEND_BASE_URL = 'notify.alertBackendBaseUrl'
const CONTACT_LOG_DIGITS = 6

export async function getSubscriptionCount(phoneNumber, request = null) {
  const alertBackendBaseUrl = config.get(CONFIG_NOTIFY_ALERT_BACKEND_BASE_URL)
  const getSubscriptionsPath =
    config.get('notify.getSubscriptionsPath') || '/api/subscriptions'

  const alertType = resolveSubscriptionAlertType(phoneNumber)
  const maxAlertsCheckLog = createMaxAlertsCheckLog(
    alertBackendBaseUrl,
    getSubscriptionsPath,
    alertType,
    phoneNumber
  )
  logger.info(
    `Checking maximum alerts: ${JSON.stringify(maxAlertsCheckLog)}`,
    maxAlertsCheckLog
  )

  try {
    const { enabled, baseUrl } =
      getNotifySubscriptionConfig(alertBackendBaseUrl)
    const disabledResult = handleDisabledSubscriptionCheck(
      getSubscriptionsPath,
      enabled,
      baseUrl
    )
    if (disabledResult) {
      return disabledResult
    }

    const mockResult = handleMockMaxSubscriptionCheck(alertType, phoneNumber)
    if (mockResult) {
      return mockResult
    }

    const encodedContact = encodeURIComponent(phoneNumber)
    const apiPath = `${getSubscriptionsPath}/${encodedContact}?alertType=${alertType}`

    const { url, fetchOptions } = buildBackendApiFetchOptions(
      request,
      baseUrl,
      apiPath,
      { method: 'GET' }
    )

    const [status, data] = await catchFetchError(url, fetchOptions)

    logger.info(
      `Subscriptions API response: status=${status}, alertType=${alertType}, body=${JSON.stringify(data)}`,
      {
        status,
        alertType,
        contactLast6:
          typeof phoneNumber === 'string'
            ? phoneNumber.slice(-CONTACT_LOG_DIGITS)
            : undefined,
        responseBody: data
      }
    )

    return evaluateSubscriptionResponse(status, data, alertType)
  } catch (err) {
    logger.error('Error checking subscriptions', err)
    return { ok: false, maxReached: false }
  }
}
