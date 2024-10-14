/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'

const sulphurDioxideController = {
  handler: (request, h) => {
    const { sulphurDioxide } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query } = request
    const lang = 'en'
    if (query?.lang && query?.lang === 'cy') {
      return h.redirect(`/llygryddion/sylffwr-deuocsid/cy?lang=cy`)
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
      lang: query.lang ?? lang
    })
  }
}

export { sulphurDioxideController }
