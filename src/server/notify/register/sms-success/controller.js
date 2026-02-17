import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { config } from '../../../../config/index.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'

// Create a logger instance ''
const logger = createLogger()

const formatSmsSuccessHeading = (template = '', location = '') => {
  if (!template) {
    return ''
  }

  if (template.includes('{location}')) {
    return template.replace('{location}', location)
  }

  return location ? `${template} ${location}` : template
}

const handleAlertsSuccessRequest = (request, h, content = english) => {
  logger.info('Showing alerts success page')

  // '' Clear notification flow flag - user has successfully completed subscription
  request.yar.clear('notificationFlow')
  request.yar.clear('locationId')
  request.yar.clear('latitude')
  request.yar.clear('longitude')

  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  const { footerTxt, phaseBanner, backlink, cookieBanner } = languageContent
  const common = languageContent.common || english.common
  const smsSuccess = languageContent.smsSuccess || english.smsSuccess
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // Get data from session
  const mobileNumber = request.yar.get('mobileNumber') || 'Not provided'
  const rawLocation = request.yar.get('location') || 'Not selected'
  // '' Remove 'Air quality in' prefix if present
  const location = rawLocation.replace(/^\s*air\s+quality\s+in\s+/i, '').trim()
  const alertDetailsConfirmed =
    request.yar.get('alertDetailsConfirmed') || false

  const smsSuccessHeadingTemplate =
    smsSuccess?.bannerHeading || english.smsSuccess?.bannerHeading || ''
  const smsSuccessHeading = formatSmsSuccessHeading(
    smsSuccessHeadingTemplate,
    location
  )

  const serviceName = common?.serviceName || 'Check air quality'
  const viewModel = {
    pageTitle: `${smsSuccess.pageTitle} - ${serviceName} - GOV.UK`,
    heading: smsSuccess.heading,
    page: smsSuccess.heading,
    serviceName,
    lang,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    mobileNumber,
    location,
    common,
    content: smsSuccess,
    smsSuccessHeading,
    alertDetailsConfirmed,
    formData: request.yar.get('formData') || {},
    userResearchPanelUrl: config.get('userResearchPanelUrl')
  }

  return h.view('notify/register/sms-success/index', viewModel)
}

const handleAlertsSuccessPost = (request, h, content = english) => {
  // This is a success page, typically would just redirect back to home or clear session

  // Clear all notification session data when user is done
  request.yar.clear('mobileNumber')
  request.yar.clear('location')
  request.yar.clear('locationId')
  request.yar.clear('latitude')
  request.yar.clear('longitude')
  request.yar.clear('alertDetailsConfirmed')
  request.yar.clear('notifyJourney')
  request.yar.clear('notificationFlow')
  request.yar.clear('formData')

  // Redirect to home page ''
  return h.redirect('/')
}

export { handleAlertsSuccessRequest, handleAlertsSuccessPost }
