import { english } from '../data/en/en.js'
import { LANG_CY } from '../data/constants.js'
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
      return h.redirect(`/preifatrwydd/cy?lang=cy`).code(301)
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
