/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'

const ozoneController = {
  handler: (request, h) => {
    const { ozone } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query, path } = request
    let lang = path?.slice(-2)
    if (lang === 'cy') {
      lang = 'cy'
    } else {
      lang = 'en'
    }
    lang = query.lang ?? lang
    if (query?.lang && query?.lang === 'cy') {
      return h.redirect('/llygryddion/oson/cy')
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
      lang: request.query.lang ?? lang
    })
  }
}

export { ozoneController }
