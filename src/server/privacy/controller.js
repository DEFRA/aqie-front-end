/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'
const privacyController = {
  handler: (request, h) => {
    const {
      footer: { privacy },
      cookieBanner,
      phaseBanner,
      multipleLocations
    } = english
    const { path } = request
    let lang = path?.split('/').pop().slice(0, 2)
    if (lang === 'cy' && path !== '/privacy') {
      lang = 'cy'
    } else {
      lang = 'en'
    }
    return h.view('privacy/index', {
      pageTitle: privacy.pageTitle,
      title: privacy.title,
      heading: privacy.heading,
      headings: privacy.headings,
      paragraphs: privacy.paragraphs,
      displayBacklink: false,
      phaseBanner,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      page: 'privacy',
      lang: request.query.lang
    })
  }
}

export { privacyController }
