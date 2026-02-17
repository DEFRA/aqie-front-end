import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'

// Constants ''
const DEFAULT_SERVICE_NAME = 'Check air quality'

// Create a logger instance ''
const logger = createLogger()

const formatTemplate = (template = '', replacements = {}) => {
  return Object.keys(replacements).reduce((value, key) => {
    return value.replace(`{${key}}`, replacements[key])
  }, template)
}

const handleDuplicateSubscriptionRequest = (request, h, content = english) => {
  logger.info('Showing duplicate subscription page')

  // '' Ensure notificationFlow is set so when user searches again, they stay in flow
  if (!request.yar.get('notificationFlow')) {
    request.yar.set('notificationFlow', 'sms')
  }

  // '' Get location and phone number from session
  const location = request.yar.get('location') || 'this location'
  const mobileNumber = request.yar.get('mobileNumber') || ''

  // '' Use full phone number for display
  const maskedPhoneNumber = mobileNumber

  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  const { footerTxt, phaseBanner, cookieBanner } = languageContent
  const common = languageContent.common || english.common
  const smsDuplicate = languageContent.smsDuplicate || english.smsDuplicate
  const metaSiteUrl = getAirQualitySiteUrl(request)
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME
  const pageTitle = smsDuplicate.pageTitle

  // '' Content structure ready for Welsh translation
  const pageContent = {
    heading: smsDuplicate.heading,
    description: formatTemplate(smsDuplicate.description, {
      location,
      mobileNumber: maskedPhoneNumber
    }),
    searchLink: smsDuplicate.searchLinkText,
    searchText: smsDuplicate.searchText
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
    maskedPhoneNumber
  }

  return h.view('notify/register/sms-duplicate/index', viewModel)
}

export { handleDuplicateSubscriptionRequest }
