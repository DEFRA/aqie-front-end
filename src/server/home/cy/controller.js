import { welsh } from '~/src/server/data/cy/cy.js'

const homeController = {
  handler: (request, h) => {
    const { query } = request
    const { home, footerTxt, phaseBanner, backlink, cookieBanner } = welsh
    //
    if (query.lang === 'en') {
      return h.redirect(`/?lang=en`)
    }
    return h.view('home/index', {
      userId: query?.userId,
      utm_source: query?.utm_source,
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
      lang: 'cy'
    })
  }
}

export { homeController }
