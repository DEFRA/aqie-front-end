import { createLogger } from '../helpers/logging/logger.js'
import { config } from '../../../config/index.js'
import { HTTP_STATUS_CREATED } from '../../data/constants.js'
import { postToBackend } from './notify-backend.js'
export {
  sendEmailCode,
  generateEmailLink,
  validateEmailLink,
  setupEmailAlert,
  sendSmsCode,
  verifyOtp
} from './notify-backend.js'
export { getSubscriptionCount } from './notify-subscription-service.js'

const logger = createLogger('notify-service')
const mockAlertStorage = new Map()

const PHONE_LAST_DIGITS_COUNT = 4
const UK_COUNTRY_CODE = '+44'
const MOCK_ALERTS_MAX_PER_PHONE = 5
const CONFIG_NOTIFY_ALERT_BACKEND_BASE_URL = 'notify.alertBackendBaseUrl'
const PHONE_MASK_LEADING_DIGITS = 7
const PHONE_LAST_DIGITS_SHORT = 4
const STATUS_BAD_REQUEST = 400
const STATUS_GATEWAY_BAD = 502
const STATUS_SERVICE_UNAVAILABLE_HTTP = 503
const STATUS_GATEWAY_TIMEOUT = 504
const STATUS_SERVICE_UNAVAILABLE = new Set([
  STATUS_GATEWAY_BAD,
  STATUS_SERVICE_UNAVAILABLE_HTTP,
  STATUS_GATEWAY_TIMEOUT
])

function normalizePhoneNumber(phoneNumber = '') {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return ''
  }

  const digitsOnly = phoneNumber.replaceAll(/\D/g, '')
  if (!digitsOnly) {
    return ''
  }

  if (digitsOnly.startsWith('44')) {
    return `${UK_COUNTRY_CODE}${digitsOnly.slice(2)}`
  }

  if (digitsOnly.startsWith('0')) {
    return `${UK_COUNTRY_CODE}${digitsOnly.slice(1)}`
  }

  return digitsOnly
}

function maskPhoneNumber(phoneNumber = '') {
  if (typeof phoneNumber !== 'string') {
    return undefined
  }

  if (phoneNumber.length <= PHONE_LAST_DIGITS_COUNT) {
    return '****'
  }

  return `***${phoneNumber.slice(-PHONE_LAST_DIGITS_COUNT)}`
}

function maskPhoneNumberForResponse(phoneNumber = '') {
  if (typeof phoneNumber !== 'string') {
    return undefined
  }

  return maskPhoneNumber(phoneNumber)
}

export function getMockAlertStorageSnapshot() {
  return Array.from(mockAlertStorage.entries()).map(([key, value]) => ({
    key,
    phoneNumber: maskPhoneNumber(value?.phoneNumber),
    location: value?.location,
    locationId: value?.locationId,
    latitude: value?.coordinates?.lat,
    longitude: value?.coordinates?.long,
    createdAt: value?.createdAt
  }))
}

function sanitizeLocationName(location) {
  if (!location || typeof location !== 'string') {
    return location
  }
  const sanitized = location.replace(/^\s*air\s+quality\s+in\s+/i, '').trim()
  return sanitized
}

function normalizeNIPostcode(location) {
  if (!location || typeof location !== 'string') {
    return location
  }

  const niPostcodeMatch = /^(BT\d{1,2})\s*(\d[A-Z]{2})/i.exec(location)

  if (niPostcodeMatch) {
    return `${niPostcodeMatch[1]} ${niPostcodeMatch[2]}`.toUpperCase()
  }

  return location
}

function generateAlertKey(phoneNumber, location, lat, long) {
  const normalizedLocation = normalizeNIPostcode(location)
  return `${phoneNumber}|${normalizedLocation}|${lat}|${long}`
}

function generateStableAlertKey(phoneNumber, locationId, location, lat, long) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber)

  if (locationId) {
    return `${normalizedPhone}|${locationId}`
  }

  return generateAlertKey(normalizedPhone, location, lat, long)
}

function getMaskedPhonePrefix(phoneNumber = '') {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return undefined
  }

  return `${phoneNumber.substring(0, PHONE_MASK_LEADING_DIGITS)}****`
}

function countAlertsForPhone(phoneNumber) {
  let count = 0
  for (const key of mockAlertStorage.keys()) {
    if (key.startsWith(phoneNumber + '|')) {
      count++
    }
  }
  return count
}

