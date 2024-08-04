/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'

const particulateMatter10Controller = {
  handler: (request, h) => {
    const { particulateMatter10 } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query } = request
    const lang = 'cy'
    if (query?.lang && query?.lang === 'en') {
      return h.redirect('/pollutants/particulate-matter-10')
    }
    return h.view('particulate-matter-10/index', {
      userId: query?.userId,
      utm_source: query?.utm_source,
      pageTitle: particulateMatter10.pageTitle,
      particulateMatter10,
      page: 'particulate matter 10',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: query.lang ?? lang
    })
  }
}

export { particulateMatter10Controller }
