/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'
import { LANG_CY, LANG_EN } from '../../data/constants'

const particulateMatter25Controller = {
  handler: (request, h) => {
    const { particulateMatter25 } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query, path } = request
    if (query?.lang && query?.lang === LANG_EN) {
      return h.redirect(`/pollutants/particulate-matter-25?lang=en`)
    }
    let lang = query?.lang?.slice(0, 2)
    if (lang !== LANG_CY && lang !== 'en' && path === '/chwilio-lleoliad/cy') {
      lang = LANG_CY
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
      lang
    })
  }
}

export { particulateMatter25Controller }
