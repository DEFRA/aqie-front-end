/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'

const sulphurDioxideController = {
  handler: (request, h) => {
    const { sulphurDioxide } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query, path } = request
    if (query?.lang && query?.lang === 'en') {
      return h.redirect(`/pollutants/sulphur-dioxide?lang=en`)
    }
    let lang = query?.lang?.slice(0, 2)
    if (
      lang !== 'cy' &&
      lang !== 'en' &&
      path === '/llygryddion/sylffwr-deuocsid/cy'
    ) {
      lang = 'cy'
    }
    return h.view('sulphur-dioxide/index', {
      pageTitle: sulphurDioxide.pageTitle,
      sulphurDioxide,
      page: 'Sulphur dioxide (SO₂)',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang
    })
  }
}

export { sulphurDioxideController }
