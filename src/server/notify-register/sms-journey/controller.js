import { english } from '../../data/en/en.js'
import { REDIRECT_STATUS_CODE, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { notifyService } from '../../../helpers/notify-service.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger('sms-journey-controller')
const DEFAULT_MOBILE_NUMBER = '07123456789'
const ACTIVATION_CODE_VIEW_PATH = 'notify-register/activation-code'
const ACTIVATION_CODE_PATH = '/notify/activation-code'
const CONFIRM_ALERT_PATH = '/notify/confirm-alert'
const CODE_EXPIRY_MS = 15 * 60 * 1000

function resolveMobileNumber(request) {
  return (
    request.yar?.get('mobileNumber') ||
    request.payload?.mobilePhone ||
    DEFAULT_MOBILE_NUMBER
  )
}

async function saveAndSendActivationCode(request, mobileNumber) {
  const activationCode = notifyService.generateActivationCode()

  request.yar?.set('activationCode', activationCode)
  request.yar?.set('mobileNumber', mobileNumber)
  request.yar?.set('activationCodeTimestamp', Date.now())

  const smsResult = await notifyService.sendActivationCode(
    mobileNumber,
    activationCode
  )

  if (!smsResult.success) {
    throw new Error('Failed to send activation code')
  }

  request.yar?.set('notificationId', smsResult.notificationId)
  return smsResult
}

function applyDevelopmentFallback(request) {
  const mockActivationCode = notifyService.generateActivationCode()
  request.yar?.set('activationCode', mockActivationCode)
  request.yar?.set(
    'mobileNumber',
    request.yar?.get('mobileNumber') || DEFAULT_MOBILE_NUMBER
  )
  request.yar?.set('isDevelopmentFallback', true)

  logger.info('Development fallback activation code generated', {
    activationCode: mockActivationCode
  })
}

function buildNotifyErrorView() {
  return {
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
  }
}

function getDevelopmentHint(request) {
  const isDevelopmentFallback = request.yar?.get('isDevelopmentFallback')
  const mockCode = request.yar?.get('activationCode')

  if (isDevelopmentFallback && mockCode) {
    return `API Error - Development fallback: Use code ${mockCode}`
  }

  if (process.env.NODE_ENV === 'development' && mockCode) {
    return `Development mode: Use code ${mockCode}`
  }

  return ''
}

function buildActivationCodeViewModel(request, errorText = null) {
  const mobileNumber = request.yar?.get('mobileNumber') || DEFAULT_MOBILE_NUMBER
  const viewModel = {
    pageTitle: 'Enter your activation code',
    metaSiteUrl: getAirQualitySiteUrl(request),
    heading: 'Enter your activation code',
    description: `We sent a 5-digit code to ${mobileNumber}`,
    page: 'Text alerts',
    serviceName: 'Check air quality',
    lang: LANG_EN,
    footerTxt: english.footerTxt,
    phaseBanner: english.phaseBanner,
    backlink: english.backlink,
    cookieBanner: english.cookieBanner,
    content: english.activationCode
  }

  if (errorText) {
    return { ...viewModel, error: { text: errorText } }
  }

  return { ...viewModel, developmentHint: getDevelopmentHint(request) }
}

function getActivationCodeError({ enteredCode, storedCode, timestamp }) {
  if (!enteredCode) {
    return 'Enter your activation code'
  }

  const codeAge = Date.now() - (timestamp || 0)
  if (codeAge > CODE_EXPIRY_MS) {
    return 'Your activation code has expired. Please request a new one.'
  }

  if (enteredCode !== storedCode) {
    return 'Enter the correct activation code'
  }

  return null
}

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
    const mobileNumber = resolveMobileNumber(request)

    try {
      const smsResult = await saveAndSendActivationCode(request, mobileNumber)

      logger.info('Activation code sent successfully', {
        phoneNumber: mobileNumber,
        notificationId: smsResult.notificationId
      })

      return h.redirect(ACTIVATION_CODE_PATH).code(REDIRECT_STATUS_CODE)
    } catch (error) {
      logger.error('Error in postConfirmMobileController', error)

      // In case of API failure, fall back to development mode for testing
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Falling back to development mode due to API error')
        applyDevelopmentFallback(request)
        return h.redirect(ACTIVATION_CODE_PATH).code(REDIRECT_STATUS_CODE)
      }

      // In production, show error page or redirect with error
      return h.view('notify-register/error', buildNotifyErrorView()).code(500)
    }
  }
}

const getActivationCodeController = {
  handler: async (request, h) => {
    return h.view(
      ACTIVATION_CODE_VIEW_PATH,
      buildActivationCodeViewModel(request)
    )
  }
}

const postActivationCodeController = {
  handler: async (request, h) => {
    try {
      const enteredCode = request.payload?.activationCode?.trim()
      const storedCode = request.yar?.get('activationCode')
      const timestamp = request.yar?.get('activationCodeTimestamp')

      const errorText = getActivationCodeError({
        enteredCode,
        storedCode,
        timestamp
      })

      if (errorText) {
        return h.view(
          ACTIVATION_CODE_VIEW_PATH,
          buildActivationCodeViewModel(request, errorText)
        )
      }

      // Code is valid - mark as verified
      request.yar?.set('phoneVerified', true)
      logger.info('Phone number verified successfully', {
        phoneNumber: request.yar?.get('mobileNumber')
      })

      return h.redirect(CONFIRM_ALERT_PATH).code(REDIRECT_STATUS_CODE)
    } catch (error) {
      logger.error('Error in postActivationCodeController', error)
      return h.redirect(ACTIVATION_CODE_PATH).code(REDIRECT_STATUS_CODE)
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
