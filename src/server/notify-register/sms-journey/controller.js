import { english } from '../../data/en/en.js'
import { REDIRECT_STATUS_CODE, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { notifyService } from '../../../helpers/notify-service.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger('sms-journey-controller')

const getMobilePhoneController = {
  handler: async (request, h) => {
    const {
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      smsMobilePhone,
      common
    } = english
    const metaSiteUrl = getAirQualitySiteUrl(request)

    return h.view('notify-register/mobile-phone', {
      pageTitle: smsMobilePhone.pageTitle,
      metaSiteUrl,
      heading: smsMobilePhone.heading,
      description: smsMobilePhone.description,
      page: common.textAlertsPage,
      serviceName: common.serviceName,
      lang: LANG_EN,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner
    })
  }
}

const postMobilePhoneController = {
  handler: async (request, h) => {
    return h.redirect('/notify/confirm-mobile').code(REDIRECT_STATUS_CODE)
  }
}

const getConfirmMobileController = {
  handler: async (request, h) => {
    const { footerTxt, phaseBanner, backlink, cookieBanner } = english
    const metaSiteUrl = getAirQualitySiteUrl(request)

    return h.view('notify-register/confirm-mobile', {
      pageTitle: 'Confirm your mobile phone number',
      metaSiteUrl,
      heading: 'Confirm your mobile phone number',
      mobilePhone: '07123456789',
      page: 'Text alerts',
      serviceName: 'Check air quality',
      lang: LANG_EN,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner
    })
  }
}

const postConfirmMobileController = {
  handler: async (request, h) => {
    try {
      // Get mobile phone number from session or form data
      const mobileNumber =
        request.yar?.get('mobileNumber') ||
        request.payload?.mobilePhone ||
        '07123456789'

      // Generate activation code
      const activationCode = notifyService.generateActivationCode()

      // Store in session for verification
      request.yar?.set('activationCode', activationCode)
      request.yar?.set('mobileNumber', mobileNumber)
      request.yar?.set('activationCodeTimestamp', Date.now()) // For expiry tracking

      // Call the backend notify service API to send SMS
      const smsResult = await notifyService.sendActivationCode(
        mobileNumber,
        activationCode
      )

      if (smsResult.success) {
        logger.info('Activation code sent successfully', {
          phoneNumber: mobileNumber,
          notificationId: smsResult.notificationId
        })

        // Store notification ID for tracking
        request.yar?.set('notificationId', smsResult.notificationId)

        return h.redirect('/notify/activation-code').code(REDIRECT_STATUS_CODE)
      } else {
        throw new Error('Failed to send activation code')
      }
    } catch (error) {
      logger.error('Error in postConfirmMobileController', error)

      // In case of API failure, fall back to development mode for testing
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Falling back to development mode due to API error')

        const mockActivationCode = notifyService.generateActivationCode()
        request.yar?.set('activationCode', mockActivationCode)
        request.yar?.set(
          'mobileNumber',
          request.yar?.get('mobileNumber') || '07123456789'
        )
        request.yar?.set('isDevelopmentFallback', true)

        console.log(
          `📱 FALLBACK MODE - Your activation code is: ${mockActivationCode}`
        )

        return h.redirect('/notify/activation-code').code(REDIRECT_STATUS_CODE)
      }

      // In production, show error page or redirect with error
      return h
        .view('notify-register/error', {
          pageTitle: 'Error sending message',
          heading: 'Sorry, we could not send your activation code',
          description:
            'Please try again later or contact support if the problem persists.',
          page: 'Text alerts',
          serviceName: 'Check air quality',
          footerTxt: english.footerTxt,
          phaseBanner: english.phaseBanner,
          backlink: english.backlink,
          cookieBanner: english.cookieBanner
        })
        .code(500)
    }
  }
}

