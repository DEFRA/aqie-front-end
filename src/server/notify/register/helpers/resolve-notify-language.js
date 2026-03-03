// Helper for resolving notify journey language ''
import { LANG_EN, LANG_CY } from '../../../data/constants.js'

const resolveNotifyLanguage = (request, defaultLang = LANG_EN) => {
  const lang = request.query?.lang || request.payload?.lang
  if (lang === LANG_CY || lang === LANG_EN) {
    return lang
  }

  const referer = request.headers?.referer || ''
  if (referer.includes('/cy')) {
    return LANG_CY
  }

  return defaultLang
}

export { resolveNotifyLanguage }
