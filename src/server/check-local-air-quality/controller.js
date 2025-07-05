import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

const handleHomeRequest = (request, h, content = english) => {
  const { query } = request
  const { home, footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  if (query.lang === LANG_CY) {
    return h.redirect(LANG_CY).code(REDIRECT_STATUS_CODE)
  }

  return h.view('home/index', {
    pageTitle: home.pageTitle,
    description: home.description,
    metaSiteUrl,
    heading: home.heading,
    page: home.page,
    paragraphs: home.paragraphs,
    label: home.button,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    serviceName: '',
    lang: LANG_EN
  })
}

const homeController = {
  handler: handleHomeRequest
}

export { homeController, handleHomeRequest }
