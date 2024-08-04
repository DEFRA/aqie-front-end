/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'

const sulphurDioxideController = {
  handler: (request, h) => {
    const { sulphurDioxide } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query } = request
    const lang = 'cy'
    if (query?.lang && query?.lang === 'en') {
      return h.redirect('/pollutants/sulphur-dioxide')
    }
    return h.view('sulphur-dioxide/index', {
      userId: query?.userId,
      utm_source: query?.utm_source,
      pageTitle: sulphurDioxide.pageTitle,
      sulphurDioxide,
      page: 'Sulphur dioxide (SO₂)',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: query.lang ?? lang
    })
  }
}

export { sulphurDioxideController }
