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
    const { path, query } = request
    let lang = path?.split('/').pop().slice(0, 2)
    if (lang === 'cy') {
      lang = 'cy'
    } else {
      lang = 'en'
    }
    return h.view('cookies/index', {
      userId: query?.userId,
      utm_source: query?.utm_source,
      pageTitle: cookies.pageTitle,
      title: cookies.title,
      heading: cookies.heading,
      headings: cookies.headings,
      paragraphs: cookies.paragraphs,
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      page: 'cookies',
      lang: request.query.lang
    })
  }
}

export { cookiesController }
