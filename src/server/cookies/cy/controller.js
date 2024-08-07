import { welsh } from '~/src/server/data/cy/cy.js'
const cookiesController = {
  handler: (request, h) => {
    const {
      footer: { cookies },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations
    } = welsh
    const lang = 'cy'
    const { query } = request
    if (query?.lang && query?.lang === 'en') {
      return h.redirect('/cookies')
    }
    return h.view('cookies/index', {
      userId: query?.userId,
      utm_source: query?.utm_source,
      pageTitle: cookies.pageTitle,
      title: cookies.title,
      heading: cookies.heading,
      headings: cookies.headings,
      table1: cookies.table1,
      table2: cookies.table2,
      paragraphs: cookies.paragraphs,
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      page: 'cookies',
      lang: query?.lang ?? lang
    })
  }
}

export { cookiesController }
