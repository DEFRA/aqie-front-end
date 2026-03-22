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

const getLayoutContent = (content = english) => {
  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
  return { footerTxt, phaseBanner, backlink, cookieBanner }
}

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

const buildBaseViewModel = (request, content, ui, pageTitle) => {
  const { footerTxt, phaseBanner, backlink, cookieBanner } =
    getLayoutContent(content)

  return {
    pageTitle,
    heading: ui.heading,
    page: ui.heading,
    serviceName: ui.serviceName,
    lang: LANG_EN,
    metaSiteUrl: getAirQualitySiteUrl(request),
    currentPath: request.path,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner
  }
}

const renderEmailDetailsView = (h, request, content, ui, extra = {}) => {
  const pageTitle = extra.pageTitle || ui.pageTitle
  return h.view(EMAIL_DETAILS_VIEW, {
    ...buildBaseViewModel(request, content, ui, pageTitle),
    ...extra
  })
}

const persistLocationQueryInSession = (request) => {
  if (request.query.location) {
    const sanitizedLocation = request.query.location
      .replace(/^\s*air\s+quality\s+in\s+/i, '')
      .trim()
    request.yar.set('location', sanitizedLocation)
  }

  if (request.query.lat) {
    const lat =
      Math.round(Number.parseFloat(request.query.lat) * 1000000) / 1000000
    request.yar.set('latitude', lat)
  }

  if (request.query.long) {
    const long =
      Math.round(Number.parseFloat(request.query.long) * 1000000) / 1000000
    request.yar.set('longitude', long)
  }

  if (request.query.locationId) {
    request.yar.set('locationId', request.query.locationId)
  }
}

const getMaxAlertsError = (content, maxAlertsEmailError, maxAlertsEmail) => {
  if (!maxAlertsEmailError || !maxAlertsEmail) {
    return null
  }

  const emailDetailsContent = content.emailDetails || english.emailDetails || {}
  const emailDetailsErrors = emailDetailsContent.errors || {}

  return {
    summary: (emailDetailsErrors.maxAlertsReached?.summary || '').replace(
      '{email}',
      maxAlertsEmail
    ),
    field: emailDetailsErrors.maxAlertsReached?.field || ''
  }
}

const consumeMaxAlertsState = (request) => {
  const maxAlertsEmailError = request.yar.get('maxAlertsEmailError')
  const maxAlertsEmail = request.yar.get('maxAlertsEmail')

  if (maxAlertsEmailError) {
    request.yar.clear('maxAlertsEmailError')
    request.yar.clear('maxAlertsEmail')
  }

  return { maxAlertsEmailError, maxAlertsEmail }
}

const getAlertLimitHint = (content) => {
  const emailDetailsContent = content.emailDetails || english.emailDetails || {}
  return (
    emailDetailsContent.alertLimitHint ||
    english.emailDetails?.alertLimitHint ||
    ''
  )
}

const getPayload = (request) => request.payload || {}

const renderValidationError = (h, request, content, ui, payload) =>
  renderEmailDetailsView(h, request, content, ui, {
    pageTitle: ui.errorPageTitle,
    error: { message: 'Enter your email address', field: 'notifyByEmail' },
    formData: payload
  })

const renderSendFailure = (h, request, content, ui, payload) =>
  renderEmailDetailsView(h, request, content, ui, {
    pageTitle: ui.errorPageTitle,
    error: { message: ui.sendFailureMessage, field: 'notifyByEmail' },
    formData: payload
  })

const renderPostFailure = (h, request, content, ui, payload) =>
  renderEmailDetailsView(h, request, content, ui, {
    pageTitle: ui.errorPageTitle,
    error: { message: 'Sorry, there is a problem processing the form' },
    formData: payload
  })

