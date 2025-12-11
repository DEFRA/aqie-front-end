import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'

// Create a logger instance ''
const logger = createLogger()

const handleAlertsSuccessRequest = (request, h, content = english) => {
  logger.info('Showing alerts success page')

  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // Get data from session
  const mobileNumber = request.yar.get('mobileNumber') || 'Not provided'
  const location = request.yar.get('location') || 'Not selected'
  const alertDetailsConfirmed =
    request.yar.get('alertDetailsConfirmed') || false

  const viewModel = {
    pageTitle:
      'You have successfully signed up for air quality alerts - Check air quality - GOV.UK',
    heading: 'You have successfully signed up for air quality alerts',
    page: 'You have successfully signed up for air quality alerts',
    serviceName: 'Check air quality',
    lang: LANG_EN,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    mobileNumber,
    location,
    alertDetailsConfirmed,
    formData: request.yar.get('formData') || {}
  }

  return h.view('notify/register/sms-success/index', viewModel)
}

const handleAlertsSuccessPost = (request, h, content = english) => {
  // This is a success page, typically would just redirect back to home or clear session

  // Clear notification session data
  request.yar.clear('mobileNumber')
  request.yar.clear('location')
  request.yar.clear('alertDetailsConfirmed')
  request.yar.clear('notifyJourney')
  request.yar.clear('formData')

  // Redirect to home page ''
  return h.redirect('/')
}

export { handleAlertsSuccessRequest, handleAlertsSuccessPost }
