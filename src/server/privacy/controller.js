/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'
const privacyController = {
  handler: (request, h) => {
    const {
      footer: {
        privacy: { title, pageTitle, heading, headings, paragraphs }
      },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations: serviceName
    } = english
    /* eslint-disable camelcase */
    const { query: lang, userId, utm_source } = request
    const language = 'en'
    if (lang && lang === 'cy') {
      return h.redirect('/preifatrwydd/cy')
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
