/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'
const privacyController = {
  handler: (request, h) => {
    const {
      footer: {
        privacy: { pageTitle, title, heading, headings, paragraphs }
      },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations: { serviceName }
    } = welsh
    /* eslint-disable camelcase */
    const {
      query: { lang, userId, utm_source }
    } = request
    const language = 'cy'
    if (lang && lang === 'en') {
      return h.redirect('/privacy')
    }
    return h.view('privacy/index', {
      userId,
      utm_source,
      pageTitle,
      title,
      heading,
      headings,
      paragraphs,
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName,
      page: 'privacy',
      lang: lang ?? language
    })
  }
}

export { privacyController }
