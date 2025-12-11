import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { recordEmailCapture } from '../../../common/services/subscription.js'

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

    // Capture location from query parameter if provided
    if (request.query.location) {
      request.yar.set('location', request.query.location)
    }

    const { footerTxt, phaseBanner, backlink, cookieBanner } = content
    const metaSiteUrl = getAirQualitySiteUrl(request)

    const viewModel = {
      pageTitle: `${PAGE_HEADING} - ${SERVICE_NAME} - GOV.UK`,
      heading: PAGE_HEADING,
      page: PAGE_HEADING,
      serviceName: SERVICE_NAME,
      lang: LANG_EN,
      metaSiteUrl,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      formData: request.yar.get('formData') || {}
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

    // Fire-and-forget capture to subscription backend ''
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

    // Redirect to next step ''
    return h.redirect('/notify/register/email-send-activation')
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
