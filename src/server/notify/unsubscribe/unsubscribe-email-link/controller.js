// Controller for unsubscribe email link page
// Landed on when user clicks the unsubscribe link in an email alert
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { resolveNotifyLanguage } from '../../register/helpers/resolve-notify-language.js'
import { unsubscribeEmailAlert } from '../../../common/services/notify.js'

const logger = createLogger()
const VIEW_PATH = 'notify/unsubscribe/unsubscribe-email-link/index'
const DEFAULT_SERVICE_NAME = 'Check air quality'

const getContent = (request) => {
  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : english
  const unsubscribeEmailLink =
    languageContent.unsubscribeEmailLink || english.unsubscribeEmailLink
  const common = languageContent.common || english.common
  return { lang, languageContent, unsubscribeEmailLink, common }
}

const buildViewModel = (
  request,
  lang,
  languageContent,
  unsubscribeEmailLink,
  common,
  email
) => {
  const { footerTxt, phaseBanner, cookieBanner } = languageContent
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME
  return {
    pageTitle: `${unsubscribeEmailLink.heading} - ${serviceName} - GOV.UK`,
    heading: unsubscribeEmailLink.heading,
    serviceName,
    lang,
    metaSiteUrl: getAirQualitySiteUrl(request),
    currentPath: request.path,
    footerTxt,
    phaseBanner,
    cookieBanner,
    common,
    content: unsubscribeEmailLink,
    email
  }
}

/**
 * Handle GET request — user lands here from the unsubscribe link in their email
 */
export const handleUnsubscribeEmailLinkRequest = (request, h) => {
  logger.info('Unsubscribe email link page requested')

  const email = request.query.email || request.yar.get('unsubscribeEmail') || ''

  if (email) {
    request.yar.set('unsubscribeEmail', email)
  }

  const { lang, languageContent, unsubscribeEmailLink, common } =
    getContent(request)
  return h.view(
    VIEW_PATH,
    buildViewModel(
      request,
      lang,
      languageContent,
      unsubscribeEmailLink,
      common,
      email
    )
  )
}

/**
 * Handle POST request — user clicked "Yes, unsubscribe"
 * Calls the backend DELETE /opt-out-email-alert endpoint
 */
export const handleUnsubscribeEmailLinkPost = async (request, h) => {
  logger.info('Unsubscribe confirmed by user')
  const email = request.yar.get('unsubscribeEmail') || ''
  logger.info(
    `[UNSUBSCRIBE] User confirmed unsubscribe for email=${email ? email.split('@')[0] + '@****' : 'unknown'}`
  )

  const result = await unsubscribeEmailAlert(email, request)
  logger.info(
    `[UNSUBSCRIBE] Backend response ok=${result.ok} status=${result.status ?? 'n/a'} skipped=${result.skipped ?? false}`
  )

  if (!result.ok && !result.skipped) {
    logger.error(
      `[UNSUBSCRIBE] Backend DELETE failed status=${result.status} error=${result.error ?? 'unknown'}`
    )
  }

  return h.redirect('/notify/unsubscribe-success')
}
