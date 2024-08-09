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
    const {
      query: { lang, userId, utm_source }
    } = request
    if (lang && lang === 'cy') {
      return h.redirect(
        `/preifatrwydd/cy?lang=cy&userId=${userId}&utm_source=${utm_source}`
      )
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
      lang
    })
  }
}

export { privacyController }
