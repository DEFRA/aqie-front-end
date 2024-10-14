import { welsh } from '~/src/server/data/cy/cy.js'
const cookiesController = {
  handler: (request, h) => {
    const {
      footer: {
        cookies: {
          pageTitle,
          title,
          heading,
          headings,
          table1,
          table2,
          paragraphs
        }
      },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations: { serviceName }
    } = welsh
    /* eslint-disable camelcase */
    const {
      query: { lang }
    } = request
    if (lang && lang === 'en') {
      return h.redirect(`/cookies?lang=en`)
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
