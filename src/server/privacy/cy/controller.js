/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'
const privacyController = {
  handler: (request, h) => {
    const {
      footer: { privacy },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations
    } = welsh
    const { query } = request
    const lang = 'cy'
    if (query?.lang && query?.lang === 'en') {
      return h.redirect('/privacy')
    }
    return h.view('privacy/index', {
      userId: query?.userId,
      utm_source: query?.utm_source,
      pageTitle: privacy.pageTitle,
      title: privacy.title,
      heading: privacy.heading,
      headings: privacy.headings,
      paragraphs: privacy.paragraphs,
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      page: 'privacy',
      lang: request?.query?.lang ?? lang
    })
  }
}

export { privacyController }
