import { english } from '../data/en/en.js'
import { REDIRECT_STATUS_CODE, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { notifyService } from '../../helpers/notify-service.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger('notify-register-controller')
const SERVICE_NAME = 'Check air quality'
const PAGE_TEXT_ALERTS = 'Text alerts'
const HTTP_STATUS_BAD_REQUEST = 400
const HTTP_STATUS_INTERNAL_ERROR = 500

const buildLocationMissingViewModel = () => ({
  pageTitle: 'Location not found',
  heading: 'Location details missing',
  description:
    'Please search for and select a location before registering for alerts.',
  page: PAGE_TEXT_ALERTS,
  serviceName: SERVICE_NAME,
  footerTxt: english.footerTxt,
  phaseBanner: english.phaseBanner,
  backlink: english.backlink,
  cookieBanner: english.cookieBanner
})

const buildRegistrationErrorViewModel = () => ({
  pageTitle: 'Error registering for alerts',
  heading: 'Sorry, we could not complete your registration',
  description:
    'Please try again later or contact support if the problem persists.',
  page: PAGE_TEXT_ALERTS,
  serviceName: SERVICE_NAME,
  footerTxt: english.footerTxt,
  phaseBanner: english.phaseBanner,
  backlink: english.backlink,
  cookieBanner: english.cookieBanner
})

const getLocationDetails = (request) => {
  const locationData = request.yar?.get('locationData') || {}
  return locationData?.locationDetails
}

const getAlertRegistrationConfig = (request, locationDetails) => ({
  alertType: request.yar?.get('alertType') || 'text',
  phoneNumber: request.yar?.get('mobileNumber'),
  locationId: locationDetails.id,
  locationName: locationDetails.name || locationDetails.title || '',
  areaRegionName: locationDetails.area || locationDetails.region || '',
  pollutants: ['all'] // Could be configurable in future
})

const setRegistrationSuccessSession = (request, registrationId) => {
  request.yar?.set('registrationId', registrationId)
  request.yar?.set('registrationComplete', true)
  request.yar?.clear('activationCode')
  request.yar?.clear('activationCodeTimestamp')
}

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
      page: PAGE_TEXT_ALERTS,
      serviceName: SERVICE_NAME,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      content: english.confirmAlert
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

      const locationDetails = getLocationDetails(request)
      if (!locationDetails?.id) {
        logger.warn(
          'Attempted registration without location details in session'
        )
        return h
          .view('notify-register/error', buildLocationMissingViewModel())
          .code(HTTP_STATUS_BAD_REQUEST)
      }
      const alertConfig = getAlertRegistrationConfig(request, locationDetails)

      const registrationResult =
        await notifyService.registerForAlerts(alertConfig)

      if (registrationResult.success) {
        logger.info('User successfully registered for alerts', {
          phoneNumber: alertConfig.phoneNumber,
          registrationId: registrationResult.registrationId,
          alertType: alertConfig.alertType
        })

        setRegistrationSuccessSession(
          request,
          registrationResult.registrationId
        )

        return h.redirect('/notify/success').code(REDIRECT_STATUS_CODE)
      }

      throw new Error('Failed to register for alerts')
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
        .view('notify-register/error', buildRegistrationErrorViewModel())
        .code(HTTP_STATUS_INTERNAL_ERROR)
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
      }

      if (registrationId && !apiError) {
        developmentInfo = `Registration ID: ${registrationId}`
      }
    }

    const successContent = english.smsSuccess
    return h.view('notify-register/success', {
      pageTitle: successContent.pageTitle,
      metaSiteUrl,
      heading: successContent.heading,
      phoneNumber,
      developmentInfo,
      content: successContent,
      page: PAGE_TEXT_ALERTS,
      serviceName: SERVICE_NAME,
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
      page: PAGE_TEXT_ALERTS,
      serviceName: SERVICE_NAME,
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
      page: PAGE_TEXT_ALERTS,
      serviceName: SERVICE_NAME,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner
    })
  }
}

const postTextAlertsController = {
  handler: async (_request, h) => {
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
