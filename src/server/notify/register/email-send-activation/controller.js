// Controller for Email send activation page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { config } from '../../../../config/index.js'
import { generateEmailLink } from '../../../common/services/notify.js'

// Create a logger instance ''
const logger = createLogger()

const getSignupSessionContext = (request) => ({
  emailAddress: request.yar.get('emailAddress') || '',
  // Prefer the signup-specific context so visiting other locations between
  // sign-up and clicking 'Request a new activation link' doesn't corrupt the location.
  location:
    request.yar.get('emailSignupLocation') || request.yar.get('location') || '',
  lat: request.yar.get('emailSignupLat') ?? request.yar.get('latitude'),
  long: request.yar.get('emailSignupLong') ?? request.yar.get('longitude')
})

const sendActivationAndRedirect = async (
  request,
  h,
  emailAddress,
  location,
  lat,
  long
) => {
  if (!emailAddress) {
    return h.redirect(config.get('notify.emailDetailsPath'))
  }

  try {
    await generateEmailLink(emailAddress, location, lat, long, request)
    request.yar.set('emailActivationSent', Date.now())
    logger.info('Queued Notify email link for delivery')
  } catch (err) {
    logger.error('Notify email send failed', err)
  }

  return h.redirect(config.get('notify.emailVerifyEmailPath'))
}

/**
 * Handle GET request for Email send activation page ''
 * @param request - Hapi request object
 * @param h - Hapi response toolkit
 * @returns - View response with data
 */
export const handleEmailSendActivationRequest = async (request, h) => {
  logger.info('Processing Email send activation request (GET)')
  const { emailAddress, location, lat, long } = getSignupSessionContext(request)
  return sendActivationAndRedirect(
    request,
    h,
    emailAddress,
    location,
    lat,
    long
  )
}

/**
 * Handle POST request for Email send activation page ''
 * @param request - Hapi request object
 * @param h - Hapi response toolkit
 * @returns - Redirect or view response
 */
export const handleEmailSendActivationPost = async (request, h) => {
  logger.info('Processing Email send activation request (POST)')
  const { emailAddress, location, lat, long } = getSignupSessionContext(request)

  const response = await sendActivationAndRedirect(
    request,
    h,
    emailAddress,
    location,
    lat,
    long
  )

  if (emailAddress) {
    logger.info(
      `Email activation code request sent for email address: ${emailAddress.split('@')[0]}@****`
    )
  }

  return response
}
