import { welsh } from '~/src/server/data/cy/cy.js'

const checkLocalAirController = {
  handler: (request, h) => {
    const { query } = request
    const {
      checkLocalAirQuality,
      footerTxt,
      phaseBanner,
      displayBacklink,
      cookieBanner
    } = welsh
    if (query.lang === 'en') {
      return h.redirect('/check-local-air-quality')
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
      lang: 'cy'
    })
  }
}

export { checkLocalAirController }
