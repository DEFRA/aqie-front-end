import { createLogger } from '../helpers/logging/logger.js'
import { config } from '../../../config/index.js'
import { postToBackend } from './notify-backend.js'
import {
  trySetupMockAlert,
  tryFallbackMockSetup
} from './notify-mock-alerts.js'

export {
  sendEmailCode,
  generateEmailLink,
  validateEmailLink,
  setupEmailAlert,
  sendSmsCode,
  verifyOtp,
  unsubscribeEmailAlert
} from './notify-backend.js'
export { getSubscriptionCount } from './notify-subscription-service.js'
export {
  getMockAlertStorageSnapshot,
  getMockAlerts,
  clearMockAlerts,
  removeMockAlert
} from './notify-mock-alerts.js'

const logger = createLogger('notify-service')

const CONFIG_NOTIFY_ALERT_BACKEND_BASE_URL = 'notify.alertBackendBaseUrl'
const PHONE_LAST_DIGITS_SHORT = 4

function sanitizeLocationName(location) {
  if (!location || typeof location !== 'string') {
    return location
  }
  return location.replace(/^\s*air\s+quality\s+in\s+/i, '').trim()
}

function toRoundedCoordinate(value) {
  if (!value) {
    return undefined
  }
  return Math.round(Number.parseFloat(value) * 1000000) / 1000000
}

function buildSetupAlertPayload({
  phoneNumber,
  alertType,
  location,
  locationId,
  lat,
  long,
  alertBackendBaseUrl,
  lang
}) {
  const latitude = toRoundedCoordinate(lat)
  const longitude = toRoundedCoordinate(long)

  const alertCoordinates = {
    rawLat: lat,
    rawLong: long,
    parsedLat: latitude,
    parsedLong: longitude,
    latType: typeof latitude,
    longType: typeof longitude,
    locationId,
    alertBackendBaseUrl
  }
  logger.info(
    `Setting up alert with coordinates: ${JSON.stringify(alertCoordinates)}`,
    alertCoordinates
  )

  const sanitizedLocation = sanitizeLocationName(location)

  if (sanitizedLocation !== location) {
    const sanitizedLocationLog = {
      original: location,
      sanitized: sanitizedLocation
    }
    logger.info(
      `Sanitized location name for alert setup: ${JSON.stringify(sanitizedLocationLog)}`,
      sanitizedLocationLog
    )
  }

  const payload = {
    phoneNumber,
    alertType,
    location: sanitizedLocation,
    locationId,
    lat: latitude,
    long: longitude,
    lang
  }

  return { latitude, longitude, sanitizedLocation, payload }
}

function logBackendSetupResponse(result, phoneNumber, sanitizedLocation) {
  const backendResponseLog = {
    ok: result.ok,
    status: result.status,
    error: result.error,
    bodyKeys: result.body ? Object.keys(result.body) : [],
    phoneNumberLast4: phoneNumber
      ? phoneNumber.slice(-PHONE_LAST_DIGITS_SHORT)
      : undefined,
    sanitizedLocation
  }
  logger.info(
    `Backend response received: ${JSON.stringify(backendResponseLog)}`,
    backendResponseLog
  )
}

export async function setupAlert(
  phoneNumber,
  alertType,
  location,
  locationId,
  lat,
  long,
  { lang, request = null } = {}
) {
  const setupPath = config.get('notify.setupAlertPath')
  const alertBackendBaseUrl = config.get(CONFIG_NOTIFY_ALERT_BACKEND_BASE_URL)
  const mockSetupAlertEnabled = config.get('notify.mockSetupAlertEnabled')
  const { latitude, longitude, sanitizedLocation, payload } =
    buildSetupAlertPayload({
      phoneNumber,
      alertType,
      location,
      locationId,
      lat,
      long,
      alertBackendBaseUrl,
      lang
    })

  if (mockSetupAlertEnabled) {
    logger.info('Mock setup alert enabled, bypassing backend for setup-alert')
    return trySetupMockAlert({
      phoneNumber,
      alertType,
      locationId,
      sanitizedLocation,
      latitude,
      longitude
    })
  }

  const result = await postToBackend(
    request,
    setupPath,
    payload,
    alertBackendBaseUrl
  )

  logBackendSetupResponse(result, phoneNumber, sanitizedLocation)

  const fallbackResult = tryFallbackMockSetup({
    result,
    mockSetupAlertEnabled,
    phoneNumber,
    alertType,
    locationId,
    sanitizedLocation,
    latitude,
    longitude
  })

  if (fallbackResult) {
    return fallbackResult
  }

  return result
}
