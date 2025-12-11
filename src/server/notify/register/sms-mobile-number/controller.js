import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { recordSmsCapture } from '../../../common/services/subscription.js'

// Constants for repeated strings
const PAGE_HEADING = 'What is your mobile phone number?'

// Create a logger instance ''
const logger = createLogger()

const handleNotifyRequest = (request, h, content = english) => {
  logger.info('Starting notify journey')

  // Set the journey start in session
  request.yar.set('notifyJourney', 'started')

  // Capture location from query parameter if provided
  if (request.query.location) {
    request.yar.set('location', request.query.location)
  }

  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
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
    backlink,
    cookieBanner,
    formData: request.yar.get('formData') || {}
  }

  return h.view('notify/register/sms-mobile-number/index', viewModel)
}

const handleNotifyPost = async (request, h, content = english) => {
  const { notifyByText } = request.payload

  // Basic validation
  if (!notifyByText || notifyByText.trim() === '') {
    const { footerTxt, phaseBanner, backlink, cookieBanner } = content
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
      backlink,
      cookieBanner,
      error: {
        message: 'Enter your mobile phone number',
        field: 'notifyByText'
      },
      formData: request.payload
    }

    return h.view('notify/register/sms-mobile-number/index', viewModel)
  }

  // Store the mobile number in session
  request.yar.set('mobileNumber', notifyByText)

  // Fire-and-forget capture to subscription backend ''
  try {
    const res = await recordSmsCapture(notifyByText)
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
