/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'

const particulateMatter10Controller = {
  handler: (request, h) => {
    const { particulateMatter10 } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query, path } = request
    const metaSiteUrl = getAirQualitySiteUrl(request)

    if (query?.lang && query?.lang === 'en') {
      return h.redirect(`/pollutants/particulate-matter-10?lang=en`)
    }
    let lang = query?.lang?.slice(0, 2)
    if (
      lang !== LANG_CY &&
      lang !== LANG_EN &&
      path === '/llygryddion/mater-gronynnol-10/cy'
    ) {
      lang = LANG_CY
    }
    return h.view('particulate-matter-10/index', {
      pageTitle: particulateMatter10.pageTitle,
      description: particulateMatter10.description,
      metaSiteUrl,
      particulateMatter10,
      page: 'particulate matter 10',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang
    })
  }
}

export { particulateMatter10Controller }
