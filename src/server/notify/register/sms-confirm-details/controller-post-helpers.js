import { createLogger } from '../../../common/helpers/logging/logger.js'
import { config } from '../../../../config/index.js'

const SMS_MOBILE_NUMBER_PATH_KEY = 'notify.smsMobileNumberPath'
const PHONE_LAST_DIGITS = 4
const LOCATION_LOG_PREVIEW_LENGTH = 20
const STATUS_BAD_REQUEST = 400
const STATUS_CONFLICT = 409

const logger = createLogger()

const getAlertSetupSessionData = (request) => ({
  phoneNumber: request.yar.get('mobileNumber'),
  location: request.yar.get('location'),
  locationId: request.yar.get('locationId'),
  lat: request.yar.get('latitude'),
  long: request.yar.get('longitude')
})

const logAlertSetupSessionData = ({
  phoneNumber,
  location,
  locationId,
  lat,
  long
}) => {
  logger.info('Session data for alert setup', {
    phoneNumber: phoneNumber
      ? `***${phoneNumber.slice(-PHONE_LAST_DIGITS)}`
      : undefined,
    location,
    locationStartsWith: location
      ? location.substring(
          0,
          Math.min(LOCATION_LOG_PREVIEW_LENGTH, location.length)
        )
      : undefined,
    locationHasAirQuality: location
      ? location.toLowerCase().includes('air quality')
      : false,
    locationId,
    lat,
    long,
    hasLat: !!lat,
    hasLong: !!long,
    hasLocationId: !!locationId
  })
}

const logMissingAlertSetupSessionData = ({
  phoneNumber,
  location,
  lat,
  long
}) => {
  if (!phoneNumber || !location) {
    logger.error(
      'Missing phone number or location in session - this should not happen',
      {
        hasPhoneNumber: !!phoneNumber,
        hasLocation: !!location
      }
    )
  }

  if (!lat || !long) {
    logger.warn('Missing coordinates in session', { lat, long })
  }
}

const handleSetupAlertFailure = ({
  request,
  h,
  result,
  phoneNumber,
  location
}) => {
  if (result.status === STATUS_BAD_REQUEST) {
    logger.warn('Maximum locations reached for this phone number', {
      status: result.status,
      message: result.body?.message,
      phoneLast4: phoneNumber
        ? phoneNumber.slice(-PHONE_LAST_DIGITS)
        : undefined
    })

    if (phoneNumber) {
      request.yar.set('maxAlertsError', true)
      request.yar.set('maskedPhoneNumber', phoneNumber)
    }

    request.yar.clear('mobileNumber')

    logger.warn('Redirecting to sms-mobile-number page with max alerts error')
    return h.redirect(config.get(SMS_MOBILE_NUMBER_PATH_KEY))
  }

  if (result.status === STATUS_CONFLICT) {
    logger.warn('Alert already exists for this phone/location', {
      status: result.status,
      message: result.body?.message,
      location,
      phoneLast4: phoneNumber
        ? phoneNumber.slice(-PHONE_LAST_DIGITS)
        : undefined
    })
    return h.redirect(config.get('notify.duplicateSubscriptionPath'))
  }

  logger.error('Failed to setup alert - unhandled error status', {
    error: result.error,
    status: result.status,
    body: result.body,
    statusType: typeof result.status,
    bodyKeys: result.body ? Object.keys(result.body) : []
  })
  request.yar.set('setupAlertError', true)
  request.yar.clear('mobileNumber')
  return h.redirect(config.get(SMS_MOBILE_NUMBER_PATH_KEY))
}

export {
  getAlertSetupSessionData,
  logAlertSetupSessionData,
  logMissingAlertSetupSessionData,
  handleSetupAlertFailure
}
