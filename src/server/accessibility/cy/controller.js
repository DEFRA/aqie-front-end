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
    const { query, path } = request
    if (query?.lang && query?.lang === 'en') {
      return h.redirect(`/accessibility?lang=en`)
    }
    let lang = query?.lang?.slice(0, 2)
    if (lang !== 'cy' && lang !== 'en' && path === '/preifatrwydd/cy') {
      lang = 'cy'
    }
    return h.view('accessibility/index', {
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
