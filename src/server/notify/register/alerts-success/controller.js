// '' Email alerts success controller
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { config } from '../../../../config/index.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'

// '' Create a logger instance
const logger = createLogger()

const ALERTS_SUCCESS_SESSION_KEYS = [
  'emailAddress',
  'location',
  'locationId',
  'latitude',
  'longitude',
  'alertDetailsConfirmed',
  'notifyJourney',
  'notificationFlow',
  'formData',
  'emailVerificationToken',
  'emailVerified'
]

const clearSessionKeys = (request, keys) => {
  keys.forEach((key) => request.yar.clear(key))
}

const formatEmailSuccessHeading = (template = '', location = '') => {
  if (!template) {
    return ''
  }
  if (template.includes('{location}')) {
    return template.replace('{location}', location)
  }
  return location ? `${template} ${location}` : template
}

const formatTemplate = (template = '', replacements = {}) => {
  return Object.keys(replacements).reduce((value, key) => {
    return value.replace(`{${key}}`, replacements[key])
  }, template)
}

const getAlertsSuccessSessionData = (request, emailSuccess) => {
  const emailAddress = request.yar.get('emailAddress') || 'Not provided'
  const rawLocation = request.yar.get('location') || 'Not selected'
  const location = rawLocation.replace(/^\s*air\s+quality\s+in\s+/i, '').trim()
  const alertDetailsConfirmed =
    request.yar.get('alertDetailsConfirmed') || false

  const emailSuccessHeadingTemplate =
    emailSuccess?.bannerHeading || english.emailSuccess?.bannerHeading || ''
  const emailSuccessHeading = formatEmailSuccessHeading(
    emailSuccessHeadingTemplate,
    location
  )
  const emailSuccessAnotherAlertPrefix = formatTemplate(
    emailSuccess.anotherAlertPrefix,
    { emailAddress }
  )

  return {
    emailAddress,
    location,
    alertDetailsConfirmed,
    emailSuccessHeading,
    emailSuccessAnotherAlertPrefix,
    formData: request.yar.get('formData') || {}
  }
}

const handleAlertsSuccessRequest = (request, h, _content = english) => {
  logger.info('Showing email alerts success page')

  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : english
  const { footerTxt, phaseBanner, backlink, cookieBanner } = languageContent
  const common = languageContent.common || english.common
  const emailSuccess = languageContent.emailSuccess || english.emailSuccess
  const metaSiteUrl = getAirQualitySiteUrl(request)

  const {
    emailAddress,
    location,
    alertDetailsConfirmed,
    emailSuccessHeading,
    emailSuccessAnotherAlertPrefix,
    formData
  } = getAlertsSuccessSessionData(request, emailSuccess)

  const serviceName = common?.serviceName || 'Check air quality'
  const viewModel = {
    pageTitle: `${emailSuccess.pageTitle} - ${serviceName} - GOV.UK`,
    heading: emailSuccess.heading,
    page: emailSuccess.heading,
    serviceName,
    lang,
    metaSiteUrl,
    currentPath: request.path,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    emailAddress,
    location,
    common,
    content: emailSuccess,
    emailSuccessHeading,
    emailSuccessAnotherAlertPrefix,
    alertDetailsConfirmed,
    formData,
    userResearchPanelUrl: config.get('userResearchPanelUrl')
  }

  return h.view('notify/register/alerts-success/index', viewModel)
}

const handleAlertsSuccessPost = (request, h) => {
  // '' Clear all notification session data when user is done
  clearSessionKeys(request, ALERTS_SUCCESS_SESSION_KEYS)

  return h.redirect('/')
}

export { handleAlertsSuccessRequest, handleAlertsSuccessPost }
