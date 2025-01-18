import { welsh } from '~/src/server/data/cy/cy.js'

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

  // Redirect to the English version if the language is 'en'
  if (query?.lang === 'en') {
    return h.redirect(`/cookies?lang=en`)
  }

  // Determine the language
  let lang = query?.lang?.slice(0, 2)
  if (lang !== 'cy' && lang !== 'en' && path === '/preifatrwydd/cy') {
    lang = 'cy'
  }

  // Render the cookies page with the necessary data
  return h.view('cookies/index', {
    pageTitle,
    description,
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
