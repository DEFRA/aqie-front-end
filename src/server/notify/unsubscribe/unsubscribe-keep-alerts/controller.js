// Controller for unsubscribe keep alerts page
// Shown after user declines unsubscribe ("No, keep email alerts")
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { resolveNotifyLanguage } from '../../register/helpers/resolve-notify-language.js'

const logger = createLogger()
const VIEW_PATH = 'notify/unsubscribe/unsubscribe-keep-alerts/index'
const DEFAULT_SERVICE_NAME = 'Check air quality'

export const handleUnsubscribeKeepAlertsRequest = (request, h) => {
  logger.info('Unsubscribe keep alerts page requested')

  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : english
  const unsubscribeKeepAlerts =
    languageContent.unsubscribeKeepAlerts || english.unsubscribeKeepAlerts
  const common = languageContent.common || english.common
  const { footerTxt, phaseBanner, cookieBanner } = languageContent
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME

  return h.view(VIEW_PATH, {
    pageTitle: `${unsubscribeKeepAlerts.heading} - ${serviceName} - GOV.UK`,
    heading: unsubscribeKeepAlerts.heading,
    serviceName,
    lang,
    metaSiteUrl: getAirQualitySiteUrl(request),
    currentPath: request.path,
    footerTxt,
    phaseBanner,
    cookieBanner,
    common,
    content: unsubscribeKeepAlerts
  })
}
