/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'

const particulateMatter25Controller = {
  handler: (request, h) => {
    const { particulateMatter25 } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query } = request
    const lang = 'en'
    if (query?.lang && query?.lang === 'cy') {
      return h.redirect(`/llygryddion/mater-gronynnol-25/cy?lang=cy`)
    }
    return h.view('particulate-matter-25/index', {
      pageTitle: particulateMatter25.pageTitle,
      description: particulateMatter25.description,
      particulateMatter25,
      page: 'particulate matter 25',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: query.lang ?? lang
    })
  }
}

export { particulateMatter25Controller }
