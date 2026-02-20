// Alerts success controller supporting email & SMS ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'

const logger = createLogger()

const determineMethod = (request) => {
  const emailAddress = request.yar.get('emailAddress')
  const mobileNumber = request.yar.get('mobileNumber')
  if (emailAddress) return { method: 'email', value: emailAddress }
  if (mobileNumber) return { method: 'sms', value: mobileNumber }
  return { method: 'unknown', value: 'Not provided' }
}

export const handleAlertsSuccessRequest = (request, h, content = english) => {
  logger.info('Showing alerts success page')

  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)
  const { method, value } = determineMethod(request)
  const location = request.yar.get('location') || 'Not selected'
  const alertDetailsConfirmed =
    request.yar.get('alertDetailsConfirmed') || false

  const template =
    method === 'email'
      ? 'notify/register/alerts-success/index'
      : 'notify/register/sms-success/index'

  const viewModel = {
    pageTitle:
      'You have successfully signed up for air quality alerts - Check air quality - GOV.UK',
    heading: 'You have successfully signed up for air quality alerts',
    page: 'You have successfully signed up for air quality alerts',
    serviceName: 'Check air quality',
    lang: LANG_EN,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    content: english.emailSuccess,
    contactMethod: method,
    contactValue: value,
    mobileNumber: method === 'sms' ? value : undefined,
    emailAddress: method === 'email' ? value : undefined,
    location,
    alertDetailsConfirmed,
    formData: request.yar.get('formData') || {}
  }

  return h.view(template, viewModel)
}

export const handleAlertsSuccessPost = (request, h) => {
  // Clear all relevant notification journey data ''
  ;[
    'mobileNumber',
    'emailAddress',
    'location',
    'alertDetailsConfirmed',
    'notifyJourney',
    'formData',
    'emailVerificationToken',
    'emailVerified'
  ].forEach((k) => request.yar.clear(k))
  return h.redirect('/')
}

export {}
