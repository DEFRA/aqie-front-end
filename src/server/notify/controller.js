import { english } from '../data/en/en.js'
import { LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { createLogger } from '../common/helpers/logging/logger.js'

// Create a logger instance ''
const logger = createLogger()

const handleNotifyRequest = (request, h, content = english) => {
  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // Check if request.yar and its set method exist before calling it ''
  if (request.yar && typeof request.yar.set === 'function') {
    request.yar.set('notifyJourney', 'started') // ''
  } else {
    // Optionally log a warning or handle the missing session gracefully ''
    logger.warn('Session (yar) is not available on the request object') // ''
  }

  return h.view('notify/index', {
    pageTitle: 'What is your mobile phone number? - Check air quality',
    description:
      'Enter your mobile phone number to receive air quality alerts by text message',
    metaSiteUrl,
    heading: 'What is your mobile phone number?',
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    serviceName: 'Check air quality',
    lang: LANG_EN
  })
}

const handleNotifyPost = (request, h) => {
  const { notifyByText } = request.payload || {}

  // Validate mobile number ''
  if (!notifyByText || notifyByText.trim() === '') {
    return h.view('notify/index', {
      pageTitle: 'What is your mobile phone number? - Check air quality',
      description:
        'Enter your mobile phone number to receive air quality alerts by text message',
      heading: 'What is your mobile phone number?',
      error: {
        message: 'Enter your mobile phone number',
        field: 'notifyByText'
      },
      formData: { notifyByText },
      serviceName: 'Check air quality',
      lang: LANG_EN
    })
  }

  // Store the mobile number in session ''
  if (request.yar && typeof request.yar.set === 'function') {
    request.yar.set('mobileNumber', notifyByText.trim()) // ''
  }

  // Redirect to verification code page ''
  return h.redirect('/notify/register/sms-verify-code')
}

const notifyController = {
  handler: handleNotifyRequest
}

const notifyPostController = {
  handler: handleNotifyPost
}

export {
  notifyController,
  notifyPostController,
  handleNotifyRequest,
  handleNotifyPost
}
