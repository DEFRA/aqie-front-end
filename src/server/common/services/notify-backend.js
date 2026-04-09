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

const CONFIG_NOTIFY_ENABLED = 'notify.enabled'
const CONFIG_NOTIFY_BASE_URL = 'notify.baseUrl'
const CONFIG_NOTIFY_ALERT_BACKEND_BASE_URL = 'notify.alertBackendBaseUrl'
const NOTIFY_DISABLED_SKIP_MESSAGE =
  'Notify API disabled or baseUrl missing; skipping'

function logNotifyDisabledAndSkip(apiPath, enabled, baseUrl) {
  const notifyDisabledData = {
    apiPath,
    enabled,
    baseUrl: baseUrl || '[not configured]'
  }
  logger.warn(
    `${NOTIFY_DISABLED_SKIP_MESSAGE}: ${JSON.stringify(notifyDisabledData)}`,
    notifyDisabledData
  )
  return { skipped: true }
}

function sanitizeLocationName(location) {
  if (!location || typeof location !== 'string') {
    return location
  }
  const sanitized = location.replace(/^\s*air\s+quality\s+in\s+/i, '').trim()
  return sanitized
}

export async function postToBackend(
  request,
  apiPath,
  body,
  customBaseUrl = null
) {
  const enabled = config.get(CONFIG_NOTIFY_ENABLED)
  const baseUrl = customBaseUrl || config.get(CONFIG_NOTIFY_BASE_URL)

  if (!enabled || !baseUrl) {
    return logNotifyDisabledAndSkip(apiPath, enabled, baseUrl)
  }

  const notifyRequestStart = {
    apiPath,
    baseUrl,
    bodyKeys: Object.keys(body)
  }
  logger.info(
    `Notify API request starting: ${JSON.stringify(notifyRequestStart)}`,
    notifyRequestStart
  )

  try {
    const { url, fetchOptions } = buildBackendApiFetchOptions(
      request,
      baseUrl,
      apiPath,
      { method: 'POST', body }
    )

    const [status, data] = await catchFetchError(url, fetchOptions)

    if (status !== HTTP_STATUS_OK && status !== HTTP_STATUS_CREATED) {
      const msg = `Notify API error ${status}`
      const notifyErrorData = {
        url,
        status,
        responseBody: data,
        bodyStringified: JSON.stringify(data)?.slice(0, MAX_ERROR_BODY_LENGTH)
      }
      logger.warn(`${msg}: ${JSON.stringify(notifyErrorData)}`, notifyErrorData)
      return { ok: false, status, body: data }
    }

    const notifySuccessData = { url }
    logger.info(
      `Notify message sent successfully: ${JSON.stringify(notifySuccessData)}`,
      notifySuccessData
    )
    return { ok: true, data }
  } catch (err) {
    logger.error('Notify API request failed', err)
    return { ok: false, error: err }
  }
}

async function getFromBackend(request, apiPath, customBaseUrl = null) {
  const enabled = config.get(CONFIG_NOTIFY_ENABLED)
  const baseUrl = customBaseUrl || config.get(CONFIG_NOTIFY_BASE_URL)

  if (!enabled || !baseUrl) {
    return logNotifyDisabledAndSkip(apiPath, enabled, baseUrl)
  }

  try {
    const { url, fetchOptions } = buildBackendApiFetchOptions(
      request,
      baseUrl,
      apiPath,
      { method: 'GET' }
    )

    const [status, data] = await catchFetchError(url, fetchOptions)

    if (status !== HTTP_STATUS_OK) {
      const msg = `Notify API error ${status}`
      const notifyErrorData = {
        url,
        status,
        responseBody: data,
        bodyStringified: JSON.stringify(data)?.slice(0, MAX_ERROR_BODY_LENGTH)
      }
      logger.warn(`${msg}: ${JSON.stringify(notifyErrorData)}`, notifyErrorData)

      return { ok: false, status, body: data }
    }

    return { ok: true, data }
  } catch (err) {
    logger.error('Notify API request failed', err)
    return { ok: false, error: err }
  }
}

export async function sendEmailCode(emailAddress, code, request = null) {
  const emailPath = config.get('notify.emailPath')
  return postToBackend(request, emailPath, { emailAddress, code })
}

export async function generateEmailLink(
  emailAddress,
  location,
  lat,
  long,
  request = null
) {
  const emailGenerateLinkPath = config.get('notify.emailGenerateLinkPath')
  const payload = {
    emailAddress,
    alertType: 'email',
    location,
    ...(lat !== null && lat !== undefined
      ? { lat: Number.parseFloat(lat) }
      : {}),
    ...(long !== null && long !== undefined
      ? { long: Number.parseFloat(long) }
      : {})
  }
  return postToBackend(request, emailGenerateLinkPath, payload)
}

export async function validateEmailLink(token, request = null) {
  const emailValidateLinkPath = config.get('notify.emailValidateLinkPath')
  const normalizedPath = emailValidateLinkPath.replace(/\/$/, '')
  const apiPath = `${normalizedPath}/${encodeURIComponent(token)}`
  return getFromBackend(request, apiPath)
}

