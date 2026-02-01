import { english } from '../data/en/en.js'
import { REDIRECT_STATUS_CODE, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { notifyService } from '../../helpers/notify-service.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger('notify-register-controller')

const getConfirmAlertController = {
  handler: async (request, h) => {
    const { footerTxt, phaseBanner, backlink, cookieBanner } = english
    const metaSiteUrl = getAirQualitySiteUrl(request)

    return h.view('notify-register/confirm-alert', {
      pageTitle: 'Confirm your air quality alert',
      metaSiteUrl,
      heading: 'Confirm your air quality alert',
      mobilePhone: '07123456789',
      location: 'London',
      page: 'Text alerts',
      serviceName: 'Check air quality',
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner
    })
  }
}

const postConfirmAlertController = {
  handler: async (request, h) => {
    try {
      // Ensure phone is verified before proceeding
      const phoneVerified = request.yar?.get('phoneVerified')
      if (!phoneVerified) {
        logger.warn('Attempted to confirm alert without phone verification')
        return h.redirect('/notify/text-alerts').code(REDIRECT_STATUS_CODE)
      }

      // Get registration details from session
      const alertType = request.yar?.get('alertType') || 'text'
      const phoneNumber = request.yar?.get('mobileNumber')
      // Extract location details from session
      const locationData = request.yar?.get('locationData') || {}
      const locationDetails = locationData?.locationDetails
      if (!locationDetails || !locationDetails.id) {
        logger.warn(
          'Attempted registration without location details in session'
        )
        return h
          .view('notify-register/error', {
            pageTitle: 'Location not found',
            heading: 'Location details missing',
            description:
              'Please search for and select a location before registering for alerts.',
            page: 'Text alerts',
            serviceName: 'Check air quality',
            footerTxt: english.footerTxt,
            phaseBanner: english.phaseBanner,
            backlink: english.backlink,
            cookieBanner: english.cookieBanner
          })
          .code(400)
      }
      const locationId = locationDetails.id
      const locationName = locationDetails.name || locationDetails.title || ''
      const areaRegionName =
        locationDetails.area || locationDetails.region || ''

      // Register user for air quality alerts
      const alertConfig = {
        alertType,
        phoneNumber,
        locationId,
        locationName,
        areaRegionName,
        pollutants: ['all'] // Could be configurable in future
      }

      const registrationResult =
        await notifyService.registerForAlerts(alertConfig)

      if (registrationResult.success) {
        logger.info('User successfully registered for alerts', {
          phoneNumber,
          registrationId: registrationResult.registrationId,
          alertType
        })

        // Store registration details in session for success page
        request.yar?.set('registrationId', registrationResult.registrationId)
        request.yar?.set('registrationComplete', true)

        // Clear sensitive data from session
        request.yar?.clear('activationCode')
        request.yar?.clear('activationCodeTimestamp')

        return h.redirect('/notify/success').code(REDIRECT_STATUS_CODE)
      } else {
        throw new Error('Failed to register for alerts')
      }
    } catch (error) {
      logger.error('Error in postConfirmAlertController', error)

      // In case of API failure, still show success for better UX
      // but log the error for monitoring
      if (process.env.NODE_ENV === 'development') {
        logger.warn(
          'Falling back to success page despite API error (development mode)'
        )
        request.yar?.set('registrationComplete', true)
        request.yar?.set('apiError', true)
        return h.redirect('/notify/success').code(REDIRECT_STATUS_CODE)
      }

      // In production, show error page
      return h
        .view('notify-register/error', {
          pageTitle: 'Error registering for alerts',
          heading: 'Sorry, we could not complete your registration',
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

const getSuccessController = {
  handler: async (request, h) => {
    const { footerTxt, phaseBanner, backlink, cookieBanner } = english
    const metaSiteUrl = getAirQualitySiteUrl(request)

    const apiError = request.yar?.get('apiError')
    const phoneNumber = request.yar?.get('mobileNumber')
    const registrationId = request.yar?.get('registrationId')

    // Provide development info
    let developmentInfo = ''
    if (process.env.NODE_ENV === 'development') {
      if (apiError) {
        developmentInfo =
          'Note: Registration completed with API fallback (development mode)'
      } else if (registrationId) {
        developmentInfo = `Registration ID: ${registrationId}`
      }
    }

    return h.view('notify-register/success', {
      pageTitle: 'You have successfully signed up for air quality alerts',
      metaSiteUrl,
      heading: 'You have successfully signed up for air quality alerts',
      phoneNumber,
      developmentInfo,
      page: 'Text alerts',
      serviceName: 'Check air quality',
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner
    })
  }
}

// Controller for "Receive alerts by text message" link
const getTextAlertsController = {
  handler: async (request, h) => {
    const { footerTxt, phaseBanner, backlink, cookieBanner } = english
    const metaSiteUrl = getAirQualitySiteUrl(request)

    // Store the alert type in session for future use
    request.yar?.set('alertType', 'text')

    return h.view('notify-register/text-alerts', {
      pageTitle: 'What is your mobile phone number?',
      metaSiteUrl,
      heading: 'What is your mobile phone number?',
      description:
        'We will send you a text message with a 5-digit activation code.',
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

// Controller for "Receive alerts by email" link
const getEmailAlertsController = {
  handler: async (request, h) => {
    const { footerTxt, phaseBanner, backlink, cookieBanner } = english
    const metaSiteUrl = getAirQualitySiteUrl(request)

    // Store the alert type in session for future use
    request.yar?.set('alertType', 'email')

    return h.view('notify-register/email-alerts', {
      pageTitle: 'Receive alerts by email',
      metaSiteUrl,
      heading: 'Receive alerts by email',
      description:
        'Email alerts for air quality are coming soon. Sign up for text alerts instead.',
      page: 'Text alerts',
      serviceName: 'Check air quality',
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner
    })
  }
}

const postTextAlertsController = {
  handler: async (request, h) => {
    return h.redirect('/notify/confirm-mobile').code(REDIRECT_STATUS_CODE)
  }
}

export {
  getConfirmAlertController,
  postConfirmAlertController,
  getSuccessController,
  getTextAlertsController,
  postTextAlertsController,
  getEmailAlertsController
}
