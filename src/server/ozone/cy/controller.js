/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'

const ozoneController = {
  handler: (request, h) => {
    const { ozone } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query, path } = request
    const metaSiteUrl = getAirQualitySiteUrl(request)

    if (query?.lang && query?.lang === LANG_EN) {
      return h.redirect(`/pollutants/ozone?lang=en`)
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
