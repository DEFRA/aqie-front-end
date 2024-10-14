/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'

const nitrogenDioxideController = {
  handler: (request, h) => {
    const { nitrogenDioxide } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query } = request
    const lang = 'cy'
    if (query?.lang && query?.lang === 'en') {
      return h.redirect(`/pollutants/nitrogen-dioxide?lang=en`)
    }
    return h.view('nitrogen-dioxide/index', {
      pageTitle: nitrogenDioxide.pageTitle,
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
