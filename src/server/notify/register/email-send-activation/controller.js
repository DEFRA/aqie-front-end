// Controller for Email send activation page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { config } from '../../../../config/index.js'
import { generateEmailLink } from '../../../common/services/notify.js'

// Create a logger instance ''
const logger = createLogger()

/**
 * Handle GET request for Email send activation page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} - View response with data
 */
export const handleEmailSendActivationRequest = async (request, h) => {
  logger.info('Processing Email send activation request (GET)')

  // Get the email address from session ''
  const emailAddress = request.yar.get('emailAddress') || ''
  const location = request.yar.get('location') || ''
  const lat = request.yar.get('latitude')
  const long = request.yar.get('longitude')

  if (!emailAddress) {
    // If no email address in session, redirect back to email details page ''
    const emailDetailsPath = config.get('notify.emailDetailsPath')
    return h.redirect(emailDetailsPath)
  }

  try {
    await generateEmailLink(emailAddress, location, lat, long, request)
    request.yar.set('emailActivationSent', Date.now())
    logger.info('Queued Notify email link for delivery')
  } catch (err) {
    logger.error('Notify email send failed', err)
  }

  const emailVerifyEmailPath = config.get('notify.emailVerifyEmailPath')
  return h.redirect(emailVerifyEmailPath)
}

/**
 * Handle POST request for Email send activation page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} - Redirect or view response
 */
export const handleEmailSendActivationPost = async (request, h) => {
  logger.info('Processing Email send activation request (POST)')

  // Get the email address from session ''
  const emailAddress = request.yar.get('emailAddress')
  const location = request.yar.get('location') || ''
  const lat = request.yar.get('latitude')
  const long = request.yar.get('longitude')

  if (!emailAddress) {
    // If no email in session, redirect back to email details page ''
    const emailDetailsPath = config.get('notify.emailDetailsPath')
    return h.redirect(emailDetailsPath)
  }

  try {
    await generateEmailLink(emailAddress, location, lat, long, request)
    request.yar.set('emailActivationSent', Date.now())
    logger.info('Queued Notify email link for delivery')
  } catch (err) {
    logger.error('Notify email send failed', err)
  }

  logger.info(
    `Email activation code request sent for email address: ${emailAddress.split('@')[0]}@****`
  )

  const emailVerifyEmailPath = config.get('notify.emailVerifyEmailPath')
  return h.redirect(emailVerifyEmailPath)
}
