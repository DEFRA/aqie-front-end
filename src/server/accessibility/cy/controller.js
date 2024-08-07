import { welsh } from '~/src/server/data/cy/cy.js'

const accessibilityController = {
  handler: (request, h) => {
    const {
      footer: { accessibility },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations
    } = welsh
    const { query } = request
    const lang = 'cy'
    if (query?.lang && query?.lang === 'en') {
      return h.redirect('/accessibility')
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
      lang: query?.lang ?? lang
    })
  }
}

export { accessibilityController }
