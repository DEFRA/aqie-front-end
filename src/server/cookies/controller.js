import { english } from '~/src/server/data/en/en.js'

// Define the handler function
const cookiesHandler = (request, h, content = english) => {
  // Destructure necessary data from the imported 'content' object
  const {
    footer: {
      cookies: {
        pageTitle,
        title,
        headings,
        heading,
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

  // Extract the language query parameter from the request
  const { lang } = request.query

  // Redirect to the Welsh version if the language is 'cy'
  if (lang === 'cy') {
    return h.redirect(`/briwsion/cy?lang=${lang}`)
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
    cookieBanner
  })
}

// Define the controller using the handler function
const cookiesController = {
  handler: cookiesHandler
}

export { cookiesController, cookiesHandler }
