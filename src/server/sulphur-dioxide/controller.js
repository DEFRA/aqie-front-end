/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'

const sulphurDioxideController = {
  handler: (request, h) => {
    const { sulphurDioxide } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query, path } = request
    let lang = path?.split('/').pop().slice(0, 2)
    if (lang === 'cy') {
      lang = 'cy'
    } else {
      lang = 'en'
    }
    lang = query.lang ?? lang
    if (query?.lang && query?.lang === 'cy') {
      return h.redirect('/llygryddion/sylffwr-deuocsid/cy')
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
      lang: request.query.lang ?? lang
    })
  }
}

export { sulphurDioxideController }
