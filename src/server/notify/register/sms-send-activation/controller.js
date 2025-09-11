// Controller for SMS send activation page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'

// Create a logger instance ''
const logger = createLogger()

/**
 * Handle GET request for SMS send activation page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} - View response with data
 */
export const handleSendActivationRequest = (request, h, content = english) => {
  logger.info('Displaying SMS send activation page')

  // Get the mobile number from session ''
  const mobileNumber = request.yar.get('mobileNumber') || ''

  if (!mobileNumber) {
    // If no mobile number in session, redirect back to mobile number page ''
    return h.redirect('/notify/register/sms-mobile-number')
  }

  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  const viewModel = {
    pageTitle:
      'We are going to send you an activation code - Check air quality - GOV.UK',
    heading: 'We are going to send you an activation code',
    page: 'We are going to send you an activation code',
    serviceName: 'Check air quality',
    lang: LANG_EN,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    mobileNumber
  }

  return h.view('notify/register/sms-send-activation/index', viewModel)
}

/**
 * Handle POST request for SMS send activation page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} - Redirect or view response
 */
export const handleSendActivationPost = (request, h) => {
  logger.info('Processing SMS send activation request')

  // Get the mobile number from session ''
  const mobileNumber = request.yar.get('mobileNumber')

  if (!mobileNumber) {
    // If no mobile number in session, redirect back to mobile number page ''
    return h.redirect('/notify/register/sms-mobile-number')
  }

  // Here we would typically send the SMS activation code ''
  // For now, we'll just store some data and redirect to the next step ''

  // Store activation request timestamp ''
  request.yar.set('activationSent', Date.now())

  logger.info(
    `SMS activation code request sent for mobile number: ${mobileNumber.substring(0, 4)}****`
  )

  // Redirect to verification code page ''
  return h.redirect('/notify/register/sms-verify-code')
}
