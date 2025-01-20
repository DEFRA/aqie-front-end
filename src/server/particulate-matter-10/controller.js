/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'

const particulateMatter10Controller = {
  handler: (request, h) => {
    const { particulateMatter10 } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query } = request
    const lang = LANG_EN
    if (query?.lang && query?.lang === LANG_CY) {
      return h.redirect(`/llygryddion/mater-gronynnol-10/cy?lang=cy`)
    }
    return h.view('particulate-matter-10/index', {
      pageTitle: particulateMatter10.pageTitle,
      description: particulateMatter10.description,
      particulateMatter10,
      page: 'particulate matter 10',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: query.lang ?? lang
    })
  }
}

export { particulateMatter10Controller }
