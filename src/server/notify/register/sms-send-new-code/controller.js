// Controller for SMS send new code page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'

// Create a logger instance ''
const logger = createLogger()

/**
 * Handle GET request for SMS send new code page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @param {Object} content - Content object (optional, defaults to english)
 * @returns {Object} - View response with data
 */
const handleSendNewCodeRequest = (request, h, content = english) => {
  logger.info('Displaying SMS send new code page')

  // Get the mobile number from session (optional) ''
  const mobileNumber = request.yar.get('mobileNumber') || 'Your mobile number'

  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  const viewModel = {
    pageTitle: 'Send a new activation code - Check air quality - GOV.UK',
    heading: 'Send a new activation code',
    page: 'Send a new activation code',
    serviceName: 'Check air quality',
    lang: LANG_EN,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    mobileNumber,
    formData: request.yar.get('formData') || {}
  }

  return h.view('notify/register/sms-send-new-code/index', viewModel)
}

/**
 * Handle POST request for SMS send new code page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @param {Object} content - Content object (optional, defaults to english)
 * @returns {Object} - Redirect or view response
 */
const handleSendNewCodePost = (request, h, content = english) => {
  logger.info('Processing SMS send new code request')

  // Get the mobile number from session (optional) ''
  const mobileNumber = request.yar.get('mobileNumber') || 'unknown'

  // Store that a new code was requested ''
  request.yar.set('newCodeRequested', true)
  request.yar.set('newCodeSentAt', Date.now())

  logger.info(
    `New SMS activation code requested for mobile number: ${mobileNumber.substring(0, 4)}****`
  )

  // Redirect back to the verify code page ''
  return h.redirect('/notify/register/sms-verify-code')
}

export { handleSendNewCodeRequest, handleSendNewCodePost }
