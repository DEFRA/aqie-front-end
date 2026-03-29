// Controller for unsubscribe success page
// Shown after user confirms unsubscribe ("Yes, unsubscribe")
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { resolveNotifyLanguage } from '../../register/helpers/resolve-notify-language.js'

const logger = createLogger()
const VIEW_PATH = 'notify/unsubscribe/unsubscribe-success/index'
const DEFAULT_SERVICE_NAME = 'Check air quality'

export const handleUnsubscribeSuccessRequest = (request, h) => {
  logger.info('Unsubscribe success page requested')

  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : english
  const unsubscribeSuccess =
    languageContent.unsubscribeSuccess || english.unsubscribeSuccess
  const common = languageContent.common || english.common
  const { footerTxt, phaseBanner, cookieBanner } = languageContent
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME

  return h.view(VIEW_PATH, {
    pageTitle: `${unsubscribeSuccess.heading} - ${serviceName} - GOV.UK`,
    heading: unsubscribeSuccess.heading,
    serviceName,
    lang,
    metaSiteUrl: getAirQualitySiteUrl(request),
    currentPath: request.path,
    footerTxt,
    phaseBanner,
    cookieBanner,
    common,
    content: unsubscribeSuccess
  })
}
