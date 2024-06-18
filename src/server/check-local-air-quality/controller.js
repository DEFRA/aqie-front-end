import { english } from '~/src/server/data/en/en.js'

const checkLocalAirController = {
  handler: (request, h) => {
    const { query } = request
    const {
      checkLocalAirQuality,
      footerTxt,
      phaseBanner,
      displayBacklink,
      cookieBanner
    } = english
    if (query.lang === 'cy') {
      return h.redirect('/check-local-air-quality/cy')
    }
    return h.view('check-local-air-quality/index', {
      pageTitle: checkLocalAirQuality.pageTitle,
      heading: checkLocalAirQuality.heading,
      page: checkLocalAirQuality.page,
      paragraphs: checkLocalAirQuality.paragraphs,
      label: checkLocalAirQuality.button,
      footerTxt,
      phaseBanner,
      displayBacklink,
      cookieBanner,
      serviceName: '',
      lang: 'en'
    })
  }
}

export { checkLocalAirController }
