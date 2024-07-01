/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'

const particulateMatter25Controller = {
  handler: (request, h) => {
    const { particulateMatter25 } = welsh.pollutants
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
      return h.redirect('/pollutants/particulate-matter-25')
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
      lang: request.query.lang ?? lang
    })
  }
}

export { particulateMatter25Controller }
