// Controller for SMS send activation page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { config } from '../../../../config/index.js'
import { sendSmsCode } from '../../../common/services/notify.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'

// Constants ''
const MOBILE_NUMBER_PAGE_PATH = config.get('notify.smsMobileNumberPath')
const SMS_VERIFY_CODE_PATH = config.get('notify.smsVerifyCodePath')
const DEFAULT_SERVICE_NAME = 'Check air quality'
const HTTP_FORBIDDEN = 403

// Create a logger instance ''
const logger = createLogger()

const buildSmsMobileNumberUrl = ({
  location = '',
  locationId = '',
  lat,
  long
} = {}) => {
  const queryParams = new URLSearchParams()
  if (location) {
    queryParams.set('location', location)
  }
  if (locationId) {
    queryParams.set('locationId', locationId)
  }
  if (lat) {
    queryParams.set('lat', lat)
  }
  if (long) {
    queryParams.set('long', long)
  }

  const queryString = queryParams.toString()
  return queryString
    ? `${MOBILE_NUMBER_PAGE_PATH}?${queryString}`
    : MOBILE_NUMBER_PAGE_PATH
}

const formatBodyText = (template = '', mobileNumber = '') => {
  if (!template) {
    return ''
  }

  return template.replace('{mobileNumber}', mobileNumber)
}

function getSendActivationPageContent(request, content) {
  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  const { footerTxt, phaseBanner, cookieBanner } = languageContent
  const common = languageContent.common || english.common
  const smsSendActivation =
    languageContent.smsSendActivation || english.smsSendActivation
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME

  return {
    lang,
    footerTxt,
    phaseBanner,
    cookieBanner,
    common,
    smsSendActivation,
    serviceName
  }
}

function buildSendActivationViewModel({
  request,
  mobileNumber,
  backLinkUrl,
  pageContent,
  error = null
}) {
  const {
    lang,
    footerTxt,
    phaseBanner,
    cookieBanner,
    common,
    smsSendActivation,
    serviceName
  } = pageContent

  const pageTitle = smsSendActivation.pageTitle
  const bodyText = formatBodyText(
    smsSendActivation.bodyText,
    `<strong>${mobileNumber}</strong>`
  )

  return {
    pageTitle: `${pageTitle} - ${serviceName} - GOV.UK`,
    heading: smsSendActivation.heading,
    page: smsSendActivation.heading,
    serviceName,
    lang,
    metaSiteUrl: getAirQualitySiteUrl(request),
    currentPath: request.path,
    footerTxt,
    phaseBanner,
    backlink: {
      text: common?.backLinkText || 'Back'
    },
    cookieBanner,
    common,
    content: smsSendActivation,
    bodyText,
    displayBacklink: true,
    customBackLink: true,
    backLinkText: common?.backLinkText || 'Back',
    backLinkUrl,
    changeMobileNumberUrl: backLinkUrl,
    mobileNumber,
    error
  }
}

function getSendFailureMessage(status, smsSendActivation) {
  const genericMessage =
    smsSendActivation?.errors?.sendFailed ||
    'Sorry, we could not send your activation code. Please try again.'

  if (status === HTTP_FORBIDDEN) {
    return (
      smsSendActivation?.errors?.accessDenied ||
      'Sorry, we could not send your activation code because the SMS service is currently unavailable from this network. Please try again later.'
    )
  }

  return genericMessage
}

function logSmsSendOutcome(result) {
  logger.info('SMS code send result', {
    ok: result?.ok,
    skipped: result?.skipped,
    status: result?.status,
    hasData: !!result?.data,
    hasError: !!result?.error,
    isMock: result?.mock
  })

  if (result?.skipped) {
    logger.warn('SMS service is disabled or not configured')
    return
  }

  if (!result?.ok) {
    logger.error('SMS send returned error', {
      status: result?.status,
      error: result?.error,
      body: result?.body
    })
    return
  }

  if (result?.mock) {
    logger.info('Mock OTP enabled, bypassing backend service', {
      mockOtpCode: result?.data?.mockOtpCode
    })
    return
  }

  logger.info('Queued Notify SMS for delivery')
}

/**
 * Handle GET request for SMS send activation page ''
 * @param request - Hapi request object
 * @param h - Hapi response toolkit
 * @returns - View response with data
 */
export const handleSendActivationRequest = (request, h, content = english) => {
  logger.info('Displaying SMS send activation page')

  // Get the mobile number from session ''
  const mobileNumber = request.yar.get('mobileNumber') || ''

  if (!mobileNumber) {
    // If no mobile number in session, redirect back to mobile number page ''
    return h.redirect(MOBILE_NUMBER_PAGE_PATH)
  }

  // Get location context from session to build back link with query parameters ''
  const locationId = request.yar.get('locationId') || ''
  const location = request.yar.get('location') || ''
  const lat = request.yar.get('latitude')
  const long = request.yar.get('longitude')
  const backLinkUrl = buildSmsMobileNumberUrl({
    location,
    locationId,
    lat,
    long
  })

  const pageContent = getSendActivationPageContent(request, content)
  const viewModel = buildSendActivationViewModel({
    request,
    mobileNumber,
    backLinkUrl,
    pageContent
  })

  return h.view('notify/register/sms-send-activation/index', viewModel)
}

/**
 * Handle POST request for SMS send activation page ''
 * @param request - Hapi request object
 * @param h - Hapi response toolkit
 * @returns - Redirect or view response
 */
export const handleSendActivationPost = async (request, h) => {
  logger.info('Processing SMS send activation request')

  // Get the mobile number from session ''
  const mobileNumber = request.yar.get('mobileNumber')

  if (!mobileNumber) {
    // If no mobile number in session, redirect back to mobile number page ''
    return h.redirect(MOBILE_NUMBER_PAGE_PATH)
  }

  // Store activation timestamp and initialize OTP generation sequence ''
  request.yar.set('activationSent', Date.now())
  request.yar.set('otpGenerationSequence', 1)
  request.yar.set('otpGeneratedAt', Date.now())
  request.yar.set('codeVerified', false)

  const locationId = request.yar.get('locationId') || ''
  const location = request.yar.get('location') || ''
  const lat = request.yar.get('latitude')
  const long = request.yar.get('longitude')
  const backLinkUrl = buildSmsMobileNumberUrl({
    location,
    locationId,
    lat,
    long
  })
  const pageContent = getSendActivationPageContent(request, english)

  const renderSendFailure = (status = null) => {
    const viewModel = buildSendActivationViewModel({
      request,
      mobileNumber,
      backLinkUrl,
      pageContent,
      error: {
        message: getSendFailureMessage(status, pageContent.smsSendActivation)
      }
    })

    viewModel.pageTitle = `Error: ${viewModel.pageTitle}`
    return h.view('notify/register/sms-send-activation/index', viewModel)
  }

  try {
    // Send OTP request to backend (backend generates and sends the code) ''
    logger.info('Attempting to send SMS code', {
      phoneNumberLength: mobileNumber?.length,
      phoneStart: mobileNumber?.substring(0, 4)
    })

    const result = await sendSmsCode(mobileNumber, request)
    logSmsSendOutcome(result)

    if (result?.skipped || !result?.ok) {
      return renderSendFailure(result?.status)
    }
  } catch (err) {
    logger.error('Notify SMS send failed with exception', err)
    return renderSendFailure()
  }

  logger.info(
    `SMS activation code request sent for mobile number: ${mobileNumber.substring(0, 4)}****`
  )

  return h.redirect(SMS_VERIFY_CODE_PATH)
}
