import { createLogger } from '../../../common/helpers/logging/logger.js'
import { getSubscriptionCount } from '../../../common/services/notify.js'

const logger = createLogger()

/**
 * Check if user has reached maximum alerts and redirect accordingly.
 * '' Handles both email and SMS journeys based on notificationFlow session value.
 */
const checkMaxAlertsController = {
  handler: async (request, h) => {
    logger.info('Checking maximum alerts before adding another location')

    // '' Determine which journey the user came from
    const notificationFlow = request.yar.get('notificationFlow')

    // '' Email journey: no server-side subscription count endpoint exists for email.
    // '' Max-5 enforcement happens at POST /setup-alert (email-confirm-link handles 400).
    // '' Simply redirect to location search preserving the email flow context.
    if (notificationFlow === 'email') {
      logger.info(
        'Email journey detected, skipping subscription count check and redirecting to search'
      )
      return h.redirect('/search-location?fromEmailFlow=true')
    }

    // '' SMS journey: check subscription count before allowing another location
    const mobileNumber = request.yar.get('mobileNumber')

    if (!mobileNumber) {
      logger.warn(
        'No mobile number in session, redirecting to mobile number page'
      )
      return h.redirect('/notify/register/sms-mobile-number')
    }

    try {
      // '' Check if user has reached maximum alerts
      const { ok, maxReached } = await getSubscriptionCount(
        mobileNumber,
        request
      )

      logger.info('Maximum alerts check result', {
        phoneNumber: '***' + mobileNumber.slice(-4),
        maxReached,
        canAddMore: !maxReached
      })

      if (ok && maxReached) {
        // '' User has reached maximum alerts
        logger.info('User has reached maximum alerts, showing error')

        // '' Use full phone number for display
        const maskedNumber = mobileNumber

        // '' Set error flag and formatted number in session
        request.yar.set('maxAlertsError', true)
        request.yar.set('maskedPhoneNumber', maskedNumber)

        // '' Clear the current mobile number so user can enter a different one
        request.yar.clear('mobileNumber')

        return h.redirect('/notify/register/sms-mobile-number')
      }

      // '' User can add more alerts, proceed to search
      logger.info('User can add more alerts, proceeding to search')
      request.yar.set('notificationFlow', 'sms')
      return h.redirect('/search-location?fromSmsFlow=true')
    } catch (error) {
      logger.error('Error checking subscription count', error)
      // '' On error, allow user to proceed (fail open)
      request.yar.set('notificationFlow', 'sms')
      return h.redirect('/search-location?fromSmsFlow=true')
    }
  }
}

export { checkMaxAlertsController }
