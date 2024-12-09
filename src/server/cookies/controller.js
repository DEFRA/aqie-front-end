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
  const { query, path } = request

  // Redirect to the Welsh version if the language is 'cy'
  if (query?.lang === 'cy') {
    return h.redirect(`/briwsion/cy?lang=${query?.lang}`)
  }

  // Determine the language
  let lang = query?.lang?.slice(0, 2)
  if (lang !== 'cy' && lang !== 'en' && path === '/cookies') {
    lang = 'en'
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
