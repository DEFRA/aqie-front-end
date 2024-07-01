/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'

const ozoneController = {
  handler: (request, h) => {
    const { ozone } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query, path } = request
    let lang = path?.slice(-2)
    if (lang === 'cy') {
      lang = 'cy'
    } else {
      lang = 'en'
    }
    lang = query.lang ?? lang
    if (query?.lang && query?.lang === 'en') {
      return h.redirect('/pollutants/ozone')
    }
    return h.view('ozone/index', {
      pageTitle: ozone.pageTitle,
      ozone,
      page: 'ozone-cy',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: request.query.lang ?? lang
    })
  }
}

export { ozoneController }
