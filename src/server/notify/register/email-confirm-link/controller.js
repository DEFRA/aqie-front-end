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
const HTTP_STATUS_CONFLICT = 409
const TOKEN_LOG_PREFIX_LENGTH = 6

const hasOwnValue = (obj, key) => {
  return Object.hasOwn(obj || {}, key)
}

const renderErrorView = (
  request,
  h,
  languageContent,
  emailConfirmLink,
  common,
  lang,
  errorMessage
) => {
  const { footerTxt, phaseBanner, cookieBanner } = languageContent
  return h.view(VIEW_PATH, {
    pageTitle: emailConfirmLink.errorPageTitle,
    heading: emailConfirmLink.errorHeading,
    errorMessage,
    serviceName: DEFAULT_SERVICE_NAME,
    lang,
    metaSiteUrl: getAirQualitySiteUrl(request),
    currentPath: request.path,
    footerTxt,
    phaseBanner,
    cookieBanner,
    common,
    content: emailConfirmLink
  })
}

const resolveEmailAlertData = (tokenData, request) => {
  const hasTokenLat = hasOwnValue(tokenData, 'lat')
  const hasTokenLong = hasOwnValue(tokenData, 'long')

  // '' Prefer signup-specific session context over the general browsing location
  // '' so that visiting other locations before clicking the confirmation link
  // '' doesn't corrupt the subscription data.
  const sessionLocation =
    request.yar.get('emailSignupLocation') ||
    request.yar.get('location') ||
    ''
  const sessionLat =
    request.yar.get('emailSignupLat') ?? request.yar.get('latitude')
  const sessionLong =
    request.yar.get('emailSignupLong') ?? request.yar.get('longitude')

  return {
    emailAddress: tokenData.emailAddress || request.yar.get('emailAddress'),
    location: tokenData.location || sessionLocation,
    locationId: request.yar.get('locationId') || '',
    lat: hasTokenLat ? tokenData.lat : sessionLat,
    long: hasTokenLong ? tokenData.long : sessionLong,
    hasTokenLat,
    hasTokenLong
  }
}

const setConfirmSessionData = (request, token, emailAddress, location) => {
  request.yar.set('emailConfirmed', true)
  request.yar.set('emailLinkToken', token)
  request.yar.set('emailAddress', emailAddress)
  if (location) {
    request.yar.set('location', location)
  }
}

const redirectToAlertsSuccess = (request, h) => {
  request.yar.set('notificationFlow', 'email')
  return h.redirect(config.get('notify.alertsSuccessPath'))
}

const handleSetupFailureRedirect = (setupResult, request, h, emailAddress) => {
  if (setupResult.status === HTTP_STATUS_CONFLICT) {
    request.yar.set('notificationFlow', 'email')
    return h.redirect(config.get('notify.emailDuplicatePath'))
  }

  logger.warn(
    `[EMAIL CONFIRM] setupEmailAlert failed – redirecting to email-details with maxAlerts flag status=${setupResult.status} message=${setupResult.body?.message}`
  )
  request.yar.set('maxAlertsEmailError', true)
  request.yar.set('maxAlertsEmail', emailAddress)
  return h.redirect(config.get('notify.emailDetailsPath'))
}

const getContent = (request) => {
  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : english
  const emailConfirmLink =
    languageContent.emailConfirmLink || english.emailConfirmLink
  const common = languageContent.common || english.common
  return { lang, languageContent, emailConfirmLink, common }
}

const getInvalidTokenError = () => {
  const error = new Error('Email link validation failed')
  error.code = 'invalid_token'
  return error
}

const getSetupAlertError = () => {
  const error = new Error(
    'Missing email address in both token response and session'
  )
  error.code = 'setup_alert'
  return error
}

const restoreSessionFromExpiredToken = (request, body) => {
  if (!body || typeof body !== 'object') {
    return
  }
  if (body.emailAddress) {
    request.yar.set('emailAddress', body.emailAddress)
  }
  if (body.location) {
    request.yar.set('location', body.location)
    request.yar.set('emailSignupLocation', body.location)
  }
  if (body.lat != null) {
    request.yar.set('latitude', body.lat)
    request.yar.set('emailSignupLat', body.lat)
  }
  if (body.long != null) {
    request.yar.set('longitude', body.long)
    request.yar.set('emailSignupLong', body.long)
  }
}

