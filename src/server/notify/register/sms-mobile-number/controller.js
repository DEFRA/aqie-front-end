import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { recordSmsCapture } from '../../../common/services/subscription.js'
import { validateUKMobile } from '../../../common/helpers/validate-uk-mobile.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'

// Constants for repeated strings ''
const DEFAULT_SERVICE_NAME = 'Check air quality'

// Create a logger instance ''
const logger = createLogger()

const handleNotifyRequest = (request, h, content = english) => {
  // '' Check if user has reached maximum alerts
  const maxAlertsError = request.yar.get('maxAlertsError')
  const maskedPhoneNumber = request.yar.get('maskedPhoneNumber')

  // '' Clear the error flags after reading them
  if (maxAlertsError) {
    request.yar.clear('maxAlertsError')
    request.yar.clear('maskedPhoneNumber')
  }

  // Capture location from query parameter if provided
  if (request.query.location) {
    // '' Remove 'Air quality in' prefix if present to ensure consistency
    const sanitizedLocation = request.query.location
      .replace(/^\s*air\s+quality\s+in\s+/i, '')
      .trim()
    request.yar.set('location', sanitizedLocation)
    // '' Log the location string to debug sanitization
    logger.info('Location captured from query parameter', {
      rawLocation: request.query.location,
      sanitizedLocation,
      wasModified: sanitizedLocation !== request.query.location
    })
  }

  // Capture latitude and longitude from query parameters ''
  // '' Round to 6 decimal places for consistency with BNG-converted coordinates
  if (request.query.lat) {
    const lat =
      Math.round(Number.parseFloat(request.query.lat) * 1000000) / 1000000
    request.yar.set('latitude', lat)
  }
  if (request.query.long) {
    const lon =
      Math.round(Number.parseFloat(request.query.long) * 1000000) / 1000000
    request.yar.set('longitude', lon)
  }

  // Log coordinates for debugging ''
  logger.info('Starting notify journey', {
    hasQueryLat: !!request.query.lat,
    hasQueryLong: !!request.query.long,
    hasQueryLocation: !!request.query.location,
    queryLat: request.query.lat,
    queryLong: request.query.long,
    queryLocation: request.query.location,
    sessionLat: request.yar.get('latitude'),
    sessionLong: request.yar.get('longitude'),
    sessionLocation: request.yar.get('location')
  })

  // Set the journey start in session
  request.yar.set('notifyJourney', 'started')

  // Capture and store locationId in session for back navigation ''
  if (request.query.locationId) {
    request.yar.set('locationId', request.query.locationId)
  }

  // Get locationId from session or query parameter to build back link ''
  const locationId =
    request.query.locationId || request.yar.get('locationId') || ''

  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  const { footerTxt, phaseBanner, cookieBanner } = languageContent
  const common = languageContent.common || english.common
  const smsMobilePhone =
    languageContent.smsMobilePhone || english.smsMobilePhone
  const smsMobileNumber =
    languageContent.smsMobileNumber || english.smsMobileNumber
  const metaSiteUrl = getAirQualitySiteUrl(request)
  const pageTitle = smsMobilePhone.pageTitle
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME

  const viewModel = {
    pageTitle: maxAlertsError
      ? `Error: ${pageTitle} - ${serviceName} - GOV.UK`
      : `${pageTitle} - ${serviceName} - GOV.UK`,
    heading: smsMobilePhone.heading,
    page: smsMobilePhone.heading,
    serviceName,
    lang,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    backlink: {
      text: common?.backLinkText || 'Back'
    },
    cookieBanner,
    common,
    content: smsMobilePhone,
    formData: request.yar.get('formData') || {},
    alertLimitHint:
      smsMobilePhone.alertLimitHint ||
      english.smsMobilePhone?.alertLimitHint ||
      ''
  }

  // '' Add max alerts error if present
  if (maxAlertsError && maskedPhoneNumber) {
    const errorMessages = smsMobileNumber?.errors?.maxAlertsReached
    viewModel.error = {
      message: errorMessages?.field || '',
      field: 'notifyByText'
    }
    viewModel.maxAlertsError = {
      summary: (errorMessages?.summary || '').replace(
        '{phoneNumber}',
        maskedPhoneNumber
      ),
      field: errorMessages?.field || ''
    }
  }

  // Only show back button if locationId exists ''
  if (locationId) {
    viewModel.displayBacklink = true
    viewModel.customBackLink = true
    viewModel.backLinkText = common?.backLinkText || 'Back'
    viewModel.backLinkUrl = `/location/${locationId}`
  }

  return h.view('notify/register/sms-mobile-number/index', viewModel)
}

const handleNotifyPost = async (request, h, content = english) => {
  const { notifyByText } = request.payload

  // Validate UK mobile number ''
  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  const { footerTxt, phaseBanner, cookieBanner } = languageContent
  const common = languageContent.common || english.common
  const smsMobilePhone =
    languageContent.smsMobilePhone || english.smsMobilePhone
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME
  const pageTitle = smsMobilePhone.pageTitle
  const metaSiteUrl = getAirQualitySiteUrl(request)

  const validation = validateUKMobile(notifyByText, {
    empty: smsMobilePhone.errors?.empty,
    format: smsMobilePhone.errors?.format
  })

  if (!validation.isValid) {
    // Get locationId from session or query parameter to build back link ''
    const locationId =
      request.query.locationId || request.yar.get('locationId') || ''

    const viewModel = {
      pageTitle: `Error: ${pageTitle} - ${serviceName} - GOV.UK`,
      heading: smsMobilePhone.heading,
      page: smsMobilePhone.heading,
      serviceName,
      lang,
      metaSiteUrl,
      footerTxt,
      phaseBanner,
      backlink: {
        text: common?.backLinkText || 'Back'
      },
      cookieBanner,
      common,
      content: smsMobilePhone,
      error: {
        message: validation.error,
        field: 'notifyByText'
      },
      formData: request.payload
    }

    // Only show back button if locationId exists ''
    if (locationId) {
      viewModel.displayBacklink = true
      viewModel.customBackLink = true
      viewModel.backLinkText = common?.backLinkText || 'Back'
      viewModel.backLinkUrl = `/location/${locationId}`
    }

    return h.view('notify/register/sms-mobile-number/index', viewModel)
  }

  // Store the formatted mobile number in session ''
  request.yar.set('mobileNumber', validation.formatted)

  // Fire-and-forget capture to subscription backend ''
  try {
    const res = await recordSmsCapture(validation.formatted)
    if (res?.ok) {
      logger.debug('Recorded SMS capture')
    } else if (res?.skipped) {
      logger.debug('Subscription capture skipped (disabled)')
    } else {
      logger.warn('Failed to record SMS capture', { status: res?.status })
    }
  } catch (err) {
    logger.error('Error recording SMS capture', err)
  }

  // Redirect to send activation page ''
  return h.redirect('/notify/register/sms-send-activation')
}

export { handleNotifyRequest, handleNotifyPost }
