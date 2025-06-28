import { welsh } from '../../data/cy/cy.js'
import { LANG_EN, LANG_CY } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

// Define the handler function
const accessibilityHandler = (request, h, content = welsh) => {
  // Destructure necessary data from the imported 'content' object
  const {
    footer: {
      accessibility: {
        pageTitle,
        title,
        heading,
        headings,
        paragraphs,
        description
      }
    },
    cookieBanner,
    phaseBanner,
    footerTxt,
    multipleLocations: { serviceName }
  } = content

  // Extract query parameters and path from the request
  const { query, path } = request
  const lang = query?.lang?.slice(0, 2)
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // Redirect to English version if language is 'en'
  if (lang === LANG_EN) {
    return h.redirect('/accessibility?lang=en')
  }

  // Default to Welsh if language is not LANG_CY or 'en' and path is '/hygyrchedd/cy'
  const effectiveLang =
    lang !== LANG_CY && lang !== LANG_EN && path === '/hygyrchedd/cy'
      ? LANG_CY
      : lang

  // Render the accessibility page with the necessary data
  return h.view('accessibility/index', {
    pageTitle,
    description,
    metaSiteUrl,
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
