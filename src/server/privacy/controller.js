/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'
const privacyController = {
  handler: (request, h) => {
    const {
      footer: { privacy },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations
    } = english
    const { query } = request
    const lang = 'en'
    if (query?.lang && query?.lang === 'cy') {
      return h.redirect('/preifatrwydd/cy')
    }
    return h.view('privacy/index', {
      userId: query?.userId,
      utm_source: query?.utm_source,
      pageTitle: privacy.pageTitle,
      title: privacy.title,
      heading: privacy.heading,
      headings: privacy.headings,
      paragraphs: privacy.paragraphs,
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      page: 'privacy',
      lang: query?.lang ?? lang
    })
  }
}

export { privacyController }
