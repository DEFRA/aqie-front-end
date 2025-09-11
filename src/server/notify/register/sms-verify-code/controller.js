// Controller for SMS verify code page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'

// Create a logger instance ''
const logger = createLogger()

/**
 * Handle GET request for SMS verify code page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @param {Object} content - Content object (optional, defaults to english)
 * @returns {Object} - View response with data
 */
const handleCheckMessageRequest = (request, h, content = english) => {
  logger.info('Displaying SMS verify code page')

  // Get the mobile number from session ''
  const mobileNumber = request.yar.get('mobileNumber') || ''

  if (!mobileNumber) {
    // If no mobile number in session, redirect back to mobile number page ''
    return h.redirect('/notify/register/sms-mobile-number')
  }

  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  const viewModel = {
    pageTitle: 'Check your mobile phone - Check air quality - GOV.UK',
    heading: 'Check your mobile phone',
    page: 'Check your mobile phone',
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

  return h.view('notify/register/sms-verify-code/index', viewModel)
}

/**
 * Handle POST request for SMS verify code page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @param {Object} content - Content object (optional, defaults to english)
 * @returns {Object} - Redirect or view response
 */
const handleCheckMessagePost = (request, h, content = english) => {
  logger.info('Processing SMS verify code request')

  // Get the mobile number from session ''
  const mobileNumber = request.yar.get('mobileNumber')

  if (!mobileNumber) {
    // If no mobile number in session, redirect back to mobile number page ''
    return h.redirect('/notify/register/sms-mobile-number')
  }

  // Store that user has verified their code ''
  request.yar.set('codeVerified', true)

  logger.info(
    `User verified code for mobile number: ${mobileNumber.substring(0, 4)}****`
  )

  // Redirect to the next step in the journey ''
  return h.redirect('/notify/register/sms-confirm-details')
}

export { handleCheckMessageRequest, handleCheckMessagePost }
