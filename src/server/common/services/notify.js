// Notify service - calls backend wrapper API that handles GOV.UK Notify integration ''
import { createLogger } from '../helpers/logging/logger.js'
import { config } from '../../../config/index.js'
import { catchFetchError } from '../helpers/catch-fetch-error.js'
import {
  MAX_ERROR_BODY_LENGTH,
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED
} from '../../data/constants.js'
import { buildBackendApiFetchOptions } from '../helpers/backend-api-helper.js'

const logger = createLogger('notify-service')

/**
 * Make POST request to backend notify API with automatic local/remote handling ''
 * @param {Object} request - Hapi request object (for detecting localhost)
 * @param {string} apiPath - API path
 * @param {Object} body - Request body
 * @returns {Object} Response object
 */
async function postToBackend(request, apiPath, body) {
  const enabled = config.get('notify.enabled')
  const baseUrl = config.get('notify.baseUrl')

  if (!enabled || !baseUrl) {
    logger.warn('Notify API disabled or baseUrl missing; skipping', {
      apiPath,
      enabled,
      baseUrl: baseUrl || '[not configured]'
    })
    return { skipped: true }
  }

  logger.info('Notify API request starting', {
    apiPath,
    baseUrl,
    bodyKeys: Object.keys(body)
  })

  try {
    // Use reusable helper to build URL and options based on environment ''
    // Local: uses ephemeralUrl + x-api-key (from buildBackendApiFetchOptions)
    // Production: uses baseUrl with no auth headers
    const { url, fetchOptions } = buildBackendApiFetchOptions(
      request,
      baseUrl,
      apiPath,
      { method: 'POST', body }
    )

    // Use catchFetchError which handles Accept-Encoding and other headers like forecast service
    const [status, data] = await catchFetchError(url, fetchOptions)

    // Accept 200 OK and 201 Created as success
    if (status !== HTTP_STATUS_OK && status !== HTTP_STATUS_CREATED) {
      const msg = `Notify API error ${status}`
      logger.warn(msg, {
        url,
        status,
        body: JSON.stringify(data)?.slice(0, MAX_ERROR_BODY_LENGTH)
      })
      return { ok: false, status, body: data }
    }

    logger.info('Notify message sent successfully', { url })
    return { ok: true, data }
  } catch (err) {
    logger.error('Notify API request failed', err)
    return { ok: false, error: err }
  }
}

/**
 * Send email verification code via backend API ''
 * @param {string} emailAddress - Email address
 * @param {string} code - Verification code
 * @param {Object} request - Hapi request object (optional)
 */
export async function sendEmailCode(emailAddress, code, request = null) {
  const emailPath = config.get('notify.emailPath')
  return postToBackend(request, emailPath, { emailAddress, code })
}

/**
 * Send SMS verification code via backend API ''
 * @param {string} phoneNumber - Phone number (changed from mobileNumber to match backend contract)
 * @param {Object} request - Hapi request object (optional)
 */
export async function sendSmsCode(phoneNumber, request = null) {
  const smsPath = config.get('notify.smsPath')
  return postToBackend(request, smsPath, { phoneNumber })
}

/**
 * Verify OTP code via backend API ''
 * @param {string} phoneNumber - Phone number
 * @param {string} otp - OTP code to verify
 * @param {Object} request - Hapi request object (optional)
 * @returns {Promise<Object>} { ok: boolean, data: { notificationId, status } }
 */
export async function verifyOtp(phoneNumber, otp, request = null) {
  const verifyPath = config.get('notify.verifyOtpPath')
  return postToBackend(request, verifyPath, { phoneNumber, otp })
}

/**
 * Setup alert subscription via backend API ''
 * @param {string} phoneNumber - Phone number
 * @param {string} alertType - Type of alert (e.g., 'sms', 'email')
 * @param {string} location - Location for alerts
 * @param {string} lat - Latitude coordinate
 * @param {string} long - Longitude coordinate
 * @param {Object} request - Hapi request object (optional)
 * @returns {Promise<Object>} { ok: boolean, data: subscription details }
 */
export async function setupAlert(
  phoneNumber,
  alertType,
  location,
  lat,
  long,
  request = null
) {
  const setupPath = config.get('notify.setupAlertPath')
  return postToBackend(request, setupPath, {
    phoneNumber,
    alertType,
    location,
    lat,
    long
  })
}
