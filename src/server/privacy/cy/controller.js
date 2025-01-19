/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'
const privacyController = {
  handler: (request, h) => {
    const {
      footer: {
        privacy: {
          pageTitle,
          title,
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
    } = welsh
    /* eslint-disable camelcase */
    const { query, path } = request
    if (query?.lang && query?.lang === LANG_EN) {
      return h.redirect(`/privacy?lang=en`)
    }
    let lang = query?.lang?.slice(0, 2)
    if (lang !== LANG_CY && lang !== LANG_EN && path === '/preifatrwydd/cy') {
      lang = LANG_CY
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
