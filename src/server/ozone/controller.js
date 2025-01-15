/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'

const ozoneController = {
  handler: (request, h) => {
    const { ozone } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query } = request
    const lang = LANG_EN
    if (query?.lang && query?.lang === LANG_CY) {
      return h.redirect(`/llygryddion/oson/cy?lang=cy`)
    }
    return h.view('ozone/index', {
      pageTitle: ozone.pageTitle,
      ozone,
      page: 'ozone',
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
