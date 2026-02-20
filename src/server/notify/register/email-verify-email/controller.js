// Controller for email verify email page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { config } from '../../../../config/index.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'

// Constants ''
const DEFAULT_SERVICE_NAME = 'Check air quality'
const VIEW_PATH = 'notify/register/email-verify-email/index'

// Create a logger instance ''
const logger = createLogger()

const buildPageTitle = (title = '', serviceName = DEFAULT_SERVICE_NAME) => {
  return `${title} - ${serviceName} - GOV.UK`
}

const getEmailVerifyContent = (request, content = english) => {
  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  const emailVerifyEmail =
    languageContent.emailVerifyEmail || english.emailVerifyEmail
  const common = languageContent.common || english.common
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME

  return { lang, languageContent, emailVerifyEmail, common, serviceName }
}

/**
 * Handle GET request for email verify email page ''
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @param {Object} content - Content object (optional, defaults to english)
 * @returns {Object} - View response with data
 */
const handleEmailVerifyRequest = (request, h, content = english) => {
  logger.info('Displaying email verify email page')

  // '' Get the email address from session
  const emailAddress = request.yar.get('emailAddress') || ''

  if (!emailAddress) {
    // '' If no email address in session, redirect back to email entry page
    return h.redirect(config.get('notify.emailDetailsPath'))
  }

  const { lang, languageContent, emailVerifyEmail, common, serviceName } =
    getEmailVerifyContent(request, content)
  const { footerTxt, phaseBanner, cookieBanner } = languageContent
  const metaSiteUrl = getAirQualitySiteUrl(request)
  // '' Get location from session
  const location = request.yar.get('location') || ''
  const sentLinkText = emailVerifyEmail.sentLinkText.replace(
    '{emailAddress}',
    `<strong>${emailAddress}</strong>`
  )
  const confirmLinkText = emailVerifyEmail.confirmLinkText.replace(
    '{location}',
    `<strong>${location}</strong>`
  )
  const pageTitle = buildPageTitle(emailVerifyEmail.pageTitle, serviceName)

  const viewModel = {
    pageTitle,
    heading: emailVerifyEmail.heading,
    page: emailVerifyEmail.heading,
    serviceName,
    lang,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    cookieBanner,
    common,
    content: emailVerifyEmail,
    sentLinkText,
    confirmLinkText,
    emailSendActivationPath: config.get('notify.emailSendActivationPath'),
    smsMobileNumberPath: config.get('notify.smsMobileNumberPath'),
    displayBacklink: true,
    customBackLink: true,
    backLinkText: common?.backLinkText || 'Back',
    backLinkUrl: config.get('notify.emailDetailsPath'),
    emailAddress
  }

  return h.view(VIEW_PATH, viewModel)
}

export { handleEmailVerifyRequest }
