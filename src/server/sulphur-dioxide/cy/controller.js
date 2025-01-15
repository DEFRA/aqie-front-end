/* eslint-disable prettier/prettier */
import { welsh } from '~/src/server/data/cy/cy.js'
import { LANG_CY, LANG_EN } from '../../data/constants'

const sulphurDioxideController = {
  handler: (request, h) => {
    const { sulphurDioxide } = welsh.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = welsh
    const { query, path } = request
    if (query?.lang && query?.lang === LANG_EN) {
      return h.redirect(`/pollutants/sulphur-dioxide?lang=en`)
    }
    let lang = query?.lang?.slice(0, 2)
    if (
      lang !== LANG_CY &&
      lang !== LANG_EN &&
      path === '/llygryddion/sylffwr-deuocsid/cy'
    ) {
      lang = LANG_CY
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