const validateTokenOrThrow = async (token, request) => {
  const result = await validateEmailLink(token, request)
  const hasResultLat = hasOwnValue(result.data, 'lat')
  const hasResultLong = hasOwnValue(result.data, 'long')

  logger.info(
    `[EMAIL CONFIRM] validateEmailLink raw response ok=${result.ok} status=${result.status} skipped=${result.skipped} tokenHasEmail=${!!result.data?.emailAddress} tokenHasLocation=${!!result.data?.location} tokenHasLatLong=${hasResultLat && hasResultLong} data=${JSON.stringify(result.data ?? null)} body=${JSON.stringify(result.body ?? null)}`
  )

  if (!result.ok) {
    restoreSessionFromExpiredToken(request, result.body)
    throw getInvalidTokenError()
  }

  return result
}

const logResolvedEmailDataSources = (
  tokenData,
  emailAddress,
  location,
  hasTokenLat,
  hasTokenLong
) => {
  logger.info(
    `[EMAIL CONFIRM] Resolved data sources emailAddressSource=${tokenData.emailAddress ? 'token' : 'session'} locationSource=${tokenData.location ? 'token' : 'session'} latSource=${hasTokenLat ? 'token' : 'session'} longSource=${hasTokenLong ? 'token' : 'session'} hasEmailAddress=${!!emailAddress} hasLocation=${!!location}`
  )
}

const setupEmailAlertAndLog = async (
  emailAddress,
  location,
  locationId,
  lat,
  long,
  request
) => {
  const setupResult = await setupEmailAlert(
    emailAddress,
    location,
    locationId,
    lat,
    long,
    request
  )

  logger.info(
    `[EMAIL CONFIRM] setupEmailAlert raw response ok=${setupResult.ok} status=${setupResult.status} skipped=${setupResult.skipped} body=${JSON.stringify(setupResult.body)} data=${JSON.stringify(setupResult.data)} error=${setupResult.error ? String(setupResult.error) : undefined}`
  )

  return setupResult
}

const getSetupOutcomeResponse = (setupResult, request, h, emailAddress) => {
  if (setupResult.skipped) {
    logger.warn(
      '[EMAIL CONFIRM] setupEmailAlert skipped (notify disabled) - redirecting to success'
    )
    return redirectToAlertsSuccess(request, h)
  }

  if (!setupResult.ok) {
    return handleSetupFailureRedirect(setupResult, request, h, emailAddress)
  }

  logger.info('[EMAIL CONFIRM] Token accepted, redirecting to success')
  return redirectToAlertsSuccess(request, h)
}

const processValidToken = async (request, h, token) => {
  logger.info(
    `[EMAIL CONFIRM] Validating token: ${token.substring(0, TOKEN_LOG_PREFIX_LENGTH)}...`
  )

  const result = await validateTokenOrThrow(token, request)

  const tokenData = result.data || {}
  const {
    emailAddress,
    location,
    locationId,
    lat,
    long,
    hasTokenLat,
    hasTokenLong
  } = resolveEmailAlertData(tokenData, request)

  logResolvedEmailDataSources(
    tokenData,
    emailAddress,
    location,
    hasTokenLat,
    hasTokenLong
  )

  if (!emailAddress) {
    throw getSetupAlertError()
  }

  setConfirmSessionData(request, token, emailAddress, location)

  const setupResult = await setupEmailAlertAndLog(
    emailAddress,
    location,
    locationId,
    lat,
    long,
    request
  )

  return getSetupOutcomeResponse(setupResult, request, h, emailAddress)
}

/**
 * Handle GET request when user clicks the activation link in their email ''
 * Validates the token and redirects to success, or shows an error page
 */
export const handleEmailConfirmLinkRequest = async (request, h) => {
  logger.info('Email confirm link callback received')

  const { token } = request.query
  const { lang, languageContent, emailConfirmLink, common } =
    getContent(request)

  if (!token) {
    logger.warn('[EMAIL CONFIRM] No token in query string')
    return renderErrorView(
      request,
      h,
      languageContent,
      emailConfirmLink,
      common,
      lang,
      emailConfirmLink.errorMissingToken
    )
  }

  try {
    return await processValidToken(request, h, token)
  } catch (error) {
    logger.error(`[EMAIL CONFIRM] Token validation failed: ${error.message}`)

    const errorMessage =
      error.code === 'invalid_token'
        ? emailConfirmLink.errorInvalidToken
        : emailConfirmLink.errorSetupAlert

    return renderErrorView(
      request,
      h,
      languageContent,
      emailConfirmLink,
      common,
      lang,
      errorMessage
    )
  }
}
