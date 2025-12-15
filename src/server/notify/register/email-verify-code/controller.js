// Controller for Email verify code page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { config } from '../../../../config/index.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'

const logger = createLogger()

// GET handler ''
export const handleEmailVerifyCodeRequest = (request, h, content = english) => {
  const emailAddress = request.yar.get('emailAddress')
  const token = request.yar.get('emailVerificationToken')

  if (!emailAddress || !token) {
    // Missing prerequisites – restart journey ''
    return h.redirect('/notify/register/email-details')
  }

  logger.info('Displaying email verify code page')

  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  const viewModel = {
    pageTitle: 'Enter the code we emailed you - Check air quality - GOV.UK',
    heading: 'Enter the code we emailed you',
    page: 'Enter the code we emailed you',
    serviceName: 'Check air quality',
    lang: LANG_EN,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    emailAddress,
    formData: request.yar.get('emailVerifyForm') || {},
    // In non-production, expose the token to unblock local testing ''
    debugToken: !config.get('isProduction') ? token : undefined
  }

  return h.view('notify/register/email-verify-code/index', viewModel)
}

// POST handler ''
export const handleEmailVerifyCodePost = (request, h, content = english) => {
  const submitted = (request.payload?.emailVerifyCode || '').trim()
  const expected = request.yar.get('emailVerificationToken')
  const emailAddress = request.yar.get('emailAddress')

  if (!emailAddress || !expected) {
    return h.redirect('/notify/register/email-details')
  }

  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  if (!submitted) {
    const viewModel = {
      pageTitle:
        'Error: Enter the code we emailed you - Check air quality - GOV.UK',
      heading: 'Enter the code we emailed you',
      page: 'Enter the code we emailed you',
      serviceName: 'Check air quality',
      lang: LANG_EN,
      metaSiteUrl,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      emailAddress,
      error: { message: 'Enter the code', field: 'emailVerifyCode' },
      formData: request.payload
    }
    return h.view('notify/register/email-verify-code/index', viewModel)
  }

  const allowDevBypass = !config.get('isProduction') && submitted === '12345' // dev shortcut ''
  if (submitted !== expected && !allowDevBypass) {
    const viewModel = {
      pageTitle:
        'Error: Enter the code we emailed you - Check air quality - GOV.UK',
      heading: 'Enter the code we emailed you',
      page: 'Enter the code we emailed you',
      serviceName: 'Check air quality',
      lang: LANG_EN,
      metaSiteUrl,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      emailAddress,
      error: { message: 'Code is incorrect', field: 'emailVerifyCode' },
      formData: request.payload
    }
    logger.info('Email verification failed: incorrect code')
    return h.view('notify/register/email-verify-code/index', viewModel)
  }

  // Success: mark email verified ''
  request.yar.set('emailVerified', true)
  logger.info('Email verification succeeded')

  // Next step placeholder: go to confirm-alert-details (reusing existing path) ''
  return h.redirect('/notify/register/confirm-alert-details')
}

export {}
