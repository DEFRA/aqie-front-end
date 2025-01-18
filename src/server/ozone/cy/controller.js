/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'

const ozoneController = {
  handler: (request, h) => {
    const { ozone } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query, path } = request
    if (query?.lang && query?.lang === 'en') {
      return h.redirect(`/pollutants/ozone?lang=en`)
    }
    let lang = query?.lang?.slice(0, 2)
    if (lang !== 'cy' && lang !== 'en' && path === '/chwilio-lleoliad/cy') {
      lang = 'cy'
    }

    return h.view('ozone/index', {
      pageTitle: ozone.pageTitle,
      description: ozone.description,
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
