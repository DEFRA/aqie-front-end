// Controller for SMS max alerts page ''
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { config } from '../../../../config/index.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'

// Constants ''
const DEFAULT_SERVICE_NAME = 'Check air quality'

// Create a logger instance ''
const logger = createLogger()

/**
 * Handle GET request for SMS max alerts page ''
 * Shown when the user has reached the 5-alert limit for their mobile number.
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @param {Object} content - Content object (optional, defaults to english)
 * @returns {Object} - View response with data
 */
const handleSmsMaxAlertsRequest = (request, h, content = english) => {
  logger.info('Displaying SMS max alerts page')

  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  const { footerTxt, phaseBanner, cookieBanner } = languageContent
  const common = languageContent.common || english.common
  const smsMaxAlerts = languageContent.smsMaxAlerts || english.smsMaxAlerts
  const metaSiteUrl = getAirQualitySiteUrl(request)
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME

  const smsMobileNumberPath = config.get('notify.smsMobileNumberPath')

  const viewModel = {
    pageTitle: `${smsMaxAlerts.pageTitle} - ${serviceName} - GOV.UK`,
    heading: smsMaxAlerts.heading,
    page: smsMaxAlerts.heading,
    serviceName,
    lang,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    cookieBanner,
    displayBacklink: false,
    common,
    content: smsMaxAlerts,
    smsMobileNumberPath
  }

  return h.view('notify/register/sms-max-emails/index', viewModel)
}

export { handleSmsMaxAlertsRequest }
