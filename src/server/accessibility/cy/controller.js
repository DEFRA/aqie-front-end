import { welsh } from '~/src/server/data/cy/cy.js'
import { LANG_EN, LANG_CY } from '~/src/server/data/constants'

// Define the handler function
const accessibilityHandler = (request, h, content = welsh) => {
  // Destructure necessary data from the imported 'content' object
  const {
    footer: {
      accessibility: { pageTitle, title, heading, headings, paragraphs }
    },
    cookieBanner,
    phaseBanner,
    footerTxt,
    multipleLocations: { serviceName }
  } = content

  // Extract query parameters and path from the request
  const { query, path } = request
  const lang = query?.lang?.slice(0, 2)

  // Redirect to English version if language is 'en'
  if (lang === LANG_EN) {
    return h.redirect('/accessibility?lang=en')
  }

  // Default to Welsh if language is not LANG_CY or 'en' and path is '/preifatrwydd/cy'
  const effectiveLang =
    lang !== LANG_CY && lang !== LANG_EN && path === '/preifatrwydd/cy'
      ? LANG_CY
      : lang

  // Render the accessibility page with the necessary data
  return h.view('accessibility/index', {
    pageTitle,
    title,
    heading,
    headings,
    paragraphs,
    displayBacklink: false,
    phaseBanner,
    footerTxt,
    serviceName,
    cookieBanner,
    lang: effectiveLang
  })
}

// Define the controller using the handler function
const accessibilityController = {
  handler: accessibilityHandler
}

export { accessibilityController, accessibilityHandler }
