// Email alerts success controller
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { config } from '../../../../config/index.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'
import { buildBackendApiRequest } from '../../../common/helpers/backend-api-helper.js'

// Create a logger instance
const logger = createLogger()

const MOCK_VERIFICATION_TOKEN_HEADER = 'x-aqie-email-verification-token'
const MOCK_GENERATE_LINK_ENDPOINT_HEADER = 'x-aqie-email-generate-link-endpoint'
const MOCK_EMAIL_VERIFICATION_TOKEN_SESSION_KEY = 'mockEmailVerificationToken'
const CDP_TEST_HOST_MARKER = '.test.cdp-int.'
const CDP_PERF_TEST_HOST_MARKER = '.perf-test.cdp-int.'
const CDP_PERF_HOST_MARKER = '.perf.cdp-int.'

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
  'emailLinkToken',
  'emailVerificationToken',
  MOCK_EMAIL_VERIFICATION_TOKEN_SESSION_KEY,
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

const isCdpTestOrPerfRequest = (request) => {
  const host = request?.headers?.host?.toLowerCase() || ''
  return (
    host.includes(CDP_TEST_HOST_MARKER) ||
    host.includes(CDP_PERF_TEST_HOST_MARKER) ||
    host.includes(CDP_PERF_HOST_MARKER)
  )
}

const isMockVerificationHeaderEnabled = (request) => {
  const env = process.env.NODE_ENV || 'development'
  return env !== 'production' || isCdpTestOrPerfRequest(request)
}

const buildGenerateLinkMockEndpoint = (request) => {
  const notifyBaseUrl = config.get('notify.baseUrl')
  const emailGenerateLinkPath = config.get('notify.emailGenerateLinkPath')

  if (!notifyBaseUrl || !emailGenerateLinkPath) {
    return null
  }

  const { url } = buildBackendApiRequest(
    request,
    notifyBaseUrl,
    emailGenerateLinkPath
  )

  return url
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
  const emailVerificationToken =
    request.yar.get(MOCK_EMAIL_VERIFICATION_TOKEN_SESSION_KEY) || ''

  return {
    emailAddress,
    location,
    alertDetailsConfirmed,
    emailSuccessHeading,
    emailSuccessAnotherAlertPrefix,
    emailVerificationToken,
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
    emailVerificationToken,
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

  const response = h.view('notify/register/alerts-success/index', viewModel)

  if (
    isMockVerificationHeaderEnabled(request) &&
    emailVerificationToken &&
    typeof response?.header === 'function'
  ) {
    response.header(MOCK_VERIFICATION_TOKEN_HEADER, emailVerificationToken)

    const generateLinkEndpoint = buildGenerateLinkMockEndpoint(request)
    if (generateLinkEndpoint) {
      response.header(MOCK_GENERATE_LINK_ENDPOINT_HEADER, generateLinkEndpoint)
    }
  }

  return response
}

const handleAlertsSuccessPost = (request, h) => {
  // Clear all notification session data when user is done
  clearSessionKeys(request, ALERTS_SUCCESS_SESSION_KEYS)

  return h.redirect('/')
}

export { handleAlertsSuccessRequest, handleAlertsSuccessPost }
