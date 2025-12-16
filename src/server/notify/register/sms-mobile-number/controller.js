import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { recordSmsCapture } from '../../../common/services/subscription.js'
import { validateUKMobile } from '../../../common/helpers/validate-uk-mobile.js'

// Constants for repeated strings
const PAGE_HEADING = 'What is your mobile phone number?'

// Create a logger instance ''
const logger = createLogger()

const handleNotifyRequest = (request, h, content = english) => {
  // Capture location from query parameter if provided
  if (request.query.location) {
    request.yar.set('location', request.query.location)
  }

  // Capture latitude and longitude from query parameters ''
  if (request.query.lat) {
    request.yar.set('latitude', request.query.lat)
  }
  if (request.query.long) {
    request.yar.set('longitude', request.query.long)
  }

  // Log coordinates for debugging ''
  logger.info('Starting notify journey', {
    hasQueryLat: !!request.query.lat,
    hasQueryLong: !!request.query.long,
    hasQueryLocation: !!request.query.location,
    lat: request.yar.get('latitude'),
    long: request.yar.get('longitude'),
    location: request.yar.get('location')
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

  const { footerTxt, phaseBanner, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  const viewModel = {
    pageTitle: `${PAGE_HEADING} - Check air quality - GOV.UK`,
    heading: PAGE_HEADING,
    page: PAGE_HEADING,
    serviceName: 'Check air quality',
    lang: LANG_EN,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    backlink: {
      text: 'Back'
    },
    cookieBanner,
    formData: request.yar.get('formData') || {}
  }

  // Only show back button if locationId exists ''
  if (locationId) {
    viewModel.displayBacklink = true
    viewModel.customBackLink = true
    viewModel.backLinkText = 'Back'
    viewModel.backLinkUrl = `/location/${locationId}`
  }

  return h.view('notify/register/sms-mobile-number/index', viewModel)
}

const handleNotifyPost = async (request, h, content = english) => {
  const { notifyByText } = request.payload

  // Validate UK mobile number ''
  const validation = validateUKMobile(notifyByText)

  if (!validation.isValid) {
    // Get locationId from session or query parameter to build back link ''
    const locationId =
      request.query.locationId || request.yar.get('locationId') || ''

    const { footerTxt, phaseBanner, cookieBanner } = content
    const metaSiteUrl = getAirQualitySiteUrl(request)

    const viewModel = {
      pageTitle: `Error: ${PAGE_HEADING} - Check air quality - GOV.UK`,
      heading: PAGE_HEADING,
      page: PAGE_HEADING,
      serviceName: 'Check air quality',
      lang: LANG_EN,
      metaSiteUrl,
      footerTxt,
      phaseBanner,
      backlink: {
        text: 'Back'
      },
      cookieBanner,
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
      viewModel.backLinkText = 'Back'
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
