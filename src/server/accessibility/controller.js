import { english } from '~/src/server/data/en/en.js'

const accessibilityController = {
  handler: (request, h) => {
    /* eslint-disable camelcase */
    const {
      footer: {
        accessibility: { paragraphs, pageTitle, title, headings, heading }
      },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations: { serviceName }
    } = english
    const {
      query: { lang, utm_source, userId }
    } = request
    if (lang && lang === 'cy') {
      return h.redirect(
        `/hygyrchedd/cy?lang=${lang}&userId=${userId}&utm_source=${utm_source}`
      )
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
      lang
    })
  }
}

export { accessibilityController }
