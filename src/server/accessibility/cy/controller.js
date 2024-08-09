import { welsh } from '~/src/server/data/cy/cy.js'

const accessibilityController = {
  handler: (request, h) => {
    const {
      footer: {
        accessibility: { pageTitle, title, heading, headings, paragraphs }
      },
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations: { serviceName }
    } = welsh
    /* eslint-disable camelcase */
    const {
      query: { lang, userId, utm_source }
    } = request
    if (lang && lang === 'en') {
      return h.redirect(
        `/accessibility?lang=en&userId=${userId}&utm_source=${utm_source}`
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
