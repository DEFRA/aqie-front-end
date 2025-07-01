import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

const nitrogenDioxideController = {
  handler: (request, h) => {
    const { nitrogenDioxide } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query } = request
    const lang = LANG_EN
    const metaSiteUrl = getAirQualitySiteUrl(request)

    if (query?.lang && query?.lang === LANG_CY) {
      return h.redirect(`/llygryddion/nitrogen-deuocsid/cy?lang=cy`).code(301)
    }
    return h.view('nitrogen-dioxide/index', {
      pageTitle: nitrogenDioxide.pageTitle,
      description: nitrogenDioxide.description,
      metaSiteUrl,
      nitrogenDioxide,
      page: 'Nitrogen dioxide (NO₂)',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: query.lang ?? lang
    })
  }
}

export { nitrogenDioxideController }
