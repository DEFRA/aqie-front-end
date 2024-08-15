/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'

const ozoneController = {
  handler: (request, h) => {
    const { ozone } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query } = request
    const lang = 'cy'
    if (query?.lang && query?.lang === 'en') {
      return h.redirect(
        `/pollutants/ozone?lang=en&userId=${query.userId}&utm_source=${query.utm_source}`
      )
    }
    return h.view('ozone/index', {
      userId: query?.userId,
      utm_source: query?.utm_source,
      pageTitle: ozone.pageTitle,
      ozone,
      page: 'ozone-cy',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: query.lang ?? lang
    })
  }
}

export { ozoneController }
