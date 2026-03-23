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
const COORDINATE_PRECISION_FACTOR = 1000000

// Create a logger instance ''
const logger = createLogger()

const roundCoordinate = (value) => {
  return (
    Math.round(Number.parseFloat(value) * COORDINATE_PRECISION_FACTOR) /
    COORDINATE_PRECISION_FACTOR
  )
}

const sanitizeLocation = (location = '') => {
  return location.replace(/^\s*air\s+quality\s+in\s+/i, '').trim()
}

const applyQueryDataToSession = (request) => {
  if (request.query.location) {
    const sanitizedLocation = sanitizeLocation(request.query.location)
    request.yar.set('location', sanitizedLocation)
    logger.info('Location captured from query parameter', {
      rawLocation: request.query.location,
      sanitizedLocation,
      wasModified: sanitizedLocation !== request.query.location
    })
  }

  if (request.query.lat) {
    request.yar.set('latitude', roundCoordinate(request.query.lat))
  }

  if (request.query.long) {
    request.yar.set('longitude', roundCoordinate(request.query.long))
  }

  if (request.query.locationId) {
    request.yar.set('locationId', request.query.locationId)
  }
}

const getLocationIdForBackLink = (request) => {
  return request.query.locationId || request.yar.get('locationId') || ''
}

const getNotifyPageContent = (request, content = english) => {
  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  const { footerTxt, phaseBanner, cookieBanner } = languageContent
  const common = languageContent.common || english.common
  const smsMobilePhone =
    languageContent.smsMobilePhone || english.smsMobilePhone
  const smsMobileNumber =
    languageContent.smsMobileNumber || english.smsMobileNumber

  return {
    lang,
    footerTxt,
    phaseBanner,
    cookieBanner,
    common,
    smsMobilePhone,
    smsMobileNumber,
    serviceName: common?.serviceName || DEFAULT_SERVICE_NAME,
    pageTitle: smsMobilePhone.pageTitle,
    metaSiteUrl: getAirQualitySiteUrl(request)
  }
}

const withBackLink = (viewModel, locationId, backLinkText) => {
  if (!locationId) {
    return viewModel
  }

  return {
    ...viewModel,
    displayBacklink: true,
    customBackLink: true,
    backLinkText,
    backLinkUrl: `/location/${locationId}`
  }
}

const withMaxAlertsError = (viewModel, smsMobileNumber, maskedPhoneNumber) => {
  const errorMessages = smsMobileNumber?.errors?.maxAlertsReached

  return {
    ...viewModel,
    error: {
      message: errorMessages?.field || '',
      field: 'notifyByText'
    },
    maxAlertsError: {
      summary: (errorMessages?.summary || '').replace(
        '{phoneNumber}',
        maskedPhoneNumber
      ),
      field: errorMessages?.field || ''
    }
  }
}

const handleNotifyRequest = (request, h, content = english) => {
  // '' Check if user has reached maximum alerts
  const maxAlertsError = request.yar.get('maxAlertsError')
  const maskedPhoneNumber = request.yar.get('maskedPhoneNumber')

  // '' Clear the error flags after reading them
  if (maxAlertsError) {
    request.yar.clear('maxAlertsError')
    request.yar.clear('maskedPhoneNumber')
  }

  applyQueryDataToSession(request)

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

  // Get locationId from session or query parameter to build back link ''
  const locationId = getLocationIdForBackLink(request)
  const {
    lang,
    footerTxt,
    phaseBanner,
    cookieBanner,
    common,
    smsMobilePhone,
    smsMobileNumber,
    serviceName,
    pageTitle,
    metaSiteUrl
  } = getNotifyPageContent(request, content)

  let viewModel = {
    pageTitle: maxAlertsError
      ? `Error: ${pageTitle} - ${serviceName} - GOV.UK`
      : `${pageTitle} - ${serviceName} - GOV.UK`,
    heading: smsMobilePhone.heading,
    page: smsMobilePhone.heading,
    serviceName,
    lang,
    metaSiteUrl,
    currentPath: request.path,
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
    viewModel = withMaxAlertsError(
      viewModel,
      smsMobileNumber,
      maskedPhoneNumber
    )
  }

  // Only show back button if locationId exists ''
  viewModel = withBackLink(
    viewModel,
    locationId,
    common?.backLinkText || 'Back'
  )

  return h.view('notify/register/sms-mobile-number/index', viewModel)
}

const handleNotifyPost = async (request, h, content = english) => {
  const { notifyByText } = request.payload

  // Validate UK mobile number ''
  const {
    lang,
    footerTxt,
    phaseBanner,
    cookieBanner,
    common,
    smsMobilePhone,
    serviceName,
    pageTitle,
    metaSiteUrl
  } = getNotifyPageContent(request, content)

  const validation = validateUKMobile(notifyByText, {
    empty: smsMobilePhone.errors?.empty,
    format: smsMobilePhone.errors?.format
  })

  if (!validation.isValid) {
    // Get locationId from session or query parameter to build back link ''
    const locationId = getLocationIdForBackLink(request)

    let viewModel = {
      pageTitle: `Error: ${pageTitle} - ${serviceName} - GOV.UK`,
      heading: smsMobilePhone.heading,
      page: smsMobilePhone.heading,
      serviceName,
      lang,
      metaSiteUrl,
      currentPath: request.path,
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
    viewModel = withBackLink(
      viewModel,
      locationId,
      common?.backLinkText || 'Back'
    )

    return h.view('notify/register/sms-mobile-number/index', viewModel)
  }

  // Store the formatted mobile number in session ''
  request.yar.set('mobileNumber', validation.formatted)

  // Fire-and-forget capture to subscription backend ''
  try {
    const res = await recordSmsCapture(validation.formatted, request)
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
