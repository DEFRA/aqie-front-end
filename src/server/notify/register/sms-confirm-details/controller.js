import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'

// Constants ''
const LOCATION_PLACEHOLDER = '{location}'

// Create a logger instance ''
const logger = createLogger()

const handleConfirmAlertDetailsRequest = (request, h, content = english) => {
  logger.info('Showing confirm alert details page')

  const { footerTxt, phaseBanner, cookieBanner, smsConfirmDetails } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // '' Check for duplicate alert error
  const duplicateAlertError = request.yar.get('duplicateAlertError')
  const duplicateAlertLocation = request.yar.get('duplicateAlertLocation')

  // '' Clear error flags after reading
  if (duplicateAlertError) {
    request.yar.clear('duplicateAlertError')
    request.yar.clear('duplicateAlertLocation')
  }

  // Get data from session ''
  const mobileNumber = request.yar.get('mobileNumber') || 'Not provided'
  const location = request.yar.get('location') || 'Unknown location'

  // Replace {location} placeholder with actual location ''
  const heading = smsConfirmDetails.heading.replace(
    LOCATION_PLACEHOLDER,
    location
  )
  const forecastAlert = smsConfirmDetails.alertTypes.forecast.replace(
    LOCATION_PLACEHOLDER,
    location
  )
  const monitoringAlert = smsConfirmDetails.alertTypes.monitoring.replace(
    LOCATION_PLACEHOLDER,
    location
  )

  const viewModel = {
    pageTitle: duplicateAlertError
      ? `Error: ${smsConfirmDetails.pageTitle} - Check air quality - GOV.UK`
      : `${smsConfirmDetails.pageTitle} - Check air quality - GOV.UK`,
    heading,
    page: heading,
    serviceName: 'Check air quality',
    lang: LANG_EN,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    cookieBanner,
    displayBacklink: false,
    content: smsConfirmDetails,
    mobileNumber,
    location,
    forecastAlert,
    monitoringAlert,
    formData: request.yar.get('formData') || {},
    duplicateAlertError: duplicateAlertError
      ? {
          summary: `You have already set up an alert for ${duplicateAlertLocation || location}. Choose a different location or mobile phone number.`,
          message:
            'Select yes if you want to receive air quality alerts for a different location'
        }
      : null
  }

  return h.view('notify/register/sms-confirm-details/index', viewModel)
}

const handleConfirmAlertDetailsPost = async (request, h) => {
  logger.info('Processing alert confirmation')

  // Get data from session ''
  const phoneNumber = request.yar.get('mobileNumber')
  const location = request.yar.get('location')
  const locationId = request.yar.get('locationId')
  const lat = request.yar.get('latitude')
  const long = request.yar.get('longitude')

  // Log all session data for debugging ''
  logger.info('Session data for alert setup', {
    phoneNumber: phoneNumber ? '***' + phoneNumber.slice(-4) : undefined,
    location,
    locationStartsWith: location
      ? location.substring(0, Math.min(20, location.length))
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

  // '' If phone number or location is missing, log error but continue
  // '' The API call will fail and handle the error appropriately
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

  // Call setup-alert API with all required fields ''
  const { setupAlert } = await import('../../../common/services/notify.js')

  // Log minimal, non-sensitive metadata only
  logger.info('Submitting alert setup request', {
    locationId,
    hasCoordinates: Boolean(lat && long)
  })

  const result = await setupAlert(
    phoneNumber,
    'sms',
    location,
    locationId,
    lat,
    long,
    request
  )

  // '' Debug logging to see actual result
  logger.info('Setup alert result received', {
    ok: result.ok,
    status: result.status,
    hasBody: !!result.body,
    hasError: !!result.error,
    bodyMessage: result.body?.message,
    bodyStatusCode: result.body?.statusCode,
    bodyError: result.body?.error
  })

  if (!result.ok) {
    // '' Handle 400 Bad Request - Maximum 5 locations reached
    if (result.status === 400) {
      logger.warn('Maximum locations reached for this phone number', {
        status: result.status,
        message: result.body?.message,
        phoneLast4: phoneNumber ? phoneNumber.slice(-4) : undefined
      })
      // '' Store error in session and redirect to mobile number page
      const maskedNumber = phoneNumber
      request.yar.set('maxAlertsError', true)
      request.yar.set('maskedPhoneNumber', maskedNumber)
      request.yar.clear('mobileNumber')
      return h.redirect('/notify/register/sms-mobile-number')
    }

    // '' Handle 409 Conflict - Alert already exists for this location
    if (result.status === 409) {
      logger.warn('Alert already exists for this phone/location', {
        status: result.status,
        message: result.body?.message,
        location,
        phoneLast4: phoneNumber ? phoneNumber.slice(-4) : undefined
      })
      // '' Keep notificationFlow active so user can search for different location
      // '' Don't clear it here - let user continue the flow with a different location
      // '' Redirect to duplicate subscription page
      return h.redirect('/notify/register/duplicate-subscription')
    }

    // '' Handle other errors - redirect back to mobile number page
    logger.error('Failed to setup alert - unhandled error status', {
      error: result.error,
      status: result.status,
      body: result.body,
      statusType: typeof result.status,
      bodyKeys: result.body ? Object.keys(result.body) : []
    })
    // '' Store error and redirect back to mobile number page
    request.yar.set('setupAlertError', true)
    request.yar.clear('mobileNumber')
    return h.redirect('/notify/register/sms-mobile-number')
  }

  logger.info('Alert setup successful', { data: result.data })

  // Store confirmation in session ''
  request.yar.set('alertDetailsConfirmed', true)

  // Redirect to success page ''
  return h.redirect('/notify/register/sms-success')
}

export { handleConfirmAlertDetailsRequest, handleConfirmAlertDetailsPost }
