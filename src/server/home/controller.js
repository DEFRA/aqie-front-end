import { english } from '~/src/server/data/en/en.js'
import { LANG_CY, LANG_EN } from '../data/constants'

const handleHomeRequest = (request, h, content = english) => {
  const { query } = request
  const { home, footerTxt, phaseBanner, backlink, cookieBanner } = content

  if (query.lang === LANG_CY) {
    return h.redirect(LANG_CY)
  }

  return h.view('home/index', {
    pageTitle: home.pageTitle,
    description: home.description,
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
