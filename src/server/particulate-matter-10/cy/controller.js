/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'

const particulateMatter10Controller = {
  handler: (request, h) => {
    const { particulateMatter10 } = welsh.pollutants
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
      return h.redirect('/pollutants/particulate-matter-10')
    }
    return h.view('particulate-matter-10/index', {
      pageTitle: particulateMatter10.pageTitle,
      particulateMatter10,
      page: 'particulate matter 10',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: request.query.lang ?? lang
    })
  }
}

export { particulateMatter10Controller }
