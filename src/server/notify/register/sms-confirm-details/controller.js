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
    pageTitle: `${smsConfirmDetails.pageTitle} - Check air quality - GOV.UK`,
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
    formData: request.yar.get('formData') || {}
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
    locationId,
    lat,
    long,
    hasLat: !!lat,
    hasLong: !!long,
    hasLocationId: !!locationId
  })

  if (!phoneNumber || !location) {
    logger.warn('Missing phone number or location in session')
    return h.redirect('/notify/register/sms-mobile-number')
  }

  if (!lat || !long) {
    logger.warn('Missing coordinates in session', { lat, long })
  }

  // Call setup-alert API with all required fields ''
  const { setupAlert } = await import('../../../common/services/notify.js')

  // Log the payload being sent ''
  logger.info('Calling setupAlert with payload', {
    phoneNumber: '***' + phoneNumber.slice(-4),
    alertType: 'sms',
    location,
    locationId,
    lat,
    long
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

  if (!result.ok) {
    // Treat 409 (Conflict) as a non-error: subscription already exists
    if (result.status === 409) {
      logger.warn('Alert already exists for this phone/location; continuing', {
        status: result.status,
        locationId,
        phoneLast4: phoneNumber ? phoneNumber.slice(-4) : undefined
      })
    } else {
      logger.error('Failed to setup alert', {
        error: result.error,
        status: result.status
      })
    }
    // Continue to success page to keep UX smooth
  } else {
    logger.info('Alert setup successful', { data: result.data })
  }

  // Store confirmation in session ''
  request.yar.set('alertDetailsConfirmed', true)

  // Redirect to success page ''
  return h.redirect('/notify/register/sms-success')
}

export { handleConfirmAlertDetailsRequest, handleConfirmAlertDetailsPost }
