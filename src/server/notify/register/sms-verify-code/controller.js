// Controller for SMS verify code page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { config } from '../../../../config/index.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { verifyOtp } from '../../../common/services/notify.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'

// Constants ''
const DEFAULT_SERVICE_NAME = 'Check air quality'
const VIEW_PATH = 'notify/register/sms-verify-code/index'
const FIELD_NAME = 'activation-code'
const MAX_FAILED_ATTEMPTS = 3
const SIXTY_SECONDS = 60
const ONE_THOUSAND = 1000
const FIVE_MINUTES = 5
const FIVE_MINUTES_MS = FIVE_MINUTES * SIXTY_SECONDS * ONE_THOUSAND

// Create a logger instance ''
const logger = createLogger()
const SMS_SEND_ACTIVATION_PATH = config.get('notify.smsSendActivationPath')
const SMS_MOBILE_NUMBER_PATH = config.get('notify.smsMobileNumberPath')
const SMS_CONFIRM_DETAILS_PATH = config.get('notify.smsConfirmDetailsPath')

const buildPageTitle = (title = '', serviceName = DEFAULT_SERVICE_NAME) => {
  return `${title} - ${serviceName} - GOV.UK`
}

const getSmsVerifyContent = (request, content = english) => {
  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  const smsVerifyCode = languageContent.smsVerifyCode || english.smsVerifyCode
  const common = languageContent.common || english.common
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME

  return { lang, languageContent, smsVerifyCode, common, serviceName }
}

/**
 * Build error view model ''
 */
function buildErrorViewModel(
  request,
  mobileNumber,
  errorMessage,
  smsVerifyCode,
  common,
  lang,
  content
) {
  const { footerTxt, phaseBanner, cookieBanner } = content
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME
  const pageTitle = buildPageTitle(smsVerifyCode.errorPageTitle, serviceName)
  return {
    pageTitle,
    heading: smsVerifyCode.heading,
    page: smsVerifyCode.heading,
    serviceName,
    lang,
    metaSiteUrl: getAirQualitySiteUrl(request),
    footerTxt,
    phaseBanner,
    backlink: {
      text: common?.backLinkText || 'Back'
    },
    cookieBanner,
    common,
    content: smsVerifyCode,
    displayBacklink: true,
    customBackLink: true,
    backLinkText: common?.backLinkText || 'Back',
    backLinkUrl: SMS_SEND_ACTIVATION_PATH,
    mobileNumber,
    error: { message: errorMessage, field: FIELD_NAME },
    formData: request.payload
  }
}

/**
 * Check if rate limit wait period has passed ''
 */
function shouldResetAttempts(lastFailedTime) {
  if (!lastFailedTime) {
    return false
  }
  const timeSinceLastFailed = Date.now() - lastFailedTime
  return timeSinceLastFailed >= FIVE_MINUTES_MS
}

/**
 * Determine error message based on failure type and attempt count ''
 */
function getErrorMessage(
  errorMessage,
  failedAttempts,
  lastFailedTime,
  smsVerifyCode
) {
  const isExpired = errorMessage === 'Secret has expired'
  const isSuperseded = errorMessage.includes('no longer valid')
  const exceedsMaxAttempts =
    failedAttempts >= MAX_FAILED_ATTEMPTS && lastFailedTime

  if (exceedsMaxAttempts && !shouldResetAttempts(lastFailedTime)) {
    return smsVerifyCode.errors.waitFiveMinutes
  }

  if (isSuperseded) {
    return smsVerifyCode.errors.superseded
  }

  if (isExpired) {
    return smsVerifyCode.errors.expired
  }

  return smsVerifyCode.errors.enterCodeShown
}

/**
 * Validate submitted OTP code format ''
 */
function validateOtpFormat(submitted, smsVerifyCode) {
  if (!submitted) {
    return { isValid: false, error: smsVerifyCode.errors.enterCode }
  }

  const codePattern = /^\d{5}$/
  if (!codePattern.test(submitted)) {
    return {
      isValid: false,
      error: smsVerifyCode.errors.enterCodeExample
    }
  }

  return { isValid: true }
}

/**
 * Handle OTP verification failure ''
 */
function handleVerificationFailure(
  request,
  mobileNumber,
  result,
  failedAttempts,
  lastFailedTime,
  smsVerifyCode,
  common,
  lang,
  content,
  h
) {
  const errorMessage =
    result.error?.message || result.body?.message || 'Validation failed'

  const newFailedAttempts = failedAttempts + 1
  request.yar.set('otpFailedAttempts', newFailedAttempts)
  request.yar.set('otpLastFailedTime', Date.now())

  logger.info(
    `OTP verification failed for mobile number: ${mobileNumber.substring(0, 4)}**** - ${errorMessage} (Attempt ${newFailedAttempts})`
  )

  const attemptsToUse = shouldResetAttempts(lastFailedTime)
    ? 0
    : newFailedAttempts
  if (shouldResetAttempts(lastFailedTime)) {
    request.yar.set('otpFailedAttempts', 0)
  }

  const userErrorMessage = getErrorMessage(
    errorMessage,
    attemptsToUse,
    lastFailedTime,
    smsVerifyCode
  )
  const vm = buildErrorViewModel(
    request,
    mobileNumber,
    userErrorMessage,
    smsVerifyCode,
    common,
    lang,
    content
  )
  return h.view(VIEW_PATH, vm)
}

