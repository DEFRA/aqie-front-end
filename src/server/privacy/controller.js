/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'
import { LANG_CY } from '~/src/server/data/constants'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'

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
    const metaSiteUrl = getAirQualitySiteUrl(request)

    if (lang && lang === LANG_CY) {
      return h.redirect(`/preifatrwydd/cy?lang=cy`)
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
