// Controller for SMS verify code page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { config } from '../../../../config/index.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { verifyOtp } from '../../../common/services/notify.js'

// Constants ''
const PAGE_HEADING = 'Check your mobile phone'
const PAGE_TITLE = 'Check your mobile phone - Check air quality - GOV.UK'
const ERROR_PAGE_TITLE =
  'Error: Check your mobile phone - Check air quality - GOV.UK'
const SERVICE_NAME = 'Check air quality'
const VIEW_PATH = 'notify/register/sms-verify-code/index'
const FIELD_NAME = 'activation-code'
const HTTP_BAD_REQUEST = 400
const MAX_FAILED_ATTEMPTS = 3
const SIXTY_SECONDS = 60
const ONE_THOUSAND = 1000
const FIVE_MINUTES = 5
const FIVE_MINUTES_MS = FIVE_MINUTES * SIXTY_SECONDS * ONE_THOUSAND

// Create a logger instance ''
const logger = createLogger()

/**
 * Build error view model ''
 */
function buildErrorViewModel(request, mobileNumber, errorMessage, content) {
  const { footerTxt, phaseBanner, cookieBanner } = content
  return {
    pageTitle: ERROR_PAGE_TITLE,
    heading: PAGE_HEADING,
    page: PAGE_HEADING,
    serviceName: SERVICE_NAME,
    lang: LANG_EN,
    metaSiteUrl: getAirQualitySiteUrl(request),
    footerTxt,
    phaseBanner,
    backlink: {
      text: 'Back'
    },
    cookieBanner,
    displayBacklink: true,
    customBackLink: true,
    backLinkText: 'Back',
    backLinkUrl: '/notify/register/sms-send-activation',
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
function getErrorMessage(errorMessage, failedAttempts, lastFailedTime) {
  const isExpired = errorMessage === 'Secret has expired'
  const exceedsMaxAttempts =
    failedAttempts >= MAX_FAILED_ATTEMPTS && lastFailedTime

  if (exceedsMaxAttempts && !shouldResetAttempts(lastFailedTime)) {
    return 'Wait 5 minutes, then get a new code using the link on this page'
  }

  if (isExpired) {
    return 'This code has expired. Get a new code using the link on this page'
  }

  return 'Enter the 5 digit activation code shown in the text message'
}

/**
 * Validate submitted OTP code format ''
 */
function validateOtpFormat(submitted) {
  if (!submitted) {
    return { isValid: false, error: 'Enter your 5 digit activation code' }
  }

  const codePattern = /^\d{5}$/
  if (!codePattern.test(submitted)) {
    return {
      isValid: false,
      error: 'Enter your 5 digit activation code, like 01234'
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
    lastFailedTime
  )
  const vm = buildErrorViewModel(
    request,
    mobileNumber,
    userErrorMessage,
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
  return h.redirect('/notify/register/sms-confirm-details')
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
    return h.redirect('/notify/register/sms-mobile-number')
  }

  const { footerTxt, phaseBanner, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  const viewModel = {
    pageTitle: PAGE_TITLE,
    heading: PAGE_HEADING,
    page: PAGE_HEADING,
    serviceName: SERVICE_NAME,
    lang: LANG_EN,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    cookieBanner,
    displayBacklink: false,
    mobileNumber,
    formData: request.yar.get('formData') || {},
    debugToken: config.get('isProduction')
      ? undefined
      : request.yar.get('smsVerificationToken')
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

  if (!mobileNumber) {
    return h.redirect('/notify/register/sms-mobile-number')
  }

  // If code already verified, redirect forward to confirm details ''
  const codeVerified = request.yar.get('codeVerified')
  if (codeVerified) {
    logger.info('Code already verified, redirecting to confirm details')
    return h.redirect('/notify/register/sms-confirm-details')
  }

  const submitted = (request.payload?.[FIELD_NAME] || '').trim()

  const validation = validateOtpFormat(submitted)
  if (!validation.isValid) {
    const vm = buildErrorViewModel(
      request,
      mobileNumber,
      validation.error,
      content
    )
    return h.view(VIEW_PATH, vm)
  }

  const failedAttempts = request.yar.get('otpFailedAttempts') || 0
  const lastFailedTime = request.yar.get('otpLastFailedTime')

  const result = await verifyOtp(mobileNumber, submitted, request)

  const isFailure = !result.ok || result.error?.statusCode === HTTP_BAD_REQUEST
  if (isFailure) {
    return handleVerificationFailure(
      request,
      mobileNumber,
      result,
      failedAttempts,
      lastFailedTime,
      content,
      h
    )
  }

  return handleVerificationSuccess(request, mobileNumber, h)
}

export { handleCheckMessageRequest, handleCheckMessagePost }
