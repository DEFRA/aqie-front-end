// Controller for confirm alert details supporting SMS and Email ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'

const logger = createLogger()

// Helper: derive contact method and value ''
const getContactDetails = (request) => {
  const emailAddress = request.yar.get('emailAddress')
  const mobileNumber = request.yar.get('mobileNumber')
  if (emailAddress) {
    return { method: 'email', value: emailAddress }
  }
  if (mobileNumber) {
    return { method: 'sms', value: mobileNumber }
  }
  return { method: 'unknown', value: 'Not provided' }
}

export const handleConfirmAlertDetailsRequest = (
  request,
  h,
  content = english
) => {
  logger.info('Showing confirm alert details page')

  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)
  const { method, value } = getContactDetails(request)
  const location = request.yar.get('location') || 'Not selected'

  // Template: use dedicated email confirm page else existing SMS template ''
  const template =
    method === 'email'
      ? 'notify/register/confirm-alert-details/index'
      : 'notify/register/sms-confirm-details/index'

  const viewModel = {
    pageTitle: 'Confirm your alert details - Check air quality - GOV.UK',
    heading: 'Confirm your alert details',
    page: 'Confirm your alert details',
    serviceName: 'Check air quality',
    lang: LANG_EN,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    contactMethod: method,
    contactValue: value,
    mobileNumber: method === 'sms' ? value : undefined,
    emailAddress: method === 'email' ? value : undefined,
    location,
    formData: request.yar.get('formData') || {}
  }

  return h.view(template, viewModel)
}

export const handleConfirmAlertDetailsPost = (
  request,
  h,
  content = english
) => {
  const { confirmDetails } = request.payload || {}
  const { method, value } = getContactDetails(request)
  const location = request.yar.get('location') || 'Not selected'
  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  const template =
    method === 'email'
      ? 'notify/register/confirm-alert-details/index'
      : 'notify/register/sms-confirm-details/index'

  if (!confirmDetails || confirmDetails !== 'yes') {
    const viewModel = {
      pageTitle:
        'Error: Confirm your alert details - Check air quality - GOV.UK',
      heading: 'Confirm your alert details',
      page: 'Confirm your alert details',
      serviceName: 'Check air quality',
      lang: LANG_EN,
      metaSiteUrl,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      contactMethod: method,
      contactValue: value,
      mobileNumber: method === 'sms' ? value : undefined,
      emailAddress: method === 'email' ? value : undefined,
      location,
      error: {
        message: 'Select yes to confirm your alert details',
        field: 'confirmDetails'
      },
      formData: request.payload
    }
    return h.view(template, viewModel)
  }

  request.yar.set('alertDetailsConfirmed', true)

  // Redirect to appropriate success page ''
  if (method === 'email') {
    return h.redirect('/notify/register/alerts-success')
  }
  return h.redirect('/notify/register/sms-success')
}

export {}
