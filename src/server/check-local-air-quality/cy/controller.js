import { welsh } from '~/src/server/data/cy/cy.js'

const checkLocalAirController = {
  handler: (request, h) => {
    const { query } = request
    const {
      checkLocalAirQuality,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner
    } = welsh
    //
    if (query.lang === 'en') {
      return h.redirect(`/?lang=en`)
    }
    return h.view('check-local-air-quality/index', {
      userId: query?.userId,
      utm_source: query?.utm_source,
      pageTitle: checkLocalAirQuality.pageTitle,
      heading: checkLocalAirQuality.heading,
      page: checkLocalAirQuality.page,
      paragraphs: checkLocalAirQuality.paragraphs,
      label: checkLocalAirQuality.button,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      serviceName: '',
      lang: 'cy'
    })
  }
}

export { checkLocalAirController }
