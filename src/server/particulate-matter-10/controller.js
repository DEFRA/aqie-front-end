/* eslint-disable prettier/prettier */
import { english } from '~/src/server/data/en/en.js'

const particulateMatter10Controller = {
  handler: (request, h) => {
    const { particulateMatter10 } = english.pollutants
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
      return h.redirect('/llygryddion/mater-gronynnol-10/cy')
    }
    return h.view('particulate-matter-10/index', {
      userId: query?.userId,
      utm_source: query?.utm_source,
      pageTitle: particulateMatter10.pageTitle,
      particulateMatter10,
      page: 'particulate matter 10',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: request.query.lang ?? lang
    })
  }
}

export { particulateMatter10Controller }