function buildMaxAlertsErrorData(alertCount, isFallback, phoneNumber) {
  const message = isFallback
    ? 'Maximum number of alerts reached for this phone number'
    : `Maximum of ${MOCK_ALERTS_MAX_PER_PHONE} alerts allowed per phone number`

  const data = { message }

  if (isFallback) {
    data.phoneNumber = maskPhoneNumberForResponse(phoneNumber)
    data.currentAlertCount = alertCount
    data.maxAlerts = MOCK_ALERTS_MAX_PER_PHONE
  } else {
    data.mock = true
  }

  return data
}

function buildDuplicateAlertErrorData(
  isFallback,
  phoneNumber,
  location,
  lat,
  long
) {
  if (!isFallback) {
    return { message: 'Alert already exists for this location', mock: true }
  }

  return {
    message: 'Alert already exists for this location and phone number',
    phoneNumber: maskPhoneNumberForResponse(phoneNumber),
    location,
    coordinates: { lat, long }
  }
}

function buildMockSuccessData(normalizedPhone, locationId) {
  return {
    status: 'mock_alert_created',
    phoneNumber: maskPhoneNumberForResponse(normalizedPhone),
    locationId,
    mock: true
  }
}

function buildMockStoredAlert(
  normalizedPhone,
  alertType,
  sanitizedLocation,
  locationId,
  latitude,
  longitude
) {
  return {
    phoneNumber: normalizedPhone,
    alertType,
    location: sanitizedLocation,
    locationId,
    coordinates: { lat: latitude, long: longitude },
    createdAt: new Date().toISOString()
  }
}

function tryStoreMockAlert({
  phoneNumber,
  alertType,
  locationId,
  sanitizedLocation,
  latitude,
  longitude,
  fallbackMode
}) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber)
  const alertCount = countAlertsForPhone(normalizedPhone)

  if (alertCount >= MOCK_ALERTS_MAX_PER_PHONE) {
    return {
      ok: false,
      status: STATUS_BAD_REQUEST,
      data: buildMaxAlertsErrorData(alertCount, fallbackMode, phoneNumber)
    }
  }

  const alertKey = generateStableAlertKey(
    phoneNumber,
    locationId,
    sanitizedLocation,
    latitude,
    longitude
  )

  if (mockAlertStorage.has(alertKey)) {
    return {
      ok: false,
      status: 409,
      data: buildDuplicateAlertErrorData(
        fallbackMode,
        phoneNumber,
        sanitizedLocation,
        latitude,
        longitude
      )
    }
  }

  mockAlertStorage.set(
    alertKey,
    buildMockStoredAlert(
      normalizedPhone,
      alertType,
      sanitizedLocation,
      locationId,
      latitude,
      longitude
    )
  )

  if (!fallbackMode) {
    return {
      ok: true,
      data: buildMockSuccessData(normalizedPhone, locationId),
      mock: true
    }
  }

  return {
    ok: true,
    status: HTTP_STATUS_CREATED,
    data: {
      message: 'Alert setup successful (mock mode - stored in memory)',
      phoneNumber: maskPhoneNumberForResponse(phoneNumber),
      location: sanitizedLocation,
      alertType,
      coordinates: { lat: latitude, long: longitude },
      mock: true,
      alertCount: alertCount + 1
    }
  }
}

function logMockStorageState(alertCount) {
  const currentStorage = Array.from(mockAlertStorage.entries()).map(
    ([key, value]) => ({
      key,
      location: value?.location,
      locationId: value?.locationId,
      phoneNumberMasked: maskPhoneNumber(value?.phoneNumber)
    })
  )

  logger.info(
    `Mock: Current storage state - Total entries: ${mockAlertStorage.size}, Alert count for this phone: ${alertCount}`
  )
  logger.info(
    `Mock: All stored alerts: ${JSON.stringify(currentStorage, null, 2)}`
  )
}

function assertMockNotEnabledInProduction() {
  const isProduction = config.get('env') === 'production'
  if (!isProduction) {
    return
  }

  const errorMsg =
    'CRITICAL: Mock setup alert is enabled in production environment. This should NEVER happen. Set NOTIFY_MOCK_SETUP_ALERT_ENABLED=false immediately.'
  logger.error(errorMsg)
  throw new Error(errorMsg)
}

