// Controller for Email send new link page ''
import { config } from '../../../../config/index.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { validateEmail } from '../../../common/helpers/validate-email.js'
import { generateEmailLink } from '../../../common/services/notify.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'

// Create a logger instance ''
const logger = createLogger()

const DEFAULT_SERVICE_NAME = 'Check air quality'
const VIEW_PATH = 'notify/register/email-send-new-link/index'
const EMAIL_DETAILS_PATH_KEY = 'notify.emailDetailsPath'

function getSessionContext(request) {
  return {
    emailAddress: request.yar.get('emailAddress') || '',
    location:
      request.yar.get('emailSignupLocation') ||
      request.yar.get('location') ||
      '',
    lat: request.yar.get('emailSignupLat') ?? request.yar.get('latitude'),
    long: request.yar.get('emailSignupLong') ?? request.yar.get('longitude')
  }
}

function getPageContent(request, content = english) {
  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  const emailSendNewLink =
    languageContent.emailSendNewLink || english.emailSendNewLink
  const common = languageContent.common || english.common
  const { footerTxt, phaseBanner, backlink, cookieBanner } = languageContent
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME
  return {
    lang,
    emailSendNewLink,
    common,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    serviceName
  }
}

function buildViewModel(request, pageContent, emailAddress, extras = {}) {
  const {
    lang,
    emailSendNewLink,
    common,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    serviceName
  } = pageContent
  const metaSiteUrl = getAirQualitySiteUrl(request)
  const bulletSameEmail =
    emailSendNewLink.bulletSameEmail?.replace('{emailAddress}', emailAddress) ??
    ''

  return {
    pageTitle: `${emailSendNewLink.pageTitle} - ${serviceName} - GOV.UK`,
    heading: emailSendNewLink.heading,
    page: emailSendNewLink.heading,
    serviceName,
    lang,
    metaSiteUrl,
    currentPath: request.path,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    common,
    content: emailSendNewLink,
    bulletSameEmail,
    displayBacklink: true,
    customBackLink: true,
    backLinkText: common?.backLinkText || 'Back',
    backLinkUrl: config.get('notify.emailVerifyEmailPath'),
    ...extras
  }
}

/**
 * Handle GET request for Email send new link page ''
 * @param request - Hapi request object
 * @param h - Hapi response toolkit
 * @param content - Content object (optional, defaults to english)
 * @returns - View response with data
 */
export const handleEmailSendNewLinkRequest = (
  request,
  h,
  content = english
) => {
  logger.info('Displaying email send new link page')

  const { emailAddress } = getSessionContext(request)

  if (!emailAddress) {
    return h.redirect(config.get(EMAIL_DETAILS_PATH_KEY))
  }

  const pageContent = getPageContent(request, content)
  const viewModel = buildViewModel(request, pageContent, emailAddress)

  return h.view(VIEW_PATH, viewModel)
}

/**
 * Handle POST request for Email send new link page ''
 * @param request - Hapi request object
 * @param h - Hapi response toolkit
 * @param content - Content object (optional, defaults to english)
 * @returns - Redirect or view response
 */
export const handleEmailSendNewLinkPost = async (
  request,
  h,
  content = english
) => {
  logger.info('Processing email send new link request')

  const { emailNew } = request.payload
  const sessionContext = getSessionContext(request)
  const pageContent = getPageContent(request, content)
  const { emailSendNewLink, serviceName } = pageContent

  let emailToUse = sessionContext.emailAddress

  // If a new email address was submitted, validate it ''
  if (emailNew?.trim()) {
    const { isValid, formatted, error } = validateEmail(emailNew.trim())

    if (!isValid) {
      const viewModel = buildViewModel(
        request,
        pageContent,
        sessionContext.emailAddress,
        {
          pageTitle: `Error: ${emailSendNewLink.pageTitle} - ${serviceName} - GOV.UK`,
          error: {
            message: error || emailSendNewLink.errors?.format,
            field: 'emailNew'
          },
          formData: request.payload
        }
      )
      return h.view(VIEW_PATH, viewModel)
    }

    emailToUse = formatted
    request.yar.set('emailAddress', emailToUse)
  }

  if (!emailToUse) {
    return h.redirect(config.get(EMAIL_DETAILS_PATH_KEY))
  }

  try {
    await generateEmailLink(
      emailToUse,
      sessionContext.location,
      sessionContext.lat,
      sessionContext.long,
      request
    )
    logger.info('Queued Notify email link for delivery (resend)')
  } catch (err) {
    logger.error('Notify email resend failed', err)
  }

  return h.redirect(config.get('notify.emailVerifyEmailPath'))
}
