/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'
import { LANG_CY } from '../data/constants'
const privacyController = {
  handler: (request, h) => {
    const {
      footer: {
        privacy: { title, pageTitle, heading, headings, paragraphs }
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
    if (lang && lang === LANG_CY) {
      return h.redirect(`/preifatrwydd/cy?lang=cy`)
    }
    return h.view('privacy/index', {
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
