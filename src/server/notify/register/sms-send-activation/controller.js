// Controller for SMS send activation page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { sendSmsCode } from '../../../common/services/notify.js'

// Constants ''
const MOBILE_NUMBER_PAGE_PATH = '/notify/register/sms-mobile-number'

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

/**
 * Handle GET request for SMS send activation page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} - View response with data
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

  const { footerTxt, phaseBanner, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  const viewModel = {
    pageTitle:
      'We are going to send you an activation code - Check air quality - GOV.UK',
    heading: 'We are going to send you an activation code',
    page: 'We are going to send you an activation code',
    serviceName: 'Check air quality',
    lang: LANG_EN,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    backlink: {
      text: 'Back'
    },
    cookieBanner,
    displayBacklink: true,
    customBackLink: true,
    backLinkText: 'Back',
    backLinkUrl,
    changeMobileNumberUrl: backLinkUrl,
    mobileNumber
  }

  return h.view('notify/register/sms-send-activation/index', viewModel)
}

/**
 * Handle POST request for SMS send activation page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} - Redirect or view response
 */
export const handleSendActivationPost = async (request, h) => {
  logger.info('Processing SMS send activation request')

  // Get the mobile number from session ''
  const mobileNumber = request.yar.get('mobileNumber')

  if (!mobileNumber) {
    // If no mobile number in session, redirect back to mobile number page ''
    return h.redirect('/notify/register/sms-mobile-number')
  }

  // Store activation timestamp and initialize OTP generation sequence ''
  request.yar.set('activationSent', Date.now())
  request.yar.set('otpGenerationSequence', 1)
  request.yar.set('otpGeneratedAt', Date.now())

  try {
    // Send OTP request to backend (backend generates and sends the code) ''
    logger.info('Attempting to send SMS code', {
      phoneNumberLength: mobileNumber?.length,
      phoneStart: mobileNumber?.substring(0, 4)
    })

    const result = await sendSmsCode(mobileNumber, request)

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
    } else if (!result?.ok) {
      logger.error('SMS send returned error', {
        status: result?.status,
        error: result?.error,
        body: result?.body
      })
    } else {
      if (result?.mock) {
        logger.info('Mock OTP enabled, bypassing backend service', {
          mockOtpCode: result?.data?.mockOtpCode
        })
      } else {
        logger.info('Queued Notify SMS for delivery')
      }
    }
  } catch (err) {
    logger.error('Notify SMS send failed with exception', err)
  }

  logger.info(
    `SMS activation code request sent for mobile number: ${mobileNumber.substring(0, 4)}****`
  )

  return h.redirect('/notify/register/sms-verify-code')
}
