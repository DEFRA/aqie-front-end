import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'

// Create a logger instance ''
const logger = createLogger()

const handleNotifyRequest = (request, h, content = english) => {
  logger.info('Starting notify journey')

  // Set the journey start in session
  request.yar.set('notifyJourney', 'started')

  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  const viewModel = {
    pageTitle: 'What is your mobile phone number? - Check air quality - GOV.UK',
    heading: 'What is your mobile phone number?',
    page: 'What is your mobile phone number?',
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

const handleNotifyPost = (request, h, content = english) => {
  const { notifyByText } = request.payload

  // Basic validation
  if (!notifyByText || notifyByText.trim() === '') {
    const { footerTxt, phaseBanner, backlink, cookieBanner } = content
    const metaSiteUrl = getAirQualitySiteUrl(request)

    const viewModel = {
      pageTitle:
        'Error: What is your mobile phone number? - Check air quality - GOV.UK',
      heading: 'What is your mobile phone number?',
      page: 'What is your mobile phone number?',
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

  // Redirect to send activation page ''
  return h.redirect('/notify/register/sms-send-activation')
}

export { handleNotifyRequest, handleNotifyPost }
