// Controller for Email send activation page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { sendEmailCode } from '../../../common/services/notify.js'

// Create a logger instance ''
const logger = createLogger()

/**
 * Handle GET request for Email send activation page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} - View response with data
 */
export const handleEmailSendActivationRequest = (
  request,
  h,
  content = english
) => {
  logger.info('Displaying Email send activation page')

  // Get the email address from session ''
  const emailAddress = request.yar.get('emailAddress') || ''

  if (!emailAddress) {
    // If no email address in session, redirect back to email details page ''
    return h.redirect('/notify/register/email-details')
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
    emailAddress
  }

  return h.view('notify/register/email-send-activation/index', viewModel)
}

/**
 * Handle POST request for Email send activation page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} - Redirect or view response
 */
export const handleEmailSendActivationPost = async (request, h) => {
  logger.info('Processing Email send activation request')

  // Get the email address from session ''
  const emailAddress = request.yar.get('emailAddress')

  if (!emailAddress) {
    // If no email in session, redirect back to email details page ''
    return h.redirect('/notify/register/email-details')
  }

  // Generate a 5-digit verification token for email (digits for UX consistency) ''
  const token = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * 10)
  ).join('')
  request.yar.set('emailVerificationToken', token)
  request.yar.set('emailActivationSent', Date.now())

  try {
    await sendEmailCode(emailAddress, token)
    logger.info('Queued Notify email for delivery')
  } catch (err) {
    logger.error('Notify email send failed', err)
    // Keep journey alive but inform logs; still allow user to try code if they can access it in non-prod ''
  }

  logger.info(
    `Email activation code request sent for email address: ${emailAddress.split('@')[0]}@****`
  )

  return h.redirect('/notify/register/email-verify-code')
}
