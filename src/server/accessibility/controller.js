import { english } from '~/src/server/data/en/en.js'

const accessibilityController = {
  handler: (request, h) => {
    const {
      footer: { accessibility },
      cookieBanner,
      phaseBanner,
      multipleLocations
    } = english
    const { path } = request
    let lang = path?.slice(-2)
    if (lang === 'cy' && path !== '/privacy') {
      lang = 'cy'
    } else {
      lang = 'en'
    }
    return h.view('accessibility/index', {
      pageTitle: accessibility.pageTitle,
      title: accessibility.title,
      heading: accessibility.heading,
      headings: accessibility.headings,
      paragraphs: accessibility.paragraphs,
      displayBacklink: false,
      phaseBanner,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: request.query.lang
    })
  }
}

export { accessibilityController }
