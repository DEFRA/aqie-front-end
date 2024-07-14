/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'

const nitrogenDioxideController = {
  handler: (request, h) => {
    const { nitrogenDioxide } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query, path } = request
    let lang = path?.split('/').pop().slice(0, 2)
    if (lang === 'cy') {
      lang = 'cy'
    } else {
      lang = 'en'
    }
    lang = query.lang ?? lang
    if (query?.lang && query?.lang === 'en') {
      return h.redirect('/pollutants/nitrogen-dioxide')
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
      lang: request.query.lang ?? lang
    })
  }
}

export { nitrogenDioxideController }
