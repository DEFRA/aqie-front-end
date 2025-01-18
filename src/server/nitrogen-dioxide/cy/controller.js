/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'

const nitrogenDioxideController = {
  handler: (request, h) => {
    const { nitrogenDioxide } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query, path } = request
    if (query?.lang && query?.lang === 'en') {
      return h.redirect(`/pollutants/nitrogen-dioxide?lang=en`)
    }
    let lang = query?.lang?.slice(0, 2)
    if (lang !== 'cy' && lang !== 'en' && path === '/llygryddion/oson/cy') {
      lang = 'cy'
    }
    return h.view('nitrogen-dioxide/index', {
      pageTitle: nitrogenDioxide.pageTitle,
      description: nitrogenDioxide.description,
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
