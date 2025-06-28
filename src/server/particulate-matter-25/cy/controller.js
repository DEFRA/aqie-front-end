import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const particulateMatter25Controller = {
  handler: (request, h) => {
    const { particulateMatter25 } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query, path } = request
    const metaSiteUrl = getAirQualitySiteUrl(request)

    if (query?.lang && query?.lang === LANG_EN) {
      return h.redirect(`/pollutants/particulate-matter-25?lang=en`)
    }
    let lang = query?.lang?.slice(0, 2)
    if (
      lang !== LANG_CY &&
      lang !== 'en' &&
      path === '/llygryddion/mater-gronynnol-25/cy'
    ) {
      lang = LANG_CY
    }
    return h.view('particulate-matter-25/index', {
      pageTitle: particulateMatter25.pageTitle,
      description: particulateMatter25.description,
      metaSiteUrl,
      particulateMatter25,
      page: 'particulate matter 25',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang
    })
  }
}

export { particulateMatter25Controller }
