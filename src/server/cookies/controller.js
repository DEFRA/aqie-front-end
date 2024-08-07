import { english } from '~/src/server/data/en/en.js'
const cookiesController = {
  handler: (request, h) => {
    const {
      footer: { cookies },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations
    } = english
    const { query } = request
    const lang = 'en'
    if (query?.lang && query?.lang === 'cy') {
      return h.redirect('/briwsion/cy')
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
      lang: lang ?? lang
    })
  }
}

export { cookiesController }
