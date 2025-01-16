import { welsh } from '~/src/server/data/cy/cy.js'
import { LANG_CY, LANG_EN } from '../../data/constants'

// Define the handler function
const cookiesHandler = (request, h, content = welsh) => {
  // Destructure necessary data from the imported 'content' object
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
  } = content

  // Extract query parameters and path from the request
  const { query, path } = request

  // Redirect to the English version if the language is LANG_EN
  if (query?.lang === LANG_EN) {
    return h.redirect(`/cookies?lang=en`)
  }

  // Determine the language
  let lang = query?.lang?.slice(0, 2)
  if (lang !== LANG_CY && lang !== LANG_EN && path === '/preifatrwydd/cy') {
    lang = LANG_CY
  }

  // Render the cookies page with the necessary data
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
    serviceName,
    cookieBanner,
    lang
  })
}

// Define the controller using the handler function
const cookiesController = {
  handler: cookiesHandler
}

export { cookiesController, cookiesHandler }
