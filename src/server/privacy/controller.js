/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'
const privacyController = {
  handler: (request, h) => {
    const {
      footer: {
        privacy: {
          title,
          pageTitle,
          heading,
          headings,
          paragraphs,
          description
        }
      },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations: { serviceName }
    } = english
    /* eslint-disable camelcase */
    const {
      query: { lang }
    } = request
    if (lang && lang === 'cy') {
      return h.redirect(`/preifatrwydd/cy?lang=cy`)
    }
    return h.view('privacy/index', {
      pageTitle,
      description,
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
