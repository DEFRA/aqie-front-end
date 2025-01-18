/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'

const ozoneController = {
  handler: (request, h) => {
    const { ozone } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query } = request
    const lang = 'en'
    if (query?.lang && query?.lang === 'cy') {
      return h.redirect(`/llygryddion/oson/cy?lang=cy`)
    }
    return h.view('ozone/index', {
      pageTitle: ozone.pageTitle,
      description: ozone.description,
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
