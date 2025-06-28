import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

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
        paragraphs,
        description
      }
    },
    cookieBanner,
    phaseBanner,
    footerTxt,
    multipleLocations: { serviceName }
  } = content

  // Extract the language query parameter from the request
  const { query, path } = request
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // Redirect to the Welsh version if the language is LANG_CY
  if (query?.lang === LANG_CY) {
    return h.redirect(`/briwsion/cy?lang=${query?.lang}`)
  }

  // Determine the language
  let lang = query?.lang?.slice(0, 2)
  if (lang !== LANG_CY && lang !== LANG_EN && path === '/cookies') {
    lang = LANG_EN
  }

  // Render the cookies page with the necessary data
  return h.view('cookies/index', {
    pageTitle,
    description,
    metaSiteUrl,
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
