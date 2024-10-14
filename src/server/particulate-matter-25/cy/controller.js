/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'

const particulateMatter25Controller = {
  handler: (request, h) => {
    const { particulateMatter25 } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query } = request
    const lang = 'cy'
    if (query?.lang && query?.lang === 'en') {
      return h.redirect(`/pollutants/particulate-matter-25?lang=en`)
    }
    return h.view('particulate-matter-25/index', {
      pageTitle: particulateMatter25.pageTitle,
      particulateMatter25,
      page: 'particulate matter 25',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: query.lang ?? lang
    })
  }
}

export { particulateMatter25Controller }