/**
 * Handle successful OTP verification ''
 */
function handleVerificationSuccess(request, mobileNumber, h) {
  request.yar.set('codeVerified', true)
  request.yar.clear('otpFailedAttempts')
  request.yar.clear('otpLastFailedTime')

  logger.info(
    `User verified code successfully for mobile number: ${mobileNumber.substring(0, 4)}****`
  )
  return h.redirect(SMS_CONFIRM_DETAILS_PATH)
}

/**
 * Handle GET request for SMS verify code page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @param {Object} content - Content object (optional, defaults to english)
 * @returns {Object} - View response with data
 */
const handleCheckMessageRequest = (request, h, content = english) => {
  logger.info('Displaying SMS verify code page')

  // Get the mobile number from session ''
  const mobileNumber = request.yar.get('mobileNumber') || ''

  if (!mobileNumber) {
    // If no mobile number in session, redirect back to mobile number page ''
    return h.redirect(SMS_MOBILE_NUMBER_PATH)
  }

  const { lang, languageContent, smsVerifyCode, common, serviceName } =
    getSmsVerifyContent(request, content)
  const { footerTxt, phaseBanner, cookieBanner } = languageContent
  const metaSiteUrl = getAirQualitySiteUrl(request)
  const bodyText = smsVerifyCode.bodyText.replace(
    '{mobileNumber}',
    `<strong>${mobileNumber}</strong>`
  )
  const developerHint = config.get('isProduction')
    ? undefined
    : smsVerifyCode.developerHint.replace(
        '{code}',
        request.yar.get('smsVerificationToken')
      )
  const pageTitle = buildPageTitle(smsVerifyCode.pageTitle, serviceName)

  const viewModel = {
    pageTitle,
    heading: smsVerifyCode.heading,
    page: smsVerifyCode.heading,
    serviceName,
    lang,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    cookieBanner,
    common,
    content: smsVerifyCode,
    bodyText,
    displayBacklink: true,
    customBackLink: true,
    backLinkText: common?.backLinkText || 'Back',
    backLinkUrl: SMS_SEND_ACTIVATION_PATH,
    mobileNumber,
    formData: request.yar.get('formData') || {},
    debugToken: developerHint
  }

  return h.view(VIEW_PATH, viewModel)
}

/**
 * Handle POST request for SMS verify code page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @param {Object} content - Content object (optional, defaults to english)
 * @returns {Object} - Redirect or view response
 */
const handleCheckMessagePost = async (request, h, content = english) => {
  logger.info('Processing SMS verify code request')

  const mobileNumber = request.yar.get('mobileNumber')
  const { lang, languageContent, smsVerifyCode, common } = getSmsVerifyContent(
    request,
    content
  )

  if (!mobileNumber) {
    return h.redirect(SMS_MOBILE_NUMBER_PATH)
  }

  const submitted = (request.payload?.[FIELD_NAME] || '').trim()
  const mockOtpCode = config.get('notify.mockOtpCode') || '12345'

  // If code already verified, allow forward unless a different code is entered ''
  const codeVerified = request.yar.get('codeVerified')
  if (codeVerified) {
    if (submitted && submitted !== mockOtpCode) {
      const vm = buildErrorViewModel(
        request,
        mobileNumber,
        smsVerifyCode.errors.enterCodeShown,
        smsVerifyCode,
        common,
        lang,
        languageContent
      )
      return h.view(VIEW_PATH, vm)
    }
    logger.info('Code already verified, redirecting to confirm details')
    return h.redirect(SMS_CONFIRM_DETAILS_PATH)
  }

  const validation = validateOtpFormat(submitted, smsVerifyCode)
  if (!validation.isValid) {
    const vm = buildErrorViewModel(
      request,
      mobileNumber,
      validation.error,
      smsVerifyCode,
      common,
      lang,
      languageContent
    )
    return h.view(VIEW_PATH, vm)
  }

  const failedAttempts = request.yar.get('otpFailedAttempts') || 0
  const lastFailedTime = request.yar.get('otpLastFailedTime')

  const result = await verifyOtp(mobileNumber, submitted, request)

  logger.info('OTP verification result received', {
    ok: result.ok,
    status: result.status,
    hasError: !!result.error,
    hasBody: !!result.body,
    bodyMessage: result.body?.message,
    errorMessage: result.error?.message
  })

  const isFailure = !result.ok
  if (isFailure) {
    return handleVerificationFailure(
      request,
      mobileNumber,
      result,
      failedAttempts,
      lastFailedTime,
      smsVerifyCode,
      common,
      lang,
      languageContent,
      h
    )
  }

  return handleVerificationSuccess(request, mobileNumber, h)
}

export { handleCheckMessageRequest, handleCheckMessagePost }
