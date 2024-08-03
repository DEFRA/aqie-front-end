import { english } from '~/src/server/data/en/en.js'

const accessibilityController = {
  handler: (request, h) => {
    const {
      footer: { accessibility },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations
    } = english
    const { path, query } = request
    let lang = path?.split('/').pop().slice(0, 2)
    if (lang === 'cy' && path !== '/privacy') {
      lang = 'cy'
    } else {
      lang = 'en'
    }
    return h.view('accessibility/index', {
      userId: query?.userId,
      utm_source: query?.utm_source,
      pageTitle: accessibility.pageTitle,
      title: accessibility.title,
      heading: accessibility.heading,
      headings: accessibility.headings,
      paragraphs: accessibility.paragraphs,
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: request.query.lang
    })
  }
}

export { accessibilityController }
