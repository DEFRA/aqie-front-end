// Controller for email confirm link callback page ''
// '' This page is the landing point when a user clicks the activation link in their email.
// '' It validates the token silently and redirects to the success page on success.
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { config } from '../../../../config/index.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'
import {
  setupEmailAlert,
  validateEmailLink
} from '../../../common/services/notify.js'

const logger = createLogger()
const VIEW_PATH = 'notify/register/email-confirm-link/index'
const DEFAULT_SERVICE_NAME = 'Check air quality'

const getContent = (request) => {
  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : english
  const emailConfirmLink =
    languageContent.emailConfirmLink || english.emailConfirmLink
  const common = languageContent.common || english.common
  return { lang, languageContent, emailConfirmLink, common }
}

/**
 * Handle GET request when user clicks the activation link in their email ''
 * Validates the token and redirects to success, or shows an error page
 */
export const handleEmailConfirmLinkRequest = async (request, h) => {
  logger.info('Email confirm link callback received')

  const { token } = request.query

  if (!token) {
    logger.warn('[EMAIL CONFIRM] No token in query string')
    const { lang, languageContent, emailConfirmLink, common } =
      getContent(request)
    const { footerTxt, phaseBanner, cookieBanner } = languageContent
    return h.view(VIEW_PATH, {
      pageTitle: emailConfirmLink.errorPageTitle,
      heading: emailConfirmLink.errorHeading,
      errorMessage: emailConfirmLink.errorMissingToken,
      serviceName: DEFAULT_SERVICE_NAME,
      lang,
      metaSiteUrl: getAirQualitySiteUrl(request),
      footerTxt,
      phaseBanner,
      cookieBanner,
      common,
      content: emailConfirmLink
    })
  }

  try {
    logger.info(`[EMAIL CONFIRM] Validating token: ${token.substring(0, 6)}...`)

    const result = await validateEmailLink(token, request)

    if (!result.ok) {
      const error = new Error('Email link validation failed')
      error.code = 'invalid_token'
      throw error
    }

    // '' Mark email as confirmed in session
    request.yar.set('emailConfirmed', true)
    request.yar.set('emailLinkToken', token)

    const emailAddress = request.yar.get('emailAddress')
    const location = request.yar.get('location') || ''
    const locationId = request.yar.get('locationId') || ''
    const lat = request.yar.get('latitude')
    const long = request.yar.get('longitude')

    if (!emailAddress) {
      const error = new Error('Missing email address in session')
      error.code = 'setup_alert'
      throw error
    }

    const setupResult = await setupEmailAlert(
      emailAddress,
      location,
      locationId,
      lat,
      long,
      request
    )

    if (!setupResult.ok) {
      // '' Handle duplicate email alert
      if (setupResult.status === 409) {
        request.yar.set('notificationFlow', 'email')
        const emailDuplicatePath = config.get('notify.emailDuplicatePath')
        return h.redirect(emailDuplicatePath)
      }
      const error = new Error('Setup alert failed')
      error.code = 'setup_alert'
      throw error
    }

    logger.info('[EMAIL CONFIRM] Token accepted, redirecting to success')
    const alertsSuccessPath = config.get('notify.alertsSuccessPath')
    return h.redirect(alertsSuccessPath)
  } catch (error) {
    logger.error(`[EMAIL CONFIRM] Token validation failed: ${error.message}`)

    const { lang, languageContent, emailConfirmLink, common } =
      getContent(request)
    const { footerTxt, phaseBanner, cookieBanner } = languageContent

    const errorMessage =
      error.code === 'invalid_token'
        ? emailConfirmLink.errorInvalidToken
        : emailConfirmLink.errorSetupAlert

    return h.view(VIEW_PATH, {
      pageTitle: emailConfirmLink.errorPageTitle,
      heading: emailConfirmLink.errorHeading,
      errorMessage,
      serviceName: DEFAULT_SERVICE_NAME,
      lang,
      metaSiteUrl: getAirQualitySiteUrl(request),
      footerTxt,
      phaseBanner,
      cookieBanner,
      common,
      content: emailConfirmLink
    })
  }
}
