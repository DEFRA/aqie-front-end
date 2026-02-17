// Controller for SMS send new code page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { validateUKMobile } from '../../../common/helpers/validate-uk-mobile.js'
import { sendSmsCode } from '../../../common/services/notify.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'

// Create a logger instance ''
const logger = createLogger()

const DEFAULT_SERVICE_NAME = 'Check air quality'

const formatTemplate = (template = '', replacements = {}) => {
  return Object.keys(replacements).reduce((value, key) => {
    return value.replace(`{${key}}`, replacements[key])
  }, template)
}

/**
 * Handle GET request for SMS send new code page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @param {Object} content - Content object (optional, defaults to english)
 * @returns {Object} - View response with data
 */
const handleSendNewCodeRequest = (request, h, content = english) => {
  logger.info('Displaying SMS send new code page')

  // Get the mobile number from session (optional) ''
  const mobileNumber = request.yar.get('mobileNumber') || 'Your mobile number'

  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  const { footerTxt, phaseBanner, backlink, cookieBanner } = languageContent
  const common = languageContent.common || english.common
  const smsSendNewCode =
    languageContent.smsSendNewCode || english.smsSendNewCode
  const metaSiteUrl = getAirQualitySiteUrl(request)
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME
  const pageTitle = smsSendNewCode.pageTitle
  const bulletSameNumber = formatTemplate(smsSendNewCode.bulletSameNumber, {
    mobileNumber
  })

  const viewModel = {
    pageTitle: `${pageTitle} - ${serviceName} - GOV.UK`,
    heading: smsSendNewCode.heading,
    page: smsSendNewCode.heading,
    serviceName,
    lang,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    mobileNumber,
    common,
    content: smsSendNewCode,
    bulletSameNumber,
    formData: request.yar.get('formData') || {}
  }

  return h.view('notify/register/sms-send-new-code/index', viewModel)
}

/**
 * Handle POST request for SMS send new code page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @param {Object} content - Content object (optional, defaults to english)
 * @returns {Object} - Redirect or view response
 */
const handleSendNewCodePost = async (request, h, content = english) => {
  logger.info('Processing SMS send new code request')

  const { mobileNumberNew } = request.payload
  const sessionMobileNumber = request.yar.get('mobileNumber')

  // Use new number if provided, otherwise use session number ''
  const numberToValidate = mobileNumberNew || sessionMobileNumber

  if (!numberToValidate) {
    // No number in form or session - redirect to mobile number page ''
    return h.redirect('/notify/register/sms-mobile-number')
  }

  // Validate mobile number ''
  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  const { footerTxt, phaseBanner, backlink, cookieBanner } = languageContent
  const common = languageContent.common || english.common
  const smsSendNewCode =
    languageContent.smsSendNewCode || english.smsSendNewCode
  const smsMobilePhone =
    languageContent.smsMobilePhone || english.smsMobilePhone
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME
  const pageTitle = smsSendNewCode.pageTitle

  const validation = validateUKMobile(numberToValidate, {
    empty: smsMobilePhone.errors?.empty,
    format: smsMobilePhone.errors?.format
  })

  if (!validation.isValid) {
    const metaSiteUrl = getAirQualitySiteUrl(request)
    const bulletSameNumber = formatTemplate(smsSendNewCode.bulletSameNumber, {
      mobileNumber: sessionMobileNumber || 'Your mobile number'
    })

    const viewModel = {
      pageTitle: `Error: ${pageTitle} - ${serviceName} - GOV.UK`,
      heading: smsSendNewCode.heading,
      page: smsSendNewCode.heading,
      serviceName,
      lang,
      metaSiteUrl,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      mobileNumber: sessionMobileNumber,
      common,
      content: smsSendNewCode,
      bulletSameNumber,
      error: {
        message: validation.error,
        field: 'mobileNumberNew'
      },
      formData: request.payload
    }

    return h.view('notify/register/sms-send-new-code/index', viewModel)
  }

  // Update session with new validated number ''
  const mobileNumber = validation.formatted
  request.yar.set('mobileNumber', mobileNumber)

  // Send new OTP via backend ''
  try {
    const result = await sendSmsCode(mobileNumber, request)

    if (!result.ok) {
      logger.error('Failed to send new SMS code', { error: result.error })
      // Still redirect but log the error ''
    }
  } catch (error) {
    logger.error('Error sending new SMS code', error)
  }

  // Reset failed attempts counter when sending new code ''
  request.yar.clear('otpFailedAttempts')
  request.yar.clear('otpLastFailedTime')
  request.yar.set('codeVerified', false)

  // Store that a new code was requested ''
  request.yar.set('newCodeRequested', true)
  request.yar.set('newCodeSentAt', Date.now())

  // Increment OTP generation sequence to invalidate previous codes ''
  const currentSequence = request.yar.get('otpGenerationSequence') || 0
  request.yar.set('otpGenerationSequence', currentSequence + 1)
  request.yar.set('otpGeneratedAt', Date.now())

  logger.info(
    `New SMS activation code sent to: ${mobileNumber.substring(0, 4)}****`
  )

  // Redirect back to the verify code page ''
  return h.redirect('/notify/register/sms-verify-code')
}

export { handleSendNewCodeRequest, handleSendNewCodePost }
