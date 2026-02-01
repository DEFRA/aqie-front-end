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

// In-memory storage for mock alerts (only used when mockSetupAlertEnabled is true) ''
// This allows testing duplicate detection and max alerts limit without a real database ''
const mockAlertStorage = new Map()

const PHONE_LAST_DIGITS_COUNT = 4
const UK_COUNTRY_CODE = '+44'
const UK_TRUNK_PREFIX = '0'
const MOCK_ALERTS_MAX_PER_PHONE = 5

function normalizePhoneNumber(phoneNumber = '') {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return ''
  }

  const digitsOnly = phoneNumber.replace(/\D/g, '')
  if (!digitsOnly) {
    return ''
  }

  // Already has country code
  if (digitsOnly.startsWith('44')) {
    return `${UK_COUNTRY_CODE}${digitsOnly.slice(2)}`
  }

  // UK mobile in national format, convert 07... -> +447...
  if (digitsOnly.startsWith('0')) {
    return `${UK_COUNTRY_CODE}${digitsOnly.slice(1)}`
  }

  // Fall back to raw digits; keeps key deterministic
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

// Helper to remove common presentation prefix from location strings
// Example: "Air quality in London, City of Westminster" -> "London, City of Westminster"
function sanitizeLocationName(location) {
  if (!location || typeof location !== 'string') return location
  const sanitized = location.replace(/^\s*air\s+quality\s+in\s+/i, '').trim()
  return sanitized
}

// Helper to normalize NI postcodes for duplicate detection ''
// Extracts just the postcode part from "BT1 1AA, Belfast" -> "BT1 1AA"
// This prevents duplicates like "BT1 1AA" and "BT1 1AA, Belfast"
function normalizeNIPostcode(location) {
  if (!location || typeof location !== 'string') return location
  
  // NI postcode pattern: BT followed by 1-2 digits, space(s), 1 digit, 2 letters
  const niPostcodeMatch = location.match(/^(BT\d{1,2})\s*(\d[A-Z]{2})/i)
  
  if (niPostcodeMatch) {
    // Return just the postcode part, normalized (uppercase, single space)
    return `${niPostcodeMatch[1]} ${niPostcodeMatch[2]}`.toUpperCase()
  }
  
  return location
}

