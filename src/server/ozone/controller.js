import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

const ozoneController = {
  handler: (request, h) => {
    const { ozone } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query } = request
    const lang = LANG_EN
    const metaSiteUrl = getAirQualitySiteUrl(request)

    if (query?.lang && query?.lang === LANG_CY) {
      return h
        .redirect(`/llygryddion/oson/cy?lang=cy`)
        .code(REDIRECT_STATUS_CODE)
    }
    return h.view('ozone/index', {
      pageTitle: ozone.pageTitle,
      description: ozone.description,
      metaSiteUrl,
      ozone,
      page: 'ozone',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      currentPath: '/pollutants/ozone',
      lang: query.lang ?? lang
    })
  }
}

export { ozoneController }