const getActivationCodeController = {
  handler: async (request, h) => {
    const { footerTxt, phaseBanner, backlink, cookieBanner } = english
    const metaSiteUrl = getAirQualitySiteUrl(request)

    const mobileNumber = request.yar?.get('mobileNumber') || '07123456789'
    const isDevelopmentFallback = request.yar?.get('isDevelopmentFallback')
    const mockCode = request.yar?.get('activationCode')

    // Prepare development hint if in fallback mode
    let developmentHint = ''
    if (isDevelopmentFallback && mockCode) {
      developmentHint = `API Error - Development fallback: Use code ${mockCode}`
    } else if (process.env.NODE_ENV === 'development' && mockCode) {
      developmentHint = `Development mode: Use code ${mockCode}`
    }

    return h.view('notify-register/activation-code', {
      pageTitle: 'Enter your activation code',
      metaSiteUrl,
      heading: 'Enter your activation code',
      description: `We sent a 5-digit code to ${mobileNumber}`,
      developmentHint,
      page: 'Text alerts',
      serviceName: 'Check air quality',
      lang: LANG_EN,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner
    })
  }
}

const postActivationCodeController = {
  handler: async (request, h) => {
    try {
      const enteredCode = request.payload?.activationCode?.trim()
      const storedCode = request.yar?.get('activationCode')
      const timestamp = request.yar?.get('activationCodeTimestamp')

      // Validation
      if (!enteredCode) {
        return h.view('notify-register/activation-code', {
          pageTitle: 'Enter your activation code',
          metaSiteUrl: getAirQualitySiteUrl(request),
          heading: 'Enter your activation code',
          description: `We sent a 5-digit code to ${request.yar?.get('mobileNumber') || '07123456789'}`,
          error: { text: 'Enter your activation code' },
          page: 'Text alerts',
          serviceName: 'Check air quality',
          footerTxt: english.footerTxt,
          phaseBanner: english.phaseBanner,
          backlink: english.backlink,
          cookieBanner: english.cookieBanner
        })
      }

      // Check if code has expired (15 minutes)
      const codeAge = Date.now() - (timestamp || 0)
      const maxAge = 15 * 60 * 1000 // 15 minutes

      if (codeAge > maxAge) {
        return h.view('notify-register/activation-code', {
          pageTitle: 'Enter your activation code',
          metaSiteUrl: getAirQualitySiteUrl(request),
          heading: 'Enter your activation code',
          description: `We sent a 5-digit code to ${request.yar?.get('mobileNumber') || '07123456789'}`,
          error: {
            text: 'Your activation code has expired. Please request a new one.'
          },
          page: 'Text alerts',
          serviceName: 'Check air quality',
          footerTxt: english.footerTxt,
          phaseBanner: english.phaseBanner,
          backlink: english.backlink,
          cookieBanner: english.cookieBanner
        })
      }

      // Verify activation code
      if (enteredCode !== storedCode) {
        return h.view('notify-register/activation-code', {
          pageTitle: 'Enter your activation code',
          metaSiteUrl: getAirQualitySiteUrl(request),
          heading: 'Enter your activation code',
          description: `We sent a 5-digit code to ${request.yar?.get('mobileNumber') || '07123456789'}`,
          error: { text: 'Enter the correct activation code' },
          page: 'Text alerts',
          serviceName: 'Check air quality',
          footerTxt: english.footerTxt,
          phaseBanner: english.phaseBanner,
          backlink: english.backlink,
          cookieBanner: english.cookieBanner
        })
      }

      // Code is valid - mark as verified
      request.yar?.set('phoneVerified', true)
      logger.info('Phone number verified successfully', {
        phoneNumber: request.yar?.get('mobileNumber')
      })

      return h.redirect('/notify/confirm-alert').code(REDIRECT_STATUS_CODE)
    } catch (error) {
      logger.error('Error in postActivationCodeController', error)
      return h.redirect('/notify/activation-code').code(REDIRECT_STATUS_CODE)
    }
  }
}

export {
  getMobilePhoneController,
  postMobilePhoneController,
  getConfirmMobileController,
  postConfirmMobileController,
  getActivationCodeController,
  postActivationCodeController
}
