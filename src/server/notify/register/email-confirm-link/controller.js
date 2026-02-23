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

    // '' Log the full validateEmailLink response to confirm what the backend returns
    logger.info(
      {
        ok: result.ok,
        status: result.status,
        skipped: result.skipped,
        dataKeys: result.data ? Object.keys(result.data) : undefined,
        // '' Log whether the token response itself carries email/location data (session-independent)
        tokenHasEmail: !!result.data?.emailAddress,
        tokenHasLocation: !!result.data?.location,
        tokenHasLatLong:
          result.data?.lat !== undefined && result.data?.long !== undefined,
        body: result.body
      },
      '[EMAIL CONFIRM] validateEmailLink raw response'
    )

    if (!result.ok) {
      const error = new Error('Email link validation failed')
      error.code = 'invalid_token'
      throw error
    }

    // '' Mark email as confirmed in session
    request.yar.set('emailConfirmed', true)
    request.yar.set('emailLinkToken', token)

    // '' Prefer data embedded in the token validation response (works when session has expired
    // '' or the link was opened in a different browser/tab), then fall back to session.
    const tokenData = result.data || {}
    const emailAddress =
      tokenData.emailAddress || request.yar.get('emailAddress')
    const location = tokenData.location || request.yar.get('location') || ''
    const locationId = request.yar.get('locationId') || ''
    const lat =
      tokenData.lat !== undefined ? tokenData.lat : request.yar.get('latitude')
    const long =
      tokenData.long !== undefined
        ? tokenData.long
        : request.yar.get('longitude')

    logger.info(
      `[EMAIL CONFIRM] Resolved emailAddress from ${tokenData.emailAddress ? 'token' : 'session'}`
    )
    logger.info(
      {
        emailAddressSource: tokenData.emailAddress ? 'token' : 'session',
        locationSource: tokenData.location ? 'token' : 'session',
        latSource: tokenData.lat !== undefined ? 'token' : 'session',
        longSource: tokenData.long !== undefined ? 'token' : 'session',
        // '' Mask the actual email but confirm it exists
        hasEmailAddress: !!emailAddress,
        hasLocation: !!location
      },
      '[EMAIL CONFIRM] Resolved data sources'
    )

    if (!emailAddress) {
      const error = new Error(
        'Missing email address in both token response and session'
      )
      error.code = 'setup_alert'
      throw error
    }

    // '' Re-hydrate session with resolved values so the success page renders correctly
    request.yar.set('emailAddress', emailAddress)
    if (location) request.yar.set('location', location)

    const setupResult = await setupEmailAlert(
      emailAddress,
      location,
      locationId,
      lat,
      long,
      request
    )

    // '' Log the full setupEmailAlert response so we can see exactly what the backend returns
    logger.info(
      {
        ok: setupResult.ok,
        status: setupResult.status,
        skipped: setupResult.skipped,
        body: setupResult.body,
        data: setupResult.data,
        error: setupResult.error ? String(setupResult.error) : undefined
      },
      '[EMAIL CONFIRM] setupEmailAlert raw response'
    )

    // '' If notify is disabled/not configured, treat as success (dev/test mode)
    if (setupResult.skipped) {
      logger.warn(
        '[EMAIL CONFIRM] setupEmailAlert skipped (notify disabled) - redirecting to success'
      )
      const alertsSuccessPath = config.get('notify.alertsSuccessPath')
      return h.redirect(alertsSuccessPath)
    }

    if (!setupResult.ok) {
      // '' Handle duplicate email alert (409 Conflict)
      if (setupResult.status === 409) {
        request.yar.set('notificationFlow', 'email')
        const emailDuplicatePath = config.get('notify.emailDuplicatePath')
        return h.redirect(emailDuplicatePath)
      }
      // '' Any other failure from setupEmailAlert (4xx, 5xx, network error) is treated
      // '' as a subscription-limit error. The token was already validated successfully,
      // '' so the most likely cause is the 5-location cap. Redirecting back to
      // '' email-details with maxAlertsEmailError gives the user a clear, actionable
      // '' message rather than the generic "problem with your activation link" page.
      logger.warn(
        {
          status: setupResult.status,
          message: setupResult.body?.message
        },
        '[EMAIL CONFIRM] setupEmailAlert failed – redirecting to email-details with maxAlerts flag'
      )
      request.yar.set('maxAlertsEmailError', true)
      request.yar.set('maxAlertsEmail', emailAddress)
      const emailDetailsPath = config.get('notify.emailDetailsPath')
      return h.redirect(emailDetailsPath)
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
