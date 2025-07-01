import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const REDIRECT_STATUS_CODE = 301 // Define a constant for redirect status code

const nitrogenDioxideController = {
  handler: (request, h) => {
    const { nitrogenDioxide } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query, path } = request
    const metaSiteUrl = getAirQualitySiteUrl(request)

    if (query?.lang && query?.lang === LANG_EN) {
      h.redirect(`/pollutants/nitrogen-dioxide?lang=en`).code(
        REDIRECT_STATUS_CODE
      )
      return 'redirected' // Explicitly return 'redirected' after redirect
    }
    let lang = query?.lang?.slice(0, 2)
    if (
      lang !== LANG_CY &&
      lang !== LANG_EN &&
      path === '/llygryddion/nitrogen-deuocsid/cy'
    ) {
      lang = LANG_CY
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
      lang
    })
  }
}

export { nitrogenDioxideController }
