import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { config } from '../../../../config/index.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { recordEmailCapture } from '../../../common/services/subscription.js'
import { generateEmailLink } from '../../../common/services/notify.js'

// Constants for repeated strings
const PAGE_HEADING = 'What is your email address?'
const SERVICE_NAME = 'Check air quality'
const VIEW_PATH = 'notify/register/email-details/index'
const ERROR_PAGE_TITLE =
  'Error: What is your email address? - Check air quality - GOV.UK'

// Create a logger instance ''
const logger = createLogger()

// GET handler for email details page ''
const handleEmailDetailsRequest = (request, h, content = english) => {
  try {
    logger.info('Starting email notify journey')
    request.yar.set('notifyJourney', 'email-started') // ''

    // '' Read max-alerts error flag set by email-confirm-link after a 400 response
    const maxAlertsEmailError = request.yar.get('maxAlertsEmailError')
    const maxAlertsEmail = request.yar.get('maxAlertsEmail')
    if (maxAlertsEmailError) {
      request.yar.clear('maxAlertsEmailError')
      request.yar.clear('maxAlertsEmail')
    }

    // Capture location from query parameter if provided
    if (request.query.location) {
      const sanitizedLocation = request.query.location
        .replace(/^\s*air\s+quality\s+in\s+/i, '')
        .trim()
      request.yar.set('location', sanitizedLocation)
    }

    // Capture latitude and longitude from query parameters ''
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

    // Capture and store locationId in session for back navigation ''
    if (request.query.locationId) {
      request.yar.set('locationId', request.query.locationId)
    }

    const { footerTxt, phaseBanner, backlink, cookieBanner } = content
    const metaSiteUrl = getAirQualitySiteUrl(request)

    // '' Build error objects for max-alerts condition
    const emailDetailsContent =
      content.emailDetails || english.emailDetails || {}
    const emailDetailsErrors = emailDetailsContent.errors || {}
    const maxAlertsErrorObj =
      maxAlertsEmailError && maxAlertsEmail
        ? {
            summary: (
              emailDetailsErrors.maxAlertsReached?.summary || ''
            ).replace('{email}', maxAlertsEmail),
            field: emailDetailsErrors.maxAlertsReached?.field || ''
          }
        : null

    const viewModel = {
      pageTitle: maxAlertsErrorObj
        ? `Error: ${PAGE_HEADING} - ${SERVICE_NAME} - GOV.UK`
        : `${PAGE_HEADING} - ${SERVICE_NAME} - GOV.UK`,
      heading: PAGE_HEADING,
      page: PAGE_HEADING,
      serviceName: SERVICE_NAME,
      lang: LANG_EN,
      metaSiteUrl,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      formData: request.yar.get('formData') || {},
      maxAlertsError: maxAlertsErrorObj,
      alertLimitHint:
        emailDetailsContent.alertLimitHint ||
        english.emailDetails?.alertLimitHint ||
        ''
    }

    return h.view(VIEW_PATH, viewModel)
  } catch (error) {
    // Log and present a generic error view (re-using template with message) ''
    logger.error('Error rendering email details page', error)
    const metaSiteUrl = getAirQualitySiteUrl(request)
    return h.view(VIEW_PATH, {
      pageTitle: ERROR_PAGE_TITLE,
      heading: PAGE_HEADING,
      page: PAGE_HEADING,
      serviceName: SERVICE_NAME,
      lang: LANG_EN,
      metaSiteUrl,
      error: { message: 'Sorry, there is a problem loading the page' },
      formData: {}
    })
  }
}

// POST handler for email details page ''
const handleEmailDetailsPost = async (request, h, content = english) => {
  try {
    const { notifyByEmail } = request.payload || {}

    if (!notifyByEmail || notifyByEmail.trim() === '') {
      const { footerTxt, phaseBanner, backlink, cookieBanner } = content
      const metaSiteUrl = getAirQualitySiteUrl(request)

      const viewModel = {
        pageTitle: ERROR_PAGE_TITLE,
        heading: PAGE_HEADING,
        page: PAGE_HEADING,
        serviceName: SERVICE_NAME,
        lang: LANG_EN,
        metaSiteUrl,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        error: { message: 'Enter your email address', field: 'notifyByEmail' },
        formData: request.payload
      }
      return h.view(VIEW_PATH, viewModel)
    }

    // Store the email in session ''
    const email = notifyByEmail.trim()
    request.yar.set('emailAddress', email)
    const location = request.yar.get('location') || ''
    const lat = request.yar.get('latitude')
    const long = request.yar.get('longitude')

    // '' Note: the backend has no GET /api/subscriptions endpoint for email.
    // '' Max-5 enforcement happens at POST /setup-alert (after the user clicks
    // '' the activation link). The email-confirm-link controller handles the 400
    // '' and redirects back here with maxAlertsEmailError + maxAlertsEmail flags.
    try {
      const res = await recordEmailCapture(email)
      if (res?.ok) {
        logger.debug('Recorded email capture')
      } else if (res?.skipped) {
        logger.debug('Subscription capture skipped (disabled)')
      } else {
        logger.warn('Failed to record email capture', { status: res?.status })
      }
    } catch (err) {
      logger.error('Error recording email capture', err)
    }

    // Send activation link and redirect to check email page ''
    try {
      await generateEmailLink(email, location, lat, long, request)
      request.yar.set('emailActivationSent', Date.now())
      logger.info('Queued Notify email link for delivery')
    } catch (err) {
      logger.error('Notify email send failed', err)
    }

    const emailVerifyEmailPath = config.get('notify.emailVerifyEmailPath')
    return h.redirect(emailVerifyEmailPath)
  } catch (error) {
    logger.error('Error processing email details submission', error)
    const metaSiteUrl = getAirQualitySiteUrl(request)
    return h.view(VIEW_PATH, {
      pageTitle: ERROR_PAGE_TITLE,
      heading: PAGE_HEADING,
      page: PAGE_HEADING,
      serviceName: SERVICE_NAME,
      lang: LANG_EN,
      metaSiteUrl,
      error: { message: 'Sorry, there is a problem processing the form' },
      formData: request.payload || {}
    })
  }
}

export { handleEmailDetailsRequest, handleEmailDetailsPost }
