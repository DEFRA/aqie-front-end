import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const sulphurDioxideController = {
  handler: (request, h) => {
    const { sulphurDioxide } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query, path } = request
    const metaSiteUrl = getAirQualitySiteUrl(request)

    if (query?.lang && query?.lang === LANG_EN) {
      return h.redirect(`/pollutants/sulphur-dioxide?lang=en`)
    }
    let lang = query?.lang?.slice(0, 2)
    if (
      lang !== LANG_CY &&
      lang !== LANG_EN &&
      path === '/llygryddion/sylffwr-deuocsid/cy'
    ) {
      lang = LANG_CY
    }
    return h.view('sulphur-dioxide/index', {
      pageTitle: sulphurDioxide.pageTitle,
      description: sulphurDioxide.description,
      metaSiteUrl,
      sulphurDioxide,
      page: 'Sulphur dioxide (SO₂)',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang
    })
  }
}

export { sulphurDioxideController }
