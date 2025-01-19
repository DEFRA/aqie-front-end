import { english } from '~/src/server/data/en/en.js'
import { LANG_CY } from '~/src/server/data/constants'

// Define the handler function
const accessibilityHandler = (request, h, content = english) => {
  // Destructure necessary data from the imported 'content' object
  const {
    footer: {
      accessibility: {
        paragraphs,
        pageTitle,
        title,
        headings,
        heading,
        description
      }
    },
    cookieBanner,
    phaseBanner,
    footerTxt,
    multipleLocations: { serviceName }
  } = content

  // Extract the language query parameter from the request
  const { lang } = request.query

  // Redirect to the Welsh version if the language is 'LANG_CY'
  if (lang === LANG_CY) {
    return h.redirect(`/hygyrchedd/cy?lang=${lang}`)
  }

  // Render the accessibility page with the necessary data
  return h.view('accessibility/index', {
    pageTitle,
    description,
    title,
    heading,
    headings,
    paragraphs,
    displayBacklink: false,
    phaseBanner,
    footerTxt,
    serviceName,
    cookieBanner
  })
}

// Define the controller using the handler function
const accessibilityController = {
  handler: accessibilityHandler
}

export { accessibilityController, accessibilityHandler }
