/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'

const nitrogenDioxideController = {
  handler: (request, h) => {
    const { nitrogenDioxide } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query } = request
    const lang = 'en'
    if (query?.lang && query?.lang === 'cy') {
      return h.redirect(
        `/llygryddion/nitrogen-deuocsid/cy?lang=cy&userId=${query.userId}&utm_source=${query.utm_source}`
      )
    }
    return h.view('nitrogen-dioxide/index', {
      userId: query?.userId,
      utm_source: query?.utm_source,
      pageTitle: nitrogenDioxide.pageTitle,
      nitrogenDioxide,
      page: 'Nitrogen dioxide (NO₂)',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: query.lang ?? lang
    })
  }
}

export { nitrogenDioxideController }
