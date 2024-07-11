import { english } from '~/src/server/data/en/en.js'
const cookiesController = {
  handler: (request, h) => {
    const {
      footer: { cookies },
      cookieBanner,
      phaseBanner,
      multipleLocations
    } = english
    const { path } = request
    let lang = path?.slice(-2)
    if (lang === 'cy') {
      lang = 'cy'
    } else {
      lang = 'en'
    }
    return h.view('cookies/index', {
      pageTitle: cookies.pageTitle,
      title: cookies.title,
      heading: cookies.heading,
      headings: cookies.headings,
      paragraphs: cookies.paragraphs,
      displayBacklink: false,
      phaseBanner,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      page: 'cookies',
      lang: request.query.lang
    })
  }
}

export { cookiesController }