function shouldUseFallbackMock(result, mockSetupAlertEnabled) {
  const isServiceUnavailable =
    !result.ok && STATUS_SERVICE_UNAVAILABLE.has(result.status)

  const mockDecisionLog = {
    isServiceUnavailable,
    mockSetupAlertEnabled,
    status: result.status,
    willUseMock: isServiceUnavailable && mockSetupAlertEnabled
  }
  logger.info(
    `Checking if mock should be used: ${JSON.stringify(mockDecisionLog)}`,
    mockDecisionLog
  )

  return isServiceUnavailable && mockSetupAlertEnabled
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

function tryFallbackMockSetup({
  result,
  mockSetupAlertEnabled,
  phoneNumber,
  alertType,
  locationId,
  sanitizedLocation,
  latitude,
  longitude
}) {
  if (!shouldUseFallbackMock(result, mockSetupAlertEnabled)) {
    return null
  }

  assertMockNotEnabledInProduction()
  logger.warn(
    `Backend service unavailable (status: ${result.status}), using mock setup alert with in-memory storage`
  )
  logger.warn('Mock setup alert should NEVER be enabled in production')

  const alertCount = countAlertsForPhone(normalizePhoneNumber(phoneNumber))
  logMockStorageState(alertCount)

  const alertKey = generateStableAlertKey(
    phoneNumber,
    locationId,
    sanitizedLocation,
    latitude,
    longitude
  )
  logDuplicateCheck(
    phoneNumber,
    sanitizedLocation,
    latitude,
    longitude,
    alertKey
  )

  const fallbackResult = tryStoreMockAlert({
    phoneNumber,
    alertType,
    locationId,
    sanitizedLocation,
    latitude,
    longitude,
    fallbackMode: true
  })

  if (fallbackResult.ok) {
    const mockStoredLog = {
      phoneNumber: getMaskedPhonePrefix(phoneNumber),
      sanitizedLocation,
      alertKey,
      totalAlerts: mockAlertStorage.size,
      allKeys: Array.from(mockAlertStorage.keys())
    }
    logger.info(
      `Mock: Alert stored successfully: ${JSON.stringify(mockStoredLog)}`,
      mockStoredLog
    )
  }

  return fallbackResult
}

function toRoundedCoordinate(value) {
  if (!value) {
    return undefined
  }
  return Math.round(Number.parseFloat(value) * 1000000) / 1000000
}

function buildSetupAlertPayload(
  phoneNumber,
  alertType,
  location,
  locationId,
  lat,
  long,
  alertBackendBaseUrl
) {
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
    long: longitude
  }

  return { latitude, longitude, sanitizedLocation, payload }
}

function logDuplicateCheck(
  phoneNumber,
  sanitizedLocation,
  latitude,
  longitude,
  alertKey
) {
  const duplicateCheckLog = {
    phoneNumber: getMaskedPhonePrefix(phoneNumber),
    sanitizedLocation,
    latitude,
    longitude,
    generatedKey: alertKey,
    existingKeys: Array.from(mockAlertStorage.keys()),
    keyExists: mockAlertStorage.has(alertKey)
  }
  logger.info(
    `Mock: Checking for duplicate alert: ${JSON.stringify(duplicateCheckLog)}`,
    duplicateCheckLog
  )
}

export async function setupAlert(
  phoneNumber,
  alertType,
  location,
  locationId,
  lat,
  long,
  request = null
) {
  const setupPath = config.get('notify.setupAlertPath')
  const alertBackendBaseUrl = config.get(CONFIG_NOTIFY_ALERT_BACKEND_BASE_URL)
  const mockSetupAlertEnabled = config.get('notify.mockSetupAlertEnabled')
  const { latitude, longitude, sanitizedLocation, payload } =
    buildSetupAlertPayload(
      phoneNumber,
      alertType,
      location,
      locationId,
      lat,
      long,
      alertBackendBaseUrl
    )

  if (mockSetupAlertEnabled) {
    logger.info('Mock setup alert enabled, bypassing backend for setup-alert')
    const mockResult = tryStoreMockAlert({
      phoneNumber,
      alertType,
      locationId,
      sanitizedLocation,
      latitude,
      longitude,
      fallbackMode: false
    })
    return mockResult
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

export function getMockAlerts() {
  const alerts = []
  for (const [key, value] of mockAlertStorage.entries()) {
    alerts.push({ key, ...value })
  }
  return alerts
}

export function clearMockAlerts() {
  const count = mockAlertStorage.size
  mockAlertStorage.clear()
  const mockAlertsClearedLog = { count }
  logger.info(
    `Mock alerts cleared: ${JSON.stringify(mockAlertsClearedLog)}`,
    mockAlertsClearedLog
  )
  return count
}

export function removeMockAlert(phoneNumber, location, lat, long) {
  const key = generateAlertKey(phoneNumber, location, lat, long)
  const existed = mockAlertStorage.has(key)
  mockAlertStorage.delete(key)
  const mockAlertRemovedLog = {
    existed,
    phoneNumber: getMaskedPhonePrefix(phoneNumber)
  }
  logger.info(
    `Mock alert removed: ${JSON.stringify(mockAlertRemovedLog)}`,
    mockAlertRemovedLog
  )
  return existed
}
