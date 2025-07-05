import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const REDIRECT_STATUS_CODE = 301

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
    const { query, path } = request
    const metaSiteUrl = getAirQualitySiteUrl(request)

    if (query?.lang && query?.lang === LANG_EN) {
      return h.redirect(`/privacy?lang=en`).code(REDIRECT_STATUS_CODE)
    }
    let lang = query?.lang?.slice(0, 2)
    if (lang !== LANG_CY && lang !== LANG_EN && path === '/preifatrwydd/cy') {
      lang = LANG_CY
    }
    return h.view('privacy/index', {
      pageTitle,
      description,
      metaSiteUrl,
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
