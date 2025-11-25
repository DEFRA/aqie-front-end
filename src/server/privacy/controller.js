import { english } from '../data/en/en.js'
import { LANG_CY, REDIRECT_STATUS_CODE } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

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
    const {
      query: { lang }
    } = request
    const metaSiteUrl = getAirQualitySiteUrl(request)

    if (lang && lang === LANG_CY) {
      return h.redirect(`/preifatrwydd/cy?lang=cy`).code(REDIRECT_STATUS_CODE)
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
      currentPath: '/privacy',
      lang: lang || 'en'
    })
  }
}

export { privacyController }
