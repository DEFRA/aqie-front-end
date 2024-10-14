import { english } from '~/src/server/data/en/en.js'

const homeController = {
  handler: (request, h) => {
    const { query } = request
    const { home, footerTxt, phaseBanner, backlink, cookieBanner } = english
    if (query.lang === 'cy') {
      return h.redirect(`cy`)
    }
    return h.view('home/index', {
      pageTitle: home.pageTitle,
      heading: home.heading,
      page: home.page,
      paragraphs: home.paragraphs,
      label: home.button,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      serviceName: '',
      lang: 'en'
    })
  }
}

export { homeController }