export async function setupEmailAlert(
  emailAddress,
  location,
  locationId,
  lat,
  long,
  request = null
) {
  const setupPath = config.get('notify.setupAlertPath')
  const alertBackendBaseUrl = config.get(CONFIG_NOTIFY_ALERT_BACKEND_BASE_URL)
  const mockSetupAlertEnabled = config.get('notify.mockSetupAlertEnabled')

  const latitude = lat
    ? Math.round(Number.parseFloat(lat) * 1000000) / 1000000
    : undefined
  const longitude = long
    ? Math.round(Number.parseFloat(long) * 1000000) / 1000000
    : undefined

  const sanitizedLocation = sanitizeLocationName(location)

  const payload = {
    emailAddress,
    alertType: 'email',
    location: sanitizedLocation,
    locationId,
    lat: latitude,
    long: longitude
  }

  if (mockSetupAlertEnabled) {
    logger.info('Mock setup alert enabled, bypassing backend for email setup')
    return {
      ok: true,
      data: {
        status: 'mock_alert_created',
        emailAddress: emailAddress ? '***' : undefined,
        locationId,
        mock: true
      },
      mock: true
    }
  }

  return postToBackend(request, setupPath, payload, alertBackendBaseUrl)
}

export async function sendSmsCode(phoneNumber, request = null) {
  const smsPath = config.get('notify.smsPath')
  const mockOtpEnabled = config.get('notify.mockOtpEnabled')
  const mockOtpCode = config.get('notify.mockOtpCode') || '12345'

  const result = await postToBackend(request, smsPath, { phoneNumber })

  if (mockOtpEnabled) {
    logger.info('Mock OTP enabled, backend still called', {
      mockOtpCode
    })

    if (request) {
      const currentSequence = request.yar.get('otpGenerationSequence') || 1
      request.yar.set('mockOtp', mockOtpCode)
      request.yar.set('mockOtpTimestamp', Date.now())
      request.yar.set('mockOtpSequence', currentSequence)
    }

    if (!result.ok) {
      logger.warn('Mock OTP enabled, backend send failed', {
        status: result.status,
        error: result.error,
        body: result.body
      })
    }

    return {
      ok: true,
      data: { status: 'mock_otp_enabled', mockOtpCode },
      mock: true
    }
  }

  if (request && result.ok) {
    request.yar.clear('mockOtp')
  }

  return result
}

async function deleteFromBackend(request, apiPath, body, customBaseUrl = null) {
  const enabled = config.get(CONFIG_NOTIFY_ENABLED)
  const baseUrl = customBaseUrl || config.get(CONFIG_NOTIFY_BASE_URL)

  if (!enabled || !baseUrl) {
    return logNotifyDisabledAndSkip(apiPath, enabled, baseUrl)
  }

  try {
    const { url, fetchOptions } = buildBackendApiFetchOptions(
      request,
      baseUrl,
      apiPath,
      { method: 'DELETE', body }
    )

    const [status, data] = await catchFetchError(url, fetchOptions)

    if (status !== HTTP_STATUS_OK) {
      const notifyErrorData = {
        url,
        status,
        responseBody: data,
        bodyStringified: JSON.stringify(data)?.slice(0, MAX_ERROR_BODY_LENGTH)
      }
      logger.warn(
        `Notify DELETE API error ${status}: ${JSON.stringify(notifyErrorData)}`,
        notifyErrorData
      )
      return { ok: false, status, body: data }
    }

    logger.info(`Notify DELETE request succeeded: ${url}`)
    return { ok: true, data }
  } catch (err) {
    logger.error('Notify DELETE API request failed', err)
    return { ok: false, error: err }
  }
}

export async function unsubscribeEmailAlert(emailAddress, request = null) {
  const optOutPath = config.get('notify.optOutEmailAlertPath')
  const alertBackendBaseUrl = config.get(CONFIG_NOTIFY_ALERT_BACKEND_BASE_URL)
  return deleteFromBackend(
    request,
    optOutPath,
    { emailAddress },
    alertBackendBaseUrl
  )
}

export async function verifyOtp(phoneNumber, otp, request = null) {
  const verifyPath = config.get('notify.verifyOtpPath')
  const mockOtpEnabled = config.get('notify.mockOtpEnabled')
  const mockOtpCode = config.get('notify.mockOtpCode') || '12345'

  if (mockOtpEnabled && request) {
    const mockOtpCheck = {
      otpMatches: otp === mockOtpCode,
      mockOtpCode
    }
    logger.info(
      `Verifying against fixed mock OTP: ${JSON.stringify(mockOtpCheck)}`,
      mockOtpCheck
    )

    if (otp === mockOtpCode) {
      request.yar.clear('mockOtp')
      request.yar.clear('mockOtpTimestamp')
      request.yar.clear('mockOtpSequence')
      return { ok: true, data: { status: 'verified', mock: true } }
    }

    return {
      ok: false,
      status: 400,
      body: { message: 'Invalid OTP code', mock: true }
    }
  }

  return postToBackend(request, verifyPath, { phoneNumber, otp })
}
