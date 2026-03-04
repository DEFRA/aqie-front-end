// Helper for resolving notify journey language ''
import { LANG_EN, LANG_CY } from '../../../data/constants.js'

// '' Welsh path prefix for notify journey pages
const NOTIFY_WELSH_PATH_PREFIX = '/hysbysiad/cofrestru/'

const resolveNotifyLanguage = (request, defaultLang = LANG_EN) => {
  const lang = request.query?.lang || request.payload?.lang
  if (lang === LANG_CY || lang === LANG_EN) {
    return lang
  }

  // '' Detect Welsh path prefix (e.g. /hysbysiad/cofrestru/sms-rhif-ffon)
  if (request.path?.startsWith(NOTIFY_WELSH_PATH_PREFIX)) {
    return LANG_CY
  }

  const referer = request.headers?.referer || ''
  if (referer.includes('/cy')) {
    return LANG_CY
  }

  return defaultLang
}

export { resolveNotifyLanguage }
