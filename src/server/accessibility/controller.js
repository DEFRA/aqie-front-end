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
    const lang = 'en'
    const { query } = request
    if (query?.lang && query?.lang === 'cy') {
      return h.redirect('/hygyrchedd/cy')
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
      lang: query.lang ?? lang
    })
  }
}

export { accessibilityController }
