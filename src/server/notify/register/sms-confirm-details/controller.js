import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'

// Create a logger instance ''
const logger = createLogger()

const handleConfirmAlertDetailsRequest = (request, h, content = english) => {
  logger.info('Showing confirm alert details page')

  const { footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // Get data from session
  const mobileNumber = request.yar.get('mobileNumber') || 'Not provided'
  const location = request.yar.get('location') || 'Not selected'

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
    mobileNumber,
    location,
    formData: request.yar.get('formData') || {}
  }

  return h.view('notify/register/sms-confirm-details/index', viewModel)
}

const handleConfirmAlertDetailsPost = (request, h, content = english) => {
  const { confirmDetails } = request.payload

  // Basic validation
  if (!confirmDetails || confirmDetails !== 'yes') {
    const { footerTxt, phaseBanner, backlink, cookieBanner } = content
    const metaSiteUrl = getAirQualitySiteUrl(request)

    // Get data from session for display
    const mobileNumber = request.yar.get('mobileNumber') || 'Not provided'
    const location = request.yar.get('location') || 'Not selected'

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
      mobileNumber,
      location,
      error: {
        message: 'Select yes to confirm your alert details',
        field: 'confirmDetails'
      },
      formData: request.payload
    }

    return h.view('notify/register/sms-confirm-details/index', viewModel)
  }

  // Store confirmation in session
  request.yar.set('alertDetailsConfirmed', true)

  // Redirect to success page or next step ''
  return h.redirect('/notify/register/sms-success')
}

export { handleConfirmAlertDetailsRequest, handleConfirmAlertDetailsPost }