// Helper to generate unique key for alert (phone + location + coordinates) ''
function generateAlertKey(phoneNumber, location, lat, long) {
  // Normalize NI postcodes to prevent duplicates with/without town names
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

// Helper to count alerts for a phone number ''
function countAlertsForPhone(phoneNumber) {
  let count = 0
  for (const key of mockAlertStorage.keys()) {
    if (key.startsWith(phoneNumber + '|')) {
      count++
    }
  }
  return count
}

/**
 * Make POST request to backend notify API with automatic local/remote handling ''
 * @param {Object} request - Hapi request object (for detecting localhost)
 * @param {string} apiPath - API path
 * @param {Object} body - Request body
 * @param {string} customBaseUrl - Optional custom base URL to override default notify.baseUrl
 * @returns {Object} Response object
 */
async function postToBackend(request, apiPath, body, customBaseUrl = null) {
  const enabled = config.get('notify.enabled')
  const baseUrl = customBaseUrl || config.get('notify.baseUrl')

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
        responseBody: data,
        bodyStringified: JSON.stringify(data)?.slice(0, MAX_ERROR_BODY_LENGTH)
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
  const mockOtpEnabled = config.get('notify.mockOtpEnabled')
  const mockOtpCode = config.get('notify.mockOtpCode') || '12345'

  // '' Try real service first
  const result = await postToBackend(request, smsPath, { phoneNumber })

  // '' If mock is enabled and service failed (otp_generated_notification_failed), use mock
  if (
    mockOtpEnabled &&
    (!result.ok || result.data?.status === 'otp_generated_notification_failed')
  ) {
    logger.warn(
      'SMS service failed or returned otp_generated_notification_failed, using mock OTP',
      {
        mockOtpCode,
        realServiceStatus: result.status,
        realServiceBody: result.data || result.body
      }
    )
    // '' Store mock OTP in session for verification with timestamp
    if (request) {
      request.yar.set('mockOtp', mockOtpCode)
      request.yar.set('mockOtpTimestamp', Date.now())
    }
    return {
      ok: true,
      data: { status: 'mock_otp_enabled', mockOtpCode },
      mock: true
    }
  }

  // '' Clear mock OTP if real service succeeded
  if (request && result.ok) {
    request.yar.clear('mockOtp')
  }

  return result
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
  const mockOtpEnabled = config.get('notify.mockOtpEnabled')
  const FIFTEEN_MINUTES_MS = 15 * 60 * 1000

  // '' Check if we're using mock OTP from session
  if (mockOtpEnabled && request) {
    const mockOtp = request.yar.get('mockOtp')
    const mockOtpTimestamp = request.yar.get('mockOtpTimestamp')

    if (mockOtp) {
      // '' Check if mock OTP has expired (15 minutes like real service)
      const isExpired =
        mockOtpTimestamp && Date.now() - mockOtpTimestamp > FIFTEEN_MINUTES_MS

      logger.info('Verifying against mock OTP', {
        otpMatches: otp === mockOtp,
        isExpired,
        ageMinutes: mockOtpTimestamp
          ? ((Date.now() - mockOtpTimestamp) / 60000).toFixed(2)
          : 'unknown'
      })

      if (isExpired) {
        // '' Clear expired mock OTP
        request.yar.clear('mockOtp')
        request.yar.clear('mockOtpTimestamp')
        return {
          ok: false,
          status: 400,
          body: { message: 'Secret has expired', mock: true }
        }
      }

      if (otp === mockOtp) {
        // '' Clear mock OTP after successful verification
        request.yar.clear('mockOtp')
        request.yar.clear('mockOtpTimestamp')
        return { ok: true, data: { status: 'verified', mock: true } }
      } else {
        return {
          ok: false,
          status: 400,
          body: { message: 'Invalid OTP code', mock: true }
        }
      }
    }
  }

  // '' Use real service if mock not enabled or no mock OTP in session
  return postToBackend(request, verifyPath, { phoneNumber, otp })
}

/**
 * Setup alert subscription via backend API ''
 * @param {string} phoneNumber - Phone number
 * @param {string} alertType - Type of alert (e.g., 'sms', 'email')
 * @param {string} location - Location for alerts
 * @param {string|number} lat - Latitude coordinate
 * @param {string|number} long - Longitude coordinate
 * @param {Object} request - Hapi request object (optional)
 * @returns {Promise<Object>} { ok: boolean, data: subscription details }
 */
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
  const alertBackendBaseUrl = config.get('notify.alertBackendBaseUrl')
  const mockSetupAlertEnabled = config.get('notify.mockSetupAlertEnabled')

  // Convert coordinates to numbers if they're strings ''
  // MongoDB may expect numeric values for geospatial queries
  // '' Round to 6 decimal places for consistency (~10cm precision)
  // '' This ensures coordinates from different sources (query params vs BNG conversion) match
  const latitude = lat
    ? Math.round(Number.parseFloat(lat) * 1000000) / 1000000
    : undefined
  const longitude = long
    ? Math.round(Number.parseFloat(long) * 1000000) / 1000000
    : undefined

  // Log coordinate conversion for debugging ''
  logger.info('Setting up alert with coordinates', {
    rawLat: lat,
    rawLong: long,
    parsedLat: latitude,
    parsedLong: longitude,
    latType: typeof latitude,
    longType: typeof longitude,
    locationId,
    alertBackendBaseUrl
  })

  const sanitizedLocation = sanitizeLocationName(location)

  const payload = {
    phoneNumber,
    alertType,
    location: sanitizedLocation,
    locationId,
    lat: latitude,
    long: longitude
  }

  // Do not log payload contents or sensitive fields
  if (sanitizedLocation !== location) {
    logger.info('Sanitized location name for alert setup', {
      original: location,
      sanitized: sanitizedLocation
    })
  }

  // Try real service first ''
  const result = await postToBackend(
    request,
    setupPath,
    payload,
    alertBackendBaseUrl
  )

  // '' Log backend response to debug duplicate detection
  logger.info('Backend response received', {
    ok: result.ok,
    status: result.status,
    error: result.error,
    bodyKeys: result.body ? Object.keys(result.body) : [],
    phoneNumberLast4: phoneNumber ? phoneNumber.slice(-4) : undefined,
    sanitizedLocation
  })

  // If backend service is unavailable (502/503/504) and mock is enabled, use in-memory storage ''
  // This handles cases where backend depends on notify service which may be down (50 SMS/day limit) ''
  // IMPORTANT: Only activates when service fails (never bypasses working service) ''
  // IMPORTANT: Should only be enabled in local/test environments, never in production ''
  const isServiceUnavailable =
    !result.ok && [502, 503, 504].includes(result.status)

  logger.info('Checking if mock should be used', {
    isServiceUnavailable,
    mockSetupAlertEnabled,
    status: result.status,
    willUseMock: isServiceUnavailable && mockSetupAlertEnabled
  })

  if (isServiceUnavailable && mockSetupAlertEnabled) {
    // Production safety check - throw error if mock is enabled in production
    const isProduction = config.get('env') === 'production'
    if (isProduction) {
      const errorMsg =
        'CRITICAL: Mock setup alert is enabled in production environment. This should NEVER happen. Set NOTIFY_MOCK_SETUP_ALERT_ENABLED=false immediately.'
      logger.error(errorMsg)
      throw new Error(errorMsg)
    }

    logger.warn(
      'Backend service unavailable (status: ' +
        result.status +
        '), using mock setup alert with in-memory storage'
    )
    logger.warn('Mock setup alert should NEVER be enabled in production')

    // Check if phone number already has 5 alerts (max limit) ''
    const normalizedPhone = normalizePhoneNumber(phoneNumber)
    const alertCount = countAlertsForPhone(normalizedPhone)

    // Log current storage state ''
    const currentStorage = Array.from(mockAlertStorage.entries()).map(
      ([key, value]) => ({
        key,
        location: value?.location,
        locationId: value?.locationId,
        phoneNumberMasked: maskPhoneNumber(value?.phoneNumber)
      })
    )
    logger.info(
      'Mock: Current storage state - Total entries: ' +
        mockAlertStorage.size +
        ', Alert count for this phone: ' +
        alertCount
    )
    logger.info(
      'Mock: All stored alerts: ' + JSON.stringify(currentStorage, null, 2)
    )

    if (alertCount >= MOCK_ALERTS_MAX_PER_PHONE) {
      logger.info('Mock: Phone number has reached max alerts limit (5)', {
        phoneNumber: phoneNumber.substring(0, 7) + '****',
        currentCount: alertCount
      })
      return {
        ok: false,
        status: 400,
        data: {
          message: 'Maximum number of alerts reached for this phone number',
          phoneNumber: maskPhoneNumberForResponse(phoneNumber),
          currentAlertCount: alertCount,
          maxAlerts: MOCK_ALERTS_MAX_PER_PHONE
        }
      }
    }

    // Check for duplicate alert (same phone + location + coordinates) ''
    const alertKey = generateStableAlertKey(
      phoneNumber,
      locationId,
      sanitizedLocation,
      latitude,
      longitude
    )

    logger.info('Mock: Checking for duplicate alert', {
      phoneNumber: phoneNumber.substring(0, 7) + '****',
      sanitizedLocation,
      latitude,
      longitude,
      generatedKey: alertKey,
      existingKeys: Array.from(mockAlertStorage.keys()),
      keyExists: mockAlertStorage.has(alertKey)
    })

    if (mockAlertStorage.has(alertKey)) {
      logger.info('Mock: Duplicate alert detected', {
        phoneNumber: phoneNumber.substring(0, 7) + '****',
        location: sanitizedLocation
      })
      return {
        ok: false,
        status: 409,
        data: {
          message: 'Alert already exists for this location and phone number',
          phoneNumber: maskPhoneNumberForResponse(phoneNumber),
          location: sanitizedLocation,
          coordinates: { lat: latitude, long: longitude }
        }
      }
    }

    // Store alert in mock storage ''
    mockAlertStorage.set(alertKey, {
      phoneNumber: normalizedPhone,
      alertType,
      location: sanitizedLocation,
      locationId,
      coordinates: { lat: latitude, long: longitude },
      createdAt: new Date().toISOString()
    })

    logger.info('Mock: Alert stored successfully', {
      phoneNumber: phoneNumber.substring(0, 7) + '****',
      sanitizedLocation,
      alertKey,
      totalAlerts: mockAlertStorage.size,
      allKeys: Array.from(mockAlertStorage.keys())
    })

    return {
      ok: true,
      status: 201,
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

  return result
}

/**
 * Check if user has reached maximum alerts ''
 * @param {string} phoneNumber - Phone number to check
 * @param {Object} request - Hapi request object (optional)
 * @returns {Promise<Object>} { ok: boolean, maxReached: boolean }
 */
export async function getSubscriptionCount(phoneNumber, request = null) {
  const alertBackendBaseUrl = config.get('notify.alertBackendBaseUrl')
  const getSubscriptionsPath =
    config.get('notify.getSubscriptionsPath') || '/api/subscriptions'

  logger.info('Checking maximum alerts', {
    alertBackendBaseUrl,
    getSubscriptionsPath,
    phoneNumberLast4: phoneNumber ? phoneNumber.slice(-4) : undefined
  })

  try {
    const enabled = config.get('notify.enabled')
    const baseUrl = alertBackendBaseUrl || config.get('notify.baseUrl')

    if (!enabled || !baseUrl) {
      logger.warn(
        'Notify API disabled or baseUrl missing; allowing by default',
        {
          getSubscriptionsPath,
          enabled,
          baseUrl: baseUrl || '[not configured]'
        }
      )
      return { ok: true, maxReached: false }
    }

    // Use reusable helper to build URL and options based on environment ''
    const { url, fetchOptions } = buildBackendApiFetchOptions(
      request,
      baseUrl,
      `${getSubscriptionsPath}/${encodeURIComponent(phoneNumber)}`,
      { method: 'GET', body: null }
    )

    const [status, data] = await catchFetchError(url, fetchOptions)

    // '' Backend returns 400 with specific message when max locations reached
    if (status === 400) {
      logger.warn('Maximum alerts reached', {
        statusCode: data?.statusCode,
        error: data?.error,
        message: data?.message
      })
      return { ok: true, maxReached: true }
    }

    // '' 200 OK means user can add more locations
    if (status === HTTP_STATUS_OK) {
      logger.info('User can add more locations')
      return { ok: true, maxReached: false }
    }

    // '' Any other status is treated as an error - fail open for better UX
    logger.warn('Unexpected response from subscriptions API', { status, data })
    return { ok: false, maxReached: false }
  } catch (err) {
    logger.error('Error checking subscriptions', err)
    return { ok: false, maxReached: false }
  }
}

/**
 * Get all mock alerts (for testing/debugging only) ''
 * @returns {Array} Array of mock alerts
 */
export function getMockAlerts() {
  const alerts = []
  for (const [key, value] of mockAlertStorage.entries()) {
    alerts.push({ key, ...value })
  }
  return alerts
}

/**
 * Clear all mock alerts (for testing/debugging only) ''
 * @returns {number} Number of alerts cleared
 */
export function clearMockAlerts() {
  const count = mockAlertStorage.size
  mockAlertStorage.clear()
  logger.info('Mock alerts cleared', { count })
  return count
}

/**
 * Remove specific mock alert (for testing/debugging only) ''
 * @param {string} phoneNumber - Phone number
 * @param {string} location - Location name
 * @param {number} lat - Latitude
 * @param {number} long - Longitude
 * @returns {boolean} True if alert was removed
 */
export function removeMockAlert(phoneNumber, location, lat, long) {
  const key = generateAlertKey(phoneNumber, location, lat, long)
  const existed = mockAlertStorage.has(key)
  mockAlertStorage.delete(key)
  logger.info('Mock alert removed', {
    existed,
    phoneNumber: phoneNumber.substring(0, 7) + '****'
  })
  return existed
}
