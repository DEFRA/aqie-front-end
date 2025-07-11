import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const REDIRECT_STATUS_CODE = 301 // Define a constant for redirect status code

const ozoneController = {
  handler: (request, h) => {
    const { ozone } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query, path } = request
    const metaSiteUrl = getAirQualitySiteUrl(request)

    if (query?.lang && query?.lang === LANG_EN) {
      return h.redirect(`/pollutants/ozone?lang=en`).code(REDIRECT_STATUS_CODE)
    }
    let lang = query?.lang?.slice(0, 2)
    if (
      lang !== LANG_CY &&
      lang !== LANG_EN &&
      path === '/llygryddion/oson/cy'
    ) {
      lang = LANG_CY
    }
    return h.view('ozone/index', {
      pageTitle: ozone.pageTitle,
      description: ozone.description,
      metaSiteUrl,
      ozone,
      page: 'ozone-cy',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang
    })
  }
}

export { ozoneController }
