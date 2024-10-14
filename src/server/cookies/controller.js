import { english } from '~/src/server/data/en/en.js'
const cookiesController = {
  handler: (request, h) => {
    const {
      footer: {
        cookies: {
          pageTitle,
          title,
          headings,
          heading,
          table1,
          table2,
          paragraphs
        }
      },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations: { serviceName }
    } = english
    /* eslint-disable camelcase */
    const {
      query: { lang }
    } = request
    if (lang && lang === 'cy') {
      return h.redirect(`/briwsion/cy?lang=cy`)
    }
    return h.view('cookies/index', {
      pageTitle,
      title,
      heading,
      headings,
      table1,
      table2,
      paragraphs,
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName,
      page: 'cookies',
      lang
    })
  }
}

export { cookiesController }
