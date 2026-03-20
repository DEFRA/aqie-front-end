import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { config } from '../../../../config/index.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { recordEmailCapture } from '../../../common/services/subscription.js'
import { generateEmailLink } from '../../../common/services/notify.js'

const EMAIL_DETAILS_VIEW = 'notify/register/email-details/index'

// Create a logger instance ''
const logger = createLogger()

const getEmailDetailsContent = (content = english) => {
  const emailEnterEmail =
    content.emailEnterEmail || english.emailEnterEmail || {}
  const common = content.common || english.common || {}
  const emailDetails = content.emailDetails || english.emailDetails || {}

  const heading = emailEnterEmail.heading || 'What is your email address?'
  const serviceName = common.serviceName || 'Check air quality'
  const pageTitle = `${heading} - ${serviceName} - GOV.UK`
  const errorPageTitle = `Error: ${heading} - ${serviceName} - GOV.UK`

  return {
    heading,
    pageTitle,
    errorPageTitle,
    serviceName,
    sendFailureMessage:
      emailDetails.errors?.sendFailure ||
      english.emailDetails?.errors?.sendFailure ||
      'We could not send the email right now. Try again in a moment.'
  }
}

// GET handler for email details page ''
const handleEmailDetailsRequest = (request, h, content = english) => {
  try {
    const ui = getEmailDetailsContent(content)

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
      pageTitle: maxAlertsErrorObj ? ui.errorPageTitle : ui.pageTitle,
      heading: ui.heading,
      page: ui.heading,
      serviceName: ui.serviceName,
      lang: LANG_EN,
      metaSiteUrl,
      currentPath: request.path,
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

    return h.view(EMAIL_DETAILS_VIEW, viewModel)
  } catch (error) {
    // Log and present a generic error view (re-using template with message) ''
    logger.error('Error rendering email details page', error)
    const ui = getEmailDetailsContent(content)
    const metaSiteUrl = getAirQualitySiteUrl(request)
    return h.view(EMAIL_DETAILS_VIEW, {
      pageTitle: ui.errorPageTitle,
      heading: ui.heading,
      page: ui.heading,
      serviceName: ui.serviceName,
      lang: LANG_EN,
      metaSiteUrl,
      currentPath: request.path,
      error: { message: 'Sorry, there is a problem loading the page' },
      formData: {}
    })
  }
}

// POST handler for email details page ''
const handleEmailDetailsPost = async (request, h, content = english) => {
  try {
    const ui = getEmailDetailsContent(content)
    const { notifyByEmail } = request.payload || {}

    if (!notifyByEmail || notifyByEmail.trim() === '') {
      const { footerTxt, phaseBanner, backlink, cookieBanner } = content
      const metaSiteUrl = getAirQualitySiteUrl(request)

      const viewModel = {
        pageTitle: ui.errorPageTitle,
        heading: ui.heading,
        page: ui.heading,
        serviceName: ui.serviceName,
        lang: LANG_EN,
        metaSiteUrl,
        currentPath: request.path,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        error: { message: 'Enter your email address', field: 'notifyByEmail' },
        formData: request.payload
      }
      return h.view(EMAIL_DETAILS_VIEW, viewModel)
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
      const sendResult = await generateEmailLink(
        email,
        location,
        lat,
        long,
        request
      )

      if (!sendResult?.ok) {
        logger.warn('Notify email send skipped or failed', {
          status: sendResult?.status,
          skipped: sendResult?.skipped
        })

        const { footerTxt, phaseBanner, backlink, cookieBanner } = content
        const metaSiteUrl = getAirQualitySiteUrl(request)

        return h.view(EMAIL_DETAILS_VIEW, {
          pageTitle: ui.errorPageTitle,
          heading: ui.heading,
          page: ui.heading,
          serviceName: ui.serviceName,
          lang: LANG_EN,
          metaSiteUrl,
          currentPath: request.path,
          footerTxt,
          phaseBanner,
          backlink,
          cookieBanner,
          error: { message: ui.sendFailureMessage, field: 'notifyByEmail' },
          formData: request.payload
        })
      }

      request.yar.set('emailActivationSent', Date.now())
      logger.info('Queued Notify email link for delivery')
    } catch (err) {
      logger.error('Notify email send failed', err)

      const { footerTxt, phaseBanner, backlink, cookieBanner } = content
      const metaSiteUrl = getAirQualitySiteUrl(request)

      return h.view(EMAIL_DETAILS_VIEW, {
        pageTitle: ui.errorPageTitle,
        heading: ui.heading,
        page: ui.heading,
        serviceName: ui.serviceName,
        lang: LANG_EN,
        metaSiteUrl,
        currentPath: request.path,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        error: { message: ui.sendFailureMessage, field: 'notifyByEmail' },
        formData: request.payload
      })
    }

    const emailVerifyEmailPath = config.get('notify.emailVerifyEmailPath')
    return h.redirect(emailVerifyEmailPath)
  } catch (error) {
    logger.error('Error processing email details submission', error)
    const ui = getEmailDetailsContent(content)
    const metaSiteUrl = getAirQualitySiteUrl(request)
    return h.view(EMAIL_DETAILS_VIEW, {
      pageTitle: ui.errorPageTitle,
      heading: ui.heading,
      page: ui.heading,
      serviceName: ui.serviceName,
      lang: LANG_EN,
      metaSiteUrl,
      currentPath: request.path,
      error: { message: 'Sorry, there is a problem processing the form' },
      formData: request.payload || {}
    })
  }
}

export { handleEmailDetailsRequest, handleEmailDetailsPost }