const handleValidEmailSubmission = async (
  request,
  h,
  content,
  ui,
  notifyByEmail,
  payload
) => {
  const { email, location, lat, long } = getSubmissionContext(
    request,
    notifyByEmail
  )

  // '' Note: the backend has no GET /api/subscriptions endpoint for email.
  // '' Max-5 enforcement happens at POST /setup-alert (after the user clicks
  // '' the activation link). The email-confirm-link controller handles the 400
  // '' and redirects back here with maxAlertsEmailError + maxAlertsEmail flags.
  await recordEmailCaptureSafely(email)

  // Send activation link and redirect to check email page ''
  const isSendSuccessful = await sendActivationLink(
    request,
    email,
    location,
    lat,
    long
  )

  if (!isSendSuccessful) {
    return renderSendFailure(h, request, content, ui, payload)
  }

  const emailVerifyEmailPath = config.get('notify.emailVerifyEmailPath')
  return h.redirect(emailVerifyEmailPath)
}

const isBlankEmail = (notifyByEmail) =>
  !notifyByEmail || notifyByEmail.trim() === ''

const getSubmissionContext = (request, notifyByEmail) => {
  const email = notifyByEmail.trim()
  request.yar.set('emailAddress', email)

  return {
    email,
    location: request.yar.get('location') || '',
    lat: request.yar.get('latitude'),
    long: request.yar.get('longitude')
  }
}

const recordEmailCaptureSafely = async (email) => {
  try {
    const res = await recordEmailCapture(email)
    if (res?.ok) {
      logger.debug('Recorded email capture')
      return
    }

    if (res?.skipped) {
      logger.debug('Subscription capture skipped (disabled)')
      return
    }

    logger.warn('Failed to record email capture', { status: res?.status })
  } catch (err) {
    logger.error('Error recording email capture', err)
  }
}

const sendActivationLink = async (request, email, location, lat, long) => {
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
      return false
    }

    request.yar.set('emailActivationSent', Date.now())
    logger.info('Queued Notify email link for delivery')
    return true
  } catch (err) {
    logger.error('Notify email send failed', err)
    return false
  }
}

// GET handler for email details page ''
const handleEmailDetailsRequest = (request, h, content = english) => {
  try {
    const ui = getEmailDetailsContent(content)

    logger.info('Starting email notify journey')
    request.yar.set('notifyJourney', 'email-started') // ''

    // '' Read max-alerts error flag set by email-confirm-link after a 400 response
    const { maxAlertsEmailError, maxAlertsEmail } =
      consumeMaxAlertsState(request)

    persistLocationQueryInSession(request)

    const maxAlertsErrorObj = getMaxAlertsError(
      content,
      maxAlertsEmailError,
      maxAlertsEmail
    )

    return renderEmailDetailsView(h, request, content, ui, {
      pageTitle: maxAlertsErrorObj ? ui.errorPageTitle : ui.pageTitle,
      formData: request.yar.get('formData') || {},
      maxAlertsError: maxAlertsErrorObj,
      alertLimitHint: getAlertLimitHint(content)
    })
  } catch (error) {
    // Log and present a generic error view (re-using template with message) ''
    logger.error('Error rendering email details page', error)
    const ui = getEmailDetailsContent(content)
    return renderEmailDetailsView(h, request, content, ui, {
      pageTitle: ui.errorPageTitle,
      error: { message: 'Sorry, there is a problem loading the page' },
      formData: {}
    })
  }
}

// POST handler for email details page ''
const handleEmailDetailsPost = async (request, h, content = english) => {
  try {
    const ui = getEmailDetailsContent(content)
    const payload = getPayload(request)
    const { notifyByEmail } = payload

    if (isBlankEmail(notifyByEmail)) {
      return renderValidationError(h, request, content, ui, payload)
    }

    return handleValidEmailSubmission(
      request,
      h,
      content,
      ui,
      notifyByEmail,
      payload
    )
  } catch (error) {
    logger.error('Error processing email details submission', error)
    const ui = getEmailDetailsContent(content)
    return renderPostFailure(h, request, content, ui, getPayload(request))
  }
}

export { handleEmailDetailsRequest, handleEmailDetailsPost }
