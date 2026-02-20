import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'

// Controller for email duplicate subscription page ''
const DEFAULT_SERVICE_NAME = 'Check air quality'

// Create a logger instance ''
const logger = createLogger()

const formatTemplate = (template = '', replacements = {}) => {
  return Object.keys(replacements).reduce((value, key) => {
    return value.replace(`{${key}}`, replacements[key])
  }, template)
}

const handleEmailDuplicateRequest = (request, h, content = english) => {
  logger.info('Showing email duplicate subscription page')

  // '' Ensure notificationFlow is set so when user searches again, they stay in flow
  if (!request.yar.get('notificationFlow')) {
    request.yar.set('notificationFlow', 'email')
  }

  // '' Get location and email address from session
  const location = request.yar.get('location') || 'this location'
  const emailAddress = request.yar.get('emailAddress') || 'your email address'

  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  const { footerTxt, phaseBanner, cookieBanner } = languageContent
  const common = languageContent.common || english.common
  const emailDuplicate =
    languageContent.emailDuplicate || english.emailDuplicate
  const metaSiteUrl = getAirQualitySiteUrl(request)
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME
  const pageTitle = emailDuplicate.pageTitle

  const pageContent = {
    heading: emailDuplicate.heading,
    description: formatTemplate(emailDuplicate.description, {
      location,
      emailAddress
    }),
    searchLink: emailDuplicate.searchLinkText,
    searchText: emailDuplicate.searchText
  }

  const viewModel = {
    pageTitle: `${pageTitle} - ${serviceName} - GOV.UK`,
    heading: pageContent.heading,
    page: pageContent.heading,
    serviceName,
    lang,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    cookieBanner,
    displayBacklink: false,
    common,
    content: pageContent,
    location,
    emailAddress
  }

  return h.view('notify/register/email-duplicate/index', viewModel)
}

export { handleEmailDuplicateRequest }
