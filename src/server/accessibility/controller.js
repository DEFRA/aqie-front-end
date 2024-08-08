import { english } from '~/src/server/data/en/en.js'

const accessibilityController = {
  handler: (request, h) => {
    /* eslint-disable camelcase */
    const {
      footer: {
        accessibility: {
          paragraphs,
          pageTitle,
          title,
          utm_source,
          userId,
          headings,
          heading
        }
      },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations: { serviceName }
    } = english
    const language = 'en'
    const {
      query: { lang }
    } = request
    if (lang && lang === 'cy') {
      return h.redirect('/hygyrchedd/cy')
    }
    return h.view('accessibility/index', {
      userId,
      utm_source,
      pageTitle,
      title,
      heading,
      headings,
      paragraphs,
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName,
      lang: lang ?? language
    })
  }
}

export { accessibilityController }
